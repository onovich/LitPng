export type ToolPage = {
  path: string;
  title: string;
  description: string;
  heading: string;
  preset: "balanced" | "png" | "jpg" | "bulk" | "rename" | "resize";
};

export const toolPages: ToolPage[] = [
  {
    path: "/",
    title: "LittlePNG - Private Batch Image Compressor",
    description: "Compress, rename, resize, crop, convert, and export image batches locally in your browser.",
    heading: "LittlePNG",
    preset: "balanced"
  },
  {
    path: "/png-compressor",
    title: "PNG Compressor - LittlePNG",
    description: "Compress PNG files locally with batch image prep controls for web publishing.",
    heading: "PNG Compressor",
    preset: "png"
  },
  {
    path: "/jpg-compressor",
    title: "JPG Compressor - LittlePNG",
    description: "Compress JPG and JPEG images locally with batch rename, resize, crop, and ZIP export.",
    heading: "JPG Compressor",
    preset: "jpg"
  },
  {
    path: "/image-compressor",
    title: "Image Compressor - LittlePNG",
    description: "A private batch image compressor for PNG, JPG, and WebP publishing workflows.",
    heading: "Image Compressor",
    preset: "balanced"
  },
  {
    path: "/compress-png",
    title: "Compress PNG - LittlePNG",
    description: "Compress PNG images in your browser and prepare them for websites, stores, and apps.",
    heading: "Compress PNG",
    preset: "png"
  },
  {
    path: "/compress-jpg",
    title: "Compress JPG - LittlePNG",
    description: "Compress JPG images locally and download clean web-ready outputs.",
    heading: "Compress JPG",
    preset: "jpg"
  },
  {
    path: "/bulk-image-compressor",
    title: "Bulk Image Compressor - LittlePNG",
    description: "Process many images in one local queue with ZIP export and naming controls.",
    heading: "Bulk Image Compressor",
    preset: "bulk"
  },
  {
    path: "/batch-image-compressor",
    title: "Batch Image Compressor - LittlePNG",
    description: "Batch compress images locally with queue controls and file-by-file results.",
    heading: "Batch Image Compressor",
    preset: "bulk"
  },
  {
    path: "/compress-and-rename-images",
    title: "Compress and Rename Images - LittlePNG",
    description: "Compress images and apply clean SEO-friendly batch filenames in one workflow.",
    heading: "Compress and Rename Images",
    preset: "rename"
  },
  {
    path: "/resize-and-compress-image",
    title: "Resize and Compress Images - LittlePNG",
    description: "Resize, crop, convert, and compress batches of web images locally.",
    heading: "Resize and Compress Images",
    preset: "resize"
  }
];

export function findToolPage(pathname: string): ToolPage {
  return toolPages.find((page) => page.path === pathname) ?? toolPages[0];
}
