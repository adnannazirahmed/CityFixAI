import type { IssueCategory } from '@/types';

export type Department =
  | 'DPW'
  | 'Parks'
  | 'Water'
  | 'Traffic'
  | 'Sanitation'
  | 'Police'
  | 'Housing'
  | 'Transit'
  | 'General';

export const DEPARTMENT_LABELS: Record<Department, string> = {
  DPW: 'Dept. of Public Works',
  Parks: 'Parks & Recreation',
  Water: 'Water Dept.',
  Traffic: 'Traffic Engineering',
  Sanitation: 'Sanitation',
  Police: 'Police / Code Enforcement',
  Housing: 'Housing & Code',
  Transit: 'Transit Authority',
  General: 'General Services',
};

export interface SeeClickFixCategory {
  id: string;
  label: string;
  department: Department;
  sla_hours: number;      // target resolution window
  auto_escalate: boolean; // emergency → immediate dispatch
  urgency_boost: number;  // extra urgency points (0–30)
  keywords: string[];     // for fallback keyword matching
  internal_category: IssueCategory;
}

export const SEECLICKFIX_CATEGORIES: SeeClickFixCategory[] = [
  // ─── Roads & Pavement ──────────────────────────────────────────────────────
  {
    id: 'pothole', label: 'Pothole', department: 'DPW',
    sla_hours: 72, auto_escalate: false, urgency_boost: 0,
    keywords: ['pothole', 'hole', 'crater', 'bache', 'buraco'],
    internal_category: 'pothole',
  },
  {
    id: 'road_crack', label: 'Crack in Road', department: 'DPW',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['crack', 'cracked road', 'road damage', 'fisura', 'rachadura'],
    internal_category: 'pothole',
  },
  {
    id: 'road_obstruction', label: 'Road Obstruction', department: 'DPW',
    sla_hours: 24, auto_escalate: false, urgency_boost: 10,
    keywords: ['blocked road', 'obstruction', 'debris road', 'road blocked'],
    internal_category: 'road_obstruction',
  },
  {
    id: 'snow_ice', label: 'Snow / Ice Not Cleared', department: 'DPW',
    sla_hours: 24, auto_escalate: false, urgency_boost: 15,
    keywords: ['snow', 'ice', 'slippery', 'nieve', 'hielo', 'neve', 'gelo'],
    internal_category: 'road_obstruction',
  },

  // ─── Sidewalks & Accessibility ─────────────────────────────────────────────
  {
    id: 'sidewalk_damage', label: 'Sidewalk Damage', department: 'DPW',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['sidewalk', 'walkway', 'pavement', 'cracked sidewalk', 'acera', 'calçada'],
    internal_category: 'damaged_sidewalk',
  },
  {
    id: 'missing_sidewalk', label: 'Missing Sidewalk Section', department: 'DPW',
    sla_hours: 336, auto_escalate: false, urgency_boost: 0,
    keywords: ['missing sidewalk', 'no sidewalk', 'gap sidewalk'],
    internal_category: 'damaged_sidewalk',
  },
  {
    id: 'accessibility_ramp', label: 'Accessibility Ramp Missing/Damaged', department: 'DPW',
    sla_hours: 72, auto_escalate: false, urgency_boost: 15,
    keywords: ['ramp', 'wheelchair', 'curb cut', 'accessible', 'rampa', 'discapacidad'],
    internal_category: 'accessibility_hazard',
  },
  {
    id: 'accessibility_other', label: 'Accessibility Obstruction', department: 'DPW',
    sla_hours: 72, auto_escalate: false, urgency_boost: 10,
    keywords: ['accessibility', 'disabled access', 'barrier', 'acceso'],
    internal_category: 'accessibility_hazard',
  },

  // ─── Street Lights & Signs ─────────────────────────────────────────────────
  {
    id: 'streetlight_out', label: 'Streetlight Out', department: 'Traffic',
    sla_hours: 48, auto_escalate: false, urgency_boost: 5,
    keywords: ['streetlight', 'street light', 'lamp post', 'light out', 'dark street', 'luz', 'poste'],
    internal_category: 'broken_streetlight',
  },
  {
    id: 'streetlight_damage', label: 'Streetlight Damaged', department: 'Traffic',
    sla_hours: 72, auto_escalate: false, urgency_boost: 5,
    keywords: ['broken light', 'damaged lamp', 'light pole broken', 'poste dañado'],
    internal_category: 'broken_streetlight',
  },
  {
    id: 'traffic_signal', label: 'Traffic Signal Issue', department: 'Traffic',
    sla_hours: 24, auto_escalate: true, urgency_boost: 20,
    keywords: ['traffic light', 'traffic signal', 'red light', 'semáforo', 'sinal de trânsito'],
    internal_category: 'broken_sign',
  },
  {
    id: 'sign_missing', label: 'Street Sign Missing', department: 'Traffic',
    sla_hours: 48, auto_escalate: false, urgency_boost: 10,
    keywords: ['sign missing', 'missing sign', 'no sign', 'stop sign', 'señal faltante'],
    internal_category: 'broken_sign',
  },
  {
    id: 'sign_damaged', label: 'Street Sign Damaged', department: 'Traffic',
    sla_hours: 72, auto_escalate: false, urgency_boost: 5,
    keywords: ['damaged sign', 'bent sign', 'sign down', 'señal dañada', 'placa danificada'],
    internal_category: 'broken_sign',
  },
  {
    id: 'crosswalk', label: 'Crosswalk Faded/Missing', department: 'Traffic',
    sla_hours: 168, auto_escalate: false, urgency_boost: 5,
    keywords: ['crosswalk', 'pedestrian crossing', 'faded crosswalk', 'paso peatonal', 'faixa de pedestres'],
    internal_category: 'broken_sign',
  },

  // ─── Water & Sewer (Emergencies) ──────────────────────────────────────────
  {
    id: 'water_main_break', label: 'Water Main Break', department: 'Water',
    sla_hours: 4, auto_escalate: true, urgency_boost: 30,
    keywords: ['water main', 'water break', 'burst pipe', 'water gushing', 'water flooding street', 'ruptura de agua', 'ruptura de cano'],
    internal_category: 'flooding',
  },
  {
    id: 'fire_hydrant', label: 'Fire Hydrant Issue', department: 'Water',
    sla_hours: 24, auto_escalate: true, urgency_boost: 20,
    keywords: ['fire hydrant', 'hydrant', 'hidrante'],
    internal_category: 'flooding',
  },
  {
    id: 'sewer_backup', label: 'Sewer Backup / Overflow', department: 'Water',
    sla_hours: 8, auto_escalate: true, urgency_boost: 25,
    keywords: ['sewer', 'sewage', 'sewer overflow', 'sewage backup', 'cloacal', 'esgoto'],
    internal_category: 'flooding',
  },
  {
    id: 'storm_drain', label: 'Storm Drain Blocked', department: 'DPW',
    sla_hours: 48, auto_escalate: false, urgency_boost: 10,
    keywords: ['storm drain', 'drain blocked', 'clogged drain', 'desagüe', 'bueiro'],
    internal_category: 'flooding',
  },
  {
    id: 'flooding', label: 'Street Flooding', department: 'DPW',
    sla_hours: 24, auto_escalate: false, urgency_boost: 15,
    keywords: ['flooding', 'flooded', 'standing water', 'inundation', 'inundación', 'inundação'],
    internal_category: 'flooding',
  },

  // ─── Waste & Sanitation ────────────────────────────────────────────────────
  {
    id: 'trash_overflow', label: 'Overflowing Trash Can', department: 'Sanitation',
    sla_hours: 24, auto_escalate: false, urgency_boost: 0,
    keywords: ['trash', 'garbage', 'overflowing', 'full trash', 'basura llena', 'lixo cheio'],
    internal_category: 'trash_overflow',
  },
  {
    id: 'missed_pickup', label: 'Missed Trash Pickup', department: 'Sanitation',
    sla_hours: 48, auto_escalate: false, urgency_boost: 0,
    keywords: ['missed pickup', 'trash not picked up', 'garbage not collected', 'no recogieron', 'não coletaram'],
    internal_category: 'trash_overflow',
  },
  {
    id: 'illegal_dumping', label: 'Illegal Dumping', department: 'Sanitation',
    sla_hours: 48, auto_escalate: false, urgency_boost: 5,
    keywords: ['illegal dumping', 'dumping', 'mattress', 'couch', 'dumped furniture', 'basura ilegal', 'descarte ilegal'],
    internal_category: 'illegal_dumping',
  },
  {
    id: 'dead_animal', label: 'Dead Animal', department: 'Sanitation',
    sla_hours: 24, auto_escalate: false, urgency_boost: 5,
    keywords: ['dead animal', 'dead dog', 'dead cat', 'roadkill', 'animal muerto', 'animal morto'],
    internal_category: 'other',
  },

  // ─── Parks & Trees ─────────────────────────────────────────────────────────
  {
    id: 'tree_down', label: 'Tree Down / Fallen', department: 'Parks',
    sla_hours: 24, auto_escalate: true, urgency_boost: 20,
    keywords: ['tree down', 'fallen tree', 'tree fell', 'tree blocking', 'árbol caído', 'árvore caída'],
    internal_category: 'road_obstruction',
  },
  {
    id: 'tree_trimming', label: 'Tree Trimming Needed', department: 'Parks',
    sla_hours: 336, auto_escalate: false, urgency_boost: 0,
    keywords: ['tree trimming', 'overgrown tree', 'branches', 'trim tree', 'poda de árbol', 'poda de árvore'],
    internal_category: 'other',
  },
  {
    id: 'park_damage', label: 'Park Damage', department: 'Parks',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['park damage', 'park vandalism', 'park broken', 'daño en parque', 'dano no parque'],
    internal_category: 'graffiti',
  },
  {
    id: 'playground', label: 'Playground Equipment Damaged', department: 'Parks',
    sla_hours: 72, auto_escalate: false, urgency_boost: 10,
    keywords: ['playground', 'broken equipment', 'play equipment', 'juegos rotos', 'parquinho quebrado'],
    internal_category: 'accessibility_hazard',
  },

  // ─── Graffiti & Vandalism ──────────────────────────────────────────────────
  {
    id: 'graffiti', label: 'Graffiti', department: 'DPW',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['graffiti', 'spray paint', 'vandalism', 'tag', 'grafiti', 'pichação'],
    internal_category: 'graffiti',
  },

  // ─── Vehicles & Traffic ────────────────────────────────────────────────────
  {
    id: 'abandoned_vehicle', label: 'Abandoned Vehicle', department: 'Police',
    sla_hours: 72, auto_escalate: false, urgency_boost: 0,
    keywords: ['abandoned car', 'abandoned vehicle', 'junk car', 'auto abandonado', 'carro abandonado'],
    internal_category: 'road_obstruction',
  },
  {
    id: 'bike_lane', label: 'Bike Lane Obstruction', department: 'Traffic',
    sla_hours: 48, auto_escalate: false, urgency_boost: 5,
    keywords: ['bike lane', 'bicycle lane', 'cycle path', 'carril bici', 'ciclofaixa'],
    internal_category: 'road_obstruction',
  },

  // ─── Transit ──────────────────────────────────────────────────────────────
  {
    id: 'bus_stop', label: 'Bus Stop Damaged', department: 'Transit',
    sla_hours: 72, auto_escalate: false, urgency_boost: 0,
    keywords: ['bus stop', 'bus shelter', 'parada de autobús', 'ponto de ônibus'],
    internal_category: 'other',
  },

  // ─── Code Enforcement ─────────────────────────────────────────────────────
  {
    id: 'noise', label: 'Noise Complaint', department: 'Police',
    sla_hours: 24, auto_escalate: false, urgency_boost: 0,
    keywords: ['noise', 'loud', 'noise complaint', 'ruido', 'barulho'],
    internal_category: 'other',
  },
  {
    id: 'building_code', label: 'Building Code Violation', department: 'Housing',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['building code', 'code violation', 'unsafe building', 'violación de código'],
    internal_category: 'other',
  },
  {
    id: 'homeless', label: 'Encampment Report', department: 'General',
    sla_hours: 72, auto_escalate: false, urgency_boost: 0,
    keywords: ['homeless', 'encampment', 'tent', 'camping street', 'campamento', 'acampamento'],
    internal_category: 'other',
  },

  // ─── Other ────────────────────────────────────────────────────────────────
  {
    id: 'other', label: 'Other City Issue', department: 'General',
    sla_hours: 168, auto_escalate: false, urgency_boost: 0,
    keywords: ['other', 'general', 'issue', 'problem', 'otro', 'outro'],
    internal_category: 'other',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function findCategoryByKeywords(text: string): SeeClickFixCategory {
  const lower = text.toLowerCase();
  let best = SEECLICKFIX_CATEGORIES[SEECLICKFIX_CATEGORIES.length - 1];
  let bestScore = 0;

  for (const cat of SEECLICKFIX_CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.split(' ').length; // multi-word phrases score higher
      }
    }
    if (score > bestScore) { bestScore = score; best = cat; }
  }

  return best;
}

export function getCategoryById(id: string): SeeClickFixCategory {
  return SEECLICKFIX_CATEGORIES.find(c => c.id === id)
    ?? SEECLICKFIX_CATEGORIES[SEECLICKFIX_CATEGORIES.length - 1];
}

export function getDepartmentByInternalCategory(category: IssueCategory): SeeClickFixCategory {
  return SEECLICKFIX_CATEGORIES.find(c => c.internal_category === category)
    ?? SEECLICKFIX_CATEGORIES[SEECLICKFIX_CATEGORIES.length - 1];
}
