import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

@Component({
  selector: 'page-thing',
  templateUrl: 'thing.html'
})
export class ThingPage {
  @ViewChild(Slides) slides: Slides;

  private thing = {};
  private images = [];
  private tags = [];
  private availability = [];
  private latitude;
  private longitude;

  constructor(
    public navCtrl: NavController,
    private launchNavigator: LaunchNavigator,
    public navParams: NavParams) {
      this.thing = navParams.get('thing');
      this.latitude = navParams.get('userLatitude');
      this.longitude = navParams.get('userLongitude');
  }
  
  ionViewDidLoad(){
    this.images = this.thing["images"];
    this.tags = this.thing["tags"];    
    this.availability = this.thing["availability"];    
  }

  openTheNavigator(){
    let options: LaunchNavigatorOptions = {
      start: [this.latitude, this.longitude],
      startName: 'Your Location',
      destinationName: 'Pick This Thing Up'
    };

    this.launchNavigator.navigate([this.thing['location'].coordinates[0], this.thing['location'].coordinates[1]], options).then(
      success => console.log('Launched navigator'),
      error => console.log('Error launching navigator', error)
    );
  }

}
