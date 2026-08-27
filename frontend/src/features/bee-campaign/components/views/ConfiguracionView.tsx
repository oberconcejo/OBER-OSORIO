import React, { useState, useEffect } from 'react';
import { ViewMode } from '../../types';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Database, 
  Key, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Check,
  Contrast,
  Sun,
  Moon,
  Type,
  MousePointerClick,
  Accessibility,
  Sparkles
} from 'lucide-react';

interface ConfiguracionViewProps {
  onSelectView: (view: ViewMode) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({ onSelectView }) => {
  const [activeTab, setActiveTab] = useState<'seguridad' | 'notificaciones' | 'api' | 'base_datos'>('seguridad');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [campaignName, setCampaignName] = useState('Campaña Presidencial Javier Méndez 2026');
  const [candidateName, setCandidateName] = useState('Javier Méndez');
  const [jurisdiction, setJurisdiction] = useState('Colombia - Cobertura Nacional');
  const [electionDate, setElectionDate] = useState('2026-05-24');
  const [targetVotes, setTargetVotes] = useState('8,500,000');

  // Accessibility & Theme states
  const [themeMode, setThemeMode] = useState<'dark' | 'high_contrast' | 'light'>(() => {
    return (localStorage.getItem('bee_theme_mode') as any) || 'dark';
  });
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('bee_font_scale') as any) || 'normal';
  });
  const [enhancedFocus, setEnhancedFocus] = useState<boolean>(() => {
    return localStorage.getItem('bee_enhanced_focus') === 'true';
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return localStorage.getItem('bee_reduce_motion') === 'true';
  });
  const [underlineLinks, setUnderlineLinks] = useState<boolean>(() => {
    return localStorage.getItem('bee_underline_links') === 'true';
  });

  // Apply accessibility classes to documentElement
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme High Contrast
    if (themeMode === 'high_contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('bee_theme_mode', themeMode);

    // Font Scale
    root.classList.remove('font-scale-lg', 'font-scale-xl');
    if (fontScale === 'large') root.classList.add('font-scale-lg');
    if (fontScale === 'xlarge') root.classList.add('font-scale-xl');
    localStorage.setItem('bee_font_scale', fontScale);

    // Enhanced Focus Rings
    if (enhancedFocus) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    localStorage.setItem('bee_enhanced_focus', String(enhancedFocus));

    // Reduce Motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('bee_reduce_motion', String(reduceMotion));

    // Underline Links
    if (underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }
    localStorage.setItem('bee_underline_links', String(underlineLinks));
  }, [themeMode, fontScale, enhancedFocus, reduceMotion, underlineLinks]);

  // Security settings
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [geofenceRadius, setGeofenceRadius] = useState('100');

  // Notifications settings
  const [alertE14Discrepancy, setAlertE14Discrepancy] = useState(true);
  const [alertBudgetOverrun, setAlertBudgetOverrun] = useState(true);
  const [alertSocialCrisis, setAlertSocialCrisis] = useState(true);
  const [dailyDigestEmail, setDailyDigestEmail] = useState(false);

  // API Keys state
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-73918239102938102938109238');
  const [whatsappApiKey, setWhatsappApiKey] = useState('WA_PRO_LIVE_992182019203910293');
  const [mapsApiKey, setMapsApiKey] = useState('AIzaSyB-8837192837129837129837129');

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleSyncDatabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 1500);
  };

  const handlePresetAccessibility = (preset: 'standard' | 'high_contrast' | 'maximum') => {
    if (preset === 'standard') {
      setThemeMode('dark');
      setFontScale('normal');
      setEnhancedFocus(false);
      setReduceMotion(false);
      setUnderlineLinks(false);
    } else if (preset === 'high_contrast') {
      setThemeMode('high_contrast');
      setFontScale('large');
      setEnhancedFocus(true);
      setReduceMotion(false);
      setUnderlineLinks(true);
    } else if (preset === 'maximum') {
      setThemeMode('high_contrast');
      setFontScale('xlarge');
      setEnhancedFocus(true);
      setReduceMotion(true);
      setUnderlineLinks(true);
    }
  };

  const tabs = [
    { id: 'seguridad', label: 'Seguridad y Roles', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'notificaciones', label: 'Alertas', icon: <Bell className="w-4 h-4" /> },
    { id: 'api', label: 'Claves API', icon: <Key className="w-4 h-4" /> },
    { id: 'base_datos', label: 'Datos y Sync', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#020617] text-slate-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-gradient-to-r from-[#061c36] via-[#08284c] to-[#041226] p-6 rounded-3xl border border-cyan-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wide">
                Configuración del Sistema
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                v2.6 PRO
              </span>
              {themeMode === 'high_contrast' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/50">
                  WCAG AA ALTO CONTRASTE
                </span>
              )}
            </div>

          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white animate-bounce" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Floating Notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div>
            <div className="font-bold text-xs">Configuración Actualizada</div>
            <div className="text-[11px] text-emerald-100">Los cambios se aplicaron exitosamente en todo el sistema.</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-[#07172e] border border-cyan-500/20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: SEGURIDAD Y ROLES */}
      {activeTab === 'seguridad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#07172e] border border-cyan-500/20 space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Políticas de Autenticación y Sesión
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030e1f] border border-cyan-500/20">
                <div>
                  <div className="text-xs font-bold text-white">Exigir Autenticación de Dos Factores (2FA)</div>
                  <div className="text-[10px] text-slate-400">Obligatorio para Coordinadores Electorales y Admin</div>
                </div>
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Cierre de Sesión por Inactividad (Minutos)</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-[#030b19] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="15">15 Minutos</option>
                  <option value="30">30 Minutos (Recomendado)</option>
                  <option value="60">60 Minutos</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Radio Máximo de Verificación Geofence para Testigos (Metros)</label>
                <select
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                  className="w-full bg-[#030b19] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="50">50 Metros (Máxima Precisión)</option>
                  <option value="100">100 Metros (Estándar)</option>
                  <option value="250">250 Metros (Zonas Rurales)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#07172e] border border-cyan-500/20 space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Auditoría y Permisos Jerárquicos
            </h2>

            <div className="p-4 rounded-2xl bg-[#030e1f] border border-cyan-500/10 space-y-2 text-xs">
              <div className="font-bold text-cyan-300">Roles Configurados en el Sistema:</div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li><strong className="text-white">Superadmin:</strong> Acceso total a todos los módulos y claves API.</li>
                <li><strong className="text-white">Administrador:</strong> Gestión de usuarios y nómina.</li>
                <li><strong className="text-white">Director Estratégico:</strong> DAFO, presupuestos e IA.</li>
                <li><strong className="text-white">Coordinador Territorial:</strong> Mapas, actas E-14 y testigos.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTIFICACIONES */}
      {activeTab === 'notificaciones' && (
        <div className="p-6 rounded-3xl bg-[#07172e] border border-cyan-500/20 space-y-4 max-w-3xl">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Preferencias de Alertas en Tiempo Real
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030e1f] border border-cyan-500/20">
              <div>
                <div className="text-xs font-bold text-white">Alertar Inconsistencias Aritméticas E-14</div>
                <div className="text-[10px] text-slate-400">Notificar inmediatamente cuando el OCR detecte alteración de votos</div>
              </div>
              <input
                type="checkbox"
                checked={alertE14Discrepancy}
                onChange={(e) => setAlertE14Discrepancy(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030e1f] border border-cyan-500/20">
              <div>
                <div className="text-xs font-bold text-white">Alerta de Umbral de Presupuesto (&gt;80%)</div>
                <div className="text-[10px] text-slate-400">Avisar a tesorería cuando una categoría supere el límite asignado</div>
              </div>
              <input
                type="checkbox"
                checked={alertBudgetOverrun}
                onChange={(e) => setAlertBudgetOverrun(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030e1f] border border-cyan-500/20">
              <div>
                <div className="text-xs font-bold text-white">Alerta de Crisis en Redes Sociales</div>
                <div className="text-[10px] text-slate-400">Gatillar cuando se detecten más de 500 menciones negativas por hora</div>
              </div>
              <input
                type="checkbox"
                checked={alertSocialCrisis}
                onChange={(e) => setAlertSocialCrisis(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030e1f] border border-cyan-500/20">
              <div>
                <div className="text-xs font-bold text-white">Resumen Diario por Correo Electrónico</div>
                <div className="text-[10px] text-slate-400">Enviar informe ejecutivo consolidado cada medianoche</div>
              </div>
              <input
                type="checkbox"
                checked={dailyDigestEmail}
                onChange={(e) => setDailyDigestEmail(e.target.checked)}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: API KEYS */}
      {activeTab === 'api' && (
        <div className="p-6 rounded-3xl bg-[#07172e] border border-cyan-500/20 space-y-4 max-w-3xl">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Gestión de Integraciones y Claves API
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Gemini AI API Key (Servidor)</label>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-[#030b19] border border-cyan-500/30 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">WhatsApp Business API Key (Broadcast)</label>
              <input
                type="password"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
                className="w-full bg-[#030b19] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Google Maps Platform API Key (Geofencing)</label>
              <input
                type="password"
                value={mapsApiKey}
                onChange={(e) => setMapsApiKey(e.target.value)}
                className="w-full bg-[#030b19] border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DATABASE AND SYNC */}
      {activeTab === 'base_datos' && (
        <div className="p-6 rounded-3xl bg-[#07172e] border border-cyan-500/20 space-y-4 max-w-3xl">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Estado de Sincronización y Respaldo
          </h2>

          <div className="p-4 rounded-2xl bg-[#030e1f] border border-cyan-500/20 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Base de Datos Sincronizada en Nube
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Última sync realizada hace 2 minutos (Firestore / Cloud SQL)</div>
            </div>

            <button
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Exportar Respaldo Completo (JSON)</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
