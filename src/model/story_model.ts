interface Story {
  id?: number;
  title: string;
  description: string;
  created: Date;
  mainImageId?: number;
  mainImage?: string;
  images?: Array<Image>;
  imageCount: number;
}


interface Image {
  id?: number;
  number: number;
  image: string;
  description?: string;
  storyId?: number;
  isPortrait: number;
  isLandLeft: number;
  isLandRight: number;
  position: number;
  width: number;
  srcImage: any;
  isOnePhoto: number;
  offsetTop: number;
  imageRatio: number;
  cellLeft: number;
  cellTop: number;
  cellZoom: number;
}
