import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { StoryDetailPage } from '../storyDetail/storyDetail';

@Component({
  selector: 'page-storyItemDetail',
  templateUrl: 'story_item_details.html'
})
export class StoryItemDetailsPage {

  private item: any;

  constructor(public navCtrl: NavController, private params: NavParams) {
    this.item = params.get('item');
    console.log(this.item);
  }

  onBackClick() {
    this.navCtrl.pop();
  }

  onDoneClick(refactoredItem) {
    this.navCtrl.pop();
    this.navCtrl.push(StoryDetailPage, {
      refactoredItem
    });
  }
}
