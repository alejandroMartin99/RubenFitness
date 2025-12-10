import { Component } from '@angular/core';

interface ClientKpi {
  label: string;
  value: string;
  trend?: string;
}

interface ClientRow {
  name: string;
  email: string;
  lastWorkout: string;
  workoutsWeek: number;
  volumeWeek: number;
  streak: number;
  weight: number;
  fat: number;
  muscle: number;
  goals: string[];
}

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {
  search = '';

  kpis: ClientKpi[] = [
    { label: 'Usuarios activos', value: '18' },
    { label: 'Workouts esta semana', value: '126', trend: '+8% vs pasada' },
    { label: 'Volumen total', value: '182,4 k kg', trend: '+3,2% vs pasada' },
    { label: 'Racha media', value: '4.2 días' }
  ];

  clients: ClientRow[] = [
    {
      name: 'Alejandro Martín',
      email: 'alex@cliente.com',
      lastWorkout: 'Hoy',
      workoutsWeek: 4,
      volumeWeek: 18200,
      streak: 5,
      weight: 72.4,
      fat: 18.2,
      muscle: 34.5,
      goals: ['Hipertrofia', 'Espalda-Bíceps']
    },
    {
      name: 'Laura Gómez',
      email: 'laura@cliente.com',
      lastWorkout: 'Ayer',
      workoutsWeek: 3,
      volumeWeek: 14200,
      streak: 3,
      weight: 61.0,
      fat: 22.0,
      muscle: 27.8,
      goals: ['Definición', 'Pecho-Tríceps']
    },
    {
      name: 'Sergio Díaz',
      email: 'sergio@cliente.com',
      lastWorkout: 'Hace 3 días',
      workoutsWeek: 2,
      volumeWeek: 9800,
      streak: 2,
      weight: 78.3,
      fat: 16.5,
      muscle: 36.2,
      goals: ['Pierna', 'Fuerza']
    }
  ];

  get filteredClients(): ClientRow[] {
    const term = this.search.toLowerCase().trim();
    if (!term) return this.clients;
    return this.clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.goals.some(g => g.toLowerCase().includes(term))
    );
  }
}


