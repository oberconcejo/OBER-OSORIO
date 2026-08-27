import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  PieChart, 
  BarChart3, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Calculator, 
  Sliders, 
  Sparkles, 
  Send, 
  PhoneCall, 
  Globe, 
  UserCheck,
  Percent,
  Layers,
  ChevronRight,
  ShieldCheck,
  Share2,
  Battery,
  Wifi,
  Compass,
  Crosshair,
  QrCode,
  Printer,
  Bot,
  X,
  Zap,
  AlertTriangle,
  Activity,
  Map,
  UserPlus,
  Mail,
  CreditCard,
  Smartphone,
  Check,
  RefreshCw
} from 'lucide-react';
import { ViewMode } from '../../types';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert' | 'candidate_matrix' | 'open' | 'demographic';
  options?: string[];
  required: boolean;
}

export interface SurveyStudy {
  id: string;
  code: string;
  title: string;
  type: 'Línea Base' | 'Intención de Voto' | 'Tracking Poll' | 'Sondeo Flash' | 'Favorabilidad' | 'Clima Político';
  methodology: 'Presencial (CAPI)' | 'Telefónico (CATI)' | 'Digital / WhatsApp' | 'Mixto';
  status: 'En Campo' | 'Borrador' | 'Finalizado' | 'En Auditoría';
  targetSample: number;
  completedSample: number;
  marginOfError: number;
  confidenceLevel: number; // e.g. 95%
  startDate: string;
  endDate: string;
  pollstersCount: number;
  location: string;
  questionsCount: number;
}

export interface Pollster {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  email: string;
  surveyId: string;
  surveyTitle: string;
  assignedZone: string;
  dailyGoal: number;
  completedCount: number;
  status: 'Activo' | 'En Recorrido' | 'Meta Cumplida' | 'Pausado' | 'Inactivo';
  lastActivity: string;
  batteryLevel: number;
  gpsCoordinates: {
    lat: number;
    lng: number;
    address: string;
    inGeofence: boolean;
    accuracyMeters: number;
  };
  deviceImei: string;
  accreditationCode: string;
  aiAuditFlags?: {
    suspiciousSpeed?: boolean;
    outOfGeofence?: boolean;
    duplicatePattern?: boolean;
    notes?: string;
  };
}

// Leaflet Map Helpers & Data
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const GEOFENCE_ZONES = [
  {
    id: 'geo-1',
    name: 'Geocerca Comuna 1 - Popular',
    center: [6.2950, -75.5480] as [number, number],
    radius: 900,
    color: '#06b6d4',
  },
  {
    id: 'geo-3',
    name: 'Geocerca Comuna 3 - Manrique',
    center: [6.2621, -75.5581] as [number, number],
    radius: 1000,
    color: '#10b981',
  },
  {
    id: 'geo-4',
    name: 'Geocerca Comuna 4 - Aranjuez',
    center: [6.2733, -75.5521] as [number, number],
    radius: 850,
    color: '#8b5cf6',
  },
  {
    id: 'geo-5',
    name: 'Geocerca Comuna 5 - Castilla',
    center: [6.2189, -75.5742] as [number, number],
    radius: 950,
    color: '#f59e0b',
  },
  {
    id: 'geo-13',
    name: 'Geocerca Comuna 13 - San Javier',
    center: [6.2511, -75.6012] as [number, number],
    radius: 1100,
    color: '#3b82f6',
  },
];

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    name: 'Oscuro CNE',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    name: 'Urbano (OSM)',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    name: 'Satélite HD',
  },
};

