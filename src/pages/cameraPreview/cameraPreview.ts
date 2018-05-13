import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { CameraPreview } from 'ionic-native';
 
@Component({
  selector: 'page-cameraPreview',
  templateUrl: 'cameraPreview.html'
})
export class CameraPreviewPage {
 
  constructor(platform: Platform) {
    platform.ready().then(() => {
 
      StatusBar.styleDefault();
      Splashscreen.hide();
 
      let tapEnabled: any = false;
      let dragEnabled: any = false;
      let toBack: any = true;
      let alpha = 1;
      let rect: any = {
        x: 0, 
        y: 0, 
        width: platform.width(), 
        height: platform.height()
      };
 
      CameraPreview.startCamera(
        rect,
        'rear',
        tapEnabled,
        dragEnabled,
        toBack,
        alpha
      );
 
    });
  }
}