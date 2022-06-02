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
import { firstValueFrom, lastValueFrom, throwError } from 'rxjs';
import { Snippet } from './models/Snippet.model';
import { Position } from './models/Position.model';
import { LineIncrement } from './models/LineIncrement.model';
import { LineStorage } from './models/LineStorage.model';
import { QuadCurve } from './models/QuadCurve.model';

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

  // Hide Page Bools
  videoBool!: boolean;
  canvasBool!: boolean;
  feedbackBool!: boolean;
  instructionsBool!: boolean;
  pageBoolList: Map<string, boolean> = new Map();
  canvasToolBoolList: Map<string, boolean> = new Map();

  // Hide Page Bools
  brushToolBool: boolean = true;
  penToolBool: boolean = false;
  circleToolBool: boolean = false;

  // Canvas Tool Bools
  isBrushPainting: boolean = false;
  isPenLinePainting: boolean = false;
  isPenLineDragging: boolean = false;

  // Position Variables
  startPos!: Position | null;
  prevPos!: Position; 
  currentPos!: Position;
  quadCurveEndPos!: Position;

  initCanvasBool: boolean = false; 
  standardColour: string = "rgba(13, 29, 207, 0.048)";
  darkenColour: string = "rgba(41, 169, 255, 0.473)";
  lineStorage!: any;
  lineIncrement!: LineIncrement;
  canvasLoadCounter: number = 0;
  endTime!: number;
  startTime!: number;
  loading: boolean = false;
  commentary!: string[]
  currentComment!: string;
  currentQuadCurve!: QuadCurve;

  constructor(
    private homeService: HomeService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {

    this.pageBoolList.set("video", true).set("canvas", false).set("feedback", false).set("instructions", false)
    this.canvasToolBoolList.set("brush", true).set("pen", false).set("circle", false)
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

  onMouseLeave() {
    if (this.isBrushPainting) {
      this.isBrushPainting = false;
    }
  }

  onMouseEnter() {
    if (this.isBrushPainting) {
      this.isBrushPainting = false;
    }
  }

  onMouseDown(event: any) {
    if (this.penToolBool) { 
      if (this.isPenLinePainting) {
        this.quadCurveEndPos = this.currentPos
        this.isPenLinePainting = false
        this.isPenLineDragging = true
      } 
      else if (this.isPenLineDragging) {
        this.isPenLineDragging = false
        this.lineStorage.black.quadCurve.push(this.currentQuadCurve)
      }
      else if (!this.isPenLinePainting && !this.isPenLineDragging) {
        this.startPos = this.getPositionFromEvent(event)
        this.currentPos = this.getPositionFromEvent(event)
        this.isPenLinePainting = true
      }
    }
    if (this.brushToolBool) {
      if (!this.isBrushPainting) {
        this.isBrushPainting = true;
        this.currentPos = this.getPositionFromEvent(event)
      }
    }
  }

  onMouseMove(event: any) {
    if (this.penToolBool) {
      if (this.isPenLinePainting) {
        this.currentPos = this.getPositionFromEvent(event)
        this.dragPenLine(this.startPos as Position, this.currentPos);
      }
      else if (this.isPenLineDragging) {
        this.currentPos = this.getPositionFromEvent(event)
        this.dragPenCurve(this.startPos as Position, this.currentPos, this.quadCurveEndPos)
      } 
    } 
    if (this.brushToolBool) {
      if (this.isBrushPainting) {
        this.prevPos = this.currentPos
        this.currentPos = this.getPositionFromEvent(event)
        this.drawBrushLine(this.prevPos, this.currentPos);
      }
      }
    if (this.circleToolBool) {
      this.drawCircle(this.startPos as Position, this.currentPos);
    }
  }

  onMouseUp() {
      if (this.isBrushPainting) {
        this.isBrushPainting = false;
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

  onTouchEnd(event: TouchEvent) {
    if (this.isBrushPainting) {
      this.isBrushPainting = false;
    }
    const touch = event.touches[0]
    this.onMouseUp()
  }

// ##################################
// Toggle Pages
// ##################################

  toggleCanvas() {
    this.togglePageBools("canvas");
    if (!this.initCanvasBool) {
      this.togglePageButtons(this.canvasButton);
      this.initCanvasVariables();
    } else {
      this.ctx.canvas.hidden = false;
    }
  }

  toggleInstructions() {
    if (!this.instructionsBool) {
      this.togglePageBools("instructions");
      this.togglePageButtons(this.instructionsButton);
      this.ctx.canvas.hidden = true;
    }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.togglePageBools("video");
      this.togglePageButtons(this.videoButton);
      this.ctx.canvas.hidden = true;
    };
  }

  toggleFeedback() {
    if (!this.feedbackBool) {
      this.togglePageBools("feedback");
      this.togglePageButtons(this.feedbackButton);
      this.ctx.canvas.hidden = true;
    }
  }

// ##################################
// Toggle Canvas Tools
// ##################################

  toggleBrushTool() {
    this.toggleCanvasToolButtons(this.brushButton);
    this.toggleCanvasToolBools("brush");
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
  }

  togglePenTool() {
    this.toggleCanvasToolButtons(this.penButton);
    this.toggleCanvasToolBools("pen");
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
  }

  toggleEraserTool() {
    this.toggleCanvasToolButtons(this.eraserButton);
    this.toggleCanvasToolBools("eraser");
    this.ctx.lineWidth = 25
    this.ctx.strokeStyle = "#FFFFFF";
  }

  toggleCircleTool() {
    this.toggleCanvasToolButtons(this.circleButton);
    this.toggleCanvasToolBools("circle");
  }

  toggleTrashTool() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
    for (let colourKey in this.lineStorage) {
      for (let lineTypeKey in this.lineStorage[colourKey]) {
        this.lineStorage[colourKey][lineTypeKey] = []
      }
    }
  }

  // ##################################
  // Drawing Tools
  // ##################################

  drawBrushLine(prevPos: Position, currentPos: Position) {
    this.lineIncrement = {
      startPos: prevPos,
      endPos: currentPos
    };
    this.lineStorage.black.line.push(this.lineIncrement)
    this.ctx.beginPath(); 
    this.ctx.moveTo(prevPos.xPos, prevPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
  }

  dragPenLine(startPos: Position, currentPos: Position) {
    this.clearAndRedraw();
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.xPos, startPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
  }

  dragPenCurve(startPos: Position, anglePos: Position, endPos: Position) {
    this.clearAndRedraw();
    this.ctx.beginPath();
    this.ctx.moveTo(startPos.xPos, startPos.yPos);
    this.ctx.quadraticCurveTo(anglePos.xPos, anglePos.yPos, endPos.xPos, endPos.yPos);
    this.ctx.stroke();
    this.currentQuadCurve = {startXPos: startPos.xPos, startYPos: startPos.yPos, angleXPos: anglePos.xPos, angleYPos: anglePos.yPos, endXPos: endPos.xPos, endYPos: endPos.yPos}

  }

  drawCircle(startPos: Position, currentPos: Position) {
  }

  clearAndRedraw() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
    this.redrawLines("black");
    this.redrawLines("white");
    this.redrawCurves("black");
  }

  redrawLines(colour: string) {
    this.ctx.strokeStyle = colour;
    const lineList: LineIncrement[] = this.lineStorage[colour]["line"]
    lineList.map((lineIncrement: LineIncrement) => {
      this.ctx.beginPath(); 
      this.ctx.moveTo(lineIncrement.startPos.xPos, lineIncrement.startPos.yPos);
      this.ctx.lineTo(lineIncrement.endPos.xPos, lineIncrement.endPos.yPos);
      this.ctx.stroke();
    })
    this.ctx.strokeStyle = "black";
  }

  redrawCurves(colour: string) {
    console.log(this.lineStorage);
    
    this.ctx.strokeStyle = colour;
    const lineList: QuadCurve[] = this.lineStorage[colour]["quadCurve"]
    lineList.map((quadCurve: QuadCurve) => {
      this.ctx.beginPath(); 
      this.ctx.moveTo(quadCurve.startXPos, quadCurve.startYPos);
      this.ctx.quadraticCurveTo(quadCurve.angleXPos, quadCurve.angleYPos, quadCurve.endXPos, quadCurve.endYPos);
      this.ctx.stroke();
    })
    this.ctx.strokeStyle = "black";
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

  togglePageButtons(currentPageButton: HTMLButtonElement) {
    this.pageButtonList.forEach((pageButton: HTMLButtonElement) => {
      if (pageButton == currentPageButton) {
        pageButton.style.background = this.darkenColour;
      } else {
        pageButton.style.background = this.standardColour;
      }
    })
  }

  togglePageBools(currentPageName: string) {
    this.pageBoolList.forEach((pageBool: boolean, pageName: string) => {
      if (pageName == currentPageName) {
        this.pageBoolList.set(pageName, true)
      } else {
        this.pageBoolList.set(pageName, false)
      }
    })
    this.initialisePageBools()
  }

  toggleCanvasToolButtons(currentToolButton: HTMLButtonElement) {
    this.canvasButtonList.forEach((canvasButton: HTMLButtonElement) => {
      if (canvasButton == currentToolButton) {
        canvasButton.style.background = this.darkenColour;
      } else {
        canvasButton.style.background = this.standardColour;
      }
    })
  }

  toggleCanvasToolBools(currentToolName: string) {
    this.canvasToolBoolList.forEach((toolBool: boolean, toolName: string) => {
      if (toolName == currentToolName) {
        this.canvasToolBoolList.set(toolName, true)
      } else {
        this.canvasToolBoolList.set(toolName, false)
      }
    })
    this.initialiseCanvasToolBools()
  }

  initialiseCanvasToolBools() {
    this.brushToolBool = this.canvasToolBoolList.get("brush") as boolean;
    this.penToolBool = this.canvasToolBoolList.get("pen") as boolean;
    this.circleToolBool = this.canvasToolBoolList.get("circle") as boolean;
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

    this.initialisePageBools()
    this.lineStorage = {
      "black": {"line": [], "quadCurve": []},
      "white": {"line": []},
    }
  }
  
  initialisePageBools() {
    this.videoBool = this.pageBoolList.get("video") as boolean;
    this.canvasBool = this.pageBoolList.get("canvas") as boolean;
    this.feedbackBool = this.pageBoolList.get("feedback") as boolean;
    this.instructionsBool = this.pageBoolList.get("instructions") as boolean;
  }

  initCanvasVariables() {
    this.initCanvasBool = true;
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
