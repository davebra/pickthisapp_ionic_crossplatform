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

}