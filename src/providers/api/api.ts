import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable()
export class ApiProvider {
 
    constructor(public http: HttpClient) { }
 
    getThings(latitude, longitude, radius) {
        return new Promise((resolve, reject) => {
          this.http.get( process.env.RESTAPI_URL + '/things?lat=' + latitude + '&lng=' + longitude + '&radius=' + radius )
            .subscribe(res => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    loginUser(provider, providerid, useremail, userfullname) {
        return new Promise((resolve, reject) => {

            let postData = {
                "provider": provider,
                "providerid": providerid,
                "email": useremail,
                "fullname": userfullname
            }

            this.http.post( process.env.RESTAPI_URL + "/user", postData)
            .subscribe(res => {
                resolve(res);
            }, error => {
                reject(error);
            });

        });
    }

    getUserThings(userid) {
        return new Promise((resolve, reject) => {
          this.http.get( process.env.RESTAPI_URL + '/userthings/' + userid )
            .subscribe(res => {
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    changeThingStatus(thingid, userid, status) {
        return new Promise((resolve, reject) => {

            let postData = {
                "user": userid,
                "status": status
            }
    
            this.http.post( process.env.RESTAPI_URL + "/things/" + thingid, postData)
            .subscribe(res => {
                resolve(res);
            }, error => {
                reject(error);
            });

        });
    }

    uploadImage(image, imagename, userid) {
        return new Promise((resolve, reject) => {

            let postData = {
                "user": userid,
                "imagename": imagename,
                "image": image
            }
    
            this.http.post( process.env.RESTAPI_URL + "/upload", postData)
            .subscribe(res => {
                resolve(res);
            }, error => {
                reject(error);
            });

        });
    }

    addThings(userid, type, lat, lng, tags, images) {
        return new Promise((resolve, reject) => {

            let postData = {
                "user": userid,
                "type": type,
                "lat": lat,
                "lng": lng,
                "tags": tags,
                "images": images
            }
    
            this.http.post( process.env.RESTAPI_URL + "/things", postData)
            .subscribe(res => {
                resolve(res);
            }, error => {
                reject(error);
            });

        });
    }

}