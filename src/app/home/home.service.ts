import { Injectable, OnInit } from '@angular/core';
import { lastValueFrom, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import user from '../key.json';
import { Snippet } from './models/Snippet.model';
import { Commentary } from './models/Commentary.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(public http: HttpClient) { }

  getWelcomeText(): Observable<any> {
    const headers = new HttpHeaders({authorization: 'Basic ' + btoa(`${user.username}:${user.password}`)})
    return this.http.get(environment.env)
  }

  getTapestry(): Observable<any> {
    return this.http.get(environment.env + "getTapestry", {responseType: "blob"})
  }

  getAllComments(): Observable<Commentary[]> {
    return this.http.get(environment.env + "getAllCommentary", {responseType: "json"})
      .pipe(map((res: any) => res))
  }

  saveComment(comment: string): Observable<any> {
    return this.http.post(environment.env + "saveCommentary", comment, {responseType: "text"})
    .pipe(catchError(this.errorHandler));
  }

  uploadSnippet(snippetOut: Snippet): Observable<string> {
    return this.http.post(environment.env + "addSnippetToTapestry", snippetOut, {responseType: "text"})
    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    alert(error.error.error)
    // window.location.reload();
    return throwError(() => error);
  }
  
}


// errorHandler(error: HttpErrorResponse) {
//   const myReader = new FileReader();
//   myReader.onload = function (event) {
//     alert(myReader.result);
//   };
//   myReader.readAsText(error.error);
//   return throwError(error);
// }