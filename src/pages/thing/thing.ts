import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, NavParams, Slides, AlertController, Tabs, ActionSheetController } from 'ionic-angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { ApiProvider } from './../../providers/api/api';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';

/**
 * 
 * Class for the ThingPage
 * 
 */

@Component({
  selector: 'page-thing',
  templateUrl: 'thing.html'
})
export class ThingPage {
  @ViewChild(Slides) slides: Slides;

  private thing = {}; // object from the home page
  private images = []; // images for the angular template
  private tags = []; // tags for the angular template
  private availability; // availability for the angular template
  private latitude; // device position 
  private longitude; // device position 
  private userid; // user id
  imagesBaseUrl = process.env.S3_BUCKET_URL; // base url for the images

  constructor(
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    private launchNavigator: LaunchNavigator,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private apiProvider: ApiProvider,
    private storage: Storage,
    public navParams: NavParams) {
      // get the data from the homepage
      this.thing = navParams.get('thing');
      this.latitude = navParams.get('userLatitude');
      this.longitude = navParams.get('userLongitude');
  }
  
  ionViewDidLoad(){
    // set the data for the template
    this.images = this.thing["images"];
    this.tags = this.thing["tags"];
    switch(this.thing["availability"]){
      case 'full':
      this.availability = 'Everything\'s here';    
      break;
      case 'medium':
      this.availability = 'Most is still here';    
      break;
      case 'low':
      this.availability = 'Something left';    
      break;
      case 'empty':
      this.availability = 'Everything\'s gone';    
      break;
    }   
  }

  // open the navigator app ( GoogleMaps, AppleMaps, etc )
  // doesn't work with the browser
  openTheNavigator(){
    let options: LaunchNavigatorOptions = {
      start: [this.latitude, this.longitude],
      startName: 'Your Location',
      destinationName: 'Pick This Thing Up'
    };

    this.launchNavigator.navigate([this.thing['location'].coordinates[1], this.thing['location'].coordinates[0]], options).then(
      success => console.log('Launched navigator', success),
      error => console.log('Error launching navigator', error)
    );
  }

  // if Report inappropriate is clicked, check Login befor show the actionSheet
  reportInappropriateCheckLogin(){
    this.storage.get("userid").then((val) => {
      if(typeof val !== "string"){
        let profileModal = this.modalCtrl.create(LoginPage);
        profileModal.onDidDismiss((data:any) => {
          if(!data){
            var t: Tabs = this.navCtrl.parent;
            t.select(0);
          }
        });
        profileModal.present();
      } else {
        this.userid = val;
        this.reportInappropriate();
      }
    }); 
  }

  // report inappropriate actionsheet
  // based on button clicked, send the edit of the status to the RestAPI
  reportInappropriate() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Report this Thing',
      buttons: [
        {
          text: 'Spam',
          role: 'destructive',
          handler: () => {
            this.apiProvider.changeThingStatus(this.thing['_id'], this.userid, 'spam').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'This thing has been reported as spam.',
                buttons: ['Close']
              });
              alert.present();
            });
          }
        },
        {
          text: 'Inappropriate',
          role: 'destructive',
          handler: () => {
            this.apiProvider.changeThingStatus(this.thing['_id'], this.userid, 'inappropriate').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'This thing has been reported as inappropriate.',
                buttons: ['Close']
              });
              alert.present();
            });
          }
        },
        {
          text: 'Duplicate',
          handler: () => {
            this.apiProvider.changeThingStatus(this.thing['_id'], this.userid, 'duplicate').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'This thing has been reported as duplicate.',
                buttons: ['Close']
              });
              alert.present();
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

  // if Update Availability is clicked, check Login befor show the actionSheet
  updateAvailabilityCheckLogin(){
    this.storage.get("userid").then((val) => {
      if(typeof val !== "string"){
        let profileModal = this.modalCtrl.create(LoginPage);
        profileModal.onDidDismiss((data:any) => {
          if(!data){
            var t: Tabs = this.navCtrl.parent;
            t.select(0);
          }
        });
        profileModal.present();
      } else {
        this.userid = val;
        this.updateAvailability();
      }
    }); 
  }

  // report inappropriate actionsheet
  // based on button clicked, send the edit of the status to the RestAPI
  updateAvailability() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Update thing\'s availability',
      buttons: [
        {
          text: 'Everything\'s there',
          handler: () => {
            this.apiProvider.changeThingAvailability(this.thing['_id'], this.userid, 'full').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'Availability updated!.',
                buttons: ['Close']
              });
              alert.present();
              this.availability = 'Everything\'s there';
            });
          }
        },
        {
          text: 'Most things stills there',
          handler: () => {
            this.apiProvider.changeThingAvailability(this.thing['_id'], this.userid, 'medium').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'Availability updated!.',
                buttons: ['Close']
              });
              alert.present();
              this.availability = 'Most things stills there';
            });
          }
        },
        {
          text: 'Something\'s left',
          handler: () => {
            this.apiProvider.changeThingAvailability(this.thing['_id'], this.userid, 'low').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'Availability updated!.',
                buttons: ['Close']
              });
              alert.present();
              this.availability = 'Something\'s left';
            });
          }
        },
        {
          text: 'Everything\'s gone',
          handler: () => {
            this.apiProvider.changeThingAvailability(this.thing['_id'], this.userid, 'empty').then(res => {
              const alert = this.alertCtrl.create({
                title: 'Success',
                subTitle: 'Availability updated!.',
                buttons: ['Close']
              });
              alert.present();
              this.availability = 'Everything\'s gone';
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

}
