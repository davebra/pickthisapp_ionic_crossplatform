import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, Tabs } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {

  private pictures = [];

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private camera: Camera,
    private storage: Storage,
    public alertCtrl: AlertController
    ) {
  }

  ionViewDidLoad() {
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

  onTakePicture() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      //destinationType: this.camera.DestinationType.FILE_URI,
      //sourceType: Default is CAMERA. PHOTOLIBRARY : 0, CAMERA : 1, SAVEDPHOTOALBUM : 2,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false
    }

    this.camera.getPicture(options).then((imageData) => {
      this.pictures.push('data:image/jpeg;base64,' + imageData);
      //this.pictures.push(imageData);
    }, (err) => {
        console.log(err);
      });
  }

  removePicture(index){
    this.pictures.splice(index, 1);
  }

  scrollToTakePicture(){
    if (this.pictures.length < 5) {
      document.getElementById('imgscroll').scrollLeft = document.getElementById('imgadd').offsetLeft;
    }
  }

}
