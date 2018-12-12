import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

    constructor(public navCtrl: NavController, 
        public alertCtrl: AlertController,
        private fb: Facebook,
        private googlePlus: GooglePlus,
        private storage: Storage) {
    }

    facebookLogin(){
        this.fb.login(['public_profile', 'email'])
        .then((res: FacebookLoginResponse) => this.loginSuccess('facebook', res))
        .catch(e => this.loginError('facebook', e));
    }

    googleLogin(){
        this.googlePlus.login({})
        .then(res => this.loginSuccess('google', res))
        .catch(err => this.loginError('google', err));
    }

    testLogin(){
        this.loginSuccess('test', 'test');
    }

    loginSuccess(provider, res){
        console.log(res);
        this.storage.set('userid', '123456789');
        this.storage.set('provider', provider);
        this.storage.set('providerid', res);
        this.storage.set('useremail', res);
        this.storage.set('userfullname', res);
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
        let provider;
        this.storage.get('user_id').then(val => { provider = val; });

        switch(provider){
            case 'google':
            this.googlePlus.logout();

            break;
            case 'facebook':
            this.fb.logout();
            
            break;
            case 'test':
            break;
        }

        this.storage.remove('userid');
        this.storage.remove('provider');
        this.storage.remove('providerid');
        this.storage.remove('useremail');
        this.storage.remove('userfullname');
    }


}
