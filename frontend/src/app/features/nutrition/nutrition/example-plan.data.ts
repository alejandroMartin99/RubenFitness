import { NutritionPlan, NutritionMeal } from '../../../core/services/nutrition.service';

export function getExamplePlan(userId: string): NutritionPlan {
  const now = new Date().toISOString();
  return {
    id: 'example',
    user_id: userId,
    name: 'Plan Hipertrofia - Semana Completa',
    description: 'Plan profesional diseñado para ganancia muscular magra. 2200-2400 kcal según día. Distribución óptima de macros con timing nutricional adaptado al entrenamiento.',
    daily_calories: 2300,
    protein_grams: 175,
    carbs_grams: 230,
    fat_grams: 75,
    notes: `📋 INSTRUCCIONES GENERALES:

💧 HIDRATACIÓN: Mínimo 3L de agua al día. Añadir 500ml extra en días de entreno.

⏰ TIMING: 
- Desayuno: 30min después de despertar
- Pre-entreno: 1.5-2h antes del gym
- Post-entreno: Máximo 1h después del gym
- Cena: Mínimo 2h antes de dormir

💊 SUPLEMENTACIÓN RECOMENDADA:
- Creatina: 5g diarios (cualquier momento)
- Vitamina D3: 2000 UI con desayuno
- Omega 3: 2g con almuerzo
- Magnesio: 400mg antes de dormir

🔄 DÍAS DE DESCANSO: Reducir carbos un 15%, aumentar grasas saludables

⚠️ AJUSTES: Si sientes hambre excesiva, añade 100g de verduras a cualquier comida. Si te sientes hinchado, reduce fibra en pre-entreno.`,
    is_active: true,
    created_at: now,
    updated_at: now
  };
}

