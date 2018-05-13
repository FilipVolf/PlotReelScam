import { Component, ViewChild } from "@angular/core";
import { AlertController, LoadingController, NavController, Platform, Searchbar } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Storage } from "@ionic/storage";
import { DatabaseService } from "../../services/database_service";
import "rxjs/add/operator/do";
import "rxjs/add/observable/from";
import "rxjs/add/operator/toArray";
import "rxjs/add/operator/filter";
import { Observable } from "rxjs/Observable";
import { ImageCrop } from "../../utils/image_crop";
import { EditStoryPage } from "../editStory/editStory";
import { ExportPage } from "../export/export";
import { CreateStoryPage } from "../create-story/create-story";
import { StoryDetailTwinPage } from "../storyDetail/storyDetailTwin";
import { StoryDetailPage } from "../storyDetail/storyDetail";

declare var cordova: any;


@Component({
  selector: 'page-library',
  templateUrl: 'library.html'
})
export class LibraryPage {

  private searchVisibility: boolean = true;
  private items: Array<Story> = [];
  private itemsBackUp: Array<Story> = [];
  private imageSrc: string = null;
  private ids: Array<number> = [];
  private marginTop: number = 0;
  @ViewChild('sear') searchBar: Searchbar;


  constructor(public navCtrl: NavController,
    private splash: SplashScreen,
    public storage: Storage,
    public db: DatabaseService,
    private crop: ImageCrop,
    private platform: Platform,
    private loadingController: LoadingController,
    private alertCtrl: AlertController) {
    this.platform.ready().then(_ => this.splash.hide())
    //     this.platform.ready().then(_ => {
    // // document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);
    //   document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false); 
    //   });
  }

  onFabClick() {
    this.searchBar.value = '';
    this.changeSearchVisibility(false);
    this.navCtrl.push(CreateStoryPage);
  }

  openExport() {
    this.navCtrl.push(ExportPage)
  }

  aza(num: number) {
    let load = this.loadingController.create({
      content: 'Loading...'
    });
    if (num == 0) {
      load.present();
    } else {
      load.dismiss();
    }
  }

  ionViewDidLoad() {
    if (this.platform.is('cordova')) {
      this.imageSrc = "../www/assets/images/dashed_rect.svg";
    } else {
      this.imageSrc = "../assets/images/dashed_rect.svg";
    }
    let sun = Observable.timer(1000).subscribe(() => {
      this.db.getStories()
        .subscribe(stories => {
          stories
            .forEach(s => {
              this.itemsBackUp.push(s);
              this.items.push(s);
            });
          console.log('library stories json' + JSON.stringify(stories));
          console.log(stories);

          this.loadMainImages();
          // load.dismiss();
        }, err => console.log(err));
    });
  }

  private loadMainImages() {
    Observable.from(this.itemsBackUp)
      .filter(it => it.mainImageId != null)
      .flatMap(it => this.db.getImage(it.mainImageId))
      .subscribe(image => this.itemsBackUp.find(st => st.id === image.storyId).mainImage = image.image,
      err => {
      },
      () => this.items = this.itemsBackUp);
  }

  changeSearchVisibility(searchVisibility: boolean) {
    this.searchBar.value = '';
    this.refreshList();
    this.searchVisibility = !searchVisibility;
    console.log("Search bar visibility is: ", this.searchVisibility)
    if (!this.searchVisibility) {
      if (this.platform.is('android')) {
        this.marginTop = 56;
      } else {
        this.marginTop = 44;
      }
    } else {
      this.marginTop = 0;
    }
  }

  openEditStory(item: Story, event) {
    this.navCtrl.push(EditStoryPage, {
      selectedStoryId: item.id
    });
  }

  fromStoriesToItems(stories: Array<Story>): Array<Story> {
    let storyItems: Array<Story> = [];
    stories.forEach(element => {
      let item: Story = {
        created: element.created,
        description: element.description,
        id: element.id,
        images: element.images,
        mainImage: element.images[1].image,
        mainImageId: 2,
        title: element.title,
        imageCount: element.imageCount
      };
      storyItems.push(item);
    });
    return storyItems;
  }

  initStoriesList(ids) {
    for (let i = 0; i < ids.length; i++) {
      this.db.getStoryWithImages(ids[i])
        .subscribe(story => {
          this.items.push(this.fromStoryToItem(story));
          console.log(this.fromStoryToItem(story));
        }, err => console.log(err));
    }
    this.itemsBackUp = this.items;
  }

  fromStoryToItem(story: Story): Story {
    return {
      created: story.created,
      description: story.description,
      id: story.id,
      images: story.images,
      mainImage: story.images[0].image,
      mainImageId: 2,
      title: story.title,
      imageCount: story.imageCount
    };
  }

  refreshList() {
    this.items = this.itemsBackUp;
  }

  deleteStory(item: Story) {
    let id = item.id;
    let title = item.title;
    console.log(id);
    let alert = this.alertCtrl.create({
      title: 'Delete Story',
      message: 'Do you really want to delete ' + title,
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
            this.db.deleteStory(id).subscribe(it => {
              console.log(it)
              this.items.splice(this.items.indexOf(item), 1);
            }, err => console.log(err));
          }
        }
      ]
    });
    alert.present();
  }

  getStoryFromSearch(ev) {
    this.refreshList();
    var value = ev.target.value;
    if (value && value.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1);
      })
    }
  }

  openStoryDetail(item, event: MouseEvent) {
    console.log('click')
    console.log(event)
    event.stopPropagation();
    this.navCtrl.push(StoryDetailPage, {
      // selectedStoryId: item.id,
      isFromLibrary: true,
      story: item.id,
      useDB: true,
      items: []
    });
  }
}
