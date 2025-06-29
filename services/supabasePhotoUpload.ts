/**
 * Supabase Photo Upload Service
 * 
 * Handles uploading photos to Supabase Storage buckets with proper error handling,
 * compression, and path management for the Roomies app.
 */

import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface PhotoUploadOptions {
  compress?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Service for handling photo uploads to Supabase Storage
 */
export const SupabasePhotoUpload = {
  /**
   * Upload a user profile photo to the avatars bucket
   */
  uploadUserPhoto: async (
    uri: string, 
    userId: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> => {
    try {
      const fileName = `${userId}/profile_${Date.now()}.jpg`;
      return await uploadPhoto(uri, 'avatars', fileName, options);
    } catch (error) {
      console.error('[SupabasePhotoUpload] Error uploading user photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload user photo'
      };
    }
  },

  /**
   * Upload a listing photo to the listings bucket
   */
  uploadListingPhoto: async (
    uri: string, 
    userId: string, 
    listingId?: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> => {
    try {
      const listing = listingId || `listing_${Date.now()}`;
      const fileName = `${userId}/${listing}/photo_${Date.now()}.jpg`;
      return await uploadPhoto(uri, 'listings', fileName, options);
    } catch (error) {
      console.error('[SupabasePhotoUpload] Error uploading listing photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload listing photo'
      };
    }
  },

  /**
   * Upload a room detail photo to the room-photos bucket
   */
  uploadRoomPhoto: async (
    uri: string, 
    userId: string, 
    roomId?: string,
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult> => {
    try {
      const room = roomId || `room_${Date.now()}`;
      const fileName = `${userId}/${room}/photo_${Date.now()}.jpg`;
      return await uploadPhoto(uri, 'room-photos', fileName, options);
    } catch (error) {
      console.error('[SupabasePhotoUpload] Error uploading room photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload room photo'
      };
    }
  },

  /**
   * Delete a photo from storage
   */
  deletePhoto: async (path: string, bucket: string): Promise<PhotoUploadResult> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return {
        success: true,
        path
      };
    } catch (error) {
      console.error('[SupabasePhotoUpload] Error deleting photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete photo'
      };
    }
  },

  /**
   * Get public URL for a photo
   */
  getPhotoUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Upload multiple photos at once
   */
  uploadMultiplePhotos: async (
    uris: string[],
    userId: string,
    bucket: 'avatars' | 'listings' | 'room-photos',
    options: PhotoUploadOptions = {}
  ): Promise<PhotoUploadResult[]> => {
    const uploads = uris.map(async (uri, index) => {
      switch (bucket) {
        case 'avatars':
          return await SupabasePhotoUpload.uploadUserPhoto(uri, userId, options);
        case 'listings':
          return await SupabasePhotoUpload.uploadListingPhoto(uri, userId, undefined, options);
        case 'room-photos':
          return await SupabasePhotoUpload.uploadRoomPhoto(uri, userId, undefined, options);
        default:
          return {
            success: false,
            error: 'Invalid bucket type'
          };
      }
    });

    return await Promise.all(uploads);
  }
};

/**
 * Internal function to handle the actual photo upload process
 */
const uploadPhoto = async (
  uri: string,
  bucket: string,
  fileName: string,
  options: PhotoUploadOptions = {}
): Promise<PhotoUploadResult> => {
  try {
    // Default options
    const {
      compress = true,
      quality = 0.8,
      maxWidth = 1200,
      maxHeight = 1200,
      retries = 3,
      retryDelay = 1000
    } = options;

    let finalUri = uri;

    // Compress and resize if requested
    if (compress) {
      console.log('[SupabasePhotoUpload] Compressing image...');
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width: maxWidth, height: maxHeight } }
        ],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );
      finalUri = result.uri;
    }

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(finalUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer for React Native
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage with retry logic
    console.log(`[SupabasePhotoUpload] Uploading to ${bucket}/${fileName}...`);
    const { data, error } = await withRetry(
      () => supabase.storage
        .from(bucket)
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        }),
      retries,
      retryDelay
    );

    if (error) {
      throw error;
    }

    // Get the public URL
    const publicUrl = SupabasePhotoUpload.getPhotoUrl(bucket, fileName);

    console.log(`[SupabasePhotoUpload] Upload successful: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl,
      path: fileName
    };

  } catch (error) {
    console.error('[SupabasePhotoUpload] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};

/**
 * Helper function to extract bucket and path from a Supabase Storage URL
 */
export const parseSupabaseUrl = (url: string): { bucket: string; path: string } | null => {
  try {
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return null;
    
    const pathParts = urlParts[1].split('/');
    const bucket = pathParts[0];
    const path = pathParts.slice(1).join('/');
    
    return { bucket, path };
  } catch {
    return null;
  }
};

/**
 * Retry wrapper for network operations
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      console.warn(`[SupabasePhotoUpload] Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

/**
 * Check if error is retryable (network issues, timeouts, etc.)
 */
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code || error.status;
  
  // Network-related errors
  if (errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes that are retryable
  if (errorCode === 408 || // Request Timeout
      errorCode === 429 || // Too Many Requests
      errorCode === 500 || // Internal Server Error
      errorCode === 502 || // Bad Gateway
      errorCode === 503 || // Service Unavailable
      errorCode === 504) { // Gateway Timeout
    return true;
  }
  
  return false;
};

export default SupabasePhotoUpload;