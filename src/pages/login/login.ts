import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public viewCtrl: ViewController, 
        public alertCtrl: AlertController,
        private storage: Storage,
        private fb: Facebook,
        public http: Http,
        private googlePlus: GooglePlus) {
    }

    facebookLogin(){
        this.fb.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => this.loginSuccess('facebook', res))
        .catch(e => this.loginError('facebook', e));
    }

    googleLogin(){
        this.googlePlus.login({
            'webClientId': '879252245494-1fesbuajkhkr8690j99i3ekmu9bspc70.apps.googleusercontent.com',
            'offline': true
          })
        .then(res => this.loginSuccess('google', res))
        .catch(err => this.loginError('google', err));
    }

    testLogin(){
        this.loginSuccess('test', 'test');
    }

    loginSuccess(provider, res){

        switch(provider){
            case 'google':
            this.authRestApi(
                provider,
                res.userId,
                res.email,
                res.displayName
            );
            break;

            case 'facebook':
            // The connection was successful
            if(res.status == "connected") {

                // Get user infos from the API
                this.fb.api("/me?fields=name,email", []).then((user) => {
                    this.authRestApi(
                        provider,
                        res.authResponse.userID,
                        res.email,
                        res.name
                    );
                });
            } 
            // An error occurred while loging-in
            else {
                this.loginError('facebook', "An error occurred...")
            }
            break;

            case 'test':
            this.authRestApi(
                provider,
                'testid1',
                'tes1t@test1.test',
                'Test1 User'
            );
            break;
        }

    }

    authRestApi( provider, providerid, useremail, userfullname ){

        this.storage.set('provier', provider);
        this.storage.set('providerid', providerid);
        this.storage.set('useremail', useremail);
        this.storage.set('userfullname', userfullname);  

        var headers = new Headers();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json' );
        const requestOptions = new RequestOptions({ headers: headers });

        let postData = {
                "provider": provider,
                "providerid": providerid,
                "email": useremail,
                "fullname": userfullname
        }

        this.http.post( process.env.RESTAPI_URL + "/user", postData, requestOptions)
        .subscribe(data => {
            console.log(data);
            this.storage.set('userid', JSON.parse(data['_body']).data);  
            this.viewCtrl.dismiss(true);
        }, error => {
            console.log(error);
        });

    }

    loginError(provider, err){
        console.log(err);
        const alert = this.alertCtrl.create({
            title: 'Login Error',
            subTitle: 'Your signup or login with ' + provider + ' attempt has been unsucessfull.',
            buttons: ['TRY AGAIN']
          });
        alert.present();
    }

    logout(){

        switch(window.localStorage.provider){
            case 'google':
            this.googlePlus.logout();

            break;
            case 'facebook':
            this.fb.logout();
            
            break;
            case 'test':
            break;
        }

        this.storage.clear();
        this.viewCtrl.dismiss(false);

    }

    dismiss() {
        this.viewCtrl.dismiss(false);
    }

}
