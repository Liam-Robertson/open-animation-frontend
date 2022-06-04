import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faImages } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { UploadPopupComponent } from './upload-popup/upload-popup.component';
import { lastValueFrom } from 'rxjs';
import { Snippet } from './models/Snippet.model';
import { Position } from './models/Position.model';
import { BrushLine } from './models/BrushLine.model';
import { QuadCurve } from './models/QuadCurve.model';
import { Oval } from './models/Oval.model';
import { EraserLine } from './models/EraserLine.model';
import { LineIncrement } from './models/LineIncrement.model';
import { ThisReceiver } from '@angular/compiler';
import { RefImage } from './models/RefImage.model';

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
  faUndo = faArrowRotateLeft;
  faImages = faImages;
  faMove = faArrowsUpDownLeftRight;

  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasRefImage') canvasRefImage!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  imageCtx!: CanvasRenderingContext2D;

  // Page buttons
  videoButton!: HTMLButtonElement;
  canvasButton!: HTMLButtonElement;
  instructionsButton!: HTMLButtonElement;
  feedbackButton!: HTMLButtonElement;
  pageButtonList: HTMLButtonElement[] = []

  // Canvas tool buttons
  moveButton!: HTMLButtonElement;
  brushButton!: HTMLButtonElement;
  penButton!: HTMLButtonElement;
  ovalButton!: HTMLButtonElement;
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
  moveToolBool: boolean = true;
  brushToolBool: boolean = false;
  eraserToolBool: boolean = false;
  penToolBool: boolean = false;
  ovalToolBool: boolean = false;

  // Canvas Tool Bools
  isBrushPainting: boolean = false;
  isPenLinePainting: boolean = false;
  isPenLineDragging: boolean = false;
  isEraserPainting: boolean = false
  isOvalPainting: boolean = false;
  isMoveDragging: boolean = false;

  // Position Variables
  startPos!: Position | null;
  prevPos!: Position; 
  currentPos!: Position;
  quadCurveEndPos!: Position;

  // Current Line Variables
  currentBrushLine!: BrushLine;
  currentEraserLine!: EraserLine;
  currentQuadCurve!: QuadCurve;
  currentOval!: Oval;
  currentBrushLineIncrement!: LineIncrement;
  currentEraserLineIncrement!: LineIncrement;

  initCanvasBool: boolean = false; 
  standardColour: string = "rgba(13, 29, 207, 0.048)";
  darkenColour: string = "rgba(41, 169, 255, 0.473)";
  lineStorage: any[] = [];
  canvasLoadCounter: number = 0;
  endTime!: number;
  startTime!: number;
  loading: boolean = false;
  commentary!: string[]
  currentComment!: string;
  fileList: File[] = [];
  currentFile!: File;
  refImage!: HTMLImageElement;
  refImagePos: RefImage = {startXPos: 0, endXPos: 0, startYPos: 0, endYPos: 0, height: 0, width: 0}
  mousePosRelativeToImage!: Position;

  constructor(
    private homeService: HomeService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.pageBoolList.set("video", true).set("canvas", false).set("feedback", false).set("instructions", false)
    this.canvasToolBoolList.set("move", true).set("brush", false).set("pen", false).set("eraser", false).set("oval", false)
    this.intialiseVariables()
    this.pageButtonList = [this.videoButton, this.canvasButton, this.instructionsButton, this.feedbackButton]
    this.canvasButtonList = [this.moveButton, this.brushButton, this.penButton, this.ovalButton, this.eraserButton, this.trashButton]
    this.videoButton.style.background =  this.darkenColour;

    this.commentary = (await lastValueFrom(this.homeService.getAllComments())).map(row => row.comment).reverse();

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
    if (this.moveToolBool) {
      this.currentPos = this.getPositionFromEvent(event)
      const inRefImageXPosCheck = (this.currentPos.xPos > this.refImagePos.startXPos) && (this.currentPos.xPos < this.refImagePos.endXPos)
      const inRefImageYPosCheck = (this.currentPos.yPos > this.refImagePos.startYPos) && (this.currentPos.yPos < this.refImagePos.endYPos)
      if (!this.isMoveDragging && inRefImageXPosCheck && inRefImageYPosCheck) {
        this.mousePosRelativeToImage = {xPos: this.currentPos.xPos - this.refImagePos.startXPos, yPos: this.currentPos.yPos - this.refImagePos.startYPos}
        this.isMoveDragging = true;
      }
    }
    if (this.brushToolBool) {
      if (!this.isBrushPainting) {
        this.isBrushPainting = true;
        this.currentPos = this.getPositionFromEvent(event)
        this.currentBrushLine = {name: "brushLine", lineIncrementList: []}
      }
    }
    if (this.eraserToolBool) {
      if (!this.isEraserPainting) {
        this.isEraserPainting = true;
        this.currentPos = this.getPositionFromEvent(event)
        this.ctx.lineWidth = 25
        this.ctx.strokeStyle = "#FFFFFF";
        this.currentEraserLine = {name: "eraserLine", lineIncrementList: []}
      }
    }
    if (this.penToolBool) { 
      if (this.isPenLinePainting) {
        this.quadCurveEndPos = this.currentPos
        this.isPenLinePainting = false
        this.isPenLineDragging = true
      } 
      else if (this.isPenLineDragging) {
        this.isPenLineDragging = false
        this.lineStorage.push(this.currentQuadCurve)
      }
      else if (!this.isPenLinePainting && !this.isPenLineDragging) {
        this.startPos = this.getPositionFromEvent(event)
        this.currentPos = this.getPositionFromEvent(event)
        this.isPenLinePainting = true
      }
    }
    if (this.ovalToolBool) {
      if (!this.isOvalPainting) {
        this.isOvalPainting = true;
        this.startPos = this.getPositionFromEvent(event)
        this.currentPos = this.getPositionFromEvent(event)
      } else if (this.isOvalPainting) {
        this.lineStorage.push(this.currentOval)
        this.isOvalPainting = false
      }
    }
  }

  onMouseMove(event: any) {
    if (this.moveToolBool) {
      if (this.isMoveDragging) {
        this.currentPos = this.getPositionFromEvent(event)
        this.dragRefImage(this.currentPos);
      }
    }
    if (this.brushToolBool) {
      if (this.isBrushPainting) {
        this.prevPos = this.currentPos
        this.currentPos = this.getPositionFromEvent(event)
        this.drawBrushLineIncrement(this.prevPos, this.currentPos);
      }
    } 
    if (this.eraserToolBool) {
      if (this.isEraserPainting) {
        this.prevPos = this.currentPos
        this.currentPos = this.getPositionFromEvent(event)
        this.drawEraserLineIncrement(this.prevPos, this.currentPos);
      }
    }
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
    if (this.ovalToolBool) {
      if (this.isOvalPainting) {
        this.drawOval(this.startPos as Position, this.currentPos);
        this.currentPos = this.getPositionFromEvent(event)
      }
    }
  }

  onMouseUp() {
    if (this.isMoveDragging) {
      this.isMoveDragging = false;
    }
    if (this.isBrushPainting) {
      this.isBrushPainting = false;
      this.currentBrushLine.name = "brushLine"
      this.lineStorage.push(this.currentBrushLine)
    }
    if (this.isEraserPainting) {
      this.isEraserPainting = false;
      this.currentEraserLine.name = "eraserLine"
      this.lineStorage.push(this.currentEraserLine)
      this.ctx.lineWidth = 5
      this.ctx.strokeStyle = "#000000";
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
      this.initCanvasVariables();
      this.togglePageBools("canvas");
      this.togglePageButtons(this.canvasButton);
    } else {
      this.ctx.canvas.hidden = false;
      this.imageCtx.canvas.hidden = false;
    }
  }

  toggleInstructions() {
    if (!this.instructionsBool) {
      this.togglePageBools("instructions");
      this.togglePageButtons(this.instructionsButton);
      this.ctx.canvas.hidden = true;
      this.imageCtx.canvas.hidden = true;
    }
  }

  toggleVideoPlayer() {
    if (!this.videoBool) {
      this.togglePageBools("video");
      this.togglePageButtons(this.videoButton);
      this.ctx.canvas.hidden = true;
      this.imageCtx.canvas.hidden = true;
    };
  }

  toggleFeedback() {
    if (!this.feedbackBool) {
      this.togglePageBools("feedback");
      this.togglePageButtons(this.feedbackButton);
      this.ctx.canvas.hidden = true;
      this.imageCtx.canvas.hidden = true;
    }
  }

