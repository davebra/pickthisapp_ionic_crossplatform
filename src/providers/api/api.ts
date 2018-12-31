import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable()
export class ApiProvider {
 
    constructor(public http: HttpClient) { }
 
    getThings(latitude, longitude, radius) {
        return this.http.get( process.env.RESTAPI_URL + '/things?lat=' + latitude + '&lng=' + longitude + '&radius=' + radius );
    }

    getFilms() {
        return this.http.get('https://swapi.co/api/films');
    }

}