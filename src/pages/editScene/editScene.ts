import { Component, ViewChild, HostListener, ElementRef } from "@angular/core";
import { LoadingController, NavController, NavParams, Platform, ToastController, Gesture, Content } from "ionic-angular";
import { CroppedImageModel } from "../gallery/gallery";
import { ImageCrop } from "../../utils/image_crop";
import { StoryDetailPage } from "../storyDetail/storyDetail";
import { HtmlElementSize, ImageUtils } from "../../utils/image_converting_utils";
import { DatabaseService } from "../../services/database_service";
import { EditStoryPage } from '../editStory/editStory';
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { Keyboard } from "ionic-native";
import { StoryDetailTwinPage } from "../storyDetail/storyDetailTwin";

@Component({
  selector: 'page-editScene',
  templateUrl: 'editScene.html'
})
export class EditScenePage {

  private width: number;
  private height: number;
  private item: CroppedImageModel;

  private image: CoffeeImage;
  private borders: Borders;
  private cell: Cell;
  private refacctoredImage: any;
  private index: number;
  private allItems: Array<CroppedImageModel> = [];
  private tempTop: number = 0;
  private tempLeft: number = 0;
  private isPortrait: boolean;
  private status: number;
  private imagePos: number;
  private srcImage: any;
  private navIndex: number;
  private description: string;
  private refactoredItem: CroppedImageModel;
  private isFromEditStory: boolean;
  private storyId: number;
  private panTop = 0;
  private panLeft = 0;
  private tempRight = 0;
  private tempBottom = 0;
  private title: string;
  private touchMyTralalaEventListener = function (e) { e.preventDefault(); }
  private gesture: Gesture;
  private timeout: any;
  private isFirstTouch: boolean = true;
  private lastRatio: number = 0;
  private zooming: boolean = true;
  private isFromLibrary: boolean = false;
  private storyToEdit: number;
  private topElRange: number = 0;
  private tempZoomCoef: number;
  private startW: number;
  private startH: number;
  private zoomCoef: number = 50;
  private percentW: number = 0;
  private percentH: number = 0;
  private zoomC: number;
  private mode: boolean = false;

  @ViewChild('imageS') element;
  @ViewChild('ionScroll') ionScroll;

  constructor(public navCtrl: NavController,
    private imageCrop: ImageCrop,
    private params: NavParams,
    public loadingController: LoadingController,
    private db: DatabaseService,
    private platform: Platform,
    private toastCtrl: ToastController) {
    this.navIndex = this.navCtrl.getActive().index
    this.item = params.get('item');
    this.srcImage = this.item.srcImage;
    this.index = params.get('index');
    this.allItems = params.get('allItems');
    this.status = params.get('status');
    this.isFromEditStory = params.get('isFromEditStory');
    this.storyId = params.get('storyId');
    this.title = params.get('title');
    this.isFromLibrary = params.get('isFromLibrary');
    this.storyToEdit = params.get('story');
    console.log('isFromLibrary')
    console.log(this.isFromLibrary)
    this.isPortrait = this.item.isPortrait;
    this.imagePos = this.item.position;
    this.description = this.item.description;



    let toast = this.toastCtrl.create({
      message: 'Drag to adjust or zoom in/out',
      duration: 2000,
      position: 'middle'
    });
    toast.present()

    if (this.isPortrait) {
      this.image = {
        offsetTop: 0,
        offsetLeft: 0,
        width: window.innerWidth,
        height: window.innerWidth * 11 / 8.5
      };
      this.borders = {
        width: window.innerWidth,
        height: window.innerWidth * 11 / 8.5
      };
      this.cell = {
        num: 1,
        width: window.innerWidth,
        height: window.innerWidth * 11 / 8.5,
        top: 0,
        left: 0
      };
    } else {
      this.image = {
        offsetTop: 0,
        offsetLeft: 0,
        width: window.outerWidth,
        height: window.screen.width
      };
      this.borders = {
        width: window.innerWidth,
        height: window.innerWidth * 8.5 / 11
      };
      this.cell = {
        num: 1,
        width: window.innerWidth,
        height: window.innerWidth * 8.5 / 11,
        top: 0,
        left: 0
      };
    }

    this.platform.ready().then(_ => {
      // document.addEventListener('touchmove', this.touchMyTralalaEventListener, false);
      this.topElRange = this.borders.height - document.getElementsByClassName('div-range')[0].clientHeight
      Keyboard.hideKeyboardAccessoryBar(false)
    });

    this.width = this.image.width;
    this.height = this.image.height;
    this.tempLeft = 0;
    this.tempTop = 0;

    this.platform.ready().then(() => {
      this.showImage(this.imagePos);
    })
  }

