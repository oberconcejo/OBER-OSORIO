import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  Scissors, 
  Type, 
  Image as ImageIcon, 
  Film, 
  Upload, 
  Play, 
  Pause, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Sparkles, 
  Download, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  Volume2, 
  VolumeX, 
  Eye, 
  Share2, 
  Sun, 
  Contrast, 
  Droplet, 
  Palette, 
  Subtitles, 
  FileVideo, 
  CheckCircle2,
  Wand2,
  Radio,
  Clock,
  Sparkle,
  Zap,
  Tag
} from 'lucide-react';
import { MediaAttachment, PostContent } from './ComunicacionRedesView';

interface EditorMediaStudioProps {
  posts?: PostContent[];
  candidateName?: string;
  candidateRole?: string;
  onSaveEditedMedia?: (editedMedia: MediaAttachment, targetPostId?: string) => void;
  initialMedia?: MediaAttachment | null;
}

export const EditorMediaStudio: React.FC<EditorMediaStudioProps> = ({
  posts = [],
  candidateName = 'Santiago Pérez',
  candidateRole = 'Candidato a la Alcaldía',
  onSaveEditedMedia,
  initialMedia = null
}) => {
  // Main Mode: 'photo' or 'video'
  const [editorMode, setEditorMode] = useState<'photo' | 'video'>('photo');

  // PROJECT MEDIA LIST STATE (Multiple Photos & Videos in same studio session)
  const initialMediaItems: MediaAttachment[] = [
    initialMedia || {
      id: 'sample-editor-1',
      url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      name: 'Foto_Lanzamiento_Campaña.jpg',
      size: '3.2 MB'
    },
    {
      id: 'sample-editor-2',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      name: 'Foto_Recorrido_Comuna13.jpg',
      size: '2.5 MB'
    },
    {
      id: 'sample-editor-3',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      type: 'video',
      name: 'Video_Discurso_Parque.mp4',
      size: '14.8 MB'
    },
    {
      id: 'sample-editor-4',
      url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      name: 'Foto_Reunion_Empresarios.jpg',
      size: '4.1 MB'
    }
  ];

  const [projectMediaList, setProjectMediaList] = useState<MediaAttachment[]>(initialMediaItems);
  const [activeMediaId, setActiveMediaId] = useState<string>(initialMediaItems[0].id);

  // Sync if initialMedia prop changes
  useEffect(() => {
    if (initialMedia) {
      setProjectMediaList(prev => {
        const exists = prev.some(m => m.id === initialMedia.id);
        if (!exists) return [initialMedia, ...prev];
        return prev;
      });
      setActiveMediaId(initialMedia.id);
    }
  }, [initialMedia]);

  // Derive Currently Selected Asset
  const currentMedia = projectMediaList.find(m => m.id === activeMediaId) || projectMediaList[0] || initialMediaItems[0];
  const activeMediaIndex = projectMediaList.findIndex(m => m.id === currentMedia.id);

  // Target Post Selection for direct assignment
  const [targetPostId, setTargetPostId] = useState<string>('');

  // Aspect Ratio Presets
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5' | '16:9'>('9:16');

  // PHOTO ADJUSTMENT STATES
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [selectedPresetFilter, setSelectedPresetFilter] = useState<string>('normal');

  // OVERLAY / BRANDING STATES
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState(`${candidateName} • 2026`);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-left' | 'bottom-right' | 'top-right' | 'top-left'>('bottom-left');
  
  const [showBadge, setShowBadge] = useState(true);
  const [badgeText, setBadgeText] = useState('PROPUESTA OFICIAL');
  const [badgeColor, setBadgeColor] = useState<'cyan' | 'purple' | 'amber' | 'emerald' | 'rose'>('purple');

  const [customText, setCustomText] = useState('');
  const [customTextColor, setCustomTextColor] = useState('#F1F5F9');
  const [customTextBg, setCustomTextBg] = useState(true);

  // VIDEO EDITING STATES
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [videoEndTime, setVideoEndTime] = useState(30);
  const [videoDuration, setVideoDuration] = useState(30);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // AI Subtitles / Captions State
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [subtitleStyle, setSubtitleStyle] = useState<'yellow-box' | 'neon-cyan' | 'white-bold' | 'minimal-dark'>('yellow-box');
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [subtitlesList, setSubtitlesList] = useState([
    { id: 1, start: 0, end: 4, text: "¡El cambio para Medellín no puede esperar!" },
    { id: 2, start: 4, end: 8, text: "Presentamos nuestro Plan de Seguridad Inteligente Comuna 13." },
    { id: 3, start: 8, end: 12, text: "100 nuevos cuadrantes digitales con tecnología de punta." },
    { id: 4, start: 12, end: 18, text: "Oportunidades reales y becas de tecnología para todos los jóvenes." },
    { id: 5, start: 18, end: 25, text: "Vota este próximo periodo. Santiago Pérez Alcalde." }
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync editor mode with media type
  useEffect(() => {
    if (currentMedia.type === 'video') {
      setEditorMode('video');
    } else {
      setEditorMode('photo');
    }
  }, [currentMedia]);

  // Sync video playback speed property on HTMLMediaElement
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentMedia]);

  // Handle Video Time Update for Captions
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;

    // Auto loop within trim boundaries
    if (curr >= videoEndTime) {
      videoRef.current.currentTime = videoStartTime;
    }

    // Match subtitle
    const foundIdx = subtitlesList.findIndex(s => curr >= s.start && curr <= s.end);
    if (foundIdx !== -1) {
      setActiveSubtitleIndex(foundIdx);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.floor(videoRef.current.duration) || 30;
      setVideoDuration(dur);
      setVideoEndTime(Math.min(dur, 30));
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Preset Filters for Photos
  const applyPresetFilter = (filterKey: string) => {
    setSelectedPresetFilter(filterKey);
    switch (filterKey) {
      case 'politico_pro':
        setBrightness(105);
        setContrast(120);
        setSaturation(110);
        setSepia(0);
        setGrayscale(0);
        setHueRotate(0);
        break;
      case 'seguridad_hd':
        setBrightness(100);
        setContrast(130);
        setSaturation(90);
        setHueRotate(190);
        break;
      case 'calidez_humana':
        setBrightness(108);
        setContrast(105);
        setSaturation(125);
        setSepia(15);
        setHueRotate(10);
        break;
      case 'prensa_bn':
        setBrightness(110);
        setContrast(140);
        setSaturation(0);
        setGrayscale(100);
        break;
      case 'vivido_social':
        setBrightness(112);
        setContrast(115);
        setSaturation(145);
        break;
      case 'normal':
      default:
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setSepia(0);
        setGrayscale(0);
        setHueRotate(0);
        break;
    }
  };

  // Select item from project gallery
  const handleSelectMedia = (item: MediaAttachment) => {
    setActiveMediaId(item.id);
    if (item.type === 'video') {
      setEditorMode('video');
    } else {
      setEditorMode('photo');
    }
  };

  // Navigate next / previous
  const handleNavigateMedia = (direction: 'prev' | 'next') => {
    if (projectMediaList.length <= 1) return;
    let newIdx = direction === 'prev' ? activeMediaIndex - 1 : activeMediaIndex + 1;
    if (newIdx < 0) newIdx = projectMediaList.length - 1;
    if (newIdx >= projectMediaList.length) newIdx = 0;
    handleSelectMedia(projectMediaList[newIdx]);
  };

  // Upload multiple new media files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const newItems: MediaAttachment[] = [];
      let readCount = 0;

      files.forEach((file: File) => {
        const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newItems.push({
              id: `edited-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              url: event.target.result as string,
              type: isVideo ? 'video' : 'image',
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            });
            readCount++;
            if (readCount === files.length) {
              setProjectMediaList(prev => [...newItems, ...prev]);
              setActiveMediaId(newItems[0].id);
              setEditorMode(newItems[0].type === 'video' ? 'video' : 'photo');
              showFlashNotification(`¡${files.length} archivo(s) agregado(s) al proyecto multimedia!`);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Add Sample Photo
  const addSamplePhoto = () => {
    const newImg: MediaAttachment = {
      id: `sample-img-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      name: `Foto_Campaña_Comuna_${projectMediaList.length + 1}.jpg`,
      size: '3.1 MB'
    };
    setProjectMediaList(prev => [...prev, newImg]);
    setActiveMediaId(newImg.id);
    setEditorMode('photo');
    showFlashNotification('Nueva foto de muestra agregada al proyecto.');
  };

  // Add Sample Video
  const addSampleVideo = () => {
    const newVid: MediaAttachment = {
      id: `sample-vid-${Date.now()}`,
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      type: 'video',
      name: `Video_Declaracion_${projectMediaList.length + 1}.mp4`,
      size: '12.4 MB'
    };
    setProjectMediaList(prev => [...prev, newVid]);
    setActiveMediaId(newVid.id);
    setEditorMode('video');
    showFlashNotification('Nuevo video de muestra agregado al proyecto.');
  };

  // Reorder items in project sequence
  const handleMoveMedia = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projectMediaList.length) return;
    const updated = [...projectMediaList];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setProjectMediaList(updated);
  };

  // Delete item from project
  const handleDeleteMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projectMediaList.length <= 1) {
      showFlashNotification('Debes mantener al menos 1 elemento multimedia en el proyecto.');
      return;
    }
    const updated = projectMediaList.filter(m => m.id !== id);
    setProjectMediaList(updated);
    if (activeMediaId === id) {
      setActiveMediaId(updated[0].id);
      setEditorMode(updated[0].type === 'video' ? 'video' : 'photo');
    }
    showFlashNotification('Archivo eliminado del proyecto multimedia.');
  };

  // Show Flash Notification
  const showFlashNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Save / Export Single Active Asset
  const handleSaveExport = () => {
    const editedMedia: MediaAttachment = {
      ...currentMedia,
      id: `edited-${Date.now()}`,
      name: `EDITADO_${aspectRatio.replace(':', 'x')}_${currentMedia.name}`,
      size: 'Versión Pro Exportada'
    };

    if (onSaveEditedMedia) {
      onSaveEditedMedia(editedMedia, targetPostId || undefined);
    }
    showFlashNotification(`¡Pieza "${currentMedia.name}" guardada con éxito!`);
  };

  // Save / Export ALL Items in Project
  const handleExportAll = () => {
    const exportedBatch = projectMediaList.map((m, idx) => ({
      ...m,
      id: `edited-batch-${Date.now()}-${idx}`,
      name: `PROYECTO_${idx + 1}_${m.name}`,
      size: 'Pro Exportación Múltiple'
    }));

    if (onSaveEditedMedia) {
      onSaveEditedMedia(exportedBatch as any, targetPostId || undefined);
    }
    showFlashNotification(`¡Proyecto multimedia completo (${projectMediaList.length} archivos) guardado con éxito!`);
  };

  // CSS Filter string calculation for Image Preview
  const getFilterStyle = () => {
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg)`,
      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
      transition: 'all 0.2s ease-out'
    };
  };

  // Aspect Ratio CSS class mapping
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[520px] w-auto';
      case '1:1':
        return 'aspect-square max-h-[440px] w-auto';
      case '4:5':
        return 'aspect-[4/5] max-h-[480px] w-auto';
      case '16:9':
        return 'aspect-[16/9] max-h-[380px] w-full';
      default:
        return 'aspect-[9/16] max-h-[520px] w-auto';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* FLASH NOTIFICATION BANNER */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 animate-pulse" />
              <span>{notification}</span>
            </div>
            <span className="bg-[#0F172A]/20 px-2 py-0.5 rounded text-[10px] font-mono">Estudio AI Redes</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR & MEDIA MODE SWITCHER */}
      <div className="bg-[#05162a] border border-purple-500/30 p-4 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-600/30 rounded-2xl border border-pink-500/40 text-pink-300">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Estudio de Edición Multimedia & Filtros Redes
              <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase">
                Reels • TikTok • Posts
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Personaliza imágenes, aplica filtros políticos, recorta videos, edita subtítulos y añade marcos de campaña.
            </p>
          </div>
        </div>

        {/* MODE TOGGLE BUTTONS */}
        <div className="flex items-center gap-2 bg-[#030e1c] p-1.5 rounded-2xl border border-purple-500/30">
          <button
            onClick={() => {
              setEditorMode('photo');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              editorMode === 'photo'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-pink-300" />
            <span>Editor de Fotos</span>
          </button>

          <button
            onClick={() => {
              setEditorMode('video');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              editorMode === 'video'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4 text-cyan-300" />
            <span>Editor de Video (Reels/Shorts)</span>
          </button>
        </div>
      </div>

      {/* MULTI-MEDIA PROJECT GALLERY TRAY & CAROUSEL SEQUENCE */}
      <div className="bg-[#05162a] border border-pink-500/30 p-4 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500/20 rounded-xl text-pink-300 border border-pink-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                Proyecto Multimedia Activo (Múltiples Fotos y Videos)
                <span className="bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  {projectMediaList.length} {projectMediaList.length === 1 ? 'Archivo' : 'Archivos'}
                </span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Selecciona cualquier foto o video para editarlo individualmente o exportar la secuencia completa para Carrusel o Reel.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Input with multiple selection enabled */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Subir Varios Archivos</span>
            </button>

            <button
              type="button"
              onClick={addSamplePhoto}
              className="px-2.5 py-1.5 bg-[#030e1c] hover:bg-slate-800 text-pink-300 border border-pink-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
            >
              <ImageIcon className="w-3 h-3" /> + Foto
            </button>

            <button
              type="button"
              onClick={addSampleVideo}
              className="px-2.5 py-1.5 bg-[#030e1c] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
            >
              <Film className="w-3 h-3" /> + Video
            </button>

            <button
              type="button"
              onClick={handleExportAll}
              className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Todo ({projectMediaList.length})</span>
            </button>
          </div>
        </div>

        {/* HORIZONTAL CAROUSEL TAPE OF THUMBNAILS */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {projectMediaList.map((item, idx) => {
            const isSelected = item.id === currentMedia.id;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectMedia(item)}
                className={`relative group/card flex-shrink-0 w-36 bg-[#030e1c] rounded-2xl border p-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-pink-500 ring-2 ring-pink-500/50 shadow-lg shadow-pink-500/20 bg-pink-950/20 scale-[1.02]'
                    : 'border-purple-500/20 hover:border-purple-400/50 hover:bg-slate-900'
                }`}
              >
                {/* INDEX & TYPE BADGES */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-black/80 text-white font-mono text-[9px] font-bold rounded shadow border border-white/20">
                    #{idx + 1}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded shadow border ${
                    item.type === 'video'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-pink-950 text-pink-300 border-pink-500/40'
                  }`}>
                    {item.type === 'video' ? 'VIDEO' : 'FOTO'}
                  </span>
                </div>

                {/* THUMBNAIL RENDER */}
                <div className="w-full h-24 rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover opacity-80"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-cyan-300 fill-cyan-300" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* FILE INFO & REORDER / DELETE CONTROLS */}
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>{item.size || '3.0 MB'}</span>

                    {/* REORDER / DELETE ACTION BUTTONS */}
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handleMoveMedia(idx, 'left', e)}
                          title="Mover Izquierda"
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          ‹
                        </button>
                      )}
                      {idx < projectMediaList.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleMoveMedia(idx, 'right', e)}
                          title="Mover Derecha"
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        >
                          ›
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMedia(item.id, e)}
                        title="Eliminar del proyecto"
                        className="p-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded cursor-pointer"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: LIVE CANVAS PREVIEW (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#05162a] border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col items-center">
            
            {/* CANVAS TOP TOOLBAR */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3 text-xs">
              
              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                  Formato:
                </span>
                {(['9:16', '1:1', '4:5', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-purple-600 text-white border border-purple-400 shadow'
                        : 'bg-[#030e1c] text-slate-400 hover:text-white border border-purple-500/20'
                    }`}
                  >
                    {ratio === '9:16' && '📱 9:16 Reel'}
                    {ratio === '1:1' && '📸 1:1 Post'}
                    {ratio === '4:5' && '📐 4:5 Portrait'}
                    {ratio === '16:9' && '📺 16:9 Horizontal'}
                  </button>
                ))}
              </div>

              {/* NAVIGATE MULTI-MEDIA PROJECT & UPLOAD BUTTON */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#030e1c] p-1 rounded-xl border border-purple-500/20">
                  <button
                    type="button"
                    onClick={() => handleNavigateMedia('prev')}
                    disabled={projectMediaList.length <= 1}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded font-bold text-[10px] cursor-pointer"
                  >
                    ◄
                  </button>
                  <span className="text-[10px] font-mono font-extrabold text-pink-300 px-1.5">
                    {activeMediaIndex + 1} / {projectMediaList.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigateMedia('next')}
                    disabled={projectMediaList.length <= 1}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded font-bold text-[10px] cursor-pointer"
                  >
                    ►
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Añadir Archivo(s)</span>
                </button>
              </div>

            </div>

            {/* INTERACTIVE CANVAS CONTAINER */}
            <div className="w-full flex items-center justify-center p-4 bg-[#020914] rounded-2xl border border-purple-500/20 relative min-h-[420px] overflow-hidden">
              
              <div className={`relative overflow-hidden rounded-2xl shadow-2xl bg-black border border-white/10 flex items-center justify-center ${getAspectRatioClass()}`}>

                {/* MEDIA CANVAS RENDER: PHOTO MODE */}
                {editorMode === 'photo' && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.name}
                      style={getFilterStyle()}
                      className="w-full h-full object-cover"
                    />

                    {/* OVERLAY: WATERMARK / BRANDING */}
                    {showWatermark && (
                      <div className={`absolute p-3 pointer-events-none z-20 ${
                        watermarkPosition === 'bottom-left' ? 'bottom-2 left-2' :
                        watermarkPosition === 'bottom-right' ? 'bottom-2 right-2' :
                        watermarkPosition === 'top-right' ? 'top-2 right-2' : 'top-2 left-2'
                      }`}>
                        <div className="bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 shadow-xl flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                          <span className="text-xs font-black tracking-wide uppercase">{watermarkText}</span>
                        </div>
                      </div>
                    )}

                    {/* OVERLAY: BADGE / STICKER */}
                    {showBadge && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xl border backdrop-blur-md ${
                          badgeColor === 'purple' ? 'bg-purple-600/90 text-white border-purple-400' :
                          badgeColor === 'cyan' ? 'bg-cyan-600/90 text-white border-cyan-400' :
                          badgeColor === 'amber' ? 'bg-amber-600/90 text-white border-amber-400' :
                          badgeColor === 'emerald' ? 'bg-emerald-600/90 text-white border-emerald-400' :
                          'bg-rose-600/90 text-white border-rose-400'
                        }`}>
                          {badgeText}
                        </span>
                      </div>
                    )}

                    {/* OVERLAY: CUSTOM HEADLINE TEXT */}
                    {customText && (
                      <div className="absolute inset-x-4 bottom-14 z-20 text-center">
                        <span 
                          style={{ color: customTextColor }}
                          className={`inline-block px-4 py-2 rounded-2xl text-sm sm:text-base font-extrabold shadow-2xl border ${
                            customTextBg ? 'bg-black/80 border-white/20 backdrop-blur-md' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]'
                          }`}
                        >
                          {customText}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* MEDIA CANVAS RENDER: VIDEO MODE */}
                {editorMode === 'video' && (
                  <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                    <video
                      ref={videoRef}
                      src={currentMedia.url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLVideoElement;
                        if (!target.dataset.fallbackTried) {
                          target.dataset.fallbackTried = 'true';
                          target.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
                        }
                      }}
                      className="w-full h-full object-cover"
                      muted={isMuted}
                    />

                    {/* VIDEO OVERLAY: AI SUBTITLES */}
                    {enableSubtitles && subtitlesList[activeSubtitleIndex] && (
                      <div className="absolute inset-x-4 bottom-12 z-20 text-center px-2">
                        <motion.div
                          key={activeSubtitleIndex}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`inline-block p-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide shadow-2xl uppercase ${
                            subtitleStyle === 'yellow-box' ? 'bg-amber-400 text-black border-2 border-black font-mono' :
                            subtitleStyle === 'neon-cyan' ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 backdrop-blur-md' :
                            subtitleStyle === 'white-bold' ? 'bg-black/85 text-white border border-white/20 backdrop-blur-md' :
                            'bg-slate-900/95 text-slate-100 border border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 justify-center mb-0.5 text-[9px] opacity-80">
                            <Subtitles className="w-3 h-3 text-current" /> SUBTÍTULOS AUTOMÁTICOS AI
                          </div>
                          {subtitlesList[activeSubtitleIndex].text}
                        </motion.div>
                      </div>
                    )}

                    {/* VIDEO OVERLAY: WATERMARK / LOGO */}
                    {showWatermark && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl border border-white/20 text-[10px] font-black uppercase">
                          {candidateName} • 2026
                        </div>
                      </div>
                    )}

                    {/* PLAYBACK OVERLAY CONTROLS */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={togglePlayPause}
                        className="p-4 bg-purple-600/90 hover:bg-[#111C30]0 text-white rounded-full shadow-2xl transition-all scale-110 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* VIDEO PLAYER CONTROL BAR (WHEN IN VIDEO MODE) */}
            {editorMode === 'video' && (
              <div className="w-full bg-[#030e1c] p-3 rounded-2xl border border-purple-500/20 space-y-3 text-xs">
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="p-2 bg-purple-600 hover:bg-[#111C30]0 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isMuted ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isMuted ? 'Silenciado' : 'Audio On'}</span>
                    </button>
                  </div>

                  {/* Playback Speed */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">Velocidad:</span>
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          if (videoRef.current) videoRef.current.playbackRate = spd;
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          playbackSpeed === spd ? 'bg-cyan-500 text-black font-extrabold' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* VIDEO TRIM SLIDERS */}
                <div className="space-y-1.5 pt-2 border-t border-purple-500/10">
                  <div className="flex justify-between items-center text-[10px] text-slate-300">
                    <span className="font-bold flex items-center gap-1 text-cyan-400">
                      <Scissors className="w-3 h-3" /> Recorte de Video (Trimmer):
                    </span>
                    <span className="font-mono text-cyan-300">
                      Punto Inicio: {videoStartTime}s | Punto Fin: {videoEndTime}s (Duración: {videoEndTime - videoStartTime}s)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold block">Tiempo Inicio ({videoStartTime}s):</label>
                      <input
                        type="range"
                        min={0}
                        max={videoDuration - 1}
                        value={videoStartTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVideoStartTime(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 font-bold block">Tiempo Fin ({videoEndTime}s):</label>
                      <input
                        type="range"
                        min={videoStartTime + 1}
                        max={videoDuration || 60}
                        value={videoEndTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVideoEndTime(val);
                        }}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* EXPORT / ASSIGN TO POST BUTTON */}
            <div className="w-full pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-purple-500/20">
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] text-slate-400 font-bold">Vincular a Publicación:</span>
                <select
                  value={targetPostId}
                  onChange={(e) => setTargetPostId(e.target.value)}
                  className="bg-[#030e1c] text-white text-xs px-3 py-1.5 rounded-xl border border-purple-500/30 outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="">(Ninguna - Guardar en Biblioteca)</option>
                  {posts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.platform}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveExport}
                  className="px-3.5 py-2 bg-[#030e1c] hover:bg-slate-800 text-pink-300 border border-pink-500/40 font-bold text-[11px] rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-pink-400" />
                  <span>Guardar Esta Pieza ({activeMediaIndex + 1}/{projectMediaList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportAll}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-200" />
                  <span>Exportar Todo ({projectMediaList.length} Archivos)</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: EDITING CONTROLS & CONTROLS PANELS (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">

          {/* PHOTO EDITING TOOLBOX */}
          {editorMode === 'photo' && (
            <div className="bg-[#05162a] border border-purple-500/30 rounded-3xl p-5 shadow-xl space-y-5 text-xs">
              
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <h4 className="font-extrabold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  Filtros & Retoque Fotográfico
                </h4>
                <button
                  onClick={() => applyPresetFilter('normal')}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Restablecer
                </button>
              </div>

              {/* PRESET CAMPAIGN FILTERS */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Filtros Estilizados para Campaña:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'normal', name: 'Original', color: 'bg-slate-800' },
                    { id: 'politico_pro', name: 'Campaña Pro', color: 'bg-purple-900' },
                    { id: 'seguridad_hd', name: 'Seguridad HD', color: 'bg-cyan-900' },
                    { id: 'calidez_humana', name: 'Cercanía Cálida', color: 'bg-amber-900' },
                    { id: 'prensa_bn', name: 'Prensa B&N', color: 'bg-stone-900' },
                    { id: 'vivido_social', name: 'Vívido Redes', color: 'bg-pink-900' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPresetFilter(preset.id)}
                      className={`p-2 rounded-xl text-center border font-bold text-[10px] transition-all cursor-pointer ${
                        selectedPresetFilter === preset.id
                          ? 'border-pink-400 bg-pink-500/20 text-pink-300 font-black scale-[1.02]'
                          : 'border-purple-500/20 bg-[#030e1c] text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* FINE SLIDER CONTROLS */}
              <div className="space-y-3 pt-2 border-t border-purple-500/20">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Ajustes Finos de Imagen:
                </label>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 flex items-center gap-1 font-bold">
                      <Sun className="w-3 h-3 text-amber-400" /> Brillo:
                    </span>
                    <span className="font-mono text-amber-300">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 flex items-center gap-1 font-bold">
                      <Contrast className="w-3 h-3 text-purple-400" /> Contraste:
                    </span>
                    <span className="font-mono text-purple-300">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 flex items-center gap-1 font-bold">
                      <Droplet className="w-3 h-3 text-cyan-400" /> Saturación Color:
                    </span>
                    <span className="font-mono text-cyan-300">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* TRANSFORMATIONS (ROTATE / FLIP) */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Rotación y Espejo:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 p-2 bg-[#030e1c] hover:bg-slate-800 border border-purple-500/30 rounded-xl font-bold text-[11px] text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-pink-400" /> Rotar 90°
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`flex-1 p-2 border rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer ${
                      flipH ? 'bg-pink-950 border-pink-400 text-pink-300' : 'bg-[#030e1c] border-purple-500/30 text-slate-200'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" /> Espejo Horiz.
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* VIDEO EDITING TOOLBOX */}
          {editorMode === 'video' && (
            <div className="bg-[#05162a] border border-purple-500/30 rounded-3xl p-5 shadow-xl space-y-5 text-xs">
              
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <h4 className="font-extrabold text-white flex items-center gap-2">
                  <Subtitles className="w-4 h-4 text-cyan-400" />
                  Subtítulos AI & Plantillas Reels
                </h4>
                <button
                  onClick={() => setEnableSubtitles(!enableSubtitles)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                    enableSubtitles ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {enableSubtitles ? 'Subtítulos Activos' : 'Subtítulos Desactivados'}
                </button>
              </div>

              {/* SUBTITLE STYLES PRESETS */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Estilo de Subtítulos de Alto Impacto:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'yellow-box', label: '🟨 Caja Amarilla TikTok' },
                    { id: 'neon-cyan', label: '🩵 Neon Cyan Pro' },
                    { id: 'white-bold', label: '⬜ Blanco Bold' },
                    { id: 'minimal-dark', label: '⬛ Minimalista Oscuro' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSubtitleStyle(st.id as any)}
                      className={`p-2 rounded-xl text-left border font-bold text-[10px] transition-all cursor-pointer ${
                        subtitleStyle === st.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-extrabold shadow'
                          : 'border-purple-500/20 bg-[#030e1c] text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUBTITLE LINES EDITOR */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Editar Frases de Subtítulo AI ({subtitlesList.length}):
                  </label>
                  <button
                    onClick={() => {
                      const newSub = {
                        id: Date.now(),
                        start: videoEndTime - 2,
                        end: videoEndTime,
                        text: "¡Nueva frase de campaña!"
                      };
                      setSubtitlesList([...subtitlesList, newSub]);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Agregar Frase
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {subtitlesList.map((sub, idx) => (
                    <div 
                      key={sub.id} 
                      className={`p-2 rounded-xl border space-y-1 ${
                        activeSubtitleIndex === idx 
                          ? 'bg-cyan-950/40 border-cyan-400/60' 
                          : 'bg-[#030e1c] border-purple-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span className="font-bold text-cyan-300 font-mono">
                          Frase {idx + 1} ({sub.start}s - {sub.end}s)
                        </span>
                        <button
                          onClick={() => setSubtitlesList(subtitlesList.filter(s => s.id !== sub.id))}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sub.text}
                        onChange={(e) => {
                          const updated = [...subtitlesList];
                          updated[idx].text = e.target.value;
                          setSubtitlesList(updated);
                        }}
                        className="w-full bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg border border-purple-500/30 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* OVERLAY & BRANDING SETTINGS PANEL */}
          <div className="bg-[#05162a] border border-purple-500/30 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h4 className="font-extrabold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                Marca de Agua & Banner Político
              </h4>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                  showWatermark ? 'bg-[#111C30]0/20 text-purple-300 border border-purple-400/40' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showWatermark ? 'Marca Visible' : 'Oculta'}
              </button>
            </div>

            {/* WATERMARK TEXT */}
            {showWatermark && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 block">
                  Texto Marca de Agua:
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-[#030e1c] text-white text-xs px-3 py-2 rounded-xl border border-purple-500/30 outline-none"
                />

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Posición:</span>
                  {(['bottom-left', 'bottom-right', 'top-left', 'top-right'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setWatermarkPosition(pos)}
                      className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                        watermarkPosition === pos ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STICKER / BADGE CONFIG */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-300 block">
                  Sticker de Campaña / Categoría:
                </label>
                <button
                  onClick={() => setShowBadge(!showBadge)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                    showBadge ? 'bg-[#111C30]0/20 text-purple-300 border border-purple-400/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {showBadge ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {showBadge && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full bg-[#030e1c] text-white text-xs px-3 py-1.5 rounded-xl border border-purple-500/30 outline-none"
                    placeholder="Ej: PROPUESTA OFICIAL"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Color Badge:</span>
                    {(['purple', 'cyan', 'amber', 'emerald', 'rose'] as const).map((col) => (
                      <button
                        key={col}
                        onClick={() => setBadgeColor(col)}
                        className={`w-5 h-5 rounded-full border cursor-pointer ${
                          col === 'purple' ? 'bg-purple-600 border-purple-300' :
                          col === 'cyan' ? 'bg-cyan-500 border-cyan-300' :
                          col === 'amber' ? 'bg-[#111C30]0 border-amber-300' :
                          col === 'emerald' ? 'bg-[#111C30]0 border-emerald-300' :
                          'bg-rose-500 border-rose-300'
                        } ${badgeColor === col ? 'ring-2 ring-white scale-110' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CUSTOM TEXT OVERLAY */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20">
              <label className="text-[10px] font-bold text-slate-300 block">
                Texto Superpuesto Personalizado (Titular):
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe un slogan o título corto..."
                className="w-full bg-[#030e1c] text-white text-xs px-3 py-2 rounded-xl border border-purple-500/30 outline-none"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
