import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HomeService } from './home.service';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCommenting } from '@fortawesome/free-solid-svg-icons';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { faPenFancy } from '@fortawesome/free-solid-svg-icons';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
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
  faEraser = faEraser;
  faPaintBrush = faPaintBrush;
  faTrash = faTrash;
  faComment = faCommenting;
  faUpload = faUpload;
  faFilm = faFilm;
  faPenToSquare = faPenToSquare;
  faCircleInfo = faCircleInfo;
  faCircle = faCircle;
  faComments = faComments;
  faPen = faPenFancy;

  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  videoBool: boolean = true;
  canvasBool: boolean = false;
  feedbackBool: boolean = false;
  instructionsBool: boolean = false;
  initCanvasBool: boolean = false; 

  // Page buttons
  videoButton!: HTMLButtonElement;
  canvasButton!: HTMLButtonElement;
  instructionsButton!: HTMLButtonElement;
  feedbackButton!: HTMLButtonElement;
  pageButtonList: HTMLButtonElement[] = []

  // Canvas tool buttons
  brushButton!: HTMLButtonElement;
  penButton!: HTMLButtonElement;
  circleButton!: HTMLButtonElement;
  eraserButton!: HTMLButtonElement;
  trashButton!: HTMLButtonElement;
  canvasButtonList: HTMLButtonElement[] = []

  brushToolBool: boolean = true;
  circleToolBool: boolean = false;

  standardColour: string = "rgba(13, 29, 207, 0.048)";
  darkenColour: string = "rgba(41, 169, 255, 0.473)";
  prevPos!: Position; 
  mouseDown!: Boolean;
  currentPos!: Position;
  isPainting: boolean = false;
  line: LineIncrement[] = [];
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

    firstValueFrom(this.homeService.getWelcomeText())
    this.intialiseVariables()
    this.pageButtonList = [this.videoButton, this.canvasButton, this.instructionsButton, this.feedbackButton]
    this.canvasButtonList = [this.brushButton, this.penButton, this.circleButton, this.eraserButton, this.trashButton]

    this.commentary = (await lastValueFrom(this.homeService.getAllComments())).map(row => row.comment).reverse();
    this.videoButton.style.background =  this.darkenColour;
    this.brushButton.style.background =  this.darkenColour;

    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
      });
    }

// ##################################
// User Upload Actions
// ##################################

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

