import { Component } from "@angular/core";
import { AlertController, LoadingController, NavController, NavParams, ViewController } from "ionic-angular";
import { CroppedImageModel, GalleryPage } from "../gallery/gallery";
import { DatabaseService } from "../../services/database_service";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { Observable } from "rxjs/Observable";
import { EditScenePage } from "../editScene/editScene";
import { ExportPage } from "../export/export";
import { LibraryPage } from "../library/library";

@Component({
  selector: 'page-storyDetail',
  templateUrl: 'storyDetail.html'
})
export class StoryDetailPage {

  private savedStory: Story;
  private items: Array<CroppedImageModel> = [];
  private tempItems: Array<CroppedImageModel> = [];
  private storyItems: Array<CroppedImageModel> = [];
  private story: Story = {
    images: [],
    title: "Story title",
    description: "Story description",
    created: new Date,
    imageCount: 0
  };
  private boards: number;
  private title: string;
  private description: string;
  private index: number;
  private isPortrait: boolean;
  private srcImage: any;
  private storyToEdit: number;
  private refactoredItem: CroppedImageModel;
  private opacityPDF: number;
  private opacityJPG: number;
  // private storyId: number;
  private imCount: number;
  private storyFromDb: Story;
  private isFromLibrary: boolean = false;
  private useDB: boolean = true;

  constructor(public navCtrl: NavController,
    private params: NavParams,
    public db: DatabaseService,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private loadCtrlL: LoadingController) {
    this.storyToEdit = params.get('story');
    console.log('story to edit: ' + this.storyToEdit)
    console.log('this is not twin')
    // if (this.storyToEdit != null) {
    //   this.fillUpTheList(this.storyToEdit)
    console.log("There is storyId to Edit", this.storyToEdit);
    this.useDB = params.get('useDB')
    console.log('this.useDB: ' + this.useDB)
    // }
    this.tempItems = params.get('items');
    console.log("tempItems:");
    console.log(this.tempItems)
    this.story.title = params.get('title');
    this.story.description = params.get('description');
    this.getOtherImages(this.storyToEdit);
    this.isFromLibrary = params.get('isFromLibrary');
    console.log('isFromLibrary')
    console.log(this.isFromLibrary)
    if (this.boards == null && !this.isFromLibrary)
      this.boards = this.tempItems.length;
    this.refactoredItem = params.get('refactoredItem')
    // this.storyId = params.get('selectedStoryId');
    this.index = params.get('index');
    this.srcImage = params.get('srcImage');
    if (this.index != null) this.tempItems[this.index - 1] = this.refactoredItem;

    for (var i = 0; i < this.boards; i++) {
      this.tempItems[i].num = i + 1;
    }

    this.opacityPDF = 1;
    this.opacityJPG = 0.5;
  }

  onBackClick() {
    let page: any;
    if (this.isFromLibrary) page = LibraryPage
    else page = GalleryPage
    this.navCtrl.push(page, {
      title: this.story.title,
      description: this.story.description,
      param: '1'
    }).then(_ => this.navCtrl.remove(this.navCtrl.indexOf(this.navCtrl.getActive()) - 1))
  }

  viewItem(item) {
    this.navCtrl.push(EditScenePage, {
      item: item,
      index: item.num,
      isPortrait: item.isPortrait,
      allItems: this.items,
      srcImage: this.srcImage,
      title: this.story.title,
      story: this.storyToEdit
    });
  }

