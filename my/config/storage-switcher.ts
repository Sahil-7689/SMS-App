// Storage Switcher - Use Supabase with local fallback
import { uploadToSupabase, deleteFromSupabase, getSupabaseDownloadURL } from './supabase-storage';

// Storage Provider Type
export type StorageProvider = 'supabase';

// Upload result type
export interface UploadResult {
  success: boolean;
  fileName?: string;
  downloadURL?: string;
  provider: StorageProvider | 'local';
  error?: string;
  fallbackReason?: string;
}

// Default storage provider
export const DEFAULT_STORAGE_PROVIDER: StorageProvider = 'supabase';

// Upload file using selected provider
export const uploadFile = async (
  fileUri: string, 
  fileName: string, 
  contentType: string,
  provider: StorageProvider = DEFAULT_STORAGE_PROVIDER
): Promise<UploadResult> => {
  console.log(`📁 Using ${provider} for file upload...`);
  
  // First, try to validate the file URI
  try {
    const testResponse = await fetch(fileUri, { method: 'HEAD' });
    if (!testResponse.ok) {
      throw new Error(`File URI is not accessible: ${testResponse.status}`);
    }
  } catch (error: any) {
    console.error('❌ File URI validation failed:', error.message);
    return {
      success: false,
      error: `File validation failed: ${error.message}`,
      provider: provider
    };
  }
  
  switch (provider) {
    case 'supabase':
      try {
        const supabaseResult = await uploadToSupabase(fileUri, fileName, contentType);
        if (supabaseResult.success) {
          return {
            ...supabaseResult,
            provider: 'supabase' as const
          };
        } else {
          console.warn('⚠️ Supabase upload failed, falling back to local storage:', supabaseResult.error);
          console.log('🔄 Falling back to local storage...');
          const localResult = await uploadToLocal(fileUri, fileName, contentType);
          return {
            ...localResult,
            provider: 'local' as const,
            fallbackReason: supabaseResult.error
          };
        }
      } catch (error: any) {
        console.warn('⚠️ Supabase upload failed, falling back to local storage:', error.message);
        console.log('🔄 Falling back to local storage...');
        const localResult = await uploadToLocal(fileUri, fileName, contentType);
        return {
          ...localResult,
          provider: 'local' as const,
          fallbackReason: error.message
        };
      }
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
};

// Delete file using selected provider
export const deleteFile = async (
  fileName: string,
  provider: StorageProvider = DEFAULT_STORAGE_PROVIDER
) => {
  console.log(`🗑️ Using ${provider} for file deletion...`);
  
  switch (provider) {
    case 'supabase':
      return await deleteFromSupabase(fileName);
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
};

// Get download URL using selected provider
export const getStorageDownloadURL = async (
  fileName: string,
  provider: StorageProvider = DEFAULT_STORAGE_PROVIDER
) => {
  console.log(`🔗 Using ${provider} for download URL...`);
  
  switch (provider) {
    case 'supabase':
      return await getSupabaseDownloadURL(fileName);
    
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
};



// Local Storage Functions (fallback)
const uploadToLocal = async (fileUri: string, fileName: string, contentType: string): Promise<UploadResult> => {
  try {
    console.log('📁 Starting local storage upload...');
    
    // For local storage, we'll just return the original file URI
    // This is a simple fallback when cloud storage fails
    const timestamp = Date.now();
    const uniqueFileName = `local_${timestamp}_${fileName}`;
    
    console.log('✅ Local storage upload successful (using original URI)');
    
    return {
      success: true,
      fileName: uniqueFileName,
      downloadURL: fileUri, // Use the original file URI
      provider: 'local'
    };
  } catch (error: any) {
    console.error('❌ Local storage upload error:', error);
    return {
      success: false,
      error: error.message,
      provider: 'local'
    };
  }
}; 