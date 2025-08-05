interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

// eslint-disable-next-line no-unused-vars
declare function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<Blob>;

export default getCroppedImg;
