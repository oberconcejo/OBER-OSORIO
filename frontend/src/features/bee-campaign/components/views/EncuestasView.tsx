import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode, AuthUser } from '../../types';
import { 
  BarChart3, 
  Users, 
  Check, 
  PlusCircle, 
  Activity, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  ThumbsUp, 
  Filter, 
  Sparkles,
  MapPin,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';

interface EncuestasViewProps {
  onSelectView: (view: ViewMode) => void;
  authUser: AuthUser | null;
}

interface Encuesta {
  id: string;
  nombre: string;
  comuna: string;
  intencionVoto: 'Nuestro Candidato' | 'Opositor A' | 'Opositor B' | 'Indeciso' | 'Blanco';
  preocupacion: 'Seguridad' | 'Economía' | 'Movilidad' | 'Salud' | 'Educación' | 'Medio Ambiente';
  calificacionGobierno: 'Excelente' | 'Aceptable' | 'Mala';
  dispuestoAVotar: 'Completamente Seguro' | 'Probable que cambie' | 'Muy Indeciso' | 'No asistiré a votar';
  edad: string;
  sexo: 'Masculino' | 'Femenino' | 'Otro';
  participacionJornada: 'Sí participará' | 'No participará' | 'Indeciso';
  fecha: string;
}

export const EncuestasView: React.FC<EncuestasViewProps> = ({ onSelectView, authUser }) => {
  // Mock data of polls
  const [encuestas, setEncuestas] = useState<Encuesta[]>([
    {
      id: 'enc_1',
      nombre: 'Juan Camilo Pérez',
      comuna: 'Comuna 11 - Laureles',
      intencionVoto: 'Nuestro Candidato',
      preocupacion: 'Seguridad',
      calificacionGobierno: 'Mala',
      dispuestoAVotar: 'Completamente Seguro',
      edad: '25-34',
      sexo: 'Masculino',
      participacionJornada: 'Sí participará',
      fecha: 'Hace 5 min'
    },
    {
      id: 'enc_2',
      nombre: 'María Camila Restrepo',
      comuna: 'Comuna 14 - Poblado',
      intencionVoto: 'Indeciso',
      preocupacion: 'Economía',
      calificacionGobierno: 'Aceptable',
      dispuestoAVotar: 'Completamente Seguro',
      edad: '18-24',
      sexo: 'Femenino',
      participacionJornada: 'Sí participará',
      fecha: 'Hace 20 min'
    },
    {
      id: 'enc_3',
      nombre: 'Anonimo',
      comuna: 'Comuna 16 - Belén',
      intencionVoto: 'Opositor A',
      preocupacion: 'Movilidad',
      calificacionGobierno: 'Excelente',
      dispuestoAVotar: 'Probable que cambie',
      edad: '45-54',
      sexo: 'Masculino',
      participacionJornada: 'Indeciso',
      fecha: 'Hace 1 hora'
    },
    {
      id: 'enc_4',
      nombre: 'Carlos Mario Giraldo',
      comuna: 'Comuna 11 - Laureles',
      intencionVoto: 'Nuestro Candidato',
      preocupacion: 'Seguridad',
      calificacionGobierno: 'Mala',
      dispuestoAVotar: 'Completamente Seguro',
      edad: '35-44',
      sexo: 'Masculino',
      participacionJornada: 'Sí participará',
      fecha: 'Hace 2 horas'
    }
  ]);

  // Form states
  const [nombre, setNombre] = useState('');
  const [comuna, setComuna] = useState('Comuna 11 - Laureles');
  const [intencionVoto, setIntencionVoto] = useState<Encuesta['intencionVoto']>('Nuestro Candidato');
  const [preocupacion, setPreocupacion] = useState<Encuesta['preocupacion']>('Seguridad');
  const [calificacionGobierno, setCalificacionGobierno] = useState<Encuesta['calificacionGobierno']>('Aceptable');
  const [dispuestoAVotar, setDispuestoAVotar] = useState<Encuesta['dispuestoAVotar']>('Completamente Seguro');
  
  // Mandatory demographic and participation fields
  const [edad, setEdad] = useState('18-24');
  const [sexo, setSexo] = useState<Encuesta['sexo']>('Masculino');
  const [participacionJornada, setParticipacionJornada] = useState<Encuesta['participacionJornada']>('Sí participará');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filters states
  const [filtroComuna, setFiltroComuna] = useState('Todas');
  const [filtroVoto, setFiltroVoto] = useState('Todas');

  // Goals
  const metaDiaria = 20;
  const completadasHoy = encuestas.length + 8; // Simulate 8 surveys done before

  // Load encuestas from backend database on mount
  useEffect(() => {
    const fetchEncuestas = async () => {
      try {
        const savedUser = localStorage.getItem('bee_auth_user');
        const token = savedUser ? JSON.parse(savedUser).access_token : '';
        const res = await fetch('/api/v1/encuestas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: Encuesta[] = data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            comuna: item.comuna,
            intencionVoto: item.intencionVoto,
            preocupacion: item.preocupacion,
            calificacionGobierno: item.calificacionGobierno,
            dispuestoAVotar: item.dispuestoAVotar,
            edad: item.edad,
            sexo: item.sexo,
            participacionJornada: item.participacionJornada,
            fecha: new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setEncuestas(mapped);
        }
      } catch (e) {
        console.error('Fallo al obtener encuestas:', e);
      }
    };
    fetchEncuestas();
  }, []);

  // Handlers
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    const payload = {
      nombre: nombre.trim() || 'Anónimo',
      comuna,
      intencionVoto,
      preocupacion,
      calificacionGobierno,
      dispuestoAVotar,
      edad,
      sexo,
      participacionJornada
    };

    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';
      const res = await fetch('/api/v1/encuestas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedRecord = await res.json();
        const nuevaEncuesta: Encuesta = {
          id: savedRecord.id,
          nombre: savedRecord.nombre,
          comuna: savedRecord.comuna,
          intencionVoto: savedRecord.intencionVoto as any,
          preocupacion: savedRecord.preocupacion as any,
          calificacionGobierno: savedRecord.calificacionGobierno as any,
          dispuestoAVotar: savedRecord.dispuestoAVotar as any,
          edad: savedRecord.edad,
          sexo: savedRecord.sexo as any,
          participacionJornada: savedRecord.participacionJornada as any,
          fecha: 'Hace un momento'
        };
        setEncuestas(prev => [nuevaEncuesta, ...prev]);
      } else {
        alert('Error al guardar la encuesta en el servidor.');
      }
    } catch (err) {
      console.error('Error al guardar encuesta:', err);
      alert('Error de conexión al guardar la encuesta.');
    }

    // Reset fields
    setNombre('');
    setEdad('18-24');
    setSexo('Masculino');
    setParticipacionJornada('Sí participará');
    setShowConfirmModal(false);
  };

  const handleDeletEncuesta = async (id: string) => {
    if (authUser?.role === 'puntero_territorial' || authUser?.role === 'lider') {
      alert('Error: Los usuarios de campo no tienen permisos para eliminar encuestas.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) return;

    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';
      const res = await fetch(`/api/v1/encuestas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setEncuestas(prev => prev.filter(e => e.id !== id));
      } else {
        alert('Error al eliminar la encuesta en el servidor.');
      }
    } catch (err) {
      console.error('Error al eliminar encuesta:', err);
    }
  };

  // Metrics calculations
  const totalEncuestas = encuestas.length;
  
  const intencionVotoCounts = encuestas.reduce((acc, curr) => {
    acc[curr.intencionVoto] = (acc[curr.intencionVoto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preocupacionCounts = encuestas.reduce((acc, curr) => {
    acc[curr.preocupacion] = (acc[curr.preocupacion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filtered polls
  const encuestasFiltradas = encuestas.filter(e => {
    const matchComuna = filtroComuna === 'Todas' || e.comuna === filtroComuna;
    const matchVoto = filtroVoto === 'Todas' || e.intencionVoto === filtroVoto;
    return matchComuna && matchVoto;
  });

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#020617] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b1d38] via-[#0d2a4a] to-[#2563eb] rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.08),transparent)]" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs text-blue-300 font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Operación en Campo & Toma de Datos</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Registro de Encuestas & Opinión</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
              <span className="text-slate-300">Encuestador Activo:</span>
              <span className="px-2 py-0.5 bg-[#020a17]/60 border border-blue-500/30 rounded-lg text-blue-300 font-bold">
                {authUser?.name || 'Usuario Encuestador'} ({authUser?.roleName || 'Testigo/Líder Zonal'})
              </span>
              <span className="text-slate-400/40">•</span>
              <span className="text-slate-300">Módulo Administrativo Vinculado:</span>
              <span className="px-2 py-0.5 bg-[#020a17]/60 border border-cyan-500/30 rounded-lg text-cyan-300 font-bold">
                {authUser?.moduleName || 'Gestión Territorial'}
              </span>
            </div>
          </div>
          
          {/* Daily Goal card */}
          <div className="bg-[#0F172A]/90 border border-blue-500/30 rounded-2xl p-4 shrink-0 shadow-lg min-w-[220px] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Meta de Hoy</span>
              <span className="font-mono font-bold text-blue-300">{completadasHoy} / {metaDiaria} encuestas</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min((completadasHoy / metaDiaria) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {completadasHoy >= metaDiaria 
                ? '🎉 ¡Meta diaria cumplida! Excelente trabajo.' 
                : `Faltan ${metaDiaria - completadasHoy} encuestas para cumplir la meta de hoy.`}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Add survey and Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Survey Submission form */}
          <div className="bg-[#0F172A]/50 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-black text-white">Registrar Nueva Encuesta</h3>
            </div>

            <form onSubmit={handleSurveySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nombre del Encuestado (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Anónimo o Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Comuna / Barrio de Residencia</label>
                  <select
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Comuna 11 - Laureles">Comuna 11 - Laureles</option>
                    <option value="Comuna 14 - Poblado">Comuna 14 - Poblado</option>
                    <option value="Comuna 16 - Belén">Comuna 16 - Belén</option>
                    <option value="Comuna 10 - La Candelaria">Comuna 10 - La Candelaria</option>
                    <option value="Corregimiento - San Cristóbal">Corregimiento - San Cristóbal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    P1: Si las elecciones a la Alcaldía fueran el día de hoy, ¿por cuál de los siguientes candidatos votaría usted? *
                  </label>
                  <select
                    value={intencionVoto}
                    onChange={(e) => setIntencionVoto(e.target.value as any)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Nuestro Candidato">Nuestro Candidato (Campaña Ganadora)</option>
                    <option value="Opositor A">Candidato Oposición A</option>
                    <option value="Opositor B">Candidato Oposición B</option>
                    <option value="Blanco">Voto en Blanco</option>
                    <option value="Indeciso">No Sabe / No Responde</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    P2: ¿Qué tan seguro está de su voto para las próximas elecciones? *
                  </label>
                  <select
                    value={dispuestoAVotar}
                    onChange={(e) => setDispuestoAVotar(e.target.value as any)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Completamente Seguro">Completamente Seguro</option>
                    <option value="Probable que cambie">Probable que cambie</option>
                    <option value="Muy Indeciso">Muy Indeciso</option>
                    <option value="No asistiré a votar">No asistiré a votar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">P3: Preocupación Principal del Ciudadano</label>
                  <select
                    value={preocupacion}
                    onChange={(e) => setPreocupacion(e.target.value as any)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Seguridad">Seguridad ciudadana</option>
                    <option value="Economía">Economía y Empleo</option>
                    <option value="Movilidad">Movilidad y Transporte</option>
                    <option value="Salud">Sistema de Salud</option>
                    <option value="Educación">Educación pública</option>
                    <option value="Medio Ambiente">Medio Ambiente</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">P4: Calificación de la Gestión Local Actual</label>
                  <div className="flex gap-2">
                    {['Excelente', 'Aceptable', 'Mala'].map((cal) => {
                      const isSelected = calificacionGobierno === cal;
                      const activeColor = 
                        cal === 'Excelente' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' :
                        cal === 'Aceptable' ? 'border-amber-500 text-amber-400 bg-amber-950/20' :
                        'border-red-500 text-red-400 bg-red-950/20';
                      return (
                        <button
                          key={cal}
                          type="button"
                          onClick={() => setCalificacionGobierno(cal as any)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected ? activeColor : 'border-slate-800 text-slate-400 bg-slate-950/20'
                          }`}
                        >
                          {cal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Demográficos Obligatorios: Edad, Sexo, Intención Participación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">P5: Rango de Edad *</label>
                  <select
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="18-24">18 - 24 años</option>
                    <option value="25-34">25 - 34 años</option>
                    <option value="35-44">35 - 44 años</option>
                    <option value="45-54">45 - 54 años</option>
                    <option value="55-64">55 - 64 años</option>
                    <option value="65+">65 años o más</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">P6: Sexo del Encuestado *</label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as any)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro / Prefiere no decir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">P7: Participación en Jornada Electoral *</label>
                  <select
                    value={participacionJornada}
                    onChange={(e) => setParticipacionJornada(e.target.value as any)}
                    className="w-full bg-[#020a17] border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Sí participará">Sí participará</option>
                    <option value="No participará">No participará</option>
                    <option value="Indeciso">No sabe / Indeciso</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Encuesta</span>
                </button>
              </div>
            </form>
          </div>

          {/* Metrics summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Intention of Vote Chart Card */}
            <div className="bg-[#0F172A]/50 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Intención de Voto</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Muestra del día</span>
              </div>
              <div className="space-y-3">
                {['Nuestro Candidato', 'Opositor A', 'Opositor B', 'Indeciso', 'Blanco'].map((cat) => {
                  const count = intencionVotoCounts[cat] || 0;
                  const percent = totalEncuestas > 0 ? Math.round((count / totalEncuestas) * 100) : 0;
                  const barColor = 
                    cat === 'Nuestro Candidato' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                    cat === 'Indeciso' ? 'bg-[#111C30]0' :
                    'bg-slate-700';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className={cat === 'Nuestro Candidato' ? 'text-blue-300' : 'text-slate-300'}>{cat}</span>
                        <span className="font-mono text-slate-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Concerns Summary */}
            <div className="bg-[#0F172A]/50 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Preocupaciones Ciudadanas</h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Top de alarmas</span>
              </div>
              <div className="space-y-3">
                {['Seguridad', 'Economía', 'Movilidad', 'Salud', 'Educación', 'Medio Ambiente'].map((pre) => {
                  const count = preocupacionCounts[pre] || 0;
                  const percent = totalEncuestas > 0 ? Math.round((count / totalEncuestas) * 100) : 0;

                  return (
                    <div key={pre} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{pre}</span>
                        <span className="font-mono text-slate-400">{count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div 
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: History of survey results */}
        <div className="space-y-6">
          <div className="bg-[#0F172A]/50 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-4 min-h-[500px] flex flex-col">
            
            {/* Title & Filters */}
            <div className="space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Historial de Encuestas</h4>
                <div className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
                  <Filter className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Select filters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Comuna</label>
                  <select
                    value={filtroComuna}
                    onChange={(e) => setFiltroComuna(e.target.value)}
                    className="w-full bg-[#020a17] border border-slate-850 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Comuna 11 - Laureles">Laureles</option>
                    <option value="Comuna 14 - Poblado">Poblado</option>
                    <option value="Comuna 16 - Belén">Belén</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Intención Voto</label>
                  <select
                    value={filtroVoto}
                    onChange={(e) => setFiltroVoto(e.target.value)}
                    className="w-full bg-[#020a17] border border-slate-850 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Nuestro Candidato">Nuestro Voto</option>
                    <option value="Opositor A">Opositor A</option>
                    <option value="Indeciso">Indecisos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable list of polls */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2 max-h-[420px]">
              <AnimatePresence>
                {encuestasFiltradas.length > 0 ? (
                  encuestasFiltradas.map((enc) => {
                    const votoColor = 
                      enc.intencionVoto === 'Nuestro Candidato' ? 'text-blue-400 bg-blue-950/40 border border-blue-500/20' :
                      enc.intencionVoto === 'Indeciso' ? 'text-amber-400 bg-amber-950/40 border border-amber-500/20' :
                      'text-slate-400 bg-slate-900 border border-slate-800';

                    return (
                      <motion.div
                        key={enc.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#020a17] border border-slate-800 rounded-xl p-3.5 space-y-2 relative group"
                      >
                        {/* Delete button (only for admins/coordinators) */}
                        {authUser?.role !== 'puntero_territorial' && authUser?.role !== 'lider' && (
                          <button
                            onClick={() => handleDeletEncuesta(enc.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Eliminar encuesta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h5 className="text-xs font-bold text-white">{enc.nombre}</h5>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {enc.comuna}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{enc.fecha}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                          <div className="bg-[#0F172A] border border-slate-800 rounded p-1.5">
                            <span className="text-slate-400 block uppercase">Alarma Principal</span>
                            <span className="font-semibold text-slate-300">{enc.preocupacion}</span>
                          </div>
                          <div className="bg-[#0F172A] border border-slate-800 rounded p-1.5">
                            <span className="text-slate-400 block uppercase">Gestión Actual</span>
                            <span className="font-semibold text-slate-300">{enc.calificacionGobierno}</span>
                          </div>
                        </div>

                        {/* Demographic details */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-400 bg-slate-950/40 p-1.5 rounded border border-slate-850 mt-1">
                          <span>Edad: <strong className="text-slate-300">{enc.edad}</strong></span>
                          <span>•</span>
                          <span>Sexo: <strong className="text-slate-300">{enc.sexo}</strong></span>
                          <span>•</span>
                          <span>Participará: <strong className="text-slate-300">{enc.participacionJornada}</strong></span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${votoColor}`}>
                            Voto: {enc.intencionVoto}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Seguridad Voto: <strong className="text-slate-300">{enc.dispuestoAVotar}</strong>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <Info className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-400">No se encontraron encuestas registradas con este filtro.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#000]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0b1329] border border-blue-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Confirmar Datos de la Encuesta</h4>
                <p className="text-xs text-slate-400 mt-0.5">Valide la información antes de guardar permanentemente.</p>
              </div>
            </div>

            <div className="bg-[#020712]/60 rounded-2xl p-4 border border-slate-850 text-xs space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ciudadano</span>
                  <span className="text-white font-bold">{nombre.trim() || 'Anónimo'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ubicación / Comuna</span>
                  <span className="text-white font-bold">{comuna}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P1: Intención de Voto</span>
                  <span className="text-blue-300 font-bold">
                    {intencionVoto === 'Nuestro Candidato' ? 'Nuestro Candidato (Campaña Ganadora)' :
                     intencionVoto === 'Opositor A' ? 'Candidato Oposición A' :
                     intencionVoto === 'Opositor B' ? 'Candidato Oposición B' :
                     intencionVoto === 'Blanco' ? 'Voto en Blanco' : 'No Sabe / No Responde'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P2: Seguridad de Voto</span>
                  <span className="text-white font-bold">{dispuestoAVotar}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P3: Preocupación Principal</span>
                  <span className="text-slate-300 font-semibold">{preocupacion}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P4: Gestión Local</span>
                  <span className="text-slate-300 font-semibold">{calificacionGobierno}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P5: Edad</span>
                  <span className="text-white font-bold">{edad} años</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P6: Sexo</span>
                  <span className="text-white font-bold">{sexo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">P7: Participará</span>
                  <span className="text-white font-bold">{participacionJornada}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar y Corregir
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                Confirmar y Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
