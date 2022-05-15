import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Subscription } from 'rxjs';
import { HomeService } from './home.service';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

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
  videoBool: boolean = false;
  canvasBool: boolean = false;
  instructionsBool: boolean = false;
  
  faEraser = faEraser;
  faPaintBrush = faPaintBrush;
  faTrash = faTrash;
  canvasHeight = 700
  canvasWidth = 1535
  ctx!: CanvasRenderingContext2D;
  strokeStyle: string = '#000000';
  prevPos!: Position; 
  line: LineIncrement[] = [];
  isPainting = false;
  lineIncrement!: LineIncrement;
  canvasLoadCounter!: number;

  constructor(
    private homeService: HomeService,
  ) { }

  async ngOnInit() {
    this.toggleVideoPlayer()

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

  onMouseLeave() {
    if (this.isPainting) {
      this.isPainting = false;
    }
  }

  onMouseEnter() {
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

  toggleCanvas() {
    if (!this.canvasBool) {
      this.canvasBool = true;
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      this.instructionsBool = false;
      this.videoBool = false;
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";

      if (this.canvasLoadCounter != 1) {
        this.ctx = this.canvasEl.nativeElement.getContext('2d');
        this.canvasEl.nativeElement.height = this.canvasHeight.toString()
        this.canvasEl.nativeElement.width = this.canvasWidth.toString()
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 5
        this.canvasLoadCounter += 1
      }
    }
  }

  toggleInstructions() {
    if (!this.instructionsBool) {
        this.instructionsBool = true;
        (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
        this.canvasBool = false;
        this.videoBool = false;
        (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
        (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.videoBool = true;
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      this.instructionsBool = false;
      this.canvasBool = false;
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    }
  }

  toggleBrushTool() {
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
  }

  toggleEraserTool() {
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
  }

  toggleTrashTool() {
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
  }

  getPositionFromEvent(event: MouseEvent) {
    const rect: DOMRect = this.canvasEl.nativeElement.getBoundingClientRect()
    const canvasXPos = (event.clientX - rect.left) / rect.width * this.canvasWidth
    const canvasYPos = (event.clientY - rect.top) / rect.height * this.canvasHeight
    
    const position: Position = {
      xPos: canvasXPos, 
      yPos: canvasYPos
    };
    return position
  }

}