  onBackClick() {
    this.platform.ready().then(_ => {
      document.removeEventListener('touchmove', this.touchMyTralalaEventListener);
    });
    this.navCtrl.pop();
    // this.ionScroll.scrollElement.scrollTop += 50;
  }

  onDescriptionInput() {
    let el = document.getElementById("desc-textarea");
    el.style.height = el.scrollHeight + "px";
  }

  hideKeyboard() {
  }

  onPanMove(event) {
    console.log('panmove');
    console.log(event);
    let offsetBorders: OffsetsResp
    offsetBorders = this.checkBorders({
      leftTop: { x: event.deltaX + this.panLeft, y: event.deltaY + this.panTop },
      rightBottom: { x: event.deltaX + this.image.width + this.panLeft, y: event.deltaY + this.image.height + this.panTop }
    });

    console.log('offsetBorders: ' + JSON.stringify(offsetBorders))
    console.log('anchors: ' + JSON.stringify({
      leftTop: { x: event.deltaX + this.panLeft, y: event.deltaY + this.panTop },
      rightBottom: { x: event.deltaX + this.image.width + this.panLeft, y: event.deltaY + this.image.height + this.panTop }
    }))
    if (offsetBorders.leftX && offsetBorders.rightX) {
      this.image.offsetLeft = event.deltaX + this.tempLeft;
      this.panLeft = this.image.offsetLeft;
    } else if (!offsetBorders.leftX) {
      this.image.offsetLeft = 0;
      this.panLeft = 0;
    } else if (!offsetBorders.rightX) {
      this.image.offsetLeft = this.cell.width - this.image.width;
      this.panLeft = this.image.offsetLeft;
    }
    if (offsetBorders.leftY && offsetBorders.rightY) {
      this.image.offsetTop = event.deltaY + this.tempTop;
      this.panTop = this.image.offsetTop;
    } else if (!offsetBorders.leftY) {
      this.image.offsetTop = 0;
      this.panTop = 0;
    } else if (!offsetBorders.rightY) {
      this.image.offsetTop = this.cell.height - this.image.height;
      this.panTop = this.cell.height - this.image.height;
    }
  }

  onTouchEnd(event) {
    Keyboard.close();
    console.log('touch end');
    console.log(event);
    this.tempLeft = this.image.offsetLeft;
    this.tempTop = this.image.offsetTop;
    this.width = this.image.width;
    this.height = this.image.height;
    console.log(this.image.height);
    console.log(this.image.width);

    this.isFirstTouch = true;
    this.lastRatio = 0;
  }

  onTouchMove(event) {
    console.log('touchmove');
    if (event.touches.length == 2) {
      let width = this.image.width;
      let height = this.image.height;
      let fingersDist = (this.sqrt((event.touches[0].screenX - event.touches[1].screenX) * (event.touches[0].screenX - event.touches[1].screenX)
        + (event.touches[0].screenY - event.touches[1].screenY) * (event.touches[0].screenY - event.touches[1].screenY)));
      let screenDist = (this.sqrt(this.image.height * this.image.height + this.image.width * this.image.width));
      if (this.lastRatio == 0) {
        this.lastRatio = screenDist / fingersDist;
      } else {
        if (width * (this.lastRatio / (screenDist / fingersDist)) > this.borders.width && height * (this.lastRatio / (screenDist / fingersDist)) > this.borders.height) {
          this.image.width = width * (this.lastRatio / (screenDist / fingersDist));
          this.image.height = height * (this.lastRatio / (screenDist / fingersDist));
          this.lastRatio = (screenDist / fingersDist);
        }
      }
    }
  }

