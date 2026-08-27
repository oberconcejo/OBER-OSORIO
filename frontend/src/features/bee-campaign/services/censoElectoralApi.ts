export interface CensoConsultaResult {
  cedula: string;
  encontrado: boolean;
  esCircunscripcionPermitida: boolean;
  circunscripcionCiudadano: string;
  circunscripcionCampana: string;
  nombreCompleto?: string;
  departamento?: string;
  municipio?: string;
  puestoVotacion?: string;
  comunaSector?: string;
  direccionPuesto?: string;
  mesa?: number;
  estadoCedula?: 'Habilitada' | 'Inhabilitada por Sanción' | 'No Inscrita';
  fechaUltimaActualizacion?: string;
  mensajeRespuesta: string;
}

// Database of known census records for simulation & testing
const BASE_CENSO_DB: Record<string, Omit<CensoConsultaResult, 'cedula' | 'mensajeRespuesta'>> = {
  '1017123456': {
    encontrado: true,
    esCircunscripcionPermitida: true,
    circunscripcionCiudadano: 'Medellín - Antioquia',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'CARLOS ALBERTO JARAMILLO MONTOYA',
    departamento: 'ANTIOQUIA',
    municipio: 'MEDELLÍN',
    puestoVotacion: 'I.E. Marco Fidel Suárez',
    comunaSector: 'Comuna 11 - Laureles Estadio',
    direccionPuesto: 'Cra 70 # 44-51',
    mesa: 14,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-07-15'
  },
  '1020456789': {
    encontrado: true,
    esCircunscripcionPermitida: true,
    circunscripcionCiudadano: 'Medellín - Antioquia',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'MARÍA FERNANDA OROZCO RESTREPO',
    departamento: 'ANTIOQUIA',
    municipio: 'MEDELLÍN',
    puestoVotacion: 'Inem José Félix de Restrepo',
    comunaSector: 'Comuna 14 - El Poblado',
    direccionPuesto: 'Cra 48 # 1 Sur-125',
    mesa: 8,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-06-20'
  },
  '71345678': {
    encontrado: true,
    esCircunscripcionPermitida: true,
    circunscripcionCiudadano: 'Medellín - Antioquia',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'JORGE ENRIQUE BEDOYA GÓMEZ',
    departamento: 'ANTIOQUIA',
    municipio: 'MEDELLÍN',
    puestoVotacion: 'Escuela San Javier - Escaleras',
    comunaSector: 'Comuna 13 - San Javier',
    direccionPuesto: 'Calle 44 # 108-20',
    mesa: 22,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-08-01'
  },
  '43567890': {
    encontrado: true,
    esCircunscripcionPermitida: true,
    circunscripcionCiudadano: 'Medellín - Antioquia',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'LUZ ELENA ZAPATA PÉREZ',
    departamento: 'ANTIOQUIA',
    municipio: 'MEDELLÍN',
    puestoVotacion: 'I.E. Javiera Londoño',
    comunaSector: 'Comuna 4 - Aranjuez',
    direccionPuesto: 'Carrera 51 # 92-18',
    mesa: 5,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-07-28'
  },
  '88990011': {
    encontrado: true,
    esCircunscripcionPermitida: false,
    circunscripcionCiudadano: 'Bogotá D.C. - Cundinamarca',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'ANDRÉS FELIPE RINCÓN BUSTAMANTE',
    departamento: 'CUNDINAMARCA',
    municipio: 'BOGOTÁ D.C.',
    puestoVotacion: 'Corferias - Pabellón 6',
    comunaSector: 'Localidad Teusaquillo',
    direccionPuesto: 'Cra 37 # 24-67',
    mesa: 42,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-05-10'
  },
  '99887766': {
    encontrado: true,
    esCircunscripcionPermitida: false,
    circunscripcionCiudadano: 'Envigado - Antioquia',
    circunscripcionCampana: 'Medellín - Antioquia',
    nombreCompleto: 'LINA MARÍA OCAMPO BOTERO',
    departamento: 'ANTIOQUIA',
    municipio: 'ENVIGADO',
    puestoVotacion: 'I.E. Comercial de Envigado',
    comunaSector: 'Zona Centro Envigado',
    direccionPuesto: 'Calle 38 Sur # 43A-21',
    mesa: 11,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-06-12'
  }
};

