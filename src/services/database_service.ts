import { Platform } from "ionic-angular";
import { SQLite } from "ionic-native";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/toArray";

@Injectable()
export class DatabaseService {

  private db: SQLite;

  private static getImageFromData(data: any): Image {
    var _image: Image;
    if (data.rows.length > 0) {
      for (var i = 0; i < data.rows.length; i++) {
        _image = {
          id: data.rows.item(i).id,
          number: data.rows.item(i).number,
          description: data.rows.item(i).description,
          image: data.rows.item(i).image,
          storyId: data.rows.item(i).story_id,
          isPortrait: data.rows.item(i).isportrait,
          position: data.rows.item(i).position,
          width: data.rows.item(i).width,
          srcImage: data.rows.item(i).srcimage,
          isOnePhoto: data.rows.item(i).isonephoto,
          offsetTop: data.rows.item(i).offsettop,
          isLandLeft: data.rows.item(i).is_land_left,
          isLandRight: data.rows.item(i).is_land_right,
          imageRatio: data.rows.item(i).image_ratio,
          cellLeft: data.rows.item(i).cellLeft,
          cellTop: data.rows.item(i).cellTop,
          cellZoom: data.rows.item(i).cellZoom
        };
      }
    }
    return _image;
  }

  private static getImagesFromData(data: any): Array<Image> {
    let images: Array<Image> = [];
    if (data.rows.length > 0) {
      for (var i = 0; i < data.rows.length; i++) {
        images.push({
          id: data.rows.item(i).id,
          number: data.rows.item(i).number,
          description: data.rows.item(i).description,
          image: data.rows.item(i).image,
          storyId: data.rows.item(i).story_id,
          isPortrait: data.rows.item(i).isportrait,
          position: data.rows.item(i).position,
          width: data.rows.item(i).width,
          srcImage: data.rows.item(i).srcimage,
          isOnePhoto: data.rows.item(i).isonephoto,
          offsetTop: data.rows.item(i).offsettop,
          isLandLeft: data.rows.item(i).is_land_left,
          isLandRight: data.rows.item(i).is_land_right,
          imageRatio: data.rows.item(i).image_ratio,
          cellLeft: data.rows.item(i).cellLeft,
          cellTop: data.rows.item(i).cellTop,
          cellZoom: data.rows.item(i).cellZoom
        });
      }
    }
    return images;
  }

  private static getStoryFromData(data: any): Story {
    var _story: Story;
    if (data.rows.length > 0) {
      for (var i = 0; i < data.rows.length; i++) {
        _story = {
          id: data.rows.item(i).id,
          title: data.rows.item(i).title,
          description: data.rows.item(i).description,
          created: new Date(data.rows.item(i).created),
          imageCount: data.rows.item(i).image_count,
          mainImageId: data.rows.item(i).main_image_id
        };
      }
    }
    return _story;
  }

  private static getStoriesFromData(data: any): Array<Story> {
    let stories: Array<Story> = [];
    var _story: Story;
    if (data.rows.length > 0) {
      for (var i = 0; i < data.rows.length; i++) {
        _story = {
          id: data.rows.item(i).id,
          title: data.rows.item(i).title,
          description: data.rows.item(i).description,
          created: new Date(data.rows.item(i).created),
          imageCount: data.rows.item(i).image_count,
          mainImageId: data.rows.item(i).main_image_id
        };
        stories.push(_story);
      }
    }
    console.log('stories json' + JSON.stringify(stories));
    console.log(stories);
    return stories;
  }

  constructor(platform: Platform) {
    platform.ready().then(() => {
      this.db = new SQLite();
      this.db.openDatabase({
        name: "data.db",
        location: "default"
      }).then(() => {
        this.db.executeSql("CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, created TEXT, main_image_id INTEGER, image_count INTEGER);", {});
        this.db.executeSql("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image TEXT, description TEXT, srcimage TEXT, number INTEGER, story_id INTEGER, isportrait INTEGER, position INTEGER, width INTEGER, isonephoto INTEGER, offsettop INTEGER, is_land_left INTEGER, is_land_right INTEGER, image_ratio INTEGER, cellLeft INTEGER, cellTop INTEGER, cellZoom INTEGER);", {});
      })
    }, (error) => {
      console.error("Unable to open db", error);
    });
  }


  addStory(story: Story): Observable<Story> {
    console.log('dtory from db service add')
    console.log(story)
    if (story.mainImageId == null) story.mainImageId = -1;
    return PromiseObservable.create(
      this.db.executeSql("INSERT INTO stories(title, description, created, main_image_id, image_count) VALUES(?, ?, ?, ?, ?)",
        [story.title, story.description, story.created.toISOString(), story.mainImageId, story.imageCount]))
      .map((data) => data.insertId)
      .flatMap((id) => this.getStory(id));
  }

  getStories(): Observable<Array<Story>> {
    return PromiseObservable.create(this.db.executeSql("SELECT * FROM stories", []))
      .map((data) => DatabaseService.getStoriesFromData(data));
  }

