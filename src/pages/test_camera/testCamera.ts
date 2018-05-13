import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { CameraPreview, CameraPreviewOptions } from '@ionic-native/camera-preview';

@Component({
  selector: 'page-testCamera',
  templateUrl: 'testCamera.html'
})
export class TestCameraPage implements AfterViewInit {

  @ViewChild('cameraPreviewContainer') container: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('secondImage') secondImage: ElementRef;
  private testImage: string;
  private widht = 800;
  private height = 600;
  anImage: any;

  constructor(
    public navCtrl: NavController
    , public navParams: NavParams
    , private platform: Platform
    , private cameraPreview: CameraPreview
  ) { }

  // ngAfterViewInit() {
  // this.platform.ready()
  //   .then(() => {
  //     // not really needed, but just in case

  //     const el: HTMLElement = this.container.nativeElement;

  //     const options: CameraPreviewOptions = {
  //       y: el.getBoundingClientRect().top,
  //       width: el.offsetWidth,
  //       height: el.offsetHeight
  //     };

  //     this.cameraPreview.startCamera(options)
  //       .then(() => {
  //         console.log('Camera preview started!');
  //       })
  //       .catch(e => {
  //         console.log('Error starting camera preview', e);
  //       });

  //   });
  // }

  ngOnDestroy() {
    // this.cameraPreview.stopCamera().catch(() => { });
  }

  ngAfterViewInit() {
    var canvas = this.canvas.nativeElement;
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    var url: any;
    var butt = this.anImage;
    imageObj.src = '../assets/images/pin_up_001-wallpaper-1920x1080.jpg';
    imageObj.onload = function () {

      var sourceX = 0;
      var sourceY = 0;
      var sourceWidth = imageObj.width;
      var sourceHeight = imageObj.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = canvas.width / 2 - destWidth / 2;
      var destY = canvas.height / 2 - destHeight / 2;

      context.drawImage(imageObj, sourceX, sourceY, sourceWidth,
        sourceHeight, destX, destY, destWidth, destHeight);

    }



    // this.secondImage.nativeElement.src = canvas.toDataURL('image/jpeg');
    // console.log(this.secondImage.nativeElement.src)
  }

  click() {
    console.log(this.anImage = this.canvas.nativeElement.toDataURL('image/png'));
    
  }
}