import {
  ChatMessage,
  CalendarEvent,
  E14Record,
  BankTransaction,
  GeofenceAlert,
  TerritorialZone,
  TweetPost
} from '../types';

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'Marisa López',
    role: 'team',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    text: 'El informe de riesgo del distrito 4 está listo.',
    actions: [
      { label: 'Convertir a Tarea', action: 'convert_task' },
      { label: 'Crear Evento', action: 'create_event' }
    ],
    timestamp: '10:14 AM'
  },
  {
    id: '2',
    sender: 'AI Assistant',
    role: 'assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    text: 'He detectado una nueva oportunidad de mercado en el sector tech.',
    actions: [
      { label: 'Analizar', action: 'analyze' },
      { label: 'Guardar', action: 'save' }
    ],
    timestamp: '10:18 AM'
  },
  {
    id: '3',
    sender: 'Carlos Ruiz',
    role: 'team',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    text: 'Programemos la reunión de estrategia para mañana a las 10AM.',
    actions: [
      { label: 'Crear Evento', action: 'create_event' }
    ],
    timestamp: '10:22 AM'
  }
];

export const initialTweets: TweetPost[] = [
  {
    id: 'tw1',
    user: 'Usuario123',
    handle: '@Usuario123',
    text: 'La nueva iniciativa es increíble! #AI #Innovacion',
    hashtags: ['#AI', '#Innovacion'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'tw2',
    user: 'Usuario123',
    handle: '@Usuario123',
    text: 'La nueva iniciativa es increíble! #AI #Innovacion',
    hashtags: ['#AI', '#Innovacion'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'tw3',
    user: 'Usuario123',
    handle: '@Usuario123',
    text: 'La nueva iniciativa es increíble! #AI #Innovacion',
    hashtags: ['#AI', '#Innovacion'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  }
];

export const candidateTweets: TweetPost[] = [
  {
    id: 'ct1',
    user: 'Ana García',
    handle: '@AnaGarcia',
    text: '¡Excelente propuesta de empleo de Javier Méndez! #UnFuturoSeguro',
    hashtags: ['#UnFuturoSeguro'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'ct2',
    user: 'Carlos R.',
    handle: '@CarlosR',
    text: 'Me gusta su visión para la educación.',
    hashtags: ['#Educacion'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'ct3',
    user: 'Marta L.',
    handle: '@MartaL',
    text: 'Preocupada por sus lazos con el pasado.',
    hashtags: ['#Debate'],
    sentiment: 'negative',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'ct4',
    user: 'David P.',
    handle: '@DavidP',
    text: 'Candidato sólido, transmite confianza.',
    hashtags: ['#JavierMendez'],
    sentiment: 'positive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  { id: 'ev1', date: '15 Nov', title: 'Cierre de Inscripciones de Candidatos', type: 'Electoral' },
  { id: 'ev2', date: '22 Nov', title: 'Inicio de Campaña Oficial', type: 'Campaña' },
  { id: 'ev3', date: '05 Dic', title: 'Debate Televisado', type: 'Medios' }
];

export const initialE14Records: E14Record[] = [
  { id: 'E-14 #98765', mesa: 'Mesa 145', ocrStatus: 'Completado', validation: 'Reviewed (Verde)', puesto: 'Puesto Central 01', votosRegistrados: 412, timestamp: '14:20' },
  { id: 'E-14 #98766', mesa: 'Mesa 201', ocrStatus: 'Error OCR', validation: 'Error (Rojo)', puesto: 'Escuela Distrito 4', votosRegistrados: 0, timestamp: '14:22' },
  { id: 'E-14 #98767', mesa: 'Mesa 202', ocrStatus: 'Completado', validation: 'Error (Rojo)', puesto: 'Liceo Central Norte', votosRegistrados: 289, timestamp: '14:25' },
  { id: 'E-14 #98768', mesa: 'Mesa 223', ocrStatus: 'Error OCR', validation: 'Error (Rojo)', puesto: 'Instituto Técnico Sur', votosRegistrados: 0, timestamp: '14:28' },
  { id: 'E-14 #98769', mesa: 'Mesa 244', ocrStatus: 'Completado', validation: 'Reviewed (Verde)', puesto: 'Colegio San José', votosRegistrados: 510, timestamp: '14:31' },
  { id: 'E-14 #98760', mesa: 'Mesa 255', ocrStatus: 'Completado', validation: 'Error (Rojo)', puesto: 'Centro Comunitario Este', votosRegistrados: 340, timestamp: '14:35' }
];

export const initialBankTransactions: BankTransaction[] = [
  { id: 'tx1', fecha: '15/10/2024', descripcion: 'Depósito Cliente X', categoria: 'Ingresos', monto: 5000, estado: 'Completado' },
  { id: 'tx2', fecha: '14/10/2024', descripcion: 'Retiro Efectivo', categoria: 'Operaciones', monto: -300, estado: 'Completado' },
  { id: 'tx3', fecha: '14/10/2024', descripcion: 'Pago Nómina', categoria: 'Personal', monto: -12000, estado: 'Procesando' },
  { id: 'tx4', fecha: '13/10/2024', descripcion: 'Pago Proveedor A', categoria: 'Publicidad', monto: -1500, estado: 'Completado' },
  { id: 'tx5', fecha: '12/10/2024', descripcion: 'Compra Material B', categoria: 'Eventos', monto: -500, estado: 'Pendiente' },
  { id: 'tx6', fecha: '10/10/2024', descripcion: 'Reembolso Gastos', categoria: 'Operaciones', monto: -200, estado: 'Completado' }
];

export const initialGeofenceAlerts: GeofenceAlert[] = [
  {
    id: 'g1',
    type: 'alert',
    title: 'Alerta: Testigo fuera de zona',
    message: 'Testigo Juan Pérez fuera de zona (Mesa 12A)',
    mesa: 'Mesa 12A',
    timestamp: '11:05 AM'
  },
  {
    id: 'g2',
    type: 'confirmation',
    title: 'Confirmación: Arribo a puesto',
    message: 'Testigo María López llegó a Puesto Central (Mesa 05B)',
    mesa: 'Mesa 05B',
    timestamp: '10:58 AM'
  },
  {
    id: 'g3',
    type: 'confirmation',
    title: 'Confirmación: Registro verificado',
    message: 'Testigo María López llegó a Puesto Central (Mesa 05B)',
    mesa: 'Mesa 05B',
    timestamp: '10:55 AM'
  }
];

export const initialTerritorialZones: TerritorialZone[] = [
  { id: 'z1', nombre: 'Zona Norte / Santa Ana', lideres: 980, votantes: 85000, cobertura: 82, heatValue: 192, coordenadas: { x: 28, y: 35 }, testigosActivos: 2800, testigosFaltantes: 120 },
  { id: 'z2', nombre: 'Zona Central / San Salvador', lideres: 1550, votantes: 140000, cobertura: 88, heatValue: 1550, coordenadas: { x: 50, y: 58 }, testigosActivos: 4800, testigosFaltantes: 150 },
  { id: 'z3', nombre: 'Zona Paracentral / San Vicente', lideres: 450, votantes: 35000, cobertura: 74, heatValue: 103, coordenadas: { x: 58, y: 62 }, testigosActivos: 1100, testigosFaltantes: 80 },
  { id: 'z4', nombre: 'Zona Este / San Miguel', lideres: 820, votantes: 55000, cobertura: 70, heatValue: 63, coordenadas: { x: 72, y: 55 }, testigosActivos: 1900, testigosFaltantes: 90 },
  { id: 'z5', nombre: 'Zona Sur / Usulután', lideres: 400, votantes: 22000, cobertura: 68, heatValue: 30, coordenadas: { x: 68, y: 72 }, testigosActivos: 800, testigosFaltantes: 40 },
  { id: 'z6', nombre: 'Zona Occidente / Sonsonate', lideres: 300, votantes: 13000, cobertura: 65, heatValue: 27, coordenadas: { x: 22, y: 60 }, testigosActivos: 600, testigosFaltantes: 20 }
];
