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

  goals = [
    { value: 'fat_loss', label: 'Perder grasa' },
    { value: 'muscle_gain', label: 'Ganar músculo' },
    { value: 'performance', label: 'Rendimiento' },
    { value: 'health', label: 'Salud' }
  ];

  dietOptions = ['balanceada', 'keto', 'vegana', 'vegetariana', 'mediterránea'];
  sleepOptions = [6, 7, 8, 9];
  waterOptions = [1500, 2000, 2500, 3000];
  stressOptions = ['low', 'medium', 'high'];
  experienceOptions = ['beginner', 'intermediate', 'advanced'];
  equipmentOptions = ['gym', 'mancuernas', 'barra', 'bandas', 'peso corporal'];
  dayOptions = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  hourOptions = ['mañana', 'tarde', 'noche'];
  nutritionOptions = ['balanceada', 'vegana', 'vegetariana', 'keto'];
  injuryOptions = ['espalda', 'rodilla', 'hombro', 'tobillo'];
  allergyOptions = ['gluten', 'lactosa', 'frutos secos', 'polen'];

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.maxLength(100)]],
      gender: [null],
      birthDate: [null],
      heightCm: [null],
      weightKg: [null],
      goal: ['', [Validators.maxLength(200)]],
      activityLevel: [null],
      // Habits breakdown
      diet: [''],
      sleepHoursTarget: [null],
      waterGoalMl: [null],
      injuries: [[]],
      allergies: [[]],
      medication: [''],
      trainingExperience: [''],
      equipment: [[]],
      availabilityDays: [[]],
      availabilityHours: [[]],
      stressLevel: [''],
      nutritionPreference: [''],
      smoking: [false],
      alcohol: [false],
      notes: [''],
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

  isSelectedArray(controlName: string, value: string): boolean {
    const arr = this.form.get(controlName)?.value as string[] | undefined;
    return Array.isArray(arr) ? arr.includes(value) : false;
  }

  toggleOption(controlName: string, value: string): void {
    const control = this.form.get(controlName);
    if (!control) return;
    const current = (control.value as string[]) || [];
    const exists = current.includes(value);
    const next = exists ? current.filter(v => v !== value) : [...current, value];
    control.setValue(next);
  }

  selectSingle(controlName: string, value: any): void {
    const control = this.form.get(controlName);
    if (!control) return;
    control.setValue(value);
  }
}
