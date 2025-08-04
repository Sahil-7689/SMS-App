import { createClient } from '@supabase/supabase-js';

// Supabase Configuration using environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kvthiphblhmsadoofvvq.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dGhpcGhibGhtc2Fkb29mdnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTgyNDksImV4cCI6MjA2OTc5NDI0OX0.phhsUcoRBskEw48tknSlM9rnoG8DPp0wUlhI3Fk1gqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Upload file to Supabase Storage
export const uploadToSupabase = async (fileUri: string, fileName: string, contentType: string) => {
  try {
    console.log('📁 Starting Supabase upload...');
    
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase.storage
      .from('syllabi')
      .list('', { limit: 1 });
    
    if (testError) {
      console.warn('⚠️ Supabase connection test failed:', testError.message);
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }
    
    // Fetch the file and convert to blob with timeout
    const fetchPromise = fetch(fileUri);
    const fetchTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fetch timeout')), 15000)
    );
    
    const response = await Promise.race([fetchPromise, fetchTimeoutPromise]) as Response;
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('📦 File blob size:', blob.size, 'bytes');
    
    // Validate blob size
    if (blob.size === 0) {
      throw new Error('File blob is empty');
    }
    
    // Create unique filename
    const timestamp = Date.now();
    const uniqueFileName = `syllabi/${timestamp}_${fileName}`;
    
    // Upload to Supabase Storage with retry logic
    let data, error;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const uploadPromise = supabase.storage
          .from('syllabi')
          .upload(uniqueFileName, blob, {
            contentType: contentType,
            cacheControl: '3600',
          });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 30000)
        );
        
        const result = await Promise.race([uploadPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
        
        if (error) {
          throw new Error(`Supabase upload failed: ${error.message}`);
        }
        
        console.log('✅ Supabase upload successful');
        break;
      } catch (uploadError: any) {
        retryCount++;
        console.warn(`⚠️ Supabase upload attempt ${retryCount} failed:`, uploadError.message);
        
        if (retryCount >= maxRetries) {
          throw uploadError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('syllabi')
      .getPublicUrl(uniqueFileName);
    
    return {
      success: true,
      fileName: uniqueFileName,
      downloadURL: urlData.publicUrl,
      fileId: data.path,
    };
  } catch (error: any) {
    console.error('❌ Supabase upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.message.includes('Network request failed')) {
      errorMessage = 'Network connectivity issue. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Delete file from Supabase Storage
export const deleteFromSupabase = async (fileName: string) => {
  try {
    const { error } = await supabase.storage
      .from('syllabi')
      .remove([fileName]);
    
    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Supabase delete error:', error);
    return { success: false, error: error.message };
  }
};

// Get download URL for a file
export const getSupabaseDownloadURL = async (fileName: string) => {
  try {
    const { data } = supabase.storage
      .from('syllabi')
      .getPublicUrl(fileName);
    
    return { success: true, downloadURL: data.publicUrl };
  } catch (error: any) {
    console.error('❌ Supabase get URL error:', error);
    return { success: false, error: error.message };
  }
}; 