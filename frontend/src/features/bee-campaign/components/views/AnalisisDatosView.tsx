import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  RefreshCw, 
  Download, 
  Share2, 
  Filter, 
  ShieldCheck, 
  DollarSign, 
  PieChart as PieIcon, 
  Layers, 
  ArrowUpRight, 
  Plus, 
  X, 
  Check, 
  Activity, 
  MessageSquare, 
  Zap, 
  Sliders, 
  Flame, 
  Clock,
  FileCheck2,
  Award,
  Vote,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';

export interface AIRecommendation {
  id: string;
  title: string;
  category: 'Territorial' | 'Digital & Mensaje' | 'Día E & Testigos' | 'Finanzas & CNE' | 'Estrategia General';
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  estimatedImpact: string;
  description: string;
  actionRequired: string;
  assignedTeam: string;
  status: 'Pendiente' | 'En Proceso' | 'Implementada';
  createdDate: string;
}

export interface ComunaMetric {
  id: string;
  name: string;
  targetVotes: number;
  securedVotes: number;
  coveragePercent: number;
  status: 'Excelente' | 'Normal' | 'Requiere Refuerzo' | 'Crítico';
  topIssue: string;
}

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#030e1c] border border-cyan-500/40 p-3 rounded-xl shadow-2xl text-xs space-y-1">
        <p className="font-extrabold text-cyan-300 border-b border-cyan-500/20 pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
            <span style={{ color: entry.color }} className="font-bold">
              {entry.name}:
            </span>
            <span className="text-white font-extrabold">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalisisDatosView: React.FC<{
  onSelectView?: (view: any) => void;
}> = ({ onSelectView }) => {
  // Active internal tab
  const [activeTab, setActiveTab] = useState<'overview' | 'growth_polls' | 'electoral_territorial' | 'admin_finance' | 'recommendations'>('overview');
  
  // Filter States
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'campaign'>('30d');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. DATA: Crecimiento Electoral Histórico vs Metas
  const growthData = [
    { mes: 'Ene 2026', metaVotos: 15000, votosFirmes: 12200, votosIdentificados: 18000 },
    { mes: 'Feb 2026', metaVotos: 28000, votosFirmes: 24500, votosIdentificados: 33100 },
    { mes: 'Mar 2026', metaVotos: 42000, votosFirmes: 38100, votosIdentificados: 49200 },
    { mes: 'Abr 2026', metaVotos: 58000, votosFirmes: 51200, votosIdentificados: 64800 },
    { mes: 'May 2026', metaVotos: 72000, votosFirmes: 62400, votosIdentificados: 78500 },
    { mes: 'Jun (Proy.)', metaVotos: 85000, votosFirmes: 78000, votosIdentificados: 92000 },
  ];

  // 2. DATA: Tracking Histórico de Intención de Voto (Encuestas Nivel Ciudad)
  const pollTrackingData = [
    { mes: 'Ene', santiagoPerez: 18.2, carlosRendon: 35.1, elenaRestrepo: 23.4, indecisos: 23.3 },
    { mes: 'Feb', santiagoPerez: 21.0, carlosRendon: 34.2, elenaRestrepo: 22.8, indecisos: 22.0 },
    { mes: 'Mar', santiagoPerez: 23.8, carlosRendon: 33.5, elenaRestrepo: 22.1, indecisos: 20.6 },
    { mes: 'Abr', santiagoPerez: 25.3, carlosRendon: 33.0, elenaRestrepo: 21.5, indecisos: 20.2 },
    { mes: 'May', santiagoPerez: 28.5, carlosRendon: 32.5, elenaRestrepo: 21.0, indecisos: 18.0 },
  ];

  // 3. DATA: Sondeo de Percepción Ciudadana por Temática Priority
  const citizenPerceptionData = [
    { aspecto: 'Seguridad y Convivencia', preocupacion: 78, evaluacionGestionPositiva: 28, resonanciaPropuesta: 82 },
    { aspecto: 'Empleo & Emprendimiento', preocupacion: 65, evaluacionGestionPositiva: 35, resonanciaPropuesta: 79 },
    { aspecto: 'Movilidad & Metro', preocupacion: 62, evaluacionGestionPositiva: 41, resonanciaPropuesta: 74 },
    { aspecto: 'Transparencia & Anti-Corrupción', preocupacion: 71, evaluacionGestionPositiva: 22, resonanciaPropuesta: 88 },
    { aspecto: 'Salud & Red Hospitalaria', preocupacion: 54, evaluacionGestionPositiva: 48, resonanciaPropuesta: 69 },
    { aspecto: 'Educación & Juventud', preocupacion: 59, evaluacionGestionPositiva: 52, resonanciaPropuesta: 85 },
  ];

  // 4. DATA: Atributos de Percepción e Imagen del Candidato vs Rival Principal
  const candidateAttributesData = [
    { atributo: 'Honestidad', SantiagoPerez: 88, CarlosRendon: 52 },
    { atributo: 'Capacidad de Gestión', SantiagoPerez: 82, CarlosRendon: 85 },
    { atributo: 'Cercanía Ciudadana', SantiagoPerez: 90, CarlosRendon: 60 },
    { atributo: 'Innovación & Visión', SantiagoPerez: 94, CarlosRendon: 62 },
    { atributo: 'Conocimiento Territorial', SantiagoPerez: 85, CarlosRendon: 88 },
    { atributo: 'Independencia Política', SantiagoPerez: 92, CarlosRendon: 48 },
  ];

  // 5. DATA: Aspectos Electorales (Cobertura de Mesas y Testigos por Comuna)
  const electoralWitnessesData = [
    { comuna: 'Belén (C16)', mesas: 320, testigosAcreditados: 298, porcentaje: 93 },
    { comuna: 'El Poblado (C14)', mesas: 280, testigosAcreditados: 266, porcentaje: 95 },
    { comuna: 'Laureles (C11)', mesas: 260, testigosAcreditados: 247, porcentaje: 95 },
    { comuna: 'Centro (C10)', mesas: 240, testigosAcreditados: 204, porcentaje: 85 },
    { comuna: 'Comuna 13', mesas: 210, testigosAcreditados: 168, porcentaje: 80 },
    { comuna: 'Manrique (C3)', mesas: 220, testigosAcreditados: 165, porcentaje: 75 },
    { comuna: 'Popular (C1)', mesas: 190, testigosAcreditados: 133, porcentaje: 70 },
    { comuna: 'San Cristóbal', mesas: 150, testigosAcreditados: 105, porcentaje: 70 },
  ];

  // 6. DATA: Aspectos Administrativos (Presupuesto CNE por Rubro vs Facturación Legalizada)
  const financialAdminData = [
    { rubro: 'Publicidad & Digital', asignado: 800, ejecutado: 540, facturadoCNE: 490 },
    { rubro: 'Eventos & Movilización', asignado: 600, ejecutado: 380, facturadoCNE: 320 },
    { rubro: 'Operación Territorial', asignado: 450, ejecutado: 260, facturadoCNE: 210 },
    { rubro: 'Material Impreso & Kits', asignado: 350, ejecutado: 180, facturadoCNE: 160 },
    { rubro: 'Sedes & Logística Día E', asignado: 300, ejecutado: 60, facturadoCNE: 55 },
  ];

  // Pie Data for Expense Category Breakdown
  const expensePieData = [
    { name: 'Publicidad Digital & Medios', value: 540, color: '#38bdf8' },
    { name: 'Eventos & Micro-mítines', value: 380, color: '#34d399' },
    { name: 'Operación Territorial', value: 260, color: '#fbbf24' },
    { name: 'Material Impreso', value: 180, color: '#c084fc' },
    { name: 'Logística & Sedes', value: 60, color: '#f87171' },
  ];

  // Recommendations State
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'rec-1',
      title: 'Reforzar Presencia Territorial en Comuna 1 (Popular) y Comuna 3 (Manrique)',
      category: 'Territorial',
      priority: 'Crítica',
      estimatedImpact: '+3,500 a +5,000 Votos Estimados',
      description: 'El análisis de datos territoriales muestra un rezago del 22% en la consecución de votos asegurados en el nororiente frente al promedio de la ciudad. El candidato rival tiene alta presencia con líderes tradicionales.',
      actionRequired: 'Organizar 3 caminatas barriales con el candidato esta semana y desplegar 50 líderes juveniles para visitas puerta a puerta.',
      assignedTeam: 'Equipo de Operaciones Territoriales',
      status: 'Pendiente',
      createdDate: 'Hace 2 horas'
    },
    {
      id: 'rec-2',
      title: 'Acreditar Testigos Electorales Faltantes en Puestos Periféricos',
      category: 'Día E & Testigos',
      priority: 'Crítica',
      estimatedImpact: 'Blindaje de hasta 8,000 Votos en Escrutinio',
      description: 'Hay 300 mesas de votación en puestos alejados (corregimientos y Comunas 1, 3, 8) que no tienen testigo asignado ni capacitado en diligenciamiento del Formulario E-14.',
      actionRequired: 'Activar campaña urgente de reclutamiento de jurados/testigos con la red universitaria y ofrecer estímulo logístico para el Día E.',
      assignedTeam: 'Coordinación de Control Electoral',
      status: 'En Proceso',
      createdDate: 'Hoy 08:30 AM'
    },
    {
      id: 'rec-3',
      title: 'Ajustar Mensaje Digital a Segmento Joven (18 - 28 años) sobre Empleo e Innovación',
      category: 'Digital & Mensaje',
      priority: 'Alta',
      estimatedImpact: '+4.2% Aumento en Intención de Voto Joven',
      description: 'Los datos de sondeos digitales revelan que el 64% de los jóvenes indecisos consideran la falta de empleo formal como su principal preocupación y no identifican la propuesta del candidato.',
      actionRequired: 'Lanzar micro-pauta digital en TikTok/Instagram enfocada en la propuesta de "Ciudadela Tecnológica y Nodos de Emprendimiento Digital".',
      assignedTeam: 'Comité de Comunicaciones',
      status: 'Pendiente',
      createdDate: 'Ayer'
    },
    {
      id: 'rec-4',
      title: 'Acelerar Legalización de Soportes Financieros para Informe CNE No. 2',
      category: 'Finanzas & CNE',
      priority: 'Alta',
      estimatedImpact: 'Evita Sanciones Administrativas CNE',
      description: 'Se registran $185 millones COP en gastos operativos pendientes de digitalizar con factura electrónica para la plataforma Cuentas Claras.',
      actionRequired: 'Solicitar a proveedores de pauta e imprentas las facturas definitivas con RUT actualizado.',
      assignedTeam: 'Dirección Administrativa y Financiera',
      status: 'Implementada',
      createdDate: 'Hace 3 días'
    },
    {
      id: 'rec-5',
      title: 'Aprovechar Debates Televisados para Cuestionar Propuesta Contractual del Competidor Puntero',
      category: 'Estrategia General',
      priority: 'Media',
      estimatedImpact: 'Captación del 15% de Votantes Indecisos de Opinión',
      description: 'Los sondeos muestran que el puntero (Carlos Rendón) tiene un 42% de percepción negativa por cuestionamientos contractuales pasados. El candidato debe posicionarse como la alternativa ética sin odios.',
      actionRequired: 'Preparar ficha técnica de contraste para el debate de Telemedellín con datos oficiales de contratación.',
      assignedTeam: 'Comité Estratégico de Narrativa',
      status: 'En Proceso',
      createdDate: 'Hace 4 días'
    }
  ]);

  // Modal Add state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRec, setNewRec] = useState<{
    title: string;
    category: 'Territorial' | 'Digital & Mensaje' | 'Día E & Testigos' | 'Finanzas & CNE' | 'Estrategia General';
    priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
    estimatedImpact: string;
    description: string;
    actionRequired: string;
    assignedTeam: string;
  }>({
    title: '',
    category: 'Territorial',
    priority: 'Alta',
    estimatedImpact: '',
    description: '',
    actionRequired: '',
    assignedTeam: 'Equipo de Operaciones'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('¡Gráficos de Recharts y modelos de recomendación IA actualizados correctamente!');
    }, 1200);
  };

  const handleStatusChange = (id: string, newStatus: 'Pendiente' | 'En Proceso' | 'Implementada') => {
    setRecommendations(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    showToast(`Estado de recomendación actualizado a: ${newStatus}`);
  };

  const handleAddRecommendation = () => {
    if (!newRec.title.trim() || !newRec.description.trim()) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }
    const createdItem: AIRecommendation = {
      id: `rec-${Date.now()}`,
      ...newRec,
      status: 'Pendiente',
      createdDate: 'Justo ahora'
    };
    setRecommendations([createdItem, ...recommendations]);
    setShowAddModal(false);
    setNewRec({
      title: '',
      category: 'Territorial',
      priority: 'Alta',
      estimatedImpact: '',
      description: '',
      actionRequired: '',
      assignedTeam: 'Equipo de Operaciones'
    });
    showToast('Nueva recomendación estratégica agregada con éxito al panel.');
  };

  const pendingCount = recommendations.filter(r => r.status === 'Pendiente').length;
  const inProgressCount = recommendations.filter(r => r.status === 'En Proceso').length;
  const doneCount = recommendations.filter(r => r.status === 'Implementada').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 text-xs font-extrabold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#05162a] border border-cyan-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Módulo de Inteligencia de Datos & Recharts
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Monitoreo Analítico en Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Análisis de Datos de Campaña & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Recomendaciones IA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            Gráficos interactivos de crecimiento electoral frente a metas, sondeos de intención de voto y percepción ciudadana, métricas de control de testigos y ejecución presupuestal CNE.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={handleRefreshMetrics}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Recalculando Gráficos...' : 'Actualizar Datos Recharts'}</span>
          </button>

          <button
            onClick={() => showToast('Reporte completo de Análisis de Datos y Gráficos exportado.')}
            className="px-3.5 py-2.5 bg-[#030e1c] hover:bg-slate-800 text-slate-200 border border-cyan-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar Gráficos</span>
          </button>
        </div>
      </div>

      {/* TOP METRICS / KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Intención de Voto */}
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Intención de Voto</span>
            <div className="p-1.5 bg-[#111C30]0/20 text-amber-300 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">28.5%</span>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +3.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Puesto #2 | Meta: 35.0%</p>
        </div>

        {/* KPI 2: Votos Asegurados */}
        <div className="bg-[#05162a] border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-emerald-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Votos Firmes</span>
            <div className="p-1.5 bg-[#111C30]0/20 text-emerald-300 rounded-lg">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">62,400</span>
            <span className="text-[10px] font-bold text-slate-300 font-mono">73.4%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '73.4%' }} />
          </div>
          <p className="text-[10px] text-slate-400">Meta: 85,000 Votos</p>
        </div>

        {/* KPI 3: Cobertura Testigos */}
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-cyan-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Testigos Día E</span>
            <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-300 font-mono">1,840 / 2,140</span>
            <span className="text-[10px] font-bold text-cyan-400 font-mono">86.0%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '86%' }} />
          </div>
          <p className="text-[10px] text-slate-400">300 Mesas pendientes</p>
        </div>

        {/* KPI 4: Presupuesto CNE */}
        <div className="bg-[#05162a] border border-purple-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Ejecutado CNE</span>
            <div className="p-1.5 bg-[#111C30]0/20 text-purple-300 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-300 font-mono">$1,420M</span>
            <span className="text-[10px] font-bold text-purple-400 font-mono">56.8%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: '56.8%' }} />
          </div>
          <p className="text-[10px] text-slate-400">Techo: $2,500M COP</p>
        </div>

        {/* KPI 5: Resonancia de Propuesta */}
        <div className="bg-[#05162a] border border-teal-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-teal-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Resonancia Propuesta</span>
            <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-teal-300 font-mono">81.2%</span>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">Aprobación</span>
          </div>
          <p className="text-[10px] text-slate-400">Sondeos de Opinión</p>
        </div>

        {/* KPI 6: Soportes CNE Legalizados */}
        <div className="bg-[#05162a] border border-indigo-500/30 rounded-2xl p-4 space-y-2 shadow-lg hover:border-indigo-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Facturación CNE</span>
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-300 font-mono">$1,245M</span>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">87.6%</span>
          </div>
          <p className="text-[10px] text-slate-400">Cuentas Claras al día</p>
        </div>

      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-lg border border-cyan-400/50'
                : 'bg-[#051325] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-300" />
            <span>1. Dashboard 360°</span>
          </button>

          <button
            onClick={() => setActiveTab('growth_polls')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'growth_polls'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-lg border border-cyan-400/50'
                : 'bg-[#051325] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>2. Crecimiento Electoral & Encuestas</span>
          </button>

          <button
            onClick={() => setActiveTab('electoral_territorial')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'electoral_territorial'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-lg border border-cyan-400/50'
                : 'bg-[#051325] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Vote className="w-4 h-4 text-emerald-300" />
            <span>3. Datos Electorales & Testigos</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_finance')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'admin_finance'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-lg border border-cyan-400/50'
                : 'bg-[#051325] text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-purple-300" />
            <span>4. Finanzas CNE & Administración</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'recommendations'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400/50'
                : 'bg-[#051325] text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span>5. Recomendaciones IA</span>
            <span className="bg-[#111C30]0 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
              {pendingCount} Pendientes
            </span>
          </button>

        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-[#030e1c] p-1 rounded-2xl border border-cyan-500/20 text-xs">
          <span className="text-[10px] font-extrabold text-slate-400 px-2">Período:</span>
          {(['7d', '30d', 'campaign'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === '7d' ? '7 Días' : tf === '30d' ? '30 Días' : 'Campaña Total'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW 360 DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AREA CHART: CRECIMIENTO ELECTORAL HISTÓRICO VS METAS */}
            <div className="lg:col-span-7 bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Crecimiento Electoral Histórico vs Metas Planteadas
                  </h3>
                  <p className="text-xs text-slate-400">Trayectoria mensual de votos firmes e identificados hacia el objetivo de 85,000</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                  73.4% de la Meta
                </span>
              </div>

              {/* Recharts AreaChart */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorFirmes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorIdentificados" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="mes" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip content={<CustomChartTooltip unit="Votos" />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="metaVotos" name="Meta Planeada" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorMeta)" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="votosFirmes" name="Votos Firmes Confirmados" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorFirmes)" />
                    <Area type="monotone" dataKey="votosIdentificados" name="Total Identificados" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorIdentificados)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-[#030e1c] rounded-2xl border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Conclusión IA:</strong> La curva de votos firmes (verde) supera el hito previsto para Mayo en 2.4 puntos porcentuales. Se requiere acelerar conversión en junio para asegurar el triunfo.
                </p>
              </div>
            </div>

            {/* RADAR CHART: CANDIDATE IMAGE ATTRIBUTES VS RIVAL */}
            <div className="lg:col-span-5 bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  Percepción de Atributos de Imagen
                </h3>
                <p className="text-xs text-slate-400">Comparativa Santiago Pérez vs Rival Puntero</p>
              </div>

              {/* Recharts RadarChart */}
              <div className="h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={candidateAttributesData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="atributo" tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Santiago Pérez (Nuestro)" dataKey="SantiagoPerez" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                    <Radar name="Carlos Rendón (Rival)" dataKey="CarlosRendon" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Tooltip content={<CustomChartTooltip unit="Pts" />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-[#030e1c] rounded-2xl border border-indigo-500/20 text-[11px] text-slate-300">
                <span className="text-indigo-300 font-bold block">💡 Ventaja Clave:</span>
                Honestidad (+36 pts) e Independencia Política (+44 pts) son las principales fortalezas frente al rival puntero.
              </div>
            </div>

          </div>

          {/* SECOND ROW: POLLS TREND & CNE EXPENSES CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LINE CHART: INTENCIÓN DE VOTO HISTÓRICA */}
            <div className="lg:col-span-7 bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    Evolución de Encuestas de Intención de Voto (%)
                  </h3>
                  <p className="text-xs text-slate-400">Tracking mensual de candidatos principales en Medellín</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-3 py-1 rounded-full border border-amber-500/30">
                  Brecha reducida a 4.0%
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pollTrackingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="mes" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 40]} />
                    <Tooltip content={<CustomChartTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="santiagoPerez" name="Santiago Pérez (Nuestro)" stroke="#34d399" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="carlosRendon" name="Carlos Rendón (Rival Puntero)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="elenaRestrepo" name="Elena Restrepo" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="indecisos" name="Indecisos / Voto Blanco" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART: EJECUCIÓN PRESUPUESTAL POR RUBRO */}
            <div className="lg:col-span-5 bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-cyan-500/20 pb-3">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-purple-400" />
                  Distribución del Gasto de Campaña CNE
                </h3>
                <p className="text-xs text-slate-400">Total ejecutado a la fecha: $1,420M COP</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip unit="M COP" />} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} layout="horizontal" align="center" verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* AI HIGHLIGHT BANNER */}
          <div className="bg-gradient-to-r from-indigo-950 via-[#05162a] to-purple-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-400/30">
                  <Sparkles className="w-6 h-6 text-indigo-300 animate-spin" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Recomendación Estratégica Esencial de la Semana</h3>
                  <p className="text-xs text-indigo-200/80">Generada por el motor de IA con base en análisis cuantitativo</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('recommendations')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Ver las {recommendations.length} Recomendaciones</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#030e1c]/80 rounded-2xl border border-indigo-500/20 space-y-1.5">
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/30 rounded text-[10px] font-extrabold uppercase">
                  Acción Prioritaria #1
                </span>
                <h4 className="font-bold text-white text-sm">Cerrar Brecha en Comunas Periféricas</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Incrementar agenda territorial en Comunas 1 y 3. El candidato ganará hasta +4,500 votos si realiza 3 caminatas con el equipo juvenil esta semana.
                </p>
              </div>

              <div className="p-4 bg-[#030e1c]/80 rounded-2xl border border-indigo-500/20 space-y-1.5">
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-500/30 rounded text-[10px] font-extrabold uppercase">
                  Acción Prioritaria #2
                </span>
                <h4 className="font-bold text-white text-sm">Completar Padrón de Testigos Electorales</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Acreditar los 300 testigos faltantes antes del plazo límite de la Registraduría para proteger la votación en mesas alejadas.
                </p>
              </div>

              <div className="p-4 bg-[#030e1c]/80 rounded-2xl border border-indigo-500/20 space-y-1.5">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-extrabold uppercase">
                  Acción Prioritaria #3
                </span>
                <h4 className="font-bold text-white text-sm">Pauta Digital Segmentada para Jóvenes</h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Lanzar videos cortos sobre innovación y primer empleo. Potencial de captar el 18% de votantes jóvenes indecisos.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: CRECIMIENTO ELECTORAL & ENCUESTAS DE PERCEPCIÓN */}
      {activeTab === 'growth_polls' && (
        <div className="space-y-6">
          
          {/* SECTION A: CRECIMIENTO HISTÓRICO FULL CHART */}
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Comparativa Histórica de Crecimiento Electoral vs Metas Planteadas
                </h3>
                <p className="text-xs text-slate-400">
                  Seguimiento de consecución de Votos Firmes (Líderes) y Total Identificados frente al Plan Operativo
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
                Meta Final: 85,000 Votos
              </span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <Tooltip content={<CustomChartTooltip unit="Votos" />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="votosFirmes" name="Votos Firmes Confirmados" fill="#34d399" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line type="monotone" dataKey="metaVotos" name="Meta Planeada" stroke="#38bdf8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6 }} />
                  <Line type="monotone" dataKey="votosIdentificados" name="Votos Identificados Totales" stroke="#a78bfa" strokeWidth={3} dot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION B: ENCUESTAS Y SONDEOS DE PERCEPCIÓN CIUDADANA */}
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-cyan-500/20 pb-3">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Sondeos de Percepción Ciudadana por Temática Priority
              </h3>
              <p className="text-xs text-slate-400">
                Nivel de preocupación de la ciudadanía, evaluación de la gestión municipal actual y resonancia de la propuesta del candidato
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={citizenPerceptionData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="aspecto" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                  <Bar dataKey="preocupacion" name="% Preocupación Ciudadana" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evaluacionGestionPositiva" name="% Evaluación Gestión Actual (Positiva)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resonanciaPropuesta" name="% Resonancia Propuesta Candidato" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="p-3 bg-[#030e1c] rounded-2xl border border-rose-500/20 space-y-1">
                <strong className="text-rose-400 block font-bold">🔴 Principal Inconformidad:</strong>
                <p className="text-slate-300 text-[11px]">
                  Seguridad (78%) y Transparencia (71%) presentan la menor satisfacción con la administración actual.
                </p>
              </div>

              <div className="p-3 bg-[#030e1c] rounded-2xl border border-cyan-500/20 space-y-1">
                <strong className="text-cyan-300 block font-bold">🔵 Mayor Resonancia de Santiago Pérez:</strong>
                <p className="text-slate-300 text-[11px]">
                  La propuesta anti-corrupción (88%) y educación/empleo juvenil (85%) generan la más alta adhesión.
                </p>
              </div>

              <div className="p-3 bg-[#030e1c] rounded-2xl border border-emerald-500/20 space-y-1">
                <strong className="text-emerald-400 block font-bold">🟢 Oportunidad Estratégica:</strong>
                <p className="text-slate-300 text-[11px]">
                  Posicionar la propuesta de movilidad limpia en el corredor del Metro para captar el 26% indeciso.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: DATOS ELECTORALES & TESTIGOS DE MESA */}
      {activeTab === 'electoral_territorial' && (
        <div className="space-y-6">
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  Aspectos Electorales: Cobertura de Testigos por Comuna (Día E)
                </h3>
                <p className="text-xs text-slate-400">
                  Acreditación de jurados y testigos para blindaje de mesas y escrutinio E-14
                </p>
              </div>
              <span className="text-xs text-slate-300 bg-[#030e1c] px-3 py-1 rounded-xl border border-cyan-500/30 font-mono">
                1,840 de 2,140 Mesas Cubiertas (86%)
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={electoralWitnessesData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="comuna" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit="Mesas/Testigos" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="mesas" name="Total Mesas de Votación" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="testigosAcreditados" name="Testigos Acreditados" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {electoralWitnessesData.map((d, i) => (
                <div key={i} className="p-3 bg-[#030e1c] rounded-2xl border border-cyan-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-white block">{d.comuna}</span>
                    <span className="text-[10px] text-slate-400">{d.testigosAcreditados} de {d.mesas} mesas cubiertas</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-extrabold text-sm ${d.porcentaje >= 90 ? 'text-emerald-400' : d.porcentaje >= 80 ? 'text-cyan-300' : 'text-rose-400'}`}>
                      {d.porcentaje}%
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Blindaje</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FINANZAS CNE & ASPECTOS ADMINISTRATIVOS */}
      {activeTab === 'admin_finance' && (
        <div className="space-y-6">
          <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  Aspectos Administrativos: Ejecución Presupuestal CNE por Rubro
                </h3>
                <p className="text-xs text-slate-400">
                  Comparativa de Presupuesto Asignado vs Ejecutado Real vs Soportado en Factura Electrónica (Cuentas Claras)
                </p>
              </div>
              <span className="text-xs text-slate-300 bg-[#030e1c] px-3 py-1 rounded-xl border border-purple-500/30 font-mono">
                Valores en Millones COP
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialAdminData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="rubro" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip unit="M COP" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="asignado" name="Presupuesto Asignado" fill="#64748B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ejecutado" name="Ejecutado Real" fill="#c084fc" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="facturadoCNE" name="Legalizado Factura CNE" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-[#030e1c] rounded-2xl border border-purple-500/30 text-xs text-slate-300 space-y-2">
              <strong className="text-purple-300 block font-extrabold">📋 Estado de Cumplimiento Administrativo & CNE:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-bold">Techo Máximo CNE:</span>
                  <span className="text-white font-mono font-extrabold text-sm">$2,500,000,000 COP</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-bold">Total Ejecutado:</span>
                  <span className="text-purple-300 font-mono font-extrabold text-sm">$1,420,000,000 COP (56.8%)</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-bold">Pendiente Legalizar CNE:</span>
                  <span className="text-amber-400 font-mono font-extrabold text-sm">$175,000,000 COP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: AI RECOMMENDATIONS CENTER */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#05162a] border border-indigo-500/40 p-6 rounded-3xl shadow-2xl">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                Recomendaciones Esenciales IA para Mejoras de Campaña
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Sugerencias estratégicas accionables derivadas del análisis matricial de datos electorales, encuestas y presupuestos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Recomendación Manual</span>
              </button>
            </div>
          </div>

          {/* RECOMMENDATIONS STATUS COUNTERS */}
          <div className="flex items-center gap-3 text-xs font-bold border-b border-indigo-500/20 pb-2">
            <span className="text-slate-400 font-extrabold text-[11px] uppercase">Resumen de Recomendaciones:</span>
            <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full">
              {pendingCount} Pendientes
            </span>
            <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full">
              {inProgressCount} En Proceso
            </span>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full">
              {doneCount} Implementadas
            </span>
          </div>

          {/* LIST OF RECOMMENDATIONS */}
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl hover:border-cyan-400/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-cyan-500/20 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        rec.priority === 'Crítica' ? 'bg-rose-950 text-rose-300 border-rose-500/50' :
                        rec.priority === 'Alta' ? 'bg-amber-950 text-amber-300 border-amber-500/50' :
                        'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                      }`}>
                        Prioridad {rec.priority}
                      </span>

                      <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold">
                        Categoría: {rec.category}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {rec.createdDate}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white">{rec.title}</h4>
                  </div>

                  {/* STATUS SWITCHER */}
                  <div className="flex items-center gap-1.5 bg-[#030e1c] p-1 rounded-xl border border-cyan-500/30 shrink-0">
                    {(['Pendiente', 'En Proceso', 'Implementada'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(rec.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          rec.status === st
                            ? st === 'Implementada'
                              ? 'bg-emerald-600 text-white shadow'
                              : st === 'En Proceso'
                              ? 'bg-cyan-600 text-white shadow'
                              : 'bg-amber-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[#030e1c] rounded-2xl border border-cyan-500/20 space-y-1">
                    <strong className="text-cyan-300 font-extrabold block">📌 Diagnóstico del Problema:</strong>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{rec.description}</p>
                  </div>

                  <div className="p-3.5 bg-[#030e1c] rounded-2xl border border-indigo-500/20 space-y-1">
                    <strong className="text-indigo-300 font-extrabold block">⚡ Acción Requerida:</strong>
                    <p className="text-slate-200 leading-relaxed text-[11px]">{rec.actionRequired}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-cyan-500/10 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Asignado a: <strong className="text-slate-200">{rec.assignedTeam}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono font-extrabold">Impacto Estimado: {rec.estimatedImpact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* MODAL: ADD RECOMMENDATION MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-indigo-500/20 pb-3">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Agregar Recomendación Estratégica
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título de la Recomendación *</label>
                <input
                  type="text"
                  placeholder="Ej: Reforzar presencia en Comuna 8 durante fines de semana"
                  value={newRec.title}
                  onChange={e => setNewRec({ ...newRec, title: e.target.value })}
                  className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={newRec.category}
                    onChange={e => setNewRec({ ...newRec, category: e.target.value as any })}
                    className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Territorial">Territorial</option>
                    <option value="Digital & Mensaje">Digital & Mensaje</option>
                    <option value="Día E & Testigos">Día E & Testigos</option>
                    <option value="Finanzas & CNE">Finanzas & CNE</option>
                    <option value="Estrategia General">Estrategia General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prioridad</label>
                  <select
                    value={newRec.priority}
                    onChange={e => setNewRec({ ...newRec, priority: e.target.value as any })}
                    className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Diagnóstico / Descripción *</label>
                <textarea
                  rows={2}
                  placeholder="Describa el problema o hallazgo detectado en los datos..."
                  value={newRec.description}
                  onChange={e => setNewRec({ ...newRec, description: e.target.value })}
                  className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Acción Requerida</label>
                <textarea
                  rows={2}
                  placeholder="Instrucción concreta para el equipo responsable..."
                  value={newRec.actionRequired}
                  onChange={e => setNewRec({ ...newRec, actionRequired: e.target.value })}
                  className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipo Asignado</label>
                  <input
                    type="text"
                    placeholder="Ej: Operaciones Territoriales"
                    value={newRec.assignedTeam}
                    onChange={e => setNewRec({ ...newRec, assignedTeam: e.target.value })}
                    className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Impacto Estimado</label>
                  <input
                    type="text"
                    placeholder="Ej: +2,000 Votos"
                    value={newRec.estimatedImpact}
                    onChange={e => setNewRec({ ...newRec, estimatedImpact: e.target.value })}
                    className="w-full bg-[#030e1c] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-indigo-500/20">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRecommendation}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-extrabold cursor-pointer"
              >
                Guardar Recomendación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
