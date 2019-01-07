import { Component } from '@angular/core';
import { NavController, ModalController, Tabs, ItemSliding } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-your',
  templateUrl: 'your.html'
})
export class YourPage {
  Object = Object;
  imagesBaseUrl = process.env.S3_BUCKET_URL;
  private things = {};
  public userid;
  public thingscount = 'loading...';

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

  loadUserThings(userid){
    this.apiProvider.getUserThings(userid).then(res => {
      if(res['status'] === 'success'){
        this.thingscount = res['data'].length;
        res['data'].forEach(thing => {
          if (!this.things.hasOwnProperty(thing._id)) {
            this.things[thing._id] = thing;
          }
        });
      }
    });
  }

  deleteThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'deleted').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        delete this.things[thingid];
      }
    });
  }

  pauseThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'paused').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        this.things[thingid].status = 'paused';
      }
    });
  }

  playThing(thingid, slidingItem: ItemSliding){
    this.apiProvider.changeThingStatus(thingid, this.userid, 'live').then(res => {
      slidingItem.close();
      if(res['status'] === 'success'){
        this.things[thingid].status = 'live';
      }
    });
  }
  

}