  getStory(id: number): Observable<Story> {
    return PromiseObservable.create(this.db.executeSql("SELECT * FROM stories WHERE id=?", [id]))
      .map((data) => DatabaseService.getStoryFromData(data));
  }

  updateStory(story: Story): Observable<Story> {
    if (story.id == null) return Observable.throw(new Error("No id for story"));
    return PromiseObservable.create(
      this.db.executeSql("UPDATE stories SET title=?, description=?, main_image_id=?, image_count=? WHERE id=?",
        [story.title, story.description, story.mainImageId, story.imageCount, story.id]))
      .flatMap((data) => this.getStory(story.id));
  }

  deleteStory(id: number): Observable<any> {
    return PromiseObservable.create(this.db.executeSql("DELETE FROM stories WHERE id=?", [id]));
  }


  addImage(image: Image): Observable<Image> {
    if (image.storyId < 0) return Observable.throw(new Error("Invalid storyId"));
    return PromiseObservable.create(
      this.db.executeSql("INSERT INTO images(number, description, image, story_id, isportrait, position, width, srcimage, isonephoto, offsettop, is_land_left, is_land_right, image_ratio, cellLeft, cellTop, cellZoom) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [image.number, image.description, image.image, image.storyId, image.isPortrait, image.position, image.width, image.srcImage, image.isOnePhoto, image.offsetTop, image.isLandLeft, image.isLandRight, image.imageRatio, image.cellLeft, image.cellTop, image.cellZoom]))
      .map((data) => data.insertId)
      .flatMap((id) => this.getImage(id));
  }

  addImages(images: Array<Image>) {
    images.forEach(element => {
      if (element.storyId < 0) return Observable.throw(new Error("Invalid storyId"));
      let sub = PromiseObservable.create(
        this.db.executeSql("INSERT INTO images(number, description, image, story_id, isportrait, position, width, srcimage, isonephoto, offsettop, is_land_left, is_land_right, image_ratio, cellLeft, cellTop, cellZoom) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [element.number, element.description, element.image, element.storyId, element.isPortrait, element.position, element.width, element.srcImage, element.isOnePhoto, element.offsetTop, element.isLandLeft, element.isLandRight, element.imageRatio, element.cellLeft, element.cellTop, element.cellZoom]))
        .map((data) => data.insertId)
        .flatMap((id) => this.getImage(id)).subscribe();
    });
  }

  updateImage(image: Image): Observable<Image> {
    if (image.id == null) return Observable.throw(new Error("No id for image"));
    return PromiseObservable.create(
      this.db.executeSql("UPDATE images SET number=?, description=?, image=?, isportrait=?, position=?, width=?, srcimage=?, isonephoto=?, offsettop=?, is_land_left=?, is_land_right=?, image_ratio=?, cellLeft=?, cellTop=?, cellZoom=? WHERE id=?",
        [image.number, image.description, image.image, image.isPortrait, image.position, image.width, image.srcImage, image.isOnePhoto, image.offsetTop, image.isLandLeft, image.isLandRight, image.imageRatio, image.cellLeft, image.cellTop, image.cellZoom, image.id]))
      .flatMap((data) => this.getImage(image.id));
  }

  updateImages(images: Array<Image>): Observable<Array<Image>> {
    let list: Array<Image>;
    return Observable.create(
      images.forEach(element => {
        if (element.id == null) return Observable.throw(new Error("No id for image"));
        PromiseObservable.create(
          this.db.executeSql("UPDATE images SET number=?, description=?, image=?, isportrait=?, position=?, width=?, srcimage=?, isonephoto=?, offsettop=?, is_land_left=?, is_land_right=?, image_ratio=?, cellLeft=?, cellTop=?, cellZoom=? WHERE id=?",
            [element.number, element.description, element.image, element.isPortrait, element.position, element.width, element.srcImage, element.isOnePhoto, element.offsetTop, element.isLandLeft, element.isLandRight, element.imageRatio, element.cellLeft, element.cellTop, element.cellZoom, element.id]))
          .flatMap((data) => this.getImage(element.id));
      })).toArray()
  }

  getImage(id: number): Observable<Image> {
    return PromiseObservable.create(this.db.executeSql("SELECT * FROM images WHERE id=?", [id]))
      .map((data) => DatabaseService.getImageFromData(data));
  }

  getImages(): Observable<Array<Image>> {
    return PromiseObservable.create(this.db.executeSql("SELECT * FROM images", []))
      .map((data) => DatabaseService.getImagesFromData(data));
  }

  getStoryWithImages(storyId: number): Observable<Story> {
    return this.getStory(storyId)
      .flatMap((story) => this.getImagesByStory(storyId).map((array) => {
        story.images = array;
        return story;
      }));
  }

  getImagesByStory(storyId: number): Observable<Array<Image>> {
    return PromiseObservable.create(this.db.executeSql("SELECT * FROM images WHERE story_id=?", [storyId]))
      .map((data) => DatabaseService.getImagesFromData(data));
  }

  deleteImage(id: number): Observable<any> {
    return PromiseObservable.create(this.db.executeSql("DELETE FROM images WHERE id=?", [id]));
  }

}



