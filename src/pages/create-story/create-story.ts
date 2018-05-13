import {Component, ViewChild} from "@angular/core";
import {Button, NavController, Platform, ViewController} from "ionic-angular";
import {GalleryPage} from "../gallery/gallery";

@Component({
  selector: 'page-create-story',
  templateUrl: 'create-story.html'
})

export class CreateStoryPage {

  //region Buttons
  private buttonOne: boolean = false;
  private buttonTwo: boolean = true;

  private butId1: string = '1';
  private butId2: string = '6';
  private sharedId: string;
  //endregion
  @ViewChild('button1') butt1: Button;
  @ViewChild('button6') butt6: Button;

  title: string = "";
  description: string = "";

  constructor(public navCtrl: NavController, private viewCtrl: ViewController, private platform: Platform) {
    this.platform.ready().then(_ => {
      let element: HTMLInputElement = document.getElementById('title') as HTMLInputElement
    })
  }

  onTitleInput(event) {
    console.log('input');
    this.title = event.target.value;

  }

  onDescriptionInput(event) {
    console.log('input');
    this.description = event.target.value;
  }

  buttonClick(sharedId: string) {
    this.sharedId = sharedId;
    if (sharedId === this.butId1) {
      this.buttonOne = false;
      this.buttonTwo = true;
      this.butt1.color = "primary";
      this.butt6.color = "dark";
    } else if (sharedId === this.butId2) {
      this.buttonOne = true;
      this.buttonTwo = false;
      this.butt1.color = "dark";
      this.butt6.color = "primary";
    }
    console.log(this.sharedId);
  }

  onNextClick() {
    var photos: string;
    if (this.buttonOne == false) {
      photos = "1"
    } else if (this.buttonTwo == false) {
      photos = "6"
    }

    console.log()


    let navParams = {
      param: photos,
      title: this.title,
      description: this.description,
      useDB: false
    };
    this.navCtrl
      .push(GalleryPage, navParams)
  }

  closeCreateStory() {
    this.navCtrl.pop();
  }
}
