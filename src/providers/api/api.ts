import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable()
export class ApiProvider {

    baseUrl:string = "https://pickthisapp.herokuapp.com/api";
 
    constructor(public http: HttpClient) { }
 
    getFilms() {
        return this.http.get('https://swapi.co/api/films');
    }

}