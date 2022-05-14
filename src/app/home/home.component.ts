import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Subscription } from 'rxjs';
import { HomeService } from './home.service';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';

interface Position {
  xPos: number;
  yPos: number;
}

interface LineIncrement {
  startPos: Position;
  endPos: Position;
}

interface Line {
  startPos: Position;
  endPos: Position;
}
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('canvasEl') canvasEl!: ElementRef;
  canvasBool: boolean = false
  videoBool: boolean = true;
  ctx!: CanvasRenderingContext2D;
  strokeStyle: string = '#000000';
  prevPos!: Position; 
  line: LineIncrement[] = [];
  isPainting = false;
  lineIncrement!: LineIncrement;

  constructor(
    private homeService: HomeService,
  ) { }

  async ngOnInit() {
    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
    })
  }

  onMouseDown(event: MouseEvent) {
    this.isPainting = true;
    this.prevPos = this.getPositionFromEvent(event)
  }

  onMouseUp() {
    if (this.isPainting) {
      this.isPainting = false;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isPainting) {
      const currentPos: Position = this.getPositionFromEvent(event)
      this.lineIncrement = {
        startPos: this.prevPos,
        endPos: currentPos
      };
      this.line.push(this.lineIncrement);
      this.draw(this.prevPos, currentPos, this.strokeStyle);
    }
  }

  draw(prevPos: Position, currentPos: Position, strokeStyle: string) {
    this.ctx.beginPath(); 
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.moveTo(prevPos.xPos, prevPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
    this.prevPos = {
      xPos: currentPos.xPos,
      yPos: currentPos.yPos,
    };
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
        this.ctx = this.canvasEl.nativeElement.getContext('2d');
        this.canvasEl.nativeElement.height = "700"
        this.canvasEl.nativeElement.width = "1090"
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 5
    break
    }
  }

  getPositionFromEvent(event: MouseEvent) {
    const rect: DOMRect = this.canvasEl.nativeElement.getBoundingClientRect()
    const canvasXPos = (event.clientX - rect.left) / rect.width * 1090
    const canvasYPos = (event.clientY - rect.top) / rect.height * 700
    
    const position: Position = {
      xPos: canvasXPos, 
      yPos: canvasYPos
    };
    return position
  }

}