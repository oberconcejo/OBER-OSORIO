import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LusionBackground } from '../../../components/LusionBackground';
import { LusionCursor } from '../../../components/LusionCursor';
import { saveDemoLeadToSupabase, testSupabaseConnection, registerNewClient, PANEL_ADMIN_URL, SUPABASE_URL } from '../lib/supabase';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  MapPin,
  Lock,
  Play,
  X,
  Menu,
  Target,
  Database,
  Check,
  CheckCircle2,
  Activity,
  Award,
  Globe,
  FileText,
  Compass
} from 'lucide-react';

interface RedSunBeeCampaignLandingProps {
  onLogin?: () => void;
}

type ModuleTab = 'administrative' | 'territory' | 'strategy' | 'crm';

export const RedSunBeeCampaignLanding: React.FC<RedSunBeeCampaignLandingProps> = ({ onLogin }) => {
  // Navigation & Modal State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModuleTab>('administrative');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalFullName, setModalFullName] = useState('');
  const [modalCampaignName, setModalCampaignName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [registeredPanelUrl, setRegisteredPanelUrl] = useState(PANEL_ADMIN_URL);

  // Notification Toast State
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'info' }>>([]);

  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Pillars detail data
  const moduleDetails = {
    administrative: {
      title: 'Gestión Administrativa',
      icon: ShieldCheck,
      color: 'from-cyan-400 to-blue-600',
      shadowColor: 'rgba(6, 182, 212, 0.4)',
      description: 'Solución de gobernanza de nivel empresarial que centraliza el control de accesos, roles adaptativos, auditoría forense inalterable y supervisión presupuestaria electoral.',
      features: [
        'Control de acceso granular basado en roles (RBAC)',
        'Auditoría forense inalterable de logs de seguridad',
        'Configuración centralizada de parámetros del sistema',
        'Administración y asignación de personal electoral (Testigos y Jurados)',
        'Seguimiento presupuestario y fiscal alineado a normativas CNE'
      ]
    },
    territory: {
      title: 'Gestión Territorial',
      icon: MapPin,
      color: 'from-emerald-400 to-teal-600',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      description: 'Cartografía avanzada y análisis geoespacial de datos para la coordinación del despliegue en territorio, mapeo de puestos electorales y optimización de rutas operativas.',
      features: [
        'Visualización cartográfica interactiva y mapas de calor electoral',
        'Zonificación municipal detallada (comunas, corregimientos y barrios)',
        'Consola de monitoreo y alertas de incidencias en territorio',
        'Asignación inteligente de coordinadores y líderes geográficos',
        'Muestreo y reporte de cobertura de puestos en tiempo real'
      ]
    },
    strategy: {
      title: 'Gestión Estratégica',
      icon: Target,
      color: 'from-purple-400 to-indigo-600',
      shadowColor: 'rgba(168, 85, 247, 0.4)',
      description: 'Comando de control inteligente impulsado por IA para la definición de metas electorales, predicción de tendencias de votación y análisis estratégico del censo.',
      features: [
        'Modelos predictivos de tendencias y umbrales de votación',
        'Cuadro de mando integral (KPIs) en tiempo real',
        'Consolidación y análisis cuantitativo del censo electoral',
        'Planificación interactiva del cronograma e hitos clave de campaña',
        'Evaluación de datos históricos y proyecciones de intención de voto'
      ]
    },
    crm: {
      title: 'CRM Electoral',
      icon: Users,
      color: 'from-orange-400 to-red-600',
      shadowColor: 'rgba(249, 115, 22, 0.4)',
      description: 'Plataforma unificada de gestión de relaciones (CRM) para organizar bases de datos de simpatizantes, optimizar estructuras de líderes y habilitar canales de comunicación automatizados.',
      features: [
        'Ficha única consolidada de simpatizantes y líderes de red',
        'Gestión estructurada de redes de fidelización piramidal',
        'Segmentación avanzada de votantes por puesto, mesa y perfil',
        'Integración de mensajería multicanal automatizada (WhatsApp y SMS)',
        'Reportes integrales de retención y efectividad del voto'
      ]
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmail.trim() || !modalPassword.trim() || !modalFullName.trim() || !modalCampaignName.trim()) {
      setModalError('Por favor completa todos los campos requeridos.');
      return;
    }
    
    if (modalPassword.length < 8) {
      setModalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setModalLoading(true);
    setModalError(null);
    
    const result = await registerNewClient({
      fullName: modalFullName,
      email: modalEmail,
      password: modalPassword,
      campaignName: modalCampaignName,
      phone: modalPhone,
    });

    setModalLoading(false);

    if (!result.success) {
      setModalError(result.error || 'Error al registrar. Intenta nuevamente.');
      return;
    }

    setModalSubmitted(true);
    setRegisteredPanelUrl(result.panelUrl || PANEL_ADMIN_URL);
    addNotification('¡Cuenta creada exitosamente para ' + modalEmail + '!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased flex flex-col justify-between overflow-x-hidden relative">
      <LusionBackground />
      <LusionCursor />
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Navigation Header */}
      <div className="sticky top-0 z-50 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-extrabold tracking-tight text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Electoral360
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Quiénes Somos</a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Características</a>
            <a href="#modules" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Módulos</a>
            <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Planes</a>
            <a href="#cta" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Solicitar Demo</a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onLogin}
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Acceso a Módulos
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[72px] left-0 w-full bg-[#020617]/95 border-b border-white/5 backdrop-blur-xl z-40 px-6 py-8 flex flex-col gap-6"
          >
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-300 hover:text-white"
            >
              Quiénes Somos
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-300 hover:text-white"
            >
              Características
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-300 hover:text-white"
            >
              Módulos
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-300 hover:text-white"
            >
              Planes
            </a>
            <a
              href="#cta"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-300 hover:text-white"
            >
              Solicitar Demo
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onLogin) onLogin();
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              Acceso a Módulos
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-semibold mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              Plataforma Electoral Premium 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-tight"
          >
            Gobierna tu campaña con <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              inteligencia y precisión
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 font-light leading-relaxed"
          >
            El software más avanzado para gestión territorial, análisis de votantes y estrategia en tiempo real. Convierte datos en votos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col sm:flex-row justify-center gap-6 pt-4"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:-translate-y-1 cursor-pointer"
            >
              Comenzar Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center justify-center bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white px-8 py-4 rounded-full text-lg font-bold transition-all cursor-pointer hover:scale-[1.01]"
            >
              Acceso a Módulos
            </button>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-panel rounded-3xl p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] -translate-y-1/2 translate-x-1/3 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_60%)] rounded-full pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-10">
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] mb-4 flex items-center justify-center">
                <Users className="w-10 h-10" />
              </div>
              <div className="text-5xl font-black mb-2 text-white">+500k</div>
              <div className="text-cyan-200/70 font-medium text-lg uppercase tracking-wider">Votantes Gestionados</div>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] mb-4 flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
              <div className="text-5xl font-black mb-2 text-white">+50</div>
              <div className="text-purple-200/70 font-medium text-lg uppercase tracking-wider">Campañas Exitosas</div>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] mb-4 flex items-center justify-center">
                <Activity className="w-10 h-10" />
              </div>
              <div className="text-5xl font-black mb-2 text-white">99.9%</div>
              <div className="text-blue-200/70 font-medium text-lg uppercase tracking-wider">Uptime del Sistema</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Who We Are & Mission */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Nuestra Misión</span>
            <h2 className="text-4xl font-display font-black text-white leading-tight">
              Tecnología e Inteligencia de Datos para <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Campañas Triunfadoras
              </span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed font-light">
              Somos un equipo multidisciplinario de ingenieros de software, analistas de datos y consultores de estrategia electoral dedicados a transformar la forma en que se estructuran y ejecutan las campañas en la era digital. 
            </p>
            <p className="text-slate-400 text-base leading-relaxed font-light">
              Nuestra meta es democratizar herramientas analíticas avanzadas que antes estaban reservadas únicamente para presupuestos presidenciales de escala masiva. Con <strong>Electoral360</strong>, permitimos que candidaturas de todos los niveles organicen su territorio con precisión quirúrgica, prevengan riesgos de fraude y optimicen su comunicación en base a hechos medibles, no a especulaciones.
            </p>
          </div>

          {/* Right: Core Values Cards */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Alcance y Cobertura 360°</h4>
                <p className="text-slate-400 text-xs mt-1 leading-normal font-light">
                  Integración total de redes, territorio, censo y control electoral en una sola interfaz en tiempo real.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Transparencia y Ciberseguridad</h4>
                <p className="text-slate-400 text-xs mt-1 leading-normal font-light">
                  Protocolos robustos de cifrado, cumplimiento estricto de Habeas Data y registros de auditoría electoral (Audit Logs).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Acompañamiento Estratégico</h4>
                <p className="text-slate-400 text-xs mt-1 leading-normal font-light">
                  Soporte técnico dedicado, monitoreo del Día E en vivo y capacitación constante para líderes y coordinadores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE / FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: text */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
              Una arquitectura diseñada para <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">ganar</span>
            </h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              Nuestra plataforma no es solo un gestor de contactos. Es un ecosistema completo que integra el análisis territorial, la recolección de datos en campo, encuestas en vivo y proyecciones basadas en inteligencia artificial.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm font-medium">Despliegue rápido de servidores</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm font-medium">Sincronización en tiempo real</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm font-medium">Protección de datos (extremo a extremo)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm font-medium">Soporte técnico y estratégico 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CRM de Votantes</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Gestiona tu base de datos de líderes y simpatizantes con segmentación avanzada y perfiles detallados.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Control Territorial</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Mapeo en tiempo real de lugares de votación, testigos y cobertura electoral con geolocalización.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Análisis Estratégico</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Dashboards en vivo con proyecciones y resultados basados en inteligencia de datos reales.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#020617] border border-white/5 shadow-xl hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Auditoría Total</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Control de acceso basado en roles y trazabilidad completa de cada acción para máxima seguridad.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* MODULES / TABS PREVIEW SECTION */}
      <section id="modules" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-display font-black text-white tracking-tight">
            Módulos Estratégicos de Campaña
          </h2>
          <p className="text-slate-400 text-base font-light">
            Explore las funcionalidades de cada pilar fundamental para el control total del comando electoral.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: tab triggers */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {(Object.keys(moduleDetails) as Array<ModuleTab>).map((key) => {
              const item = moduleDetails[key];
              const Icon = item.icon;
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={"w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer " + (
                    isActive
                      ? 'bg-[#0F172A] border-cyan-500/30 text-white shadow-lg shadow-cyan-500/5'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{item.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: tab contents preview */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-3xl bg-[#0F172A] border border-white/5 flex flex-col justify-between min-h-[400px] shadow-2xl relative overflow-hidden"
                >
                  {/* Neon Glow Node */}
                  <div
                    className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-40 pointer-events-none transition-all duration-300"
                    style={{ backgroundColor: moduleDetails[activeTab].shadowColor }}
                  />

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        {React.createElement(moduleDetails[activeTab].icon, { className: 'w-6 h-6' })}
                      </div>
                      <h3 className="text-2xl font-black text-white">{moduleDetails[activeTab].title}</h3>
                    </div>

                    <p className="text-slate-300 text-lg font-light leading-relaxed">
                      {moduleDetails[activeTab].description}
                    </p>

                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Funcionalidades Incluidas:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {moduleDetails[activeTab].features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-8 mt-auto">
                    <button
                      onClick={onLogin}
                      className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center group cursor-pointer"
                    >
                      <span>Iniciar Sesión para Ingresar</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section id="pricing" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Planes y Tarifas</span>
          <h2 className="text-4xl font-display font-black text-white tracking-tight">
            Planes Flexibles para Cada Escala Electoral
          </h2>
          <p className="text-slate-400 text-base font-light">
            Selecciona la solución que mejor se adapte a las metas y dimensiones de tu contienda electoral.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1 */}
          <div className="p-8 rounded-3xl bg-[#0F172A]/50 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan Básico</span>
                <h3 className="text-2xl font-black text-white mt-2">Inicial</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">Acceso esencial a herramientas integrales de analítica y gestión electoral.</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-black text-white">$499</span>
                <span className="text-xs text-slate-400 font-mono"> USD / mes</span>
              </div>
              <ul className="space-y-3 border-t border-white/5 pt-6 text-sm text-slate-300 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Hasta 10,000 Simpatizantes (CRM)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Hasta 20 Puestos de Votación</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Gestión de hasta 50 Testigos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Soporte Estándar por Email</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm cursor-pointer"
              >
                Solicitar Demo Inicial
              </button>
            </div>
          </div>

          {/* Plan 2 - Destacado */}
          <div className="p-8 rounded-3xl bg-[#0F172A] border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-2xl relative overflow-hidden ring-2 ring-cyan-500/20">
            {/* Featured Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-600 px-4 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              Popular / Recomendado
            </div>
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Plan Recomendado</span>
                <h3 className="text-2xl font-black text-white mt-2">Profesional</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">Capacidades analíticas avanzadas, IA en tiempo real y soporte técnico prioritario.</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-black text-white">$1,299</span>
                <span className="text-xs text-slate-400 font-mono"> USD / mes</span>
              </div>
              <ul className="space-y-3 border-t border-white/5 pt-6 text-sm text-slate-200 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span><strong>Simpatizantes Ilimitados (CRM)</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Mapeo del 100% de Puestos Electorales</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Testigos y Jurados Electorales Ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Proyecciones IA y Análisis de Sentimiento</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Soporte Prioritario 24/7 y Capacitación</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all text-sm cursor-pointer"
              >
                Comenzar Demo Profesional
              </button>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-3xl bg-[#0F172A]/50 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all shadow-xl relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan Corporativo</span>
                <h3 className="text-2xl font-black text-white mt-2">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">Servidor dedicado con cifrado militar, integraciones a medida y soporte en tiempo real.</p>
              </div>
              <div className="py-2">
                <span className="text-4xl font-black text-white">A Medida</span>
              </div>
              <ul className="space-y-3 border-t border-white/5 pt-6 text-sm text-slate-300 font-light">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Federación de Múltiples Campañas en Red</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Servidor Dedicado en la Nube con Cifrado Militar</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>API Exclusiva de Integración con WhatsApp/SMS</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Analistas y Estrategas Dedicados en Comando</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm cursor-pointer"
              >
                Contactar a Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BOTTOM BANNER */}
      <section id="cta" className="py-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center border-t border-white/5">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight">
            ¿Listo para llevar tu campaña al siguiente nivel?
          </h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed max-w-xl mx-auto">
            Únete a las campañas más innovadoras que ya están utilizando nuestra tecnología para asegurar la victoria.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Solicitar una demostración
            </button>
          </div>
        </div>
      </section>

      {/* Footer corporate details */}
      <footer className="relative z-10 bg-[#020617] border-t border-white/5 pt-16 pb-8 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-display font-extrabold text-white tracking-tight">Electoral360</span>
            </div>
            <p className="text-xs text-slate-500 font-light leading-relaxed max-w-sm">
              Electoral360 es la plataforma premium de analítica geoespacial y gestión de datos electorales. Desarrollada bajo los más estrictos estándares de ciberseguridad, encriptación y cumplimiento de normativas de protección de datos personales (Habeas Data).
            </p>
            <div className="text-xs text-slate-500 space-y-1.5 pt-2">
              <p className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                <span>Soporte Global: info@electoral360.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                <span>Bogotá, Colombia - Operación Latinoamericana</span>
              </p>
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Módulos</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><a href="#modules" className="hover:text-white transition-colors">Administrativo</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Territorial</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">Estratégico</a></li>
              <li><a href="#modules" className="hover:text-white transition-colors">CRM de Votantes</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Cumplimiento</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><a href="#about" className="hover:text-white transition-colors">Quiénes Somos</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Planes de Suscripción</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Términos de Servicio</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Tratamiento de Datos</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Soporte Técnico 24/7</h4>
            <p className="text-xs text-slate-500 leading-normal font-light">
              Nuestro centro de operaciones está disponible para brindarle soporte táctico antes y durante toda la jornada electoral del Día E.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
              >
                Abrir Ticket de Soporte
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Electoral360. Todos los derechos reservados. Marca registrada.</p>
          <div className="flex gap-4">
            <a href="#features" className="hover:underline">Políticas de Privacidad</a>
            <a href="#features" className="hover:underline">Seguridad de Datos</a>
            <a href="#features" className="hover:underline">Términos y Condiciones</a>
          </div>
        </div>
      </footer>

      {/* REGISTRATION MODAL / LEAD CAPTURE */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-[#0F172A] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-[10px]" />

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Solicitar Acceso</h3>
                  <p className="text-sm text-slate-400 mt-1 font-light">Crea tu cuenta de campaña para comenzar de inmediato.</p>
                </div>

                {modalSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white">¡Registro Exitoso!</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                      Tu cuenta ha sido creada exitosamente. Puedes acceder a tu panel de control de campaña en la siguiente dirección:
                    </p>
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs text-cyan-300 font-mono select-all truncate">
                      {registeredPanelUrl}
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                      <a
                        href={registeredPanelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Ir al Panel de Campaña</span>
                      </a>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setModalSubmitted(false);
                          setModalEmail('');
                          setModalFullName('');
                          setModalCampaignName('');
                          setModalPassword('');
                          setModalPhone('');
                        }}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Cerrar Ventana
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    {modalError && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-normal">
                        {modalError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={modalFullName}
                        onChange={(e) => setModalFullName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="Ej. juan@campana.com"
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nombre de la Campaña *</label>
                      <input
                        type="text"
                        required
                        value={modalCampaignName}
                        onChange={(e) => setModalCampaignName(e.target.value)}
                        placeholder="Ej. Campaña Alcaldía 2026"
                        className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Celular / Teléfono</label>
                        <input
                          type="tel"
                          value={modalPhone}
                          onChange={(e) => setModalPhone(e.target.value)}
                          placeholder="Ej. 3001234567"
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contraseña *</label>
                        <input
                          type="password"
                          required
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="Mín. 8 caracteres"
                          className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={modalLoading}
                        className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {modalLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Crear Cuenta de Campaña</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Notifications list */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={"p-4 rounded-xl border pointer-events-auto shadow-lg text-sm flex items-start gap-2.5 " + (
                n.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-900/90 border-white/10 text-slate-200'
              )}
            >
              {n.type === 'success' ? <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
              <span>{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};