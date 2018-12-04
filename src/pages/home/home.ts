import {
  GoogleMaps,
  GoogleMap,
  LatLng,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, PopoverController, Slides } from 'ionic-angular';
import { FilterPage } from './filter';

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
  private things = [];

  constructor(
    public navCtrl: NavController,
    private filterCtrl: PopoverController,
    private platform: Platform,
    private googleMaps: GoogleMaps
    ) {
      this.location = new LatLng(-37.814, 144.96332);
  }

  presentFilters(ev) {

    let popover = this.filterCtrl.create(FilterPage, {
    // contentEle: this.content.nativeElement,
    // textEle: this.text.nativeElement
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
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBpSKqvjZVPCqOx3PAy5U1bBh0dX1DlI2U',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyBpSKqvjZVPCqOx3PAy5U1bBh0dX1DlI2U'
    });

    let element = this.mapElement.nativeElement;
    
    this.map = GoogleMaps.create(element);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      
      let options = {
        target: this.location,
        zoom: 12
      };

      this.map.moveCamera(options);

      this.addMarker(-37.814, 144.96846);
      this.things.push('first');
      this.addMarker(-37.814, 144.96020);
      this.things.push('second');

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

}