/**
 * Consulta la API oficial de Censo Electoral.
 * Requiere que el ciudadano esté inscrito en la circunscripción de la campaña (Medellín - Antioquia).
 */
export async function consultarCensoElectoralAPI(
  cedula: string, 
  circunscripcionCampana: string = 'Medellín - Antioquia'
): Promise<CensoConsultaResult> {
  // Simulación de latencia de red API de la Registraduría Nacional (600ms)
  await new Promise(resolve => setTimeout(resolve, 600));

  const cleanCedula = cedula.trim().replace(/\D/g, '');

  if (!cleanCedula) {
    return {
      cedula: cleanCedula,
      encontrado: false,
      esCircunscripcionPermitida: false,
      circunscripcionCiudadano: 'Desconocido',
      circunscripcionCampana,
      mensajeRespuesta: 'Número de cédula inválido o no suministrado.'
    };
  }

  // Check static database first
  if (BASE_CENSO_DB[cleanCedula]) {
    const record = BASE_CENSO_DB[cleanCedula];
    if (!record.encontrado) {
      return {
        cedula: cleanCedula,
        encontrado: false,
        esCircunscripcionPermitida: false,
        circunscripcionCiudadano: 'No Registrado',
        circunscripcionCampana,
        mensajeRespuesta: `Cédula No. ${cleanCedula} no figura inscrita en el Censo Electoral Nacional 2026.`
      };
    }

    if (!record.esCircunscripcionPermitida) {
      return {
        ...record,
        cedula: cleanCedula,
        mensajeRespuesta: `❌ CIUDADANO NO APTO PARA REGISTRO EN ESTA CAMPAÑA: Su puesto de votación asignado es ${record.municipio} (${record.puestoVotacion}), el cual pertenece a la circunscripción [${record.circunscripcionCiudadano}]. Esta campaña opera exclusivamente en [${circunscripcionCampana}].`
      };
    }

    return {
      ...record,
      cedula: cleanCedula,
      mensajeRespuesta: `✅ VERIFICACIÓN EXITOSA: Ciudadano habilitado en el Censo Electoral de ${record.municipio} (${record.puestoVotacion}, ${record.comunaSector}, Mesa ${record.mesa}).`
    };
  }

  // Dynamic rule for any other cédula entered by the user
  // Cédulas ending with '9' or starting with '8' or '9' are mapped to other municipalities (Outside campaign)
  // Otherwise default to Medellín - Antioquia (Campaign district)
  const isOutside = cleanCedula.endsWith('9') || cleanCedula.startsWith('8') || cleanCedula.startsWith('99');
  
  if (cleanCedula.endsWith('000') || cleanCedula === '0') {
    return {
      cedula: cleanCedula,
      encontrado: false,
      esCircunscripcionPermitida: false,
      circunscripcionCiudadano: 'No Encontrado',
      circunscripcionCampana,
      mensajeRespuesta: `Cédula No. ${cleanCedula} NO se encuentra registrada en el Censo Electoral 2026.`
    };
  }

  if (isOutside) {
    return {
      cedula: cleanCedula,
      encontrado: true,
      esCircunscripcionPermitida: false,
      circunscripcionCiudadano: 'Rionegro - Antioquia',
      circunscripcionCampana,
      nombreCompleto: 'CIUDADANO EXTERNO REGISTRADURÍA',
      departamento: 'ANTIOQUIA',
      municipio: 'RIONEGRO',
      puestoVotacion: 'Colegio San José de las Vegas Rionegro',
      comunaSector: 'Sector Llanogrande',
      direccionPuesto: 'Km 7 Vía Don Diego',
      mesa: 3,
      estadoCedula: 'Habilitada',
      fechaUltimaActualizacion: '2026-07-01',
      mensajeRespuesta: `❌ RECHAZADO POR CIRCUNSCRIPCIÓN: El ciudadano con C.C. ${cleanCedula} está censado en RIONEGRO - ANTIOQUIA, fuera de la circunscripción oficial de la campaña [${circunscripcionCampana}].`
    };
  }

  // Default valid Medellín census record generated dynamically
  const PUESTOS_MEDELLIN = [
    { puesto: 'I.E. Marco Fidel Suárez', comuna: 'Comuna 11 - Laureles', dir: 'Cra 70 # 44-51', mesa: 12 },
    { puesto: 'Inem José Félix de Restrepo', comuna: 'Comuna 14 - El Poblado', dir: 'Cra 48 # 1 Sur-125', mesa: 7 },
    { puesto: 'Escuela San Javier', comuna: 'Comuna 13 - San Javier', dir: 'Calle 44 # 108-20', mesa: 18 },
    { puesto: 'I.E. Javiera Londoño', comuna: 'Comuna 4 - Aranjuez', dir: 'Carrera 51 # 92-18', mesa: 4 },
    { puesto: 'Colegio Candelaria - Centro', comuna: 'Comuna 10 - La Candelaria', dir: 'Calle 50 # 43-65', mesa: 15 },
    { puesto: 'I.E. Republica de Venezuela', comuna: 'Comuna 5 - Castilla', dir: 'Calle 98 # 68-30', mesa: 9 },
  ];

  const hash = Array.from(cleanCedula).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedPuesto = PUESTOS_MEDELLIN[hash % PUESTOS_MEDELLIN.length];

  return {
    cedula: cleanCedula,
    encontrado: true,
    esCircunscripcionPermitida: true,
    circunscripcionCiudadano: circunscripcionCampana,
    circunscripcionCampana,
    nombreCompleto: `VOTANTE VALIDADO C.C. ${cleanCedula}`,
    departamento: 'ANTIOQUIA',
    municipio: 'MEDELLÍN',
    puestoVotacion: selectedPuesto.puesto,
    comunaSector: selectedPuesto.comuna,
    direccionPuesto: selectedPuesto.dir,
    mesa: selectedPuesto.mesa,
    estadoCedula: 'Habilitada',
    fechaUltimaActualizacion: '2026-08-05',
    mensajeRespuesta: `✅ CENSADO Y VERIFICADO: Habilitado para votar en Medellín (${selectedPuesto.puesto}, ${selectedPuesto.comuna}, Mesa ${selectedPuesto.mesa}).`
  };
}

