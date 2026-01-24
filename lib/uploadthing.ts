import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Composants UI générés :
 * Utiles pour des uploads rapides sans logique complexe.
 */
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

/**
 * Helpers React :
 * Le 'useUploadThing' est le hook de contrôle manuel.
 * Le 'uploadFiles' est utile si tu veux uploader hors d'un contexte de hook.
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