const createPollsterDivIcon = (pollster: Pollster, isSelected: boolean) => {
  const isOutOfZone = !pollster.gpsCoordinates.inGeofence;
  const isCompleted = pollster.status === 'Meta Cumplida';

  const bgColor = isOutOfZone ? '#f59e0b' : isCompleted ? '#10b981' : '#06b6d4';
  const textColor = '#020617';
  const borderStyle = isSelected ? '3px solid #F1F5F9' : '2px solid #000000';
  const glow = isSelected ? '0 0 16px rgba(6, 182, 212, 0.9)' : '0 4px 10px rgba(0,0,0,0.5)';

  const html = `
    <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: ${bgColor};
        color: ${textColor};
        border: ${borderStyle};
        box-shadow: ${glow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 13px;
        transition: transform 0.2s ease;
      ">
        ${pollster.name[0]}
      </div>
      <div style="
        margin-top: 3px;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 6px;
        background-color: #05162a;
        color: #e2e8f0;
        border: 1px solid rgba(6,182,212,0.4);
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
      ">
        ${pollster.name.split(' ')[0]} (${pollster.completedCount}/${pollster.dailyGoal})
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'leaflet-pollster-marker',
    iconSize: [80, 55],
    iconAnchor: [40, 20],
  });
};

interface GestionEncuestasSondeosProps {
  onSelectView?: (view: ViewMode) => void;
}

export const GestionEncuestasSondeos: React.FC<GestionEncuestasSondeosProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'estudios' | 'crear' | 'calculadora' | 'encuestadores' | 'georreferenciacion' | 'resultados'>('estudios');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [surveyFilter, setSurveyFilter] = useState<string>('todas');
  const [selectedStudy, setSelectedStudy] = useState<SurveyStudy | null>(null);
  const [tileStyle, setTileStyle] = useState<'dark' | 'street' | 'satellite'>('dark');
  
  // Modals
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showAddPollsterModal, setShowAddPollsterModal] = useState(false);
  const [showEditPollsterModal, setShowEditPollsterModal] = useState(false);
  const [showAccreditationModal, setShowAccreditationModal] = useState(false);
  const [selectedPollster, setSelectedPollster] = useState<Pollster | null>(null);

  // AI Generator States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiObjective, setAiObjective] = useState('');
  const [aiAuditRunning, setAiAuditRunning] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);
  const [aiStratification, setAiStratification] = useState<Array<{ comuna: string; censo: number; muestra: number; porcentaje: string }> | null>(null);
  const [aiReportOutput, setAiReportOutput] = useState<string | null>(null);

  // Sample Studies Data
  const [studies, setStudies] = useState<SurveyStudy[]>([
    {
      id: 'enc-1',
      code: 'ENC-2026-001',
      title: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
      type: 'Tracking Poll',
      methodology: 'Presencial (CAPI)',
      status: 'En Campo',
      targetSample: 1200,
      completedSample: 840,
      marginOfError: 2.8,
      confidenceLevel: 95,
      startDate: '2026-08-01',
      endDate: '2026-08-10',
      pollstersCount: 18,
      location: 'Municipio Principal - 12 Comunas',
      questionsCount: 14
    },
    {
      id: 'enc-2',
      code: 'SND-2026-004',
      title: 'Sondeo Digital de Percepción sobre Propuestas de Movilidad',
      type: 'Sondeo Flash',
      methodology: 'Digital / WhatsApp',
      status: 'En Campo',
      targetSample: 2500,
      completedSample: 2150,
      marginOfError: 2.1,
      confidenceLevel: 95,
      startDate: '2026-08-04',
      endDate: '2026-08-08',
      pollstersCount: 4,
      location: 'Zonas Urbana y Metropolitana',
      questionsCount: 8
    },
    {
      id: 'enc-3',
      code: 'ENC-2026-002',
      title: 'Estudio de Línea Base Percepción de Imagen y Candidatos',
      type: 'Línea Base',
      methodology: 'Mixto',
      status: 'Finalizado',
      targetSample: 1800,
      completedSample: 1800,
      marginOfError: 2.3,
      confidenceLevel: 95,
      startDate: '2026-07-10',
      endDate: '2026-07-25',
      pollstersCount: 24,
      location: 'Departamento - 8 Subregiones',
      questionsCount: 22
    },
    {
      id: 'enc-4',
      code: 'ENC-2026-003',
      title: 'Evaluación de Impacto del Debate de Televisión Regional',
      type: 'Favorabilidad',
      methodology: 'Telefónico (CATI)',
      status: 'En Auditoría',
      targetSample: 600,
      completedSample: 600,
      marginOfError: 4.0,
      confidenceLevel: 95,
      startDate: '2026-08-05',
      endDate: '2026-08-06',
      pollstersCount: 10,
      location: 'Casco Urbano',
      questionsCount: 10
    }
  ]);

  // Pollsters State
  const [pollsters, setPollsters] = useState<Pollster[]>([
    {
      id: 'pol-101',
      name: 'Carlos Mario Mendoza',
      cedula: '1032448912',
      phone: '+57 312 458 9012',
      email: 'carlos.mendoza@campanaganadora.co',
      surveyId: 'enc-1',
      surveyTitle: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
      assignedZone: 'Comuna 1 - Centro Histórico',
      dailyGoal: 40,
      completedCount: 38,
      status: 'Activo',
      lastActivity: 'Hace 3 min',
      batteryLevel: 88,
      gpsCoordinates: {
        lat: 6.2442,
        lng: -75.5812,
        address: 'Calle 50 # 45-12, Parque Berrio',
        inGeofence: true,
        accuracyMeters: 4.2
      },
      deviceImei: '864201049281023',
      accreditationCode: 'CNE-ENC-2026-0891'
    },
    {
      id: 'pol-102',
      name: 'Laura Restrepo Gómez',
      cedula: '1017234901',
      phone: '+57 300 892 1104',
      email: 'laura.restrepo@campanaganadora.co',
      surveyId: 'enc-1',
      surveyTitle: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
      assignedZone: 'Comuna 3 - Manrique / Norte',
      dailyGoal: 40,
      completedCount: 40,
      status: 'Meta Cumplida',
      lastActivity: 'Hace 12 min',
      batteryLevel: 95,
      gpsCoordinates: {
        lat: 6.2621,
        lng: -75.5681,
        address: 'Carrera 45 # 72-18, Manrique Central',
        inGeofence: true,
        accuracyMeters: 3.8
      },
      deviceImei: '864201049281904',
      accreditationCode: 'CNE-ENC-2026-0892'
    },
    {
      id: 'pol-103',
      name: 'Andrés Felipe Silva',
      cedula: '1020412890',
      phone: '+57 314 670 4421',
      email: 'andres.silva@campanaganadora.co',
      surveyId: 'enc-1',
      surveyTitle: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
      assignedZone: 'Comuna 5 - Castilla / Sur',
      dailyGoal: 40,
      completedCount: 29,
      status: 'En Recorrido',
      lastActivity: 'Hace 1 min',
      batteryLevel: 62,
      gpsCoordinates: {
        lat: 6.2189,
        lng: -75.5742,
        address: 'Carrera 68 # 94-05, Castilla Sector Terminal',
        inGeofence: false, // Out of zone alert!
        accuracyMeters: 12.5
      },
      deviceImei: '864201049281881',
      accreditationCode: 'CNE-ENC-2026-0893',
      aiAuditFlags: {
        outOfGeofence: true,
        notes: 'Ubicación reportada a 850m fuera de la geocerca de Comuna 5'
      }
    },
    {
      id: 'pol-104',
      name: 'Camila Rodríguez Toro',
      cedula: '1036782199',
      phone: '+57 318 901 3342',
      email: 'camila.rodriguez@campanaganadora.co',
      surveyId: 'enc-2',
      surveyTitle: 'Sondeo Digital de Percepción sobre Propuestas de Movilidad',
      assignedZone: 'Comuna 13 - San Javier / Occidente',
      dailyGoal: 50,
      completedCount: 44,
      status: 'En Recorrido',
      lastActivity: 'Hace 5 min',
      batteryLevel: 74,
      gpsCoordinates: {
        lat: 6.2511,
        lng: -75.6012,
        address: 'Calle 44 # 108-20, Estación San Javier',
        inGeofence: true,
        accuracyMeters: 5.0
      },
      deviceImei: '864201049281774',
      accreditationCode: 'CNE-ENC-2026-0894'
    },
    {
      id: 'pol-105',
      name: 'Jhon Jairo Arango',
      cedula: '98712344',
      phone: '+57 301 234 5599',
      email: 'jhon.arango@campanaganadora.co',
      surveyId: 'enc-1',
      surveyTitle: 'Primer Tracking Semanal de Intención de Voto Alcaldía',
      assignedZone: 'Comuna 4 - Aranjuez',
      dailyGoal: 40,
      completedCount: 35,
      status: 'Activo',
      lastActivity: 'Hace 8 min',
      batteryLevel: 41,
      gpsCoordinates: {
        lat: 6.2733,
        lng: -75.5521,
        address: 'Carrera 52 # 92-10, Aranjuez Parque',
        inGeofence: true,
        accuracyMeters: 4.8
      },
      deviceImei: '864201049281655',
      accreditationCode: 'CNE-ENC-2026-0895'
    },
    {
      id: 'pol-106',
      name: 'Valentina Morales Duque',
      cedula: '1045998210',
      phone: '+57 320 881 9023',
      email: 'valentina.morales@campanaganadora.co',
      surveyId: 'enc-2',
      surveyTitle: 'Sondeo Digital de Percepción sobre Propuestas de Movilidad',
      assignedZone: 'Corregimiento San Cristóbal',
      dailyGoal: 35,
      completedCount: 32,
      status: 'En Recorrido',
      lastActivity: 'Hace 2 min',
      batteryLevel: 91,
      gpsCoordinates: {
        lat: 6.2801,
        lng: -75.6311,
        address: 'Parque Principal San Cristóbal',
        inGeofence: true,
        accuracyMeters: 3.5
      },
      deviceImei: '864201049281112',
      accreditationCode: 'CNE-ENC-2026-0896'
    }
  ]);

  // New Pollster Form State
  const [newPolName, setNewPolName] = useState('');
  const [newPolCedula, setNewPolCedula] = useState('');
  const [newPolPhone, setNewPolPhone] = useState('');
  const [newPolEmail, setNewPolEmail] = useState('');
  const [newPolSurveyId, setNewPolSurveyId] = useState(studies[0]?.id || 'enc-1');
  const [newPolZone, setNewPolZone] = useState('Comuna 1 - Centro Histórico');
  const [newPolGoal, setNewPolGoal] = useState(40);
  const [newPolDevice, setNewPolDevice] = useState('864201049900' + Math.floor(100 + Math.random() * 900));

  // Calculator State
  const [calcUniverse, setCalcUniverse] = useState<number>(350000);
  const [calcConfidence, setCalcConfidence] = useState<number>(95);
  const [calcMargin, setCalcMargin] = useState<number>(2.8);
  const [calcProportion, setCalcProportion] = useState<number>(50);

  const calculateSampleSize = () => {
    const Z = calcConfidence === 99 ? 2.576 : calcConfidence === 90 ? 1.645 : 1.96;
    const p = calcProportion / 100;
    const q = 1 - p;
    const e = calcMargin / 100;
    const N = calcUniverse;

    const n0 = (Z * Z * p * q) / (e * e);
    const n = n0 / (1 + (n0 - 1) / N);
    return Math.round(n);
  };

  const calculatedSample = calculateSampleSize();

  // New Survey Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<SurveyStudy['type']>('Intención de Voto');
  const [newMethodology, setNewMethodology] = useState<SurveyStudy['methodology']>('Presencial (CAPI)');
  const [newTargetSample, setNewTargetSample] = useState<number>(1000);
  const [newLocation, setNewLocation] = useState('Municipio - Comunas 1 a 10');
  const [newQuestions, setNewQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      text: 'Si las elecciones a la Alcaldía fueran el día de hoy, ¿por cuál de los siguientes candidatos votaría usted?',
      type: 'candidate_matrix',
      options: ['Nuestro Candidato (Campaña Ganadora)', 'Candidato Oposición A', 'Candidato Oposición B', 'Voto en Blanco', 'No Sabe / No Responde'],
      required: true
    },
    {
      id: 'q2',
      text: '¿Qué tan seguro está de su voto para las próximas elecciones?',
      type: 'multiple_choice',
      options: ['Completamente Seguro', 'Probable que cambie', 'Muy Indeciso', 'No asistiré a votar'],
      required: true
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Selected Pollster for Live Map Tracking
  const [activeGpsPollster, setActiveGpsPollster] = useState<Pollster | null>(pollsters[0] || null);

  // Handlers
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setNewQuestions([
      ...newQuestions,
      {
        id: `q${Date.now()}`,
        text: newQuestionText,
        type: 'multiple_choice',
        options: ['Opción A', 'Opción B', 'Opción C', 'No Sabe / No Responde'],
        required: true
      }
    ]);
    setNewQuestionText('');
  };

  const handleGenerateQuestionsWithAI = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const generated: SurveyQuestion[] = [
        {
          id: `ai-1-${Date.now()}`,
          text: 'En una escala de 1 a 5, ¿cómo evalúa la gestión actual del municipio en materia de seguridad ciudadana?',
          type: 'likert',
          options: ['1 - Pésima', '2 - Mala', '3 - Regular', '4 - Buena', '5 - Excelente', 'No Sabe'],
          required: true
        },
        {
          id: `ai-2-${Date.now()}`,
          text: '¿Cuál considera usted que es el principal problema que debe resolver el próximo Alcalde?',
          type: 'multiple_choice',
          options: ['Inseguridad y Atracos', 'Desempleo y Pobreza', 'Movilidad y Malla Vial', 'Corrupción Política', 'Salud y Salud Mental'],
          required: true
        },
        {
          id: `ai-3-${Date.now()}`,
          text: 'Si las elecciones fueran hoy, ¿por cuál candidato a la Alcaldía votaría?',
          type: 'candidate_matrix',
          options: ['Nuestro Candidato (Campaña Ganadora)', 'Candidato Oposición A', 'Candidato Oposición B', 'Voto en Blanco', 'Indeciso'],
          required: true
        },
        {
          id: `ai-4-${Date.now()}`,
          text: '¿Qué opinión o percepción de imagen tiene sobre Nuestro Candidato?',
          type: 'multiple_choice',
          options: ['Muy Favorable', 'Favorable', 'Desfavorable', 'Muy Desfavorable', 'No lo Conoce'],
          required: true
        }
      ];
      setNewQuestions([...newQuestions, ...generated]);
      setAiGenerating(false);
    }, 1200);
  };

  const handleAddPollsterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolName.trim() || !newPolCedula.trim()) return;

    const assignedSurvey = studies.find(s => s.id === newPolSurveyId);

    const created: Pollster = {
      id: `pol-${Date.now()}`,
      name: newPolName,
      cedula: newPolCedula,
      phone: newPolPhone || '+57 300 000 0000',
      email: newPolEmail || `${newPolName.toLowerCase().replace(/\s+/g, '.')}@campanaganadora.co`,
      surveyId: newPolSurveyId,
      surveyTitle: assignedSurvey?.title || 'Estudio Electoral Asignado',
      assignedZone: newPolZone,
      dailyGoal: newPolGoal,
      completedCount: 0,
      status: 'Activo',
      lastActivity: 'Recién registrado',
      batteryLevel: 100,
      gpsCoordinates: {
        lat: 6.2442 + (Math.random() - 0.5) * 0.04,
        lng: -75.5812 + (Math.random() - 0.5) * 0.04,
        address: `${newPolZone}, Punto de Partida Campo`,
        inGeofence: true,
        accuracyMeters: 3.5
      },
      deviceImei: newPolDevice,
      accreditationCode: `CNE-ENC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setPollsters([created, ...pollsters]);
    setShowAddPollsterModal(false);
    
    // Reset form
    setNewPolName('');
    setNewPolCedula('');
    setNewPolPhone('');
    setNewPolEmail('');
    
    alert(`¡Encuestador ${created.name} registrado con éxito! Acreditación CNE generada: ${created.accreditationCode}`);
  };

  const handleDeletePollster = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar al encuestador ${name}? Se desvinculará del dispositivo y de la ruta de campo.`)) {
      setPollsters(pollsters.filter(p => p.id !== id));
    }
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStudyItem: SurveyStudy = {
      id: `enc-${Date.now()}`,
      code: `ENC-2026-0${studies.length + 1}`,
      title: newTitle,
      type: newType,
      methodology: newMethodology,
      status: 'Borrador',
      targetSample: newTargetSample,
      completedSample: 0,
      marginOfError: calcMargin,
      confidenceLevel: calcConfidence,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      pollstersCount: 10,
      location: newLocation,
      questionsCount: newQuestions.length
    };

    setStudies([newStudyItem, ...studies]);
    setNewTitle('');
    setActiveSubTab('estudios');
    alert('¡Nueva Encuesta/Sondeo creada con éxito en modo Borrador!');
  };

  const handleRunAiAudit = () => {
    setAiAuditRunning(true);
    setTimeout(() => {
      setAiAuditResult(`Auditoría de Algoritmo IA Finalizada:
