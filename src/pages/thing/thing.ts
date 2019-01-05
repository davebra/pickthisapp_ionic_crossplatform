import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import {IonTagsInputModule} from "ionic-tags-input";

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams) {
      this.thing = navParams.get('thing');
  }
  
  ionViewDidLoad(){
    this.images = this.thing["images"];
    this.tags = this.thing["tags"];    
    this.availability = this.thing["availability"];    
  }

}
