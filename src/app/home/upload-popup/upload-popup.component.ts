import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { HomeComponent } from '../home.component';

@Component({
  selector: 'app-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrls: ['./upload-popup.component.css']
})
export class UploadPopupComponent implements OnInit {
  submitBoolean!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UploadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HomeComponent) { }

  ngOnInit(): void {
  }

  formGroup = new FormGroup({
    startTime: new FormControl(),
    lastName: new FormControl(),
  });

}

