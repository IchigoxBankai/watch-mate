import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB limit
const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.ogg'];

export function validateVideoFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const isVideoMime = file.type && file.type.startsWith('video/');
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

  if (!isVideoMime && !isAllowedExt) {
    return { 
      valid: false, 
      error: `Unsupported video format (${ext || 'unknown'}). Please choose an MP4, WebM, MOV, or MKV file.` 
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 1 GB.` 
    };
  }

  return { valid: true, error: null };
}

/**
 * Uploads a local video file to Firebase Storage (if configured)
 * or falls back to backend Express upload API endpoint.
 *
 * @param {File} file - The video file to upload
 * @param {Function} onProgress - Callback with percentage (0 to 100)
 * @returns {Promise<{ url: string, fileName: string, size: number, storageType: string }>}
 */
export async function uploadVideoFile(file, onProgress = () => {}) {
  const validation = validateVideoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Attempt 1: Try Firebase Storage if initialized
  if (storage) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `watchmate_videos/${Date.now()}_${cleanName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            console.warn('[UploadService] Firebase Storage upload error, falling back to server:', error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      return {
        url: downloadUrl,
        fileName: file.name,
        size: file.size,
        storageType: 'firebase'
      };
    } catch (fbErr) {
      console.warn('[UploadService] Firebase Storage failed, proceeding with server fallback...', fbErr);
    }
  }

  // Attempt 2: Server Upload API fallback
  return new Promise((resolve, reject) => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin.replace(/:\d+$/, ':5000');
    const uploadEndpoint = `${serverUrl}/api/upload/video`;

    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.url) {
            resolve({
              url: response.url,
              fileName: response.fileName || file.name,
              size: response.size || file.size,
              storageType: 'server'
            });
          } else {
            reject(new Error(response.error || 'Server upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from upload server'));
        }
      } else {
        reject(new Error(`Server returned error code ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading video to server.'));
    };

    xhr.send(formData);
  });
}
