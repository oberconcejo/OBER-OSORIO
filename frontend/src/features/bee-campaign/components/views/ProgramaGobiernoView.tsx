import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  FileText, 
  Target, 
  DollarSign, 
  Layers, 
  Activity, 
  Award, 
  AlertCircle, 
  Download, 
  Share2, 
  Building2, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Zap,
  Copy,
  Printer,
  RefreshCw,
  X
} from 'lucide-react';

export interface CandidateProfileProps {
  fullName: string;
  politicalName: string;
  cedula: string;
  candidateOffice: string;
  territory: string;
  partyAlliance: string;
  slogan: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  professionalSummary?: string;
  candidateBio?: string;
  dofaStrengths?: string;
  dofaWeaknesses?: string;
  dofaOpportunities?: string;
  dofaThreats?: string;
}

export interface SectorDiagnosticProps {
  id: string;
  category: string;
  iconEmoji: string;
  surveyPriorityPercent: number;
  problemSummary: string;
  programmaticSolution: string;
  variables: {
    id: string;
    name: string;
    status: 'Crítico' | 'Regular' | 'Bueno';
    score: number;
    pollPerception: string;
    indicador?: string;
    lineaBase?: string;
    meta?: string;
  }[];
}

export interface TerritorialNeedProps {
  id: string;
  comunaSector: string;
  category: 'Seguridad' | 'Infraestructura' | 'Empleo' | 'Salud' | 'Educación' | 'Medio Ambiente';
  problemDescription: string;
  impactLevel: 'Alto' | 'Crítico' | 'Medio';
  programmaticProposal: string;
}

export interface ProgramaGobiernoViewProps {
  candidateProfile?: CandidateProfileProps;
  sectorDiagnostics?: SectorDiagnosticProps[];
  territorialNeeds?: TerritorialNeedProps[];
  onUpdateCandidateProfile?: (updated: CandidateProfileProps) => void;
}

export interface EjeEstrategico {
  id: string;
  numero: number;
  titulo: string;
  icono: string;
  color: string;
  diagnostico: string;
  objetivoGeneral: string;
  propuestas: {
    id: string;
    nombre: string;
    descripcion: string;
    indicador: string;
    lineaBase: string;
    meta2030: string;
    presupuestoEstimado: string;
    prioridad: 'Alta' | 'Media' | 'Urgente';
  }[];
}

