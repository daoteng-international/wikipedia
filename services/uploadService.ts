import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadToCloud = async (file: File): Promise<string> => {
  try {
    const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage error:', error);
    throw new Error('無法連線至檔案伺服器。');
  }
};

/**
 * Upload a video file to Firebase Storage.
 * Stored under `videos/` path to separate from images.
 */
export const uploadVideoToCloud = async (file: File): Promise<string> => {
  try {
    const fileRef = ref(storage, `videos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage video upload error:', error);
    throw new Error('影片上傳失敗，請檢查網路連線。');
  }
};
