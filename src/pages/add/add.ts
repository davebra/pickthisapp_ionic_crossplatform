import { Component, ChangeDetectorRef, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Tabs, ToastController, ActionSheetController } from 'ionic-angular';
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

/**
 * 
 * Class for the AddPage
 * 
 */

declare const google; // google object delaration

@Component({
  selector: 'page-add',
  templateUrl: 'add.html',
  changeDetection: ChangeDetectionStrategy.OnPush // necessary for the tag component
})
export class AddPage {
  @ViewChild('selectposition') mapElement: ElementRef;
  @ViewChild('tagInput') tagInput: ElementRef;

  private latitude; // device location
  private longitude; // device location
  private pictures = []; // pictures DATA_URL array
  private pictureNames = []; // picture names array
  private picturesUploaded = 0; // how many pictures have been uploaded
  private tags = []; // tags array
  private userid; // user id
  private map; // google map object
  private loading; // loading variable (true/false)

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private geolocation: Geolocation,
    private camera: Camera,
    private _sanitizer: DomSanitizer,
    private chRef: ChangeDetectorRef,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    public actionCtrl: ActionSheetController,
    public apiProvider: ApiProvider,
    private storage: Storage,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController
    ) {
      this.pictures = [];
      this.pictureNames = [];
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

  // check if a userid is present in the storage, if not open the login modal
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

    // initialise the map 
    let mapOptions = {
      center: new google.maps.LatLng(this.latitude, this.longitude),
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

    // onche the map is loaded, load position
    google.maps.event.addListenerOnce(this.map, 'tilesloaded', (event) => {
      this.loadPosition();
    });

    // every time the map is moved, get the the new centre
    google.maps.event.addListener(this.map, 'idle', (event) => {
      var newCenter = this.map.getCenter();
      this.latitude = newCenter.lat();
      this.longitude = newCenter.lng();
    });

  }

  // load the device position and centre the map on it
  loadPosition(){
    this.geolocation.getCurrentPosition().then((pos) => {
      this.map.panTo( new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude) );
    });
  }

  // actionsheet for select if user want to open the camera or the gallery
  takePictureOrGallery() {
    let actionSheet = this.actionCtrl.create({
      title: 'Select Action',
      buttons: [
        {
          text: 'Take Picture',
          handler: () => {
            this.onTakePicture();
          }
        },
        {
          text: 'Select from Gallery',
          handler: () => {
            this.onSelectPicture();            
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

  // function to execute for open camera
  onTakePicture() {
    const options: CameraOptions = {
      quality: 10,
      targetWidth: 400,
      targetHeight: 400,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: false
    }

    // once picture is captured, save in the array and generate a unique random name
    this.camera.getPicture(options).then((image) => {
      this.pictureAdded(image);
    });
  }

  // function to execute for select picture from album
  onSelectPicture() {
    const options: CameraOptions = {
      quality: 10,
      targetWidth: 400,
      targetHeight: 400,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }

    // once picture is captured, save in the array and generate a unique random name
    this.camera.getPicture(options).then((image) => {
      this.pictureAdded(image);
    });
  }

  // add picture in the array, generate unique name
  pictureAdded(image){
    this.pictures.push(image);
    this.chRef.detectChanges(); // force angular to get the changes
    this.pictureNames.push( this.createFileName() + '.jpg' );
    if (this.pictureNames.length < 5) {
      document.getElementById('imgscroll').scrollLeft = document.getElementById('imgadd').offsetLeft;
    }
  }

  // generate a unique pictures name using MD5 of timestamp + userid
  private createFileName() {
    var t = new Date().getTime();
    return Md5.hashStr( t.toString +  this.userid );
  }

  // function to remove a picture
  removePicture(index){
    this.pictures.splice(index, 1);
    this.pictureNames.splice(index, 1);
  }

  // function for the tag autocomplete, get from the RestAPI
  public requestAutocompleteTags = (text: string): Observable<Response> => {
    const url = `${process.env.RESTAPI_URL}/tags?tag=${text}`;
    return this.http
      .get( url )
      .pipe( map( res => res['data'].map(tag => tag.name) ) );
  };

  // function to execute the submit
  submitThisThing(){
    // at least 1 picture must be present
    if (this.pictures.length < 1) {
      const alert = this.alertCtrl.create({
        title: 'Required Pictures',
        subTitle: 'You need to upload at least one picture.',
        buttons: ['Add Pictures']
      });
      alert.present();
      return;
    }
    // at least 1 tag must be present
    if (this.tags.length < 1) {
      const alert = this.alertCtrl.create({
        title: 'Required Tags',
        subTitle: 'You need to select at least one tag.',
        buttons: ['Add Tags']
      });
      alert.present();
      return;
    }

    // show loading alert
    this.loading.present();

    // upload each picture
    this.pictures.forEach((element, index) => {
      this.apiProvider.uploadImage(element, this.pictureNames[index] ,this.userid).then(res => {
        this.picturesUploaded++;
        this.checkUploaded();
      });
    });

    // upload the thing object
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

  // check if all the pictures have been uploaded, if so hide the loading alert, empty the page and go to YourPage
  checkUploaded(){
    if( this.picturesUploaded >= this.pictureNames.length){
      this.loading.dismiss().catch(()=>{})
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

  // tag component seems doesn't take the model with the tags array in here, so add/remove tag executing the functions here
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