  sqrt(x: number): number {
    let root = 0;
    let square = root;
    while (square < x) {
      root++;
      square = root * root;
    }
    return root;
  }

  onPinch(event) {
    console.log('pinch');
    console.log(event);
    this.image.offsetLeft = this.tempLeft;
    this.image.offsetTop = this.tempTop;
    // let width = this.image.width;
    // let height = this.image.height;
    if (event.scale * this.width + this.image.offsetLeft > this.cell.width && event.scale * this.height + this.image.offsetTop > this.cell.height) {
      this.image.width = this.width * event.scale
      this.image.height = this.height * event.scale
    }
  }

  @HostListener('focusout', ['$event'])
  keyEvent(event) {
    console.log('keyEvent')
    console.log(event)
    if (this.platform.is('ios'))
      this.cropImage()
  }

  checkBorders(anchors): OffsetsResp {
    return {
      leftX: anchors.leftTop.x <= 0,
      leftY: anchors.leftTop.y <= 0,
      rightX: anchors.rightBottom.x > this.cell.width,
      rightY: anchors.rightBottom.y > this.cell.height
    };
  }

  private onRangeChange(event) {
    console.log('onRangeChange')
    console.log(this.tempZoomCoef + ' ' + event.value)
    // if (this.tempZoomCoef) {
    this.image.width = (event.value / 10) * this.startW
    this.image.height = (event.value / 10) * this.startH
    console.log(this.image.width)
    console.log(this.image.height)
    console.log(this.startH)
    console.log(this.startW)
    // this.tempZoomCoef = event.value
    // }
    // else {
    //   this.percentH = this.image.height / 100
    //   this.percentW = this.image.width / 100
    //   this.tempZoomCoef = event.value
    // }
  }

  cropImage() {
    let load = this.loadingController.create({
      content: 'Please wait while images are cropping',
      dismissOnPageChange: true
    });
    load.present();
    let overlays: HtmlElementSize[] = [];
    let overlay = this.fetchOverlay();
    overlays.push(overlay);
    let image = (document.getElementsByClassName("picture")[0] as HTMLImageElement);
    console.log("image parameters: " + JSON.stringify({
      left1: image.clientLeft, left2: image.offsetLeft, left3: image.scrollLeft,
      top1: image.clientTop, top2: image.offsetTop, top3: image.scrollTop
    }))
    console.log("image parameters2: " + JSON.stringify({
      left1: image.getBoundingClientRect().left, top1: image.getBoundingClientRect().top
    }))
    ImageUtils.cropImagesCells2(image, overlays)
      .then((images: Array<string>) => {
        images.forEach((img, pos) => this.refacctoredImage = img);
        console.log('pushing');
        this.refactoredItem = {
          description: this.description,
          image: this.refacctoredImage,
          isOnePhoto: this.item.isOnePhoto,
          isPortrait: this.item.isPortrait,
          isLandLeft: this.item.isLandLeft,
          isLandRight: this.item.isLandRight,
          num: this.item.num,
          offsetTop: this.item.offsetTop,
          position: this.item.position,
          srcImage: this.item.srcImage,
          width: this.item.width,
          imageRatio: this.item.imageRatio,
          id: this.item.id,
          cellLeft: this.item.cellLeft,
          cellTop: this.item.cellTop,
          cellZoom: this.item.cellZoom
        }
        let page: any;
        if (this.isFromEditStory) page = EditStoryPage
        else page = StoryDetailPage
        this.navCtrl.push(page, {
          items: this.allItems,
          refactored: this.refacctoredImage,
          index: this.index,
          isPortrait: this.isPortrait,
          refactoredItem: this.refactoredItem,
          selectedStoryId: this.storyId,
          title: this.title,
          isFromLibrary: this.isFromLibrary,
          story: this.storyToEdit
        }).then(_ => {
          this.platform.ready().then(_ => {
            document.removeEventListener('touchmove', this.touchMyTralalaEventListener, false);
          });
          let index = this.navCtrl.getActive().index - 1
          this.navCtrl.remove(index);
        })

      }, (err) => console.log(err));
  }

