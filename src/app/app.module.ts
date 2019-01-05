import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { Camera } from '@ionic-native/camera';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';

import { GoogleMaps } from '@ionic-native/google-maps';
import { HttpClientModule } from '@angular/common/http';
import { ApiProvider } from '../providers/api/api';

import { HomePage } from '../pages/home/home';
import { FilterPage } from '../pages/home/filter';
import { AddPage } from '../pages/add/add';
import { YourPage } from '../pages/your/your';
import { ThingPage } from '../pages/thing/thing';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AddPage,
    YourPage,
    ThingPage,
    FilterPage,
    LoginPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp,{tabsHideOnSubPages: false})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AddPage,
    YourPage,
    ThingPage,
    FilterPage,
    LoginPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    Camera,
    Facebook,
    GooglePlus,
    SplashScreen,
    GoogleMaps,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider
  ]
})
export class AppModule {}
