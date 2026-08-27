import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Activity,
  Compass,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ViewMode } from '../types';

interface ModuleSelectPageProps {
  onBack: () => void;
  onSelectModule: (view: ViewMode) => void;
  onOpenLogin?: () => void;
}

const modules = [
  {
    id: 'admin',
    targetView: 'modulo_admin' as ViewMode,
    icon: ShieldCheck,
    gradient: 'from-cyan-900/60 via-slate-900 to-blue-950/80',
    glow: 'shadow-cyan-600/40',
    border: 'border-cyan-500/30',
    title: 'Gestión Administrativa',
    subtitle: 'Nómina, Presupuesto CNE, Auditoría, Roles y Seguridad',
    features: [
      'Gestión de Roles y privilegios de acceso RBAC',
      'Administración de Nómina de Campaña y Contratos',
      'Control de Presupuesto e ingresos/egresos para reporte CNE',
      'Auditoría inalterable de Audit Logs y Cuentas Claras'
    ],
    buttonText: 'Acceso Protegido - Gestión Administrat...',
    iconBg: 'bg-cyan-950/80 border border-cyan-500/30',
    iconColor: 'text-cyan-400',
    bulletColor: 'text-cyan-400',
    buttonStyle: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    spotlightGradient: 'radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(59,130,246,0.25) 50%, transparent 100%)'
  },
  {
    id: 'estrategica',
    targetView: 'gestion_estrategica' as ViewMode,
    icon: Activity,
    gradient: 'from-teal-900/60 via-slate-900 to-cyan-950/80',
    glow: 'shadow-teal-600/40',
    border: 'border-teal-500/30',
    title: 'Gestión Estratégica',
    subtitle: 'Diagnóstico AI, Programa de Gobierno, Redes y DOFA AI',
    features: [
      'Diagnóstico 360° AI y matriz DOFA automatizada',
      'Análisis de Sentimiento Digital y tendencias en redes',
      'Programa de Gobierno interactivo y perfil del candidato',
      'Agenda, calendario electoral y análisis de debates'
    ],
    buttonText: 'Acceso Protegido - Gestión Estratégica',
    iconBg: 'bg-teal-950/80 border border-teal-500/30',
    iconColor: 'text-teal-400',
    bulletColor: 'text-teal-400',
    buttonStyle: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]',
    spotlightGradient: 'radial-gradient(circle, rgba(20,184,166,0.45) 0%, rgba(16,185,129,0.25) 50%, transparent 100%)'
  },
  {
    id: 'territorial',
    targetView: 'gestion_territorial' as ViewMode,
    icon: Compass,
    gradient: 'from-purple-900/60 via-slate-900 to-indigo-950/80',
    glow: 'shadow-purple-600/40',
    border: 'border-purple-500/30',
    title: 'Gestión Territorial',
    subtitle: 'Registro de Votantes, Testigos, Cobertura y Jurados',
    features: [
      'Registro individual/masivo de votantes y asignación de líderes',
      'Mapa de cobertura y distribución electoral',
      'Gestión de testigos electorales y jurados en mesa',
      'Muestreo de encuestas y escrutinio del Día E'
    ],
    buttonText: 'Acceso Protegido - Gestión Territorial',
    iconBg: 'bg-purple-950/80 border border-purple-500/30',
    iconColor: 'text-purple-400',
    bulletColor: 'text-purple-400',
    buttonStyle: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    spotlightGradient: 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(99,102,241,0.25) 50%, transparent 100%)'
  }
];