export const ProgramaGobiernoView: React.FC<ProgramaGobiernoViewProps> = ({
  candidateProfile,
  sectorDiagnostics,
  territorialNeeds,
  onUpdateCandidateProfile
}) => {
  // General Header Metadata
  const [programMeta, setProgramMeta] = useState({
    titulo: candidateProfile?.candidateOffice ? `Programa de Gobierno 2026 - 2030 (${candidateProfile.candidateOffice})` : 'Programa de Gobierno 2026 - 2030',
    subtitulo: candidateProfile?.slogan || 'Unidos por el Progreso, la Seguridad y la Innovación Territorial',
    candidato: candidateProfile?.fullName || 'Santiago Pérez Ospina',
    partidoCoaliccion: candidateProfile?.partyAlliance || 'Coalición Medellín Ganadora (ASI - Movimiento Independiente)',
    municipioDepartamento: candidateProfile?.territory || 'Medellín, Antioquia',
    estadoRadicacion: 'En Elaboración' as 'En Elaboración' | 'En Revisión Jurídica' | 'Aprobado para CNE' | 'Radicado Oficial',
    fechaLimiteRadicacion: '15 de Octubre de 2026',
    resenaHistorica: candidateProfile?.candidateBio || candidateProfile?.professionalSummary || 'Fundada como un centro clave de desarrollo económico, industrial y cultural en el valle interandino, la entidad territorial ha transitado por profundas transformaciones sociales y urbanas. Hoy se posiciona como un distrito de ciencia, tecnología e innovación, cuya resiliencia comunitaria demanda un liderazgo estratégico con visión de futuro e integración regional.',
    resumenDiagnostico: 'El análisis territorial integral evidencia una reactivación económica sostenida pero heterogénea, con brechas persistentes en la empleabilidad juvenil (24%) e informalidad laboral (48%). En materia de seguridad ciudadana, se identifican retos por presencia de microtráfico y extorsión en comunas periféricas. Adicionalmente, el 62% de la malla vial secundaria requiere intervención. El presente programa de gobierno articula respuestas cuantitativas y viables para cerrar las brechas identificadas.'
  });

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ ...programMeta });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Helper to generate dynamic diagnostic summary from live props
  const generateDiagnosticSummary = () => {
    let summary = '';
    if (sectorDiagnostics && sectorDiagnostics.length > 0) {
      const topPriorities = sectorDiagnostics.map(s => `${s.category} (${s.surveyPriorityPercent}% prioridad)`).join(', ');
      summary += `El Diagnóstico 360° territorial identifica como áreas de atención prioritaria para la ciudadanía: ${topPriorities}. `;
    }
    if (territorialNeeds && territorialNeeds.length > 0) {
      const criticalCount = territorialNeeds.filter(n => n.impactLevel === 'Crítico' || n.impactLevel === 'Alto').length;
      summary += `En la escala comunal, se han consolidado ${territorialNeeds.length} necesidades focalizadas (${criticalCount} críticas/altas) en movilidad, seguridad e infraestructura social. `;
    }
    if (candidateProfile?.dofaStrengths) {
      summary += `El programa articula estas soluciones aprovechando las fortalezas del candidato: ${candidateProfile.dofaStrengths}`;
    }
    return summary || programMeta.resumenDiagnostico;
  };

  // Helper to map live sector diagnostics to Ejes Estratégicos
  const mapDiagnosticsToEjes = (): EjeEstrategico[] => {
    if (!sectorDiagnostics || sectorDiagnostics.length === 0) return ejes;

    const gradients = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-purple-600 to-pink-700',
      'from-cyan-600 to-teal-700',
      'from-cyan-600 to-blue-700',
      'from-rose-600 to-red-700'
    ];

    return sectorDiagnostics.map((sec, idx) => {
      const matchingNeeds = territorialNeeds?.filter(tn => tn.category.toLowerCase().includes(sec.category.toLowerCase())) || [];

      const varProps = sec.variables.map((v, vIdx) => ({
        id: `prop-var-${sec.id}-${vIdx}`,
        nombre: v.indicador ? `Programa: ${v.indicador}` : `Intervención Sectorial ${v.name}`,
        descripcion: `${v.pollPerception}. Propuesta: ${sec.programmaticSolution}`,
        indicador: v.indicador || v.name,
        lineaBase: v.lineaBase || '35%',
        meta2030: v.meta || '85%',
        presupuestoEstimado: `$ ${(12500 + vIdx * 3500).toLocaleString('es-CO')} Millones COP`,
        prioridad: (v.status === 'Crítico' ? 'Urgente' : 'Alta') as 'Alta' | 'Media' | 'Urgente'
      }));

      const needProps = matchingNeeds.map((tn, tnIdx) => ({
        id: `prop-need-${tn.id}`,
        nombre: `Plan Comunal ${tn.comunaSector}`,
        descripcion: `${tn.problemDescription} -> Solución: ${tn.programmaticProposal}`,
        indicador: `Proyectos Ejecutados en ${tn.comunaSector}`,
        lineaBase: '0%',
        meta2030: '100%',
        presupuestoEstimado: `$ ${(3200 + tnIdx * 1100).toLocaleString('es-CO')} Millones COP`,
        prioridad: (tn.impactLevel === 'Crítico' ? 'Urgente' : tn.impactLevel === 'Alto' ? 'Alta' : 'Media') as 'Alta' | 'Media' | 'Urgente'
      }));

      return {
        id: `eje-sync-${sec.id}`,
        numero: idx + 1,
        titulo: `${sec.category} y Desarrollo Territorial`,
        icono: sec.iconEmoji || '🎯',
        color: gradients[idx % gradients.length],
        diagnostico: sec.problemSummary,
        objetivoGeneral: sec.programmaticSolution,
        propuestas: [...varProps, ...needProps]
      };
    });
  };

  const handleSyncWithStrategicManagement = () => {
    if (candidateProfile) {
      setProgramMeta(prev => ({
        ...prev,
        candidato: candidateProfile.fullName || prev.candidato,
        partidoCoaliccion: candidateProfile.partyAlliance || prev.partidoCoaliccion,
        municipioDepartamento: candidateProfile.territory || prev.municipioDepartamento,
        subtitulo: candidateProfile.slogan || prev.subtitulo,
        titulo: candidateProfile.candidateOffice ? `Programa de Gobierno 2026 - 2030 (${candidateProfile.candidateOffice})` : prev.titulo,
        resenaHistorica: candidateProfile.candidateBio || candidateProfile.professionalSummary || prev.resenaHistorica,
        resumenDiagnostico: generateDiagnosticSummary()
      }));
    }

    if (sectorDiagnostics && sectorDiagnostics.length > 0) {
      setEjes(mapDiagnosticsToEjes());
    }

    setLastSyncTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
  };

  // Sync automatically when candidateProfile or diagnostics change
  useEffect(() => {
    if (candidateProfile || sectorDiagnostics) {
      handleSyncWithStrategicManagement();
    }
  }, [candidateProfile, sectorDiagnostics, territorialNeeds]);

  // Sub-tabs within Programa de Gobierno
  const [activeSubTab, setActiveSubTab] = useState<'ejes' | 'asistente_ai' | 'voto_programatico' | 'vista_previa'>('ejes');

  // Ejes Estratégicos State
  const [ejes, setEjes] = useState<EjeEstrategico[]>([
    {
      id: 'eje-1',
      numero: 1,
      titulo: 'Seguridad Integral, Convivencia y Paz Territorial',
      icono: '🛡️',
      color: 'from-blue-600 to-indigo-700',
      diagnostico: 'Alta percepción de inseguridad en comunas periféricas y presencia de microtráfico y extorsión a pequeños comerciantes.',
      objetivoGeneral: 'Garantizar la tranquilidad ciudadana mediante tecnología avanzada de vigilancia, fortalecimiento de la fuerza pública y prevención comunitaria.',
      propuestas: [
        {
          id: 'prop-1-1',
          nombre: 'Centro Inteligente de Monitoreo con Inteligencia Artificial (C4-AI)',
          descripcion: 'Instalación de 1,200 cámaras con reconocimiento facial y sensores LPR en puntos críticos de alto impacto.',
          indicador: 'Tasa de Homicidios por 100 mil hab.',
          lineaBase: '18.4 x 100k hab.',
          meta2030: '8.5 x 100k hab.',
          presupuestoEstimado: '$ 45,000 Millones COP',
          prioridad: 'Urgente'
        },
        {
          id: 'prop-1-2',
          nombre: 'Red Comunitaria de Alertas Tempranas y Frentes de Seguridad',
          descripcion: 'Articulación de 300 frentes de seguridad ciudadana conectados directamente con patrullas de cuadrante digital.',
          indicador: 'Tiempo de respuesta policial',
          lineaBase: '18 minutos',
          meta2030: '5 minutos',
          presupuestoEstimado: '$ 8,200 Millones COP',
          prioridad: 'Alta'
        }
      ]
    },
    {
      id: 'eje-2',
      numero: 2,
      titulo: 'Desarrollo Económico, Empleo Joven e Innovación',
      icono: '🚀',
      color: 'from-emerald-600 to-teal-700',
      diagnostico: 'Tasa de desempleo juvenil del 24% e informalidad laboral superior al 48% en sectores vulnerables.',
      objetivoGeneral: 'Impulsar el ecosistema de innovación, emprendimiento tecnológico e incentivos tributarios para la generación de empleo formal.',
      propuestas: [
        {
          id: 'prop-2-1',
          nombre: 'Fondo de Semilla e Incubación para Emprendedores Digitales',
          descripcion: 'Capital semilla condonable para 1,500 startups y microempresas lideradas por jóvenes y mujeres.',
          indicador: 'Nuevas Mipymes Formalizadas',
          lineaBase: '320 anuales',
          meta2030: '1,500 anuales',
          presupuestoEstimado: '$ 22,000 Millones COP',
          prioridad: 'Alta'
        },
        {
          id: 'prop-2-2',
          nombre: 'Distrito de Innovación y Becas de Formación en Tecnologías 4.0',
          descripcion: '10,000 becas en desarrollo de software, IA y ciberseguridad cofinanciadas con el sector privado.',
          indicador: 'Tasa de Empleabilidad Graduados TI',
          lineaBase: '38%',
          meta2030: '85%',
          presupuestoEstimado: '$ 30,000 Millones COP',
          prioridad: 'Urgente'
        }
      ]
    },
    {
      id: 'eje-3',
      numero: 3,
      titulo: 'Infraestructura Sostenible, Vías y Movilidad Humana',
      icono: '🏗️',
      color: 'from-cyan-600 to-teal-700',
      diagnostico: 'Deterioro severo del 62% de la malla vial secundaria y congestión crítica en corredores arteriales.',
      objetivoGeneral: 'Modernizar la infraestructura de transporte, priorizar el tránsito masivo limpio y pavimentación participativa comunitaria.',
      propuestas: [
        {
          id: 'prop-3-1',
          nombre: 'Plan Cero Huecos y Pavimentación Barrios Periféricos',
          descripcion: 'Intervención integral de 180 km de vías barriales y señalización fotoluminiscente inteligente.',
          indicador: 'Km de Vías Urbanas en Buen Estado',
          lineaBase: '38%',
          meta2030: '88%',
          presupuestoEstimado: '$ 65,000 Millones COP',
          prioridad: 'Urgente'
        }
      ]
    },
    {
      id: 'eje-4',
      numero: 4,
      titulo: 'Salud Oportuna, Educación de Calidad e Inclusión Social',
      icono: '🏥',
      color: 'from-purple-600 to-indigo-800',
      diagnostico: 'Repressed appointments in primary healthcare centres and aging educational infrastructure.',
      objetivoGeneral: 'Garantizar atención médica preventiva en casa y renovación total de la infraestructura escolar municipal.',
      propuestas: [
        {
          id: 'prop-4-1',
          nombre: 'Programa Salud a tu Barrio y Equipos Médicos Extramurales',
          descripcion: '50 brigadas médicas itinerantes con atención especializada en medicina general, odontología y salud mental.',
          indicador: 'Citas Médicas Asignadas < 48 horas',
          lineaBase: '15%',
          meta2030: '90%',
          presupuestoEstimado: '$ 28,000 Millones COP',
          prioridad: 'Alta'
        }
      ]
    }
  ]);

  // Selected Eje for editing/viewing proposals
  const [selectedEjeId, setSelectedEjeId] = useState<string>(ejes[0]?.id || '');
  const activeEje = ejes.find(e => e.id === selectedEjeId) || ejes[0];

  // Modals state for Adding/Editing Eje and Proposal
  const [showAddEjeModal, setShowAddEjeModal] = useState(false);
  const [newEjeForm, setNewEjeForm] = useState({
    titulo: '',
    icono: '🎯',
    color: 'from-cyan-600 to-blue-700',
    diagnostico: '',
    objetivoGeneral: ''
  });

  const [showAddPropuestaModal, setShowAddPropuestaModal] = useState(false);
  const [newPropuestaForm, setNewPropuestaForm] = useState({
    nombre: '',
    descripcion: '',
    indicador: '',
    lineaBase: '',
    meta2030: '',
    presupuestoEstimado: '',
    prioridad: 'Alta' as 'Alta' | 'Media' | 'Urgente'
  });

  // AI Assistant Draft State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);

  // Legal Compliance Checklist
  const [checklist, setChecklist] = useState([
    { id: 'chk-1', label: 'Cumplimiento de la Ley de Voto Programático (Ley 131/741)', completed: true, note: 'Incluye diagnóstico, objetivos cuantitativos y estrategias financieras.' },
    { id: 'chk-2', label: 'Alineación con Objetivos de Desarrollo Sostenible (ODS 2030)', completed: true, note: 'Vinculado a ODS 8 (Trabajo Decente), ODS 11 (Ciudades Sostenibles) y ODS 16 (Paz y Justicia).' },
    { id: 'chk-3', label: 'Matriz Plurianual de Inversiones (Viabilidad Financiera)', completed: false, note: 'Falta estimación detallada de fuentes del Sistema General de Participaciones (SGP).' },
    { id: 'chk-4', label: 'Diagnóstico Territorial con Perspectiva de Género e Inclusión', completed: true, note: 'Incopora metas específicas para la mujer y comunidades vulnerables.' },
    { id: 'chk-5', label: 'Revisión por el Comité Jurídico Político', completed: false, note: 'Pendiente sesión de aprobación definitiva antes del cierre de inscripción.' }
  ]);

  // Handler: Add Eje
  const handleAddEje = () => {
    if (!newEjeForm.titulo.trim()) return;
    const newId = 'eje-' + Date.now();
    const newNum = ejes.length + 1;
    const newEjeItem: EjeEstrategico = {
      id: newId,
      numero: newNum,
      titulo: newEjeForm.titulo.trim(),
      icono: newEjeForm.icono,
      color: newEjeForm.color,
      diagnostico: newEjeForm.diagnostico.trim() || 'Diagnóstico preliminar en consolidación.',
      objetivoGeneral: newEjeForm.objetivoGeneral.trim() || 'Objetivo estratégico general del eje.',
      propuestas: []
    };
    setEjes(prev => [...prev, newEjeItem]);
    setSelectedEjeId(newId);
    setShowAddEjeModal(false);
    setNewEjeForm({
      titulo: '',
      icono: '🎯',
      color: 'from-cyan-600 to-blue-700',
      diagnostico: '',
      objetivoGeneral: ''
    });
  };

  // Handler: Remove Eje
  const handleRemoveEje = (ejeId: string) => {
    if (ejes.length <= 1) return;
    const updated = ejes.filter(e => e.id !== ejeId);
    setEjes(updated);
    if (selectedEjeId === ejeId) {
      setSelectedEjeId(updated[0].id);
    }
  };

  // Handler: Add Propuesta to Active Eje
  const handleAddPropuesta = () => {
    if (!newPropuestaForm.nombre.trim() || !activeEje) return;
    const newProp = {
      id: 'prop-' + Date.now(),
      nombre: newPropuestaForm.nombre.trim(),
      descripcion: newPropuestaForm.descripcion.trim() || 'Descripción de la propuesta estratégica.',
      indicador: newPropuestaForm.indicador.trim() || 'Indicador sin definir',
      lineaBase: newPropuestaForm.lineaBase.trim() || 'N/A',
      meta2030: newPropuestaForm.meta2030.trim() || 'N/A',
      presupuestoEstimado: newPropuestaForm.presupuestoEstimado.trim() || 'Por definir',
      prioridad: newPropuestaForm.prioridad
    };

    setEjes(prev => prev.map(e => {
      if (e.id !== activeEje.id) return e;
      return {
        ...e,
        propuestas: [...e.propuestas, newProp]
      };
    }));

    setShowAddPropuestaModal(false);
    setNewPropuestaForm({
      nombre: '',
      descripcion: '',
      indicador: '',
      lineaBase: '',
      meta2030: '',
      presupuestoEstimado: '',
      prioridad: 'Alta'
    });
  };

  // Handler: Remove Propuesta
  const handleRemovePropuesta = (ejeId: string, propId: string) => {
    setEjes(prev => prev.map(e => {
      if (e.id !== ejeId) return e;
      return {
        ...e,
        propuestas: e.propuestas.filter(p => p.id !== propId)
      };
    }));
  };

  // AI Assistant Generator simulation
  const handleGenerateAiProposal = () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      setGeneratedDraft(`### BORRADOR SUGERIDO POR IA DE PROGRAMA DE GOBIERNO
**Línea Estratégica:** ${aiPrompt}

**1. DIAGNÓSTICO ESTRATÉGICO SECTORIAL:**
Según los datos consolidados del diagnóstico 360° y las encuestas de percepción territorial, la problemática prioritaria identificada radica en la baja eficiencia de los servicios públicos y la limitada infraestructura en zonas de expansión urbana.

**2. OBJETIVO GENERAL PROGRAMÁTICO:**
Transformar la gestión del sector mediante inversiones sostenibles, digitalización de trámites y participación comunitaria transparente para reducir las brechas sociales en un 35% antes del final del periodo constitucional.

**3. PROPUESTAS CLAVE E INDICADORES DE CUMPLIMIENTO:**
- **Iniciativa 1:** Modernización tecnológica y optimización de redes locales. *(Línea Base: 22% -> Meta 2030: 85%)*
- **Iniciativa 2:** Alianza público-privada para el financiamiento de proyectos verdes de alto impacto. *(Presupuesto Estimado: $18,500 M COP)*
- **Iniciativa 3:** Escuela de liderazgo comunitario para el seguimiento ciudadano del gasto público.

**4. ALINEACIÓN CON EL VOTO PROGRAMÁTICO (LEY 131 DE 1994):**
Esta propuesta cumple con los requisitos formales de inscripciones ante la Registraduría Nacional y el CNE, estructurando metas medibles y presupuestadas.`);
      setIsAiGenerating(false);
    }, 1200);
  };

  // Total proposals count
  const totalPropuestasCount = ejes.reduce((acc, curr) => acc + curr.propuestas.length, 0);

  return (
    <div className="space-y-6">
      
      {/* BANNER SUPERIOR: CABECERA OFICIAL DE PROGRAMA DE GOBIERNO */}
      <div className="bg-gradient-to-r from-[#06182e] via-[#0b284c] to-[#041224] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#111C30]0/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
              {programMeta.titulo}
            </h3>
            <p className="text-xs text-cyan-200/90 font-medium">
              "{programMeta.subtitulo}"
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                setMetaForm({ ...programMeta });
                setIsEditingMeta(true);
              }}
              className="px-4 py-2.5 bg-[#111C30]0/20 hover:bg-[#111C30]0/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>Editar Datos Generales</span>
            </button>

            <button
              onClick={() => setActiveSubTab('vista_previa')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Vista Previa & Exportar Documento</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-cyan-500/20 text-xs">
          <div className="bg-[#031121]/80 border border-cyan-500/20 p-3 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-400 font-medium text-[10px] uppercase">Ejes Estratégicos</span>
            <div className="text-xl font-black text-cyan-300 mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              {ejes.length} Líneas
            </div>
          </div>

          <div className="bg-[#031121]/80 border border-emerald-500/20 p-3 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-400 font-medium text-[10px] uppercase">Propuestas Concretas</span>
            <div className="text-xl font-black text-emerald-300 mt-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              {totalPropuestasCount} Proyectos
            </div>
          </div>

          <div className="bg-[#031121]/80 border border-cyan-500/20 p-3 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-400 font-medium text-[10px] uppercase">Requisitos de Ley</span>
            <div className="text-xl font-black text-cyan-300 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              {checklist.filter(c => c.completed).length} / {checklist.length} OK
            </div>
          </div>

          <div className="bg-[#031121]/80 border border-purple-500/20 p-3 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-400 font-medium text-[10px] uppercase">Avance de Redacción</span>
            <div className="text-xl font-black text-purple-300 mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              82%
            </div>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN INTERNA */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cyan-500/20 pb-3">
        <button
          onClick={() => setActiveSubTab('ejes')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ejes'
              ? 'bg-[#111C30]0/20 text-cyan-300 border border-cyan-400/50 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Ejes Estratégicos & Propuestas ({ejes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('asistente_ai')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'asistente_ai'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Asistente AI de Redacción Programática</span>
        </button>

        <button
          onClick={() => setActiveSubTab('voto_programatico')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'voto_programatico'
              ? 'bg-[#111C30]0/20 text-emerald-300 border border-emerald-400/50 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Matriz de Voto Programático & Ley CNE</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vista_previa')}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'vista_previa'
              ? 'bg-[#111C30]0/20 text-purple-300 border border-purple-400/50 shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Vista Previa & Documento Final</span>
        </button>
      </div>

      {/* SUBTAB 1: EJES ESTRATÉGICOS Y PROPUESTAS */}
      {activeSubTab === 'ejes' && (
        <div className="space-y-6">
          {/* TARJETAS CONTEXTUALES: RESEÑA HISTÓRICA Y RESUMEN DIAGNÓSTICO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#05162a] border border-cyan-500/30 p-4 rounded-2xl space-y-2 relative shadow-lg">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" /> Reseña Histórica de la Entidad Territorial
                </span>
                <button
                  onClick={() => {
                    setMetaForm({ ...programMeta });
                    setIsEditingMeta(true);
                  }}
                  className="text-[10px] text-cyan-300 hover:text-white font-bold flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3 h-3" /> Editar Contexto
                </button>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {programMeta.resenaHistorica}
              </p>
            </div>

            <div className="bg-[#05162a] border border-emerald-500/30 p-4 rounded-2xl space-y-2 relative shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" /> Resumen del Diagnóstico Territorial
                </span>
                <button
                  onClick={() => {
                    setMetaForm({ ...programMeta });
                    setIsEditingMeta(true);
                  }}
                  className="text-[10px] text-emerald-300 hover:text-white font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3 h-3" /> Editar Diagnóstico
                </button>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {programMeta.resumenDiagnostico}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA IZQUIERDA: LISTA DE EJES (3/12) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Líneas Estratégicas
              </h4>
              <button
                onClick={() => setShowAddEjeModal(true)}
                className="px-2.5 py-1 bg-[#111C30]0/20 hover:bg-[#111C30]0/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Eje
              </button>
            </div>

            <div className="space-y-2.5">
              {ejes.map((eje) => {
                const isSelected = eje.id === activeEje?.id;
                return (
                  <div
                    key={eje.id}
                    onClick={() => setSelectedEjeId(eje.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0a2342] to-[#0d2e56] border-cyan-400/60 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/30'
                        : 'bg-[#05162a]/90 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-[#071c36]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1.5 rounded-xl bg-slate-900/80 border border-slate-700 shrink-0">
                          {eje.icono}
                        </span>
                        <div>
                          <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                            Eje #{eje.numero}
                          </span>
                          <h5 className="font-bold text-white text-xs leading-tight line-clamp-2">
                            {eje.titulo}
                          </h5>
                        </div>
                      </div>

                      {ejes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEje(eje.id);
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este eje"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-cyan-500/10 text-[10px] text-slate-400">
                      <span>{eje.propuestas.length} propuestas registradas</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA DERECHA: DETALLE DEL EJE SELECCIONADO Y SUS PROPUESTAS (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            {activeEje && (
              <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-5 space-y-5 shadow-xl">
                
                {/* Header del Eje */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-[#081f3d] rounded-2xl border border-cyan-500/30 shadow">
                      {activeEje.icono}
                    </span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                        Línea Programática #{activeEje.numero}
                      </div>
                      <h4 className="text-lg font-black text-white">
                        {activeEje.titulo}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddPropuestaModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Propuesta</span>
                  </button>
                </div>

                {/* Diagnóstico y Objetivo del Eje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#031121] p-3.5 rounded-2xl border border-rose-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Problema Diagnosticado
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeEje.diagnostico}
                    </p>
                  </div>

                  <div className="bg-[#031121] p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Objetivo General del Eje
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activeEje.objetivoGeneral}
                    </p>
                  </div>
                </div>

                {/* LISTA DE PROPUESTAS Y PROYECTOS DEL EJE */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      Proyectos y Propuestas Concretas ({activeEje.propuestas.length})
                    </h5>
                  </div>

                  {activeEje.propuestas.length === 0 ? (
                    <div className="text-center py-8 bg-[#031121] rounded-2xl border border-dashed border-cyan-500/20 text-slate-400 text-xs">
                      No se han agregado propuestas a esta línea estratégica aún.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeEje.propuestas.map((prop, idx) => (
                        <div
                          key={prop.id}
                          className="bg-[#031121] border border-cyan-500/25 rounded-2xl p-4 space-y-3 hover:border-cyan-400/50 transition-all shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#111C30]0/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-500/30">
                                  PROYECTO #{idx + 1}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                                  prop.prioridad === 'Urgente'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : prop.prioridad === 'Alta'
                                    ? 'bg-[#111C30]0/20 text-cyan-300 border-cyan-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                }`}>
                                  Prioridad {prop.prioridad}
                                </span>
                              </div>
                              <h6 className="font-black text-white text-sm">
                                {prop.nombre}
                              </h6>
                              <p className="text-slate-300 text-xs leading-relaxed">
                                {prop.descripcion}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRemovePropuesta(activeEje.id, prop.id)}
                              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Eliminar propuesta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* METRICAS DE LA PROPUESTA (INDICADOR, LÍNEA BASE, META, PRESUPUESTO) */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] pt-2 border-t border-cyan-500/15">
                            <div className="bg-[#010914] p-2 rounded-xl border border-cyan-500/20">
                              <span className="text-cyan-400 font-extrabold uppercase block">📊 Indicador de Impacto</span>
                              <span className="text-white font-bold truncate block mt-0.5">{prop.indicador}</span>
                            </div>

                            <div className="bg-[#010914] p-2 rounded-xl border border-cyan-500/20">
                              <span className="text-cyan-400 font-extrabold uppercase block">📍 Línea Base → Meta 2030</span>
                              <span className="text-cyan-200 font-black block mt-0.5">
                                {prop.lineaBase} 🎯 <span className="text-emerald-300">{prop.meta2030}</span>
                              </span>
                            </div>

                            <div className="bg-[#010914] p-2 rounded-xl border border-emerald-500/20">
                              <span className="text-emerald-400 font-extrabold uppercase block">💰 Presupuesto Estimado</span>
                              <span className="text-emerald-200 font-black block mt-0.5">{prop.presupuestoEstimado}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* SUBTAB 2: ASISTENTE AI DE REDACCIÓN */}
      {activeSubTab === 'asistente_ai' && (
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">
                Generador y Asistente AI de Contenido Programático
              </h4>
              <p className="text-xs text-slate-300">
                Redacta propuestas oficiales, diagnósticos sectoriales e iniciativas ajustadas a los requisitos del CNE y la ley de voto programático.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-200">
              Describe la propuesta o sector sobre el cual deseas generar borrador oficial:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Plan de seguridad nocturna para el sector comercial y gastro-bar de la comuna 11..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-[#031121] border border-cyan-500/40 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleGenerateAiProposal}
                disabled={isAiGenerating || !aiPrompt.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0 shadow-lg shadow-cyan-500/20"
              >
                {isAiGenerating ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-white" />
                    <span>Redactando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Proposal AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SUGGESTED PRESET PROMPTS */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="text-slate-400 font-medium">Sugerencias rápidas:</span>
            {[
              'Seguridad e Inteligencia Artificial en Comunas',
              'Fondo de Becas TI y Empleo Joven',
              'Salud Preventiva Domiciliaria para Adultos Mayores',
              'Sostenibilidad y Malla Vial Periférica'
            ].map((p) => (
              <button
                key={p}
                onClick={() => setAiPrompt(p)}
                className="px-2.5 py-1 bg-[#081d38] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg transition-all cursor-pointer"
              >
                + {p}
              </button>
            ))}
          </div>

          {/* GENERATED DRAFT PREVIEW */}
          {generatedDraft && (
            <div className="mt-4 p-5 bg-[#030d1a] border border-cyan-500/40 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Borrador Redactado Exitosamente
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedDraft)}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Texto
                </button>
              </div>

              <div className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto custom-scrollbar p-3 bg-[#010812] rounded-xl border border-slate-800">
                {generatedDraft}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: VOTO PROGRAMÁTICO & CUMPLIMIENTO LEY CNE */}
      {activeSubTab === 'voto_programatico' && (
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#111C30]0/20 border border-emerald-400/40 text-emerald-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  Matriz de Voto Programático (Ley 131 de 1994 / CNE)
                </h4>
                <p className="text-xs text-slate-300">
                  Verificación de requisitos legales para la validez de la inscripción del Programa de Gobierno.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-[#111C30]0/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl">
              {checklist.filter(c => c.completed).length} / {checklist.length} Criterios Aprobados
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, completed: !c.completed } : c))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  item.completed
                    ? 'bg-[#031d16]/80 border-emerald-500/40 text-emerald-100'
                    : 'bg-[#031121]/80 border-cyan-500/30 text-slate-300'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-lg shrink-0 border ${
                  item.completed
                    ? 'bg-[#111C30]0 text-white border-emerald-400'
                    : 'bg-transparent border-slate-600 text-transparent'
                }`}>
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-white">
                    {item.label}
                  </h5>
                  <p className="text-xs text-slate-300">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: VISTA PREVIA & EXPORTACIÓN DOCUMENTO */}
      {activeSubTab === 'vista_previa' && (
        <div className="bg-[#05162a] border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
            <div>
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Vista Previa del Documento Oficial
              </h4>
              <p className="text-xs text-slate-300">
                Estructura consolidada lista para firma, impresión y radicación formal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>

              <button
                onClick={() => alert("Generando PDF Oficial del Programa de Gobierno...")}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar PDF Oficial
              </button>
            </div>
          </div>

          {/* OFFICIAL DOCUMENT CANVAS SIMULATION */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-cyan-500/30 max-w-4xl mx-auto space-y-6 text-slate-200 shadow-2xl font-serif">
            
            {/* Header / Cover Title */}
            <div className="text-center space-y-2 border-b border-cyan-500/30 pb-6 font-sans">
              <div className="inline-block px-3 py-1 bg-[#111C30]0/20 text-cyan-300 rounded-full font-bold text-[10px] uppercase tracking-widest border border-cyan-500/40">
                REPÚBLICA DE COLOMBIA • PROGRAMA DE GOBIERNO REGISTRADO
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {programMeta.titulo}
              </h2>
              <p className="text-sm text-cyan-200 italic">
                "{programMeta.subtitulo}"
              </p>
              <div className="text-xs text-slate-400 pt-2 font-mono">
                {programMeta.partidoCoaliccion} | {programMeta.municipioDepartamento} | Periodo 2026 - 2030
              </div>
            </div>

            {/* I. RESEÑA HISTÓRICA DE LA ENTIDAD TERRITORIAL */}
            <div className="p-5 bg-[#031121] rounded-2xl border border-cyan-500/30 space-y-2 font-sans">
              <h4 className="font-black text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                I. RESEÑA HISTÓRICA DE LA ENTIDAD TERRITORIAL
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed text-justify">
                {programMeta.resenaHistorica}
              </p>
            </div>

            {/* II. RESUMEN EJECUTIVO DEL DIAGNÓSTICO TERRITORIAL */}
            <div className="p-5 bg-[#031121] rounded-2xl border border-emerald-500/30 space-y-2 font-sans">
              <h4 className="font-black text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                II. RESUMEN EJECUTIVO DEL DIAGNÓSTICO TERRITORIAL
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed text-justify">
                {programMeta.resumenDiagnostico}
              </p>
            </div>

            {/* III. EJES Y LÍNEAS ESTRATÉGICAS DE GOBIERNO */}
            <div className="space-y-6 font-sans">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <h4 className="font-black text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  III. EJES Y LÍNEAS ESTRATÉGICAS DE GOBIERNO
                </h4>
              </div>

              {ejes.map((eje) => (
                <div key={eje.id} className="p-4 bg-[#031121] rounded-2xl border border-cyan-500/20 space-y-3">
                  <h4 className="font-black text-cyan-300 text-sm flex items-center gap-2">
                    <span>{eje.icono}</span>
                    EJE #{eje.numero}: {eje.titulo.toUpperCase()}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Objetivo General:</strong> {eje.objetivoGeneral}
                  </p>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-cyan-300 uppercase block">Proyectos e Indicadores de Impacto:</span>
                    {eje.propuestas.map((p, idx) => (
                      <div key={p.id} className="p-2.5 bg-[#010812] rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-white">
                          {idx + 1}. {p.nombre}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {p.descripcion}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-mono flex flex-wrap gap-3 pt-1">
                          <span>Indicador: {p.indicador}</span>
                          <span>Línea Base: {p.lineaBase}</span>
                          <span>Meta 2030: {p.meta2030}</span>
                          <span>Presupuesto: {p.presupuestoEstimado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Signatures Footer */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center font-sans text-xs text-slate-400">
              <div className="border-t border-slate-600 pt-2">
                <strong>Firma del Candidato(a)</strong>
                <p className="text-[10px]">{programMeta.candidato}</p>
              </div>
              <div className="border-t border-slate-600 pt-2">
                <strong>Comité Político / Coalición</strong>
                <p className="text-[10px]">{programMeta.partidoCoaliccion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DATOS GENERALES DEL PROGRAMA */}
      {isEditingMeta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-cyan-500/40 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-xs shadow-2xl custom-scrollbar">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Editar Datos Generales, Reseña Histórica y Diagnóstico
              </h4>
              <button onClick={() => setIsEditingMeta(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título Oficial del Programa:</label>
                <input
                  type="text"
                  value={metaForm.titulo}
                  onChange={(e) => setMetaForm({ ...metaForm, titulo: e.target.value })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Slogan / Subtítulo:</label>
                <input
                  type="text"
                  value={metaForm.subtitulo}
                  onChange={(e) => setMetaForm({ ...metaForm, subtitulo: e.target.value })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Partido / Coalición:</label>
                  <input
                    type="text"
                    value={metaForm.partidoCoaliccion}
                    onChange={(e) => setMetaForm({ ...metaForm, partidoCoaliccion: e.target.value })}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Municipio / Depto:</label>
                  <input
                    type="text"
                    value={metaForm.municipioDepartamento}
                    onChange={(e) => setMetaForm({ ...metaForm, municipioDepartamento: e.target.value })}
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Estado de Radicación:</label>
                <select
                  value={metaForm.estadoRadicacion}
                  onChange={(e) => setMetaForm({ ...metaForm, estadoRadicacion: e.target.value as any })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                >
                  <option value="En Elaboración">En Elaboración</option>
                  <option value="En Revisión Jurídica">En Revisión Jurídica</option>
                  <option value="Aprobado para CNE">Aprobado para CNE</option>
                  <option value="Radicado Oficial">Radicado Oficial</option>
                </select>
              </div>

              <div className="pt-2 border-t border-cyan-500/20 space-y-3">
                <div>
                  <label className="block text-cyan-300 font-bold mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Reseña Histórica de la Entidad Territorial:
                  </label>
                  <textarea
                    value={metaForm.resenaHistorica}
                    onChange={(e) => setMetaForm({ ...metaForm, resenaHistorica: e.target.value })}
                    placeholder="Describa el contexto histórico, antecedentes y evolución territorial..."
                    className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400 h-24 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Resumen del Diagnóstico Territorial:
                  </label>
                  <textarea
                    value={metaForm.resumenDiagnostico}
                    onChange={(e) => setMetaForm({ ...metaForm, resumenDiagnostico: e.target.value })}
                    placeholder="Resuma las principales problemáticas, cifras clave e indicadores sectoriales..."
                    className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400 h-24 text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-cyan-500/20">
              <button
                onClick={() => setIsEditingMeta(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setProgramMeta({ ...metaForm });
                  if (onUpdateCandidateProfile && candidateProfile) {
                    onUpdateCandidateProfile({
                      ...candidateProfile,
                      fullName: metaForm.candidato,
                      partyAlliance: metaForm.partidoCoaliccion,
                      territory: metaForm.municipioDepartamento,
                      slogan: metaForm.subtitulo,
                      candidateBio: metaForm.resenaHistorica
                    });
                  }
                  setIsEditingMeta(false);
                }}
                className="flex-1 py-2 bg-[#111C30]0 hover:bg-amber-400 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR NUEVO EJE ESTRATÉGICO */}
      {showAddEjeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Crear Nuevo Eje Estratégico
              </h4>
              <button onClick={() => setShowAddEjeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título del Eje Estratégico:</label>
                <input
                  type="text"
                  placeholder="Ej: Medio Ambiente, Transparencia y Servicios Públicos"
                  value={newEjeForm.titulo}
                  onChange={(e) => setNewEjeForm({ ...newEjeForm, titulo: e.target.value })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Problema / Diagnóstico Sectorial:</label>
                <textarea
                  placeholder="Describa brevemente la situación actual observada..."
                  value={newEjeForm.diagnostico}
                  onChange={(e) => setNewEjeForm({ ...newEjeForm, diagnostico: e.target.value })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400 h-20"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Objetivo General:</label>
                <input
                  type="text"
                  placeholder="Ej: Lograr cobertura del 100% en servicios básicos..."
                  value={newEjeForm.objetivoGeneral}
                  onChange={(e) => setNewEjeForm({ ...newEjeForm, objetivoGeneral: e.target.value })}
                  className="w-full bg-[#081d38] border border-cyan-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-cyan-500/20">
              <button
                onClick={() => setShowAddEjeModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEje}
                className="flex-1 py-2 bg-[#111C30]0 hover:bg-amber-400 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-cyan-500/20"
              >
                Guardar Eje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PROPUESTA A EJE SELECCIONADO */}
      {showAddPropuestaModal && activeEje && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#05162a] border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Agregar Propuesta a Eje #{activeEje.numero}
              </h4>
              <button onClick={() => setShowAddPropuestaModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Proyecto / Propuesta:</label>
                <input
                  type="text"
                  placeholder="Ej: Construcción del Nuevo Centro de Salud Barrial"
                  value={newPropuestaForm.nombre}
                  onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, nombre: e.target.value })}
                  className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción Detallada:</label>
                <textarea
                  placeholder="Escriba los detalles de ejecución, beneficiarios y alcance..."
                  value={newPropuestaForm.descripcion}
                  onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, descripcion: e.target.value })}
                  className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400 h-20"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Indicador de Medición:</label>
                <input
                  type="text"
                  placeholder="Ej: Número de consultas mensuales atendidas"
                  value={newPropuestaForm.indicador}
                  onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, indicador: e.target.value })}
                  className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan-300 font-semibold mb-1">📍 Línea Base:</label>
                  <input
                    type="text"
                    placeholder="Ej: 500 consultas/mes"
                    value={newPropuestaForm.lineaBase}
                    onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, lineaBase: e.target.value })}
                    className="w-full bg-[#081d38] border border-cyan-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 font-semibold mb-1">🎯 Meta 2030:</label>
                  <input
                    type="text"
                    placeholder="Ej: 3,500 consultas/mes"
                    value={newPropuestaForm.meta2030}
                    onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, meta2030: e.target.value })}
                    className="w-full bg-[#081d38] border border-emerald-500/40 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Presupuesto Estimado:</label>
                  <input
                    type="text"
                    placeholder="Ej: $ 12,000 M COP"
                    value={newPropuestaForm.presupuestoEstimado}
                    onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, presupuestoEstimado: e.target.value })}
                    className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prioridad:</label>
                  <select
                    value={newPropuestaForm.prioridad}
                    onChange={(e) => setNewPropuestaForm({ ...newPropuestaForm, prioridad: e.target.value as any })}
                    className="w-full bg-[#081d38] border border-emerald-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Urgente">Urgente</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-emerald-500/20">
              <button
                onClick={() => setShowAddPropuestaModal(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPropuesta}
                className="flex-1 py-2 bg-[#111C30]0 hover:bg-emerald-400 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-emerald-500/20"
              >
                Guardar Propuesta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
