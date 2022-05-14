import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Subscription } from 'rxjs';
import { HomeService } from './home.service';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';

declare interface Position {
  offsetX: number;
  offsetY: number;
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
  strokeStyle: string = '#FAD8D6';
  position!: {
    start: {};
    stop: {};
  };
  line = [];
  prevPos: Position = {
    offsetX: 0,
    offsetY: 0,
  };
  isPainting = false;

  constructor(
    private homeService: HomeService,
  ) { }

  async ngOnInit() {

    this.homeService.getTapestry().subscribe((tapestry: Blob) => {
      const tapestryEl = document.getElementById("video-container") as HTMLVideoElement
      tapestryEl.src = window.URL.createObjectURL(tapestry)
    })
    
      
  }

  startDrawing(event: MouseEvent) {
    console.log(this.canvasEl);

    const xPos = event.clientX
    const yPos = event.clientY
    this.isPainting = true
    console.log(event);
    
    const startingPos: MouseEvent = {
      clientX: 0, clientY: 0,
      altKey: false,
      button: 0,
      buttons: 0,
      ctrlKey: false,
      metaKey: false,
      movementX: 0,
      movementY: 0,
      offsetX: 0,
      offsetY: 0,
      pageX: 0,
      pageY: 0,
      relatedTarget: null,
      screenX: 0,
      screenY: 0,
      shiftKey: false,
      x: 0,
      y: 0,
      getModifierState: function (keyArg: string): boolean {
        throw new Error('Function not implemented.');
      },
      initMouseEvent: function (typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, viewArg: Window, detailArg: number, screenXArg: number, screenYArg: number, clientXArg: number, clientYArg: number, ctrlKeyArg: boolean, altKeyArg: boolean, shiftKeyArg: boolean, metaKeyArg: boolean, buttonArg: number, relatedTargetArg: EventTarget | null): void {
        throw new Error('Function not implemented.');
      },
      detail: 0,
      view: null,
      which: 0,
      initUIEvent: function (typeArg: string, bubblesArg?: boolean, cancelableArg?: boolean, viewArg?: Window | null, detailArg?: number): void {
        throw new Error('Function not implemented.');
      },
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: null,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      returnValue: false,
      srcElement: null,
      target: null,
      timeStamp: 0,
      type: '',
      composedPath: function (): EventTarget[] {
        throw new Error('Function not implemented.');
      },
      initEvent: function (type: string, bubbles?: boolean, cancelable?: boolean): void {
        throw new Error('Function not implemented.');
      },
      preventDefault: function (): void {
        throw new Error('Function not implemented.');
      },
      stopImmediatePropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      stopPropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      AT_TARGET: 0,
      BUBBLING_PHASE: 0,
      CAPTURING_PHASE: 0,
      NONE: 0
    }
    
    if (this.isPainting) {
      const offSetData = { xPos, yPos };
      this.position = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      // this.line = this.line.concat(this.position);
      this.draw(startingPos, event, this.strokeStyle);
    }
  }

  draw(
    { offsetX: x, offsetY: y }: Position,
    { offsetX, offsetY }: Position,
    strokeStyle: string
  ){
    this.ctx.beginPath(); 
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.stroke();
    this.prevPos = {
      offsetX,
      offsetY,
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
        console.log(this.canvasEl);
        // this.canvasEl.nativeElement.width = 1000;
        // this.canvasEl.nativeElement.height = 800;
        this.ctx = this.canvasEl.nativeElement.getContext('2d');
        this.ctx.lineJoin = 'round'
        this.ctx.lineCap = 'round'
        this.ctx.lineWidth = 5
    break
    }
  }

}