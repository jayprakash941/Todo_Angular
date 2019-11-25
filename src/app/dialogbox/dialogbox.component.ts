import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from "../_services/authentication.service";
import { ToastrService } from 'ngx-toastr';
import { TaskServiceService } from '../_services/task-service.service';

@Component({
  selector: 'app-dialogbox',
  templateUrl: './dialogbox.component.html',
  styleUrls: ['./dialogbox.component.css']
})
export class DialogboxComponent implements OnInit {
  isDisabled=true;
  minDate = "2007-11-22";
  taskForm: FormGroup;
  priorities = [{ title: "Low", value: "Low" }, { title: "Medium", value: "Medium" }, { title: "High", value: "High" }]
  constructor(
    public task: TaskServiceService,
    private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<DialogboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private toastr: ToastrService) {  
    this.taskForm = new FormGroup({
      _id: new FormControl(''),
      taskName: new FormControl('', [Validators.required]),
      priority: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      comments: new FormControl('', [Validators.required])
    });
  }
  startDateChange(val) {
    this.taskForm.controls['endDate'].setValue('');
    val = new Date(val)
    console.log("val", val);
    let date = (val.getFullYear()).toString() + "-" + (val.getMonth() + 1).toString() + "-" + (val.getDate()).toString();
    console.log("after", date);
    this.minDate = date
    console.log("this.minDate", this.minDate);
    this.isDisabled=false;
  }
  ngOnInit() {
    // if(this.data.length>0){
      let id = "";
      console.log("this.data",this.data);
      if (this.data.data._id) {
        id = this.data.data._id
      }
       else if (this.data.index || this.data.index ==0) {
        id = this.data.index;
      }
      this.taskForm.setValue({
        _id: id,
        taskName: this.data.data.taskName,
        priority: this.data.data.priority,
        startDate: this.data.data.startDate,
        endDate: this.data.data.endDate,
        comments: this.data.data.comments
      });
    // }
  }
  onSubmit() {
    if (this.taskForm.invalid) {
      return false;
    }
    if (this.taskForm.value._id != "" || this.taskForm.value._id =='0' ) {
      console.log("error 1");
      if (localStorage.getItem('currentUser')) {
        this.authenticationService.updateTask(this.taskForm.value).subscribe(response => {
          if (response.success) {
            this.toastr.success('Success!', response.message);
            this.task.addTask(response.task);
            this.task.method = "edit";
          }
        },
          (error) => {
            console.log("error", error);
            this.toastr.error('Error!', error);
          });
      } else {
        let id = this.taskForm.value._id;
        let data = JSON.parse(localStorage.getItem('guestUser'));
        data[id] = { "_id": "", taskName: this.taskForm.value.taskName, priority: this.taskForm.value.priority, startDate: this.taskForm.value.startDate, endDate: this.taskForm.value.endDate, comments: this.taskForm.value.comments }
        let localdata = JSON.stringify(data);
        localStorage.setItem('guestUser', localdata);
        this.toastr.success('Success!', "Task added successfully!");
      }

    } else {
      if (localStorage.getItem('currentUser')) {
        this.authenticationService.addTask(this.taskForm.value).subscribe(response => {
          if (response.success) {
            this.toastr.success('Success!', response.message);
            this.task.addTask(response.task);
            this.task.method = "add";
          }
        },
          (error) => {
            console.log("error", error);
            this.toastr.error('Error!', error);
          });
      } else {
        if (localStorage.getItem('guestUser') != "null") {
          let data = JSON.parse(localStorage.getItem('guestUser'));
          data.push(this.taskForm.value);
          let localdata = JSON.stringify(data);
          localStorage.setItem('guestUser', localdata);
          this.toastr.success('Success!', "Task added successfully!");
        } else {
          let data = JSON.stringify([this.taskForm.value]);
          localStorage.setItem('guestUser', data);
          this.toastr.success('Success!', "Task added successfully!");
        }
      }
    }
  }
}