export function ModuleSelectPage({ onBack, onSelectModule, onOpenLogin }: ModuleSelectPageProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-start sm:justify-center px-3 sm:px-6 py-6 sm:py-12 md:py-16 relative overflow-x-hidden text-slate-100">
      {/* Dynamic Keyframe Style for Hover Color Shift Animation */}
      <style>{`
        @keyframes colorCycleBorder {
          0% {
            border-color: rgba(6, 182, 212, 0.9);
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.5), inset 0 0 25px rgba(6, 182, 212, 0.2);
          }
          25% {
            border-color: rgba(16, 185, 129, 0.9);
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.5), inset 0 0 25px rgba(16, 185, 129, 0.2);
          }
          50% {
            border-color: rgba(168, 85, 247, 0.9);
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), inset 0 0 25px rgba(168, 85, 247, 0.2);
          }
          75% {
            border-color: rgba(245, 158, 11, 0.9);
            box-shadow: 0 0 40px rgba(245, 158, 11, 0.5), inset 0 0 25px rgba(245, 158, 11, 0.2);
          }
          100% {
            border-color: rgba(6, 182, 212, 0.9);
            box-shadow: 0 0 40px rgba(6, 182, 212, 0.5), inset 0 0 25px rgba(6, 182, 212, 0.2);
          }
        }

        .animated-card-glow {
          animation: colorCycleBorder 3.5s infinite linear;
        }
      `}</style>

      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-[90px] opacity-60" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-violet-600/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 rounded-full blur-[90px] opacity-50" />
      </div>

      {/* Top action bar */}
      <div className="relative z-20 w-full max-w-5xl flex items-center justify-between gap-2 mb-6 sm:mb-8">
        <button
          onClick={onBack}
          aria-label="Volver al Portal"
          className="flex items-center gap-1.5 sm:gap-2 px-3 xs:px-4 py-2 sm:py-2.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs sm:text-sm font-medium cursor-pointer min-h-[38px] sm:min-h-[40px] shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Volver al Portal</span>
          <span className="xs:hidden">Volver</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6 sm:gap-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              Seleccione el Módulo de Operación
            </h1>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
              Acceda directamente al pilar estratégico correspondiente.
            </p>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isHovered = hovered === mod.id;

            return (
              <div
                key={mod.id}
                onMouseEnter={() => setHovered(mod.id)}
                onMouseLeave={() => setHovered(null)}
                onMouseMove={handleCardMouseMove}
                onClick={() => onSelectModule(mod.targetView)}
                className={`relative group cursor-pointer rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden min-h-[390px] ${
                  isHovered
                    ? 'bg-[#0b101c]/95 opacity-100 -translate-y-2.5 scale-[1.02] z-20 animated-card-glow border-2'
                    : hovered
                    ? 'bg-[#0F172A]/70 opacity-60 scale-[0.98] border border-slate-800'
                    : `bg-[#0F172A]/90 border ${mod.border} shadow-2xl hover:-translate-y-1.5`
                }`}
              >
                {/* Dynamic Cursor Spotlight & Color Shimmer */}
                {isHovered && (
                  <div
                    className="pointer-events-none absolute rounded-full blur-3xl opacity-90 transition-opacity duration-150"
                    style={{
                      left: 'var(--mouse-x, 150px)',
                      top: 'var(--mouse-y, 150px)',
                      width: '340px',
                      height: '340px',
                      transform: 'translate(-50%, -50%)',
                      background: mod.spotlightGradient
                    }}
                  />
                )}

                {/* Opaque Background Tint Overlay on Hover */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                  isHovered ? 'bg-[#030d1d]/90 backdrop-blur-xl' : 'opacity-0'
                }`} />

                <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                  <div>
                    {/* Icon + Title Header */}
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <div className={`w-10 h-10 rounded-xl ${mod.iconBg} flex items-center justify-center ${mod.iconColor} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-white font-extrabold text-lg leading-snug">
                        {mod.title}
                      </h2>
                    </div>

                    {/* Subtitle / Micro descriptions */}
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-semibold">
                      {mod.subtitle}
                    </p>

                    {/* Feature bullet list exactly matching user image style */}
                    <div className="space-y-3 mt-5 mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Funcionalidades Principales:
                      </span>
                      {mod.features.map((ft, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 font-medium leading-tight">
                          <CheckCircle2 className={`w-4 h-4 ${mod.bulletColor} shrink-0 mt-0.5`} />
                          <span>{ft}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Access Button styled exactly like the screenshot */}
                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectModule(mod.targetView);
                      }}
                      className={`
                        w-full py-3 px-4 rounded-full font-black text-[11px] sm:text-xs tracking-wide shadow-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-white hover:scale-[1.01] active:scale-[0.99]
                        ${mod.buttonStyle}
                      `}
                    >
                      <Lock className={`w-3.5 h-3.5 ${mod.id === 'admin' ? 'text-cyan-200' : mod.id === 'operativa' ? 'text-teal-200' : 'text-purple-200'}`} />
                      <span className="truncate">{mod.buttonText}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${mod.id === 'admin' ? 'text-cyan-200' : mod.id === 'operativa' ? 'text-teal-200' : 'text-purple-200'} transition-transform group-hover:translate-x-1`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-zinc-500 text-xs text-center">
          Acceso protegido con cifrado de extremo a extremo · Sistema Electoral Inteligente · © 2026 Bee Campaign AI
        </p>
      </div>
    </div>
  );
}
