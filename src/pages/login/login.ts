import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { ApiProvider } from './../../providers/api/api';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';

/**
 * 
 * Class for the LoginPage
 * 
 */

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public viewCtrl: ViewController, 
        public alertCtrl: AlertController,
        private storage: Storage,
        private fb: Facebook,
        public apiProvider: ApiProvider,
        private googlePlus: GooglePlus) {
    }

    // facebook login is clicked, execute the Native facebook login
    facebookLogin(){
        this.fb.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => this.loginSuccess('facebook', res))
        .catch(e => this.loginError('facebook', e));
    }

    // google login is clicked, execute the Native google login
    googleLogin(){
        this.googlePlus.login({
            'webClientId': '879252245494-1fesbuajkhkr8690j99i3ekmu9bspc70.apps.googleusercontent.com',
            'offline': true
          })
        .then(res => this.loginSuccess('google', res))
        .catch(err => this.loginError('google', err));
    }

    // test login is clicked
    // only for development
    testLogin(){
        this.loginSuccess('test', 'test');
    }

    // Login success, based on the provider clicked create the request for the RestAPI
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

    // get the userid from the RestAPI
    authRestApi( provider, providerid, useremail, userfullname ){

        this.storage.set('provier', provider);
        this.storage.set('providerid', providerid);
        this.storage.set('useremail', useremail);
        this.storage.set('userfullname', userfullname);  

        this.apiProvider.loginUser(provider, providerid, useremail, userfullname).then(res => {
            if(res['status'] === 'success'){
                this.storage.set('userid', res['data']);  
                this.viewCtrl.dismiss(true);
            } else {
                console.log(res);
            }
        });

    }

    // if any errors during login, show alert
    loginError(provider, err){
        console.log(err);
        const alert = this.alertCtrl.create({
            title: 'Login Error',
            subTitle: 'Your signup or login with ' + provider + ' attempt has been unsucessfull.',
            buttons: ['TRY AGAIN']
          });
        alert.present();
    }

    // dismiss modal is clicked, back to the previous page with false
    dismiss() {
        this.viewCtrl.dismiss(false);
    }

}
