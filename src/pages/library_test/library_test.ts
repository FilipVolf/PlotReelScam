import { TestCameraPage } from "../test_camera/testCamera";
import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Storage } from "@ionic/storage";
import { CameraPreviewPage } from "../cameraPreview/cameraPreview";
import { DatabaseService } from "../../services/database_service";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import { ImageUtils } from "../../utils/image_converting_utils";
import { CreateStoryPage } from "../create-story/create-story";
import { Observable } from "rxjs/Observable";
import { EditStoryPage } from "../editStory/editStory";
import { ImageCrop } from "../../utils/image_crop";
import { StoryDetailPage } from '../storyDetail/storyDetail';

@Component({
  selector: 'page-library_test',
  templateUrl: 'library_test.html'
})
export class LibraryTestPage {

  private searchVisibility: boolean = true;
  private items: Array<Story> = [];
  private imageUrl;

  constructor(public navCtrl: NavController, private splash: SplashScreen, 
  public storage: Storage, public db: DatabaseService, private crop: ImageCrop) {
    this.splash.hide();
    let story: Story
    // let trueStory: Story = {
    //   title: "True Title",
    //   description: "True Item description",
    //   created: new Date(),
    //   mainImage: "http://www.wallpapermaiden.com/image/2016/06/06/anime-girl-landscape-city-view-anime-136.jpg"
    // };
    // this.items.push(story);
    // this.items.push(trueStory);
    storage.ready().then(() => {
      storage.set('name', 'max');
      storage.set('age', '12');
      storage.set('gender', 'male');

      // set a key/value
      // storage.set('name', 'Max');

      // Or to get a key/value pair
      // storage.get('age').then((val) => {
      //   console.log('Your age is', val);
      // })
      // storage.get('name').then(val => {
      //   this.name = val;
      // });
      // storage.get('age').then(val => {
      //   this.age = val;
      // });
      // storage.get('gender').then(val => {
      //   this.gender = val;
      // });
    });


  }

  private base64: string = "";

  onFabClick() {
    this.navCtrl.push(CreateStoryPage);
  }

  // private testSaveImage() {
  //   let b64 = ImageUtils.toPureBase64(this.base64);
  //   ImageUtils.base64ToBlob(b64.data, b64.type)
  //     .do((blob) => console.log(blob))
  //     .flatMap((blob) => ImageUtils.blobToBase64(blob))
  //     .subscribe((b64) => this.imageUrl = b64);
  // }

  ngOnInit() {
    console.log("Search bar visibility is: ", this.searchVisibility);
    let image = document.getElementsByClassName("resize-image");
    let container = document.getElementsByClassName("resize-container");
    let overlay = document.getElementsByClassName("overlay");
    this.crop.init(image[0], container[0], overlay[0]);
  }

  startResize(e) {
    if (this.crop.isInitialized) {
      this.crop.startResize(e);
    }
  }

  startMove(e) {
    if (this.crop.isInitialized) {
      this.crop.startMoving(e);
    }
  }

  cropImage() {
    // this.crop.crop();
    let image = (document.getElementsByClassName("resize-image")[0] as HTMLImageElement);
    let overlay = document.getElementsByClassName("overlay")[0] as HTMLElement;
    ImageUtils.cropImagesFrom(image, overlay).then((images: Array<string>) => {
      console.log(images);
      for (let i = 0; i < images.length; i++) {
        let image = images[i];
        window.open(image);
        console.log(image);
      }
    });
  }

  changeSearchVisibility(searchVisibility: boolean) {
    if (searchVisibility === false) {
      this.searchVisibility = true;
    } else if (searchVisibility === true) {
      this.searchVisibility = false;
    }
    console.log("Search bar visibility is: ", this.searchVisibility)
  }

  openTestCamera() {
    this.navCtrl.push(TestCameraPage);
  }

  openCameraPreview() {
    this.navCtrl.push(CameraPreviewPage);
  }

  openEditStory() {
    this.navCtrl.push(EditStoryPage);
  }

  openStoryDetail() {
    this.navCtrl.push(StoryDetailPage);
  }
}
