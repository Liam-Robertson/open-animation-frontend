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
import { RefImagePos } from './models/RefImagePos.model';
import { ImageCorners, Rectangle } from './models/ImageCorners.model';

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
  imageCtx!: CanvasRenderingContext2D;
  ctx!: CanvasRenderingContext2D;

  // Page buttons
  videoButton!: HTMLButtonElement;
  canvasButton!: HTMLButtonElement;
  instructionsButton!: HTMLButtonElement;
  feedbackButton!: HTMLButtonElement;

  // Canvas tool buttons
  moveButton!: HTMLButtonElement;
  brushButton!: HTMLButtonElement;
  penButton!: HTMLButtonElement;
  ovalButton!: HTMLButtonElement;
  eraserButton!: HTMLButtonElement;
  trashButton!: HTMLButtonElement;

  // Hide Page Bools
  videoBool!: boolean;
  canvasBool!: boolean;
  feedbackBool!: boolean;
  instructionsBool!: boolean;
  pageList: Map<string, {"bool": boolean, "button": HTMLButtonElement}> = new Map();
  canvasToolList: Map<string, {"bool": boolean, "button": HTMLButtonElement}> = new Map();

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
  refImagePos: RefImagePos = {startXPos: 0, endXPos: 0, startYPos: 0, endYPos: 0, centerX: 0, centerY: 0, height: 0, width: 0}
  mousePosRelativeToImage!: Position;
  inRefImageCheck!: boolean;
  setEraser!: () => string;
  removeEraser!: () => string;
  activeCornersList: RefImagePos[] = [];
  cornerHeightWidthEm: number = 0.175;
  imageCorners: ImageCorners = {topLeft: {startXPos: 0, endXPos: 0, xCenter: 0, startYPos: 0, endYPos: 0, yCenter: 0}, topRight: {startXPos: 0, endXPos: 0, xCenter: 0, startYPos: 0, endYPos: 0, yCenter: 0}, bottomLeft: {startXPos: 0, endXPos: 0, xCenter: 0, startYPos: 0, endYPos: 0, yCenter: 0}, bottomRight: {startXPos: 0, endXPos: 0, xCenter: 0, startYPos: 0, endYPos: 0, yCenter: 0}}
  cornerRadius!: number;
  nwMouseCheck!: boolean;
  isImageSelected!: boolean;
  neMouseCheck!: boolean;
  seMouseCheck!: boolean;
  swMouseCheck!: boolean;
  resizingRefImage!: boolean;
  inCornerCheck!: boolean;
  startResizingImagePos!: RefImagePos;

  constructor(
    private homeService: HomeService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.intialiseVariables()
    this.pageList.set("video", {"bool": this.videoBool, "button": this.videoButton}).set("canvas", {"bool": this.canvasBool, "button": this.canvasButton}).set("feedback", {"bool": this.feedbackBool, "button": this.feedbackButton}).set("instructions", {"bool": this.instructionsBool, "button": this.instructionsButton})
    this.canvasToolList.set("move", {"bool": this.moveToolBool, "button": this.moveButton}).set("brush", {"bool": this.brushToolBool, "button": this.brushButton}).set("pen", {"bool": this.penToolBool, "button": this.penButton}).set("eraser", {"bool": this.eraserToolBool, "button": this.eraserButton}).set("oval", {"bool": this.ovalToolBool, "button": this.ovalButton})
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
    this.ctx.fillStyle = "white";
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
      this.inRefImageCheck = (this.currentPos.xPos > this.refImagePos.startXPos) && (this.currentPos.xPos < this.refImagePos.endXPos) && (this.currentPos.yPos > this.refImagePos.startYPos) && (this.currentPos.yPos < this.refImagePos.endYPos)
      this.nwMouseCheck = (this.currentPos.xPos > this.imageCorners.topLeft.startXPos) && (this.currentPos.xPos < this.imageCorners.topLeft.endXPos) && (this.currentPos.yPos > this.imageCorners.topLeft.startYPos) && (this.currentPos.yPos < this.imageCorners.topLeft.endYPos)
      this.neMouseCheck = (this.currentPos.xPos > this.imageCorners.topRight.startXPos) && (this.currentPos.xPos < this.imageCorners.topRight.endXPos) && (this.currentPos.yPos > this.imageCorners.topRight.startYPos) && (this.currentPos.yPos < this.imageCorners.topRight.endYPos)
      this.seMouseCheck = (this.currentPos.xPos > this.imageCorners.bottomRight.startXPos) && (this.currentPos.xPos < this.imageCorners.bottomRight.endXPos) && (this.currentPos.yPos > this.imageCorners.bottomRight.startYPos) && (this.currentPos.yPos < this.imageCorners.bottomRight.endYPos)
      this.swMouseCheck = (this.currentPos.xPos > this.imageCorners.bottomLeft.startXPos) && (this.currentPos.xPos < this.imageCorners.bottomLeft.endXPos) && (this.currentPos.yPos > this.imageCorners.bottomLeft.startYPos) && (this.currentPos.yPos < this.imageCorners.bottomLeft.endYPos)
      this.inCornerCheck = this.nwMouseCheck || this.neMouseCheck || this.seMouseCheck || this.swMouseCheck
      
      if (this.inRefImageCheck && !this.inCornerCheck) {
        this.isMoveDragging = true;
        this.mousePosRelativeToImage = {xPos: this.currentPos.xPos - this.refImagePos.startXPos, yPos: this.currentPos.yPos - this.refImagePos.startYPos};
        (document.getElementById("corner-0") as HTMLElement).hidden = false;
        this.cornerRadius = (document.getElementById("corner-0")?.offsetHeight as number) / 2
        this.activateCornerSquares(this.refImagePos)
      }
      if (this.inCornerCheck) {
        this.activateCornerSquares(this.refImagePos)
        this.resizingRefImage = true;
        this.startResizingImagePos = JSON.parse(JSON.stringify(this.refImagePos));
      }
      if (this.inRefImageCheck || this.inCornerCheck) {
        this.isImageSelected = true;
      } else {
        this.isImageSelected = false;
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
        this.setEraser()
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
      this.currentPos = this.getPositionFromEvent(event)
      this.inRefImageCheck = (this.currentPos.xPos > this.refImagePos.startXPos) && (this.currentPos.xPos < this.refImagePos.endXPos) && (this.currentPos.yPos > this.refImagePos.startYPos) && (this.currentPos.yPos < this.refImagePos.endYPos)
      this.nwMouseCheck = (this.currentPos.xPos > this.imageCorners.topLeft.startXPos) && (this.currentPos.xPos < this.imageCorners.topLeft.endXPos) && (this.currentPos.yPos > this.imageCorners.topLeft.startYPos) && (this.currentPos.yPos < this.imageCorners.topLeft.endYPos)
      this.neMouseCheck = (this.currentPos.xPos > this.imageCorners.topRight.startXPos) && (this.currentPos.xPos < this.imageCorners.topRight.endXPos) && (this.currentPos.yPos > this.imageCorners.topRight.startYPos) && (this.currentPos.yPos < this.imageCorners.topRight.endYPos)
      this.seMouseCheck = (this.currentPos.xPos > this.imageCorners.bottomRight.startXPos) && (this.currentPos.xPos < this.imageCorners.bottomRight.endXPos) && (this.currentPos.yPos > this.imageCorners.bottomRight.startYPos) && (this.currentPos.yPos < this.imageCorners.bottomRight.endYPos)
      this.swMouseCheck = (this.currentPos.xPos > this.imageCorners.bottomLeft.startXPos) && (this.currentPos.xPos < this.imageCorners.bottomLeft.endXPos) && (this.currentPos.yPos > this.imageCorners.bottomLeft.startYPos) && (this.currentPos.yPos < this.imageCorners.bottomLeft.endYPos)
      
      if (this.isMoveDragging) {
        this.dragRefImage(this.currentPos, this.mousePosRelativeToImage, this.refImagePos);
        this.initCornerSquares(this.refImagePos)
      } 
      if (this.resizingRefImage) {
        this.isImageSelected = true;
        this.resizeRefImage(this.currentPos, this.refImage, this.startResizingImagePos, this.refImagePos)
        this.initCornerSquares(this.refImagePos)
      }
      if (this.inRefImageCheck) {
        this.canvasEl.nativeElement.style.cursor = "pointer"
      } else {
        this.canvasEl.nativeElement.style.cursor = "auto"
      }
      if (this.nwMouseCheck) {
        this.canvasEl.nativeElement.style.cursor = "nw-resize"
      }
      if (this.neMouseCheck) {
        this.canvasEl.nativeElement.style.cursor = "ne-resize"
      }
      if (this.seMouseCheck) {
        this.canvasEl.nativeElement.style.cursor = "se-resize"
      }
      if (this.swMouseCheck) {
        this.canvasEl.nativeElement.style.cursor = "sw-resize"
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
    if (this.resizingRefImage) {
      this.resizingRefImage = false;
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
      this.removeEraser()
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
// Toggle Utilities
// ##################################

  togglePage(currentPage: string) {
    this.pageList.forEach((pageValues: {bool: boolean, button: HTMLButtonElement}, pageName: string) => {
      if (pageName == currentPage) {        
        (this.pageList.get(pageName) as {bool: boolean, button: HTMLButtonElement}).bool = true;
        (this.pageList.get(pageName) as {bool: boolean, button: HTMLButtonElement}).button.style.background = this.darkenColour;
      } else {
        (this.pageList.get(pageName) as {bool: boolean, button: HTMLButtonElement}).bool = false;
        (this.pageList.get(pageName) as {bool: boolean, button: HTMLButtonElement}).button.style.background = this.standardColour;
      }
    })
    if (this.isImageSelected && currentPage != "canvas") {this.isImageSelected = false}

    this.videoBool = this.pageList.get("video")?.bool as boolean;
    this.canvasBool = this.pageList.get("canvas")?.bool as boolean;
    this.feedbackBool = this.pageList.get("feedback")?.bool as boolean;
    this.instructionsBool = this.pageList.get("instructions")?.bool as boolean;

    if (!this.initCanvasBool && currentPage == "canvas") {
      this.initCanvasVariables();
    } else if (this.initCanvasBool && currentPage != "canvas") {
      this.ctx.canvas.hidden = true;
      this.imageCtx.canvas.hidden = true;
    } else if (this.initCanvasBool && currentPage == "canvas") {
      this.ctx.canvas.hidden = false;
      this.imageCtx.canvas.hidden = false;
    }
  }

  toggleCanvasTool(currentToolName: string) {
    this.canvasToolList.forEach((toolValues: {bool: boolean, button: HTMLButtonElement}, toolName: string) => {
      if (toolName == currentToolName) {
        (this.canvasToolList.get(toolName) as {bool: boolean, button: HTMLButtonElement}).bool = true;
        (this.canvasToolList.get(toolName) as {bool: boolean, button: HTMLButtonElement}).button.style.background = this.darkenColour;
      } else {
        (this.canvasToolList.get(toolName) as {bool: boolean, button: HTMLButtonElement}).bool = false;
        (this.canvasToolList.get(toolName) as {bool: boolean, button: HTMLButtonElement}).button.style.background = this.standardColour;
      }
    })

    if (currentToolName == "move") {this.canvasEl.nativeElement.style.cursor = "pointer"} else {this.canvasEl.nativeElement.style.cursor = "crosshair"}
    if (!this.isImageSelected && currentToolName != "move") {this.isImageSelected = false;}
    this.initialiseCanvasToolBools()
  }
  
  toggleMoveTool() {
    this.toggleCanvasTool("move");
  }

  toggleBrushTool() {
    this.toggleCanvasTool("brush");
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
  }

  togglePenTool() {
    this.toggleCanvasTool("pen");
    this.ctx.lineWidth = 5
    this.ctx.strokeStyle = "#000000";
  }

  toggleEraserTool() {
    this.toggleCanvasTool("eraser");
  }

  toggleOvalTool() {
    this.toggleCanvasTool("oval");
  }

  toggleTrashTool() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
    this.lineStorage = []
  }

  toggleUndoTool() {
    this.lineStorage.pop()
    this.clearAndRedraw()
  }

  toggleReferenceTool() {
    let input = document.createElement('input');
    input.type = 'file';
    this.refImage = document.createElement("img");
    this.refImage.setAttribute("id", "ref-image");
    input.onchange = _this => {
      this.currentFile = (input.files as FileList)[0]
      this.refImage.onload = () => {
          this.imageCtx.drawImage(this.refImage, 0, 0);
          this.refImagePos = {startXPos: 0, endXPos: this.refImage.width, startYPos: 0, endYPos: this.refImage.height, centerX: (this.refImage.width / 2), centerY: (this.refImage.height / 2), height: this.refImage.height, width: this.refImage.width}
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
    const penLineIncrement: LineIncrement[] = [{startPos: startPos, endPos: currentPos}]
    const penLine: BrushLine = {name: "brushLine", lineIncrementList: penLineIncrement}
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

  clearAndRedraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
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
    if (this.currentFile != null) {
      this.imageCtx.drawImage(this.refImage, this.refImagePos.startXPos, this.refImagePos.startYPos);
    }
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

  activateCornerSquares(refImagePos: RefImagePos) {
    for (let i = 0; i < 4; i++) {
      this.activeCornersList.push(refImagePos)
    }
    this.initCornerSquares(refImagePos)
  }
  
  dragRefImage(currentPos: Position, mousePosRelativeToImage: Position, refImagePos: RefImagePos) {
    const imageTopLeft: Position = {xPos: currentPos.xPos - mousePosRelativeToImage.xPos, yPos: currentPos.yPos - mousePosRelativeToImage.yPos}
    const imageHeight = refImagePos.height
    const imageWidth = refImagePos.width
    const imageCenter: Position = {xPos: imageTopLeft.xPos + (imageWidth / 2), yPos: imageTopLeft.yPos + (imageHeight / 2)}
    this.imageCtx.clearRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
    this.imageCtx.drawImage(this.refImage, imageTopLeft.xPos, imageTopLeft.yPos, this.refImagePos.width, this.refImagePos.height);
    this.refImagePos = {startXPos: imageTopLeft.xPos, endXPos: imageTopLeft.xPos + imageWidth, startYPos: imageTopLeft.yPos, endYPos: imageTopLeft.yPos + imageHeight, centerX: imageCenter.xPos, centerY: imageCenter.yPos, height: imageHeight, width: imageWidth}
  }

  resizeRefImage(currentPos: Position, refImage: HTMLImageElement, startResizingImagePos: RefImagePos, refImagePos: RefImagePos) {
      const distanceInitialImageCenterToCorner = ((startResizingImagePos.width / 2) ** 2 + (startResizingImagePos.height / 2) ** 2) ** 0.5
      const distanceImageCenterToCursor = (((currentPos.xPos - startResizingImagePos.centerX) ** 2 + (currentPos.yPos - startResizingImagePos.centerY) ** 2) ** 0.5)
      const scale = distanceImageCenterToCursor / distanceInitialImageCenterToCorner
      
      this.refImagePos.height = startResizingImagePos.height * scale
      this.refImagePos.width = startResizingImagePos.width * scale
      this.refImagePos.startXPos = (startResizingImagePos.startXPos) - ((refImagePos.width - startResizingImagePos.width) / 2)
      this.refImagePos.endXPos = (refImagePos.startXPos) + (refImagePos.width)
      this.refImagePos.startYPos = startResizingImagePos.startYPos - ((refImagePos.height - startResizingImagePos.height) / 2)
      this.refImagePos.endYPos = (refImagePos.startYPos) + (refImagePos.height)
      this.refImagePos.centerX = (refImagePos.startXPos) + (refImagePos.width / 2)
      this.refImagePos.centerY = (refImagePos.startYPos) + (refImagePos.height / 2)

      this.imageCtx.clearRect(0, 0, this.ctx.canvas.width,  this.ctx.canvas.height);
      this.imageCtx.drawImage(refImage, this.refImagePos.startXPos, this.refImagePos.startYPos, this.refImagePos.width, this.refImagePos.height);      
  }

  initCornerSquares(refImagePos: RefImagePos) {
    this.imageCorners.topLeft.startXPos = (refImagePos.startXPos - this.cornerRadius);
    this.imageCorners.topLeft.endXPos = (refImagePos.startXPos + this.cornerRadius);
    this.imageCorners.topLeft.xCenter = refImagePos.startXPos;
    this.imageCorners.topLeft.startYPos = (refImagePos.startYPos - this.cornerRadius);
    this.imageCorners.topLeft.endYPos = (refImagePos.startYPos + this.cornerRadius);
    this.imageCorners.topLeft.yCenter = refImagePos.startYPos;
    this.imageCorners.topRight.startXPos = (refImagePos.endXPos - this.cornerRadius);
    this.imageCorners.topRight.endXPos = (refImagePos.endXPos + this.cornerRadius);
    this.imageCorners.topRight.xCenter = refImagePos.endXPos;
    this.imageCorners.topRight.startYPos = (refImagePos.startYPos - this.cornerRadius);
    this.imageCorners.topRight.endYPos = (refImagePos.startYPos + this.cornerRadius);
    this.imageCorners.topRight.yCenter = refImagePos.startYPos;
    this.imageCorners.bottomLeft.startXPos = (refImagePos.startXPos - this.cornerRadius);
    this.imageCorners.bottomLeft.endXPos = (refImagePos.startXPos + this.cornerRadius);
    this.imageCorners.bottomLeft.xCenter = refImagePos.startXPos;
    this.imageCorners.bottomLeft.startYPos = (refImagePos.endYPos - this.cornerRadius);
    this.imageCorners.bottomLeft.endYPos = (refImagePos.endYPos + this.cornerRadius);
    this.imageCorners.bottomLeft.yCenter = refImagePos.endYPos;
    this.imageCorners.bottomRight.startXPos = (refImagePos.endXPos - this.cornerRadius);
    this.imageCorners.bottomRight.endXPos = (refImagePos.endXPos + this.cornerRadius);
    this.imageCorners.bottomRight.xCenter = refImagePos.endXPos;
    this.imageCorners.bottomRight.startYPos = (refImagePos.endYPos - this.cornerRadius);
    this.imageCorners.bottomRight.endYPos = (refImagePos.endYPos + this.cornerRadius);
    this.imageCorners.bottomRight.yCenter = refImagePos.endYPos;
  }

  initialiseCanvasToolBools() {
    this.moveToolBool = this.canvasToolList.get("move")?.bool as boolean;
    this.brushToolBool = this.canvasToolList.get("brush")?.bool as boolean;
    this.penToolBool = this.canvasToolList.get("pen")?.bool as boolean;
    this.eraserToolBool = this.canvasToolList.get("eraser")?.bool as boolean;
    this.ovalToolBool = this.canvasToolList.get("oval")?.bool as boolean;
  }

  intialiseVariables() {
    this.initialisePageBools()
    this.initialiseButtons()
  }
  
  initialisePageBools() {
    this.videoBool = true;
    this.canvasBool = false;
    this.feedbackBool = false;
    this.instructionsBool = false;
  }
  
  initialiseButtons() {
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
  }

  initCanvasVariables() {
    this.initCanvasBool = true;
    this.toggleCanvasTool("move");
    this.ctx = this.canvasEl.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.imageCtx = this.canvasRefImage.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.setEraser = () => this.ctx.globalCompositeOperation = 'destination-out'
    this.removeEraser = () => this.ctx.globalCompositeOperation = 'source-over'
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
