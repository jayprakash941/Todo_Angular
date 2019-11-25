import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

import { environment } from "../../environments/environment";
import { User } from "../_models/user";
import { TaskServiceService } from "./task-service.service";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private http: HttpClient,
    private taskservice: TaskServiceService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | undefined>(
      localStorage.getItem("currentUser") !== null
        ? JSON.parse(localStorage.getItem("currentUser"))
        : undefined
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(data: { username: string; password: string }) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/loging`, {
        email: data.username,
        password: data.password
      })
      .pipe(
        map(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.taskservice.setLoginStatus(true);
          return user;
        })
      );
  }

  register(data: {
    name: string;
    password: string;
    emailId: string;
    DOB: string;
    rePassword: string;
  }) {
    return this.http
      .post<any>(`${environment.apiUrl}/user/signup`, {
        name: data.name,
        dob: data.DOB,
        email: data.emailId,
        password: data.password,
        confirmPassword: data.rePassword
      })
      .pipe(
        map(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('currentUser', JSON.stringify(user));
          //this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
    this.taskservice.setLoginStatus(false);
  }

  getList() {
    let userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData) {
      return this.http
        .get<any>(`${environment.apiUrl}/task/${userData.data.user_id}`
        ,
        {
            headers: {
              "x-auth-token": userData.data.token,
              "Content-Type": "application/json"
            }
          })
        .pipe(
          map(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            // localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
          })
        );
    }
  }

  addTask(data: {
    taskName: string;
    priority: string;
    startDate: string;
    endDate: string;
    comments: string;
  }) {
    let userData = JSON.parse(localStorage.getItem("currentUser"));
    return  this.http
      .post<any>(
        `${environment.apiUrl}/task/${userData.data.user_id}`,
        {
          taskName: data.taskName,
          priority: data.priority,
          startDate: data.startDate,
          endDate: data.endDate,
          comments: data.comments
        },
        {
          headers: {
            "x-auth-token": userData.data.token,
            "Content-Type": "application/json"
          }
        }
      )
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  updateTask(data: {
    _id: string;
    taskName: string;
    priority: string;
    startDate: string;
    endDate: string;
    comments: string;
  }) {
    let userData = JSON.parse(localStorage.getItem("currentUser"));
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth-token', `${userData.token}`);

      let APIURL = `${environment.apiUrl}/task/${userData.data.user_id}/${data._id}`;
    return this.http
      .put<any>(
        APIURL,
        {
          taskName: data.taskName,
          priority: data.priority,
          startDate: data.startDate,
          endDate: data.endDate,
          comments: data.comments
        },
      )
      .pipe(
        map(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }


deleteTask(data: { _id: string }) {
    let userData = JSON.parse(localStorage.getItem("currentUser"));
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth-token', `${userData.token}`);

    return this.http
      .delete<any>(
        `${environment.apiUrl}/task/${userData.data.user_id}/${data._id}`
      )
      .pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return user;
        })
      )
  }
}
