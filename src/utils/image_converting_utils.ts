import { Observable } from "rxjs/Observable";


export class ImageUtils {

  /**
   * Converts base64 image to blob.
   * Notice that base64 part is without content part, with must be given separately.
   * To convert image to convenient form use `toPureBase64(string): Base64` method.
   *
   * @param base64        Image part of base64 image.
   * @param contentType   Content type part of base64 image.
   * @return              Observable with blob.
   */
  public static base64ToBlob(base64: string, contentType: string): Observable<Blob> {
    return Observable.create((observer) => {
      contentType = contentType || '';
      let sliceSize = 512;
      let byteCharacters = atob(base64);
      let byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      observer.next(new Blob(byteArrays, { type: contentType }));
      observer.complete();
    });
  };

  /**
   * Split base64 image into image part and format type.
   *
   * @param base64        encoded base64 image.
   * @return              Base64 image with separate image and type parts.
   */
  public static toPureBase64(base64: string): Base64 {
    let block = base64.split(";");
    return {
      type: block[0].split(":")[1],
      data: block[1].split(",")[1]
    };
  };

  /**
   * Converts image blob to base64 form.
   *
   * @param blob        Image blob.
   * @return            Observable of string.
   */
  public static blobToBase64(blob: Blob): Observable<string> {
    return Observable.create((observer) => {
      let reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result);
        observer.complete();
      };
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Return real size of image in <img> element.
   *
   * @param image           <img> element.
   * @return                original size of image.
   */
  public static naturalSize(image: HTMLImageElement): ImageSize {
    return {
      height: image.naturalHeight,
      width: image.naturalWidth
    };
  }

  /**
   * Return real size of image in <img> element.
   *
   * @param image           <img> element.
   * @return                original size of image.
   */
  public static naturalInputSize(imageSrc: string): Promise<ImageSize> {
    return new Promise((resolve, reject) => {
      let img: HTMLImageElement = document.createElement('img');
      let w;
      let h;
      img.src = imageSrc;
      img.onload = () => {
        h = img.naturalHeight;
        w = img.naturalWidth;
        resolve({ width: w, height: h });
      };
    });
  }

  /**
   * Return display size of <src> element
   *
   * @param image           <img> element.
   * @return                size of image.
   */
  public static size(image: HTMLImageElement): ImageSize {
    return {
      height: image.height,
      width: image.width
    };
  }

  /**
   * Calculate ratio of scale when scale `from` image `to` new image.
   *
   * @param from          size of image before scale.
   * @param to            size of image after scale.
   * @return              scale ratio.
   */
  public static scaleRatio(from: ImageSize, to: ImageSize): number {
    // return (to.width / from.width + to.height / from.height) / 2;
    console.log('from , to ' + JSON.stringify({ from, to }))
    console.log('from / to ' + to.height / to.width)
    if (to.height / to.width < 1.4)
      return (to.height) / (from.height)
    else return (to.width) / (from.width)
  }

  public static scaleRatio2(from: ImageSize, to: ImageSize): number {
    return (to.width / from.width + to.height / from.height) / 2;

  }


  /**
   * Scale HTML element's size by given ratio.
   *
   * @param position      HTML element's size to scale.
   * @param ratio         scale ratio.
   * @return              HTML element's size with applied scale ratio.
   */
  public static scaleElement(position: HtmlElementSize, ratio: number): HtmlElementSize {
    return {
      width: position.width * ratio,
      height: position.height * ratio,
      offsetTop: position.offsetTop * ratio,
      offsetLeft: position.offsetLeft * ratio
    };
  }


  /**
   * Scale size of image by given ratio.
   *
   * @param image         size of image to scale.
   * @param ratio         scale ratio.
   * @return              Size of image scaled by given scale ratio.
   */
  public static scaleBy(image: ImageSize, ratio: number): ImageSize {
    return {
      height: image.height * ratio,
      width: image.width * ratio
    };
  }

  /**
   * Scale canvas by given ratio.
   *
   * @param canvas        canvas to scale.
   * @param ratio         scale ratio.
   * @return              new canvas scaled by given ratio.
   */
  public static scaleCanvasBy(canvas: HTMLCanvasElement, ratio: number): HTMLCanvasElement {
    let newCanvas: HTMLCanvasElement = document.createElement('canvas');
    newCanvas.height = canvas.height * ratio;
    newCanvas.width = canvas.width * ratio;
    let context = newCanvas.getContext('2d');
    context.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
    return newCanvas;
  }

  /**
   * Fetch position (height, width, offsetTop, offsetLeft) from HTMLElement.
   *
   * @param element         HTMLElement
   * @return                Size of given html element.
   */
  public static getPosition(element: HTMLElement): HtmlElementSize {
    return {
      height: element.getBoundingClientRect().height,
      width: element.getBoundingClientRect().width,
      offsetTop: element.getBoundingClientRect().top,
      offsetLeft: element.getBoundingClientRect().left
    };
  }


  /**
   * Crop given image or canvas to rect and converts it to Base64.
   *
   * @param image           Image or Canvas.
   * @param rect            Rect to crop image.
   * @return                cropped image in Base64.
   */
  public static cropImageToBase64(image: HTMLImageElement | HTMLCanvasElement, rect: HtmlElementSize): string {
    
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.getContext('2d')
      .drawImage(image, rect.offsetLeft, rect.offsetTop, rect.width, rect.height, 0, 0, rect.width, rect.height);
    return canvas.toDataURL("image/jpeg");
  }

  /**
   * Crop given image or canvas to rect, converts it to Base64 and rotate for 90 deg.
   *
   * @param image           Image or Canvas.
   * @param rect            Rect to crop image.
   * @return                cropped image in Base64.
   */
  public static cropImageToBase64WithRotate(image: HTMLImageElement | HTMLCanvasElement, rect: HtmlElementSize, angle): string {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    let width = rect.width;
    let height = rect.height;
    canvas.height = rect.width;
    canvas.width = rect.height;
    ctx.translate(height / 2, width / 2);
    ctx.rotate(angle);
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(image, rect.offsetLeft, rect.offsetTop, rect.width, rect.height, 0, 0, rect.width, rect.height);
    return canvas.toDataURL("image/jpeg");
  }

  /**
   * Crop given image or canvas to rect and returns new canvas,
   *
   * @param image           Image or Canvas.
   * @param rect            Rect to crop image.
   * @return                Cropped canvas.
   */
  public static cropImageToCanvas(image: HTMLImageElement | HTMLCanvasElement, rect: HtmlElementSize): HTMLCanvasElement {
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.getContext('2d')
      .drawImage(image, rect.offsetLeft, rect.offsetTop, rect.width, rect.height, 0, 0, rect.width, rect.height);
    return canvas;
  }


  /**
   * Load url to canvas.
   *
   * @param url             URL to load.
   * @return                Promise with Canvas
   */
  public static urlToCanvas(url: string): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      let image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dataURL;
        canvas.height = image.height;
        canvas.width = image.width;
        ctx.drawImage(image, 0, 0);
        dataURL = canvas.toDataURL("image/jpeg");
        resolve(canvas);
      };
      image.src = url;
    });
  }

  /**
   * Load url in base64 form.
   *
   * @param url             URL to load.
   * @return                Promise with base64 image.
   */
  public static urlToBase64(url: string): Promise<string> {
    return new Promise((resolve) => {
      let image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let dataURL;
        canvas.height = image.height;
        canvas.width = image.width;
        ctx.drawImage(image, 0, 0);
        dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
        canvas = null;
      };
      image.src = url;
    });
  }


  /**
   * Crop image from HTMLImageElement in source resolution.
   *
   * @param imageSource     source element with image to crop.
   * @param overlays        array of overlays to be cropped from image.
   *
   * @return                Promise with array of images in Base64 encoding.
   */
  public static cropImagesFrom(imageSource: HTMLImageElement, ...overlays: HTMLElement[]): Promise<Array<string>> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let imageSize = ImageUtils.getPosition(imageSource);
      let naturalSize = ImageUtils.naturalSize(imageSource);
      ImageUtils.urlToCanvas(imageSource.src).then((canvas: HTMLCanvasElement) => {
        for (let i = 0; i < overlays.length; i++) {
          let overlay = overlays[i];
          let overlayPosition = ImageUtils.getPosition(overlay);
          overlayPosition.offsetTop = overlayPosition.offsetTop - imageSize.offsetTop;
          overlayPosition.offsetLeft = overlayPosition.offsetLeft - imageSize.offsetLeft;
          let ratio = ImageUtils.scaleRatio({ width: imageSource.width, height: imageSource.height }, naturalSize);
          let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
          let crop = ImageUtils.cropImageToBase64(canvas, newOverlay);
          result.push(crop);
        }
        resolve(result);
      });
    });
  }


  /**
   * Crop image from HTMLImageElement in source resolution.
   *
   * @param imageSource     source element with image to crop.
   * @param overlays        array of overlay to be cropped from image.
   *
   * @return                Promise with array of images in Base64 encoding.
   */
  public static cropImagesCells(imageSource: HTMLImageElement, overlays: HtmlElementSize[]): Promise<Array<string>> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let naturalSize = ImageUtils.naturalSize(imageSource);
      ImageUtils.urlToCanvas(imageSource.src).then((canvas: HTMLCanvasElement) => {
        for (let i = 0; i < overlays.length; i++) {
          let overlayPosition = overlays[i];
          // overlayPosition.offsetTop = overlayPosition.offsetTop - imageSize.offsetTop;
          // overlayPosition.offsetLeft = overlayPosition.offsetLeft - imageSize.offsetLeft;
          let ratio = ImageUtils.scaleRatio({ width: imageSource.width, height: imageSource.height }, naturalSize);
          let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
          let crop = ImageUtils.cropImageToBase64(canvas, newOverlay);
          result.push(crop);
        }
        resolve(result);
      });
    });
  }

   public static cropImagesCells2(imageSource: HTMLImageElement, overlays: HtmlElementSize[]): Promise<Array<string>> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let naturalSize = ImageUtils.naturalSize(imageSource);
      ImageUtils.urlToCanvas(imageSource.src).then((canvas: HTMLCanvasElement) => {
        for (let i = 0; i < overlays.length; i++) {
          let overlayPosition = overlays[i];
          // overlayPosition.offsetTop = overlayPosition.offsetTop - imageSize.offsetTop;
          // overlayPosition.offsetLeft = overlayPosition.offsetLeft - imageSize.offsetLeft;
          let ratio = ImageUtils.scaleRatio({ width: imageSource.width, height: imageSource.height }, naturalSize);
          let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
          let crop = ImageUtils.cropImageToBase64(canvas, newOverlay);
          result.push(crop);
        }
        resolve(result);
      });
    });
  }


  /**
   * Crop image from HTMLImageElement in source resolution.
   *
   * @param imageSource     source element with image to crop.
   * @param overlays        array of overlay to be cropped from image.
   * @param src             image uri or in base64 format
   *
   * @return                Promise with array of images in Base64 encoding.
   */
  public static cropInputImagesCells(imageSource: HTMLInputElement, src: string,
    overlays: HtmlElementSize[]): Promise<CroppedImageParams> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let imageSize = ImageUtils.getPosition(imageSource);
      ImageUtils.naturalInputSize(src)
        .then((naturalSize: ImageSize) => {
          ImageUtils.urlToCanvas(src).then((canvas: HTMLCanvasElement) => {
            for (let i = 0; i < overlays.length; i++) {
              let overlayPosition = overlays[i];
              let ratio = ImageUtils.scaleRatio({
                width: imageSource.offsetWidth,
                height: imageSource.offsetHeight
              }, naturalSize);
              console.log('cropping sizes: ' + JSON.stringify({
                width: imageSource.offsetWidth,
                height: imageSource.offsetHeight
              }) + ' ' + JSON.stringify(naturalSize) + ' ' + ratio);
              let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
              console.log('newOverlay ' + JSON.stringify(newOverlay) + ' overlayPos: ' + JSON.stringify(overlayPosition));
              console.log('canvas ' + JSON.stringify(canvas));
              let crop = ImageUtils.cropImageToBase64(canvas, newOverlay);
              result.push(crop);
            }
            resolve({ result, naturalSize });
          });
        });

    });
  }

  /**
   * Crop image from HTMLImageElement in source resolution with rotating.
   *
   * @param imageSource     source element with image to crop.
   * @param overlays        array of overlay to be cropped from image.
   *
   * @return                Promise with array of images in Base64 encoding.
   */
  public static cropImagesCellsWithRotating(imageSource: HTMLImageElement, overlays: HtmlElementSize[], angle): Promise<Array<string>> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let imageSize = ImageUtils.getPosition(imageSource);
      let naturalSize = ImageUtils.naturalSize(imageSource);
      ImageUtils.urlToCanvas(imageSource.src).then((canvas: HTMLCanvasElement) => {
        for (let i = 0; i < overlays.length; i++) {
          let overlayPosition = overlays[i];
          let ratio = ImageUtils.scaleRatio({ width: imageSource.width, height: imageSource.height }, naturalSize);
          let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
          let crop = ImageUtils.cropImageToBase64WithRotate(canvas, newOverlay, angle);
          result.push(crop);
        }
        resolve(result);
      });
    });
  }


  /**
   * Crop image from HTMLImageElement in source resolution with rotating.
   *
   * @param imageSource     source element with image to crop.
   * @param src             image uri or in base64 format
   * @param overlays        array of overlay to be cropped from image.
   * @param angle
   *
   * @return                Promise with array of images in Base64 encoding.
   */
  public static cropInputImagesCellsWithRotating(imageSource: HTMLInputElement, src: string,
    overlays: HtmlElementSize[], angle): Promise<CroppedImageParams> {
    return new Promise((resolve) => {
      let result: Array<string> = [];
      let imageSize = ImageUtils.getPosition(imageSource);
      ImageUtils.naturalInputSize(src)
        .then((naturalSize: ImageSize) => {
          ImageUtils.urlToCanvas(src).then((canvas: HTMLCanvasElement) => {
            for (let i = 0; i < overlays.length; i++) {
              let overlayPosition = overlays[i];
              let ratio = ImageUtils.scaleRatio({
                width: imageSource.offsetWidth,
                height: imageSource.offsetHeight
              }, naturalSize);
              console.log('cropping sizes: ' + JSON.stringify({
                width: imageSource.offsetWidth,
                height: imageSource.offsetHeight
              }) + ' ' + JSON.stringify(naturalSize) + ' ' + ratio);
              let newOverlay = ImageUtils.scaleElement(overlayPosition, ratio);
              console.log('newOverlay ' + JSON.stringify(newOverlay) + ' overlayPos: ' + JSON.stringify(overlayPosition));
              console.log('canvas ' + JSON.stringify(canvas));
              let crop = ImageUtils.cropImageToBase64WithRotate(canvas, newOverlay, angle);
              result.push(crop);
            }
            resolve({ result, naturalSize });
          });
        });

    });
  }
}


export interface ImageSize {
  height?: number;
  width?: number;
}

export interface HtmlElementSize {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  height: number;
}

export interface CroppedImageParams {
  result: Array<string>;
  naturalSize: ImageSize;
}

