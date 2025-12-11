import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';
import { SupabaseService } from '../../../core/services/supabase.service';

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
  hourOptions = ['mañana', 'tarde', 'noche'];
  nutritionOptions = ['balanceada', 'vegana', 'vegetariana', 'keto'];
  injuryOptions = ['ninguna', 'espalda', 'rodilla', 'hombro', 'tobillo', 'muñeca', 'codo', 'cuello', 'cadera', 'tendinitis'];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private supabaseService: SupabaseService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      gender: [null, [Validators.required]],
      birthDate: [null],
      heightCm: [null],
      weightKg: [null],
      bodyFatPercent: [null],
      muscleMassKg: [null],
      phone: [null, [Validators.maxLength(20)]],
      goal: [null, [Validators.required, Validators.maxLength(200)]],
      trainingFrequency: [null, [Validators.required]],
      activityLevel: [null, [Validators.required]],
      // Habits breakdown
      diet: [null, [Validators.required]],
      sleepHoursTarget: [null, [Validators.required]],
      waterGoalMl: [null, [Validators.required]],
      injuries: [[]],
      medication: [''],
      trainingExperience: [null, [Validators.required]],
      equipment: [[], [this.arrayRequired]],
      availabilityHours: [[], [this.arrayRequired]],
      stressLevel: [null, [Validators.required]],
      nutritionPreference: [null, [Validators.required]],
      smoking: [null, [this.nonNullValidator]],
      alcohol: [null, [this.nonNullValidator]],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
    const profile: UserProfile = this.form.value as UserProfile;
    this.profileService.saveProfile(profile);
    this.profileService.saveProfileToBackend(profile);
  }

  private arrayRequired(control: any) {
    const value = control.value as any[];
    return Array.isArray(value) && value.length > 0 ? null : { required: true };
  }

  private nonNullValidator(control: AbstractControl) {
    return control.value === null || control.value === undefined ? { required: true } : null;
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

  get trainingValid(): boolean {
    return this.areControlsValid([
      'trainingExperience',
      'trainingFrequency',
      'equipment',
      'availabilityHours'
    ]);
  }

  ngOnInit(): void {
    const cached = this.profileService.getProfile();
    if (cached) {
      this.form.patchValue(cached);
      this.photoPreview = cached.photoUrl || null;
    }

    const backend$ = this.profileService.fetchProfileFromBackend();
    if (backend$) {
      backend$.subscribe({
        next: (profile) => {
          // Solo parchear campos que vienen con valor para no pisar lo ya mostrado
          const patch: any = {};
          Object.entries(profile || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
              patch[k] = v;
            }
          });
          if (Object.keys(patch).length) {
            this.form.patchValue(patch);
          }
          if (!this.photoPreview && profile.photoUrl) {
            this.photoPreview = profile.photoUrl;
            this.form.patchValue({ photoUrl: profile.photoUrl });
          }
        },
        error: () => {
          // silencioso
        }
      });
    }

    // Fallback: usar metadatos de auth (Google) para nombre/foto si faltan
    this.supabaseService.getClient().auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      const meta = user?.user_metadata || {};
      const authName = meta['full_name'] || meta['name'] || meta['user_name'] || user?.email;
      const authAvatar = meta['avatar_url'] || meta['picture'] || meta['photo_url'];

      if (!this.form.value.fullName && authName) {
        this.form.patchValue({ fullName: authName });
      }
      if (!this.photoPreview && authAvatar) {
        this.photoPreview = authAvatar;
        this.form.patchValue({ photoUrl: authAvatar });
      }
    }).catch(() => {});
  }
}
