import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;
  photoPreview: string | null = null;
  showSummary = false;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit(): void {
    const existing = this.profileService.getProfile();
    this.photoPreview = existing?.photoUrl || null;
    this.form = this.fb.group({
      // Contacto
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      emergencyName: [''],
      emergencyPhone: [''],

      fullName: [existing?.fullName || '', [Validators.maxLength(80)]],
      gender: [existing?.gender || 'other'],
      birthDate: [existing?.birthDate || ''],
      heightCm: [existing?.heightCm || null, [Validators.min(50), Validators.max(250)]],
      weightKg: [existing?.weightKg || null, [Validators.min(20), Validators.max(300)]],
      goal: [existing?.goal || ''],
      frequency: ['3'],
      activityLevel: [existing?.activityLevel || 'medium'],
      complexion: ['mesomorph'],
      sleep: ['6-7h'],
      water: ['1-2L'],
      diet: ['balanceada'],
      habitsQuick: [[]],
      experience: ['intermediate'],
      equipment: [[]],
      availability: [[]],
      injuries: [[]],
      medication: ['none'],
      allergies: [[]],
      familyHistory: [[]],
      trainingPrefs: [[]],
      nutritionPref: ['balanceada'],
      sleepTime: ['23:00'],
      stress: ['medio'],
      // Gym specifics
      gymName: [''],
      membershipId: [''],
      trainerPreference: ['indiferente'],
      availabilityDays: [[]],
      availabilityHours: [[]],
      timeframe: ['12 semanas'],
      prs: [''],
      habits: [existing?.habits || '', [Validators.maxLength(500)]],
      photoUrl: [existing?.photoUrl || '']
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
      this.form.patchValue({ photoUrl: this.photoPreview });
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    const v = this.form.value;
    const profile: UserProfile = {
      fullName: v.fullName,
      gender: v.gender,
      birthDate: v.birthDate,
      heightCm: v.heightCm,
      weightKg: v.weightKg,
      goal: v.goal,
      activityLevel: v.activityLevel,
      complexion: v.complexion,
      habits: this.composeHabits(v),
      photoUrl: v.photoUrl
    };
    this.profileService.saveProfile(profile);
    this.profileService.saveProfileToBackend(profile);
    this.showSummary = true;
  }

  private composeHabits(v: any): string {
    const parts: string[] = [];
    if (v.habitsQuick?.length) parts.push(`hábitos:${(v.habitsQuick as string[]).join('/')}`);
    if (v.experience) parts.push(`experiencia:${v.experience}`);
    if (v.equipment?.length) parts.push(`equipo:${(v.equipment as string[]).join('/')}`);
    if (v.availability?.length) parts.push(`horario:${(v.availability as string[]).join('/')}`);
    if (v.injuries?.length) parts.push(`lesiones:${(v.injuries as string[]).join('/')}`);
    if (v.medication && v.medication !== 'none') parts.push(`medicación:${v.medication}`);
    if (v.allergies?.length) parts.push(`alergias:${(v.allergies as string[]).join('/')}`);
    if (v.familyHistory?.length) parts.push(`familia:${(v.familyHistory as string[]).join('/')}`);
    if (v.trainingPrefs?.length) parts.push(`entreno:${(v.trainingPrefs as string[]).join('/')}`);
    if (v.nutritionPref) parts.push(`nutrición:${v.nutritionPref}`);
    if (v.sleepTime) parts.push(`sueño:${v.sleepTime}`);
    if (v.stress) parts.push(`estrés:${v.stress}`);
    if (v.gymName) parts.push(`gym:${v.gymName}`);
    if (v.membershipId) parts.push(`membresía:${v.membershipId}`);
    if (v.trainerPreference) parts.push(`entrenador:${v.trainerPreference}`);
    if (v.availabilityDays?.length) parts.push(`días:${(v.availabilityDays as string[]).join('/')}`);
    if (v.availabilityHours?.length) parts.push(`horas:${(v.availabilityHours as string[]).join('/')}`);
    if (v.timeframe) parts.push(`horizonte:${v.timeframe}`);
    if (v.prs) parts.push(`prs:${v.prs}`);
    // Contacto
    if (v.email) parts.push(`email:${v.email}`);
    if (v.phone) parts.push(`tel:${v.phone}`);
    if (v.address) parts.push(`dir:${v.address}`);
    if (v.city) parts.push(`ciudad:${v.city}`);
    if (v.country) parts.push(`pais:${v.country}`);
    if (v.emergencyName || v.emergencyPhone) parts.push(`emergencia:${v.emergencyName || ''}/${v.emergencyPhone || ''}`);
    if (v.sleep) parts.push(`patrón-sueño:${v.sleep}`);
    if (v.water) parts.push(`agua:${v.water}`);
    if (v.diet) parts.push(`dieta:${v.diet}`);
    if (v.habits) parts.push(v.habits);
    return parts.join(' | ');
  }
}


