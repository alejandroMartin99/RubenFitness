import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '../../../../core/services/workout.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-workout-calendar-compact',
  templateUrl: './workout-calendar-compact.component.html',
  styleUrls: ['./workout-calendar-compact.component.scss']
})
export class WorkoutCalendarCompactComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;

  // Calendar data
  currentDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  workoutDays: Set<string> = new Set(); // Set of dates (YYYY-MM-DD) that have workouts
  todayWorkoutCompleted: boolean = false;
  loading: boolean = false;

  constructor(
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initCalendar();
    if (this.user) {
      this.loadWorkoutDays();
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.loadWorkoutDays();
    }
  }

  initCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

    this.calendarDays = [];

    // Add days from previous month to complete first week
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(prevYear, prevMonth, day);
      const dateStr = this.formatDate(date);
      const hasWorkout = this.workoutDays.has(dateStr);
      const isToday = this.isToday(date);

      this.calendarDays.push({
        day: day,
        date: date,
        isToday: isToday,
        hasWorkout: hasWorkout,
        dayName: this.getDayName(date.getDay()),
        isOtherMonth: true
      });
    }

    // Add days of the current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const isToday = this.isToday(date);
      const hasWorkout = this.workoutDays.has(dateStr);

      this.calendarDays.push({
        day: day,
        date: date,
        isToday: isToday,
        hasWorkout: hasWorkout,
        dayName: this.getDayName(date.getDay()),
        isOtherMonth: false
      });
    }

    // Add days from next month to ensure exactly 5 weeks (35 days total)
    const totalDays = this.calendarDays.length;
    const targetDays = 35; // 5 weeks × 7 days
    const daysToAdd = targetDays - totalDays;
    
    for (let day = 1; day <= daysToAdd; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const date = new Date(nextYear, nextMonth, day);
      const dateStr = this.formatDate(date);
      const hasWorkout = this.workoutDays.has(dateStr);
      const isToday = this.isToday(date);

      this.calendarDays.push({
        day: day,
        date: date,
        isToday: isToday,
        hasWorkout: hasWorkout,
        dayName: this.getDayName(date.getDay()),
        isOtherMonth: true
      });
    }
  }

  loadWorkoutDays(): void {
    if (!this.user) return;

    // Don't set loading for month changes, just silently load
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    
    // Always load current month data too to check if today is completed
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // If viewing a different month, load both months
    if (year !== currentYear || month !== currentMonth) {
      // Load current month first to check today
      this.workoutService.getWorkoutDays(currentYear, currentMonth).subscribe({
        next: (currentResponse: any) => {
          const currentWorkoutDaysArray: string[] = (currentResponse.workout_days || []) as string[];
          const currentWorkoutDays = new Set<string>(currentWorkoutDaysArray);
          const todayStr = this.formatDate(today);
          
          // Update today status based on current month data
          this.todayWorkoutCompleted = currentWorkoutDays.has(todayStr);
          
          // Now load the month being viewed
          this.workoutService.getWorkoutDays(year, month).subscribe({
            next: (response: any) => {
              console.log('🏋️ Workout days loaded:', response);
              
              // Merge both sets
              const viewedMonthDays: string[] = (response.workout_days || []) as string[];
              this.workoutDays = new Set<string>([...currentWorkoutDays, ...viewedMonthDays]);
              
              // Refresh calendar
              this.initCalendar();
            },
            error: (err) => {
              console.error('❌ Error loading workout days:', err);
              this.workoutDays = new Set<string>(currentWorkoutDays);
              this.initCalendar();
            }
          });
        },
        error: (err) => {
          console.error('❌ Error loading current month workout days:', err);
          // Try to load just the viewed month
          this.workoutService.getWorkoutDays(year, month).subscribe({
            next: (response: any) => {
              const workoutDaysArray: string[] = (response.workout_days || []) as string[];
              this.workoutDays = new Set<string>(workoutDaysArray);
              const todayStr = this.formatDate(today);
              this.todayWorkoutCompleted = this.workoutDays.has(todayStr);
              this.initCalendar();
            },
            error: (err2) => {
              console.error('❌ Error loading workout days:', err2);
              this.workoutDays = new Set<string>();
              this.todayWorkoutCompleted = false;
              this.initCalendar();
            }
          });
        }
      });
    } else {
      // Viewing current month, just load it
      this.workoutService.getWorkoutDays(year, month).subscribe({
        next: (response: any) => {
          console.log('🏋️ Workout days loaded:', response);
          
          const workoutDaysArray: string[] = (response.workout_days || []) as string[];
          this.workoutDays = new Set<string>(workoutDaysArray);
          
          // Update today status
          const todayStr = this.formatDate(today);
          this.todayWorkoutCompleted = this.workoutDays.has(todayStr);
          
          // Refresh calendar
          this.initCalendar();
        },
        error: (err) => {
          console.error('❌ Error loading workout days:', err);
          this.workoutDays = new Set<string>();
          this.todayWorkoutCompleted = false;
          this.initCalendar();
        }
      });
    }
  }

  markDayAsWorkout(calendarDay: CalendarDay): void {
    if (!this.user || !calendarDay.date || calendarDay.hasWorkout || this.loading) return;
    
    const date = calendarDay.date;
    const dateStr = this.formatDate(date);
    
    // Don't allow marking future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      console.log('⚠️ Cannot mark future dates');
      return; // Can't mark future dates
    }
    
    this.loading = true;
    this.workoutService.markWorkoutDay(date).subscribe({
      next: (response: any) => {
        console.log('🏋️ Workout marked for date:', dateStr, response);
        
        this.workoutDays.add(dateStr);
        
        // Update today status if marking today
        const today = new Date();
        const todayStr = this.formatDate(today);
        if (dateStr === todayStr) {
          this.todayWorkoutCompleted = true;
        }
        
        // Refresh calendar
        this.initCalendar();
        
        this.loading = false;

        // Prompt to log workout in Progress
        const goLog = window.confirm(`¿Quieres registrar un entrenamiento el ${dateStr}?`);
        if (goLog) {
          this.router.navigate(['/progress'], { queryParams: { date: dateStr } });
        }
      },
      error: (err) => {
        console.error('❌ Error marking workout:', err);
        this.loading = false;
      }
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    // Initialize calendar immediately to prevent flickering
    this.initCalendar();
    if (this.user) {
      this.loadWorkoutDays();
    }
  }

  nextMonth(): void {
    // Only allow going to current month or past months
    const today = new Date();
    const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    
    if (nextMonth > today) {
      return; // Can't go to future months
    }
    
    this.currentDate = nextMonth;
    // Initialize calendar immediately to prevent flickering
    this.initCalendar();
    if (this.user) {
      this.loadWorkoutDays();
    }
  }

  trackByDate(index: number, calendarDay: CalendarDay): string {
    if (!calendarDay.date) return `empty-${index}`;
    return this.formatDate(calendarDay.date);
  }

  isCurrentMonth(): boolean {
    const today = new Date();
    return this.currentDate.getMonth() === today.getMonth() && 
           this.currentDate.getFullYear() === today.getFullYear();
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  isFutureDate(date: Date | null): boolean {
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate > today;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDayName(dayIndex: number): string {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[dayIndex];
  }

  getWorkoutCount(): number {
    return this.workoutDays.size;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}

interface CalendarDay {
  day: number | null;
  date: Date | null;
  isToday: boolean;
  hasWorkout: boolean;
  dayName: string;
  isOtherMonth?: boolean;
}

