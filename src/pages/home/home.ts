import {
  GoogleMaps,
  GoogleMap,
  LatLng,
  GoogleMapsEvent,
  Environment
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, PopoverController, Slides, ToastController } from 'ionic-angular';
import { FilterPage } from './filter';
import { ThingPage } from '../thing/thing';
import { ApiProvider } from './../../providers/api/api';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map_canvas') mapElement: ElementRef;
  @ViewChild('popoverContent', { read: ElementRef }) content: ElementRef;
  @ViewChild('popoverText', { read: ElementRef }) text: ElementRef;
  @ViewChild(Slides) slides: Slides;

  private map:GoogleMap;
  private location:LatLng;
  private arrayMarkers = [];
  private things = {};
  Object = Object;
  private toastZoom;
  private toastNoThings;

  constructor(
    public navCtrl: NavController,
    public filterCtrl: PopoverController,
    public googleMaps: GoogleMaps, 
    public apiProvider: ApiProvider,
    public storage: Storage,
    public toastCtrl: ToastController
    ) {
      this.location = new LatLng(-37.814, 144.96332);
      this.toastZoom = this.toastCtrl.create({
        message: 'Please zoom in to search in this area.',
        position: 'bottom',
        dismissOnPageChange: true
      });
      this.toastNoThings = this.toastCtrl.create({
        message: 'No things in this area.',
        position: 'bottom',
        dismissOnPageChange: true
      });
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
    this.loadMap();
  }

  loadMap() {

    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': process.env.GMAPS_API_KEY_FOR_BROWSER_RELEASE,
      'API_KEY_FOR_BROWSER_DEBUG': process.env.GMAPS_API_KEY_FOR_BROWSER_DEBUG
    });

    let element = this.mapElement.nativeElement;
    
    this.map =this.googleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.map.moveCamera({
        target: this.location,
        zoom: 12
      });
    });

    this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((camera) => {
      this.loadThings(
        camera[0].target.lat, 
        camera[0].target.lng, 
        this.calculateRadius(
          camera[0].northeast.lat,
          camera[0].northeast.lng,
          camera[0].southwest.lat,
          camera[0].southwest.lng
        )
      );
    });

  }

  loadThings(centreLat, centreLng, radius){
    this.apiProvider.getThings(centreLat, centreLng, radius).then(res => {
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
    });
  }

  addMarker(mLat, mLng) {
    this.map.addMarker({
      icon: 'blue',
      position: {
        lat: mLat,
        lng: mLng
      }
    })
    .then(marker => {
      this.arrayMarkers.push(marker);
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.markerClick(marker);
      });
    });
  }

  markerClick(marker) {

    document.getElementById("map_cards").style.visibility = 'visible';

    for ( var i = 0; i < this.arrayMarkers.length; i++ ){
      if( this.arrayMarkers[i].getId() == marker.getId() ){
        this.goToSlide(i);
        marker.setIcon('red');
        continue;
      }
      this.arrayMarkers[i].setIcon('blue');
    }

  }

  goToThing(key) {
    this.navCtrl.push(ThingPage, { "thing": this.things[key] });
  }

  goToSlide(i) {
    this.slides.slideTo(i, 300);
  }

  slideChanged() {
    let currentIndex = this.slides.getActiveIndex();
    for ( var i = 0; i < this.arrayMarkers.length; i++ ){
      this.arrayMarkers[i].setIcon('blue');
    }
    this.arrayMarkers[currentIndex].setIcon('red');
    this.map.setCameraTarget( this.arrayMarkers[currentIndex].getPosition() );
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
