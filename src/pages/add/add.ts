import { Component, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ModalController, AlertController, Tabs, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { ApiProvider } from './../../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { uuidv3 } from 'uuid/v3';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPage {
  @ViewChild('selectposition') mapElement: ElementRef;

  private latitude;
  private longitude;
  private pictures = [];
  private tags = [];
  private userid;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private geolocation: Geolocation,
    private camera: Camera,
    private transfer: Transfer, 
    private file: File, 
    private filePath: FilePath,
    public http: HttpClient,
    public apiProvider: ApiProvider,
    private storage: Storage,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController
    ) {
      this.latitude = -37.814;
      this.longitude = 144.96332;
  }

  ionViewDidLoad() {
    this.loadMap();
    this.geolocation.getCurrentPosition().then((resp) => {
          
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      // this.map.moveCamera({
      //   target: new LatLng( this.latitude, this.longitude),
      //   zoom: 14
      // });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
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
      }
    });
    
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 50,
      //destinationType: this.camera.DestinationType.DATA_URL,
      destinationType: this.camera.DestinationType.NATIVE_URI,
      //sourceType: Default is CAMERA. PHOTOLIBRARY : 0, CAMERA : 1, SAVEDPHOTOALBUM : 2,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imagePath) => {
      //this.pictures.push('data:image/jpeg;base64,' + imageData);
      //this.pictures.push(imageData);
      console.log(imagePath);

      var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
      var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);

      //this.file.readAsDataURL(correctPath, currentName).then(res => console.log(res)  );

      this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }, (err) => {
      console.log(err);
    });
  }

  private createFileName() {
    var t = new Date().getTime();
    return t + '.jpg';
  }
   
  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.pictures.push(newFileName);
    }, error => {
      console.log(error);
    }).catch(err => console.log(err) );
  }

  public uploadImage(image) {
    // Destination URL
    var url = process.env.RESTAPI_URL + "/upload";
   
    // File for Upload
    var targetPath = this.pathForImage(image);
   
    var options = {
      fileKey: "file",
      fileName: image,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params : { 'file': image, 'user': this.userid, 'imagename': image }
    };
   
    const fileTransfer: TransferObject = this.transfer.create();
   
    // Use the FileTransfer to upload the image
    fileTransfer.upload(targetPath, url, options).then(data => {
      // 'Image succesful uploaded.'
      console.log(data);
    }, err => {
      // 'Error while uploading file.'
      console.log(err);
    });
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return this.file.dataDirectory + img;
    }
  }

  removePicture(index){
    this.pictures.splice(index, 1);
  }

  scrollToTakePicture(){
    if (this.pictures.length < 5) {
      document.getElementById('imgscroll').scrollLeft = document.getElementById('imgadd').offsetLeft;
    }
  }

  loadMap() {

    let element = this.mapElement.nativeElement;
    
    // this.map =this.googleMaps.create(element);

    // this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe((camera) => {
    //   this.latitude = camera[0].target.lat;
    //   this.longitude = camera[0].target.lng;
    // });

  }

  public requestAutocompleteTags = (text: string): Observable<Response> => {
    const url = `${process.env.RESTAPI_URL}/tags?tag=${text}`;
    return this.http
      .get( url )
      .pipe( map( res => res['data'].map(tag => tag.name) ) );
  };

  submitThisThing(){
    if (this.pictures.length < 1) {
      const alert = this.alertCtrl.create({
        title: 'Required Pictures',
        subTitle: 'You need to upload at least one picture.',
        buttons: ['ADD PICTURES']
      });
      alert.present();
      return;
    }
    if (this.tags.length < 1) {
      const alert = this.alertCtrl.create({
        title: 'Required Tags',
        subTitle: 'You need to select at least one tag.',
        buttons: ['ADD TAGS']
      });
      alert.present();
      return;
    }

    this.pictures.forEach(img => {
      this.uploadImage(img);
    });

    this.apiProvider.addThings(
      this.userid, 
      "pick", 
      this.latitude, 
      this.longitude, 
      this.tags,
      this.pictures).then(res => {
        if(res['status'] === 'success'){
          console.log(res);
        } else {
            console.log(res);
        }
    });

  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}
