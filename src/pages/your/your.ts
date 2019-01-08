import { Component } from '@angular/core';
import { NavController, ModalController, Tabs, ItemSliding } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

/**
 * 
 * Class for the YourPage
 * 
 */

@Component({
  selector: 'page-your',
  templateUrl: 'your.html'
})
export class YourPage {
  Object = Object; // pass Object for angular template
  imagesBaseUrl = process.env.S3_BUCKET_URL; // image base path from S3
  private things = {}; // array for things
  public userid; // user id
  public thingscount = 'loading...'; // things count for template

  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public apiProvider: ApiProvider,
    public modalCtrl: ModalController,
    ) {

  }

  ionViewWillEnter(){
    this.checkLogin();
  }

  // check the login, obviously, you need to be logged in to fetch your posted things
  checkLogin(){
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
        this.loadUserThings(val);
      }
    });
  }

  // get the user things from the RestAPI
  loadUserThings(userid){
    this.apiProvider.getUserThings(userid).then(res => {
      if(res['status'] === 'success'){
        this.thingscount = res['data'].length;
        res['data'].forEach(thing => {
          if (!this.things.hasOwnProperty(thing._id)) {
            this.things[thing._id] = thing;
          }
        });
      } else {
        console.log(res);
      }
    });
  }

  // delete is clicked, update the status on the RestAPI
  deleteThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'deleted').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        delete this.things[thingid];
      }
    });
  }

  // pause is clicked, update the status on the RestAPI
  pauseThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'paused').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        this.things[thingid].status = 'paused';
      }
    });
  }

  // play is clicked, update the status on the RestAPI
  playThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'live').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        this.things[thingid].status = 'live';
      }
    });
  }

  // logout is clicked, empty storage and back to home
  logout(){
    this.storage.clear();
    this.things = {};
    this.thingscount = 'loading...';
    var t: Tabs = this.navCtrl.parent;
    t.select(0);
  }
  

}