  private fetchOverlay(): HtmlElementSize {
    let image = (document.getElementsByClassName("picture")[0] as HTMLImageElement);
    let size: HtmlElementSize;
    if (this.platform.is('ios'))
      size = {
        width: this.cell.width - 20,
        height: this.cell.height - 20,
        offsetTop: this.cell.top - image.getBoundingClientRect().top + 70,
        offsetLeft: this.cell.left - image.getBoundingClientRect().left + 14
      };
    else
      size = {
        width: this.cell.width - 12,
        height: this.cell.height - 12,
        offsetTop: this.cell.top - image.getBoundingClientRect().top + 65,
        offsetLeft: this.cell.left - image.getBoundingClientRect().left + 9
      };
    return size;
  }

  showImage(imagePos) {
    // let ratio: number;
    // let invOffset: number;
    // if (this.isPortrait) {
    //   ratio = window.screen.width / this.item.width;
    // this.image.width = this.image.width * ratio;
    // this.image.height = this.image.height * ratio;
    // this.image.width = this.borders.height / this.
    // if (this.item.imageRatio > (8.5 / 11)) {
    //   this.image.height = this.borders.height
    //   this.image.width = this.borders.height / this.item.imageRatio
    // }

    // else {
    //   this.image.width = this.borders.width
    //   this.image.height = this.image.width * this.item.imageRatio
    // }
    //   this.image.height = this.borders.height
    //   console.log('ratio: ' + ratio)
    //   console.log('itemRatio: ' + this.item.imageRatio)
    //   this.zoomCoef = ratio * 10;
    //   this.zoomC = this.zoomCoef
    //   this.startH = this.image.height
    //   this.startW = this.image.width
    //   console.log('height1: ' + this.image.height)
    //   console.log('width1: ' + this.image.width)
    // } else if (this.item.isLandLeft) {
    //   ratio = this.image.height / this.item.width * 8.5 / 11;
    //   this.image.height = this.image.height * ratio;
    //   this.image.width = this.image.height * this.item.imageRatio;
    //   console.log('ratio: ' + ratio)
    //   this.zoomCoef = ratio * 10;
    //   this.zoomC = this.zoomCoef
    //   this.startH = this.image.height
    //   this.startW = this.image.width
    //   console.log('height1: ' + this.image.height)
    //   console.log('width1: ' + this.image.width)

    // } else if (this.item.isLandRight) {
    //   console.log('height1: ' + this.item.imageRatio)
    //   console.log('height1: ' + this.image.height)
    //   console.log('height1: ' + ratio)
    //   ratio = this.image.height / this.item.width * 8.5 / 11;
    //   this.image.height = this.image.height * ratio;
    //   console.log('ratio: ' + ratio)
    //   this.zoomCoef = ratio * 10
    //   this.zoomC = this.zoomCoef
    //   this.image.width = this.image.height * this.item.imageRatio;
    //   // this.zoomCoef = (ratio - 1) * 100
    //   this.startH = this.image.height
    //   this.startW = this.image.width
    //   invOffset = this.image.width - 3 * this.item.width * ratio * this.item.imageRatio
    //   console.log('height1: ' + this.image.height)
    //   console.log('width1: ' + this.image.width)
    //   console.log(invOffset)
    // }

    // if (!this.item.isOnePhoto)
    //   switch (imagePos) {
    //     case 1: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2 + this.item.width, 0, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(0, - this.image.height / 2 + this.item.width * ratio, ratio);
    //       else { this.setOffsets(invOffset, - this.image.height / 2 + this.item.width * ratio, ratio); console.log(1) }

    //       break;
    //     } case 2: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2, 0, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(- this.item.width * 11 / 8.5 * ratio, - this.image.height / 2 + this.item.width * ratio, ratio);
    //       else this.setOffsets(invOffset - this.item.width * 11 / 8.5 * ratio, - this.image.height / 2 + this.item.width * ratio, ratio);
    //       break;
    //     } case 3: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2 + this.item.width, - this.item.width * 11 / 8.5, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(- this.item.width * 11 / 8.5 * ratio * 2, - this.image.height / 2 + this.item.width * ratio, ratio);
    //       else this.setOffsets(invOffset - 2 * this.item.width * 11 / 8.5 * ratio, - this.image.height / 2 + this.item.width * ratio, ratio);
    //       break;
    //     } case 4: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2, - this.item.width * 11 / 8.5, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(0, - this.image.height / 2, ratio);
    //       else this.setOffsets(invOffset, - this.image.height / 2, ratio);
    //       break;
    //     } case 5: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2 + this.item.width, - this.item.width * 11 / 8.5 * 2, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(- this.item.width * 11 / 8.5 * ratio, - this.image.height / 2, ratio);
    //       else this.setOffsets(invOffset - this.item.width * 11 / 8.5 * ratio, - this.image.height / 2, ratio);
    //       break;
    //     } case 6: {
    //       if (this.isPortrait) this.setOffsets(- window.screen.width / 2, - this.item.width * 11 / 8.5 * 2, ratio);
    //       else if (this.item.isLandLeft) this.setOffsets(- this.item.width * 11 / 8.5 * ratio * 2, - this.image.height / 2, ratio);
    //       else this.setOffsets(invOffset - 2 * this.item.width * 11 / 8.5 * ratio, - this.image.height / 2, ratio);
    //       break;
    //     }
    //   }

    // else {
    //   if (this.item.isPortrait) this.setOffsets(0, -this.item.offsetTop, ratio)
    //   else if (this.item.isLandLeft) this.setOffsets(- ratio * this.item.offsetTop, 0, ratio)
    // }
    // if (this.item.isPortrait) {
    //   console.log('imageRatio: ' + this.item.imageRatio)
    //   console.log('imageRatio: ' + this.borders.height)
    //   console.log('imageRatio: ' + this.borders.width)
    //   if (this.item.imageRatio < (8.5 / 11)) {
    //     this.image.height = this.borders.height * this.item.cell.zoomCoef
    //     this.ionScroll.scrollElement.scrollLeft = - this.item.cell.left * this.item.cell.zoomCoef
    //     this.ionScroll.scrollElement.scrollTop = - this.item.cell.top * this.item.cell.zoomCoef
    //     this.startH = this.image.height / this.item.cell.zoomCoef
    //     this.mode = false;
    //   } else {
    //     this.mode = true;
    //     this.image.width = this.borders.width * this.item.cell.zoomCoef
    //     this.ionScroll.scrollElement.scrollLeft = - this.item.cell.left * this.item.cell.zoomCoef
    //     this.ionScroll.scrollElement.scrollTop = - this.item.cell.top * this.item.cell.zoomCoef
    //     this.startW = this.image.width  / this.item.cell.zoomCoef
    //   }
    // } else {
    //   if (this.item.imageRatio > (8.5 / 11)) {
    //     this.image.height = this.borders.height
    //     this.startH = this.image.height
    //     this.mode = false;
    //   } else {
    //     this.mode = true;
    //     this.image.width = this.borders.width
    //     this.startW = this.image.width
    //   }
    // }
    // this.zoomCoef = this.item.cell.zoomCoef * 10;
    // this.zoomC = 26;
  }

