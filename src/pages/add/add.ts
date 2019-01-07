import { Component, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Tabs, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { ApiProvider } from './../../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Md5 } from 'ts-md5/dist/md5';

declare const google;
@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPage {
  @ViewChild('selectposition') mapElement: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef;

  latitude;
  longitude;
  pictures = [];
  pictureNames = [];
  picturesUploaded = 0;
  tags = [];
  userid;
  private map;
  private loading;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private geolocation: Geolocation,
    private camera: Camera,
    private _sanitizer: DomSanitizer,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    public apiProvider: ApiProvider,
    private storage: Storage,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController
    ) {
      this.latitude = -37.814;
      this.longitude = 144.96332;
      this.loading = this.loadingCtrl.create({
        content: 'Uploading your Thing...'
      });
  }

  ionViewDidLoad() {
    this.loadMap();
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

  loadMap(){

    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
 
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          stylers: [{visibility: 'off'}]
        },
        {
          featureType: 'transit',
          stylers: [{visibility: 'off'}]
        }
      ]
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    google.maps.event.addListenerOnce(this.map, 'tilesloaded', (event) => {
      this.loadPosition();
    });

    google.maps.event.addListener(this.map, 'idle', (event) => {
      var newCenter = this.map.getCenter();
      this.latitude = newCenter.lat();
      this.longitude = newCenter.lng();
    });

  }

  loadPosition(){
    this.geolocation.getCurrentPosition().then((pos) => {
      let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      this.map.panTo( latLng );
    });
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      //destinationType: this.camera.DestinationType.NATIVE_URI,
      //sourceType: Default is CAMERA. PHOTOLIBRARY : 0, CAMERA : 1, SAVEDPHOTOALBUM : 2,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false
    }

    this.camera.getPicture(options).then((image) => {
      this.pictures.push(image);
      this.pictureNames.push( this.createFileName() + '.jpg' );
    });
  }

  getSafePicture(i){
    return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + this.pictures[i]);
  }

  private createFileName() {
    var t = new Date().getTime();
    return Md5.hashStr( t.toString +  this.userid );
  }

  removePicture(index){
    this.pictures.splice(index, 1);
    this.pictureNames.splice(index, 1);
  }

  scrollToTakePicture(){
    if (this.pictures.length < 5) {
      document.getElementById('imgscroll').scrollLeft = document.getElementById('imgadd').offsetLeft;
    }
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
        buttons: ['Add Pictures']
      });
      alert.present();
      return;
    }
    if (this.tags.length < 1) {
      const alert = this.alertCtrl.create({
        title: 'Required Tags',
        subTitle: 'You need to select at least one tag.',
        buttons: ['Add Tags']
      });
      alert.present();
      return;
    }

    this.loading.present();

    this.pictures.forEach((element, index) => {
      this.apiProvider.uploadImage(element, this.pictureNames[index] ,this.userid).then(res => {
        this.picturesUploaded++;
        this.checkUploaded();
      });
    });

    this.apiProvider.addThings(
      this.userid, 
      "pick", 
      this.latitude, 
      this.longitude, 
      this.tags,
      this.pictureNames).then(res => {
        console.log(res);
    });
  }

  checkUploaded(){
    if( this.picturesUploaded >= this.pictureNames.length){
      this.loading.dismiss();
      const alert = this.alertCtrl.create({
        title: 'Success!',
        subTitle: 'You thing has been uploaded.',
        buttons: [
          {
            text: 'Close',
            handler: () => {
              console.log('Cancel clicked');
              this.tags = [];
              this.pictureNames = [];
              this.pictures = [];
              var t: Tabs = this.navCtrl.parent;
              t.select(2);
            }
          }
        ]
      });
      alert.present();
    }
  }

  onItemAdded(e){
    this.tags.push( e.value.toLowerCase() );
  }

  onItemRemoved(e){
    var index = this.tags.indexOf( e.value.toLowerCase() );
    if (index > -1) {
      this.tags.splice(index, 1);
    }
  }

}
