import { ref, uploadString, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * 1. 클라이언트 사이드 이미지 압축
 * 최대 가로 사이즈 1200px, webp 형식으로 퀄리티 0.8로 압축
 */
export const compressImage = (file, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * 2. 압축 후 Firebase Storage 업로드
 * Base64(data_url) 형태를 업로드하고 다운로드 URL을 반환
 */
export const uploadCompressedImage = async (file, path) => {
  try {
    const dataUrl = await compressImage(file);
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Image compression or upload failed:', error);
    throw error;
  }
};

/**
 * 3. 스토리지 폴더/파일 삭제 (고아 객체 정리)
 */
export const deleteStorageFolder = async (folderPath) => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const deletePromises = result.items.map((fileRef) => deleteObject(fileRef));
    await Promise.all(deletePromises);
    
    // Note: Firebase Storage automatically deletes empty folders,
    // and listAll does not recurse into subdirectories by default, 
    // but in our structure we only have flat files inside building/units.
    // To handle subfolders, we would need recursive deletion if applicable.
    const subfolderPromises = result.prefixes.map((prefixRef) => deleteStorageFolder(prefixRef.fullPath));
    await Promise.all(subfolderPromises);
    
  } catch (error) {
    console.error(`Failed to delete storage folder ${folderPath}:`, error);
  }
};
