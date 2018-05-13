import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { LoadingController, NavController, NavParams, Platform, ToastController } from "ionic-angular";
import { Camera } from "ionic-native";
import { HtmlElementSize, ImageUtils, ImageSize, CroppedImageParams } from "../../utils/image_converting_utils";
import { StoryDetailPage } from "../storyDetail/storyDetail";
import { MeasureUtils } from "../../utils/measure_utils";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/observable/timer";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { DeviceMotion, DeviceMotionAccelerationData } from "@ionic-native/device-motion";

declare let CameraPreview: any;
@Component({
  selector: 'page-gallery',
  templateUrl: 'gallery.html'
})
export class GalleryPage implements OnInit, OnDestroy {

  private isLoaded: boolean = false;

  @ViewChild('root') root: ElementRef;
  @ViewChild('singleRoot') singleRoot: ElementRef;
  @ViewChild('container') container: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('groot') cell: ElementRef;

  singleCell: Cell;
  cells: Array<Cell> = [];
  private grids: any;
  private divVisibility: boolean = true;
  private fab1: boolean;
  private fab2: boolean;
  private fabId1: string = '1';
  private fabId2: string = '6';
  private bordRight: number = 2;
  private title: string;
  private description: string;
  private storyId: any;
  private isPortrait: boolean;
  private isLandRight: boolean;
  private isLandLeft: boolean;
  private cameraHeight: any;
  private cameraWidth: any;
  private storyToEdit: Story;
  private subscription: Subscription;
  private isButtonBlocked: boolean;
  private containerImage: string = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  // data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
  private isFromLibrary: boolean = false;
  private croppedImages: Array<CroppedImageModel> = [];
  private useDB: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    public loadingController: LoadingController,
    private deviceMotion: DeviceMotion,
    private toast: ToastController) {
    this.grids = navParams.get('param');
    console.log('grids: ' + this.grids);
    this.useDB = navParams.get('useDB')
    this.title = navParams.get('title');
    this.description = navParams.get('description');
    this.storyId = navParams.get('storyId');
    this.isFromLibrary = navParams.get('isFromLibrary');
    console.log('isFromLibrary')
    console.log(this.isFromLibrary)
    if (navParams.get('croppedImages') != null)
      this.croppedImages = navParams.get('croppedImages');
    this.divVisibility = this.grids != 1;
    if (this.grids == null) {
      this.divVisibility = true;
      this.grids = "1";
    }
    this.prepareFabs(this.grids);
    this.startCamera();
    this.isPortrait = true;
    this.blockOrientation(false)
  }

  ngOnInit() {
    this.isPortrait = true;
    this.isLoaded = true;
    this.loadGrid();
  }

  azaza(cell: Cell) {
    if (cell.num == 1 || 3 || 5) {
      cell.borderRight = 0;
    } else {
      cell.borderRight = 2;
    }
  }

  private loadGrid() {
    if (!this.isLoaded) return;
    let sub = Observable.timer(0, 200)
      .subscribe(a => {
        if (a === 10) sub.unsubscribe();
        this.updateGrid();
      });
    this.updateGrid();

  }

  takeThePicture() {
    let that = this;
    if (this.platform.is('cordova') && !this.isButtonBlocked) {
      this.isButtonBlocked = true;
      let load = this.loadingController.create({
        content: 'Making photo...',
        dismissOnPageChange: true
      });
      load.present();
      CameraPreview.takePicture(imgData => {
        load.dismiss();
        // this.containerImage = 'data:image/jpeg;base64,' + imgData;
        // console.log(this.containerImage)
        document.getElementById("container").style.backgroundImage = 'url(data:image/jpeg;base64,' + imgData + ')';
      });
      this.blockOrientation(true)
    }
  }

  updateGrid() {
    this.cells.splice(0, this.cells.length);
    for (let i = 0; i < 6; i++) {
      let cell: Cell;
      if (i % 2 == 0) {
        cell = {
          num: i + 1,
          width: 1,
          height: 1,
          top: 0,
          left: 0,
          borderRight: 0
        };
      } else {
        cell = {
          num: i + 1,
          width: 1,
          height: 1,
          top: 0,
          left: 0,
          borderRight: 4
        };
      }

      this.cells.push(cell);
    }
    let root = this.root.nativeElement as HTMLElement;
    let singleRoot = this.singleRoot.nativeElement as HTMLElement;
    this.singleCell = {
      num: 1,
      width: 1,
      height: 1,
      top: 0,
      left: 0,
      borderRight: 0
    };
    MeasureUtils.setupGrid1(singleRoot, this.singleCell);
    MeasureUtils.setupGrid6(root, this.cells);
  }

  closeGallery() {
    this.navCtrl.pop();
  }

  startCamera() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        let options = {
          x: 0,
          y: 56,
          width: window.screen.width,
          height: window.screen.height - 30,
          camera: CameraPreview.CAMERA_DIRECTION.BACK,
          toBack: true,
          tapPhoto: false,
          previewDrag: false
        };
        CameraPreview.startCamera(options, (err) => console.log(err));
        this.cameraHeight = window.screen.height - document.getElementById('header').offsetHeight - document.getElementById('footer').offsetHeight;
        console.log('sizes : ' + this.header.nativeElement.height + ' '
          + this.header.nativeElement.height + ' ' + window.screen.height + ' ' + window.screen.width);
      } else {
        console.log('sizes : ' + (<HTMLInputElement>document.getElementById('container')).getBoundingClientRect().height + ' '
          + (<HTMLInputElement>document.getElementById('container')).clientHeight);
        console.log('src : ' + document.getElementById('container').baseURI);
        let pic = new Image;
        pic.src = document.getElementById('container').style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',')[0];
        console.log('sizes : ' + pic.width + ' ' + pic.height);
      }
      this.isButtonBlocked = false;
    })
  }

  ngOnDestroy() {
    if (this.platform.is('cordova')) {
      console.log('camera is stopped');
      CameraPreview.stopCamera();
    }
  }

  openGallery() {

    if (!this.platform.is('cordova')) return;

    let cameraOptions = {
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: Camera.DestinationType.FILE_URI,
      quality: 100,
      targetWidth: 1000,
      targetHeight: 1000,
      encodingType: Camera.EncodingType.JPEG,
      correctOrientation: true
    };

    Camera.getPicture(cameraOptions)
      .catch(reason => {
        console.log(reason)
        this.startCamera()
      })
      .then(file_uri => {
        this.containerImage = file_uri;
        console.log('sizes : ' + (<HTMLInputElement>document.getElementById('container')).width + ' '
          + (<HTMLInputElement>document.getElementById('container')).height);
        console.log("TEST", file_uri);
        this.isButtonBlocked = true;
      },
      err => console.log(err));
  }

  prepareFabs(number: string) {
    if (number === "1") {
      this.fab1 = false;
      this.fab2 = true;
    } else if (number === "6") {
      this.fab1 = true;
      this.fab2 = false;
    }
  }

  fabClick(number: string) {
    console.log("onFabClick");
    if (number === "6") {
      this.fab1 = false;
      this.fab2 = true;
      this.grids = "1";
      this.divVisibility = false;

    } else if (number === "1") {
      this.fab1 = true;
      this.fab2 = false;
      this.grids = "6";
      this.divVisibility = true;
    }
    console.log(number);
    this.loadGrid();
  }

  checkNumbers() {
    this.platform.ready().then(() => {
      if (this.isPortrait)
        for (let i = 0; i < 6; i++) {
          this.cells[i].num = i + 1;
        } else if (this.isLandLeft) {
          this.cells[0].num = 4;
          this.cells[1].num = 1;
          this.cells[2].num = 5;
          this.cells[3].num = 2;
          this.cells[4].num = 6;
          this.cells[5].num = 3;
        } else if (this.isLandRight) {
          this.cells[0].num = 3;
          this.cells[1].num = 6;
          this.cells[2].num = 2;
          this.cells[3].num = 5;
          this.cells[4].num = 1;
          this.cells[5].num = 4;
        }
    });
  }

  cropImage() {
    if (document.getElementById('container').style.backgroundImage === '' ||
      document.getElementById('container').style.backgroundImage === 'url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")' || 
  document.getElementById('container').style.backgroundImage === 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)') {
      let toast = this.toast.create({
        message: 'Take photo or choose one from the library',
        duration: 3000,
        position: 'middle'
      });
      toast.present();
      return;
    }
    let load = this.loadingController.create({
      content: 'Please wait while images are cropping',
      dismissOnPageChange: true
    });
    load.present();
    let overlays = this.fetchOverlays(this.grids !== this.fabId1);
    let image = (document.getElementsByClassName("cont")[0] as HTMLInputElement);
    let imageSrc;
    if (this.platform.is('ios'))
      imageSrc = document.getElementById('container').style.backgroundImage.replace('url(', '').replace(')', '');
    else if (this.platform.is('android'))
      imageSrc = document.getElementById('container').style.backgroundImage.replace('url("', '').replace('")', '');
    if (this.isPortrait) {
      ImageUtils.cropInputImagesCells(image, imageSrc, overlays)
        .then((imageParams: CroppedImageParams) => {
          console.log('imageParams:');
          console.log(imageParams);
          imageParams.result.forEach((img, pos) => {
            if (imageParams.result.length == 1)
              this.croppedImages.push({
                num: pos + 1,
                image: img,
                description: '',
                isPortrait: true,
                isLandLeft: this.isLandLeft,
                isLandRight: this.isLandRight,
                position: this.cells[pos].num,
                width: window.screen.width,
                srcImage: imageSrc,
                isOnePhoto: true,
                offsetTop: (this.cameraHeight - window.screen.width * 11 / 8.5) / 2,
                imageRatio: imageParams.naturalSize.height /
                imageParams.naturalSize.width,
                cellLeft: this.cells[pos].left,
                cellTop: this.cells[pos].top,
                cellZoom: 1
              });
            else this.croppedImages.push({
              num: pos + 1,
              image: img,
              description: '',
              isPortrait: true,
              isLandLeft: this.isLandLeft,
              isLandRight: this.isLandRight,
              position: this.cells[pos].num,
              width: this.cells[0].width,
              srcImage: imageSrc,
              isOnePhoto: false,
              offsetTop: 0,
              imageRatio: imageParams.naturalSize.height /
              imageParams.naturalSize.width,
              cellLeft: this.cells[pos].left,
              cellTop: this.cells[pos].top,
              cellZoom: window.screen.width / this.cells[pos].width
            });
            console.log('cell: ' + JSON.stringify({
              left: this.cells[pos].left,
              right: this.cells[pos].top,
              zoomCoef: imageParams.naturalSize.width / this.cells[pos].width
            }))
          });
          this.navCtrl.push(StoryDetailPage, {
            items: this.croppedImages,
            title: this.title,
            description: this.description,
            story: this.storyId,
            isFromLibrary: this.isFromLibrary,
            useDB: this.useDB
          }).then(_ => this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()) - 1))
        }, (err) => console.log(err));
    } else if (this.isLandLeft) {
      let rotatedImage: string;
      ImageUtils.urlToCanvas(imageSrc).then((cvs: HTMLCanvasElement) => {
        rotatedImage = this.rotateSourceImage(cvs, -Math.PI / 2)
        console.log(rotatedImage);
      });
      ImageUtils.cropInputImagesCellsWithRotating(image, imageSrc, overlays, -Math.PI / 2)
        .then((imageParams: CroppedImageParams) => {
          console.log(imageParams);
          imageParams.result.forEach((img, pos) => {
            if (imageParams.result.length == 1)
              this.croppedImages.push({
                num: pos + 1,
                image: img,
                description: '',
                isPortrait: false,
                isLandLeft: this.isLandLeft,
                isLandRight: this.isLandRight,
                position: this.cells[pos].num,
                width: window.screen.width,
                srcImage: rotatedImage,
                isOnePhoto: true,
                offsetTop: (this.cameraHeight - window.screen.width * 11 / 8.5) / 2,
                imageRatio: imageParams.naturalSize.height /
                imageParams.naturalSize.width,
                cellLeft: this.cells[pos].left,
                cellTop: this.cells[pos].top,
                cellZoom: 1
              });
            else this.croppedImages.push({
              num: pos + 1,
              image: img,
              description: '',
              isPortrait: false,
              isLandLeft: this.isLandLeft,
              isLandRight: this.isLandRight,
              position: this.cells[pos].num,
              width: this.cells[0].width,
              srcImage: rotatedImage,
              isOnePhoto: imageParams.result.length == 1,
              offsetTop: 0,
              imageRatio: imageParams.naturalSize.height /
              imageParams.naturalSize.width,
              cellLeft: this.cells[pos].left,
              cellTop: this.cells[pos].top,
              cellZoom: window.screen.width / this.cells[pos].width
            });
          });
          this.navCtrl.push(StoryDetailPage, {
            items: this.croppedImages.sort((n1, n2) => n1.position - n2.position),
            title: this.title,
            description: this.description,
            story: this.storyId,
            isFromLibrary: this.isFromLibrary,
            useDB: this.useDB
          }).then(_ => this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()) - 1))
        }, (err) => console.log(err));
    } else if (this.isLandRight) {
      let rotatedImage: string;
      ImageUtils.urlToCanvas(imageSrc).then((cvs: HTMLCanvasElement) => {
        rotatedImage = this.rotateSourceImage(cvs, Math.PI / 2)
      });
      ImageUtils.cropInputImagesCellsWithRotating(image, imageSrc, overlays, Math.PI / 2)
        .then((imageParams: CroppedImageParams) => {
          console.log(imageParams);
          imageParams.result.forEach((img, pos) => {
            if (imageParams.result.length == 1)
              this.croppedImages.push({
                num: pos + 1,
                image: img,
                description: '',
                isPortrait: false,
                isLandLeft: this.isLandLeft,
                isLandRight: this.isLandRight,
                position: this.cells[pos].num,
                width: window.screen.width,
                srcImage: rotatedImage,
                isOnePhoto: true,
                offsetTop: (this.cameraHeight - window.screen.width * 11 / 8.5) / 2,
                imageRatio: imageParams.naturalSize.height /
                imageParams.naturalSize.width,
                cellLeft: this.cells[pos].left,
                cellTop: this.cells[pos].top,
                cellZoom: 1
              });

            else this.croppedImages.push({
              num: pos + 1,
              image: img,
              description: '',
              isPortrait: false,
              isLandLeft: this.isLandLeft,
              isLandRight: this.isLandRight,
              position: this.cells[pos].num,
              width: this.cells[0].width,
              srcImage: rotatedImage,
              isOnePhoto: imageParams.result.length == 1,
              offsetTop: 0,
              imageRatio: imageParams.naturalSize.height /
              imageParams.naturalSize.width,
              cellLeft: this.cells[pos].left,
              cellTop: this.cells[pos].top,
              cellZoom: window.screen.width / this.cells[pos].width
            });
          });
          this.navCtrl.push(StoryDetailPage, {
            items: this.croppedImages.sort((n1, n2) => n1.position - n2.position),
            title: this.title,
            description: this.description,
            story: this.storyId,
            isFromLibrary: this.isFromLibrary,
            useDB: this.useDB
          }).then(_ => this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()) - 1))
        }, (err) => console.log(err));
    }
  }

  private fetchOverlays(isGrid: boolean): HtmlElementSize[] {
    let array: HtmlElementSize[] = [];
    if (isGrid) {
      for (let i = 0; i < this.cells.length; i++) {
        let size: HtmlElementSize = {
          width: this.cells[i].width,
          height: this.cells[i].height,
          offsetTop: this.cells[i].top,
          offsetLeft: this.cells[i].left
        };
        array.push(size);
      }
    } else {
      let size: HtmlElementSize = {
        width: this.singleCell.width,
        height: this.singleCell.height,
        offsetTop: this.singleCell.top,
        offsetLeft: this.singleCell.left
      };
      array.push(size);
    }
    return array;
  }

  restartCamera() {
    if (this.subscription.closed) this.blockOrientation(false);
    document.getElementById('container').style.backgroundImage = 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)';
    this.isButtonBlocked = false;
  }

  rotateSourceImage(cvs: HTMLCanvasElement, angle: number): string {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    let width = cvs.width;
    let height = cvs.height;
    canvas.height = width;
    canvas.width = height;
    let ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.height / 2, -canvas.width / 2);
    ctx.drawImage(cvs, 0, 0, width, height);
    console.log("crop")
    return canvas.toDataURL('image/jpeg')
  }

  blockOrientation(block: boolean) {
    if (block) this.subscription.unsubscribe();
    else this.subscription = this.deviceMotion.watchAcceleration({ frequency: 300 }).subscribe((acceleration: DeviceMotionAccelerationData) => {
      this.isPortrait = acceleration.x < 3 && acceleration.x > -3;
      this.isLandRight = acceleration.x < -3;
      this.isLandLeft = acceleration.x > 3;
      this.checkNumbers();
    }, err => {
      console.log(err)
    });
  }
}

export interface CroppedImageModel {
  num: number;
  image: string;
  description: string;
  isPortrait: boolean;
  isLandLeft: boolean;
  isLandRight: boolean;
  position: number;
  width: number;
  srcImage: any;
  isOnePhoto: boolean;
  offsetTop: number;
  imageRatio: number;
  id?: number;
  cellLeft: number;
  cellTop: number;
  cellZoom: number;
}

export interface Cell {
  num: number;
  width: number;
  height: number;
  top: number;
  left: number;
  borderRight: number;
  zoomCoef?: number;
}

export interface OrintationMode {
  isPortrait: boolean;
}

export interface ImagePos {

}