// ##################################
// Toggle Canvas Tools
// ##################################
  
  toggleMoveTool() {
    this.toggleCanvasToolButtons(this.moveButton);
    this.toggleCanvasToolBools("move");
  }

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
  }

  toggleOvalTool() {
    this.toggleCanvasToolButtons(this.ovalButton);
    this.toggleCanvasToolBools("oval");
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

  toggleUndoTool() {
    this.lineStorage.pop()
    this.clearAndRedraw()
  }

  toggleReferenceTool() {
    let input = document.createElement('input');
    input.type = 'file';
    this.refImage = new Image();
    input.onchange = _this => {
      this.currentFile = (input.files as FileList)[0]
      this.refImage.onload = () => {
          this.imageCtx.drawImage(this.refImage, 0, 0);
          this.refImagePos = {startXPos: 0, endXPos: this.refImage.width, startYPos: 0, endYPos: this.refImage.height, height: this.refImage.height, width: this.refImage.width}
        }
      this.refImage.src = URL.createObjectURL(this.currentFile);
    };
    input.click();
  }

  // ##################################
  // Drawing Tools
  // ##################################

  drawBrushLineIncrement(prevPos: Position, currentPos: Position) {
    this.currentBrushLineIncrement = {
      startPos: prevPos,
      endPos: currentPos
    };
    this.currentBrushLine.lineIncrementList.push(this.currentBrushLineIncrement)
    this.ctx.beginPath(); 
    this.ctx.moveTo(prevPos.xPos, prevPos.yPos);
    this.ctx.lineTo(currentPos.xPos, currentPos.yPos);
    this.ctx.stroke();
  }

  drawEraserLineIncrement(prevPos: Position, currentPos: Position) {
    this.currentEraserLineIncrement = {
      startPos: prevPos,
      endPos: currentPos
    };
    this.currentEraserLine.lineIncrementList.push(this.currentEraserLineIncrement)
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
    this.currentQuadCurve = {name: "penLine", startXPos: startPos.xPos, startYPos: startPos.yPos, angleXPos: anglePos.xPos, angleYPos: anglePos.yPos, endXPos: endPos.xPos, endYPos: endPos.yPos}
  }

  drawOval(startPos: Position, currentPos: Position) {
    this.clearAndRedraw()
    let xCenter
    let yCenter
    const xRadius = Math.abs((currentPos.xPos - startPos.xPos) / 2)
    const yRadius = Math.abs((currentPos.yPos - startPos.yPos) / 2)

    if ((currentPos.xPos - startPos.xPos) > 0) {
      xCenter = startPos.xPos + xRadius
    } else {
      xCenter = startPos.xPos - xRadius
    }
    if ((currentPos.yPos - startPos.yPos) > 0) {
      yCenter = startPos.yPos + yRadius
    } else {
      yCenter = startPos.yPos - yRadius
    }

    this.currentOval = {name: "oval", xCenter: xCenter, yCenter: yCenter, xRadius: xRadius, yRadius: yRadius}
    this.ctx.beginPath();
    this.ctx.ellipse(xCenter, yCenter, xRadius, yRadius, 0, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  dragRefImage(currentPos: Position) {
    const imageTopLeft: Position = {xPos: currentPos.xPos - this.mousePosRelativeToImage.xPos, yPos: currentPos.yPos - this.mousePosRelativeToImage.yPos}
    const imageHeight = this.refImagePos.height
    const imageWidth = this.refImagePos.width
    this.imageCtx.fillStyle = 'white';
    this.imageCtx.fillRect(0, 0, this.imageCtx.canvas.width,  this.imageCtx.canvas.height);
    this.imageCtx.drawImage(this.refImage, imageTopLeft.xPos, imageTopLeft.yPos);
    this.refImagePos = {startXPos: imageTopLeft.xPos, endXPos: imageTopLeft.xPos + imageWidth, startYPos: imageTopLeft.yPos, endYPos: imageTopLeft.yPos + imageHeight, height: imageHeight, width: imageWidth}
  }

  clearAndRedraw() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
    this.lineStorage.map((currentShape: any) => {
      switch (currentShape.name) {
        case "brushLine":
          this.redrawBrushLine(currentShape);
          break;
        case "eraserLine":
          this.redrawEraserLine(currentShape);
          break;
        case "penLine":
          this.redrawPenLine(currentShape);
          break;
        case "oval":
          this.redrawOval(currentShape);
      }
    })
  }

  redrawBrushLine(brushLine: BrushLine) {
    brushLine.lineIncrementList.map((lineIncrement: LineIncrement) => {
      this.ctx.beginPath(); 
      this.ctx.moveTo(lineIncrement.startPos.xPos, lineIncrement.startPos.yPos);
      this.ctx.lineTo(lineIncrement.endPos.xPos, lineIncrement.endPos.yPos);
      this.ctx.stroke();
    })
  }

  redrawEraserLine(eraserLine: EraserLine) {
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 25
    eraserLine.lineIncrementList.map((lineIncrement: LineIncrement) => {
      this.ctx.beginPath(); 
      this.ctx.moveTo(lineIncrement.startPos.xPos, lineIncrement.startPos.yPos);
      this.ctx.lineTo(lineIncrement.endPos.xPos, lineIncrement.endPos.yPos);
      this.ctx.stroke();
    })
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "black";
  }

  redrawPenLine(quadCurve: QuadCurve) {
    this.ctx.beginPath(); 
    this.ctx.moveTo(quadCurve.startXPos, quadCurve.startYPos);
    this.ctx.quadraticCurveTo(quadCurve.angleXPos, quadCurve.angleYPos, quadCurve.endXPos, quadCurve.endYPos);
    this.ctx.stroke();
  }

  redrawOval(oval: Oval) {
    this.ctx.beginPath();
    this.ctx.ellipse(oval.xCenter, oval.yCenter, oval.xRadius, oval.yRadius, 0, 0, 2 * Math.PI);
    this.ctx.stroke();
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
    this.moveToolBool = this.canvasToolBoolList.get("move") as boolean;
    this.brushToolBool = this.canvasToolBoolList.get("brush") as boolean;
    this.penToolBool = this.canvasToolBoolList.get("pen") as boolean;
    this.eraserToolBool = this.canvasToolBoolList.get("eraser") as boolean;
    this.ovalToolBool = this.canvasToolBoolList.get("oval") as boolean;
  }

  intialiseVariables() {
    this.videoButton = document.getElementById("video-button") as HTMLButtonElement
    this.canvasButton = document.getElementById("canvas-button") as HTMLButtonElement
    this.instructionsButton = document.getElementById("instructions-button") as HTMLButtonElement
    this.feedbackButton = document.getElementById("feedback-button") as HTMLButtonElement

    this.moveButton = document.getElementById("move-button") as HTMLButtonElement
    this.brushButton = document.getElementById("brush-button") as HTMLButtonElement
    this.penButton = document.getElementById("pen-button") as HTMLButtonElement
    this.ovalButton = document.getElementById("oval-button") as HTMLButtonElement
    this.eraserButton = document.getElementById("eraser-button") as HTMLButtonElement
    this.trashButton = document.getElementById("trash-button") as HTMLButtonElement

    this.initialisePageBools()
  }
  
  initialisePageBools() {
    this.videoBool = this.pageBoolList.get("video") as boolean;
    this.canvasBool = this.pageBoolList.get("canvas") as boolean;
    this.feedbackBool = this.pageBoolList.get("feedback") as boolean;
    this.instructionsBool = this.pageBoolList.get("instructions") as boolean;
  }

  initCanvasVariables() {
    this.initCanvasBool = true;
    this.toggleCanvasToolBools("move");
    this.toggleCanvasToolButtons(this.moveButton);
    this.ctx = this.canvasEl.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.imageCtx = this.canvasRefImage.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    const containerWidth = document.getElementById("app-container")?.getBoundingClientRect().width
    const containerHeight = document.getElementById("app-container")?.getBoundingClientRect().height
    this.canvasEl.nativeElement.width = containerWidth as number;
    this.canvasEl.nativeElement.height = containerHeight as number;
    this.canvasRefImage.nativeElement.width = containerWidth as number;
    this.canvasRefImage.nativeElement.height = containerHeight as number;
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
