import { Component, OnInit } from '@angular/core';
import { ProgressService } from '../../../core/services/progress.service';
import { StorageService } from '../../../core/services/storage.service';
import { ProgressPhoto } from '../../../core/models/progress.model';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-before-after',
  templateUrl: './before-after.component.html',
  styleUrls: ['./before-after.component.scss']
})
export class BeforeAfterComponent implements OnInit {
  beforePhotos: ProgressPhoto[] = [];
  afterPhotos: ProgressPhoto[] = [];
  loading = false;
  uploading = false;
  selectedPhotoType: 'before' | 'after' = 'before';
  selectedPhoto: ProgressPhoto | null = null;
  showUploadDialog = false;
  showComparisonView = false;

  // Form data
  photoFile: File | null = null;
  photoPreview: string | null = null;
  photoNotes = '';
  measurements = {
    weight: null as number | null,
    bodyFat: null as number | null,
    chest: null as number | null,
    waist: null as number | null,
    hips: null as number | null,
    arms: null as number | null,
    thighs: null as number | null
  };

  constructor(
    private progressService: ProgressService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPhotos();
  }

  /**
   * Load all progress photos
   */
  loadPhotos(): void {
    this.loading = true;
    this.progressService.getProgressPhotos().subscribe({
      next: (photos) => {
        this.beforePhotos = photos.filter(p => p.photoType === 'before');
        this.afterPhotos = photos.filter(p => p.photoType === 'after');
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading photos:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Open upload dialog
   */
  openUploadDialog(type: 'before' | 'after'): void {
    this.selectedPhotoType = type;
    this.showUploadDialog = true;
    this.resetForm();
  }

  /**
   * Close upload dialog
   */
  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.resetForm();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      this.photoFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Convert measurements from component format to model format
   */
  private convertMeasurements(): { weight?: number; bodyFat?: number; measurements?: { chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number } } | undefined {
    const hasAnyMeasurement = Object.values(this.measurements).some(v => v !== null);
    if (!hasAnyMeasurement) {
      return undefined;
    }

    const bodyMeasurements: { chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number } = {};
    if (this.measurements.chest !== null) bodyMeasurements.chest = this.measurements.chest;
    if (this.measurements.waist !== null) bodyMeasurements.waist = this.measurements.waist;
    if (this.measurements.hips !== null) bodyMeasurements.hips = this.measurements.hips;
    if (this.measurements.arms !== null) bodyMeasurements.arms = this.measurements.arms;
    if (this.measurements.thighs !== null) bodyMeasurements.thighs = this.measurements.thighs;

    const hasBodyMeasurements = Object.keys(bodyMeasurements).length > 0;

    const result: { weight?: number; bodyFat?: number; measurements?: { chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number } } = {};
    
    if (this.measurements.weight !== null) {
      result.weight = this.measurements.weight;
    }
    if (this.measurements.bodyFat !== null) {
      result.bodyFat = this.measurements.bodyFat;
    }
    if (hasBodyMeasurements) {
      result.measurements = bodyMeasurements;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Upload photo
   */
  uploadPhoto(): void {
    if (!this.photoFile) {
      alert('Please select a photo');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('User not authenticated');
      return;
    }

    this.uploading = true;

    // Create thumbnail first
    this.storageService.createThumbnail(this.photoFile!, 300, 300)
      .subscribe({
        next: (thumbnailFile) => {
          // Upload both original and thumbnail in parallel
          const originalUpload = this.storageService.uploadProgressPhoto(this.photoFile!, user.id, this.selectedPhotoType);
          const thumbnailUpload = this.storageService.uploadProgressPhoto(thumbnailFile, user.id, this.selectedPhotoType);

          // Use forkJoin to upload both simultaneously
          forkJoin([originalUpload, thumbnailUpload]).subscribe({
            next: ([originalResult, thumbnailResult]) => {
              // Save photo record with both URLs
              this.progressService.saveProgressPhoto({
                userId: user.id,
                photoType: this.selectedPhotoType,
                photoUrl: originalResult.url,
                thumbnailUrl: thumbnailResult.url,
                notes: this.photoNotes || undefined,
                measurements: this.convertMeasurements()
              }).subscribe({
                next: () => {
                  this.uploading = false;
                  this.closeUploadDialog();
                  this.loadPhotos();
                  alert('Photo uploaded successfully!');
                },
                error: (err) => {
                  console.error('Error saving photo record:', err);
                  this.uploading = false;
                  alert('Error saving photo. Please try again.');
                }
              });
            },
            error: (err) => {
              console.error('Error uploading photos:', err);
              this.uploading = false;
              alert('Error uploading photo. Please try again.');
            }
          });
        },
        error: (err) => {
          console.error('Error creating thumbnail:', err);
          // Upload only original if thumbnail creation fails
          this.storageService.uploadProgressPhoto(this.photoFile!, user.id, this.selectedPhotoType)
            .subscribe({
              next: ({ url }) => {
                this.progressService.saveProgressPhoto({
                  userId: user.id,
                  photoType: this.selectedPhotoType,
                  photoUrl: url,
                  notes: this.photoNotes || undefined,
                  measurements: this.convertMeasurements()
                }).subscribe({
                  next: () => {
                    this.uploading = false;
                    this.closeUploadDialog();
                    this.loadPhotos();
                    alert('Photo uploaded successfully!');
                  },
                  error: (err) => {
                    console.error('Error saving photo record:', err);
                    this.uploading = false;
                    alert('Error saving photo. Please try again.');
                  }
                });
              },
              error: (uploadErr) => {
                console.error('Error uploading photo:', uploadErr);
                this.uploading = false;
                alert('Error uploading photo. Please try again.');
              }
            });
        }
      });
  }

  /**
   * Delete photo
   */
  deletePhoto(photo: ProgressPhoto): void {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    this.progressService.deleteProgressPhoto(photo.id).subscribe({
      next: () => {
        this.loadPhotos();
        if (this.selectedPhoto?.id === photo.id) {
          this.selectedPhoto = null;
          this.showComparisonView = false;
        }
      },
      error: (err) => {
        console.error('Error deleting photo:', err);
        alert('Error deleting photo. Please try again.');
      }
    });
  }

  /**
   * View comparison
   */
  viewComparison(before: ProgressPhoto, after: ProgressPhoto): void {
    this.selectedPhoto = before;
    this.showComparisonView = true;
  }

  /**
   * Close comparison view
   */
  closeComparison(): void {
    this.showComparisonView = false;
    this.selectedPhoto = null;
  }

  /**
   * Reset form
   */
  private resetForm(): void {
    this.photoFile = null;
    this.photoPreview = null;
    this.photoNotes = '';
    this.measurements = {
      weight: null,
      bodyFat: null,
      chest: null,
      waist: null,
      hips: null,
      arms: null,
      thighs: null
    };
  }
}

