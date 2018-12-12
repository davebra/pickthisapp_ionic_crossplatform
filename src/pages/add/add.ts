import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {

  private pictures = [];
  private userid;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private camera: Camera,
    public alertCtrl: AlertController,
    private DomSanitizer: DomSanitizer,
    private storage: Storage
    ) {
  }

  ionViewDidLoad() {
    this.checkLogin();
  }

  checkLogin(){
    this.storage.get('userid')
    .then(val => { 
      this.userid = val;
    })
    .catch(err => this.openLogin() );
  }

  openLogin(){
    
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
