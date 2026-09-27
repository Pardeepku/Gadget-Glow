import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export type MediaFolder = 'articles' | 'authors' | 'epaper' | 'ads' | 'settings' | 'general';

/**
 * Cleanly uploads a File or Blob to Firebase Storage under media/{folder}/{filename}
 * Returns the permanent HTTPS download URL from Firebase Storage.
 */
export async function uploadMediaFile(
  file: File | Blob,
  folder: MediaFolder = 'general',
  customFileName?: string
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const timestamp = Date.now();
  const rawName = (file instanceof File ? file.name : 'upload.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = customFileName || `${timestamp}_${rawName}`;
  const storagePath = `media/${folder}/${fileName}`;

  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Uploads a base64 Data URL string to Firebase Storage
 */
export async function uploadBase64Media(
  base64DataUrl: string,
  folder: MediaFolder = 'general',
  fileName: string = `${Date.now()}_image.jpg`
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  // Convert base64 data URL to Blob
  const response = await fetch(base64DataUrl);
  const blob = await response.blob();

  return uploadMediaFile(blob, folder, fileName);
}
