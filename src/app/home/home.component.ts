import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from "../_services/authentication.service";
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogboxComponent } from '../dialogbox/dialogbox.component';

import { TaskServiceService } from '../_services/task-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // task: string;
  loggedInUser: {};
  displayedColumns: string[] = ['taskName', 'priority', 'startDate', 'endDate', 'comments', 'actions'];


  //dataSource: MatTableDataSource < Element[] > ;
  dataSource: MatTableDataSource<Element[]>;
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  taskList: [];
  paginator;


  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
  }

  constructor(public taskservice: TaskServiceService, public auth: AuthenticationService, private toastr: ToastrService, public dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private changeDetectorRefs: ChangeDetectorRef) {
    // this.taskForm = new FormGroup({
    //   taskName: new FormControl('', [Validators.required]),
    //   emailId: new FormControl('', [Validators.required, Validators.email]),
    //   DOB: new FormControl('', [Validators.required]),
    //   password: new FormControl('', [Validators.required, Validators.minLength(7),
    //   Validators.maxLength(35),
    //   Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,35}$/)]),
    //   rePassword: new FormControl('', [Validators.required])
    // },{validators:this.passwordValidator});
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 2000);

  }
  editTask(element,index): void {
    this.taskservice.dataObj = '';
    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '500px',
      data: { data: element,index:index }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (this.taskservice.dataObj != "" && this.taskservice.method === "edit") {
        let id = this.taskservice.getTask()._id;
        let indx = this.dataSource.data.findIndex(element => element['_id'] == id)
        if (indx !== -1) {
          console.log("Before", this.dataSource.data[indx]);
          this.dataSource.data[indx] = this.taskservice.getTask();
          console.log("After", this.dataSource.data[indx]);
        } else {
          console.log("In Else");
        }
      } else {
        if (localStorage.getItem('guestUser')) {

          let data = JSON.parse(localStorage.getItem('guestUser'));
          this.dataSource.data[index] = data[index];
        }
      }
      this.dataSource.paginator = this.paginator;
      this.changeDetectorRefs.detectChanges();

    });
  }
  deleteTask(id, name,index): void {
    if (confirm("Are you sure to delete " + name)) {
      console.log("id",id)
      if(id!=""){
        console.log("if");
        this.authenticationService.deleteTask({ _id: id }).subscribe(response => {
          if (response.success) {
            this.toastr.success('Success!', response.message);
            let indx = this.dataSource.data.findIndex(element => element['_id'] == id)
            if (indx !== -1) {
              this.dataSource.data.splice(indx, 1);
              this.changeDetectorRefs.detectChanges();
              this.dataSource.paginator = this.paginator;
            } else {
              console.log("In Else");
            }
          }
        },
          (error) => {
            console.log("error", error)
  
            this.toastr.error('Error!', error);
          });
      } else {
        let data = JSON.parse(localStorage.getItem('guestUser'));
        data.splice(index, 1);
        this.dataSource.data.splice(index, 1);
        let localdata = JSON.stringify(data);
        localStorage.setItem('guestUser', localdata);
        this.changeDetectorRefs.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.toastr.success('Success!', "Task deleted successfully!");
      }
    }
  }
  openDialog(): void {
    this.taskservice.dataObj = '';
    const dialogRef = this.dialog.open(DialogboxComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('This func called', result, this.task);
      // this.toastr.success('Hello world!', 'Toastr fun!');
      // this.task = result;
      if (this.taskservice.dataObj != "" && this.taskservice.method === "add") {

        if(this.dataSource){
          this.dataSource.data.push(this.taskservice.getTask())
        } else {
          this.dataSource = new MatTableDataSource([this.taskservice.getTask()]);
        }

        // if(this.dataSource.data){
        //   this.dataSource.data.push(this.taskservice.getTask())
        // } else {
        //   this.dataSource.data.push(this.taskservice.getTask()
        // }
        this.changeDetectorRefs.detectChanges();
        this.dataSource.paginator = this.paginator;
      } else if (localStorage.getItem('guestUser') != "null") {
        let data = JSON.parse(localStorage.getItem('guestUser'));
        console.log("In else if",data)
        this.dataSource.data = data;
        this.changeDetectorRefs.detectChanges();
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngOnInit() {
    this.auth.currentUser.subscribe(user => {
      this.loggedInUser = user;
    });
    if (localStorage.getItem('currentUser')) {
      this.auth.getList().subscribe(userData => {
        // console.log("userData",userData);
        if(userData.success){

          this.dataSource = new MatTableDataSource(userData.task);
        } else {
          this.dataSource = new MatTableDataSource([]);

        }
        // this.taskList = userData.data;
        // this.dataSource.paginator = this.paginator;  
        //setTimeout(() => this.dataSource.paginator = this.paginator);
        // console.log("this.taskList",this.taskList); 
      },
        (error) => {
          this.taskList = [];
        });

    } else {
      if (localStorage.getItem('guestUser') && localStorage.getItem('guestUser')!="null") {
        let data = JSON.parse(localStorage.getItem('guestUser'));
        // let data = [localData];
        console.log("data",data);
        this.dataSource = new MatTableDataSource(data);
        // return { data: data };
      } else {
        this.dataSource = new MatTableDataSource([]);
        localStorage.setItem('guestUser', null);
        // return { data: "" };
      }

      // return this.http.get<any>(`${environment.apiUrl}/getTask/${userData.data._id}`)
      //     .pipe(map(user => {
      //         // store user details and jwt token in local storage to keep user logged in between page refreshes
      //         // localStorage.setItem('currentUser', JSON.stringify(user));
      //         this.currentUserSubject.next(user);
      //         return user;
      //     }));
    }
    // console.log("thisss", this.dataSource)
  }
  // addTsk() {
  //   this.toastr.success('Hello world!', 'Toastr fun!');
  // }
}
// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
//   { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
//   { position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na' },
//   { position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg' },
//   { position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al' },
//   { position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si' },
//   { position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P' },
//   { position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S' },
//   { position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl' },
//   { position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar' },
//   { position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K' },
//   { position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca' },
// ];
// @Component({
//   selector: 'dialog-overview-example-dialog',
//   templateUrl: 'dialog-overview-example-dialog.html',
// })
// export class DialogOverviewExampleDialog {

//   constructor(
//     public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData) {
//     }

//   onNoClick() {
//     this.dialogRef.close();
//   }

// }