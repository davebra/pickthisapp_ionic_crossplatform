import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public viewCtrl: ViewController, 
        public alertCtrl: AlertController,
        private fb: Facebook,
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
        console.log(res);

        window.localStorage.provider = provider;

        switch(provider){
            case 'google':
            window.localStorage.userid = res.email;
            window.localStorage.providerid = res.userId;
            window.localStorage.useremail = res.email;
            window.localStorage.userfullname = res.displayName;
            this.viewCtrl.dismiss(window.localStorage.userid);
            break;

            case 'facebook':
            // The connection was successful
            if(res.status == "connected") {

                // Get user infos from the API
                this.fb.api("/me?fields=name,email", []).then((user) => {

                    window.localStorage.userid = (user.email) ? user.email : res.authResponse.userID;
                    window.localStorage.providerid = res.authResponse.userID;
                    window.localStorage.useremail = user.email;
                    window.localStorage.userfullname = user.name;    
                    this.viewCtrl.dismiss(window.localStorage.userid);

                });
            } 
            // An error occurred while loging-in
            else {
                this.loginError('facebook', "An error occurred...")
            }
            break;

            case 'test':
            window.localStorage.userid = '1e6a8e52-bdca-57eb-accb-d02ee2c18a42';
            window.localStorage.providerid = 'test';
            window.localStorage.useremail = 'test@test.com';
            window.localStorage.userfullname = 'Test User';
            this.viewCtrl.dismiss(window.localStorage.userid);
            break;
        }

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

        window.localStorage.removeItem("userid");
        window.localStorage.removeItem("provider");
        window.localStorage.removeItem("providerid");
        window.localStorage.removeItem("useremail");
        window.localStorage.removeItem("userfullname");

        this.viewCtrl.dismiss(false);

    }

    dismiss() {
        this.viewCtrl.dismiss(false);
    }

}
