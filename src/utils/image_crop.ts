import {Injectable} from "@angular/core";


@Injectable()
export class ImageCrop {

  private container;
  private originalImage;
  private targetImage;
  private eventState: EventState;
  private constrain: boolean;
  private minWidth: number;
  private minHeight: number;
  private maxWidth: number;
  private maxHeight: number;
  private resizeCanvas;
  private cropOverlay;
  isInitialized = false;
  offsetTop: number = 0;
  offsetLeft: number = 0;

  init(image, container, cropOverlay) {
    this.isInitialized = true;
    this.cropOverlay = cropOverlay;
    this.container = container;
    this.originalImage = new Image();
    this.targetImage = image;
    this.eventState = {};
    this.constrain = false;
    this.minWidth = 60;
    this.minHeight = 60;
    this.maxWidth = 800;
    this.maxHeight = 900;
    this.resizeCanvas = document.createElement('canvas');
    // Create a new image with a copy of the original src
    // When resizing, we will always use this original copy as the base
    this.originalImage.src = this.targetImage.src;

    // Add resize handles
    // this.targetImage.nativeElement.wrap('<div class="resize-container"></div>')
    //   .before('<span class="resize-handle resize-handle-nw"></span>')
    //   .before('<span class="resize-handle resize-handle-ne"></span>')
    //   .after('<span class="resize-handle resize-handle-se"></span>')
    //   .after('<span class="resize-handle resize-handle-sw"></span>');

    // Get a variable for the container
    // this.container = this.targetImage.parent('.resize-container');

    // Add events
    // this.container.addEventListener('mousedown', '.resize-handle', this.startResize);
  }

  crop() {
    let crop_canvas,
      left = this.cropOverlay.getBoundingClientRect().left - this.container.getBoundingClientRect().left,
      top = this.cropOverlay.getBoundingClientRect().top - this.container.getBoundingClientRect().top,
      width = this.cropOverlay.getBoundingClientRect().width,
      height = this.cropOverlay.getBoundingClientRect().height;
    crop_canvas = document.createElement('canvas');
    crop_canvas.width = width;
    crop_canvas.height = height;
    crop_canvas.getContext('2d').drawImage(this.targetImage, left, top, width, height, 0, 0, width, height);
    window.open(crop_canvas.toDataURL("image/png"));
  }

  startMoving(e) {
    e.preventDefault();
    e.stopPropagation();
    this.saveEventState(e);
    document.addEventListener('mousemove', ev => this.moving(ev));
    document.addEventListener('mouseup', ev => this.endMoving(ev));
  }

  moving(e) {
    var mouse: Mouse = {};
    e.preventDefault();
    e.stopPropagation();
    mouse.x = (e.clientX || e.pageX) + window.pageYOffset;
    mouse.y = (e.clientY || e.pageY) + window.pageXOffset;
    this.offsetTop = mouse.y - ( this.eventState.mouse_y - this.eventState.container_top);
    this.offsetLeft = mouse.x - ( this.eventState.mouse_x - this.eventState.container_left);
    // this.container.setAttribute('left', mouse.x - ( this.eventState.mouse_x - this.eventState.container_left));
    // this.container.setAttribute('top', mouse.y - ( this.eventState.mouse_y - this.eventState.container_top));
  }

  endMoving(e) {
    e.preventDefault();
    document.removeEventListener('mouseup', ev => this.endMoving(ev));
    document.removeEventListener('mousemove', ev => this.moving(ev));
  }


  startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    this.saveEventState(e);
    document.addEventListener('mousemove', ev => this.resizing(ev));
    document.addEventListener('mouseup', ev => this.endResize(ev));
  }

  private resizing(e) {
    if (this.eventState == null) return;
    var mouse: Mouse = {}, width, height, left, top/*, offset = this.container.offset()*/;
    mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + window.pageXOffset;
    mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + window.pageYOffset;

    // Position image differently depending on the corner dragged and constraints
    if (this.eventState.event.target.classList.contains('resize-handle-se')) {
      width = mouse.x - this.eventState.container_left;
      height = mouse.y - this.eventState.container_top;
      left = this.eventState.container_left;
      top = this.eventState.container_top;
    } else if (this.eventState.event.target.classList.contains('resize-handle-sw')) {
      width = this.eventState.container_width - (mouse.x - this.eventState.container_left);
      height = mouse.y - this.eventState.container_top;
      left = mouse.x;
      top = this.eventState.container_top;
    } else if (this.eventState.event.target.classList.contains('resize-handle-nw')) {
      width = this.eventState.container_width - (mouse.x - this.eventState.container_left);
      height = this.eventState.container_height - (mouse.y - this.eventState.container_top);
      left = mouse.x;
      top = mouse.y;
      if (this.constrain || e.shiftKey) {
        top = mouse.y - ((width / this.originalImage.width * this.originalImage.height) - height);
      }
    } else if (this.eventState.event.target.classList.contains('resize-handle-ne')) {
      width = mouse.x - this.eventState.container_left;
      height = this.eventState.container_height - (mouse.y - this.eventState.container_top);
      left = this.eventState.container_left;
      top = mouse.y;
      if (this.constrain || e.shiftKey) {
        top = mouse.y - ((width / this.originalImage.width * this.originalImage.height) - height);
      }
    }

    // Optionally maintain aspect ratio
    if (this.constrain || e.shiftKey) {
      height = width / this.originalImage.width * this.originalImage.height;
    }

    if (width > this.minWidth && height > this.minHeight && width < this.maxWidth && height < this.maxHeight) {
      this.resizeImage(width, height);
      // Without this Firefox will not re-calculate the the image dimensions until drag end
      // this.container.offset({'left': left, 'top': top});
      // this.container.getBoundingClientRect().left = left;
      // this.container.getBoundingClientRect().top = top;
      this.container.setAttribute('left', left);
      this.container.setAttribute('top', top);
    }

  }

  private resizeImage(width: number, height: number) {
    this.resizeCanvas.width = width;
    this.resizeCanvas.height = height;
    this.resizeCanvas.getContext('2d').drawImage(this.originalImage, 0, 0, width, height);
    this.targetImage.setAttribute('src', this.resizeCanvas.toDataURL("image/png"));
  }

  private endResize(e) {
    e.preventDefault();
    document.removeEventListener('mouseup touchend', ev => this.endResize(ev));
    document.removeEventListener('mousemove touchmove', ev => this.resizing(ev));
  }


  private saveEventState(e) {
    // Save the initial event details and container state
    this.eventState.container_width = this.container.getBoundingClientRect().width;
    this.eventState.container_height = this.container.getBoundingClientRect().height;
    this.eventState.container_left = this.container.getBoundingClientRect().left;
    this.eventState.container_top = this.container.getBoundingClientRect().top;
    this.eventState.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + window.pageXOffset;
    this.eventState.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + window.pageYOffset;

    // This is a fix for mobile safari
    // For some reason it does not allow a direct copy of the touches property
    // if (typeof e.originalEvent.touches !== 'undefined') {
    //   this.eventState.touches = [];
    //   $.each(e.originalEvent.touches, function (i, ob) {
    //     this.eventState.touches[i] = {};
    //     this.eventState.touches[i].clientX = 0 + ob.clientX;
    //     this.eventState.touches[i].clientY = 0 + ob.clientY;
    //   });
    // }
    this.eventState.event = e;
  }

}


interface EventState {
  container_width?: number;
  container_height?: number;
  container_left?: number;
  container_top?: number;
  mouse_x?: number;
  mouse_y?: number;
  event?: any;
}

interface Mouse {
  x?: number;
  y?: number;
}
