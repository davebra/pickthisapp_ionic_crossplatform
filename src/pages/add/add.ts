import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {

  private pictures: string[];

  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    public alertCtrl: AlertController,
    private DomSanitizer: DomSanitizer
    ) {
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 50,
      //destinationType: this.camera.DestinationType.DATA_URL,
      destinationType: this.camera.DestinationType.FILE_URI,
      //sourceType: Default is CAMERA. PHOTOLIBRARY : 0, CAMERA : 1, SAVEDPHOTOALBUM : 2,
      allowEdit: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      cameraDirection: 0
    }

    this.camera.getPicture(options).then((imageData) => {
      //this.pictures.push('data:image/jpeg;base64,' + imageData);
      this.pictures.push(imageData);
    }, (err) => {
        console.log(err);
      });
  }

}
