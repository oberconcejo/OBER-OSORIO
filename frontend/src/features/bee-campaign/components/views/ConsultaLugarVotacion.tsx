import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  User, 
  UserPlus, 
  Upload, 
  Download, 
  Database,
  RefreshCw,
  Phone,
  Mail,
  Map,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React build
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Votante {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  puesto: string;
  mesa: string;
}

const DEFAULT_VOTANTES: Votante[] = [
  { id: 'v1', nombre: 'Valentina Ríos Cano', cedula: '1015667788', telefono: '+57 311 987 6543', email: 'valentina.rios@gmail.com', puesto: 'Colegio Marco Fidel Suárez', mesa: '12' },
  { id: 'v2', nombre: 'Felipe Jaramillo Velásquez', cedula: '1026778899', telefono: '+57 300 112 2334', email: 'felipe.jaramillo@gmail.com', puesto: 'Universidad UPB', mesa: '04' },
  { id: 'v3', nombre: 'Camila Suárez Montoya', cedula: '1037889900', telefono: '+57 320 445 5667', email: 'camila.suarez@gmail.com', puesto: 'I.E. Pedro Justo Berrío', mesa: '15' },
  { id: 'v4', nombre: 'Andrés Felipe Ospina', cedula: '1045998811', telefono: '+57 315 778 8990', email: 'andres.ospina@gmail.com', puesto: 'Colegio Marco Fidel Suárez', mesa: '02' }
];

const POLLING_PLACES = [
  { nombre: 'Colegio Marco Fidel Suárez', direccion: 'Cra 70 # 44-51', lat: 6.2442, lng: -75.5812 },
  { nombre: 'Universidad UPB', direccion: 'Circular 1 # 70-01', lat: 6.2410, lng: -75.5900 },
  { nombre: 'I.E. Pedro Justo Berrío', direccion: 'Calle 32B # 66C-10', lat: 6.2301, lng: -75.5875 },
  { fontName: 'I.E. INEM José Félix de Restrepo', nombre: 'I.E. INEM José Félix de Restrepo', direccion: 'Cra 48 # 1-125', lat: 6.2088, lng: -75.5780 }
];

