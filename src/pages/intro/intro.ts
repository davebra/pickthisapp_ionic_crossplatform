import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {

    constructor(public viewCtrl: ViewController, 
        private storage: Storage) {
    }

    dismiss() {
        this.storage.set('intro', 'skip');
        this.viewCtrl.dismiss();
    }

}
