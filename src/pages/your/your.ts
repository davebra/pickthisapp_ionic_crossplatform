import { Component } from '@angular/core';
import { NavController, ModalController, Tabs } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'page-your',
  templateUrl: 'your.html'
})
export class YourPage {
  Object = Object;
  public things = [];
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
        this.loadUserThings(val);
      }
    });
    
  }

  loadUserThings(userid){
    this.apiProvider.getUserThings(userid).then(res => {
      if(res['status'] === 'success'){
        this.thingscount = res['data'].length;
        this.things = res['data'];
      }
    });
  }

}
