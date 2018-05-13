import { Component } from "@angular/core";
import {
  ActionSheetController,
  LoadingController,
  NavController,
  NavParams,
  Platform,
  ToastController
} from "ionic-angular";
import { SocialSharing } from "@ionic-native/social-sharing";
import { DatabaseService } from "../../services/database_service";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { File } from "@ionic-native/file";
import { FilePath } from "@ionic-native/file-path";
import { ImageUtils } from "../../utils/image_converting_utils";
import { LibraryPage } from "../library/library";
import jsPDF from 'jspdf';
// import { NativeStorage } from '@ionic-native/native-storage';


declare var cordova: any;
declare var cod: any;

@Component({
  selector: 'page-export',
  templateUrl: 'export.html'
})
export class ExportPage {

  private storyExportId: number;
  private exportedStory: Story;
  private pathToPlotreel: string;
  private pathToPlotreelIOS: string;
  private pathToPlot: string;
  private storyExportTitle: string;
  private storyExportCreated: Date;
  private storyExportImageCount: number;
  private exportType: number;
  private logoType: boolean;
  private pytb: string;
  private directoryPdf: string;
  private exportLoader: any;

  constructor(public navCtrl: NavController,
    private navParams: NavParams,
    private socialSharing: SocialSharing,
    public actionSheetController: ActionSheetController,
    private db: DatabaseService,
    private platform: Platform,
    private file: File,
    private filePath: FilePath,
    private loadCrtl: LoadingController,
    private toastCtrl: ToastController) {
    this.storyExportId = navParams.get('storyExportId');
    this.storyExportTitle = navParams.get('storyExportTitle');
    this.storyExportCreated = navParams.get('storyExportCreated');
    this.storyExportImageCount = navParams.get('storyExportImageCount');
    this.exportType = navParams.get('exportType');
    console.log(jsPDF)
    switch (this.exportType) {
      case 2:
        this.logoType = false;
        break;
      case 3:
        this.logoType = true;
        break;
    }

    this.getStory(this.storyExportId, this.exportType);
    this.pathToPlotreel = "file:///storage/emulated/0/Plotreel/";
    this.pathToPlotreelIOS = "";
  }

  onBackClick() {
    if (this.platform.is('ios')) {
      let story = this.exportedStory;
      let rr = this.pathToPlotreelIOS;

      this.file.removeRecursively(rr, story.title)
        .then(() => {
        })
        .catch(_ => {

        });
    }
    this.navCtrl.popTo(LibraryPage);
  }

  presentActionSheet() {
    if (!this.logoType) {
      let actionSheet = this.actionSheetController.create({
        title: 'Choose the way to share',
        buttons: [
          {
            text: 'Email',
            handler: () => {
              if (this.platform.is('android')) {
                this.socialSharing.canShareViaEmail()
                  .then(() => {
                    let title = this.exportedStory.title;
                    let text = this.exportedStory.description;
                    let images: Array<string> = [];
                    this.exportedStory.images.forEach(el => {
                      images.push(el.image);
                    });
                    console.log(images)
                    this.socialSharing.shareViaEmail(text, title, [''], [''], [''], this.directoryPdf)
                      .then((data) => {
                        console.log('Shared data', data);
                      });
                  });
              } else if (this.platform.is('ios')) {
                // this.socialSharing.canShareViaEmail()
                //   .then(() => {
                let title = this.exportedStory.title;
                let text = this.exportedStory.description;
                let images: Array<string> = [];
                this.exportedStory.images.forEach(el => {
                  images.push(el.image);
                });
                this.socialSharing.shareViaEmail(text, title, [''], [''], [''], this.directoryPdf)
                  .then((data) => {
                    console.log('Shared data', data);
                  });
                // }).catch(v => {
                //   console.log(v);
                // });
              }
              console.log('Email was clicked');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel was clicked');
            }
          }
        ]
      });
      actionSheet.present();
    } else {
      let actionSheet = this.actionSheetController.create({
        title: 'Choose the way to share',
        buttons: [
          {
            text: 'Email',
            handler: () => {
              if (this.platform.is('android')) {
                this.socialSharing.canShareViaEmail()
                  .then(() => {
                    let title = this.exportedStory.title;
                    let text = this.exportedStory.description;
                    let images: Array<string> = [];
                    this.exportedStory.images.forEach(el => {
                      images.push(el.image);
                    });
                    console.log(images)
                    this.socialSharing.shareViaEmail(text, title, [''], [''], [''], images)
                      .then((data) => {
                        console.log('Shared data', data);
                      });
                  }).catch(v => console.log(v));
              } else if (this.platform.is('ios')) {
                // this.socialSharing.canShareViaEmail()
                //   .then(() => {
                let title = this.exportedStory.title;
                let text = this.exportedStory.description;
                let images: Array<string> = [];
                this.exportedStory.images.forEach(el => {
                  images.push(el.image);
                });
                this.socialSharing.shareViaEmail(text, title, [''], [''], [''], images)
                  .then((data) => {
                    console.log('Shared data', data);
                  });
                // }).catch(v => {
                //   console.log(v);
                // });
              }
              console.log('Email was clicked');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel was clicked');
            }
          }
        ]
      });
      actionSheet.present();
    }
  }