/**
 * Consulta de actualización periódica para registros archivados.
 * Simula la verificación de si un ciudadano registrado en otra circunscripción
 * o no inscrito ya fue trasladado formalmente a Medellín por la Registraduría / CNE.
 */
export async function verificarActualizacionPuestoAPI(
  cedula: string,
  forzarActualizadoMedellin: boolean = false
): Promise<{
  trasladadoAMedellin: boolean;
  puestoNuevo?: {
    departamento: string;
    municipio: string;
    puestoVotacion: string;
    comunaSector: string;
    direccionPuesto: string;
    mesa: number;
    fechaInscripcion: string;
  };
  mensaje: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const cleanCedula = cedula.trim().replace(/\D/g, '');

  if (forzarActualizadoMedellin || cleanCedula === '88990011' || cleanCedula === '99887766') {
    // Generated new Medellín post for simulated updated voters
    const PUESTOS = [
      { puesto: 'I.E. Marco Fidel Suárez', comuna: 'Comuna 11 - Laureles', dir: 'Cra 70 # 44-51', mesa: 14 },
      { puesto: 'Inem José Félix de Restrepo', comuna: 'Comuna 14 - El Poblado', dir: 'Cra 48 # 1 Sur-125', mesa: 9 },
      { puesto: 'Escuela San Javier', comuna: 'Comuna 13 - San Javier', dir: 'Calle 44 # 108-20', mesa: 21 },
      { puesto: 'I.E. Javiera Londoño', comuna: 'Comuna 4 - Aranjuez', dir: 'Carrera 51 # 92-18', mesa: 6 }
    ];
    const hash = Array.from(cleanCedula).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sel = PUESTOS[hash % PUESTOS.length];

    return {
      trasladadoAMedellin: true,
      puestoNuevo: {
        departamento: 'ANTIOQUIA',
        municipio: 'MEDELLÍN',
        puestoVotacion: sel.puesto,
        comunaSector: sel.comuna,
        direccionPuesto: sel.dir,
        mesa: sel.mesa,
        fechaInscripcion: new Date().toISOString().split('T')[0]
      },
      mensaje: `¡ACTUALIZACIÓN CNE CONFIRMADA! La C.C. ${cleanCedula} ha completado exitosamente su traslado de puesto de votación a Medellín (${sel.puesto}, ${sel.comuna}, Mesa ${sel.mesa}).`
    };
  }

  return {
    trasladadoAMedellin: false,
    mensaje: `CNE API: La C.C. ${cleanCedula} continúa censada fuera de la circunscripción oficial. No se detectan traslados recientes.`
  };
}

