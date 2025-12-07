/**
 * Storage Service
 * Handles file uploads to Supabase Storage
 */

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly BUCKET_NAME = 'progress-photos';

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Upload a progress photo to Supabase Storage
   * @param file File to upload
   * @param userId User ID
   * @param photoType 'before' or 'after'
   * @returns Observable with the public URL of the uploaded file
   */
  uploadProgressPhoto(
    file: File,
    userId: string,
    photoType: 'before' | 'after'
  ): Observable<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${photoType}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    return from(
      this.supabaseService.getClient().storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        
        // Get public URL
        const { data: urlData } = this.supabaseService.getClient().storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        return {
          path: filePath,
          url: urlData.publicUrl
        };
      }),
      catchError((error) => {
        console.error('Error uploading photo:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a progress photo
   * @param filePath Path to the file in storage
   */
  deleteProgressPhoto(filePath: string): Observable<void> {
    return from(
      this.supabaseService.getClient().storage
        .from(this.BUCKET_NAME)
        .remove([filePath])
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      })
    );
  }

  /**
   * Get public URL for a stored file
   * @param filePath Path to the file
   */
  getPublicUrl(filePath: string): string {
    const { data } = this.supabaseService.getClient().storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Create thumbnail from image (client-side resize)
   * @param file Original image file
   * @param maxWidth Maximum width for thumbnail
   * @param maxHeight Maximum height for thumbnail
   */
  createThumbnail(file: File, maxWidth = 300, maxHeight = 300): Observable<File> {
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const thumbnailFile = new File([blob], `thumb-${file.name}`, {
                  type: file.type,
                  lastModified: Date.now()
                });
                observer.next(thumbnailFile);
                observer.complete();
              } else {
                observer.error(new Error('Failed to create thumbnail'));
              }
            }, file.type, 0.8);
          } else {
            observer.error(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = (error) => observer.error(error);
        img.src = e.target.result;
      };
      reader.onerror = (error) => observer.error(error);
      reader.readAsDataURL(file);
    });
  }
}