  private getStory(storyExportId: number, type: number) {
    // let story = this.exportedStory;
    this.exportLoader = this.loadCrtl.create({
      content: 'Please wait while story is exporting...'
    });
    this.exportLoader.present();
    this.db.getStoryWithImages(storyExportId)
      .subscribe(story => {
        this.exportedStory = story;
        console.log("exportedStory", this.exportedStory.title);
      }, err => console.log(err), () => {
        // loading.dismiss();
        if (type == 3) {
          // this.saveJPEG();
          this.exportLoader.dismiss();
        } else {
          this.savePDF(this.exportedStory);
        }
      });
  }

  private saveJPEG() {
    //CREATE MAIN DIRECTORY
    let story = this.exportedStory;
    // this.exportLoader = this.loadCrtl.create({
    //   content: 'Please wait while story exporting...'
    // });
    // loading.present();
    let that = this;
    if (this.platform.is('android')) {
      this.file.createDir(this.file.externalRootDirectory, 'Plotreel', false)
        .then(value => {
          this.createPlotDirAndExport(story);
          // loading.dismissAll();
          that.exportLoader.dismiss()
        })
        .catch(value => {
          that.exportLoader.dismiss()
          console.log("Create Plotreel exeption", value);
          console.log("Plotreel already created");
          this.file.checkDir(this.pathToPlotreel, story.title)
            .then(v => {
              console.log("exists");
              let story = this.exportedStory;
              let rr = this.pathToPlotreel;
              this.file.removeRecursively(rr, story.title)
                .then(() => {
                  this.createPlotDirAndExport(story);
                  // loading.dismissAll();
                  that.exportLoader.dismiss()
                });
            })
            .catch(v => {
              console.log("do not exists");
              this.createPlotDirAndExport(story);
              // loading.dismissAll();
              that.exportLoader.dismiss()
            });
        })
    } else if (this.platform.is('ios')) {
      this.file.createDir(this.file.documentsDirectory, 'Plotreel', true)
        .then(value => {
          // let story = this.exportedStory;
          // let rr = this.pathToPlotreel;
          // this.file.checkDir(this.file.documentsDirectory, 'Plotreel').then(v =>{
          //   this.file.removeRecursively(this.)
          // })
          console.log("Plotreel was created");
          console.log("f", value.nativeURL);
          this.pathToPlotreelIOS = value.nativeURL;
          // this.file.checkDir(this.pathToPlotreelIOS, this.exportedStory.title).then(v => {
          //   this.file.removeRecursively(this.pathToPlotreelIOS, this.exportedStory.title)
          //     .then(v => {
          //       console.log("Remove was successull recursively");
          //     });
          // });
          console.log("Go deeper");
          this.createPlotDirAndExport(story);
          // loading.dismissAll();
          that.exportLoader.dismiss()
        })
        .catch(value => {
          console.log("Plotreel already existed")
          this.removeDir();
        })
      // this.file.createDir(this.file.)
      // console.log("Story to export", this.exportedStory);
    }

  }