  onDoneClick() {
    console.log('onDoneClick');
    this.loadCtrlL.create({
      content: 'Wait while story is saving',
      dismissOnPageChange: true
    }).present();
    let newStory: Story = {
      title: this.story.title,
      description: this.story.description,
      created: new Date,
      imageCount: 0
    };
    if (this.storyToEdit) {
      console.log('story to edit is true O_o')
      let imagesToAdd: Array<Image> = [];
      this.db.getStory(this.storyToEdit).subscribe(story => {
        story.imageCount = this.boards;
        this.db.updateStory(story);
      });
      // if (this.tempItems != null) {
      for (let i of this.items) {
        if (i.id) {
          this.db.updateImage({
            number: i.num,
            image: i.image,
            description: i.description,
            storyId: this.storyToEdit,
            isPortrait: i.isPortrait ? 1 : 0,
            isLandLeft: i.isLandLeft ? 1 : 0,
            isLandRight: i.isLandRight ? 1 : 0,
            position: i.position,
            width: i.width,
            srcImage: i.srcImage,
            isOnePhoto: i.isOnePhoto ? 1 : 0,
            offsetTop: i.offsetTop,
            imageRatio: i.imageRatio,
            id: i.id,
            cellLeft: i.cellLeft,
            cellTop: i.cellTop,
            cellZoom: i.cellZoom
          }).subscribe()
        } else {
          imagesToAdd.push({
            number: i.num,
            image: i.image,
            description: i.description,
            storyId: this.storyToEdit,
            isPortrait: i.isPortrait ? 1 : 0,
            isLandLeft: i.isLandLeft ? 1 : 0,
            isLandRight: i.isLandRight ? 1 : 0,
            position: i.position,
            width: i.width,
            srcImage: i.srcImage,
            isOnePhoto: i.isOnePhoto ? 1 : 0,
            offsetTop: i.offsetTop,
            imageRatio: i.imageRatio,
            cellLeft: i.cellLeft,
            cellTop: i.cellTop,
            cellZoom: i.cellZoom
          });
        }
        console.log("imagesToAdd:");
        console.log(imagesToAdd);
        this.db.addImages(imagesToAdd);
      }
      // }
      this.navCtrl
        .push(LibraryPage)
        .then(() => {
          let index = this.navCtrl.getActive().index;
          this.navCtrl.remove(0, index);
        });
    } else {
      this.db.addStory(newStory)
        .flatMap(story => {
          return Observable.from(this.items)
            .map(rcImg => {
              return {
                image: rcImg.image,
                description: rcImg.description,
                number: rcImg.num,
                storyId: story.id,
                isPortrait: rcImg.isPortrait ? 1 : 0,
                isLandLeft: rcImg.isLandLeft ? 1 : 0,
                isLandRight: rcImg.isLandRight ? 1 : 0,
                position: rcImg.position,
                width: rcImg.width,
                srcImage: rcImg.srcImage,
                isOnePhoto: rcImg.isOnePhoto ? 1 : 0,
                offsetTop: rcImg.offsetTop,
                imageRatio: rcImg.imageRatio,
                cellLeft: rcImg.cellLeft,
                cellTop: rcImg.cellTop,
                cellZoom: rcImg.cellZoom
              };
            })
            .flatMap(image => this.db.addImage(image))
            .toArray()
            .map(array => {
              story.images = array;
              return story;
            });
        }).flatMap((story) => {
          story.mainImageId = story.images[0].id;
          story.imageCount = story.images.length;
          return this.db.updateStory(story).map(it => {
            it.images = story.images
            return it.imageCount
          });
        }).subscribe(story => {
          this.navCtrl
            .push(LibraryPage)
            .then(() => {
              let index = this.navCtrl.getActive().index;
              this.navCtrl.remove(0, index);
            });
        });
    }
  }


  onFabClick() {
    this.navCtrl.push(GalleryPage, {
      param: '1',
      croppedImages: this.items,
      title: this.story.title,
      description: this.story.description,
      isFromLibrary: this.isFromLibrary,
      storyId: this.storyToEdit,
      useDB: false
    })
  }

  private parseImage(image: Image): CroppedImageModel {
    return {
      num: image.number,
      description: image.description,
      image: image.image,
      isPortrait: image.isPortrait == 1,
      isLandLeft: image.isLandLeft == 1,
      isLandRight: image.isLandRight == 1,
      position: image.position,
      width: image.width,
      srcImage: image.srcImage,
      isOnePhoto: image.isOnePhoto == 1,
      offsetTop: image.offsetTop,
      imageRatio: image.imageRatio,
      cellLeft: image.cellLeft,
      cellTop: image.cellTop,
      cellZoom: image.cellZoom
    };
  }

  fillUpTheList(story) {
    this.db.getStoryWithImages(story).subscribe(story => {
      this.storyFromDb = story;
      this.story.title = story.title
    });
  }

  reorderItems(indexes) {
    console.log(indexes);
    let temp;
    temp = this.items[indexes.from];
    this.items[indexes.from] = this.items[indexes.to];
    this.items[indexes.to] = temp;
    this.items.forEach((elem, ind) => elem.num = ind + 1)
  }

