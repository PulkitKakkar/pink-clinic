export const catalogImageFallback =
  "/images/treatments/skin-consultation-fallback.png";

export function getCatalogImage(images: string[]) {
  return images.find((image) => image.trim().length > 0) || catalogImageFallback;
}
