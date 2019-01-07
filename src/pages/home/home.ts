import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, Slides, ToastController, ModalController } from 'ionic-angular';
import { FilterPage } from './filter';
import { ThingPage } from '../thing/thing';
import { IntroPage } from '../intro/intro';
import { ApiProvider } from './../../providers/api/api';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

/**
 * 
 * Class for the HomePage
 * 
 */

declare const google; // google map object declaration

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Slides) slides: Slides;

  private skipintro = false;
  private map: any; // google map object
  private latitude = -37.814; // to use with device location, or start from Melbourne
  private longitude= 144.96332; // to use with device location, or start from Melbourne
  private arrayMarkers = []; // array for the markers on map
  private things = {}; // array for the thing fetched from RestAPI
  Object = Object; // export Object for the Angular HTML template
  private toastZoom; // toast message
  private toastNoThings; // toast message
  private toastLoading; // toast message
  imagesBaseUrl = process.env.S3_BUCKET_URL; // base path url for images
  isGeolocalized = false; // if geolocation is granted and fetched
  private selectedAvailability = 'all'; // for get the variable from the popover dropdown

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
   
  ionViewDidLoad() {

    // initialise the toasts
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

    // load the map
    this.loadMap();

    // open the intro
    this.openIntro();

  }

  // function to call the popover and get the value selected in it
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

  // open the intro modal, if not already opened and dismissed
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

    // initialise the map
    let mapOptions = {
      center: new google.maps.LatLng(this.latitude, this.longitude),
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

    // add the event to load the position once the map is loaded
    google.maps.event.addListenerOnce(this.map, 'tilesloaded', (event) => {
      this.loadPosition();
    });

    // add the event to load the things every time the map is idle
    google.maps.event.addListener(this.map, 'idle', (event) => {
      this.loadThings();
    });

    // add the event to delesect markers when map is clicked
    google.maps.event.addListener(this.map, "click", (event) => {
      document.getElementById("map_cards").style.visibility = 'hidden';
      for ( var i = 0; i < this.arrayMarkers.length; i++ ){
        this.arrayMarkers[i].setIcon(this.markerPinIcon('#000'));
      }
    });

  }

  // function to load the position from the device
  loadPosition(){
    this.geolocation.getCurrentPosition().then((pos) => {
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;

      // add a marker with the device position
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
      // move the map to device position
      this.map.panTo( new google.maps.LatLng(this.latitude, this.longitude) );
      this.isGeolocalized = true;
    });
  }

  // load things from the RestAPI
  loadThings(){
    
    // calculate radius from visible map
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
        // foreach element fetched, add in the arrays only if not already in it
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

  // function to add the markers on the map
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
    
    // listen marker click and execute function
    google.maps.event.addListener(marker, 'click', (event) => {
      this.markerClick(marker.id);
    });
  }

  // function to generate the marker icon from svg with passed color
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

  // when marker is clicked, go to the relative slide
  markerClick(markerid) {
    for ( var j = 0; j < this.arrayMarkers.length; j++ ){
      if ( this.arrayMarkers[j].id === markerid ){
        this.goToSlide(j);
        continue;
      }
    }
  }

  // show the slides and go to the selected marker-slide
  goToSlide(i) {
    document.getElementById("map_cards").style.visibility = 'visible';
    this.slides.slideTo(i, 300);
  }

  // when slide is changed, get the slide index and change markers color
  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    if ( typeof this.arrayMarkers[currentIndex] !== 'undefined' ){
      this.map.panTo( this.arrayMarkers[currentIndex].position ); // move map to marker pos
      for ( var i = 0; i < this.arrayMarkers.length; i++ ){
        this.arrayMarkers[i].setIcon(this.markerPinIcon('#000'));
      }
      this.arrayMarkers[currentIndex].setIcon(this.markerPinIcon('#F00'));
    }
  }

  // open the page Thing with the thing object data
  goToThing(key) {
    this.navCtrl.push(ThingPage, { 
      "thing": this.things[key],
      "userLatitude": this.latitude,
      "userLongitude": this.longitude
    });
  }

  // function to calculate distance from 2 coordinates
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

  // return the distance from device to thing for the html template
  distanceFromYou(thingLat, thingLng){
    return ~~(this.calculateDistance(thingLat, thingLng, this.latitude, this.longitude) / 1000);
  }

  // function to show/hide markers when availability is changed in the popover filters
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