- 100% de registros cotejados con sellado de tiempo UTC y geolocalización GPS.
- Se detectaron 2 encuestas con velocidad atípica de respuesta (<45 segundos) registradas por el dispositivo IMEI 864201049281881.
- Encuestador Andrés Felipe Silva presentó 1 desviación geográfica de geocerca (alerta notificada).
- Índice global de autenticidad muestral: 98.7% (Conforme normativa CNE).`);
      setAiAuditRunning(false);
    }, 1500);
  };

  const handleRunAiStratification = () => {
    setAiStratification([
      { comuna: 'Comuna 1 - Popular', censo: 42000, muestra: 144, porcentaje: '12.0%' },
      { comuna: 'Comuna 2 - Santa Cruz', censo: 38000, muestra: 130, porcentaje: '10.8%' },
      { comuna: 'Comuna 3 - Manrique', censo: 51000, muestra: 175, porcentaje: '14.6%' },
      { comuna: 'Comuna 4 - Aranjuez', censo: 48000, muestra: 165, porcentaje: '13.7%' },
      { comuna: 'Comuna 5 - Castilla', censo: 62000, muestra: 212, porcentaje: '17.7%' },
      { comuna: 'Comuna 6 - Doce de Octubre', censo: 45000, muestra: 154, porcentaje: '12.8%' },
      { comuna: 'Corregimientos Rurales', censo: 24000, muestra: 82, porcentaje: '6.9%' },
    ]);
  };

  const handleGenerateAiReport = () => {
    setAiReportOutput(`DIAGNÓSTICO ESTRATÉGICO DE CAMPANÍA - IA INVESTIGACIÓN ELECTORAL