  ionViewDidLoad() {
    if (!this.item.isOnePhoto) {
      if (this.item.isPortrait) {
        if (this.item.imageRatio < (8.5 / 11)) {
          this.image.height = this.borders.height * this.item.cellZoom
          this.startH = this.image.height / this.item.cellZoom
          this.mode = false;
        } else {
          this.mode = true;
          this.image.width = this.borders.width * this.item.cellZoom
          this.startW = this.image.width / this.item.cellZoom
        }
        Observable.timer(200).subscribe(_ => {
          this.ionScroll.scrollElement.scrollLeft = this.item.cellLeft * this.item.cellZoom;
          this.ionScroll.scrollElement.scrollTop = this.item.cellTop * this.item.cellZoom;
        })
      } else if (this.item.isLandLeft) {
        if (this.item.imageRatio > (8.5 / 11)) {
          this.image.height = this.borders.height * this.item.cellZoom
          this.startH = this.image.height / this.item.cellZoom
          this.mode = false;
          console.log('1')
        } else {
          this.mode = true;
          this.image.width = this.borders.width * this.item.cellZoom
          this.startW = this.image.width / this.item.cellZoom
          console.log('2')
        }
        Observable.timer(200).subscribe(_ => {
          console.log('imageSize')
          console.log((document.getElementById('image') as HTMLImageElement).getBoundingClientRect().height)
          console.log((document.getElementById('image') as HTMLImageElement).getBoundingClientRect().width)
          this.ionScroll.scrollElement.scrollLeft = this.item.cellTop * this.item.cellZoom / 11 * 8.5;
          this.ionScroll.scrollElement.scrollTop = (document.getElementById('image') as HTMLImageElement).getBoundingClientRect().height - this.item.cellLeft * this.item.cellZoom * 11 / 8.5
        })
      } else if (this.item.isLandRight) {
        if (this.item.imageRatio > (8.5 / 11)) {
          this.image.height = this.borders.height * this.item.cellZoom
          this.startH = this.image.height / this.item.cellZoom
          this.mode = false;
          console.log('1')
        } else {
          this.mode = true;
          this.image.width = this.borders.width * this.item.cellZoom
          this.startW = this.image.width / this.item.cellZoom
          console.log('2')
        }
        Observable.timer(200).subscribe(_ => {
          this.ionScroll.scrollElement.scrollLeft = (document.getElementById('image') as HTMLImageElement).getBoundingClientRect().width - this.item.cellTop * this.item.cellZoom * 11 / 8.5
          this.ionScroll.scrollElement.scrollTop = this.item.cellLeft * this.item.cellZoom / 11 * 8.5
        })
      }
    } else {
      if (this.item.isPortrait) {
        console.log('imageRatio: ' + this.item.imageRatio)
        console.log('imageRatio: ' + this.borders.height)
        console.log('imageRatio: ' + this.borders.width)
        if (this.item.imageRatio < (8.5 / 11)) {
          this.image.height = this.borders.height
          this.startH = this.image.height
          this.mode = false;
        } else {
          this.mode = true;
          this.image.width = this.borders.width
          this.startW = this.image.width 
        }
      } else {
        if (this.item.imageRatio > (8.5 / 11)) {
          this.image.height = this.borders.height
          this.mode = false;
        } else {
          this.mode = true;
          this.image.width = this.borders.width
        }
      }  

    }
    this.zoomCoef = this.item.cellZoom * 10;
    this.zoomC = 26;

  }

