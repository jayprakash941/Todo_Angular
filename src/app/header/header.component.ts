import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from "../_services/authentication.service";
// import { EventEmitter } from 'events';
import { TaskServiceService } from '../_services/task-service.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  loggedInUser: {};
  isloggedIn = false;
  localstoVal;
  subscription1: Subscription;
  constructor(public route: Router, taskservice: TaskServiceService, public auth: AuthenticationService) {
    this.subscription1 = taskservice.getLoginSatus().subscribe(a => {
      if (a.isloggedin) {
        this.loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
        this.isloggedIn = true;
      } else {
        this.isloggedIn = false;
        this.loggedInUser = { data: { name: "" } };
      }
    });
  }
  ngOnInit() {
    // this.event.p
    console.log("on init");
    // this.auth.currentUser.subscribe(user => {
    if (localStorage.getItem('currentUser')) {
      this.loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
      this.isloggedIn = true;
      // console.log("localStorage.getItem('currentUser')",this.localstoVal);
      // this.loggedInUser = this.localstoVal.data;
    } else {
      this.isloggedIn = false;
    }
    // })
  }
  headerBtnClk(selectedbutton) {
    if (selectedbutton != "" && selectedbutton != "logout"&& selectedbutton != "home") {
      this.route.navigate(["/auth/", selectedbutton]);
    } else if (selectedbutton == "logout") {
      this.auth.logout();
      this.loggedInUser = { data: { name: "" } };
      this.isloggedIn = false;
      this.route.navigate(["/auth/login"]);
    } else if(selectedbutton == "home"){
      console.log("In here");
      this.route.navigate([""]);
    }
  }
}