----------------------------------------------------------------------
1. VENTAJA COMPETITIVA:
Nuestro candidato lidera con el 38.5% de la intención de voto ponderada, manteniendo una ventaja sólida de +11.3% frente a la opción de oposición principal (27.2%).

2. NICHOS DE VOTO INDECISO (11.5%):
La mayor concentración de votos flotantes se ubica en la Comuna 5 (Castilla) y Comuna 3 (Manrique), focalizado en mujeres jóvenes entre 18 y 30 años.

3. RECOMENDACIÓN TÁCTICA PARA AGENDA:
Se sugiere programar 2 recorridos territoriales de impacto directo en Comuna 5 enfocados en la propuesta de empleo e infraestructura de transporte.`);
  };

  // Filters
  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase()) || s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || s.status.toLowerCase().replace(' ', '_') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPollsters = pollsters.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.cedula.includes(searchTerm) || p.assignedZone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSurvey = surveyFilter === 'todas' || p.surveyId === surveyFilter;
    return matchesSearch && matchesSurvey;
  });

  return (
    <div className="space-y-6">
      
      {/* Module Title Header */}
      <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 rounded-xl text-cyan-300">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Gestión y Configuración de Encuestas y Sondeos
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setShowAddPollsterModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer transform hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Registrar Encuestador</span>
            </button>

            <button
              onClick={() => setActiveSubTab('crear')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0a2342] hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Nueva Encuesta</span>
            </button>

            <button
              onClick={() => setActiveSubTab('georreferenciacion')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0a2342] hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span>Mapa GPS en Vivo</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-cyan-500/20">
          <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-3">
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider block">Estudios Activos</span>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <span>{studies.length}</span>
              <span className="text-[10px] text-emerald-400 font-normal bg-[#111C30]0/10 px-1.5 py-0.5 rounded border border-emerald-500/20">2 en campo</span>
            </div>
          </div>
          
          <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-3">
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider block">Encuestadores Registrados</span>
            <div className="text-xl font-black text-cyan-300 mt-1 flex items-center gap-2">
              <span>{pollsters.length}</span>
              <span className="text-[10px] text-emerald-400 font-normal">100% CNE</span>
            </div>
          </div>

          <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-3">
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider block">Monitoreo GPS en Vivo</span>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-2">
              <span>5 / 6</span>
              <span className="text-[10px] text-emerald-400 font-normal">En Perímetro</span>
            </div>
          </div>

          <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-3">
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider block">Margen Error Prom.</span>
            <div className="text-xl font-black text-amber-300 mt-1 flex items-center gap-2">
              <span>± 2.5%</span>
              <span className="text-[10px] text-slate-400 font-normal">Conf. 95%</span>
            </div>
          </div>

          <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-3">
            <span className="text-[10px] text-cyan-300/80 font-bold uppercase tracking-wider block">Auditoría IA Muestral</span>
            <div className="text-xl font-black text-emerald-300 mt-1 flex items-center gap-2">
              <span>98.7%</span>
              <span className="text-[10px] text-emerald-400 font-normal">Confiabilidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('estudios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'estudios'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Panel de Estudios y Sondeos ({studies.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('encuestadores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'encuestadores'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Gestión de Encuestadores ({pollsters.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('georreferenciacion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'georreferenciacion'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Monitoreo GPS y Geocercas en Vivo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crear')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'crear'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Diseñador con IA</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculadora')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'calculadora'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora Muestral</span>
        </button>

        <button
          onClick={() => setActiveSubTab('resultados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'resultados'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Inteligencia & IA</span>
        </button>
      </div>

      {/* SUB-TAB 1: ESTUDIOS Y SONDEOS LISTING */}
      {activeSubTab === 'estudios' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-[#05162a] border border-cyan-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por título, código o municipio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={handleRunAiAudit}
                disabled={aiAuditRunning}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/40 hover:border-purple-400 rounded-xl text-xs font-bold text-purple-200 flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
                <span>{aiAuditRunning ? 'Analizando con IA...' : 'Auditoría de Calidad IA'}</span>
              </button>

              <div className="flex items-center gap-2 bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="todos" className="bg-slate-900 text-white">Todos los estados</option>
                  <option value="en_campo" className="bg-slate-900 text-white">En Campo</option>
                  <option value="borrador" className="bg-slate-900 text-white">Borrador</option>
                  <option value="finalizado" className="bg-slate-900 text-white">Finalizado</option>
                  <option value="en_auditoría" className="bg-slate-900 text-white">En Auditoría</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Audit Result Alert */}
          {aiAuditResult && (
            <div className="bg-[#09223f] border border-purple-500/40 rounded-2xl p-4 text-xs text-slate-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Informe de Auditoría Anti-Fraude Asistido por IA</span>
                </span>
                <button onClick={() => setAiAuditResult(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  ✕
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 bg-[#05162a] p-3 rounded-xl border border-purple-500/20">
                {aiAuditResult}
              </pre>
            </div>
          )}

          {/* Tabla de Estudios / Encuestas */}
          <div className="overflow-x-auto border border-cyan-500/30 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111C30] text-cyan-300 font-bold border-b border-cyan-500/30">
                  <th className="p-3">Código / Tipo</th>
                  <th className="p-3">Título del Estudio</th>
                  <th className="p-3">Avance Muestral</th>
                  <th className="p-3">Metodología y Cobertura</th>
                  <th className="p-3">Encuestadores / Margen</th>
                  <th className="p-3">Periodo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/15 font-medium bg-[#0F172A]">
                {filteredStudies.map((study) => {
                  const progress = Math.min(100, Math.round((study.completedSample / study.targetSample) * 100));
                  const assignedPollstersCount = pollsters.filter(p => p.surveyId === study.id).length;
                  
                  return (
                    <tr key={study.id} className="hover:bg-[#111C30] transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded text-[9px] font-mono font-bold w-max">
                            {study.code}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[9px] font-semibold w-max">
                            {study.type}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white max-w-[220px] leading-tight">{study.title}</div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1 max-w-[150px]">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-cyan-300 font-bold">{study.completedSample} / {study.targetSample}</span>
                            <span className="text-slate-400 font-mono">({progress}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              }`} 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-300 font-bold">{study.methodology}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{study.location}</div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-300">{assignedPollstersCount} Activos</div>
                        <div className="text-[10px] text-amber-400 font-mono">Err: ±{study.marginOfError}%</div>
                      </td>

                      <td className="p-3 text-slate-400 text-[10px]">
                        <div>{study.startDate}</div>
                        <div>{study.endDate}</div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          study.status === 'En Campo' 
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : study.status === 'Finalizado'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : study.status === 'En Auditoría'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}>
                          {study.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSurveyFilter(study.id);
                              setActiveSubTab('encuestadores');
                            }}
                            className="p-1.5 bg-[#111C30] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Ver Encuestadores"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudy(study);
                              setShowResultsModal(true);
                            }}
                            className="p-1.5 bg-[#111C30] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Ver Resultados"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GESTIÓN DE ENCUESTADORES Y REGISTRO DE DATOS BÁSICOS */}
      {activeSubTab === 'encuestadores' && (
        <div className="space-y-5">
          
          {/* Header Controls for Pollsters */}
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full md:w-auto">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Gestión y Padrón de Encuestadores de Campo</span>
              </h3>
              <p className="text-xs text-cyan-200/70">
                Registro de datos personales, asignación de zonas, metas de campo e identificación CNE
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowAddPollsterModal(true)}
                className="px-4 py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Registrar Nuevo Encuestador</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-[#05162a] border border-cyan-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o comuna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Filtrar por Estudio:</span>
                <select
                  value={surveyFilter}
                  onChange={(e) => setSurveyFilter(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="todas" className="bg-slate-900 text-white">Todos los estudios</option>
                  {studies.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.code} - {s.title.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Encuestadores */}
          <div className="overflow-x-auto border border-cyan-500/30 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#111C30] text-cyan-300 font-bold border-b border-cyan-500/30">
                  <th className="p-3">Encuestador</th>
                  <th className="p-3">Estudio Asignado</th>
                  <th className="p-3">Avance Diario</th>
                  <th className="p-3">Zona / Teléfono</th>
                  <th className="p-3">Telemetría</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/15 font-medium bg-[#0F172A]">
                {filteredPollsters.map((pollster) => {
                  const progress = Math.min(100, Math.round((pollster.completedCount / pollster.dailyGoal) * 100));
                  
                  return (
                    <tr 
                      key={pollster.id} 
                      className={`hover:bg-[#111C30] transition-colors ${
                        pollster.aiAuditFlags?.outOfGeofence ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/40 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-200 text-xs shrink-0">
                            {pollster.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-white leading-tight">{pollster.name}</div>
                            <div className="text-[10px] text-cyan-300 font-mono mt-0.5">CC: {pollster.cedula}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-300 max-w-[200px] leading-tight truncate" title={pollster.surveyTitle}>
                          {pollster.surveyTitle}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-emerald-400">{pollster.completedCount} / {pollster.dailyGoal}</span>
                            <span className="text-slate-400 font-mono">({progress}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300">
                        <div className="font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{pollster.assignedZone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-3 h-3 text-blue-400" />
                          <span>{pollster.phone}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Battery className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Bat: {pollster.batteryLevel}%</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{pollster.lastActivity}</span>
                          </div>
                          {pollster.aiAuditFlags?.outOfGeofence && (
                            <div className="text-[9px] text-amber-300 font-bold flex items-center gap-0.5 mt-0.5 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 max-w-[160px] truncate" title={pollster.aiAuditFlags.notes}>
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Geocerca ⚠️</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          pollster.status === 'Meta Cumplida'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : pollster.status === 'Activo' || pollster.status === 'En Recorrido'
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}>
                          {pollster.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedPollster(pollster);
                              setShowAccreditationModal(true);
                            }}
                            className="p-1.5 bg-[#111C30] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Carnet CNE"
                          >
                            <QrCode className="w-3.5 h-3.5 text-cyan-300" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveGpsPollster(pollster);
                              setActiveSubTab('georreferenciacion');
                            }}
                            className="p-1.5 bg-[#111C30] hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Ver GPS"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePollster(pollster.id, pollster.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar encuestador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MONITOREO GPS Y GEOCERCAS EN VIVO */}
      {activeSubTab === 'georreferenciacion' && (
        <div className="space-y-5">
          
          {/* Header Bar */}
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Centro de Monitoreo GPS y Geocercas en Tiempo Real</span>
              </h3>
              <p className="text-xs text-cyan-200/70">
                Visualización espacial de encuestadores en campo, perímetro de geocercas y verificación anti-fraude
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Monitorear Encuesta:</span>
                <select
                  value={surveyFilter}
                  onChange={(e) => setSurveyFilter(e.target.value)}
                  className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="todas" className="bg-slate-900 text-white">Todas las encuestas en campo</option>
                  {studies.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.code} - {s.title.substring(0, 30)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Interactive Real Leaflet Map Stage */}
            <div className="md:col-span-8 bg-[#041122] border border-cyan-500/40 rounded-2xl p-4 shadow-2xl relative min-h-[520px] flex flex-col justify-between overflow-hidden">
              
              {/* Map Top Overlay Controls */}
              <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 bg-[#05162a]/95 backdrop-blur border border-cyan-500/30 p-2.5 rounded-xl mb-3">
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                  <span className="font-bold text-white">Geoportal Territorial CNE</span>
                  <span className="px-2 py-0.5 bg-[#111C30]0/20 text-emerald-300 rounded text-[10px] font-mono">
                    GPS Real Activo
                  </span>
                </div>

                {/* Layer Selector Buttons */}
                <div className="flex items-center gap-1.5 bg-[#081d38] p-1 rounded-lg border border-cyan-500/20">
                  <button
                    onClick={() => setTileStyle('dark')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      tileStyle === 'dark'
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-cyan-200 hover:text-white'
                    }`}
                  >
                    Oscuro CNE
                  </button>
                  <button
                    onClick={() => setTileStyle('street')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      tileStyle === 'street'
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-cyan-200 hover:text-white'
                    }`}
                  >
                    Urbano OSM
                  </button>
                  <button
                    onClick={() => setTileStyle('satellite')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      tileStyle === 'satellite'
                        ? 'bg-cyan-500 text-white shadow'
                        : 'text-cyan-200 hover:text-white'
                    }`}
                  >
                    Satélite HD
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>En Perímetro ({filteredPollsters.filter(p => p.gpsCoordinates.inGeofence).length})</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Fuera ({filteredPollsters.filter(p => !p.gpsCoordinates.inGeofence).length})</span>
                  </span>
                </div>
              </div>

              {/* Real Leaflet Map Container */}
              <div className="relative z-10 w-full h-[390px] rounded-xl overflow-hidden border border-cyan-500/30 shadow-inner">
                <MapContainer
                  center={[
                    activeGpsPollster?.gpsCoordinates.lat || 6.2550,
                    activeGpsPollster?.gpsCoordinates.lng || -75.5750
                  ]}
                  zoom={13}
                  style={{ width: '100%', height: '100%', background: '#05162a' }}
                  scrollWheelZoom={true}
                >
                  <MapController
                    center={[
                      activeGpsPollster?.gpsCoordinates.lat || 6.2550,
                      activeGpsPollster?.gpsCoordinates.lng || -75.5750
                    ]}
                    zoom={activeGpsPollster ? 15 : 13}
                  />

                  <TileLayer
                    url={TILE_LAYERS[tileStyle].url}
                    attribution={TILE_LAYERS[tileStyle].attribution}
                  />

                  {/* Geofence Circles */}
                  {GEOFENCE_ZONES.map(zone => (
                    <Circle
                      key={zone.id}
                      center={zone.center}
                      radius={zone.radius}
                      pathOptions={{
                        color: zone.color,
                        fillColor: zone.color,
                        fillOpacity: 0.12,
                        dashArray: '6, 8',
                        weight: 2
                      }}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="text-xs p-1 font-sans">
                          <strong className="text-cyan-900 block">{zone.name}</strong>
                          <span className="text-slate-400">Perímetro de control GPS: {zone.radius}m</span>
                        </div>
                      </Popup>
                    </Circle>
                  ))}

                  {/* Pollster Markers */}
                  {filteredPollsters.map(pollster => {
                    const isSelected = activeGpsPollster?.id === pollster.id;

                    return (
                      <Marker
                        key={pollster.id}
                        position={[pollster.gpsCoordinates.lat, pollster.gpsCoordinates.lng]}
                        icon={createPollsterDivIcon(pollster, isSelected)}
                        eventHandlers={{
                          click: () => setActiveGpsPollster(pollster),
                        }}
                      >
                        <Popup className="custom-leaflet-popup">
                          <div className="p-1 space-y-1.5 font-sans min-w-[200px]">
                            <div className="flex items-center justify-between border-b pb-1">
                              <span className="font-extrabold text-white text-sm">{pollster.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#020617] text-slate-300">
                                {pollster.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 space-y-0.5">
                              <div><strong>CC:</strong> {pollster.cedula}</div>
                              <div><strong>Zona:</strong> {pollster.assignedZone}</div>
                              <div><strong>Avance:</strong> {pollster.completedCount} / {pollster.dailyGoal} encuestas</div>
                              <div><strong>Ubicación:</strong> {pollster.gpsCoordinates.address}</div>
                              <div><strong>Batería:</strong> {pollster.batteryLevel}%</div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPollster(pollster);
                                setShowAccreditationModal(true);
                              }}
                              className="w-full mt-2 py-1 bg-cyan-600 text-white font-bold rounded text-xs cursor-pointer hover:bg-cyan-700"
                            >
                              Ver Carnet Digital CNE
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Map Footer Info */}
              <div className="relative z-10 pt-3 mt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Sincronización GPS activa con satélite en tiempo real</span>
                </div>
                <div className="font-mono text-cyan-300 font-semibold">
                  Coordenadas Centro: {activeGpsPollster?.gpsCoordinates.lat.toFixed(4) || '6.2550'} | {activeGpsPollster?.gpsCoordinates.lng.toFixed(4) || '-75.5750'} (Medellín, CO)
                </div>
              </div>

            </div>

            {/* Selected Pollster GPS Detail Telemetry Card */}
            <div className="md:col-span-4 space-y-4">
              {activeGpsPollster ? (
                <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-5 text-slate-100 shadow-xl space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                        {activeGpsPollster.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{activeGpsPollster.name}</h4>
                        <span className="text-[10px] text-cyan-300 font-mono">CC: {activeGpsPollster.cedula}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeGpsPollster.gpsCoordinates.inGeofence
                        ? 'bg-[#111C30]0/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#111C30]0/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeGpsPollster.gpsCoordinates.inGeofence ? 'En Zona OK' : 'Alerta Geocerca'}
                    </span>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#081d38] p-3 rounded-xl border border-cyan-500/15 space-y-1">
                      <div className="text-[10px] text-slate-400">Ubicación GPS Exacta:</div>
                      <div className="font-mono font-bold text-cyan-200">
                        {activeGpsPollster.gpsCoordinates.lat.toFixed(4)}, {activeGpsPollster.gpsCoordinates.lng.toFixed(4)}
                      </div>
                      <div className="text-[11px] text-slate-300">{activeGpsPollster.gpsCoordinates.address}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#081d38] p-2.5 rounded-xl border border-cyan-500/10">
                        <span className="text-[10px] text-slate-400 block">Precisión GPS:</span>
                        <span className="font-mono font-bold text-emerald-300">±{activeGpsPollster.gpsCoordinates.accuracyMeters}m</span>
                      </div>

                      <div className="bg-[#081d38] p-2.5 rounded-xl border border-cyan-500/10">
                        <span className="text-[10px] text-slate-400 block">Nivel de Batería:</span>
                        <span className="font-mono font-bold text-cyan-300">{activeGpsPollster.batteryLevel}%</span>
                      </div>
                    </div>

                    <div className="bg-[#081d38] p-3 rounded-xl border border-cyan-500/15 flex justify-between items-center">
                      <span className="text-slate-400">IMEI Dispositivo:</span>
                      <span className="font-mono font-bold text-white text-[11px]">{activeGpsPollster.deviceImei}</span>
                    </div>

                    <div className="bg-[#081d38] p-3 rounded-xl border border-cyan-500/15 flex justify-between items-center">
                      <span className="text-slate-400">Código Acreditación CNE:</span>
                      <span className="font-mono font-bold text-emerald-300 text-[11px]">{activeGpsPollster.accreditationCode}</span>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => {
                      setSelectedPollster(activeGpsPollster);
                      setShowAccreditationModal(true);
                    }}
                    className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-cyan-300" />
                    <span>Ver Carnet Digital CNE</span>
                  </button>

                </div>
              ) : (
                <div className="bg-[#05162a] border border-cyan-500/20 rounded-2xl p-6 text-center text-slate-400 text-xs">
                  Seleccione un encuestador en el mapa para ver la telemetría GPS
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: DESIGNER WITH AI */}
      {activeSubTab === 'crear' && (
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
          <div className="border-b border-cyan-500/20 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>Diseñador y Generador Asistido por IA</span>
              </h3>
              <p className="text-xs text-cyan-200/70">
                Configure los parámetros del estudio y genere cuestionarios electorales con Inteligencia Artificial
              </p>
            </div>
            
            <button
              onClick={handleGenerateQuestionsWithAI}
              disabled={aiGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Bot className="w-4 h-4 animate-spin" style={{ animationDuration: aiGenerating ? '2s' : '0s' }} />
              <span>{aiGenerating ? 'Generando Cuestionario...' : 'Generar Preguntas con IA'}</span>
            </button>
          </div>

          <form onSubmit={handleCreateSurvey} className="space-y-6">
            
            {/* General Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Título del Estudio / Sondeo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tracking Poll Semanal Comuna 4 y 5"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Tipo de Investigación *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as SurveyStudy['type'])}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Intención de Voto">Intención de Voto</option>
                  <option value="Tracking Poll">Tracking Poll Diario/Semanal</option>
                  <option value="Línea Base">Estudio de Línea Base</option>
                  <option value="Sondeo Flash">Sondeo Flash de Temas</option>
                  <option value="Favorabilidad">Favorabilidad e Imagen</option>
                  <option value="Clima Político">Clima Político y Preocupaciones</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Metodología de Recolección *</label>
                <select
                  value={newMethodology}
                  onChange={(e) => setNewMethodology(e.target.value as SurveyStudy['methodology'])}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Presencial (CAPI)">Presencial / Domiciliaria (CAPI)</option>
                  <option value="Telefónico (CATI)">Telefónico Directo (CATI)</option>
                  <option value="Digital / WhatsApp">Digital Web / Bot WhatsApp</option>
                  <option value="Mixto">Metodología Mixta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Muestra Objetivo (n) *</label>
                <input
                  type="number"
                  required
                  min={50}
                  value={newTargetSample}
                  onChange={(e) => setNewTargetSample(Number(e.target.value))}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Cobertura Territorial *</label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Parámetros Estadísticos Sugeridos</label>
                <div className="bg-[#081d38] border border-cyan-500/20 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-mono flex items-center justify-between">
                  <span>Confianza: 95%</span>
                  <span>Margen: ±2.8%</span>
                </div>
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-4 border-t border-cyan-500/20">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Cuestionario y Banco de Preguntas ({newQuestions.length})</span>
                </h4>
                <span className="text-[11px] text-cyan-300">Generadas según estándares CNE</span>
              </div>

              <div className="space-y-3">
                {newQuestions.map((q, index) => (
                  <div key={q.id} className="bg-[#081d38] border border-cyan-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs font-bold">
                          P{index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{q.text}</p>
                          <span className="text-[10px] text-cyan-400/80 uppercase font-mono">Tipo: {q.type}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewQuestions(newQuestions.filter(item => item.id !== q.id))}
                        className="text-rose-400 hover:text-rose-300 text-xs p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {q.options && (
                      <div className="pl-6 space-y-1">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Question Row */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Escriba el enunciado de una nueva pregunta para el estudio..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Pregunta</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('estudios')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Encuesta en Borrador</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SUB-TAB 5: SAMPLE CALCULATOR & IA STRATIFICATION */}
      {activeSubTab === 'calculadora' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 bg-[#05162a] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-xl space-y-5">
            <div className="border-b border-cyan-500/20 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span>Calculadora de Tamaño Muestral Electorales</span>
              </h3>
              <p className="text-xs text-cyan-200/70">
                Fórmula de Cochran ajustada para poblaciones finitas (Censo Electoral)
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Población Total o Censo Electoral (N)</label>
                <input
                  type="number"
                  value={calcUniverse}
                  onChange={(e) => setCalcUniverse(Number(e.target.value))}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-300 block">Nivel de Confianza (Z)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 95, 99].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCalcConfidence(val)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        calcConfidence === val
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                          : 'bg-[#081d38] text-slate-300 border-cyan-500/20 hover:border-cyan-400/40'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-bold text-cyan-300">Margen de Error Tolerado (e):</label>
                  <span className="font-mono text-emerald-400 font-bold">± {calcMargin}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={calcMargin}
                  onChange={(e) => setCalcMargin(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Calculator Output */}
          <div className="md:col-span-6 bg-gradient-to-br from-[#081d38] to-[#041122] border border-cyan-500/40 rounded-2xl p-6 text-slate-100 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <span className="px-3 py-1 bg-[#111C30]0/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Resultado de Cálculo Recomendado
              </span>

              <div className="mt-4 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Muestra Necesaria (n):</span>
                <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span className="text-emerald-400">{calculatedSample}</span>
                  <span className="text-sm font-normal text-slate-300">encuestas completas</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRunAiStratification}
                  className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-400/40 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4 text-purple-300" />
                  <span>Sugerir Estratificación por Comunas con IA</span>
                </button>
              </div>

              {aiStratification && (
                <div className="mt-4 bg-[#05162a] p-3 rounded-xl border border-purple-500/30 space-y-2 text-xs">
                  <div className="font-bold text-purple-300">Estratificación Político-Territorial Recomenda por IA:</div>
                  <div className="space-y-1 text-[11px] max-h-36 overflow-y-auto">
                    {aiStratification.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 py-0.5 border-b border-cyan-500/10">
                        <span>{item.comuna}:</span>
                        <span className="font-mono text-cyan-300">{item.muestra} encuestas ({item.porcentaje})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Fórmula oficial CNE para representatividad estadística con 95% de nivel de confianza.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: RESULTS & AI INTELLIGENCE */}
      {activeSubTab === 'resultados' && (
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
          <div className="border-b border-cyan-500/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <span>Panel de Inteligencia Electoral e Insights Estratégicos asistidos por IA</span>
              </h3>
              <p className="text-xs text-cyan-200/70">
                Consolidado muestral de intención de voto y diagnósticos tácticos
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAiReport}
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-400/40 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-300" />
                <span>Generar Informe Estratégico de Campaña con IA</span>
              </button>
            </div>
          </div>

          {aiReportOutput && (
            <div className="bg-[#081d38] border border-purple-500/40 rounded-2xl p-4 text-xs text-slate-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Informe de Estrategia Electoral Generado por IA</span>
                </span>
                <button onClick={() => setAiReportOutput(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  ✕
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 bg-[#05162a] p-3.5 rounded-xl border border-purple-500/20 leading-relaxed">
                {aiReportOutput}
              </pre>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Candidate Breakdown */}
            <div className="md:col-span-7 space-y-4">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Intención de Voto por Candidato (Ponderación Muestral)
              </h4>

              {[
                { candidate: 'Nuestro Candidato (Campaña Ganadora)', percentage: 38.5, votes: 2075, color: 'bg-[#111C30]0', isUs: true },
                { candidate: 'Candidato Oposición A', percentage: 27.2, votes: 1466, color: 'bg-blue-500', isUs: false },
                { candidate: 'Candidato Oposición B', percentage: 14.8, votes: 797, color: 'bg-[#111C30]0', isUs: false },
                { candidate: 'Indecisos / No Sabe No Responde', percentage: 11.5, votes: 620, color: 'bg-[#111C30]0', isUs: false },
                { candidate: 'Voto en Blanco', percentage: 8.0, votes: 432, color: 'bg-[#111C30]0', isUs: false },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border space-y-2 ${
                  item.isUs ? 'bg-[#092842] border-emerald-500/50 shadow-lg' : 'bg-[#081d38] border-cyan-500/20'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${item.isUs ? 'text-emerald-300 text-sm' : 'text-white'}`}>
                      {item.candidate}
                    </span>
                    <span className="font-mono font-black text-white text-sm">{item.percentage}%</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${item.color}`} style={{ width: `${item.percentage}%` }} />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Muestra proyectada: {item.votes} respuestas</span>
                    {item.isUs && <span className="text-emerald-400 font-bold">Ventaja: +11.3% sobre 2do lugar</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Side Analytics Insights */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#081d38] border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Insights de IA Estratégica</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El candidato lidera con holgura en las Comunas 2, 4 y 7. El mayor nicho de oportunidad se encuentra en la Comuna 5 (22% de indecisos) y en el segmento joven (18-28 años).
                </p>
              </div>

              <div className="bg-[#081d38] border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Calidad y Autenticidad Muestral</span>
                </h4>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span>Auditoría GPS en Vivo:</span>
                    <span className="text-emerald-400 font-bold">100% Verificado</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cuestionarios Validados:</span>
                    <span className="text-cyan-300 font-bold">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificación Ficha Técnica:</span>
                    <span className="text-emerald-300 font-bold">Conforme CNE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVO ENCUESTADOR */}
      {showAddPollsterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Registrar Nuevo Encuestador de Campo</span>
              </h3>
              <button onClick={() => setShowAddPollsterModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPollsterSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-cyan-300 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Esteban Morales"
                  value={newPolName}
                  onChange={(e) => setNewPolName(e.target.value)}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">Cédula de Ciudadanía *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 1032890123"
                    value={newPolCedula}
                    onChange={(e) => setNewPolCedula(e.target.value)}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: +57 312 450 9988"
                    value={newPolPhone}
                    onChange={(e) => setNewPolPhone(e.target.value)}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-cyan-300 block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@campanaganadora.co"
                  value={newPolEmail}
                  onChange={(e) => setNewPolEmail(e.target.value)}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">Estudio / Sondeo Asignado *</label>
                  <select
                    value={newPolSurveyId}
                    onChange={(e) => setNewPolSurveyId(e.target.value)}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {studies.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900">{s.code} - {s.title.substring(0, 25)}...</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">Zona / Comuna Asignada *</label>
                  <input
                    type="text"
                    required
                    value={newPolZone}
                    onChange={(e) => setNewPolZone(e.target.value)}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">Meta Diaria (Encuestas) *</label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={newPolGoal}
                    onChange={(e) => setNewPolGoal(Number(e.target.value))}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-cyan-300 block">IMEI / Dispositivo *</label>
                  <input
                    type="text"
                    value={newPolDevice}
                    onChange={(e) => setNewPolDevice(e.target.value)}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3.5 py-2 font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPollsterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Encuestador</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARNET DIGITAL DE ACREDITACIÓN CNE */}
      {showAccreditationModal && selectedPollster && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 space-y-4 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <span className="text-[10px] text-cyan-300 font-extrabold uppercase tracking-widest">
                CNE - Acreditación Oficial
              </span>
              <button onClick={() => setShowAccreditationModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {/* Carnet Layout */}
            <div className="bg-gradient-to-br from-[#092842] to-[#041122] border-2 border-cyan-400/50 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="text-[9px] font-black uppercase text-cyan-300 tracking-wider">
                Campaña Ganadora - Investigación Electoral
              </div>

              {/* Avatar Photo Frame */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-white text-2xl">
                  {selectedPollster.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-white">{selectedPollster.name}</h3>
                <p className="text-xs text-cyan-300 font-mono font-bold">C.C. {selectedPollster.cedula}</p>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">CARGO: ENCUESTADOR OFICIAL DE CAMPO</p>
              </div>

              <div className="bg-[#05162a] p-2 rounded-xl border border-cyan-500/20 text-[10px] text-slate-300 space-y-1 text-left">
                <div><span className="text-slate-400">Estudio:</span> {selectedPollster.surveyTitle}</div>
                <div><span className="text-slate-400">Zona:</span> {selectedPollster.assignedZone}</div>
                <div><span className="text-slate-400">Código CNE:</span> <span className="text-cyan-300 font-mono font-bold">{selectedPollster.accreditationCode}</span></div>
              </div>

              {/* QR Code Simulation */}
              <div className="pt-1 flex flex-col items-center justify-center">
                <div className="p-2 bg-[#0F172A] rounded-xl shadow">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">Escanee para verificar validez CNE</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  alert(`Imprimiendo acreditación CNE para ${selectedPollster.name}...`);
                  setShowAccreditationModal(false);
                }}
                className="w-full py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Descargar Carnet (PDF)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: VER RESULTADOS DE ESTUDIO */}
      {showResultsModal && selectedStudy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{selectedStudy.code}</span>
                <h3 className="text-base font-bold text-white">{selectedStudy.title}</h3>
              </div>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#081d38] p-3 rounded-xl">
                <div>Metodología: <span className="font-bold text-white">{selectedStudy.methodology}</span></div>
                <div>Lugar: <span className="font-bold text-white">{selectedStudy.location}</span></div>
                <div>Muestra: <span className="font-bold text-cyan-300">{selectedStudy.completedSample} de {selectedStudy.targetSample}</span></div>
                <div>Margen Error: <span className="font-bold text-amber-300">±{selectedStudy.marginOfError}%</span></div>
              </div>

              <div className="bg-[#081d38] p-4 rounded-xl space-y-2">
                <span className="font-bold text-cyan-300">Resumen de Pregunta Principal (Intención de Voto):</span>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <span>Nuestro Candidato:</span>
                    <span className="font-bold text-emerald-400">38.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segundo Lugar:</span>
                    <span className="font-bold text-blue-300">27.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indecisos:</span>
                    <span className="font-bold text-amber-300">11.5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-cyan-500/20 flex justify-end gap-2">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
