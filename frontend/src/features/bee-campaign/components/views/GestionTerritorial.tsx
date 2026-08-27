import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode, TerritorialZone, AuthUser } from '../../types';
import { RegistroVotantesView } from './RegistroVotantesView';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Plus, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Users, 
  CheckCircle, 
  WifiOff, 
  RotateCw,
  Globe,
  Bell,
  Settings,
  Edit3,
  Target,
  Award,
  X,
  Trash2,
  UserCheck,
  ShieldCheck,
  SearchCheck
} from 'lucide-react';

interface GestionTerritorialProps {
  onSelectView: (view: ViewMode) => void;
  zones: TerritorialZone[];
  onOpenFieldRegistrationModal: () => void;
  initialSubTab?: 'registro' | 'mapa';
  onSubTabChange?: (subTab: 'registro' | 'mapa') => void;
  authUser?: AuthUser | null;
}

const defaultMetas: Record<string, number> = {
  'z1': 100000,
  'z2': 160000,
  'z3': 45000,
  'z4': 75000,
  'z5': 30000,
  'z6': 20000,
};

export const GestionTerritorial: React.FC<GestionTerritorialProps> = ({
  onSelectView,
  zones,
  onOpenFieldRegistrationModal,
  initialSubTab = 'registro',
  onSubTabChange,
  authUser
}) => {
  const [sectorList, setSectorList] = useState<TerritorialZone[]>(() => {
    return zones.map(z => ({
      ...z,
      metaVotos: z.metaVotos ?? (defaultMetas[z.id] || Math.round(z.votantes * 1.25))
    }));
  });

  const [selectedZone, setSelectedZone] = useState<TerritorialZone | null>(sectorList[1] || sectorList[0] || null);
  const [activeSubTab, setActiveSubTab] = useState<'registro' | 'mapa'>(initialSubTab);

  React.useEffect(() => {
    if (zones && zones.length > 0) {
      setSectorList(zones.map(z => ({
        ...z,
        metaVotos: z.metaVotos ?? (defaultMetas[z.id] || Math.round(z.votantes * 1.25))
      })));
    }
  }, [zones]);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSubTabSelect = (tab: 'registro' | 'mapa') => {
    setActiveSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Intención de Voto');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Edit Sector Modal state
  const [editingSector, setEditingSector] = useState<TerritorialZone | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editMetaVotos, setEditMetaVotos] = useState<number | string>('');
  const [editLideres, setEditLideres] = useState<number | string>('');
  const [editVotantes, setEditVotantes] = useState<number | string>('');

  // New Sector Modal state
  const [showAddSectorModal, setShowAddSectorModal] = useState<boolean>(false);
  const [newSectorName, setNewSectorName] = useState<string>('');
  const [newSectorMetaVotos, setNewSectorMetaVotos] = useState<number | string>(50000);

  const filteredSectorList = sectorList.filter(z => 
    z.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEditModal = (sector: TerritorialZone) => {
    setEditingSector(sector);
    setEditName(sector.nombre);
    setEditMetaVotos(sector.metaVotos || Math.round(sector.votantes * 1.25));
    setEditLideres(sector.lideres);
    setEditVotantes(sector.votantes);
  };

  const handleSaveSector = () => {
    if (!editingSector) return;
    const numMeta = typeof editMetaVotos === 'number' ? editMetaVotos : parseInt(editMetaVotos as string) || 0;
    const numLideres = typeof editLideres === 'number' ? editLideres : parseInt(editLideres as string) || 0;
    const numVotantes = typeof editVotantes === 'number' ? editVotantes : parseInt(editVotantes as string) || 0;

    const newNombre = editName.trim() || editingSector.nombre;
    const newCobertura = numMeta > 0 ? Math.min(100, Math.round((numVotantes / numMeta) * 100)) : editingSector.cobertura;

    setSectorList(prev => prev.map(s => {
      if (s.id !== editingSector.id) return s;
      return {
        ...s,
        nombre: newNombre,
        metaVotos: numMeta,
        lideres: numLideres,
        votantes: numVotantes,
        cobertura: newCobertura
      };
    }));

    if (selectedZone && selectedZone.id === editingSector.id) {
      setSelectedZone({
        ...selectedZone,
        nombre: newNombre,
        metaVotos: numMeta,
        lideres: numLideres,
        votantes: numVotantes,
        cobertura: newCobertura
      });
    }

    setEditingSector(null);
  };

  const handleDeleteSector = (sectorId: string) => {
    const target = sectorList.find(s => s.id === sectorId);
    if (!target) return;
    if (!window.confirm(`¿Está seguro de eliminar el sector "${target.nombre}"?`)) return;

    setSectorList(prev => {
      const remaining = prev.filter(s => s.id !== sectorId);
      if (remaining.length > 0 && selectedZone?.id === sectorId) {
        setSelectedZone(remaining[0]);
      } else if (remaining.length === 0) {
        setSelectedZone(null);
      }
      return remaining;
    });
    setEditingSector(null);
  };

  const handleAddSectorSubmit = () => {
    if (!newSectorName.trim()) return;
    const numMeta = typeof newSectorMetaVotos === 'number' ? newSectorMetaVotos : parseInt(newSectorMetaVotos as string) || 50000;
    
    const newZone: TerritorialZone = {
      id: `z_${Date.now()}`,
      nombre: newSectorName.trim(),
      lideres: 100,
      votantes: 5000,
      cobertura: Math.min(100, Math.round((5000 / numMeta) * 100)),
      heatValue: 100,
      coordenadas: { x: 50, y: 50 },
      testigosActivos: 50,
      testigosFaltantes: 10,
      metaVotos: numMeta
    };

    setSectorList(prev => [...prev, newZone]);
    setSelectedZone(newZone);
    setShowAddSectorModal(false);
    setNewSectorName('');
    setNewSectorMetaVotos(50000);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-transparent text-slate-200 p-4 md:p-6 space-y-4">
      


      {/* Sub-navigation Tabs: Registro de Votantes vs Mapa Territorial */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F172A] p-2 rounded-2xl border border-white/5 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubTabSelect('registro')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'registro'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                : 'bg-[#111C30] text-slate-400 hover:bg-[#020617] hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-300" />
            <span>Registro de Votantes</span>
            <span className="px-2 py-0.5 rounded-full bg-[#111C30]0/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-extrabold uppercase font-mono">
              Restricción Medellín
            </span>
          </button>

          <button
            onClick={() => handleSubTabSelect('mapa')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'mapa'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md'
                : 'bg-[#111C30] text-slate-400 hover:bg-[#020617] hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-teal-300" />
            <span>Mapa Territorial & Sectores</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 pr-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Filtro de Circunscripción Electoral Activo: <strong className="text-teal-700 font-mono">Medellín - Antioquia</strong></span>
        </div>
      </div>

      {activeSubTab === 'registro' ? (
        <RegistroVotantesView onSelectView={onSelectView} authUser={authUser} />
      ) : (
        <>
          {/* Main Grid Layout matching Image 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT SIDEBAR: Stats & Indicators (Navy Cards) */}
        <div className="functional-grid lg:col-span-4 space-y-4">
          
          {/* Card 1: Líderes y Votantes */}
          <div className="functional-card bg-[#0b1b36] text-white rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-white border-b border-slate-700/60 pb-2 flex items-center justify-between">
              <span>Líderes y Votantes</span>
              <Users className="w-4 h-4 text-teal-400" />
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Líderes:</span>
                <span className="font-extrabold text-white">4,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Total Votantes:</span>
                <span className="font-extrabold text-white">350,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1">
                <span>Porcentaje de Cobertura:</span>
                <span className="text-teal-400 font-bold">78%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 2: Operación Electoral */}
          <div className="functional-card bg-[#0b1b36] text-white rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-white border-b border-slate-700/60 pb-2">
              Operación Electoral
            </h3>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5 text-xs">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Estado de Testigos</p>
                <div>
                  <p className="text-[11px] text-slate-300">Testigos Registrados:</p>
                  <p className="text-base font-bold text-white">12,000</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-300">Faltantes:</p>
                  <p className="text-sm font-bold text-rose-400">500</p>
                </div>
              </div>

              {/* Radial Capacitación Ring */}
              <div className="flex flex-col items-center justify-center p-1">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="85, 100"
                    />
                  </svg>
                  <span className="absolute font-extrabold text-xs text-white">85%</span>
                </div>
                <span className="text-[10px] text-teal-300 mt-1 font-medium">Capacitación</span>
              </div>
            </div>
          </div>

          {/* Card 3: Investigación Electoral */}
          <div className="functional-card bg-[#0b1b36] text-white rounded-2xl p-4 border border-slate-800 shadow-lg space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-white border-b border-slate-700/60 pb-2">
              Investigación Electoral
            </h3>

            <div className="space-y-1.5 text-xs">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Progreso de Encuestas</p>
              <div className="flex justify-between">
                <span className="text-slate-300">Encuestas Completadas:</span>
                <span className="font-bold text-white">8,900</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Encuestas en Proceso:</span>
                <span className="font-bold text-amber-400">2,100</span>
              </div>
            </div>

            {/* Avance Semanal mini chart */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-1">Avance Semanal</p>
              <div className="h-10 flex items-end justify-between gap-1 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700/50">
                {[30, 45, 60, 75, 90, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Green Button matching Image 4 bottom left */}
          <button
            onClick={onOpenFieldRegistrationModal}
            className="w-full bg-emerald-400 hover:bg-emerald-300 text-white font-black px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-xs">Registro en Campo (Offline Ready)</span>
            </div>
            <WifiOff className="w-4 h-4 text-slate-200" />
          </button>

        </div>

        {/* RIGHT MAIN AREA: Interactive Heatmap Stage */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-3xl border border-white/5 p-4 shadow-sm relative flex flex-col justify-between min-h-[520px] overflow-hidden">
          
          {/* Map Title Overlay */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 z-10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" />
              Mapa de Calor de Intención de Voto - Cobertura Nacional
            </h3>
            <div className="flex items-center gap-1 bg-[#020617] rounded-lg p-1 border border-white/5">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
                className="p-1 hover:bg-[#0F172A] rounded text-slate-300"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                className="p-1 hover:bg-[#0F172A] rounded text-slate-300"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Regional Vector Map Canvas matching Image 4 */}
          <div 
            className="relative flex-1 my-3 bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center transition-all"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* El Salvador SVG contours */}
            <svg className="w-full h-full max-h-[440px] p-4" viewBox="0 0 800 450">
              <g fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" opacity="0.6">
                {/* Simplified departmental borders */}
                <path d="M 120 180 Q 200 100 320 150 Q 400 120 480 180 Q 580 140 700 220 Q 650 320 520 300 Q 420 380 280 340 Q 180 320 120 180 Z" />
                <path d="M 280 150 L 320 280 L 450 220 L 400 120 Z" fill="#bae6fd" />
                <path d="M 450 220 L 580 140 L 620 280 L 520 300 Z" fill="#dbeafe" />
                <path d="M 180 320 L 280 340 L 320 280 L 200 240 Z" fill="#e0e7ff" />
              </g>

              {/* Heatmap gradients overlay circles */}
              <circle cx="380" cy="240" r="80" fill="radial-gradient(circle, #0284c7, transparent)" opacity="0.4" />
              <circle cx="380" cy="240" r="50" fill="#0369a1" opacity="0.6" />
              <circle cx="240" cy="210" r="60" fill="#0ea5e9" opacity="0.4" />
              <circle cx="560" cy="240" r="55" fill="#10b981" opacity="0.3" />
              <circle cx="640" cy="280" r="45" fill="#34d399" opacity="0.4" />
            </svg>

            {/* Heat Clusters Badges matching Image 4 numbers */}
            {[
              { val: '1,550', label: 'San Salvador', top: '52%', left: '46%', size: 'lg' },
              { val: '192', label: 'Santa Ana', top: '42%', left: '26%', size: 'md' },
              { val: '103', label: 'La Libertad', top: '58%', left: '42%', size: 'sm' },
              { val: '63', label: 'Cuscatlán', top: '48%', left: '55%', size: 'sm' },
              { val: '30', label: 'San Vicente', top: '58%', left: '62%', size: 'sm' },
              { val: '27', label: 'Usulután', top: '68%', left: '56%', size: 'sm' },
              { val: '33', label: 'San Miguel', top: '72%', left: '68%', size: 'sm' },
              { val: '21', label: 'La Unión', top: '62%', left: '78%', size: 'sm' },
              { val: '24', label: 'Chalatenango', top: '30%', left: '58%', size: 'sm' },
              { val: '1', label: 'Metapán', top: '22%', left: '38%', size: 'sm' }
            ].map((node, i) => (
              <div
                key={i}
                style={{ top: node.top, left: node.left }}
                onClick={() => setSelectedZone(zones[i % zones.length])}
                className={`absolute -translate-x-1/2 -translate-y-1/2 bg-[#0F172A]/90 backdrop-blur border-2 border-[#0284c7] text-[#0369a1] font-black rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-125 transition-transform ${
                  node.size === 'lg' ? 'px-3 py-1.5 text-xs ring-4 ring-sky-500/30 bg-sky-100' :
                  node.size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
                }`}
              >
                {node.val}
              </div>
            ))}
          </div>

          {/* Selected Zone Quick Detail Bar */}
          {selectedZone && (
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedZone.nombre}</h4>
                  <p className="text-[11px] text-slate-400">
                    Líderes: <span className="text-teal-300 font-semibold">{selectedZone.lideres}</span> • Votantes: <span className="text-teal-300 font-semibold">{selectedZone.votantes.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-teal-950 text-teal-300 border border-teal-500/40 px-2.5 py-1 rounded-full font-bold">
                  Cobertura {selectedZone.cobertura}%
                </span>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* SECCIÓN: TARJETAS DE SECTORES TERRITORIALES (CON BOTÓN DE EDITAR) */}
      <div className="bg-[#0b1b36] border border-slate-800/90 text-white rounded-3xl p-5 md:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-400" />
              Sectores Territoriales y Metas de Votos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Administre cada sector, personalice su nombre o ajuste su meta de votos sin perder su historial operativo.
            </p>
          </div>

          <button
            onClick={() => setShowAddSectorModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-teal-950/40 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Sector</span>
          </button>
        </div>

        {/* Grid de Tarjetas de Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectorList.map((sector, idx) => {
            const meta = sector.metaVotos || Math.round(sector.votantes * 1.25);
            const porcentajeMeta = meta > 0 ? Math.min(100, Math.round((sector.votantes / meta) * 100)) : 0;
            const isSelected = selectedZone?.id === sector.id;

            return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className={`bg-[#051325] border ${
                  isSelected ? 'border-teal-500/70 ring-1 ring-teal-500/30' : 'border-slate-800 hover:border-slate-700'
                } rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all shadow-md group`}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 rounded-md inline-block">
                      Sector / Zona
                    </span>
                    <h4 className="font-extrabold text-sm text-white leading-tight group-hover:text-teal-300 transition-colors">
                      {sector.nombre}
                    </h4>
                  </div>

                  {/* BOTÓN EDITAR */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenEditModal(sector)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/35 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                    title="Editar nombre o meta de votos del sector"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Editar</span>
                  </motion.button>
                </div>

                {/* Progress Bar Meta de Votos */}
                <div className="bg-[#081b33] border border-slate-800/80 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-400" /> Meta de Votos:
                    </span>
                    <strong className="text-amber-300 font-black text-xs">
                      {meta.toLocaleString()}
                    </strong>
                  </div>

                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${porcentajeMeta}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        porcentajeMeta >= 80
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                          : porcentajeMeta >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-teal-400'
                          : 'bg-gradient-to-r from-rose-500 to-amber-400'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Votantes: <strong className="text-white">{sector.votantes.toLocaleString()}</strong></span>
                    <span className="font-extrabold text-teal-400">{porcentajeMeta}% de la meta</span>
                  </div>
                </div>

                {/* Métricas secundarias */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#08192e] p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Líderes</p>
                      <p className="font-bold text-white">{sector.lideres}</p>
                    </div>
                  </div>

                  <div className="bg-[#08192e] p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Cobertura</p>
                      <p className="font-bold text-emerald-300">{sector.cobertura}%</p>
                    </div>
                  </div>
                </div>

                {/* Acción para enfocar mapa */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedZone(sector)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                      : 'bg-[#081d38] hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {isSelected ? '✓ Seleccionado en Mapa' : 'Ver en Mapa de Calor'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
      </>
      )}

      {/* MODAL PARA EDITAR SECTOR */}
      <AnimatePresence>
        {editingSector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-[#05162a] border border-teal-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 text-xs shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-300">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Editar Sector Territorial</h4>
                    <p className="text-[11px] text-slate-400">Modifique el nombre o ajuste la meta de votos</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSector(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Nombre del Sector / Zona:
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Ej: Zona Norte / Santa Ana"
                    className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>Meta de Votos Objetivo:</span>
                    <span className="text-[11px] text-teal-400 font-semibold">
                      {typeof editMetaVotos === 'number' ? editMetaVotos.toLocaleString() : editMetaVotos} votos
                    </span>
                  </label>
                  <input
                    type="number"
                    value={editMetaVotos}
                    onChange={(e) => setEditMetaVotos(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 100000"
                    className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Permite reajustar el techo u objetivo proyectado de votos en este sector territorial.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
                      Líderes Asignados:
                    </label>
                    <input
                      type="number"
                      value={editLideres}
                      onChange={(e) => setEditLideres(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">
                      Votantes Registrados:
                    </label>
                    <input
                      type="number"
                      value={editVotantes}
                      onChange={(e) => setEditVotantes(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSector(editingSector.id)}
                  className="py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Eliminar Sector"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSector(null)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSector}
                    className="py-2.5 px-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black rounded-xl shadow-lg cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL CREAR SECTOR */}
      <AnimatePresence>
        {showAddSectorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-[#05162a] border border-teal-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 text-xs shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/20 border border-teal-500/40 rounded-xl text-teal-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm">Crear Nuevo Sector Territorial</h4>
                    <p className="text-[11px] text-slate-400">Registre un nuevo sector con su meta de votos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSectorModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre del Sector:</label>
                  <input
                    type="text"
                    value={newSectorName}
                    onChange={(e) => setNewSectorName(e.target.value)}
                    placeholder="Ej: Comuna 13 / San Javier"
                    className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Meta de Votos Objetivo:</label>
                  <input
                    type="number"
                    value={newSectorMetaVotos}
                    onChange={(e) => setNewSectorMetaVotos(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 50000"
                    className="w-full bg-[#081f3b] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSectorModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddSectorSubmit}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-white font-black rounded-xl shadow-lg cursor-pointer"
                >
                  Crear Sector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
