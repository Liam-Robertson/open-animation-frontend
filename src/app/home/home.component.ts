import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCommenting } from '@fortawesome/free-solid-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { lastValueFrom } from 'rxjs';
import { Snippet } from './models/Snippet.model';

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
  videoBool: boolean = true;
  canvasBool: boolean = false;
  feedbackBool: boolean = false;
  instructionsBool: boolean = false;
  initCanvasBool: boolean = false; 
  faEraser = faEraser;
  faPaintBrush = faPaintBrush;
  faTrash = faTrash;
  faComment = faCommenting;
  faUpload = faUpload;
  canvasHeight = 700
  canvasWidth = 1535
  ctx!: CanvasRenderingContext2D;
  strokeColour: string = 'black';
  prevPos!: Position; 
  line: LineIncrement[] = [];
  isPainting = false;
  lineIncrement!: LineIncrement;
  canvasLoadCounter: number = 0;
  endTime!: number;
  startTime!: number;
  loading: boolean = false;
  commentary!: string[]
  currentComment!: string;

  constructor(
    private homeService: HomeService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.commentary = (await lastValueFrom(this.homeService.getAllComments())).map(row => row.comment).reverse();
    (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";

    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
      });
      this.ctx = this.canvasEl.nativeElement.getContext('2d');
    }

  uploadSnippet() {
    const dialogRef = this.dialog.open(UploadPopupComponent, {
      data: {startTime: this.startTime, endTime: this.endTime, submitBool: false},
    });

    dialogRef.afterClosed().subscribe(response => {

      if (response != null) {
        this.loading = true;
        const image = this.canvasEl.nativeElement.toDataURL();
  
        const snippetOut: Snippet = {
          startTime: response.startTime,
          endTime: response.endTime,
          image: image
        }
        
        this.homeService.uploadSnippet(snippetOut).subscribe((response: any) => {
          alert(response) 
          window.location.reload();
        })
      }
    });
  } 

  submitCommentary() {
    this.homeService.saveComment(this.currentComment).subscribe((response: any) => {
      alert(response) 
      window.location.reload();
    })
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

  onMouseDown(event: any) {
    this.isPainting = true;
    this.prevPos = this.getPositionFromEvent(event)
  }

  onMouseMove(event: any) {
    if (this.isPainting) {
      const currentPos: Position = this.getPositionFromEvent(event)
      this.lineIncrement = {
        startPos: this.prevPos,
        endPos: currentPos
      };
      this.line.push(this.lineIncrement);
      this.draw(this.prevPos, currentPos, this.strokeColour);
    }
  }

  onTouchStart(event: TouchEvent) {
    if (event.target == document.getElementById("canvasId")) {
      event.preventDefault();
    }
    const touch = event.touches[0]
    this.onMouseDown(touch)
  }

  onTouchMove(event: TouchEvent) {
    if (event.target == document.getElementById("canvasId")) {
      event.preventDefault();
    }
    const touch = event.touches[0]
    this.onMouseMove(touch)
  }

  onTouchEnd() {
    if (this.isPainting) {
      this.isPainting = false;
    }
  }

  draw(prevPos: Position, currentPos: Position, strokeColour: string) {
    this.ctx.beginPath(); 
    this.ctx.strokeStyle = strokeColour;
    this.ctx.moveTo(prevPos.xPos, prevPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
    this.prevPos = {
      xPos: currentPos.xPos,
      yPos: currentPos.yPos,
    };
  }

  toggleCanvas() {
    if (!this.initCanvasBool) {
      this.initCanvasBool = true;
      this.instructionsBool = false;
      this.videoBool = false;
      this.canvasBool = true;
      this.feedbackBool = false;
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("feedback-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";

      this.ctx = this.canvasEl.nativeElement.getContext('2d');
      this.canvasEl.nativeElement.height = this.canvasHeight.toString();
      this.canvasEl.nativeElement.width = this.canvasWidth.toString();  
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.canvasWidth,  this.canvasHeight);
      this.ctx.lineJoin = 'round'
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 5;
    } else {
      this.ctx.canvas.hidden = false;
      this.instructionsBool = false;
      this.videoBool = false;
      this.feedbackBool = false;
      this.canvasBool = true;
    }
  }

  toggleInstructions() {
    if (!this.instructionsBool) {
        this.instructionsBool = true;
        (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
        this.canvasBool = false;
        this.ctx.canvas.hidden = true;
        this.feedbackBool = false;
        this.videoBool = false;
        (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
        (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
        (document.getElementById("feedback-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.videoBool = true;
      this.canvasBool = false;
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      this.instructionsBool = false;
      this.feedbackBool = false;
      this.ctx.canvas.hidden = true;
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("feedback-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    };
  }

  toggleFeedback() {
    if (!this.feedbackBool) {
      this.feedbackBool = true;
      this.videoBool = false;
      this.canvasBool = false;
      this.instructionsBool = false;
      this.ctx.canvas.hidden = true;
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("feedback-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    }
  }

  toggleBrushTool() {
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    this.ctx.lineWidth = 5
    this.strokeColour = '#000000';
  }

  toggleEraserTool() {
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    this.ctx.lineWidth = 25
    this.strokeColour = '#FFFFFF';
  }

  toggleTrashTool() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasWidth,  this.canvasHeight);
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
