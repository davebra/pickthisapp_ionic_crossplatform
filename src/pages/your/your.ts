import { Component } from '@angular/core';
import { NavController, ModalController, Tabs } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-your',
  templateUrl: 'your.html'
})
export class YourPage {


  constructor(
    public navCtrl: NavController,
    public storage: Storage,
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
      }
    });
    
  }

}
