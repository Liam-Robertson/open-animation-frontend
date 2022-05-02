import { Injectable, OnInit } from '@angular/core';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(public http: HttpClient) {}

  getWelcomeText(): Observable<string> {
    return this.http.get(environment.env + "/", {responseType: "text"});
  }

  getTapestry(): Observable<Blob> {
    return this.http.get(environment.env + "/getTapestry", {responseType: "blob"})
    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    const myReader = new FileReader();
    myReader.onload = function(event){
      alert(myReader.result);
    };
    myReader.readAsText(error.error);

    return throwError(error);
  }
}


// return this.http.get<string>("http://" + environment.env + "/hello").pipe(catchError(this.errorHandler));
