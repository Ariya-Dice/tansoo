// src/utils/filestack.ts
// Helper برای استفاده از Filestack Picker

declare global {
  interface Window {
    filestack: any;
  }
}

// Filestack API Key
const FILESTACK_API_KEY = import.meta.env.VITE_FILESTACK_API_KEY || 'AQn7j9WGfTKhHvu6rWEBTz';

// Workflow ID برای پردازش تصاویر
const FILESTACK_WORKFLOW_ID = import.meta.env.VITE_FILESTACK_WORKFLOW_ID || '9b26e277-54f2-4d87-b2c8-acc449bb299a';

export interface FilestackUploadResult {
  url: string;
  filename: string;
  handle: string;
  size: number;
  mimetype: string;
}

/**
 * مقداردهی اولیه Filestack Client
 */
export function initFilestack() {
  if (typeof window === 'undefined' || !window.filestack) {
    console.error('Filestack SDK not loaded');
    return null;
  }

  try {
    const client = window.filestack.init(FILESTACK_API_KEY);
    return client;
  } catch (error) {
    console.error('Error initializing Filestack:', error);
    return null;
  }
}

/**
 * باز کردن Filestack Picker برای آپلود تصویر
 * @param onSuccess - تابع callback برای زمانی که آپلود موفق باشد
 * @param onError - تابع callback برای خطا
 */
export function openFilestackPicker(
  onSuccess: (result: FilestackUploadResult) => void,
  onError?: (error: any) => void
) {
  const client = initFilestack();
  
  if (!client) {
    if (onError) {
      onError(new Error('Filestack SDK not available'));
    }
    return;
  }

  const options = {
    accept: ['image/*'],
    maxFiles: 1,
    storeTo: {
      workflows: [FILESTACK_WORKFLOW_ID]
    },
    onUploadDone: (result: any) => {
      if (result.filesUploaded && result.filesUploaded.length > 0) {
        const file = result.filesUploaded[0];
        const uploadResult: FilestackUploadResult = {
          url: file.url,
          filename: file.filename || file.name || 'image',
          handle: file.handle,
          size: file.size,
          mimetype: file.mimetype,
        };
        onSuccess(uploadResult);
      } else {
        if (onError) {
          onError(new Error('No file uploaded'));
        }
      }
    },
    onError: (error: any) => {
      console.error('Filestack picker error:', error);
      if (onError) {
        onError(error);
      }
    },
  };

  try {
    const picker = client.picker(options);
    picker.open();
  } catch (error) {
    console.error('Error opening Filestack picker:', error);
    if (onError) {
      onError(error);
    }
  }
}

/**
 * بررسی اینکه Filestack SDK لود شده است یا نه
 */
export function isFilestackAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.filestack;
}

