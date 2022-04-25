import { Component, OnInit } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HomeService } from './home.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private homeService: HomeService
  ) { }

  ngOnInit(): void {
    this.homeService.getWelcomeText().subscribe(row => {
      console.log(row);
    })
    
  }

}