  getOffset(cellLeft): number {
    let num = cellLeft - this.item.width
    if (num >= 0)
      return num;
    else return cellLeft
  }

  setOffsets(x: number, y: number, ratio: number) {
    if (this.isPortrait) {
      this.image.offsetTop = y * ratio;
      this.image.offsetLeft = x * ratio;
      this.tempTop = this.image.offsetTop;
      this.tempLeft = this.image.offsetLeft;
    } else {
      this.image.offsetTop = y;
      this.image.offsetLeft = x;
      this.tempTop = this.image.offsetTop;
      this.tempLeft = this.image.offsetLeft;
      console.log(x + ' ' + y)
    }
  }

  private increaseImage() {
    this.zooming = true
    this.image.width = this.image.width * 1.1;
    this.image.height = this.image.height * 1.1;
  }

  private decreaseImage() {
    let w = this.image.width;
    let h = this.image.height;
    if (w / 1.1 >= this.cell.width && h / 1.1 >= this.cell.height) {
      this.image.width = this.image.width / 1.1;
      this.image.height = this.image.height / 1.1;
    } else {
      this.zooming = false;
    }
  }
}

interface CoffeeImage {
  offsetTop: number
  offsetLeft: number
  width: number
  height: number
}

interface Borders {
  width: number
  height: number
}

export interface Cell {
  num: number;
  width: number;
  height: number;
  top: number;
  left: number;
}

interface Anchors {
  leftTop: Point;
  rightBottom: Point;
}

interface Point {
  x: number;
  y: number;
}

interface OffsetsResp {
  leftX: boolean;
  leftY: boolean;
  rightX: boolean;
  rightY: boolean;
}
