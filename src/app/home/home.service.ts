import { Injectable, OnInit } from '@angular/core';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import user from '../key.json';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(public http: HttpClient) { }

  getWelcomeText(): Observable<any> {
    const headers = new HttpHeaders({authorization: 'Basic ' + btoa(`${user.username}:${user.password}`)})
    return this.http.get(environment.env, {'headers': headers})
  }

  getTapestry(): Observable<any> {
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(`${user.username}:${user.password}`)})
    return this.http.get(environment.env + "getTapestry", {'headers': headers, responseType: 'blob'})
  }

  errorHandler(error: HttpErrorResponse) {
    const myReader = new FileReader();
    myReader.onload = function (event) {
      alert(myReader.result);
    };
    myReader.readAsText(error.error);

    return throwError(error);
  }
}


