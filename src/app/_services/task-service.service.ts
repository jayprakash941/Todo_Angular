import { Injectable } from '@angular/core';
import { Subject,Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskServiceService {
  dataObj;
  method;
  private loginSubject = new Subject();
  constructor() { }

  addTask(data){
    this.dataObj=data;
  }


  getTask(){
     return this.dataObj;
  }

  setLoginStatus(isloggedin: Boolean) {
    this.loginSubject.next({ isloggedin: isloggedin });
  }
  getLoginSatus(): Observable<any> {
    return this.loginSubject.asObservable();
  }
}