  private saveStoryImagesToDir(story: Story, nativeUrl: string) {
    story.images.forEach(el => {
      let image = ImageUtils.toPureBase64(el.image);
      ImageUtils.base64ToBlob(image.data, image.type).subscribe(blob => {
        this.file.writeFile(nativeUrl, story.title + el.number.toString() + ".jpeg", blob)
          .then(value => {
            console.log("Success creating image at number ", image);
          });
      });
    });
  }

  private createPlotDirAndExport(story: Story) {
    if (this.platform.is('android')) {
      this.file.createDir(this.pathToPlotreel, story.title, true)
        .then(v => {
          this.pathToPlot = v.nativeURL;
          this.saveStoryImagesToDir(story, this.pathToPlot);
          let toast = this.toastCtrl.create({
            message: 'Story images were exported to Internal Memory',
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
        })
        .catch(v => {
          console.log("Not");
        });
    } else if (this.platform.is('ios')) {
      this.file.createDir(this.pathToPlotreelIOS, story.title, true)
        .then(v => {
          let pathTo = v.nativeURL;
          this.saveStoryImagesToDir(story, pathTo);
          let toast = this.toastCtrl.create({
            message: 'Story images were exported to Internal Memory',
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
        })
        .catch(v => {
          console.log("Not");
        });
    }

  }

  private getBase64Image(url): Promise<string> {
    return new Promise(resolve => {
      var data, canvas, ctx;
      var img = new Image();
      img.onload = () => {
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        data = canvas.toDataURL();
        resolve(data);
      }
      img.src = url;
    })
  }

  private savePDF(story: Story) {
    // this.exportLoader = this.loadCrtl.create({
    //   content: 'Please wait while story exporting...'
    // });
    // this.exportLoader.present();
    console.log("SHARE PDF");
    if (story.images[0].isPortrait) {
      this.getBase64Image('../www/assets/images/framep.png').then(result => {
        this.getBase64Image('../www/assets/images/powered_logo.png').then(logo => {
          var doc = new jsPDF("p", "mm", "a4");
          story.images.forEach((image, pos) => {
            doc.addImage(result, 'PNG', 15.5, 21.75, 179, 253.5)
            doc.addImage(logo, 'PNG', 150, 10, 55, 7)
            doc.addImage(image.image, 'PNG', 31, 43.5, 148, 210)
            doc.setFont("sans-serif");
            doc.setFontType("normal");
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(16)
            doc.text(21, 30, image.number.toString())
            doc.setFont("helvetica");
            doc.setFontType("italic");
            doc.setTextColor(0, 0, 0)
            let p = 7
            let y = 282
            let t = image.description
            let text = doc.splitTextToSize(t, 180)
            if (text.length == 1) {
              text = doc.splitTextToSize(t, 180)
              doc.setFontSize(16)
              p = 6
              console.log("1")
            } else if (text.length == 2) {
              text = doc.splitTextToSize(t, 210)
              doc.setFontSize(14)
              p = 5
              console.log("2")
            } else if (text.length == 3) {
              text = doc.splitTextToSize(t, 240)
              doc.setFontSize(13)
              p = 4
              console.log("3")
            } else if (text.length == 4) {
              text = doc.splitTextToSize(t, 270)
              doc.setFontSize(12)
              p = 4
              y = y - 2
              console.log("4")
            } else if (text.length > 4) {
              text = doc.splitTextToSize(t, 350)
              doc.setFontSize(9)
              p = 3
              y = y - 3
              console.log("5")
            }
            let posit = 0
            for (let i in text) {
              doc.text(16, y + p * posit, text[i])
              posit++;
            }
            if (pos != story.imageCount - 1)
              doc.addPage();
            console.log('pos: ' + pos)
          }) //foreach end
          var folderpath;
          var fileName: string;
          if (this.platform.is('android')) {
            var blob = doc.output('dataurlstring');
            // The base64 content
            var myBase64 = blob.replace('data:application/pdf;base64,', '');
            // Define the mimetype of the file to save, in this case a PDF
            var contentType = "application/pdf";
            // The path where the file will be saved
            folderpath = "file:///storage/emulated/0/";
            // The name of your file

            if (story.title == '')
              fileName = "Plotreel_Story.pdf";
            else
              fileName = story.title + ".pdf"
            this.savebase64AsPDF(folderpath, fileName, myBase64, contentType)
          } else if (this.platform.is('ios')) {
            var blob = doc.output('dataurlstring');
            // The base64 content
            var myBase64 = blob.replace('data:application/pdf;base64,', '');
            // Define the mimetype of the file to save, in this case a PDF
            var contentType = "application/pdf";
            // The path where the file will be saved
            folderpath = cordova.file.documentsDirectory;
            console.log('folderPath')
            console.log(folderpath)
            // The name of your file
            if (story.title == '')
              fileName = "Plotreel_Story.pdf";
            else
              fileName = story.title + ".pdf"
            this.savebase64AsPDF(folderpath, fileName, myBase64, contentType)
          }
        })
      })
    } else {
      this.getBase64Image('../www/assets/images/framel.png').then(result => {
        this.getBase64Image('../www/assets/images/powered_logo.png').then(logo => {
          var doc = new jsPDF("l", "mm", "a4");
          story.images.forEach((image, pos) => {
            doc.addImage(result, 'PNG', 21.75, 15.5, 253.5, 179)
            doc.addImage(logo, 'PNG', 237, 5, 55, 7)
            doc.addImage(image.image, 'PNG', 43.5, 31, 210, 148)
            doc.setFont("sans-serif");
            doc.setFontType("normal");
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(16)
            doc.text(27, 24, image.number.toString())
            doc.setFont("helvetica");
            doc.setFontType("italic");
            doc.setTextColor(0, 0, 0)
            let p = 7
            let y = 200
            let t = image.description
            let text = doc.splitTextToSize(t, 300)
            if (text.length == 1) {
              text = doc.splitTextToSize(t, 240)
              doc.setFontSize(16)
              p = 6
              console.log("1")
            } else if (text.length == 2) {
              text = doc.splitTextToSize(t, 330)
              doc.setFontSize(14)
              p = 5
              console.log("2")
            } else if (text.length == 3) {
              text = doc.splitTextToSize(t, 400)
              doc.setFontSize(12)
              p = 4
              console.log("3")
            } else if (text.length == 4) {
              text = doc.splitTextToSize(t, 430)
              doc.setFontSize(11)
              p = 4
              y = y - 2
              console.log("4")
            } else if (text.length > 4) {
              text = doc.splitTextToSize(t, 500)
              doc.setFontSize(9)
              p = 3
              y = y - 3
              console.log("5")
            }
            let posit = 0
            for (let i in text) {
              doc.text(text[i], 22, y + p * posit)
              posit++;
            }
            if (pos != story.imageCount - 1)
              doc.addPage();
            console.log('pos: ' + pos)
          }) //foreach end
          var folderpath;
          var fileName: string;
          if (this.platform.is('android')) {
            var blob = doc.output('dataurlstring');
            // The base64 content
            var myBase64 = blob.replace('data:application/pdf;base64,', '');
            // Define the mimetype of the file to save, in this case a PDF
            var contentType = "application/pdf";
            // The path where the file will be saved
            folderpath = "file:///storage/emulated/0/";
            // The name of your file

            if (story.title == '')
              fileName = "Plotreel_Story.pdf";
            else
              fileName = story.title + ".pdf"
            this.savebase64AsPDF(folderpath, fileName, myBase64, contentType)
          } else if (this.platform.is('ios')) {
            var blob = doc.output('dataurlstring');
            // The base64 content
            var myBase64 = blob.replace('data:application/pdf;base64,', '');
            // Define the mimetype of the file to save, in this case a PDF
            var contentType = "application/pdf";
            // The path where the file will be saved
            folderpath = cordova.file.documentsDirectory;
            console.log('folderPath')
            console.log(folderpath)
            // The name of your file
            if (story.title == '')
              fileName = "Plotreel_Story.pdf";
            else
              fileName = story.title + ".pdf"
            this.savebase64AsPDF(folderpath, fileName, myBase64, contentType)
          }
        })
      })
    }
  }

  savebase64AsPDF(folderpath, filename, content, contentType) {
    // Convert the base64 string in a Blob
    let that = this;
    var DataBlob = this.b64toBlob(content, contentType, 512);
    console.log("Starting to write the file :3");
    (window as any).resolveLocalFileSystemURL(folderpath, function (dir) {
      console.log("Access to the directory granted succesfully");
      dir.getFile(filename, { create: true }, function (file) {
        console.log("File created succesfully.");
        file.createWriter(function (fileWriter) {
          console.log("Writing content to file");
          fileWriter.write(DataBlob);
          that.exportLoader.dismiss();
          let toast = that.toastCtrl.create({
            message: 'Exporting is successful',
            duration: 2000,
            position: 'middle'
          });
          toast.present()
          that.directoryPdf = folderpath + filename;
          // cordova.plugins.fileOpener2.open(
          //   folderpath + filename,
          //   'application/pdf',
          //   {
          //     error: function (e) {
          //       console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
          //     },
          //     success: function () {
          //       console.log('file opened successfully');
          //     }
          //   }
          // );
        }, function () {
          alert('Unable to save file in path ' + folderpath);
        });
      });
    });
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }


  // private generateHtml(image: Image) {
  //   return `<div style="clear: both; margin-bottom: 5mm; margin-top: 5mm;">
  //     <div class="container" style="float: left; border: 2mm solid black; opacity: 0.8; margin-right: 2mm; margin-left: 2mm; width:210mm; height:278mm; display: flex;
  // justify-content: flex-start;
  // position: relative;">
  //       <div class="number" style="width: 5mm; height: 5mm; position: absolute; background-color: #000000; text-align: center; color: #FFFFFF; opacity: 0.8;">${image.number}</div>
  //       <img class="image" style="width: 140mm; display: block;
  // margin: auto;" src="${image.image}">

  //   </div>
  //     <div><p>${image.description}</p></div>
  //   </div>`;
  // }

  presentDeleteAlert() {
    let actionSheet = this.actionSheetController.create({
      title: 'Are you want to delete exported story?',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.removeDir();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel was clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  delete() {
    this.file.removeDir(this.file.documentsDirectory, 'Plotreel')
      .then(v => {
        console.log("Remove success");
      })
      .catch(v => {
        console.log("Not success remove");
      });
  }

  private removeDir() {
    if (this.platform.is('android')) {
      let story = this.exportedStory;
      let rr = this.pathToPlotreel;

      this.file.removeRecursively(rr, story.title)
        .then(() => {
          let toast = this.toastCtrl.create({
            message: 'Exported story was deleted',
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
        })
        .catch(_ => {

        });
    } else if (this.platform.is('ios')) {
      let story = this.exportedStory;
      let rr = this.pathToPlotreelIOS;

      this.file.removeRecursively(rr, story.title)
        .then(() => {
          let toast = this.toastCtrl.create({
            message: 'Exported story was deleted',
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
        })
        .catch(_ => {

        });
    }

  }
}