// ##################################
// Mouse Actions
// ##################################

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
      this.currentPos = this.getPositionFromEvent(event)
      
      if (this.brushToolBool) {
        this.draw(this.prevPos, this.currentPos);
      } 
      else if (this.circleToolBool) {
        this.drawCircle(this.prevPos, this.currentPos, this.mouseDown);
      }
      this.prevPos = {xPos: this.currentPos.xPos, yPos: this.currentPos.yPos};
    }
  }

  onTouchStart(event: TouchEvent) {
    if (event.target == this.canvasEl.nativeElement) {
      event.preventDefault();
    }
    const touch = event.touches[0]
    this.onMouseDown(touch)
  }

  onTouchMove(event: TouchEvent) {
    if (event.target == this.canvasEl.nativeElement) {
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

// ##################################
// Toggle Pages
// ##################################

  toggleCanvas() {
    if (!this.initCanvasBool) {
      this.initCanvasBool = true;
      this.instructionsBool = false;
      this.videoBool = false;
      this.canvasBool = true;
      this.feedbackBool = false;
      this.togglePages(this.canvasButton);

      this.ctx = this.canvasEl.nativeElement.getContext('2d') as CanvasRenderingContext2D;
      const containerWidth = document.getElementById("app-container")?.getBoundingClientRect().width
      const containerHeight = document.getElementById("app-container")?.getBoundingClientRect().height
      
      this.canvasEl.nativeElement.width = containerWidth as number;
      this.canvasEl.nativeElement.height = containerHeight as number;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
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
        this.canvasBool = false;
        this.ctx.canvas.hidden = true;
        this.feedbackBool = false;
        this.videoBool = false;
        this.togglePages(this.instructionsButton);
      }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.videoBool = true;
      this.canvasBool = false;
      this.instructionsBool = false;
      this.feedbackBool = false;
      this.ctx.canvas.hidden = true;
      this.togglePages(this.videoButton);
    };
  }

  toggleFeedback() {
    if (!this.feedbackBool) {
      this.feedbackBool = true;
      this.videoBool = false;
      this.canvasBool = false;
      this.instructionsBool = false;
      this.ctx.canvas.hidden = true;
      this.togglePages(this.feedbackButton);
    }
  }

// ##################################
// Toggle Canvas Tools
// ##################################

  toggleBrushTool() {
    this.toggleCanvasTools(this.brushButton);
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
  }

  togglePenTool() {
    this.toggleCanvasTools(this.penButton);
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
    // ctx.beginPath();
    //   var p = new Path2D();
    //   p.moveTo(this.origin.x, this.origin.y);
    //   p.lineTo(this.target.x, this.target.y);
    //   p.stroke();
    //   this.path = p;
    //   console.log(p);
  }

  toggleEraserTool() {
    this.toggleCanvasTools(this.eraserButton);
    this.ctx.lineWidth = 25
    this.ctx.strokeStyle = "#FFFFFF";
  }

  toggleCircleTool() {
    this.toggleCanvasTools(this.circleButton);
    // (document.getElementById("circle-tool") as HTMLButtonElement).style.background =  "rgba(41, 169, 255, 0.473)";
    // (document.getElementById("brush-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    // (document.getElementById("eraser-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    // (document.getElementById("trash-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    // (document.getElementById("pen-tool") as HTMLButtonElement).style.background =  "rgba(13, 29, 207, 0.048)";
    // const centerX = (this.prevPos) / 2;
    // const centerY = this.canvasEl.nativeElement.height / 2;
    // const radius = 70;

    // this.ctx.beginPath();
    // this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    // this.ctx.fillStyle = 'green';
    // this.ctx.fill();
    // this.ctx.lineWidth = 5;
    // this.ctx.strokeStyle = '#003300';
    // this.ctx.stroke();
  }

  toggleTrashTool() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
  }

  // ##################################
  // Drawing Tools
  // ##################################

  draw(prevPos: Position, currentPos: Position) {
    this.lineIncrement = {
      startPos: prevPos,
      endPos: currentPos
    };
    this.line.push(this.lineIncrement);
    this.ctx.beginPath(); 
    this.ctx.moveTo(prevPos.xPos, prevPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
  }

  drawCircle(prevPos: Position, currentPos: Position, mouseDown: Boolean) {
  }

  // ##################################
  // Utility Tools
  // ##################################

  getPositionFromEvent(event: MouseEvent) {
    const rect: DOMRect = this.canvasEl.nativeElement.getBoundingClientRect()
    const canvasXPos = (event.clientX - rect.left) / rect.width * this.ctx.canvas.width
    const canvasYPos = (event.clientY - rect.top) / rect.height * this.ctx.canvas.height
    
    const position: Position = {
      xPos: canvasXPos, 
      yPos: canvasYPos
    };
    return position
  }

  togglePages(currentPageButton: HTMLButtonElement) {
    this.pageButtonList.forEach((pageButton: HTMLButtonElement) => {
      if (pageButton == currentPageButton) {
        pageButton.style.background = this.darkenColour;
      } else {
        pageButton.style.background = this.standardColour;
      }
    })
  }

  toggleCanvasTools(currentToolButton: HTMLButtonElement) {
    this.canvasButtonList.forEach((canvasButton: HTMLButtonElement) => {
      if (canvasButton == currentToolButton) {
        canvasButton.style.background = this.darkenColour;
      } else {
        canvasButton.style.background = this.standardColour;
      }
    })
  }

  intialiseVariables() {
    this.videoButton = document.getElementById("video-button") as HTMLButtonElement
    this.canvasButton = document.getElementById("canvas-button") as HTMLButtonElement
    this.instructionsButton = document.getElementById("instructions-button") as HTMLButtonElement
    this.feedbackButton = document.getElementById("feedback-button") as HTMLButtonElement

    this.brushButton = document.getElementById("brush-button") as HTMLButtonElement
    this.penButton = document.getElementById("pen-button") as HTMLButtonElement
    this.circleButton = document.getElementById("circle-button") as HTMLButtonElement
    this.eraserButton = document.getElementById("eraser-button") as HTMLButtonElement
    this.trashButton = document.getElementById("trash-button") as HTMLButtonElement
  }

  sleep(milliseconds: number) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

}
