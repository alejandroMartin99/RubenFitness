import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  photoPreview: string | null = null;

  genders = [
    { value: 'male', label: 'Hombre' },
    { value: 'female', label: 'Mujer' },
    { value: 'other', label: 'Otro' }
  ];

  activityLevels = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.maxLength(100)]],
      gender: [null],
      birthDate: [null],
      heightCm: [null],
      weightKg: [null],
      goal: ['', [Validators.maxLength(200)]],
      activityLevel: [null],
      habits: ['', [Validators.maxLength(500)]],
      photoUrl: [null]
    });
  }

  ngOnInit(): void {
    const existing = this.profileService.getProfile();
    if (existing) {
      this.form.patchValue(existing);
      this.photoPreview = existing.photoUrl || null;
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.photoPreview = dataUrl;
      this.form.patchValue({ photoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) return;
    const profile: UserProfile = this.form.value as UserProfile;
    this.profileService.saveProfile(profile);
    this.profileService.saveProfileToBackend(profile);
  }
}
