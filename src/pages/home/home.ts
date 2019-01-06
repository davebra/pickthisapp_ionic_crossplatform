import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, Slides, ToastController } from 'ionic-angular';
import { FilterPage } from './filter';
import { ThingPage } from '../thing/thing';
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
  @ViewChild('popoverContent', { read: ElementRef }) content: ElementRef;
  @ViewChild('popoverText', { read: ElementRef }) text: ElementRef;
  @ViewChild(Slides) slides: Slides;

  private map: any;
  private latitude = -37.814;
  private longitude= 144.96332;
  private arrayMarkers = [];
  private things = {};
  Object = Object;
  private toastZoom;
  private toastNoThings;
  private toastLoading;

  constructor(
    public navCtrl: NavController,
    public filterCtrl: PopoverController,
    public apiProvider: ApiProvider,
    public storage: Storage,
    private geolocation: Geolocation,
    public toastCtrl: ToastController
    ) {
    }

  presentFilters(ev) {
    let popover = this.filterCtrl.create(FilterPage, {
    //contentEle: this.content.nativeElement,
    //textEle: this.text.nativeElement
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

  loadMap(){

    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
 
    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    google.maps.event.addListenerOnce(this.map, 'tilesloaded', (event) => {
      this.loadPosition();
    });

  }

  loadPosition(){
    this.geolocation.getCurrentPosition().then((pos) => {
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;
      let latLng = new google.maps.LatLng(this.latitude, this.longitude);
      this.map.panTo( latLng );
      this.loadThings();
    }).catch((err) => { 
      this.loadThings();
    });
  }

  loadThings(){

    var ne = this.map.getBounds().getNorthEast();
    var sw = this.map.getBounds().getSouthWest();
    var radius = this.calculateRadius(ne.lat(), ne.lng(), sw.lat(), sw.lng());

    this.apiProvider.getThings(this.latitude, this.longitude, radius).then(res => {
      this.toastLoading.dismiss();

      if(res['status'] === 'success'){
        this.toastZoom.dismiss();
        if ( res['data'].length > 0 ){
          this.toastNoThings.dismiss();
        } else {
          this.toastNoThings.present();
        }
        res['data'].forEach(thing => {
          if (!this.things.hasOwnProperty(thing._id)) {
            this.things[thing._id] = thing;
            this.addMarker(thing.location.coordinates[1], thing.location.coordinates[0]);
          }
        });
      } else {
        this.toastZoom.present();
      }

      google.maps.event.addListener(this.map, 'idle', (event) => {
        this.loadThings();
      });

    }).catch(err => { console.log(err) } );
  }

  addMarker(mLat, mLng) {

    let marker = new google.maps.Marker({
      position: {
        lat: mLat,
        lng: mLng
      },
      map: this.map,
      icon: {
        path: "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z",
        fillColor: '#000',
        fillOpacity: 1,
        anchor: new google.maps.Point(192,530),
        strokeWeight: 0,
        scale: .0625
      }
    });

    this.arrayMarkers.push(marker);

    google.maps.event.addListener(marker, 'click', (event) => {
      this.markerClick(marker);
    });

  }

  markerClick(marker) {
    for ( var i = 0; i < this.arrayMarkers.length; i++ ){
      if( this.arrayMarkers[i].id === marker.id ){
        this.goToSlide(i);
        marker.icon.fillColor = '#FF0000';
        continue;
      }
      marker.icon.fillColor = '#000';
    }
  }


  goToSlide(i) {
    document.getElementById("map_cards").style.visibility = 'visible';
    this.slides.slideTo(i, 300);
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    for ( var i = 0; i < this.arrayMarkers.length; i++ ){
      this.arrayMarkers[i].icon.fillColor = '#000';
    }
    this.arrayMarkers[currentIndex].icon.fillColor = '#FF0000';
    this.map.panTo( this.arrayMarkers[currentIndex].position );
  }

  goToThing(key) {
    this.navCtrl.push(ThingPage, { 
      "thing": this.things[key],
      "userLatitude": this.latitude,
      "userLongitude": this.longitude
    });
  }

  calculateRadius(lat1, lon1, lat2, lon2) {
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

}
