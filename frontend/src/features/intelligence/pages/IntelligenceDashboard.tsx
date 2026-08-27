import React, { useState, useEffect } from 'react';
import { 
  intelligenceService, 
  IntelligenceModel, 
  AnomalyAlert, 
  SimulationScenario 
} from '../services/intelligence.service';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { 
  Brain, ShieldAlert, Sparkles, Sliders, Layers, RefreshCw, CheckCircle, 
  Lock, AlertTriangle, Send, ShieldCheck, Database, Award, Info, Trash
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export const IntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'simulations' | 'registry' | 'chat'>('alerts');
  
  // Lists
  const [models, setModels] = useState<IntelligenceModel[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [simulations, setSimulations] = useState<SimulationScenario[]>([]);

  // Selection
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegisteringModel, setIsRegisteringModel] = useState(false);
  const [isResolvingAlert, setIsResolvingAlert] = useState(false);

  // Forms
  const [modelForm, setModelForm] = useState({ name: '', version: '', type: 'ANOMALY', algorithm: '', metrics_json: '' });
  const [resolveForm, setResolveForm] = useState({ status: 'CONFIRMED', note: '' });

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; blocked?: boolean }>>([
    { sender: 'assistant', text: 'Hola, soy tu asistente de analítica electoral. Puedes consultarme por estadísticas generales de tu censo y de tu equipo. Las consultas críticas de seguridad están bajo políticas de aislamiento.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Simulation Sliders
  const [simName, setSimName] = useState('Proyección General de Jornada');
  const [participationRate, setParticipationRate] = useState(55);
  const [targetShare, setTargetShare] = useState(48);
  const [competitorShare, setCompetitorShare] = useState(38);
  const [simResult, setSimResult] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dModels, dAlerts, dSimulations] = await Promise.all([
        intelligenceService.getModels(),
        intelligenceService.getAlerts(),
        intelligenceService.getSimulations()
      ]);
      setModels(dModels);
      setAlerts(dAlerts);
      setSimulations(dSimulations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await intelligenceService.triggerAnomalyCheck();
      fetchData();
    } catch (err) {
      alert('Error ejecutando escaneo');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRegisterModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await intelligenceService.registerModel(modelForm);
      setIsRegisteringModel(false);
      fetchData();
      setModelForm({ name: '', version: '', type: 'ANOMALY', algorithm: '', metrics_json: '' });
    } catch (err) {
      alert('Error registrando modelo');
    }
  };

  const handleResolveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsResolvingAlert(true);
    try {
      await intelligenceService.resolveAlert(selectedAlert.id, resolveForm.status, resolveForm.note);
      setSelectedAlert(null);
      fetchData();
      setResolveForm({ status: 'CONFIRMED', note: '' });
    } catch (err) {
      alert('Error resolviendo alerta');
    } finally {
      setIsResolvingAlert(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await intelligenceService.runSimulation(simName, {
        participation_rate: participationRate,
        target_share: targetShare,
        competitor_share: competitorShare
      });
      setSimResult(res.result);
      fetchData();
    } catch (err) {
      alert('Error ejecutando simulación');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await intelligenceService.queryAssistant(userText);
      setChatMessages(prev => [...prev, { 
        sender: 'assistant', 
        text: res.answer, 
        blocked: res.safety_status === 'BLOCKED' 
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: 'Error de red con el asistente de IA.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Brain size={16} className="text-primary animate-pulse" />
            <span>Inteligencia Electoral y Model Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Consola de Analítica Avanzada</h1>
          <p className="text-slate-500 text-sm">Escaneo de anomalías operativas y simulación estadística.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeTab === 'alerts' && (
            <Button onClick={handleTriggerScan} disabled={isScanning} className="flex items-center gap-2">
              <RefreshCw size={16} className={cn(isScanning && "animate-spin")} />
              {isScanning ? 'Escaneando...' : 'Escanear Anomalías'}
            </Button>
          )}
          {activeTab === 'registry' && (
            <Button onClick={() => setIsRegisteringModel(true)} className="flex items-center gap-2">
              <Sparkles size={16} /> Registrar Modelo
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
        {[
          { key: 'alerts', label: 'Detección de Anomalías', icon: <ShieldAlert size={18} /> },
          { key: 'simulations', label: 'Simulador What-If', icon: <Sliders size={18} /> },
          { key: 'registry', label: 'Registro de Modelos', icon: <Layers size={18} /> },
          { key: 'chat', label: 'Asistente IA', icon: <Sparkles size={18} /> }
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer", 
              activeTab === tab.key ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* -------------------- TAB: ALERTS -------------------- */}
      {activeTab === 'alerts' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-350">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShieldAlert size={20} className="text-danger" /> Registro de Anomalías Estadísticas
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="p-3">Alerta</th>
                  <th className="p-3">Clasificación / Tipo</th>
                  <th className="p-3">Severidad</th>
                  <th className="p-3">Puntuación Anomalía</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{alert.description}</div>
                      {alert.resolution_note && (
                        <div className="text-xs text-slate-400 mt-1 bg-slate-50 p-2 rounded-lg border">
                          <strong>Nota resolución:</strong> {alert.resolution_note}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs">{alert.type}</td>
                    <td className="p-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        alert.severity === 'HIGH' ? "bg-red-50 text-red-600 border-red-200" :
                        alert.severity === 'MEDIUM' ? "bg-amber-50 text-amber-600 border-amber-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      )}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{alert.score}%</td>
                    <td className="p-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border",
                        alert.status === 'DETECTED' ? "bg-red-50 text-red-600 border-red-200" :
                        alert.status === 'CONFIRMED' ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {alert.status === 'DETECTED' ? (
                        <Button size="sm" onClick={() => {
                          setSelectedAlert(alert);
                          setResolveForm({ status: 'CONFIRMED', note: '' });
                        }}>
                          Auditar
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Revisado</span>
                      )}
                    </td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-400">
                      No se registran anomalías en la base de datos de auditoría. Ejecuta un escaneo en vivo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB: SIMULATIONS -------------------- */}
      {activeTab === 'simulations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Sliders Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sliders size={20} className="text-primary" /> Parámetros de Simulación
            </h2>
            
            <form onSubmit={handleRunSimulation} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Escenario</label>
                <Input required value={simName} onChange={(e) => setSimName(e.target.value)} />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold mb-2">
                  <span>Tasa de Participación Electoral</span>
                  <span>{participationRate}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={participationRate} 
                  onChange={(e) => setParticipationRate(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold mb-2">
                  <span>Porcentaje de Votación Campaña (Meta)</span>
                  <span>{targetShare}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={targetShare} 
                  onChange={(e) => setTargetShare(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-600 font-semibold mb-2">
                  <span>Porcentaje del Principal Competidor</span>
                  <span>{competitorShare}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" 
                  value={competitorShare} 
                  onChange={(e) => setCompetitorShare(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <Button type="submit" className="w-full">Correr Simulación</Button>
            </form>
          </div>

          {/* Results Comparison (Watermarked) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-black rotate-12 tracking-widest text-slate-900">SIMULACIÓN</span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-lg">Resultados del Escenario Proyectado</h3>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                  MARCA DE AGUA: ESCENARIO WHAT-IF
                </span>
              </div>

              {simResult ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs text-slate-400 font-bold uppercase">Ganador Simulado</h5>
                    <p className="text-xl font-bold text-slate-800 mt-2">{simResult.winner}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs text-slate-400 font-bold uppercase">Votos Campaña</h5>
                    <p className="text-xl font-bold text-primary mt-2">{simResult.target_votes.toLocaleString()} votos</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h5 className="text-xs text-slate-400 font-bold uppercase">Margen de Victoria</h5>
                    <p className="text-xl font-bold text-slate-800 mt-2">{simResult.margin}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 text-slate-400">Usa el panel de la izquierda para ingresar coeficientes y proyectar el escenario.</div>
              )}
            </div>

            {/* Saved scenarios history */}
            <div className="border-t border-slate-100 pt-6 mt-6">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Historial de Proyecciones</h4>
              <div className="space-y-2">
                {simulations.slice(0, 3).map(sim => {
                  const res = JSON.parse(sim.result_json);
                  return (
                    <div key={sim.id} className="p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs bg-slate-50/50">
                      <div>
                        <span className="font-semibold text-slate-800">{sim.name}</span>
                        <span className="text-slate-400 ml-2">({new Date(sim.created_at).toLocaleDateString()})</span>
                      </div>
                      <span className="font-bold text-slate-700">{res.winner} ({res.target_votes} votos)</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- TAB: REGISTRY -------------------- */}
      {activeTab === 'registry' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-300">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Layers size={20} className="text-primary" /> Model Registry (Repositorio de Modelos)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 text-xs uppercase">
                <tr>
                  <th className="p-3">Nombre del Modelo</th>
                  <th className="p-3">Versión</th>
                  <th className="p-3">Tipo de Predicción</th>
                  <th className="p-3">Algoritmo</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map(model => (
                  <tr key={model.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">{model.name}</td>
                    <td className="p-3 text-xs">{model.version}</td>
                    <td className="p-3 text-xs font-bold text-primary">{model.type}</td>
                    <td className="p-3 text-xs">{model.algorithm}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {model.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-400">
                      No hay modelos registrados en el repositorio de la campaña.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TAB: ASSISTANT CHAT -------------------- */}
      {activeTab === 'chat' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[550px] animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles size={20} className="text-primary animate-pulse" /> Asistente de IA Electoral
            </h2>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} /> Filtros de Seguridad Activos
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-2 bg-slate-50 rounded-xl border mb-4 max-h-[350px]">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex gap-3 max-w-[80%] rounded-xl p-3 text-sm shadow-xs",
                  msg.sender === 'user' ? "ml-auto bg-primary text-white" : "mr-auto bg-white border border-slate-100 text-slate-800"
                )}
              >
                <div>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.blocked && (
                    <span className="text-[10px] font-bold text-red-600 mt-2 block bg-red-50 p-1 rounded border border-red-200">
                      CONSULTA BLOQUEADA: INYECCIÓN O EXFILTRACIÓN DETECTADA
                    </span>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 max-w-[50px] mr-auto bg-white border rounded-xl p-3 text-slate-400">
                <span className="animate-pulse">...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <Input 
              placeholder="Haz una consulta agregada, ej: ¿Cuántos electores hay?"
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={chatLoading}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}

      {/* -------------------- MODAL: REGISTER MODEL -------------------- */}
      {isRegisteringModel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Modelo de IA</h3>
              <button onClick={() => setIsRegisteringModel(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                X
              </button>
            </div>
            
            <form onSubmit={handleRegisterModel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Nombre del Modelo</label>
                <Input required placeholder="Ej: XGBoost Electoral Forecast" value={modelForm.name} onChange={(e) => setModelForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Versión</label>
                  <Input required placeholder="v1.2.0" value={modelForm.version} onChange={(e) => setModelForm(prev => ({ ...prev, version: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo Predicción</label>
                  <select 
                    value={modelForm.type}
                    onChange={(e) => setModelForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                  >
                    <option value="ANOMALY">Anomalías</option>
                    <option value="FORECAST">Predicción / Tendencias</option>
                    <option value="SIMULATION">Simulaciones What-If</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Algoritmo Base</label>
                <Input required placeholder="Ej: Random Forest Regressor" value={modelForm.algorithm} onChange={(e) => setModelForm(prev => ({ ...prev, algorithm: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsRegisteringModel(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: AUDIT/RESOLVE ALERT -------------------- */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Auditar Alerta de Anomalía</h3>
              <button onClick={() => setSelectedAlert(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                X
              </button>
            </div>
            
            <form onSubmit={handleResolveAlert} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Alerta</label>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedAlert.description}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Calificación Auditoría</label>
                <select 
                  value={resolveForm.status}
                  onChange={(e) => setResolveForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none"
                >
                  <option value="CONFIRMED">Confirmada (Confirmar anomalía/riesgo)</option>
                  <option value="DISMISSED">Falso Positivo (Ignorar alerta)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Nota de Resolución</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Detalles sobre la auditoría y por qué se confirma/descarta."
                  value={resolveForm.note}
                  onChange={(e) => setResolveForm(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedAlert(null)}>Cancelar</Button>
                <Button type="submit">Guardar Auditoría</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
