## PickThisApp Ionic App

PickThisApp Ionic App, Assignment 1 project for the Cross Platform subject, Bachelor of IT @ AIT Melbourne.

#### Requirements

* Node.js 6 or greater
* Ionic installed globally `npm install -g ionic`
* Server instance of [PickThisApp RestAPI](https://github.com/davebra/pickthisapp_microservice_crossplatform)

#### Getting Started 

1 - Clone the repository `git clone https://github.com/davebra/pickthisapp_ionic_crossplatform.git`

2 - Enter the folder and install dependecies `npm install`

3 - (optional) By default the `.env.dev` is set with the staging environment of PickThisApp RestAPI, if you want to run your instance, change with your your details

4 - Start with the commands below

##### Commands

* `npm run browser` to start the app for the browser
* `ionic cordova emulate android` install the package for android emulator of device if connected
* `ionic cordova emulate ios` install the package for ios emulator

#### Limitations

* Using the staging RestAPI, the fetch and store of data could be slow, wait some seconds
* Camera module save data as DATA_URI, could be slow, wait some seconds
* Camera from browser use the webcam, if available
* "Drive me here" button use the app native function of oepn the navigator, doesn't work on browser