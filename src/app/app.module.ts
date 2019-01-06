import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Geolocation } from '@ionic-native/geolocation';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule} from '@angular/http';
import { ApiProvider } from '../providers/api/api';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { TagInputModule } from 'ngx-chips';

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
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    TagInputModule,
    IonicModule.forRoot(MyApp,{tabsHideOnSubPages: false}),
    IonicStorageModule.forRoot({
      name: '__ptadb',
         driverOrder: ['indexeddb', 'websql', 'sqlite']
    })
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
    File,
    Transfer,
    Camera,
    FilePath,
    Facebook,
    GooglePlus,
    Geolocation,
    SplashScreen,
    LaunchNavigator,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider
  ]
})
export class AppModule {}
