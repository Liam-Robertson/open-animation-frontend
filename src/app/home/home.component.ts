import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { Snippet } from './home.model';

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
  instructionsBool: boolean = false;
  initCanvasBool: boolean = false; 
  faEraser = faEraser;
  faPaintBrush = faPaintBrush;
  faTrash = faTrash;
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

  constructor(
    private homeService: HomeService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";

    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
      });    
    }

  uploadSnippet() {
    const dialogRef = this.dialog.open(UploadPopupComponent, {
      data: {name: this.startTime, animal: this.endTime},
    });

    dialogRef.afterClosed().subscribe(response => {
      // const image = this.canvasEl.nativeElement.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const image = this.canvasEl.nativeElement.toDataURL();

      const snippetOut: Snippet = {
        startTime: response.startTime,
        endTime: response.endTime,
        image: image
      }
      this.loading = true;
      this.homeService.uploadSnippet(snippetOut).subscribe((response: any) => {
        alert(response)
      })
      this.loading = false;
      console.log(snippetOut);
    });
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
      this.draw(this.prevPos, currentPos, this.strokeColour);
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
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";

      this.ctx = this.canvasEl.nativeElement.getContext('2d');
      this.canvasEl.nativeElement.height = this.canvasHeight.toString();
      this.canvasEl.nativeElement.width = this.canvasWidth.toString();  
      this.ctx.fillStyle = '#F0FFFF';
      this.ctx.fillRect(0, 0, this.canvasWidth,  this.canvasHeight);
      this.ctx.lineJoin = 'round'
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 5;
    } else {
      this.ctx.canvas.hidden = false;
      this.instructionsBool = false;
      this.videoBool = false;
      this.canvasBool = true;
    }
  }

  toggleInstructions() {
    if (!this.instructionsBool) {
        this.instructionsBool = true;
        (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
        this.canvasBool = false;
        this.ctx.canvas.hidden = true;
        this.videoBool = false;
        (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
        (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.videoBool = true;
      this.canvasBool = false;
      (document.getElementById("video-button") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
      this.instructionsBool = false;
      this.ctx.canvas.hidden = true;
      (document.getElementById("instructions-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
      (document.getElementById("canvas-button") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    };
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
    this.ctx.clearRect(0, 0, this.canvasEl.nativeElement.width, this.canvasEl.nativeElement.height);
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
