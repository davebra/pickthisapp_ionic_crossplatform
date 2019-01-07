import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * 
 * Class for the IntroPage
 * 
 */
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {

    constructor(public viewCtrl: ViewController, 
        private storage: Storage) {
    }

    // dismiss the intro, save the string 'skip' in the storage, so next time the home will see it and doesn't open the intro
    dismiss() {
        this.storage.set('intro', 'skip');
        this.viewCtrl.dismiss();
    }

}
