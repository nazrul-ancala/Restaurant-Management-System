// Downscales a user-picked image file and returns it as a JPEG data URL,
// keeping localStorage-persisted layout state small (raw phone photos can be
// 10-20MB — the sidebar only ever renders this at ~300px wide and 7% opacity).
const MAX_WIDTH = 480;
const MAX_HEIGHT = 960;
const JPEG_QUALITY = 0.7;

export function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
