import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  MapPin, 
  Search, 
  Layers, 
  ShieldAlert, 
  Database,
  RefreshCw,
  Info,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface UbicacionResumen {
  tipoUbicacion: string;
  nombreUbicacion: string;
  abreviatura: string;
  nombreVisual: string;
  votantesHabilitados: number;
  totalMesas: number;
}

interface MesaResumen {
  numero: string;
  votantesHabilitados: number | null;
  tipoUbicacion: string;
  nombreUbicacion: string;
  nombreVisual: string;
}

interface MunicipioPayload {
  nombre: string;
  votantesHabilitados: number;
  totalMesas: number;
  ubicaciones: UbicacionResumen[];
  mesas: MesaResumen[];
}

export const DistribucionElectoral: React.FC<{ onSelectView: (view: any) => void }> = ({ onSelectView }) => {
  // Read campaign parameters from localStorage
  const corporacion = localStorage.getItem('bee_campaign_corporacion') || 'Alcaldía';
  const municipioCampana = localStorage.getItem('bee_campaign_municipio') || 'Medellín';
  const activeMuniName = municipioCampana.replace(/\s*\(.*\)/g, '').trim();

  // API State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [payload, setPayload] = useState<any | null>(null);

  // Search & Filter states
  const [distSearch, setDistSearch] = useState('');
  const [distTipoFilter, setDistTipoFilter] = useState('Todos');

  // Accordion state (only used for Gobernación/Asamblea)
  const [expandedMunicipios, setExpandedMunicipios] = useState<Record<string, boolean>>({});

  const fetchDistribucionData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const savedUser = localStorage.getItem('bee_auth_user');
      const token = savedUser ? JSON.parse(savedUser).access_token : '';

      const res = await fetch(`/api/campanas/current/distribucion-electoral?corporacion=${encodeURIComponent(corporacion)}&municipio=${encodeURIComponent(activeMuniName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al obtener información electoral desde el servidor');
      }

      const data = await res.json();
      setPayload(data);
      
      // Auto-expand first municipality if Gobernación
      if (data.municipios && data.municipios.length > 0) {
        setExpandedMunicipios({ [data.municipios[0].nombre]: true });
      }
    } catch (e: any) {
      setErrorMsg('No hay bases de datos oficiales de DIVIPOLE cargadas en el sistema para esta elección.');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistribucionData();
  }, [corporacion, municipioCampana]);

  const isGovOrAsam = corporacion === 'Gobernación' || corporacion === 'Asamblea';

  // Toggle accordion
  const toggleMuni = (muniName: string) => {
    setExpandedMunicipios(prev => ({
      ...prev,
      [muniName]: !prev[muniName]
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center gap-3 text-slate-400 bg-[#020617] min-h-[70vh]">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <span className="text-xs font-bold font-mono">Cargando distribución del censo electoral oficial...</span>
      </div>
    );
  }

  // Display message if no data exists
  if (!payload || errorMsg) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-12 font-sans">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto text-slate-500">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">DIVIPOLE No Inicializado</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No se registra información de distribución electoral para la circunscripción actual. 
            Es necesario cargar el censo electoral oficial (DIVIPOLE) desde la sección de **"Importación Electoral"** en el Panel Administrativo de SaaS.
          </p>
        </div>
      </div>
    );
  }

  // Render variables depending on scope
  const mainTitle = isGovOrAsam 
    ? `Distribución Electoral: Dpto. ${payload.departamento || 'Antioquia'}` 
    : `Distribución Electoral: Municipio ${payload.municipio || activeMuniName}`;

  return (
    <div className="space-y-6 text-slate-100 font-sans p-4 md:p-6 bg-[#020617]">
      
      {/* Banner */}
      <div className="bg-[#111C30] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">{mainTitle}</h2>
            <p className="text-xs text-slate-400">
              Datos consolidados del DIVIPOLE oficial correspondientes a la circunscripción de la campaña activa.
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">DIVIPOLE Local Activo</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Potencial Electoral Habilitado</span>
          <span className="text-2xl font-black text-white font-mono block mt-1">
            {payload.votantesHabilitados?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Votantes registrados habilitados</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Total Mesas Registradas</span>
          <span className="text-2xl font-black text-white font-mono block mt-1">
            {payload.totalMesas?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Mesas oficiales de votación</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
            {isGovOrAsam ? 'Municipios Cubiertos' : 'Campaña Local'}
          </span>
          <span className="text-2xl font-black text-cyan-400 font-mono block mt-1">
            {isGovOrAsam ? payload.totalMunicipios || 0 : '100%'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Alcance geográfico territorial</span>
        </div>
      </div>

      {/* MUNICIPAL CAMPAIGN VIEW LAYOUT */}
      {!isGovOrAsam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Ubicaciones Consolidadas Summary card */}
          <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Resumen por Ubicación Territorial
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Votantes agrupados por la clasificación oficial Cabecera / Vereda / Corregimiento.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {payload.ubicaciones && payload.ubicaciones.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No hay ubicaciones registradas.</p>
              ) : (
                payload.ubicaciones?.map((u: UbicacionResumen, idx: number) => (
                  <div key={idx} className="bg-[#111C30] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="block text-xs font-black text-white">{u.nombreVisual}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{u.tipoUbicacion}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-cyan-300 font-mono">{u.votantesHabilitados.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{u.totalMesas} Mesas</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tables and detail lists card */}
          <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-wider">Listado General de Mesas</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lista oficial de mesas y su ubicación geográfica asignada.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={distSearch}
                    onChange={(e) => setDistSearch(e.target.value)}
                    placeholder="Filtrar mesa..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none placeholder-slate-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
                </div>
                <select
                  value={distTipoFilter}
                  onChange={(e) => setDistTipoFilter(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="CABECERA">Cabecera</option>
                  <option value="CORREGIMIENTO">Corregimientos</option>
                  <option value="VEREDA">Veredas</option>
                </select>
              </div>
            </div>

            {/* Mesas Table */}
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800/80">
                    <th className="px-4 py-2.5 text-left">Número de Mesa</th>
                    <th className="px-4 py-2.5 text-left">Ubicación Asignada</th>
                    <th className="px-4 py-2.5 text-center">Tipo de Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {payload.mesas?.filter((m: MesaResumen) => {
                    const searchLower = distSearch.toLowerCase();
                    const matchesSearch = m.numero.includes(searchLower) || m.nombreVisual.toLowerCase().includes(searchLower);
                    if (!matchesSearch) return false;

                    if (distTipoFilter === 'Todos') return true;
                    return m.tipoUbicacion === distTipoFilter;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500 font-sans">
                        No se registran mesas oficiales con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    payload.mesas?.filter((m: MesaResumen) => {
                      const searchLower = distSearch.toLowerCase();
                      const matchesSearch = m.numero.includes(searchLower) || m.nombreVisual.toLowerCase().includes(searchLower);
                      if (!matchesSearch) return false;

                      if (distTipoFilter === 'Todos') return true;
                      return m.tipoUbicacion === distTipoFilter;
                    }).map((m: MesaResumen, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="px-4 py-2.5 text-left text-white font-bold">Mesa #{m.numero}</td>
                        <td className="px-4 py-2.5 text-left text-slate-300 font-sans">{m.nombreVisual}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            m.tipoUbicacion === 'CABECERA' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50' :
                            m.tipoUbicacion === 'CORREGIMIENTO' ? 'bg-violet-950/60 text-violet-400 border border-violet-800/50' :
                            'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                          } font-sans`}>
                            {m.tipoUbicacion}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENT CAMPAIGN VIEW LAYOUT (GOBERNACION / ASAMBLEA) */}
      {isGovOrAsam && (
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="border-b border-slate-800/80 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wider">Distribución por Municipios</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Despliegue cada municipio para consultar sus mesas y ubicaciones asignadas.</p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={distSearch}
                onChange={(e) => setDistSearch(e.target.value)}
                placeholder="Buscar municipio..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none placeholder-slate-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-3">
            {payload.municipios?.filter((muni: MunicipioPayload) => 
              muni.nombre.toLowerCase().includes(distSearch.toLowerCase())
            ).map((muni: MunicipioPayload, idx: number) => {
              const isExpanded = expandedMunicipios[muni.nombre];
              return (
                <div key={idx} className="bg-[#111C30]/50 rounded-xl border border-slate-850 overflow-hidden">
                  
                  {/* Accordion header */}
                  <div 
                    onClick={() => toggleMuni(muni.nombre)}
                    className="p-4 bg-[#111C30] hover:bg-[#16253d] flex justify-between items-center cursor-pointer select-none transition-colors border-b border-slate-800/30"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="font-extrabold text-sm text-white uppercase">{muni.nombre}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-slate-300 font-mono">{muni.votantesHabilitados.toLocaleString()} Votantes</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">{muni.totalMesas} Mesas</span>
                    </div>
                  </div>

                  {/* Accordion content */}
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#0F172A]/40">
                      
                      {/* Left: Locations */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/50 pb-1.5">Ubicaciones Consolidadas</h4>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                          {muni.ubicaciones?.map((u: UbicacionResumen, uidx: number) => (
                            <div key={uidx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex justify-between items-center text-xs">
                              <div>
                                <span className="block font-bold text-slate-200">{u.nombreVisual}</span>
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{u.tipoUbicacion}</span>
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-cyan-300 font-mono">{u.votantesHabilitados.toLocaleString()}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{u.totalMesas} Mesas</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Mesas */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/50 pb-1.5">Mesas Oficiales de Votación ({muni.totalMesas})</h4>
                        <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 font-mono">
                          {muni.mesas?.map((mesa: MesaResumen, midx: number) => (
                            <div key={midx} className="bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-800/30 flex justify-between items-center text-xs">
                              <span className="font-bold text-white">Mesa #{mesa.numero}</span>
                              <span className="text-slate-400 text-[10px] font-sans">{mesa.nombreVisual}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
