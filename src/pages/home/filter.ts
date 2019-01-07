import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  templateUrl: 'filter.html'
})
export class FilterPage {

  private availability;

  constructor(private navParams: NavParams) {
  }

  ngOnInit() {
    this.availability = this.navParams.get('selectedAvailability');
  }

  onChange() {
    this.navParams.get('availabilityChanged')(this.availability); 
  }

}