export const ConsultaLugarVotacion: React.FC = () => {
  // Navigation Sub-tabs: 'consultar' | 'registrar_masivo'
  const [activeSubTab, setActiveSubTab] = useState<'consultar' | 'registrar_masivo'>('consultar');

  // Voters Store (Persisted in localStorage)
  const [votantes, setVotantes] = useState<Votante[]>([]);

  // Search States
  const [searchCedula, setSearchCedula] = useState('');
  const [searchResult, setSearchResult] = useState<Votante | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Individual Form States (Inline registration)
  const [formNombre, setFormNombre] = useState('');
  const [formCedula, setFormCedula] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPuesto, setFormPuesto] = useState('Colegio Marco Fidel Suárez');
  const [formMesa, setFormMesa] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  // Bulk / Excel Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loadedCount, setLoadedCount] = useState(0);
  const [previewVotantes, setPreviewVotantes] = useState<Votante[]>([]);

  // Load registered voters from localStorage or initialize defaults
  useEffect(() => {
    const saved = localStorage.getItem('bee_registered_votantes');
    if (saved) {
      try {
        setVotantes(JSON.parse(saved));
      } catch (e) {
        setVotantes(DEFAULT_VOTANTES);
        localStorage.setItem('bee_registered_votantes', JSON.stringify(DEFAULT_VOTANTES));
      }
    } else {
      setVotantes(DEFAULT_VOTANTES);
      localStorage.setItem('bee_registered_votantes', JSON.stringify(DEFAULT_VOTANTES));
    }
  }, []);

  const saveVotantes = (list: Votante[]) => {
    setVotantes(list);
    localStorage.setItem('bee_registered_votantes', JSON.stringify(list));
  };

  // 1. Search / Query Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFormErrorMsg('');
    setFormSuccessMsg('');
    setSearched(true);
    const cleanDoc = searchCedula.trim().replace(/\D/g, '');

    if (!cleanDoc) {
      setSearchError('Por favor ingrese un número de cédula válido.');
      setSearchResult(null);
      return;
    }

    const found = votantes.find(v => v.cedula === cleanDoc);
    if (found) {
      setSearchResult(found);
    } else {
      setSearchResult(null);
      setSearchError('La cédula ingresada no se encuentra registrada en la campaña.');
      
      // Auto-prefill the registration form below
      setFormCedula(cleanDoc);
      setFormNombre('');
      setFormTelefono('');
      setFormEmail('');
      setFormMesa('');
    }
  };

  // 2. Individual Registration Form Handler
  const handleIndividualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');
    setFormSuccessMsg('');

    const cleanNombre = formNombre.trim();
    const cleanCedula = formCedula.trim().replace(/\D/g, '');
    const cleanTelefono = formTelefono.trim();
    const cleanEmail = formEmail.trim();
    const cleanMesa = formMesa.trim().replace(/\D/g, '');

    if (!cleanNombre || !cleanCedula || !cleanMesa) {
      setFormErrorMsg('Por favor complete los campos obligatorios (*).');
      return;
    }

    // Check if voter already exists
    if (votantes.some(v => v.cedula === cleanCedula)) {
      setFormErrorMsg(`Ya existe un votante registrado con la cédula ${cleanCedula}.`);
      return;
    }

    const newVoter: Votante = {
      id: 'v_' + Date.now(),
      nombre: cleanNombre,
      cedula: cleanCedula,
      telefono: cleanTelefono || 'No registrado',
      email: cleanEmail || 'No registrado',
      puesto: formPuesto,
      mesa: cleanMesa
    };

    const updatedList = [newVoter, ...votantes];
    saveVotantes(updatedList);

    setFormSuccessMsg('¡Votante registrado exitosamente!');
    
    // Reset Form & Switch to search result view
    setFormNombre('');
    setFormCedula('');
    setFormTelefono('');
    setFormEmail('');
    setFormPuesto('Colegio Marco Fidel Suárez');
    setFormMesa('');

    setSearchResult(newVoter);
    setSearchError('');
  };

  // 3. Massive Registration Excel Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setUploadSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // EXCLUSIVAMENTE ARCHIVOS DE EXCEL (.xlsx, .xls)
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      setUploadError('Error: Tipo de archivo no permitido. Solo se admiten archivos de Excel (.xlsx, .xls).');
      setExcelFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setExcelFile(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      setUploadError('Por favor seleccione un archivo de Excel.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    // Simulate reading the Excel file sheets
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadSuccess(true);
          
          // Generate simulated voters from the Excel sheet
          const simulatedUploaded: Votante[] = [
            { id: 'v_e1', nombre: 'María Camila Restrepo', cedula: '1035448812', telefono: '+57 321 889 4433', email: 'camila.restrepo@gmail.com', puesto: 'Colegio Marco Fidel Suárez', mesa: '08' },
            { id: 'v_e2', nombre: 'Juan Esteban Gómez', cedula: '1044337722', telefono: '+57 312 990 1122', email: 'esteban.gomez@gmail.com', puesto: 'Universidad UPB', mesa: '05' },
            { id: 'v_e3', nombre: 'Daniela Restrepo Duque', cedula: '1022998811', telefono: '+57 301 776 5544', email: 'daniela.duque@gmail.com', puesto: 'I.E. Pedro Justo Berrío', mesa: '02' },
            { id: 'v_e4', nombre: 'Mauricio Alejandro Pérez', cedula: '1055663344', telefono: '+57 318 440 2233', email: 'mauricio.perez@gmail.com', puesto: 'I.E. INEM José Félix de Restrepo', mesa: '18' },
            { id: 'v_e5', nombre: 'Sofía Elena Londoño', cedula: '1012889900', telefono: '+57 314 667 9900', email: 'sofia.londono@gmail.com', puesto: 'Colegio Marco Fidel Suárez', mesa: '11' }
          ];

          // Avoid duplicates
          const filteredSimulated = simulatedUploaded.filter(sv => !votantes.some(v => v.cedula === sv.cedula));
          const updatedList = [...filteredSimulated, ...votantes];
          saveVotantes(updatedList);

          setLoadedCount(simulatedUploaded.length);
          setPreviewVotantes(simulatedUploaded);
          setExcelFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';

          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleDownloadTemplate = () => {
    // Generate a simulated template structure
    const headers = 'Nombre Completo,Cedula,Telefono,Email,Puesto de Votacion,Mesa\n';
    const sampleRow = 'Pedro Nelson Ramirez,1033445566,+57 310 999 8877,pedro.ramirez@email.com,Universidad UPB,04\n';
    const blob = new Blob([headers + sampleRow], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Importacion_Masiva.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteVoter = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar al votante ${name} de los registros?`)) {
      const updated = votantes.filter(v => v.id !== id);
      saveVotantes(updated);
      if (searchResult?.id === id) {
        setSearchResult(null);
        setSearched(false);
      }
    }
  };

  const getMapData = (puestoNombre: string) => {
    const found = POLLING_PLACES.find(p => p.nombre === puestoNombre);
    if (found) {
      return { lat: found.lat, lng: found.lng, dir: found.direccion };
    }
    return { lat: 6.2442, lng: -75.5812, dir: 'Ubicación General Medellín' };
  };

  return (
    <div className="bg-[#020617] text-slate-100 p-4 md:p-6 space-y-6 min-h-[80vh] font-sans">
      
      {/* Banner */}
      <div className="bg-[#111C30] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">Consulta y Registro de Votantes</h2>
            <p className="text-xs text-slate-400">
              Módulo unificado para verificar puestos de votación y realizar la inscripción de votantes individuales y masivos.
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Censo Local: {votantes.length} Registros</span>
        </div>
      </div>

      {/* Segmented Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveSubTab('consultar');
            setSearchError('');
            setSearched(false);
            setSearchResult(null);
            setSearchCedula('');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'consultar'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Consultar e Inscribir Votante</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('registrar_masivo');
            setUploadError('');
            setUploadSuccess(false);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            activeSubTab === 'registrar_masivo'
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-extrabold'
              : 'bg-[#06182c]/40 text-slate-400 border-white/5 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Registro Masivo (Excel)</span>
        </button>
      </div>

      {/* SUBTAB CONTENT */}
      <div className="space-y-4">
        
        {/* SUBTAB 1: CONSULTAR E INSCRIBIR VOTANTE */}
        {activeSubTab === 'consultar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Search & Direct Result/Form Area */}
            <div className="lg:col-span-5 bg-[#111C30] p-6 rounded-2xl border border-white/5 space-y-5">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-extrabold text-sm text-slate-200">Búsqueda e Inscripción</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Consulte por cédula. Si no está registrado, el formulario de inscripción aparecerá inmediatamente.</p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={searchCedula}
                    onChange={(e) => setSearchCedula(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingrese número de cédula..."
                    className="w-full bg-[#0F172A] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                  />
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-extrabold text-xs shadow-lg transition-all cursor-pointer border border-cyan-400/20 shrink-0"
                >
                  Buscar Votante
                </button>
              </form>

              {/* CASE A: Voter is found in censo list */}
              {searched && searchResult && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">Votante Registrado</span>
                    </div>
                    <button
                      onClick={() => handleDeleteVoter(searchResult.id, searchResult.nombre)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      title="Eliminar votante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Nombre Completo</span>
                      <span className="font-extrabold text-white">{searchResult.nombre}</span>
                    </div>

                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Cédula de Ciudadanía</span>
                      <span className="font-extrabold text-slate-300 font-mono">{searchResult.cedula}</span>
                    </div>

                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</span>
                      <span className="font-extrabold text-slate-300 font-mono">{searchResult.telefono}</span>
                    </div>

                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Correo Electrónico</span>
                      <span className="font-extrabold text-slate-300 truncate max-w-[180px]">{searchResult.email}</span>
                    </div>

                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Puesto de Votación</span>
                      <div className="font-extrabold text-cyan-300 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{searchResult.puesto}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Dirección: {getMapData(searchResult.puesto).dir}</div>
                    </div>

                    <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Mesa Asignada</span>
                      <span className="px-3 py-1 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded font-black text-sm font-mono">
                        Mesa #{searchResult.mesa}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: Voter is NOT found - Render Inline Registration Form on the spot */}
              {searched && !searchResult && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Cédula no inscrita: {formCedula}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      Complete la información a continuación para realizar el registro inmediato.
                    </p>
                  </div>

                  <form onSubmit={handleIndividualRegister} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={formNombre}
                        onChange={(e) => setFormNombre(e.target.value)}
                        placeholder="Ej. Pedro Nelson Ramírez"
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Cédula *</label>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formCedula}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none font-mono font-bold cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Teléfono / WhatsApp</label>
                        <input
                          type="text"
                          value={formTelefono}
                          onChange={(e) => setFormTelefono(e.target.value)}
                          placeholder="Ej. +57 310 999 8877"
                          className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Correo Electrónico</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="Ej. pedro.ramirez@email.com"
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Puesto de Votación *</label>
                        <select
                          value={formPuesto}
                          onChange={(e) => setFormPuesto(e.target.value)}
                          className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                        >
                          {POLLING_PLACES.map((p, idx) => (
                            <option key={idx} value={p.nombre}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Mesa *</label>
                        <input
                          type="text"
                          required
                          value={formMesa}
                          onChange={(e) => setFormMesa(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ej. 03"
                          className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold font-mono"
                        />
                      </div>
                    </div>

                    {formErrorMsg && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold">
                        {formErrorMsg}
                      </div>
                    )}

                    {formSuccessMsg && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                        {formSuccessMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-extrabold text-xs shadow-lg transition-all border border-cyan-400/20 cursor-pointer text-center"
                    >
                      Inscribir y Guardar Votante
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Leaflet Map */}
            <div className="lg:col-span-7 bg-[#111C30] p-5 rounded-2xl border border-white/5 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-200">Localización Geográfica del Puesto</h3>
                    <p className="text-[10px] text-slate-400">
                      {searchResult ? `Puesto de votación georreferenciado para ${searchResult.nombre}` : 'Consulte un votante registrado para visualizar su ubicación'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map container */}
              <div className="flex-1 rounded-xl overflow-hidden relative border border-white/5 bg-[#020617] min-h-[300px]">
                {searchResult ? (
                  <MapContainer 
                    center={[getMapData(searchResult.puesto).lat, getMapData(searchResult.puesto).lng]} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[getMapData(searchResult.puesto).lat, getMapData(searchResult.puesto).lng]}>
                      <Popup>
                        <div className="text-xs text-slate-900 font-sans">
                          <strong className="block font-bold">{searchResult.puesto}</strong>
                          <span className="block mt-0.5 text-slate-500">Mesa #{searchResult.mesa}</span>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <MapPin className="w-8 h-8 text-slate-600 animate-bounce" />
                    <span className="text-[11px] font-bold">Esperando consulta de votante...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: REGISTRO MASIVO EXCLUSIVAMENTE EXCEL */}
        {activeSubTab === 'registrar_masivo' && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-[#111C30] p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Inscripción Masiva mediante Carga de Archivos</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Importe múltiples votantes a la vez. **Exclusivamente compatible con hojas de cálculo de Microsoft Excel (.xlsx, .xls)**.
                </p>
              </div>

              {/* Template Download Alert */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center gap-4">
                <div className="text-xs text-slate-300">
                  Utilice nuestra plantilla oficial para estructurar la información con las columnas necesarias.
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Plantilla Excel</span>
                </button>
              </div>

              {uploadError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">¡Censo cargado exitosamente!</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6">
                    Se procesaron y registraron <strong>{loadedCount}</strong> votantes simpatizantes sin duplicados.
                  </p>
                </div>
              )}

              {/* File Drag and Drop Box */}
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-8 text-center bg-[#0F172A] hover:bg-[#111C30]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                  />
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-300">
                      {excelFile ? excelFile.name : 'Seleccione o arrastre su archivo de Excel'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Únicamente formatos .xlsx o .xls
                    </span>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-cyan-300">
                      <span>Procesando censo de Excel...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!excelFile || uploading}
                  className="w-full py-3 rounded-xl bg-[#111C30] hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-extrabold text-xs shadow-lg transition-all disabled:opacity-30 cursor-pointer text-center"
                >
                  {uploading ? 'Cargando registros...' : 'Importar Archivo de Excel'}
                </button>
              </form>
            </div>

            {/* Upload preview grid */}
            {previewVotantes.length > 0 && (
              <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Vista Previa de Registros Cargados</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mostrando registros extraídos de la hoja de Excel.</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold border-b border-white/5">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Cédula</th>
                        <th className="p-3">Teléfono</th>
                        <th className="p-3">Puesto de Votación</th>
                        <th className="p-3">Mesa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0F172A] font-medium">
                      {previewVotantes.map((pv, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/10">
                          <td className="p-3 text-white font-bold">{pv.nombre}</td>
                          <td className="p-3 text-slate-300 font-mono">{pv.cedula}</td>
                          <td className="p-3 text-slate-300 font-mono">{pv.telefono}</td>
                          <td className="p-3 text-cyan-300">{pv.puesto}</td>
                          <td className="p-3 text-slate-300 font-mono">Mesa #{pv.mesa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
