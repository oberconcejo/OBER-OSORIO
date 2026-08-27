import React, { useState } from 'react';
import { ViewMode } from '../../types';
import { 
  Building2, 
  MapPin, 
  User, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Save, 
  Users, 
  FileText, 
  Layers, 
  Sparkles, 
  Upload, 
  Phone, 
  Mail, 
  IdCard, 
  CheckSquare, 
  HelpCircle,
  AlertCircle,
  Hash,
  Briefcase,
  Vote,
  Globe,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  UserPlus,
  X,
  Check,
  Search
} from 'lucide-react';

export interface CandidatoListaAliada {
  id: string;
  numeroRenglon: number;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  esCabeza: boolean;
  fotoUrl?: string;
}

export interface CampanaAliada {
  id: string;
  corporacion: 'Asamblea' | 'Concejo' | 'JAL';
  partidoOLista: string;
  nombreLista: string;
  modalidad: 'Lista Abierta' | 'Lista Cerrada';
  departamento: string;
  municipio: string;
  localidadComuna?: string;
  metaVotosEsperada: number;
  candidatos: CandidatoListaAliada[];
}

interface GestionConfiguracionCampanaProps {
  onSelectView?: (view: ViewMode) => void;
  standalone?: boolean;
}

// Data Map of Colombia Departments & Municipalities
export const colombiaTerritorialData: Record<string, string[]> = {
  'Antioquia': [
    'Medellín (Capital)', 'Envigado', 'Itagüí', 'Bello', 'Rionegro', 'Sabaneta', 
    'Caldas', 'La Estrella', 'Apartadó', 'Turbo', 'Caucasia', 'Yarumal', 
    'Puerto Berrío', 'Chigorodó', 'Marinilla', 'El Carmen de Viboral', 'Guarne', 'Santa Fe de Antioquia'
  ],
  'Bogotá D.C. / Cundinamarca': [
    'Bogotá D.C. (Capital)', 'Soacha', 'Chía', 'Zipaquirá', 'Fusagasugá', 'Facatativá', 
    'Mosquera', 'Funza', 'Madrid', 'Girardot', 'Cajicá', 'Ubaté', 'Sopó', 'Tocancipá'
  ],
  'Valle del Cauca': [
    'Cali (Capital)', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Cartago', 
    'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'Sevilla'
  ],
  'Atlántico': [
    'Barranquilla (Capital)', 'Soledad', 'Malambo', 'Sabanalarga', 'Baranoa', 
    'Puerto Colombia', 'Galapa', 'Santo Tomás'
  ],
  'Santander': [
    'Bucaramanga (Capital)', 'Floridablanca', 'Girón', 'Piedecuesta', 
    'Barrancabermeja', 'San Gil', 'Socorro', 'Barbosa', 'Vélez'
  ],
  'Bolívar': [
    'Cartagena de Indias (Capital)', 'Magangué', 'El Carmen de Bolívar', 
    'Turbaco', 'Arjona', 'María La Baja', 'Mompox'
  ],
  'Nariño': [
    'Pasto (Capital)', 'Ipiales', 'Tumaco', 'Túquerres', 'Samaniego', 'La Unión'
  ],
  'Boyacá': [
    'Tunja (Capital)', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Moniquirá'
  ],
  'Caldas': [
    'Manizales (Capital)', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Salamina'
  ],
  'Risaralda': [
    'Pereira (Capital)', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Belén de Umbría'
  ],
  'Quindío': [
    'Armenia (Capital)', 'Calarcá', 'Montenegro', 'Quimbaya', 'La Tebaida', 'Salento'
  ],
  'Tolima': [
    'Ibagué (Capital)', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'Líbano', 'Mariquita'
  ],
  'Huila': [
    'Neiva (Capital)', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'
  ],
  'Cauca': [
    'Popayán (Capital)', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Piendamó'
  ],
  'Córdoba': [
    'Montería (Capital)', 'Cereté', 'Lorica', 'Sahagún', 'Planeta Rica', 'Montelíbano'
  ],
  'Cesar': [
    'Valledupar (Capital)', 'Aguachica', 'Agustín Codazzi', 'Bosconia', 'La Paz'
  ],
  'Meta': [
    'Villavicencio (Capital)', 'Acacías', 'Granada', 'Puerto López', 'San Martín'
  ],
  'Magdalena': [
    'Santa Marta (Capital)', 'Ciénaga', 'Fundación', 'El Banco', 'Plato'
  ],
  'Sucre': [
    'Sincelejo (Capital)', 'Corozal', 'San Marcos', 'San Onofre', 'Tolú'
  ],
  'Chocó': [
    'Quibdó (Capital)', 'Istmina', 'Condoto', 'Nuquí', 'Bahía Solano'
  ],
  'La Guajira': [
    'Riohacha (Capital)', 'Maicao', 'Uribia', 'Manaure', 'Fonseca', 'San Juan del Cesar'
  ],
  'Casanare': [
    'Yopal (Capital)', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'
  ],
  'Putumayo': [
    'Mocoa (Capital)', 'Puerto Asís', 'Orito', 'Sibundoy'
  ],
  'Caquetá': [
    'Florencia (Capital)', 'San Vicente del Caguán', 'Puerto Rico', 'Belén de los Andaquíes'
  ],
  'Arauca': [
    'Arauca (Capital)', 'Tame', 'Saravena', 'Arauquita'
  ],
  'Amazonas': [
    'Leticia (Capital)', 'Puerto Nariño'
  ],
  'Guaviare': [
    'San José del Guaviare (Capital)', 'Calamar', 'El Retorno'
  ],
  'Guainía': [
    'Inírida (Capital)'
  ],
  'Vaupés': [
    'Mitú (Capital)'
  ],
  'Vichada': [
    'Puerto Carreño (Capital)', 'Cumaribo', 'La Primavera'
  ],
  'San Andrés y Providencia': [
    'San Andrés (Capital)', 'Providencia'
  ]
};

// Colombian Official Recognized Parties (CNE)
export const partidosPoliticosColombia = [
  'Partido Liberal Colombiano',
  'Partido Conservador Colombiano',
  'Centro Democrático',
  'Pacto Histórico',
  'Partido Alianza Verde',
  'Partido Cambio Radical',
  'Partido de la U (Unión por la Gente)',
  'Partido MIRA',
  'Nuevo Liberalismo',
  'En Marcha',
  'Dignidad & Compromiso',
  'Fuerza Ciudadana',
  'Colombia Justa Libres',
  'Partido ASI (Alianza Social Independiente)',
  'Partido MAIS (Movimiento Alternativo Indígena y Social)',
  'AICO (Autoridades Indígenas de Colombia)',
  'Partido ADA (Alianza Democrática Amplia)',
  'Liga de Gobernantes Anti-Corrupción'
];