export function getExampleMeals(): NutritionMeal[] {
  const now = new Date().toISOString();
  const meals: NutritionMeal[] = [];
  let id = 1;

  // =====================================================
  // LUNES - PECHO / TRÍCEPS (Día de empuje)
  // =====================================================
  const monday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Desayuno Alto en Proteína',
      description: 'Comienza el día con proteína de alta calidad para activar la síntesis proteica muscular.',
      time_suggestion: '07:30',
      calories: 520, protein_grams: 42, carbs_grams: 48, fat_grams: 18,
      foods: [
        { name: 'Claras de huevo', portion: '200g (6-7 claras)' },
        { name: 'Huevo entero', portion: '2 unidades' },
        { name: 'Avena integral', portion: '70g en seco' },
        { name: 'Plátano maduro', portion: '1 mediano (120g)' },
        { name: 'Miel pura', portion: '15g' },
        { name: 'Canela', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Media Mañana',
      description: 'Snack ligero para mantener niveles de aminoácidos estables.',
      time_suggestion: '10:30',
      calories: 280, protein_grams: 25, carbs_grams: 28, fat_grams: 8,
      foods: [
        { name: 'Yogur griego 0%', portion: '200g' },
        { name: 'Frutos rojos mix', portion: '100g' },
        { name: 'Almendras naturales', portion: '15g (10 uds)' },
        { name: 'Semillas de chía', portion: '10g' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Almuerzo Completo',
      description: 'Comida principal del día con balance perfecto de macros.',
      time_suggestion: '14:00',
      calories: 680, protein_grams: 55, carbs_grams: 65, fat_grams: 20,
      foods: [
        { name: 'Pechuga de pollo a la plancha', portion: '220g' },
        { name: 'Arroz basmati', portion: '100g en seco' },
        { name: 'Brócoli al vapor', portion: '150g' },
        { name: 'Zanahoria', portion: '80g' },
        { name: 'Aceite de oliva virgen extra', portion: '12ml' },
        { name: 'Limón y especias', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'pre_workout',
      meal_order: 4,
      name: 'Pre-Entreno (1.5h antes)',
      description: 'Carbohidratos de absorción media-rápida para máxima energía en el gym.',
      time_suggestion: '16:30',
      calories: 380, protein_grams: 25, carbs_grams: 55, fat_grams: 6,
      foods: [
        { name: 'Pan de centeno', portion: '80g (2-3 rebanadas)' },
        { name: 'Pechuga de pavo', portion: '100g' },
        { name: 'Plátano', portion: '1 mediano' },
        { name: 'Miel', portion: '10g' }
      ]
    },
    {
      meal_type: 'post_workout',
      meal_order: 5,
      name: 'Post-Entreno (ventana anabólica)',
      description: 'Proteína rápida + carbos para iniciar la recuperación muscular inmediatamente.',
      time_suggestion: '19:30',
      calories: 320, protein_grams: 35, carbs_grams: 38, fat_grams: 4,
      foods: [
        { name: 'Whey Protein Isolate', portion: '35g (1 scoop)' },
        { name: 'Dextrosa o maltodextrina', portion: '30g' },
        { name: 'Plátano maduro', portion: '1 pequeño' },
        { name: 'Creatina monohidrato', portion: '5g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 6,
      name: 'Cena de Recuperación',
      description: 'Proteína de digestión lenta + grasas saludables para recuperación nocturna.',
      time_suggestion: '21:30',
      calories: 520, protein_grams: 45, carbs_grams: 25, fat_grams: 28,
      foods: [
        { name: 'Salmón al horno', portion: '200g' },
        { name: 'Boniato asado', portion: '150g' },
        { name: 'Espárragos trigueros', portion: '120g' },
        { name: 'Aguacate', portion: '50g' },
        { name: 'Aceite de oliva', portion: '8ml' }
      ]
    }
  ];

  // =====================================================
  // MARTES - ESPALDA / BÍCEPS (Día de tirón)
  // =====================================================
  const tuesday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Tostadas Proteicas',
      description: 'Desayuno rápido pero completo para días de espalda.',
      time_suggestion: '07:30',
      calories: 480, protein_grams: 38, carbs_grams: 45, fat_grams: 16,
      foods: [
        { name: 'Pan de espelta integral', portion: '100g (3 rebanadas)' },
        { name: 'Queso fresco batido 0%', portion: '150g' },
        { name: 'Jamón serrano (sin grasa)', portion: '50g' },
        { name: 'Tomate natural rallado', portion: '100g' },
        { name: 'Aceite de oliva', portion: '10ml' },
        { name: 'Orégano', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Snack de Queso Cottage',
      description: 'Caseína natural para liberación sostenida de aminoácidos.',
      time_suggestion: '10:30',
      calories: 250, protein_grams: 28, carbs_grams: 22, fat_grams: 6,
      foods: [
        { name: 'Queso cottage', portion: '200g' },
        { name: 'Piña natural', portion: '100g' },
        { name: 'Nueces', portion: '10g (3-4 uds)' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Bowl de Ternera',
      description: 'Hierro y creatina natural para máximo rendimiento en ejercicios de tirón.',
      time_suggestion: '14:00',
      calories: 720, protein_grams: 52, carbs_grams: 68, fat_grams: 26,
      foods: [
        { name: 'Ternera magra (solomillo)', portion: '200g' },
        { name: 'Quinoa real', portion: '80g en seco' },
        { name: 'Aguacate', portion: '80g' },
        { name: 'Pimientos asados', portion: '100g' },
        { name: 'Cebolla caramelizada', portion: '50g' },
        { name: 'Semillas de sésamo', portion: '8g' },
        { name: 'Salsa de soja', portion: '10ml' }
      ]
    },
    {
      meal_type: 'pre_workout',
      meal_order: 4,
      name: 'Batido Pre-Entreno',
      description: 'Fácil digestión para entrenar sin pesadez.',
      time_suggestion: '16:30',
      calories: 340, protein_grams: 30, carbs_grams: 45, fat_grams: 5,
      foods: [
        { name: 'Whey Protein', portion: '25g' },
        { name: 'Avena instantánea', portion: '50g' },
        { name: 'Frutos rojos congelados', portion: '80g' },
        { name: 'Leche desnatada', portion: '250ml' }
      ]
    },
    {
      meal_type: 'post_workout',
      meal_order: 5,
      name: 'Recuperación Rápida',
      description: 'Ratio 1:1 proteína-carbo para espalda.',
      time_suggestion: '19:30',
      calories: 350, protein_grams: 35, carbs_grams: 40, fat_grams: 5,
      foods: [
        { name: 'Whey Protein', portion: '35g' },
        { name: 'Arroz inflado', portion: '40g' },
        { name: 'Miel', portion: '15g' },
        { name: 'Creatina', portion: '5g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 6,
      name: 'Merluza con Verduras',
      description: 'Pescado blanco bajo en grasa + verduras para recuperación.',
      time_suggestion: '21:30',
      calories: 480, protein_grams: 42, carbs_grams: 35, fat_grams: 18,
      foods: [
        { name: 'Merluza al horno', portion: '220g' },
        { name: 'Patata cocida', portion: '150g' },
        { name: 'Judías verdes', portion: '150g' },
        { name: 'Aceite de oliva', portion: '12ml' },
        { name: 'Ajo y perejil', portion: 'Al gusto' }
      ]
    }
  ];

  // =====================================================
  // MIÉRCOLES - DESCANSO ACTIVO
  // =====================================================
  const wednesday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Tortilla de Verduras',
      description: 'Día de descanso: menos carbos, más micronutrientes.',
      time_suggestion: '08:00',
      calories: 420, protein_grams: 35, carbs_grams: 25, fat_grams: 22,
      foods: [
        { name: 'Huevos enteros', portion: '3 unidades' },
        { name: 'Claras', portion: '3 unidades' },
        { name: 'Espinacas frescas', portion: '60g' },
        { name: 'Champiñones', portion: '80g' },
        { name: 'Queso feta', portion: '30g' },
        { name: 'Aceite de oliva', portion: '8ml' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Frutos Secos Mix',
      description: 'Grasas saludables para día de recuperación.',
      time_suggestion: '11:00',
      calories: 280, protein_grams: 12, carbs_grams: 15, fat_grams: 22,
      foods: [
        { name: 'Almendras', portion: '20g' },
        { name: 'Nueces', portion: '15g' },
        { name: 'Manzana verde', portion: '1 mediana' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Ensalada César Proteica',
      description: 'Comida ligera pero saciante.',
      time_suggestion: '14:00',
      calories: 580, protein_grams: 48, carbs_grams: 28, fat_grams: 32,
      foods: [
        { name: 'Pechuga de pollo', portion: '200g' },
        { name: 'Lechuga romana', portion: '120g' },
        { name: 'Parmesano rallado', portion: '25g' },
        { name: 'Picatostes integrales', portion: '30g' },
        { name: 'Huevo cocido', portion: '1 unidad' },
        { name: 'Salsa César casera', portion: '30ml' },
        { name: 'Anchoas', portion: '20g' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 4,
      name: 'Merienda Proteica',
      description: 'Mantener síntesis proteica en día de descanso.',
      time_suggestion: '17:30',
      calories: 260, protein_grams: 30, carbs_grams: 20, fat_grams: 8,
      foods: [
        { name: 'Skyr natural', portion: '200g' },
        { name: 'Frutos rojos', portion: '80g' },
        { name: 'Semillas de calabaza', portion: '10g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 5,
      name: 'Tortilla de Patatas Fit',
      description: 'Clásico español adaptado al fitness.',
      time_suggestion: '21:00',
      calories: 520, protein_grams: 38, carbs_grams: 35, fat_grams: 26,
      foods: [
        { name: 'Huevos', portion: '2 enteros' },
        { name: 'Claras', portion: '4 unidades' },
        { name: 'Patata cocida', portion: '180g' },
        { name: 'Cebolla pochada', portion: '60g' },
        { name: 'Aceite de oliva', portion: '15ml' },
        { name: 'Ensalada verde', portion: '100g' }
      ]
    }
  ];

  // =====================================================
  // JUEVES - PIERNA (Día más demandante)
  // =====================================================
  const thursday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Desayuno Alta Energía',
      description: 'Máximos carbos para el día de pierna - el más exigente.',
      time_suggestion: '07:30',
      calories: 580, protein_grams: 38, carbs_grams: 72, fat_grams: 14,
      foods: [
        { name: 'Avena integral', portion: '100g' },
        { name: 'Whey Protein', portion: '30g' },
        { name: 'Leche semidesnatada', portion: '200ml' },
        { name: 'Plátano grande', portion: '150g' },
        { name: 'Miel', portion: '20g' },
        { name: 'Nueces', portion: '12g' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Tostada con Pavo',
      description: 'Proteína extra para día de pierna.',
      time_suggestion: '10:30',
      calories: 320, protein_grams: 28, carbs_grams: 35, fat_grams: 8,
      foods: [
        { name: 'Pan integral', portion: '80g' },
        { name: 'Pechuga de pavo', portion: '100g' },
        { name: 'Tomate', portion: '60g' },
        { name: 'Aguacate', portion: '30g' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Pasta con Pollo',
      description: 'Carga máxima de glucógeno para sentadillas pesadas.',
      time_suggestion: '13:30',
      calories: 780, protein_grams: 55, carbs_grams: 95, fat_grams: 18,
      foods: [
        { name: 'Pasta integral', portion: '120g en seco' },
        { name: 'Pechuga de pollo', portion: '200g' },
        { name: 'Tomate triturado natural', portion: '150g' },
        { name: 'Champiñones', portion: '100g' },
        { name: 'Parmesano', portion: '20g' },
        { name: 'Aceite de oliva', portion: '10ml' },
        { name: 'Albahaca fresca', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'pre_workout',
      meal_order: 4,
      name: 'Pre-Pierna POWER',
      description: 'Carbos rápidos + cafeína opcional para máximo rendimiento.',
      time_suggestion: '16:00',
      calories: 420, protein_grams: 18, carbs_grams: 82, fat_grams: 4,
      foods: [
        { name: 'Arroz con leche 0%', portion: '250g' },
        { name: 'Miel', portion: '25g' },
        { name: 'Plátano muy maduro', portion: '1 grande' },
        { name: 'Dátiles', portion: '30g (3 uds)' }
      ]
    },
    {
      meal_type: 'post_workout',
      meal_order: 5,
      name: 'Recuperación Pierna',
      description: 'Máxima proteína + carbos para el grupo muscular más grande.',
      time_suggestion: '19:00',
      calories: 420, protein_grams: 45, carbs_grams: 48, fat_grams: 6,
      foods: [
        { name: 'Whey Protein', portion: '45g' },
        { name: 'Maltodextrina', portion: '40g' },
        { name: 'Plátano', portion: '1 mediano' },
        { name: 'Creatina', portion: '5g' },
        { name: 'Glutamina', portion: '5g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 6,
      name: 'Cena Reconstituyente',
      description: 'Proteína lenta + carbos complejos para reconstrucción nocturna.',
      time_suggestion: '21:30',
      calories: 580, protein_grams: 48, carbs_grams: 45, fat_grams: 22,
      foods: [
        { name: 'Solomillo de cerdo ibérico', portion: '200g' },
        { name: 'Boniato', portion: '200g' },
        { name: 'Espinacas salteadas', portion: '120g' },
        { name: 'Aceite de oliva', portion: '12ml' },
        { name: 'Ajo negro', portion: '10g' }
      ]
    }
  ];

  // =====================================================
  // VIERNES - HOMBRO / TRAPECIOS
  // =====================================================
  const friday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Açaí Bowl Proteico',
      description: 'Antioxidantes + proteína para empezar el viernes con energía.',
      time_suggestion: '07:30',
      calories: 520, protein_grams: 32, carbs_grams: 62, fat_grams: 16,
      foods: [
        { name: 'Pulpa de açaí', portion: '100g' },
        { name: 'Plátano congelado', portion: '100g' },
        { name: 'Whey Protein', portion: '25g' },
        { name: 'Granola sin azúcar', portion: '40g' },
        { name: 'Fresas', portion: '50g' },
        { name: 'Coco rallado', portion: '10g' },
        { name: 'Mantequilla de almendras', portion: '15g' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Wrap de Atún',
      description: 'Proteína magra y omega 3.',
      time_suggestion: '10:30',
      calories: 320, protein_grams: 32, carbs_grams: 28, fat_grams: 10,
      foods: [
        { name: 'Wrap integral', portion: '1 unidad (60g)' },
        { name: 'Atún al natural', portion: '120g' },
        { name: 'Lechuga', portion: '30g' },
        { name: 'Tomate', portion: '50g' },
        { name: 'Mayonesa light', portion: '15g' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Wok Asiático de Pollo',
      description: 'Sabor asiático con macros perfectos.',
      time_suggestion: '14:00',
      calories: 680, protein_grams: 52, carbs_grams: 72, fat_grams: 18,
      foods: [
        { name: 'Pechuga de pollo en tiras', portion: '220g' },
        { name: 'Fideos de arroz', portion: '80g en seco' },
        { name: 'Verduras wok (pimiento, cebolla, zanahoria)', portion: '200g' },
        { name: 'Salsa de soja baja en sodio', portion: '20ml' },
        { name: 'Aceite de sésamo', portion: '10ml' },
        { name: 'Jengibre fresco', portion: '5g' },
        { name: 'Semillas de sésamo', portion: '5g' }
      ]
    },
    {
      meal_type: 'pre_workout',
      meal_order: 4,
      name: 'Pre-Hombros',
      description: 'Energía moderada para trabajo de hombros.',
      time_suggestion: '16:30',
      calories: 340, protein_grams: 25, carbs_grams: 48, fat_grams: 6,
      foods: [
        { name: 'Tostadas de arroz', portion: '50g' },
        { name: 'Jamón de pavo', portion: '80g' },
        { name: 'Plátano', portion: '1 mediano' },
        { name: 'Miel', portion: '10g' }
      ]
    },
    {
      meal_type: 'post_workout',
      meal_order: 5,
      name: 'Batido Viernes',
      description: 'Recuperación estándar para hombros.',
      time_suggestion: '19:30',
      calories: 320, protein_grams: 35, carbs_grams: 35, fat_grams: 5,
      foods: [
        { name: 'Whey Protein', portion: '35g' },
        { name: 'Avena instantánea', portion: '30g' },
        { name: 'Frutos rojos', portion: '80g' },
        { name: 'Creatina', portion: '5g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 6,
      name: 'Lubina con Patatas',
      description: 'Cena ligera de viernes - mañana es descanso.',
      time_suggestion: '21:30',
      calories: 520, protein_grams: 45, carbs_grams: 42, fat_grams: 20,
      foods: [
        { name: 'Lubina al horno', portion: '220g' },
        { name: 'Patatas panaderas', portion: '180g' },
        { name: 'Pimientos tricolor', portion: '100g' },
        { name: 'Aceite de oliva', portion: '15ml' },
        { name: 'Romero y tomillo', portion: 'Al gusto' }
      ]
    }
  ];

  // =====================================================
  // SÁBADO - DESCANSO (Comida social permitida)
  // =====================================================
  const saturday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Brunch del Sábado',
      description: 'Desayuno-almuerzo tardío. Disfruta el fin de semana.',
      time_suggestion: '10:00',
      calories: 650, protein_grams: 38, carbs_grams: 52, fat_grams: 34,
      foods: [
        { name: 'Huevos revueltos', portion: '3 unidades' },
        { name: 'Bacon de pavo', portion: '50g' },
        { name: 'Aguacate', portion: '100g' },
        { name: 'Tostada integral', portion: '80g' },
        { name: 'Tomate cherry', portion: '80g' },
        { name: 'Zumo de naranja natural', portion: '200ml' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Smoothie de Frutas',
      description: 'Hidratación + vitaminas.',
      time_suggestion: '13:00',
      calories: 280, protein_grams: 22, carbs_grams: 38, fat_grams: 5,
      foods: [
        { name: 'Yogur griego', portion: '150g' },
        { name: 'Mango', portion: '100g' },
        { name: 'Espinacas', portion: '30g' },
        { name: 'Proteína vainilla', portion: '15g' },
        { name: 'Hielo', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: '🍕 Comida Libre',
      description: 'Una comida libre a la semana ayuda psicológicamente. No te pases, pero disfruta.',
      time_suggestion: '15:00',
      calories: 900, protein_grams: 35, carbs_grams: 100, fat_grams: 40,
      foods: [
        { name: 'Comida libre', portion: 'Elige lo que más te apetezca' },
        { name: 'TIP: Intenta incluir proteína', portion: '' },
        { name: 'Máximo: una porción generosa', portion: '' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 4,
      name: 'Merienda Saludable',
      description: 'Volver a la normalidad después de la comida libre.',
      time_suggestion: '18:30',
      calories: 250, protein_grams: 25, carbs_grams: 25, fat_grams: 6,
      foods: [
        { name: 'Queso cottage', portion: '200g' },
        { name: 'Melocotón', portion: '1 mediano' },
        { name: 'Canela', portion: 'Al gusto' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 5,
      name: 'Cena Ligera de Sábado',
      description: 'Compensar la comida libre con cena ligera.',
      time_suggestion: '21:00',
      calories: 420, protein_grams: 42, carbs_grams: 20, fat_grams: 20,
      foods: [
        { name: 'Pechuga de pollo', portion: '200g' },
        { name: 'Ensalada mixta grande', portion: '200g' },
        { name: 'Aceite de oliva', portion: '15ml' },
        { name: 'Vinagre balsámico', portion: '10ml' }
      ]
    }
  ];

  // =====================================================
  // DOMINGO - DESCANSO (Prep de la semana)
  // =====================================================
  const sunday = [
    {
      meal_type: 'breakfast',
      meal_order: 1,
      name: 'Pancakes Proteicos',
      description: 'Domingo de pancakes - versión fitness.',
      time_suggestion: '09:00',
      calories: 480, protein_grams: 40, carbs_grams: 52, fat_grams: 12,
      foods: [
        { name: 'Harina de avena', portion: '70g' },
        { name: 'Whey Protein', portion: '30g' },
        { name: 'Claras de huevo', portion: '3 unidades' },
        { name: 'Leche desnatada', portion: '100ml' },
        { name: 'Plátano maduro', portion: '1 pequeño' },
        { name: 'Sirope 0% calorías', portion: '30ml' },
        { name: 'Frutos rojos', portion: '50g' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 2,
      name: 'Yogur con Granola',
      description: 'Snack dominical tranquilo.',
      time_suggestion: '12:00',
      calories: 300, protein_grams: 22, carbs_grams: 35, fat_grams: 10,
      foods: [
        { name: 'Yogur griego 0%', portion: '200g' },
        { name: 'Granola casera', portion: '40g' },
        { name: 'Miel', portion: '10g' },
        { name: 'Arándanos', portion: '50g' }
      ]
    },
    {
      meal_type: 'lunch',
      meal_order: 3,
      name: 'Cocido Fit Domingo',
      description: 'Tradición española adaptada. Perfecto para batch cooking.',
      time_suggestion: '14:30',
      calories: 680, protein_grams: 55, carbs_grams: 58, fat_grams: 24,
      foods: [
        { name: 'Garbanzos cocidos', portion: '180g' },
        { name: 'Pechuga de pollo', portion: '150g' },
        { name: 'Morcillo de ternera magro', portion: '80g' },
        { name: 'Verduras del cocido (repollo, zanahoria, puerro)', portion: '200g' },
        { name: 'Chorizo de pavo', portion: '30g' },
        { name: 'Fideos finos', portion: '30g' }
      ]
    },
    {
      meal_type: 'snack',
      meal_order: 4,
      name: 'Tarta de Queso Fit',
      description: 'Postre dominical - versión saludable.',
      time_suggestion: '17:30',
      calories: 280, protein_grams: 25, carbs_grams: 22, fat_grams: 10,
      foods: [
        { name: 'Queso batido 0%', portion: '200g' },
        { name: 'Proteína de vainilla', portion: '20g' },
        { name: 'Edulcorante', portion: 'Al gusto' },
        { name: 'Galleta digestive', portion: '1 unidad (base)' },
        { name: 'Mermelada 0%', portion: '20g' }
      ]
    },
    {
      meal_type: 'dinner',
      meal_order: 5,
      name: 'Cena Preparatoria',
      description: 'Última cena antes de volver al entreno. Proteína + descanso = ganancias.',
      time_suggestion: '21:00',
      calories: 480, protein_grams: 45, carbs_grams: 28, fat_grams: 22,
      foods: [
        { name: 'Pavo al horno', portion: '200g' },
        { name: 'Calabacín', portion: '150g' },
        { name: 'Berenjena', portion: '100g' },
        { name: 'Aceite de oliva', portion: '15ml' },
        { name: 'Queso de cabra', portion: '30g' },
        { name: 'Orégano y pimienta', portion: 'Al gusto' }
      ]
    }
  ];

  // Generar todas las comidas
  const allDays = {
    monday, tuesday, wednesday, thursday, friday, saturday, sunday
  };

  Object.entries(allDays).forEach(([day, dayMeals]) => {
    dayMeals.forEach(meal => {
      meals.push({
        id: `${day}-${meal.meal_type}-${id++}`,
        plan_id: 'example',
        day_of_week: day,
        created_at: now,
        updated_at: now,
        ...meal
      });
    });
  });

  return meals;
}

export const DAY_LABELS: { [key: string]: string } = {
  'monday': 'Lunes',
  'tuesday': 'Martes',
  'wednesday': 'Miércoles',
  'thursday': 'Jueves',
  'friday': 'Viernes',
  'saturday': 'Sábado',
  'sunday': 'Domingo'
};

export const DAY_SHORT_LABELS: { [key: string]: string } = {
  'monday': 'L',
  'tuesday': 'M',
  'wednesday': 'X',
  'thursday': 'J',
  'friday': 'V',
  'saturday': 'S',
  'sunday': 'D'
};
