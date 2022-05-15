import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload-popup',
  templateUrl: './upload-popup.component.html',
  styleUrls: ['./upload-popup.component.css']
})
export class UploadPopupComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  myForm = this.formBuilder.group({
    deposit: ['', [
      Validators.required, // Validators
      Validators.min(1),
      Validators.max(1000000)
    ]],
  });

}
