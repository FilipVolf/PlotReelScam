import { Component } from "@angular/core";
import { LoadingController, NavController, NavParams } from "ionic-angular";
import { DatabaseService } from "../../services/database_service";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { LibraryPage } from "../library/library";
import { CroppedImageModel, GalleryPage } from "../gallery/gallery";
import { EditScenePage } from "../editScene/editScene";
import { ExportPage } from "../export/export";
import "rxjs/add/operator/filter";

@Component({
  selector: 'page-editStory',
  templateUrl: 'editStory.html'
})
export class EditStoryPage {

  private story: Story;
  private images: Array<Image>;
  private tempImages: Array<Image>;
  private title: string;
  private description: string;
  private storyId: number;
  private imaCount: number;
  private refactoredItem: CroppedImageModel;

  constructor(public navCtrl: NavController,
    private navParams: NavParams,
    private db: DatabaseService,
    public loadCtrl: LoadingController) {
    this.storyId = navParams.get('selectedStoryId');
    this.refactoredItem = navParams.get('refactoredItem');
    this.loadStoryInfo(this.storyId);
    this.loadImages(this.storyId);
  }

  onBackClick() {
    this.navCtrl.popTo(LibraryPage);
  }

  insertItem(item: CroppedImageModel) {
    this.images[item.num - 1] = {
      description: item.description,
      image: item.image,
      id: this.images[item.num - 1].id,
      isOnePhoto: this.images[item.num - 1].isOnePhoto,
      isPortrait: this.images[item.num - 1].isPortrait,
      isLandLeft: this.images[item.num - 1].isLandLeft ? 1 : 0,
      isLandRight: this.images[item.num - 1].isLandRight ? 1 : 0,
      number: this.images[item.num - 1].number,
      offsetTop: this.images[item.num - 1].offsetTop,
      position: this.images[item.num - 1].position,
      srcImage: this.images[item.num - 1].srcImage,
      storyId: this.images[item.num - 1].storyId,
      width: this.images[item.num - 1].width,
      imageRatio: this.images[item.num - 1].imageRatio,
      cellTop: this.images[item.num - 1].cellTop,
      cellLeft: this.images[item.num - 1].cellLeft,
      cellZoom: this.images[item.num - 1].cellZoom
    }
  }

  loadStoryInfo(storyId: number) {
    this.db.getStory(storyId)
      .subscribe(story => {
        this.title = story.title;
        this.description = story.description;
        this.imaCount = story.imageCount;
      });
  }

  private loadImages(storyId: number) {
    let load = this.loadCtrl.create({
      content: 'Please wait while images are loading'
      // dismissOnPageChange: true
    });
    load.present();
    this.db.getStoryWithImages(storyId)
      .subscribe(story => {
        this.story = story;
        this.title = story.title;
        this.description = story.description;
        this.images = story.images;
        if (this.refactoredItem != null)
          this.insertItem(this.refactoredItem);
        // load.dismiss();
      }, err => console.log(err), () => {
        load.dismiss();
      });
  }

  onTitleInput(event) {
    console.log('input');
    this.title = event.target.value;
  }

  onDescriptionInput(event) {
    console.log('input');
    this.description = event.target.value;
  }

  onDoneClick() {
    let story: Story = {
      id: this.story.id,
      title: this.title,
      description: this.description,
      created: new Date,
      mainImageId: this.story.images[0].id,
      imageCount: this.images.length
    };
    this.db.updateStory(story).subscribe(it => {
      this.images.forEach(element => this.db.updateImage(element).subscribe())
      this.navCtrl.push(LibraryPage)
        .then(() => {
          let index = this.navCtrl.getActive().index;
          this.navCtrl.remove(0, index);
        });
    }, err => console.log(err));
  }

  openEditScene(image: Image) {
    let cropImage: CroppedImageModel = {
      description: image.description,
      image: image.image,
      num: image.number,
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
    this.navCtrl.push(EditScenePage, {
      item: cropImage,
      isFromEditStory: true,
      storyId: this.storyId
    });
  }

  onFabClick() {
    this.navCtrl.push(GalleryPage, {
      storyId: this.story.id,
      title: this.story.title,
      description: this.story.description,
      param: '1',
      useDB: true
    });
  }

  exportStory() {
    this.navCtrl.push(ExportPage, {
      storyExportId: this.story.id,
      storyExportTitle: this.story.title,
      storyExportCreated: this.story.created,
      storyExportImageCount: this.story.imageCount,
      exportType: 3
    })
  }

}
