import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

/**
 * 
 * Class of Filters popover
 * 
 */

@Component({
  templateUrl: 'filter.html'
})
export class FilterPage {

  private availability;

  constructor(private navParams: NavParams) {
  }

  // get the starting avaiability from the homepage
  ngOnInit() {
    this.availability = this.navParams.get('selectedAvailability');
  }

  // send the selected availability to the homepage
  onChange() {
    this.navParams.get('availabilityChanged')(this.availability); 
  }

}
