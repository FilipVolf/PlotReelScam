import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { IonicStorageModule } from "@ionic/storage";
import { FilePath } from "@ionic-native/file-path";
import { File } from "@ionic-native/file";
import { MyApp } from "./app.component";
import { LibraryPage } from "../pages/library/library";
import { CreateStoryPage } from "../pages/create-story/create-story";
import { GalleryPage } from "../pages/gallery/gallery";
import { TestCameraPage } from "../pages/test_camera/testCamera";
import { CameraPreview } from "@ionic-native/camera-preview";
import { CameraPreviewPage } from "../pages/cameraPreview/cameraPreview";
import { SQLite } from "@ionic-native/sqlite";
import { DatabaseService } from "../services/database_service";
import { StoryDetailPage } from "../pages/storyDetail/storyDetail";
import { EditStoryPage } from "../pages/editStory/editStory";
import { ImageCrop } from "../utils/image_crop";
import { ExportPage } from "../pages/export/export";
import { SocialSharing } from "@ionic-native/social-sharing";
import { StoryItemDetailsPage } from "../pages/story_item_details/story_item_details";
import { EditScenePage } from "../pages/editScene/editScene";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { DeviceMotion } from '@ionic-native/device-motion';


@NgModule({
  declarations: [
    MyApp,
    LibraryPage,
    CreateStoryPage,
    GalleryPage,
    TestCameraPage,
    CameraPreviewPage,
    StoryDetailPage,
    EditStoryPage,
    ExportPage,
    StoryItemDetailsPage,
    EditScenePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: "plotreed_db",
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LibraryPage,
    CreateStoryPage,
    GalleryPage,
    TestCameraPage,
    CameraPreviewPage,
    StoryDetailPage,
    ExportPage,
    EditStoryPage,
    StoryItemDetailsPage,
    EditScenePage
  ],
  providers: [
    SQLite,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    CameraPreview,
    DatabaseService,
    ImageCrop,
    File,
    SocialSharing,
    FilePath,
    ScreenOrientation,
    DeviceMotion
  ]
})
export class AppModule {
}
