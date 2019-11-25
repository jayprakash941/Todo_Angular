import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from "../_services/authentication.service";
import { ErrorStateMatcher } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return (control.dirty || control.touched) && form.invalid;
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  error = "";
  hasError = false;
  myParam: string;
  submitted = false;
  loading = false;
  registerForm: FormGroup;
  loginForm: FormGroup;
  maxDate = (new Date().getFullYear() - 12).toString() + "-" + (new Date().getMonth() + 1).toString() + "-" + (new Date().getDate()).toString();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private Router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required,
      Validators.pattern(/^[A-Za-z]{2,}[A-Za-z0-9]{0,}[.]{0,1}[A-Za-z0-9]{1,}[.]{0,1}[A-Za-z0-9]{1,}@[A-Za-z]{2,}[.]{1}[A-za-z]{2,3}[.]{0,1}[a-z]{0,2}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(7),
      Validators.maxLength(10),
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,35}$/)]),
    });
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      emailId: new FormControl('', [Validators.required,
      Validators.pattern(/^[A-Za-z]{2,}[A-Za-z0-9]{0,}[.]{0,1}[A-Za-z0-9]{1,}[.]{0,1}[A-Za-z0-9]{1,}@[A-Za-z]{2,}[.]{1}[A-za-z]{2,3}[.]{0,1}[a-z]{0,2}$/)]),
      DOB: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(7),
      Validators.maxLength(10),
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{7,35}$/)]),
      rePassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordValidator });
  }

  passwordValidator(form: FormGroup) {
    const condition = form.get('password').value != form.get('rePassword').value;
    return condition ? { passwordDoNotMatched: true } : null;
  }
  guestClick(){
    this.Router.navigate([""]);
  }
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.loginForm.reset();
      this.registerForm.reset();
      this.myParam = params['from']});
  }

  submit() {
    if (this.loginForm.invalid) {
      console.log("In Hererer", this.loginForm);
      return false;
    }
    this.authenticationService.login(this.loginForm.value).subscribe(response => {
      if (response.success) {
        this.toastr.success('Success!', response.message);
        console.log("response", response);
        this.Router.navigate(["home"]);
      }
    },
      (error) => {
        console.log("error", error)
        this.toastr.error('Error!', error);
      });

  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return false;
    }

    this.authenticationService.register(this.registerForm.value).subscribe(response => {
      if (response.success) {
        this.toastr.success('Success!', 'User Added Successfully!');
        this.Router.navigate(["auth/login"]);
      }
    },
      (error) => {
        console.log("error", error)
        this.toastr.error('Error!', error);
      });
  }
  matcher = new MyErrorStateMatcher();

}
