import { Component, OnInit } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HomeService } from './home.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  test!: string;

  constructor(
    private homeService: HomeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.test = await lastValueFrom(this.homeService.getWelcomeText())
  }

}