export const GestionConfiguracionCampana: React.FC<GestionConfiguracionCampanaProps> = ({
  onSelectView,
  standalone = false
}) => {
  const [activeSaveToast, setActiveSaveToast] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  // ==========================================
  // SECTION 1: ELECCIÓN, CORPORACIÓN Y TERRITORIO
  // ==========================================
  const [tipoProcesoEleccion, setTipoProcesoEleccion] = useState<'Ordinaria' | 'Atípica'>('Ordinaria');
  const [fechaEleccion, setFechaEleccion] = useState('2027-10-31');
  const [corporacion, setCorporacionState] = useState<'Gobernación' | 'Asamblea' | 'Alcaldía' | 'Concejo' | 'JAL'>(
    (localStorage.getItem('bee_campaign_corporacion') as any) || 'Alcaldía'
  );
  const setCorporacion = (val: 'Gobernación' | 'Asamblea' | 'Alcaldía' | 'Concejo' | 'JAL') => {
    setCorporacionState(val);
    localStorage.setItem('bee_campaign_corporacion', val);
  };

  const [circunscripcionTerritorial, setCircunscripcionTerritorial] = useState<'Municipio' | 'Departamento'>('Municipio');
  const [departamento, setDepartamento] = useState('Antioquia');

  const [municipio, setMunicipioState] = useState<string>(
    localStorage.getItem('bee_campaign_municipio') || 'Medellín (Capital)'
  );
  const setMunicipio = (val: string) => {
    setMunicipioState(val);
    localStorage.setItem('bee_campaign_municipio', val);
  };
  const [modalidadCandidatura, setModalidadCandidatura] = useState<'Uninominal' | 'Lista Abierta' | 'Lista Cerrada'>('Uninominal');
  const [posicionTarjeton, setPosicionTarjeton] = useState('01 / Casilla Principal');

  // ==========================================
  // SECTION 2: CANDIDATE BASIC INFORMATION
  // ==========================================
  const [nombreCandidato, setNombreCandidato] = useState('Dr. Javier Méndez');
  const [cedulaCandidato, setCedulaCandidato] = useState('71.345.890');
  const [seudonimoPolitico, setSeudonimoPolitico] = useState('Javier Méndez el de la Gente');
  const [profesionCandidato, setProfesionCandidato] = useState('Abogado Constitucionalista y Magíster en Planeación Urbana');
  const [telefonoCandidato, setTelefonoCandidato] = useState('+57 310 456 7890');
  const [emailCandidato, setEmailCandidato] = useState('candidatura@javiermendez.co');
  const [fotoUrl, setFotoUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80');
  const [resumenVida, setResumenVida] = useState('Ex Concejal de Medellín con más de 12 años de trayectoria en gestión pública, liderando proyectos de infraestructura social y modernización del transporte.');

  // ==========================================
  // SECTION 3: RESPALDO POLÍTICO Y AVAL
  // ==========================================
  const [modalidadAval, setModalidadAval] = useState<'Partido' | 'Firmas' | 'Coalición'>('Partido');
  const [partidoUnico, setPartidoUnico] = useState('Partido Liberal Colombiano');
  const [numeroAvalCNE, setNumeroAvalCNE] = useState('AVAL-CNE-2027-8891');
  
  // Firmas state
  const [nombreGrupoFirmas, setNombreGrupoFirmas] = useState('Movimiento Ciudadano Medellín Avanza');
  const [metaFirmas, setMetaFirmas] = useState(85000);
  const [radicadoRegistraduria, setRadicadoRegistraduria] = useState('REG-GSC-2027-00412');
  const [promotoresFirmas, setPromotoresFirmas] = useState('Carlos Restrepo (CC 15.441.201), María Gómez (CC 43.109.882), Andrés Páez (CC 98.765.432)');

  // Coalición state
  const [nombreCoalicion, setNombreCoalicion] = useState('Coalición Unidos por el Futuro');
  const [partidosCoalicion, setPartidosCoalicion] = useState<string[]>([
    'Partido Liberal Colombiano',
    'Partido Alianza Verde',
    'Nuevo Liberalismo'
  ]);
  const [partidoResponsableCNE, setPartidoResponsableCNE] = useState('Partido Liberal Colombiano');

  // ==========================================
  // SECTION 4: FECHAS CLAVE & PÓLIZA
  // ==========================================
  const [horaApertura, setHoraApertura] = useState('08:00');
  const [horaCierre, setHoraCierre] = useState('16:00');
  const [polizaNumero, setPolizaNumero] = useState('POL-SEGUROS-88219-CNE');
  const [aseguradora, setAseguradora] = useState('Seguros del Estado S.A.');

  // ==========================================
  // SECTION 5: CAMPAÑAS ALIADAS & LISTAS (ASAMBLEA, CONCEJO Y JAL)
  // ==========================================
  const [campanasAliadas, setCampanasAliadas] = useState<CampanaAliada[]>([
    {
      id: 'aliada-1',
      corporacion: 'Concejo',
      partidoOLista: 'Partido Liberal Colombiano',
      nombreLista: 'Lista al Concejo - Partido Liberal Colombiano',
      modalidad: 'Lista Abierta',
      departamento: 'Antioquia',
      municipio: 'Medellín (Capital)',
      metaVotosEsperada: 45000,
      candidatos: [
        { id: 'cand-101', numeroRenglon: 1, nombre: 'Dr. Andrés Felipe Restrepo', cedula: '1.017.234.567', telefono: '+57 311 234 5678', email: 'andres.restrepo@concejo.co', esCabeza: true },
        { id: 'cand-102', numeroRenglon: 2, nombre: 'Dra. María Camila Torres', cedula: '43.890.123', telefono: '+57 300 890 1234', email: 'camila.torres@concejo.co', esCabeza: false },
        { id: 'cand-103', numeroRenglon: 3, nombre: 'Ing. Carlos Eduardo Gómez', cedula: '71.889.001', telefono: '+57 312 554 9988', email: 'carlos.gomez@concejo.co', esCabeza: false },
        { id: 'cand-104', numeroRenglon: 4, nombre: 'Lic. Luz Marina Ramírez', cedula: '32.554.890', telefono: '+57 315 678 1234', email: 'luz.ramirez@concejo.co', esCabeza: false },
        { id: 'cand-105', numeroRenglon: 5, nombre: 'Mateo Jaramillo', cedula: '1.020.334.891', telefono: '+57 310 998 7654', email: 'mateo.jaramillo@concejo.co', esCabeza: false }
      ]
    },
    {
      id: 'aliada-2',
      corporacion: 'Concejo',
      partidoOLista: 'Partido Alianza Verde',
      nombreLista: 'Lista al Concejo - Partido Alianza Verde',
      modalidad: 'Lista Abierta',
      departamento: 'Antioquia',
      municipio: 'Medellín (Capital)',
      metaVotosEsperada: 38000,
      candidatos: [
        { id: 'cand-201', numeroRenglon: 1, nombre: 'Dra. Sofía Valencia', cedula: '1.037.665.432', telefono: '+57 314 556 7788', email: 'sofia.valencia@alianzaverde.co', esCabeza: true },
        { id: 'cand-202', numeroRenglon: 2, nombre: 'Arq. Juan Pablo Henao', cedula: '71.345.992', telefono: '+57 316 443 2211', email: 'juan.henao@alianzaverde.co', esCabeza: false },
        { id: 'cand-203', numeroRenglon: 3, nombre: 'Claudia Patricia Morales', cedula: '43.567.890', telefono: '+57 301 776 5432', email: 'claudia.morales@alianzaverde.co', esCabeza: false }
      ]
    },
    {
      id: 'aliada-3',
      corporacion: 'Asamblea',
      partidoOLista: 'Nuevo Liberalismo',
      nombreLista: 'Lista a la Asamblea - Nuevo Liberalismo & Aliados',
      modalidad: 'Lista Cerrada',
      departamento: 'Antioquia',
      municipio: 'Medellín (Capital)',
      metaVotosEsperada: 62000,
      candidatos: [
        { id: 'cand-301', numeroRenglon: 1, nombre: 'Dr. Juan Diego Montoya', cedula: '15.345.678', telefono: '+57 310 887 6655', email: 'juan.montoya@asamblea.co', esCabeza: true },
        { id: 'cand-302', numeroRenglon: 2, nombre: 'Dra. Patricia Helena Ruiz', cedula: '43.112.990', telefono: '+57 318 998 1122', email: 'patricia.ruiz@asamblea.co', esCabeza: false },
        { id: 'cand-303', numeroRenglon: 3, nombre: 'Alejandro Serna', cedula: '1.017.889.002', telefono: '+57 320 445 6677', email: 'alejandro.serna@asamblea.co', esCabeza: false }
      ]
    },
    {
      id: 'aliada-4',
      corporacion: 'JAL',
      partidoOLista: 'Partido Liberal Colombiano',
      nombreLista: 'Lista JAL Comuna 11 Laureles - Estadio',
      modalidad: 'Lista Abierta',
      departamento: 'Antioquia',
      municipio: 'Medellín (Capital)',
      localidadComuna: 'Comuna 11 - Laureles',
      metaVotosEsperada: 12000,
      candidatos: [
        { id: 'cand-401', numeroRenglon: 1, nombre: 'Don Guillermo Buitrago', cedula: '8.234.567', telefono: '+57 311 445 6677', email: 'guillermo.buitrago@jal.co', esCabeza: true },
        { id: 'cand-402', numeroRenglon: 2, nombre: 'Ana Lucía Echeverri', cedula: '32.890.123', telefono: '+57 300 223 4455', email: 'ana.echeverri@jal.co', esCabeza: false }
      ]
    }
  ]);

  const [selectedAliadaId, setSelectedAliadaId] = useState<string | null>(null);
  const [showAddAliadaModal, setShowAddAliadaModal] = useState<boolean>(false);



  // New Allied Campaign Form State
  const [newAliadaCorp, setNewAliadaCorp] = useState<'Asamblea' | 'Concejo' | 'JAL'>('Concejo');
  const [newAliadaPartido, setNewAliadaPartido] = useState<string>('Partido Liberal Colombiano');
  const [newAliadaNombre, setNewAliadaNombre] = useState<string>('');
  const [newAliadaModalidad, setNewAliadaModalidad] = useState<'Lista Abierta' | 'Lista Cerrada'>('Lista Abierta');
  const [newAliadaComuna, setNewAliadaComuna] = useState<string>('Comuna 10 - La Candelaria / Centro');
  const [newAliadaMetaVotos, setNewAliadaMetaVotos] = useState<number>(25000);

  // New Candidate Form State inside selected list
  const [candNombre, setCandNombre] = useState<string>('');
  const [candCedula, setCandCedula] = useState<string>('');
  const [candTelefono, setCandTelefono] = useState<string>('');
  const [candEmail, setCandEmail] = useState<string>('');
  const [candEsCabeza, setCandEsCabeza] = useState<boolean>(false);
  const [candRenglon, setCandRenglon] = useState<number>(1);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);

  // Edit List Info Modal/Inline State
  const [editingListInfoId, setEditingListInfoId] = useState<string | null>(null);
  const [editListNombre, setEditListNombre] = useState<string>('');
  const [editListPartido, setEditListPartido] = useState<string>('');
  const [editListModalidad, setEditListModalidad] = useState<'Lista Abierta' | 'Lista Cerrada'>('Lista Abierta');
  const [editListMetaVotos, setEditListMetaVotos] = useState<number>(15000);

  // Handler to Create a New Allied List
  const handleCreateAliada = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAliadaCorp !== 'Concejo' && newAliadaCorp !== 'Asamblea' && newAliadaCorp !== 'JAL') {
      alert('⚠️ Por normativa electoral CNE, las campañas aliadas corresponden exclusivamente a corporaciones públicas por listas (Concejo, Asamblea y JAL). No se permite crear o vincular otra Alcaldía o Gobernación.');
      return;
    }

    const newId = `aliada-${Date.now()}`;
    const generatedName = newAliadaNombre.trim() || `Lista a ${newAliadaCorp} - ${newAliadaPartido}`;
    const newCampana: CampanaAliada = {
      id: newId,
      corporacion: newAliadaCorp,
      partidoOLista: newAliadaPartido,
      nombreLista: generatedName,
      modalidad: newAliadaModalidad,
      departamento: departamento,
      municipio: municipio,
      localidadComuna: newAliadaCorp === 'JAL' ? newAliadaComuna : undefined,
      metaVotosEsperada: newAliadaMetaVotos || 15000,
      candidatos: []
    };

    setCampanasAliadas([...campanasAliadas, newCampana]);
    setSelectedAliadaId(newId);
    setShowAddAliadaModal(false);
    setNewAliadaNombre('');
    showToast(`Nueva Lista Creada: ${generatedName}`);
  };

  // Handler to Remove an Allied List
  const handleDeleteAliada = (id: string, nombre: string) => {
    if (confirm(`¿Está seguro de eliminar la lista "${nombre}" y todos sus candidatos inscritos?`)) {
      const updated = campanasAliadas.filter(c => c.id !== id);
      setCampanasAliadas(updated);
      if (selectedAliadaId === id) {
        setSelectedAliadaId(updated.length > 0 ? updated[0].id : null);
      }
      showToast(`Lista Eliminada: ${nombre}`);
    }
  };

  // Start Editing List Metadata
  const handleStartEditListInfo = (camp: CampanaAliada) => {
    setEditingListInfoId(camp.id);
    setEditListNombre(camp.nombreLista);
    setEditListPartido(camp.partidoOLista);
    setEditListModalidad(camp.modalidad);
    setEditListMetaVotos(camp.metaVotosEsperada);
  };

  // Save Edit List Metadata
  const handleSaveListInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListInfoId) return;

    setCampanasAliadas(prev => prev.map(c => {
      if (c.id === editingListInfoId) {
        return {
          ...c,
          nombreLista: editListNombre.trim() || c.nombreLista,
          partidoOLista: editListPartido,
          modalidad: editListModalidad,
          metaVotosEsperada: editListMetaVotos
        };
      }
      return c;
    }));

    setEditingListInfoId(null);
    showToast('Información de la lista actualizada correctamente');
  };

  // Start Editing Candidate
  const handleStartEditCandidate = (cand: CandidatoListaAliada) => {
    setEditingCandidateId(cand.id);
    setCandNombre(cand.nombre);
    setCandCedula(cand.cedula);
    setCandTelefono(cand.telefono || '');
    setCandEmail(cand.email || '');
    setCandEsCabeza(cand.esCabeza);
    setCandRenglon(cand.numeroRenglon);
  };

  // Cancel Editing Candidate
  const handleCancelCandidateEdit = () => {
    setEditingCandidateId(null);
    setCandNombre('');
    setCandCedula('');
    setCandTelefono('');
    setCandEmail('');
    setCandEsCabeza(false);
    setCandRenglon(1);
  };

  // Handler to Add or Update Candidate in currently selected Allied List
  const handleAddOrUpdateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAliadaId) return;
    if (!candNombre.trim() || !candCedula.trim()) {
      alert('Por favor complete al menos el Nombre y la Cédula del candidato.');
      return;
    }

    setCampanasAliadas(prev => prev.map(camp => {
      if (camp.id === selectedAliadaId) {
        let updatedCands = [...camp.candidatos];

        if (candEsCabeza) {
          updatedCands = updatedCands.map(c => ({ ...c, esCabeza: false }));
        }

        if (editingCandidateId) {
          // Update existing candidate
          updatedCands = updatedCands.map(c => {
            if (c.id === editingCandidateId) {
              return {
                ...c,
                numeroRenglon: candRenglon,
                nombre: candNombre.trim(),
                cedula: candCedula.trim(),
                telefono: candTelefono.trim(),
                email: candEmail.trim(),
                esCabeza: candEsCabeza
              };
            }
            return c;
          });
        } else {
          // Add new candidate
          const nextRenglon = candRenglon || (updatedCands.length + 1);
          const newCand: CandidatoListaAliada = {
            id: `cand-${Date.now()}`,
            numeroRenglon: nextRenglon,
            nombre: candNombre.trim(),
            cedula: candCedula.trim(),
            telefono: candTelefono.trim(),
            email: candEmail.trim(),
            esCabeza: candEsCabeza
          };
          updatedCands.push(newCand);
        }

        return {
          ...camp,
          candidatos: updatedCands.sort((a, b) => a.numeroRenglon - b.numeroRenglon)
        };
      }
      return camp;
    }));

    handleCancelCandidateEdit();
    showToast(editingCandidateId ? 'Candidato actualizado con éxito' : 'Candidato agregado con éxito');
  };

  // Handler to Remove Candidate from list
  const handleDeleteCandidate = (candId: string) => {
    if (!selectedAliadaId) return;
    setCampanasAliadas(prev => prev.map(camp => {
      if (camp.id === selectedAliadaId) {
        return {
          ...camp,
          candidatos: camp.candidatos.filter(c => c.id !== candId)
        };
      }
      return camp;
    }));
  };

  // Handler to toggle Cabeza de lista
  const handleToggleCabeza = (candId: string) => {
    if (!selectedAliadaId) return;
    setCampanasAliadas(prev => prev.map(camp => {
      if (camp.id === selectedAliadaId) {
        return {
          ...camp,
          candidatos: camp.candidatos.map(c => ({
            ...c,
            esCabeza: c.id === candId ? !c.esCabeza : false
          }))
        };
      }
      return camp;
    }));
  };

  // Handle department change -> reset municipality to first item
  const handleDepartmentChange = (dep: string) => {
    setDepartamento(dep);
    const muns = colombiaTerritorialData[dep] || [];
    if (muns.length > 0) {
      setMunicipio(muns[0]);
    } else {
      setMunicipio('');
    }
  };

  // Switch Circunscripción (Department vs Municipio)
  const handleCircunscripcionChange = (circ: 'Municipio' | 'Departamento') => {
    setCircunscripcionTerritorial(circ);
    if (circ === 'Departamento') {
      // If department selected, automatically force corporacion if needed, or keep same department
      if (corporacion === 'Alcaldía' || corporacion === 'Concejo' || corporacion === 'JAL') {
        setCorporacion('Gobernación');
      }
    } else {
      if (corporacion === 'Gobernación' || corporacion === 'Asamblea') {
        setCorporacion('Alcaldía');
      }
    }
  };

  // Toggle coalition party selection
  const togglePartyCoalition = (party: string) => {
    if (partidosCoalicion.includes(party)) {
      if (partidosCoalicion.length > 1) {
        setPartidosCoalicion(partidosCoalicion.filter(p => p !== party));
      } else {
        alert('Una coalición requiere al menos 1 partido o movimiento registrado.');
      }
    } else {
      setPartidosCoalicion([...partidosCoalicion, party]);
    }
  };

  // Section Save Trigger
  const showToast = (sectionName: string) => {
    setActiveSaveToast(sectionName);
    setTimeout(() => {
      setActiveSaveToast(null);
    }, 4000);
  };

  const validateAndNext = (currentStep: number) => {
    if (currentStep === 1) {
      showToast('Sección 1: Parámetros de Elección y Campaña');
      setActiveStep(2);
    } else if (currentStep === 2) {
      if (!nombreCandidato.trim()) {
        alert('Por favor ingrese el Nombre Completo del Candidato');
        return;
      }
      if (!cedulaCandidato.trim()) {
        alert('Por favor ingrese la Cédula del Candidato');
        return;
      }
      showToast('Sección 2: Expediente del Candidato');
      setActiveStep(3);
    } else if (currentStep === 3) {
      if (modalidadAval === 'Partido' && !partidoUnico.trim()) {
        alert('Por favor ingrese el Partido Oficial');
        return;
      }
      if (modalidadAval === 'Firmas' && !nombreGrupoFirmas.trim()) {
        alert('Por favor ingrese el Nombre del Grupo Significativo de Ciudadanos');
        return;
      }
      if (modalidadAval === 'Coalición' && !nombreCoalicion.trim()) {
        alert('Por favor ingrese el Nombre de la Coalición');
        return;
      }
      showToast('Sección 3: Respaldo Político y Aval Oficial');
      setActiveStep(4);
    } else if (currentStep === 4) {
      if (!polizaNumero.trim()) {
        alert('Por favor ingrese el Número de Póliza');
        return;
      }
      if (!aseguradora.trim()) {
        alert('Por favor ingrese la Compañía Aseguradora');
        return;
      }
      showToast('Sección 4: Horarios y Póliza');
      setActiveStep(5);
    } else if (currentStep === 5) {
      showToast('Sección 5: Campañas Aliadas y Listas de Candidatos');
    }
  };

  const parseTimeTo12H = (timeStr: string) => {
    if (!timeStr) return { hour: '08', minute: '00', period: 'AM' };
    const [hh, mm] = timeStr.split(':');
    let h = parseInt(hh, 10);
    const m = mm || '00';
    let period = 'AM';
    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    }
    if (h === 0) h = 12;
    const hourStr = h.toString().padStart(2, '0');
    return { hour: hourStr, minute: m, period };
  };

  const formatTimeTo24H = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Toda la Configuración Completa de Campaña');
  };

  // Calculate estimated CNE Limit
  const cneLimitMap: Record<string, number> = {
    Alcaldía: 1250000000,
    Gobernación: 3500000000,
    Concejo: 450000000,
    Asamblea: 950000000,
    JAL: 120000000
  };
  const estimatedLimit = cneLimitMap[corporacion] || 1000000000;

  // Display label for Entidad Territorial
  const entidadTerritorialTexto = circunscripcionTerritorial === 'Departamento' 
    ? `Departamento de ${departamento}`
    : `Municipio de ${municipio.split(' ')[0]} (${departamento})`;

  return (
    <div className={`space-y-6 ${standalone ? 'min-h-[calc(100vh-60px)] bg-[#020617] text-slate-100 p-4 md:p-8' : ''}`}>
      
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-xl border border-slate-700/60">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-400" />
          <span>Creación de Campaña & Expediente Estratégico</span>
        </h2>
      </div>

      {/* Floating Section Save Toast Notification */}
      {activeSaveToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl border border-emerald-400 flex items-center justify-between animate-fadeIn sticky top-4 z-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <div>
              <h4 className="font-bold text-xs">¡Cambios Guardados Satisfactoriamente!</h4>
              <p className="text-[11px] text-emerald-100">
                Se guardaron los datos de: <strong>{activeSaveToast}</strong>. Los parámetros han sido actualizados en la plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form Sections */}
      <div className="space-y-6">
        
        {/* ========================================================================= */}
        {/* SECTION 1: ELECTION & CAMPAIGN CREATION (ELECCIÓN, CORPORACIÓN Y TERRITORIO) */}
        {/* ========================================================================= */}
        <div className="bg-[#0F172A]/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeStep === 1 ? 'border-b border-cyan-500/20 pb-4' : ''}`}>
            <div 
              className="flex-1 cursor-pointer select-none"
              onClick={() => setActiveStep(activeStep === 1 ? 0 : 1)}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md text-[10px] font-extrabold uppercase mb-1">
                Paso 1 Principal
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-400" />
                <span>1. Parámetros de la Elección & Creación de Campaña</span>
                {activeStep === 1 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </h3>
            </div>
          </div>

          {activeStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* 1.1 Tipo de Elección */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-cyan-500/20 space-y-1.5">
              <label className="block font-extrabold text-cyan-200">Tipo de Elección *</label>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTipoProcesoEleccion('Ordinaria')}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                    tipoProcesoEleccion === 'Ordinaria'
                      ? 'bg-[#111C30] text-white border-emerald-400 shadow-sm'
                      : 'bg-[#111C30] text-slate-300 border-cyan-500/30 hover:bg-cyan-500/20'
                  }`}
                >
                  Ordinaria
                </button>
                <button
                  type="button"
                  onClick={() => setTipoProcesoEleccion('Atípica')}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                    tipoProcesoEleccion === 'Atípica'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                      : 'bg-[#111C30] text-slate-300 border-cyan-500/30 hover:bg-cyan-500/20'
                  }`}
                >
                  Atípica
                </button>
              </div>
            </div>

            {/* 1.2 Fecha de la Elección */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-cyan-500/20 space-y-1.5">
              <label className="block font-extrabold text-cyan-200">Fecha de la Elección *</label>
              <div className="relative pt-1">
                <Calendar className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
                <input
                  type="date"
                  required
                  value={fechaEleccion}
                  onChange={(e) => setFechaEleccion(e.target.value)}
                  className="w-full bg-[#111C30] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* 1.3 Corporación */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-cyan-500/20 space-y-1.5">
              <label className="block font-extrabold text-cyan-200">Corporación / Cargo *</label>
              <select
                value={corporacion}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setCorporacion(val);
                  if (val === 'Gobernación' || val === 'Asamblea') {
                    setCircunscripcionTerritorial('Departamento');
                  } else {
                    setCircunscripcionTerritorial('Municipio');
                  }
                }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 font-black text-white focus:outline-none focus:border-emerald-600 mt-1"
              >
                <option value="Gobernación">Gobernación Departamental</option>
                <option value="Asamblea">Asamblea Departamental</option>
                <option value="Alcaldía">Alcaldía Municipal / Distrital</option>
                <option value="Concejo">Concejo Municipal / Distrital</option>
                <option value="JAL">JAL (Junta Administradora Local / Ediles)</option>
              </select>
            </div>

            {/* 1.4 Circunscripción Territorial */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-white/5 space-y-1.5">
              <label className="block font-extrabold text-slate-200">Circunscripción Territorial *</label>
              <select
                value={circunscripcionTerritorial}
                onChange={(e) => handleCircunscripcionChange(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-600 mt-1"
              >
                <option value="Municipio">Municipio / Distrito</option>
                <option value="Departamento">Departamento</option>
              </select>
            </div>

            {/* 1.5 Entidad Territorial Dynamic Cascade */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-cyan-500/20 space-y-1.5 md:col-span-2 lg:col-span-2">
              <label className="block font-extrabold text-emerald-400 flex items-center justify-between">
                <span>Entidad Territorial (Despliegue Dinámico) *</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-[#111C30]0/20 text-emerald-300 px-2 py-0.5 rounded">
                  Circunscripción: {circunscripcionTerritorial}
                </span>
              </label>

              {circunscripcionTerritorial === 'Departamento' ? (
                /* DEPARTAMENTO CASE */
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-emerald-400">Seleccione el Departamento de Colombia:</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                    <select
                      value={departamento}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full bg-[#0F172A] border border-emerald-300 rounded-xl pl-9 pr-3 py-2 font-black text-white focus:outline-none focus:border-emerald-600"
                    >
                      {Object.keys(colombiaTerritorialData).sort().map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-emerald-300 font-semibold">
                    Entidad Territorial Seleccionada: <strong>Gobernación / Asamblea de {departamento}</strong>
                  </p>
                </div>
              ) : (
                /* MUNICIPIO CASE: CASCADE DEPARTAMENTO -> MUNICIPIO */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1">1. Departamento:</label>
                    <select
                      value={departamento}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full bg-[#0F172A] border border-emerald-300 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-emerald-600"
                    >
                      {Object.keys(colombiaTerritorialData).sort().map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1">2. Municipio / Distrito (Cascada):</label>
                    <select
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full bg-[#0F172A] border border-emerald-300 rounded-xl px-3 py-2 font-black text-white focus:outline-none focus:border-emerald-600"
                    >
                      {(colombiaTerritorialData[departamento] || []).map(mun => (
                        <option key={mun} value={mun}>{mun}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 1.6 Modalidad Candidatura */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-white/5 space-y-1.5">
              <label className="block font-extrabold text-slate-200">Modalidad de Candidatura *</label>
              <select
                value={modalidadCandidatura}
                onChange={(e) => setModalidadCandidatura(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-emerald-600 mt-1"
              >
                <option value="Uninominal">Uninominal (Candidato Único a Alcaldía/Gobernación)</option>
                <option value="Lista Abierta">Lista Abierta (Voto Preferente)</option>
                <option value="Lista Cerrada">Lista Cerrada (Voto No Preferente)</option>
              </select>
            </div>

            {/* 1.7 Posición en Tarjetón */}
            <div className="p-3 bg-[#111C30] rounded-xl border border-white/5 space-y-1.5">
              <label className="block font-extrabold text-slate-200">Ubicación / Número en Tarjetón</label>
              <div className="relative pt-1">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={posicionTarjeton}
                  onChange={(e) => setPosicionTarjeton(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => validateAndNext(1)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros de Elección y Campaña</span>
            </button>
          </div>
        </div>
      )}
    </div>


        {/* ========================================================================= */}
        {/* SECTION 2: CANDIDATE BASIC INFORMATION & DOSSIER */}
        {/* ========================================================================= */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeStep === 2 ? 'border-b border-white/5 pb-4' : ''}`}>
            <div 
              className="flex-1 cursor-pointer select-none"
              onClick={() => setActiveStep(activeStep === 2 ? 0 : 2)}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#111C30]0/20 text-purple-300 rounded-md text-[10px] font-extrabold uppercase mb-1">
                Paso 2 Candidato
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>2. Información Básica & Expediente del Candidato</span>
                {activeStep === 2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </h3>
            </div>
          </div>

          {activeStep === 2 && (
            <div className="space-y-5 animate-fadeIn">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Candidate Photo Card */}
            <div className="bg-[#111C30] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center space-y-3">
              <div className="relative group">
                <img
                  src={fotoUrl}
                  alt={nombreCandidato}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-200 block">Fotografía Oficial para Tarjetón</span>
                <span className="text-[10px] text-slate-400">Fondo blanco alta resolución 300x300 px</span>
              </div>
              <input
                type="text"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                placeholder="URL de la fotografía del candidato..."
                className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Basic Candidate Fields */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo del Candidato *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nombreCandidato}
                    onChange={(e) => setNombreCandidato(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Cédula de Ciudadanía (CC) *</label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cedulaCandidato}
                    onChange={(e) => setCedulaCandidato(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Político / Seudónimo en Tarjetón</label>
                <input
                  type="text"
                  value={seudonimoPolitico}
                  onChange={(e) => setSeudonimoPolitico(e.target.value)}
                  className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Profesión / Formación Académica</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profesionCandidato}
                    onChange={(e) => setProfesionCandidato(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Teléfono Directo / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={telefonoCandidato}
                    onChange={(e) => setTelefonoCandidato(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Correo Electrónico de Contacto</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={emailCandidato}
                    onChange={(e) => setEmailCandidato(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block font-bold text-slate-300 mb-1">Resumen de Hoja de Vida & Perfil Político</label>
                <textarea
                  rows={2}
                  value={resumenVida}
                  onChange={(e) => setResumenVida(e.target.value)}
                  className="w-full bg-[#111C30] border border-white/5 rounded-xl p-3 text-white text-xs focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                ></textarea>
              </div>

            </div>

          </div>

          <div className="flex items-center justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => validateAndNext(2)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Expediente del Candidato</span>
            </button>
          </div>
        </div>
      )}
    </div>


        {/* ========================================================================= */}
        {/* SECTION 3: POLITICAL ENDORSEMENT (PARTIDO / FIRMAS / COALICIÓN) */}
        {/* ========================================================================= */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeStep === 3 ? 'border-b border-white/5 pb-4' : ''}`}>
            <div 
              className="flex-1 cursor-pointer select-none"
              onClick={() => setActiveStep(activeStep === 3 ? 0 : 3)}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#111C30]0/20 text-amber-300 rounded-md text-[10px] font-extrabold uppercase mb-1">
                Paso 3 Respaldo
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>3. Modalidad de Respaldo Político & Aval Oficial</span>
                {activeStep === 3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </h3>
            </div>
          </div>

          {activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">

          {/* Selector of Endorsement Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'Partido', label: '1. Partido Político con Personería', desc: 'Aval único de un partido registrado CNE' },
              { id: 'Firmas', label: '2. Grupo Significativo (Firmas)', desc: 'Movimiento de ciudadanos por firmas' },
              { id: 'Coalición', label: '3. Coalición Político-Electoral', desc: 'Unión de múltiples partidos y movimientos' }
            ].map(mod => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setModalidadAval(mod.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  modalidadAval === mod.id
                    ? 'bg-[#0F172A] text-white border-emerald-400 shadow-md scale-101'
                    : 'bg-[#111C30] text-slate-300 border-white/5 hover:bg-[#020617] text-slate-100'
                }`}
              >
                <div className="font-extrabold text-xs">{mod.label}</div>
              </button>
            ))}
          </div>

          {/* DYNAMIC CASE A: SINGLE POLITICAL PARTY */}
          {modalidadAval === 'Partido' && (
            <div className="bg-[#111C30] p-4 rounded-2xl border border-white/5 space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-emerald-400">
                Selección de Partido Político Oficial (CNE Colombia)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Partido Político Avalista *</label>
                  <select
                    value={partidoUnico}
                    onChange={(e) => setPartidoUnico(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 font-extrabold text-white focus:outline-none focus:border-emerald-600"
                  >
                    {partidosPoliticosColombia.map(partido => (
                      <option key={partido} value={partido}>{partido}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Número de Radicado / Aval CNE *</label>
                  <input
                    type="text"
                    value={numeroAvalCNE}
                    onChange={(e) => setNumeroAvalCNE(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 font-bold font-mono text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE B: GRUPO SIGNIFICATIVO DE CIUDADANOS (FIRMAS) */}
          {modalidadAval === 'Firmas' && (
            <div className="bg-[#111C30] p-4 rounded-2xl border border-purple-500/20 space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-purple-400 text-xs uppercase tracking-wider">
                Grupo Significativo de Ciudadanos (Recolección de Firmas)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-purple-400 mb-1">Nombre Oficial del Movimiento por Firmas *</label>
                  <input
                    type="text"
                    value={nombreGrupoFirmas}
                    onChange={(e) => setNombreGrupoFirmas(e.target.value)}
                    className="w-full bg-[#0F172A] border border-purple-500/20 rounded-xl px-3 py-2 font-bold text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-400 mb-1">Meta Operativa de Firmas Validadas *</label>
                  <input
                    type="number"
                    value={metaFirmas}
                    onChange={(e) => setMetaFirmas(Number(e.target.value))}
                    className="w-full bg-[#0F172A] border border-purple-500/20 rounded-xl px-3 py-2 font-bold font-mono text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-400 mb-1">Radicado de Inscripción Registraduría *</label>
                  <input
                    type="text"
                    value={radicadoRegistraduria}
                    onChange={(e) => setRadicadoRegistraduria(e.target.value)}
                    className="w-full bg-[#0F172A] border border-purple-500/20 rounded-xl px-3 py-2 font-bold font-mono text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label className="block font-bold text-purple-400 mb-1">Comité Inscriptor (3 Promotores Principales por Ley)</label>
                  <input
                    type="text"
                    value={promotoresFirmas}
                    onChange={(e) => setPromotoresFirmas(e.target.value)}
                    className="w-full bg-[#0F172A] border border-purple-500/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC CASE C: COALICIÓN POLÍTICO-ELECTORAL */}
          {modalidadAval === 'Coalición' && (
            <div className="bg-[#111C30] p-4 rounded-2xl border border-cyan-500/20 space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider">
                Configuración de Coalición Político-Electoral Multi-Partido
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">Nombre Oficial de la Coalición *</label>
                  <input
                    type="text"
                    value={nombreCoalicion}
                    onChange={(e) => setNombreCoalicion(e.target.value)}
                    className="w-full bg-[#0F172A] border border-emerald-300 rounded-xl px-3 py-2 font-black text-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-400 mb-1">Partido Principal Responsable CNE *</label>
                  <select
                    value={partidoResponsableCNE}
                    onChange={(e) => setPartidoResponsableCNE(e.target.value)}
                    className="w-full bg-[#0F172A] border border-emerald-300 rounded-xl px-3 py-2 font-extrabold text-white focus:outline-none focus:border-emerald-600"
                  >
                    {partidosCoalicion.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Select Checkboxes for Coalition Parties */}
              <div>
                <label className="block font-bold text-emerald-400 text-xs mb-2">
                  Partidos y Movimientos Integrantes de la Coalición (Marque los participantes):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-[#0F172A] p-3 rounded-xl border border-cyan-500/20 max-h-44 overflow-y-auto">
                  {partidosPoliticosColombia.map(party => {
                    const isSelected = partidosCoalicion.includes(party);
                    return (
                      <button
                        key={party}
                        type="button"
                        onClick={() => togglePartyCoalition(party)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#111C30]0/20 text-emerald-300 text-emerald-400 border border-emerald-400' 
                            : 'bg-[#111C30] text-slate-400 hover:bg-[#020617] text-slate-100 border border-white/5'
                        }`}
                      >
                        <CheckSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`} />
                        <span className="truncate">{party}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => validateAndNext(3)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Respaldo Político y Aval</span>
            </button>
          </div>
        </div>
      )}
    </div>


        {/* ========================================================================= */}
        {/* SECTION 4: FECHAS CLAVE & PÓLIZA DE SERIEDAD DE CANDIDATURA */}
        {/* ========================================================================= */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeStep === 4 ? 'border-b border-white/5 pb-4' : ''}`}>
            <div 
              className="flex-1 cursor-pointer select-none"
              onClick={() => setActiveStep(activeStep === 4 ? 0 : 4)}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-md text-[10px] font-extrabold uppercase mb-1">
                Paso 4 Horarios & Póliza
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>4. Fechas Clave, Horarios del Día E & Póliza de Seriedad</span>
                {activeStep === 4 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </h3>
            </div>
          </div>

          {activeStep === 4 && (
            <div className="space-y-5 animate-fadeIn">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Hora de Apertura de Urnas</label>
              <div className="flex gap-2">
                <select
                  value={parseTimeTo12H(horaApertura).hour}
                  onChange={(e) => {
                    const { minute, period } = parseTimeTo12H(horaApertura);
                    setHoraApertura(formatTimeTo24H(e.target.value, minute, period));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                    <option key={h} value={h}>{h} h</option>
                  ))}
                </select>

                <select
                  value={parseTimeTo12H(horaApertura).minute}
                  onChange={(e) => {
                    const { hour, period } = parseTimeTo12H(horaApertura);
                    setHoraApertura(formatTimeTo24H(hour, e.target.value, period));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>

                <select
                  value={parseTimeTo12H(horaApertura).period}
                  onChange={(e) => {
                    const { hour, minute } = parseTimeTo12H(horaApertura);
                    setHoraApertura(formatTimeTo24H(hour, minute, e.target.value));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Hora de Cierre & Inicio Escrutinio</label>
              <div className="flex gap-2">
                <select
                  value={parseTimeTo12H(horaCierre).hour}
                  onChange={(e) => {
                    const { minute, period } = parseTimeTo12H(horaCierre);
                    setHoraCierre(formatTimeTo24H(e.target.value, minute, period));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                    <option key={h} value={h}>{h} h</option>
                  ))}
                </select>

                <select
                  value={parseTimeTo12H(horaCierre).minute}
                  onChange={(e) => {
                    const { hour, period } = parseTimeTo12H(horaCierre);
                    setHoraCierre(formatTimeTo24H(hour, e.target.value, period));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>

                <select
                  value={parseTimeTo12H(horaCierre).period}
                  onChange={(e) => {
                    const { hour, minute } = parseTimeTo12H(horaCierre);
                    setHoraCierre(formatTimeTo24H(hour, minute, e.target.value));
                  }}
                  className="bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600 flex-1 cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Proceso Electoral Seleccionado</label>
              <div className="px-3 py-2 bg-[#020617] text-slate-100 rounded-xl font-bold text-slate-200 border border-white/5 flex items-center justify-between">
                <span>Elección {tipoProcesoEleccion}</span>
                <span className="text-[10px] text-emerald-400 bg-[#111C30]0/20 text-emerald-300 px-2 py-0.5 rounded font-mono">{fechaEleccion}</span>
              </div>
            </div>
          </div>

          {/* Insurance Policy for Serious Nomination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Número de Póliza de Seriedad de Candidatura (GSC / Coalición)</label>
              <input
                type="text"
                value={polizaNumero}
                onChange={(e) => setPolizaNumero(e.target.value)}
                className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Compañía Aseguradora Emisora</label>
              <input
                type="text"
                value={aseguradora}
                onChange={(e) => setAseguradora(e.target.value)}
                className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => validateAndNext(4)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Horarios y Póliza</span>
            </button>
          </div>
        </div>
      )}
    </div>


        {/* ========================================================================= */}
        {/* SECTION 5: GESTIÓN Y CONFIGURACIÓN DE CAMPAÑAS ALIADAS & LISTAS (ASAMBLEA, CONCEJO Y JAL) */}
        {/* ========================================================================= */}
        <div className="bg-[#0F172A] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeStep === 5 ? 'border-b border-white/5 pb-4' : ''}`}>
            <div 
              className="flex-1 cursor-pointer select-none"
              onClick={() => setActiveStep(activeStep === 5 ? 0 : 5)}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md text-[10px] font-extrabold uppercase mb-1">
                Paso 5 Campañas Aliadas
              </div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>5. Gestión y Configuración de Campañas Aliadas & Listas de Candidatos</span>
                {activeStep === 5 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowAddAliadaModal(true)}
                className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Crear Nueva Lista Aliada</span>
              </button>
            </div>
          </div>

          {activeStep === 5 && (
            <div className="space-y-6 animate-fadeIn">

          {/* Cards Grid: Allied Campaigns Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campanasAliadas.map(camp => {
              const isSelected = camp.id === selectedAliadaId;
              const cabezaObj = camp.candidatos.find(c => c.esCabeza) || camp.candidatos[0];

              const corpColor = camp.corporacion === 'Asamblea' 
                ? 'bg-blue-100 text-blue-900 border-blue-300' 
                : camp.corporacion === 'Concejo'
                ? 'bg-[#111C30]0/20 text-emerald-300 text-emerald-400 border-emerald-300'
                : 'bg-[#111C30]0/20 text-purple-300 text-purple-400 border-purple-300';

              return (
                <div
                  key={camp.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#0F172A] border-emerald-500 ring-2 ring-emerald-400/50 shadow-md' 
                      : 'bg-[#111C30]/80 border-white/5 hover:bg-[#020617] text-slate-100'
                  }`}
                  onClick={() => setSelectedAliadaId(camp.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${corpColor}`}>
                        {camp.corporacion}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-[#0F172A] px-2 py-0.5 rounded border border-white/5">
                        {camp.modalidad}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-xs leading-snug line-clamp-2">
                      {camp.nombreLista}
                    </h4>

                    <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{camp.partidoOLista}</span>
                    </div>

                    {cabezaObj && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 bg-[#0F172A] p-1.5 rounded-lg border border-white/5">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate font-bold text-slate-200">#1 {cabezaObj.nombre}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5/80 flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <span className="block font-bold text-slate-300">{camp.candidatos.length} Candidatos</span>
                      <span className="block text-[10px] text-slate-400 font-mono">Meta: {camp.metaVotosEsperada.toLocaleString()} votos</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAliadaId(camp.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-300 hover:bg-slate-300'
                        }`}
                        title="Gestionar lista de candidatos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAliada(camp.id, camp.nombreLista);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500/20 text-rose-300 border border-rose-200 transition-all"
                        title="Eliminar esta lista aliada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Candidate Management Panel for Currently Selected Allied List */}
          {(() => {
            if (!selectedAliadaId) {
              return (
                <div className="bg-[#111C30]/40 p-8 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-2.5 py-12">
                  <Users className="w-8 h-8 text-slate-500 animate-pulse" />
                  <span className="text-slate-300 font-extrabold text-xs">Ninguna Lista Aliada Seleccionada</span>
                  <span className="text-[11px] text-slate-400 max-w-sm leading-normal">
                    Selecciona una campaña o lista aliada arriba haciendo clic sobre su tarjeta para gestionar sus candidatos inscritos.
                  </span>
                </div>
              );
            }
            const selectedCampana = campanasAliadas.find(c => c.id === selectedAliadaId);
            if (!selectedCampana) return null;

            return (
              <div className="bg-[#111C30] p-5 rounded-2xl border border-white/5/90 space-y-5 animate-fadeIn">
                
                {/* Selected List Header */}
                <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-[#111C30]0/20 text-emerald-300 text-emerald-300 font-extrabold text-[10px] rounded-md uppercase">
                          Lista Seleccionada: {selectedCampana.corporacion}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">({selectedCampana.modalidad})</span>
                      </div>
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                        <span>{selectedCampana.nombreLista}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Respaldo Político: <strong>{selectedCampana.partidoOLista}</strong> | Ubicación: {selectedCampana.municipio} ({selectedCampana.departamento}) {selectedCampana.localidadComuna ? `- ${selectedCampana.localidadComuna}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleStartEditListInfo(selectedCampana)}
                        className="px-3 py-1.5 bg-[#020617] text-slate-100 hover:bg-slate-200 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/5"
                        title="Modificar nombre, partido o meta de la lista"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Editar Info de Lista</span>
                      </button>

                      <div className="flex items-center gap-3 bg-[#111C30] p-2 rounded-xl border border-white/5 text-xs">
                        <div className="text-center px-2">
                          <span className="block font-black text-white text-base">{selectedCampana.candidatos.length}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Candidatos</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="text-center px-2">
                          <span className="block font-black text-emerald-400 text-base">{selectedCampana.metaVotosEsperada.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Meta Votos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Form to Edit Selected List Metadata */}
                  {editingListInfoId === selectedCampana.id && (
                    <form onSubmit={handleSaveListInfo} className="p-3 bg-[#111C30] rounded-xl border border-cyan-500/20 space-y-3 animate-fadeIn text-xs">
                      <div className="font-extrabold text-emerald-400 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-emerald-400" />
                        <span>Editar Nombre y Configuración de la Lista ({selectedCampana.corporacion})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Nombre de la Lista *</label>
                          <input
                            type="text"
                            required
                            value={editListNombre}
                            onChange={(e) => setEditListNombre(e.target.value)}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Partido Avalista *</label>
                          <select
                            value={editListPartido}
                            onChange={(e) => setEditListPartido(e.target.value)}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white"
                          >
                            {partidosPoliticosColombia.map(partido => (
                              <option key={partido} value={partido}>{partido}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Modalidad *</label>
                          <select
                            value={editListModalidad}
                            onChange={(e) => setEditListModalidad(e.target.value as any)}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white"
                          >
                            <option value="Lista Abierta">Lista Abierta (Voto Preferente)</option>
                            <option value="Lista Cerrada">Lista Cerrada (Voto No Preferente)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-300 mb-1">Meta de Votos *</label>
                          <input
                            type="number"
                            required
                            value={editListMetaVotos}
                            onChange={(e) => setEditListMetaVotos(Number(e.target.value))}
                            className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-2.5 py-1.5 font-bold text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingListInfoId(null)}
                          className="px-3 py-1 bg-[#0F172A] text-slate-300 font-bold rounded-lg border border-white/5"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg shadow hover:bg-[#111C30]0"
                        >
                          Guardar Cambios de Lista
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Form to Add / Edit Candidate in Selected List */}
                <form onSubmit={handleAddOrUpdateCandidate} className="bg-[#0F172A] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-600" />
                      {editingCandidateId ? 'Editando Candidato en la Lista' : `Inscribir Nuevo Candidato a esta Lista (${selectedCampana.nombreLista})`}
                    </h5>

                    {editingCandidateId && (
                      <button
                        type="button"
                        onClick={handleCancelCandidateEdit}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Cancelar Edición de Candidato
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Renglón # *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={35}
                        value={candRenglon}
                        onChange={(e) => setCandRenglon(Number(e.target.value))}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block font-bold text-slate-300 mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Dr. Andrés Felipe Restrepo"
                        value={candNombre}
                        onChange={(e) => setCandNombre(e.target.value)}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Cédula de Ciudadanía *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 1.017.234.567"
                        value={candCedula}
                        onChange={(e) => setCandCedula(e.target.value)}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Teléfono / Celular</label>
                      <input
                        type="text"
                        placeholder="+57 300 000 0000"
                        value={candTelefono}
                        onChange={(e) => setCandTelefono(e.target.value)}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold font-mono focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={candEmail}
                        onChange={(e) => setCandEmail(e.target.value)}
                        className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 text-white font-bold focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                      <input
                        type="checkbox"
                        checked={candEsCabeza}
                        onChange={(e) => setCandEsCabeza(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Marcar como <strong>Cabeza de Lista (#1 Principal)</strong></span>
                    </label>

                    <div className="flex items-center gap-2">
                      {editingCandidateId && (
                        <button
                          type="button"
                          onClick={handleCancelCandidateEdit}
                          className="px-3 py-2 bg-[#020617] text-slate-100 hover:bg-slate-200 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-[#111C30]0 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{editingCandidateId ? 'Guardar Cambios Candidato' : 'Agregar Candidato a la Lista'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Registered Candidates Table */}
                <div className="bg-[#0F172A] rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 bg-[#020617] text-slate-100 border-b border-white/5 flex items-center justify-between">
                    <h5 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Candidatos Inscritos en la Lista ({selectedCampana.candidatos.length})
                    </h5>
                    <span className="text-[10px] text-slate-400 font-bold">Ordenados por número de renglón</span>
                  </div>

                  {selectedCampana.candidatos.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">No hay candidatos registrados en esta lista todavía.</p>
                      <p className="text-[11px] text-slate-400">Diligencie el formulario de arriba para inscribir al primer candidato.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#111C30] text-slate-400 font-extrabold text-[10px] uppercase tracking-wider border-b border-white/5">
                          <tr>
                            <th className="px-4 py-2.5 text-center w-16">Renglón</th>
                            <th className="px-4 py-2.5">Candidato</th>
                            <th className="px-4 py-2.5">Cédula (CC)</th>
                            <th className="px-4 py-2.5">Teléfono / Email</th>
                            <th className="px-4 py-2.5 text-center">Cabeza de Lista</th>
                            <th className="px-4 py-2.5 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-200">
                          {selectedCampana.candidatos.map((cand) => (
                            <tr key={cand.id} className="hover:bg-[#111C30]/80 transition-colors">
                              <td className="px-4 py-2.5 text-center font-black font-mono text-emerald-400 bg-[#111C30]/50">
                                #{cand.numeroRenglon}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{cand.nombre}</span>
                                  {cand.esCabeza && (
                                    <span className="px-2 py-0.5 bg-[#111C30]0/20 text-amber-300 text-amber-300 font-extrabold text-[9px] rounded-md border border-amber-300">
                                      Cabeza de Lista
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-slate-400">{cand.cedula}</td>
                              <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                                <div>{cand.telefono || 'Sin teléfono'}</div>
                                <div className="text-[10px] text-slate-400">{cand.email || 'Sin email'}</div>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCabeza(cand.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    cand.esCabeza 
                                      ? 'bg-[#111C30]0 text-white shadow-sm' 
                                      : 'bg-[#020617] text-slate-100 text-slate-400 hover:bg-[#111C30]0/20 text-amber-300 hover:text-amber-300'
                                  }`}
                                >
                                  {cand.esCabeza ? '★ Cabeza #1' : 'Hacer Cabeza'}
                                </button>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditCandidate(cand)}
                                    className="p-1.5 text-slate-400 hover:bg-[#020617] text-slate-100 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Editar datos de este candidato"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCandidate(cand.id)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar candidato"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            );
          })()}
        </div>
      )}
    </div>

        {/* Modal to Create a New Allied List */}
        {showAddAliadaModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#0F172A] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-white/5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-white text-base">Crear / Vincular Nueva Lista o Campaña Aliada</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAliadaModal(false)}
                  className="p-1 rounded-lg hover:bg-[#020617] text-slate-100 text-slate-400 hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAliada} className="space-y-4 text-xs">
                {/* CNE Rule Notice */}
                <div className="bg-[#111C30] border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-400 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-400">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Normativa Electoral (CNE/Registraduría):</span>
                  </div>
                  <p className="text-amber-300 leading-snug">
                    Como la campaña principal es <strong>{corporacion}</strong> ({entidadTerritorialTexto}), las campañas aliadas se configuran únicamente como listas a corporaciones públicas colegiadas (<strong>Concejo, Asamblea o JAL</strong>). NO se permite crear o vincular otra Alcaldía o Gobernación como aliada. Se permiten múltiples listas al Concejo o Asamblea cuando varios partidos la respaldan.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Corporación Aliada *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Concejo', label: 'Concejo Municipal / Distrital' },
                      { id: 'Asamblea', label: 'Asamblea Departamental' },
                      { id: 'JAL', label: 'JAL (Ediles)' }
                    ].map(corp => (
                      <button
                        key={corp.id}
                        type="button"
                        onClick={() => setNewAliadaCorp(corp.id as any)}
                        className={`p-2.5 rounded-xl border text-center font-extrabold transition-all cursor-pointer ${
                          newAliadaCorp === corp.id 
                            ? 'bg-[#0F172A] text-white border-emerald-400 shadow-sm' 
                            : 'bg-[#111C30] text-slate-300 border-white/5 hover:bg-[#020617] text-slate-100'
                        }`}
                      >
                        {corp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Partido / Movimiento Avalista *</label>
                    <select
                      value={newAliadaPartido}
                      onChange={(e) => setNewAliadaPartido(e.target.value)}
                      className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 font-bold text-white focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                    >
                      {partidosPoliticosColombia.map(partido => (
                        <option key={partido} value={partido}>{partido}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Modalidad de Lista *</label>
                    <select
                      value={newAliadaModalidad}
                      onChange={(e) => setNewAliadaModalidad(e.target.value as any)}
                      className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 font-bold text-white focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Lista Abierta">Lista Abierta (Voto Preferente)</option>
                      <option value="Lista Cerrada">Lista Cerrada (Voto No Preferente)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nombre Descriptivo de la Lista *</label>
                  <input
                    type="text"
                    placeholder={`Ej. Lista al ${newAliadaCorp} - ${newAliadaPartido}`}
                    value={newAliadaNombre}
                    onChange={(e) => setNewAliadaNombre(e.target.value)}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 font-bold text-white focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {newAliadaCorp === 'JAL' && (
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Comuna / Localidad para JAL *</label>
                    <input
                      type="text"
                      placeholder="Ej. Comuna 10 - La Candelaria / Centro"
                      value={newAliadaComuna}
                      onChange={(e) => setNewAliadaComuna(e.target.value)}
                      className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 font-bold text-white focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Meta Esperada de Votos para la Lista</label>
                  <input
                    type="number"
                    value={newAliadaMetaVotos}
                    onChange={(e) => setNewAliadaMetaVotos(Number(e.target.value))}
                    className="w-full bg-[#111C30] border border-white/5 rounded-xl px-3 py-2 font-bold font-mono text-white focus:bg-[#0F172A] focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddAliadaModal(false)}
                    className="px-4 py-2 bg-[#020617] text-slate-100 text-slate-300 hover:bg-slate-200 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-[#111C30]0 text-white font-extrabold rounded-xl shadow transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Crear Lista Aliada</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
