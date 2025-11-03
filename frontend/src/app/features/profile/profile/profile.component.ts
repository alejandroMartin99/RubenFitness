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
  panelStates = { personal: true, habits: false, training: false };

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

  trainingFrequencyOptions = [
    { value: 'lt2', label: 'Menos de 2' },
    { value: '2-3', label: '2-3' },
    { value: '4+', label: '4 o más' }
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
  injuryOptions = ['ninguna', 'espalda', 'rodilla', 'hombro', 'tobillo', 'muñeca', 'codo', 'cuello', 'cadera', 'tendinitis'];

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      gender: [null, [Validators.required]],
      birthDate: [null],
      heightCm: [null],
      weightKg: [null],
      goal: ['', [Validators.required, Validators.maxLength(200)]],
      trainingFrequency: ['', [Validators.required]],
      activityLevel: [null, [Validators.required]],
      // Habits breakdown
      diet: ['', [Validators.required]],
      sleepHoursTarget: [null, [Validators.required]],
      waterGoalMl: [null, [Validators.required]],
      injuries: [[]],
      medication: [''],
      trainingExperience: ['', [Validators.required]],
      equipment: [[], [this.arrayRequired]],
      availabilityDays: [[], [this.arrayRequired]],
      availabilityHours: [[], [this.arrayRequired]],
      stressLevel: ['', [Validators.required]],
      nutritionPreference: ['', [Validators.required]],
      smoking: [false],
      alcohol: [false],
      notes: [''],
      habits: ['', [Validators.maxLength(500)]],
      photoUrl: [null]
    });
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

  private arrayRequired(control: any) {
    const value = control.value as any[];
    return Array.isArray(value) && value.length > 0 ? null : { required: true };
  }

  // no-op helpers removed; using mat-select for all options

  private areControlsValid(controlNames: string[]): boolean {
    for (const name of controlNames) {
      const control = this.form.get(name);
      if (!control) continue;
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      if (control.invalid) return false;
    }
    return true;
  }

  get personalValid(): boolean {
    return this.areControlsValid(['fullName', 'gender', 'birthDate', 'heightCm', 'weightKg']);
  }

  get habitsValid(): boolean {
    return this.areControlsValid([
      'goal',
      'activityLevel',
      'diet',
      'sleepHoursTarget',
      'waterGoalMl',
      'stressLevel',
      'nutritionPreference',
      'injuries',
      'medication',
      'smoking',
      'alcohol',
      'notes'
    ]);
  }

  ngOnInit(): void {
    const existing = this.profileService.getProfile();
    if (existing) {
      this.form.patchValue(existing);
      this.photoPreview = existing.photoUrl || null;
    }

    // Subscribe to form changes to auto-collapse completed sections
    this.form.valueChanges.subscribe(() => {
      if (this.personalValid && this.panelStates.personal) {
        setTimeout(() => {
          this.panelStates.personal = false;
          this.panelStates.habits = true;
        }, 500);
      }
      if (this.habitsValid && this.panelStates.habits) {
        setTimeout(() => {
          this.panelStates.habits = false;
          this.panelStates.training = true;
        }, 500);
      }
    });
  }
}
