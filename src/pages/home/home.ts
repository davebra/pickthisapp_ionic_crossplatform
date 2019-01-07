import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, Slides, ToastController, ModalController } from 'ionic-angular';
import { FilterPage } from './filter';
import { ThingPage } from '../thing/thing';
import { IntroPage } from '../intro/intro';
import { ApiProvider } from './../../providers/api/api';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

declare const google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Slides) slides: Slides;

  private skipintro = false;
  private map: any;
  private latitude = -37.814;
  private longitude= 144.96332;
  private arrayMarkers = [];
  private things = {};
  Object = Object;
  private toastZoom;
  private toastNoThings;
  private toastLoading;
  imagesBaseUrl = process.env.S3_BUCKET_URL;
  isGeolocalized = false;
  private selectedAvailability = 'all';

  constructor(
    public navCtrl: NavController,
    public filterCtrl: PopoverController,
    public apiProvider: ApiProvider,
    public storage: Storage,
    public modalCtrl: ModalController,
    private geolocation: Geolocation,
    public toastCtrl: ToastController
    ) {
    }

  presentFilters(ev) {
    let popover = this.filterCtrl.create(FilterPage, {
      selectedAvailability: this.selectedAvailability,
      availabilityChanged: (av) => {
        this.availabilityChange(av);
        this.selectedAvailability = av;
      }
    });
    popover.present({
      ev: ev
    });
  }
   
  ionViewDidLoad() {

    this.toastZoom = this.toastCtrl.create({
      message: 'Please zoom in to search in this area.',
      position: 'top',
      dismissOnPageChange: true
    });

    this.toastNoThings = this.toastCtrl.create({
      message: 'No things in this area.',
      position: 'top',
      dismissOnPageChange: true
    });

    this.toastLoading = this.toastCtrl.create({
      message: 'Loading...',
      position: 'top',
      dismissOnPageChange: true
    });
    this.toastLoading.present();

    this.loadMap();

  }

  ionViewWillEnter(){
    this.openIntro();
  }

  openIntro(){
    if (this.skipintro) return;
    this.storage.get("intro").then((val) => {
      if( val !== 'skip' ){
        let introModal = this.modalCtrl.create(IntroPage);
        introModal.present();
      } else {
        this.skipintro = true;
      }
    });
  }

  loadMap(){

    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
 
    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          stylers: [{visibility: 'off'}]
        },
        {
          featureType: 'transit',
          stylers: [{visibility: 'off'}]
        }
      ]
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    google.maps.event.addListenerOnce(this.map, 'tilesloaded', (event) => {
      this.loadPosition();
    });

    google.maps.event.addListener(this.map, 'idle', (event) => {
      this.loadThings();
    });

    google.maps.event.addListener(this.map, "click", (event) => {
      document.getElementById("map_cards").style.visibility = 'hidden';
      for ( var i = 0; i < this.arrayMarkers.length; i++ ){
        this.arrayMarkers[i].setIcon(this.markerPinIcon('#000'));
      }
    });

  }

  loadPosition(){
    this.geolocation.getCurrentPosition().then((pos) => {
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;
      let posMarker = new google.maps.Marker({
        position: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        },
        map: this.map,
        draggable: false,
        icon: {
          path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
          fillColor: '#4689F2',
          fillOpacity: 1,
          draggable: false,
          anchor: new google.maps.Point(0,0),
          strokeWeight: 1,
          strokeColor: '#FFF',
          scale: .4
        }
      });
      let latLng = new google.maps.LatLng(this.latitude, this.longitude);
      this.map.panTo( latLng );
      this.isGeolocalized = true;
    });
  }

  loadThings(){

    var ne = this.map.getBounds().getNorthEast();
    var sw = this.map.getBounds().getSouthWest();
    var radius = this.calculateDistance(ne.lat(), ne.lng(), sw.lat(), sw.lng());

    this.apiProvider.getThings(this.latitude, this.longitude, radius).then(res => {
      this.toastLoading.dismiss().catch();

      if(res['status'] === 'success'){
        this.toastZoom.dismiss().catch();
        if ( res['data'].length > 0 ){
          this.toastNoThings.dismiss().catch();
        } else {
          this.toastNoThings.present();
        }
        res['data'].forEach(thing => {
          if (!this.things.hasOwnProperty(thing._id)) {
            this.things[thing._id] = thing;
            this.addMarker(thing.location.coordinates[1], thing.location.coordinates[0], thing._id);
          }
        });
      } else {
        this.toastZoom.present();
      }

    }).catch(err => { console.log(err) } );
  }

  addMarker(mLat, mLng, mId) {
    let marker = new google.maps.Marker({
      id: mId,
      position: {
        lat: mLat,
        lng: mLng
      },
      map: this.map,
      draggable: false,
      icon: this.markerPinIcon('#000')
    });
    this.arrayMarkers.push(marker);
    
    google.maps.event.addListener(marker, 'click', (event) => {
      this.markerClick(marker.id);
    });

  }

  markerPinIcon(color) {
    return {
      path: "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z",
      fillColor: color,
      fillOpacity: 1,
      anchor: new google.maps.Point(192,530),
      strokeColor: '#FFF',
      strokeWeight: 1,
      scale: .0625
    };
  }

  markerClick(markerid) {
    for ( var j = 0; j < this.arrayMarkers.length; j++ ){
      if ( this.arrayMarkers[j].id === markerid ){
        this.goToSlide(j);
        continue;
      }
    }
  }

  goToSlide(i) {
    document.getElementById("map_cards").style.visibility = 'visible';
    this.slides.slideTo(i, 300);
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    if ( typeof this.arrayMarkers[currentIndex] !== 'undefined' ){
      this.map.panTo( this.arrayMarkers[currentIndex].position );
      for ( var i = 0; i < this.arrayMarkers.length; i++ ){
        this.arrayMarkers[i].setIcon(this.markerPinIcon('#000'));
      }
      this.arrayMarkers[currentIndex].setIcon(this.markerPinIcon('#F00'));
    }
  }

  goToThing(key) {
    this.navCtrl.push(ThingPage, { 
      "thing": this.things[key],
      "userLatitude": this.latitude,
      "userLongitude": this.longitude
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515 * 1609.344;
      return dist;
    }
  }

  distanceFromYou(thingLat, thingLng){
    return ~~(this.calculateDistance(thingLat, thingLng, this.latitude, this.longitude) / 1000);
  }

  availabilityChange(availability) {
    document.getElementById("map_cards").style.visibility = 'hidden';
    if( availability === 'full' ){
      for ( var i = 0; i < this.arrayMarkers.length; i++ ){
        this.arrayMarkers[i].setVisible(true);
      }
    } else  {
      for ( var j = 0; j < this.arrayMarkers.length; j++ ){
        if ( this.things[this.arrayMarkers[j].id].availability === availability ){
          this.arrayMarkers[j].setVisible(true);
        }  else {
          this.arrayMarkers[j].setVisible(false);
        }
      }
    }
  }

}
