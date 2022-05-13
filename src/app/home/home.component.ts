import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { Snippet } from '../models/Snippet.model';
import { HomeService } from './home.service';
import user from '../key.json';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedFile: File | null = null
  canvasBool = false;
  videoBool = true;

  constructor(
    private homeService: HomeService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {

    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
    })

  }

  showCanvas() {
    switch (this.canvasBool) {
      case true:
        this.canvasBool = false
        this.videoBool = true 
        break
      case false:
        this.canvasBool = true
        this.videoBool = false 
        break
    }
  }

  createSnippetFromFile(event: any) {
    this.selectedFile = event.target.files[0] as File;
    // this.previewSnippet.videoStreamUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(this.selectedFile))
    
    // this.previewSnippet.videoDiv.onloadedmetadata = () => {
    //     const sliderRect = (document.getElementById("preview-slider-thumb") as HTMLElement).getBoundingClientRect()          
    //     this.previewSnippet.durationPct =  (this.previewSnippet.videoDiv.duration / this.tapestry.videoDiv.duration) * 100,
    //     this.previewSnippet.timeEndPct = this.previewSnippet.timeStartPct + this.previewSnippet.durationPct,
    //     this.previewSnippet.visible = true        
    // }
  }

  uploadFile() {
    // if (this.selectedFile != null) {
    //   this.snippetOut = {
    //     videoStream: this.selectedFile as Blob,
    //     user: "system",
    //     videoName: this.selectedFile.name,
    //     timeStart: (this.previewSnippet.timeStartPct / 100) * this.tapestry.videoDiv.duration,
    //     timeEnd: (this.previewSnippet.timeEndPct / 100) * this.tapestry.videoDiv.duration,
    //     duration: (this.previewSnippet.durationPct / 100) * this.tapestry.videoDiv.duration,
    //   }
    //   this.uploadLoading = true
    //   this.appService.uploadFile(this.snippetOut).subscribe(response => {
    //     window.location.reload();
    //     alert(response)
    //   })
    // }
  }

  selectFile() {
    (document.getElementById("selectFile") as HTMLInputElement).click()
  }

}
