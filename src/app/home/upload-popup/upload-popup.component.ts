import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrls: ['./upload-popup.component.css']
})
export class UploadPopupComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  formGroup = new FormGroup({
    startTime: new FormControl(new Time(0, 0)),
    lastName: new FormControl(''),
  });
  

}

export class Time {
  constructor(public minutes: number, public seconds: number) {}
}