  deleteItem(item) {
    let alert = this.alertCtrl.create({
      title: 'Delete Story',
      message: 'Do you really want to delete the image?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Agree',
          handler: () => {
            console.log('Agree clicked');
            this.items.splice(this.items.indexOf(item), 1)
            this.items.forEach((elem, ind) => elem.num = ind + 1)
            this.boards = this.items.length
          }
        }
      ]
    });
    alert.present();
  }

  private getOtherImages(storyToEdit: number) {
    this.db.getStory(storyToEdit).subscribe(s => this.story.title = s.title)
    this.db.getImagesByStory(storyToEdit)
      .subscribe(images => {
        console.log("Method works");
        console.log(storyToEdit)
        console.log(images)
        this.mapImageToCropImageModel(images);
      })
  }

  private mapImageToCropImageModel(images: Array<Image>): Array<CroppedImageModel> {
    if (this.useDB)
      images.forEach(image => {
        this.items.push({
          num: image.number,
          image: image.image,
          description: image.description,
          isPortrait: image.isPortrait == 1,
          isLandLeft: image.isLandLeft == 1,
          isLandRight: image.isLandRight == 1,
          position: image.position,
          width: image.width,
          srcImage: image.srcImage,
          isOnePhoto: image.isOnePhoto == 1,
          offsetTop: image.offsetTop,
          imageRatio: image.imageRatio,
          id: image.id,
          cellLeft: image.cellLeft,
          cellTop: image.cellTop,
          cellZoom: image.cellZoom
        });
      });
    console.log(this.items)
    if (this.items.length != 0) {
      let numb = this.items.length + 1;
      if (!this.isFromLibrary)
        this.tempItems.forEach(item => {
          item.num = numb;
          numb++;
        });
    }
    // if (this.tempItems != null) {
    this.storyItems = this.items.concat(this.tempItems);
    this.items = this.storyItems;
    console.log('this.items:')
    console.log(this.items)
    // }
    this.boards = this.items.length;
    return this.items;
  }

  export() {
    if (this.opacityPDF == 1) {
      this.saveOrUpdateStory(2)
    } else {
      this.saveOrUpdateStory(3)
    }
  }

  private fromCropModeltoImage(item: CroppedImageModel): Image {
    return {
      description: item.description,
      image: item.image,
      id: item.id,
      isOnePhoto: item.isOnePhoto ? 1 : 0,
      isPortrait: item.isPortrait ? 1 : 0,
      isLandLeft: item.isLandLeft ? 1 : 0,
      isLandRight: item.isLandRight ? 1 : 0,
      number: item.num,
      offsetTop: item.offsetTop,
      position: item.position,
      srcImage: item.srcImage,
      storyId: this.storyToEdit,
      width: item.width,
      imageRatio: item.imageRatio,
      cellLeft: item.cellLeft,
      cellTop: item.cellTop,
      cellZoom: item.cellZoom
    }
  }

  private saveOrUpdateStory(status: number) {
    let newStory: Story = {
      title: this.story.title,
      description: this.story.description,
      created: new Date,
      imageCount: 0
    };
    if (this.storyToEdit) {
      console.log('right');
      let imagesToAdd: Array<Image> = [];
      this.db.getStory(this.storyToEdit).subscribe(story => {
        story.imageCount = this.boards;
        this.db.updateStory(story);
      });
      if (this.tempItems != null) {
        for (let i of this.tempItems) {
          imagesToAdd.push({
            number: i.num,
            image: i.image,
            description: i.description,
            storyId: this.storyToEdit,
            isPortrait: i.isPortrait ? 1 : 0,
            position: i.position,
            width: i.width,
            srcImage: i.srcImage,
            isOnePhoto: i.isOnePhoto ? 1 : 0,
            offsetTop: i.offsetTop,
            imageRatio: i.imageRatio,
            isLandLeft: i.isLandLeft ? 1 : 0,
            isLandRight: i.isLandRight ? 1 : 0,
            cellLeft: i.cellLeft,
            cellTop: i.cellTop,
            cellZoom: i.cellZoom
          });
        }
        this.db.addImages(imagesToAdd);
      }
      this.db.getStory(this.storyToEdit).subscribe(story => {
        switch (status) {
          case 1:
            this.navCtrl
              .push(LibraryPage)
              .then(() => {
                let index = this.navCtrl.getActive().index;
                this.navCtrl.remove(0, index);
              });
            break;
          case 2:
            this.navCtrl
              .push(ExportPage, {
                storyExportId: story.id,
                storyExportTitle: story.title,
                storyExportCreated: story.created,
                storyExportImageCount: this.boards,
                exportType: status
              })
              .then(() => {
                let index = this.navCtrl.getActive().index;
                this.navCtrl.remove(0, index);
                this.navCtrl.insert(0, LibraryPage);
                console.log(this.navCtrl.getViews());
              });
            break;
          case 3:
            this.navCtrl
              .push(ExportPage, {
                storyExportId: story.id,
                storyExportTitle: story.title,
                storyExportCreated: story.created,
                storyExportImageCount: this.boards,
                exportType: status
              })
              .then(() => {
                let index = this.navCtrl.getActive().index;
                this.navCtrl.remove(0, index);
                this.navCtrl.insert(0, LibraryPage);
              });
            break;
        }
      });
    } else {
      console.log('left');
      this.db.addStory(newStory)
        .flatMap(story => {
          return Observable.from(this.items)
            .map(rcImg => {
              return {
                image: rcImg.image,
                description: rcImg.description,
                number: rcImg.num,
                storyId: story.id,
                isPortrait: rcImg.isPortrait ? 1 : 0,
                position: rcImg.position,
                width: rcImg.width,
                srcImage: rcImg.srcImage,
                isOnePhoto: rcImg.isOnePhoto ? 1 : 0,
                offsetTop: rcImg.offsetTop,
                imageRatio: rcImg.imageRatio,
                isLandLeft: rcImg.isLandLeft ? 1 : 0,
                isLandRight: rcImg.isLandRight ? 1 : 0,
                cellLeft: rcImg.cellLeft,
                cellTop: rcImg.cellTop,
                cellZoom: rcImg.cellZoom
              };
            })
            .flatMap(image => this.db.addImage(image))
            .toArray()
            .map(array => {
              story.images = array;
              return story;
            });
        }).flatMap((story) => {
          story.mainImageId = story.images[0].id;
          story.imageCount = story.images.length;
          return this.db.updateStory(story).map(it => {
            it.images = story.images;
            return it;
          });
        }).subscribe(story => {
          switch (status) {
            case 1:
              this.navCtrl
                .push(LibraryPage)
                .then(() => {
                  let index = this.navCtrl.getActive().index;
                  // this.navCtrl.remove(0, index);
                });
              break;
            case 2:
              this.navCtrl
                .push(ExportPage, {
                  storyExportId: story.id,
                  storyExportTitle: story.title,
                  storyExportCreated: story.created,
                  storyExportImageCount: this.boards,
                  exportType: status
                })
                .then(() => {
                  let index = this.navCtrl.getActive().index;
                  this.navCtrl.remove(0, index);
                  this.navCtrl.insert(0, LibraryPage);
                  console.log(this.navCtrl.getViews());
                });
              break;
            case 3:
              this.navCtrl
                .push(ExportPage, {
                  storyExportId: story.id,
                  storyExportTitle: story.title,
                  storyExportCreated: story.created,
                  storyExportImageCount: this.boards,
                  exportType: status
                })
                .then(() => {
                  let index = this.navCtrl.getActive().index;
                  this.navCtrl.remove(0, index);
                  this.navCtrl.insert(0, LibraryPage);
                  console.log(this.navCtrl.getViews());
                });
              break;
          }
        });
    }
  }

  private switchConvertingMode(mode: number) {
    switch (mode) {
      case 1: {
        this.opacityPDF = 1;
        this.opacityJPG = 0.5;
        break;
      } case 2: {
        this.opacityJPG = 1;
        this.opacityPDF = 0.5;
        break;
      }
    }
  }

  loadStoryInfo(storyId: number) {
    this.db.getStory(storyId)
      .subscribe(story => {
        this.story.title = story.title;
        this.story.description = story.description;
        this.boards = story.imageCount;
      });
  }

  private loadImages(storyId: number) {
    this.db.getStoryWithImages(storyId)
      .subscribe(story => {
        this.story = story;
        this.story.title = story.title;
        this.story.description = story.description;
        story.images.forEach((elem, pos) => {
          // this.items.push({
          //   description: elem.description,
          //   image: elem.image,
          //   imageRatio: elem.imageRatio,
          //   isLandLeft: elem.isLandLeft == 1,
          //   isLandRight: elem.isLandRight == 1,
          //   isOnePhoto: elem.isOnePhoto == 1,
          //   isPortrait: elem.isPortrait == 1,
          //   num: elem.number,
          //   offsetTop: elem.offsetTop,
          //   position: elem.position,
          //   srcImage: elem.srcImage,
          //   width: elem.width
          // })
        });
      }, err => console.log(err));
  }
}
