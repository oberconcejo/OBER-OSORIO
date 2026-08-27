import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  TerritorialZone,
  E14Record,
  CalendarEvent,
  BankTransaction
} from '../types';
import {
  VotanteRegistrado,
  VotanteArchivado
} from '../components/views/RegistroVotantesView';
import {
  initialCalendarEvents,
  initialE14Records,
  initialBankTransactions,
  initialTerritorialZones
} from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial default active voters for seeding if database is empty
const defaultVotantes: VotanteRegistrado[] = [
  {
    id: 'v-100a',
    cedula: '1017987654',
    nombreCompleto: 'ALEJANDRO OROZCO OSORIO',
    telefono: '301 555 1234',
    barrio: 'Laureles - San Joaquín',
    comunaSector: 'Comuna 11 - Laureles Estadio',
    puestoVotacion: 'I.E. Marco Fidel Suárez',
    direccionPuesto: 'Cra 70 # 44-51',
    mesa: 5,
    liderAsignado: 'Carlos Ramírez (Coordinador Territorial / Testigo)',
    intencionVoto: 'Voto Seguro',
    requiereTransporte: false,
    observaciones: 'Votante registrado por Carlos Ramírez. Confirmado 100%.',
    fechaRegistro: '2026-08-10',
    estadoCenso: 'Validado API Medellín',
    circunscripcion: 'Medellín - Antioquia'
  },
  {
    id: 'v-100b',
    cedula: '1032445566',
    nombreCompleto: 'DANIELA RESTREPO GIRALDO',
    telefono: '314 777 9900',
    barrio: 'El Poblado - Manila',
    comunaSector: 'Comuna 14 - El Poblado',
    puestoVotacion: 'Inem José Félix de Restrepo',
    direccionPuesto: 'Cra 48 # 1 Sur-125',
    mesa: 12,
    liderAsignado: 'Carlos Ramírez (Coordinador Territorial / Testigo)',
    intencionVoto: 'Simpatizante',
    requiereTransporte: true,
    observaciones: 'Simpatizante clave registrada en jornada territorial.',
    fechaRegistro: '2026-08-09',
    estadoCenso: 'Validado API Medellín',
    circunscripcion: 'Medellín - Antioquia'
  },
  {
    id: 'v-101',
    cedula: '1017123456',
    nombreCompleto: 'CARLOS ALBERTO JARAMILLO MONTOYA',
    telefono: '300 456 7890',
    barrio: 'Laureles - San Joaquín',
    comunaSector: 'Comuna 11 - Laureles Estadio',
    puestoVotacion: 'I.E. Marco Fidel Suárez',
    direccionPuesto: 'Cra 70 # 44-51',
    mesa: 14,
    liderAsignado: 'Carlos Ruiz (Coordinador Comuna 11)',
    intencionVoto: 'Voto Seguro',
    requiereTransporte: true,
    observaciones: 'Simpatizante clave, comprometido con llevar 4 familiares más.',
    fechaRegistro: '2026-08-08',
    estadoCenso: 'Validado API Medellín',
    circunscripcion: 'Medellín - Antioquia'
  },
  {
    id: 'v-102',
    cedula: '1020456789',
    nombreCompleto: 'MARÍA FERNANDA OROZCO RESTREPO',
    telefono: '312 987 6543',
    barrio: 'El Poblado - Manila',
    comunaSector: 'Comuna 14 - El Poblado',
    puestoVotacion: 'Inem José Félix de Restrepo',
    direccionPuesto: 'Cra 48 # 1 Sur-125',
    mesa: 8,
    liderAsignado: 'Ana Patricia Gómez (Coordinadora Comuna 14)',
    intencionVoto: 'Simpatizante',
    requiereTransporte: false,
    observaciones: 'Asistió al foro de jóvenes emprendedores.',
    fechaRegistro: '2026-08-09',
    estadoCenso: 'Validado API Medellín',
    circunscripcion: 'Medellín - Antioquia'
  }
];

const defaultArchived: VotanteArchivado[] = [
  {
    id: 'va-201',
    cedula: '9876543210',
    nombreCompleto: 'HERNÁN DARIO GÓMEZ ZAPATA',
    telefono: '311 222 3344',
    barrio: 'Envigado Centro',
    circunscripcionOriginal: 'Envigado - Antioquia',
    puestoOriginal: 'I.E. Comercial de Envigado',
    liderAsignado: 'Carlos Ramírez (Coordinador Territorial / Testigo)',
    motivo: 'Cédula no inscrita en la circunscripcion electoral de Medellín. Puesto en Envigado.',
    fechaArchivado: '2026-08-07',
    fechaUltimaConsultaApi: '2026-08-10',
    estadoCne: 'En Espera de Traslado CNE'
  }
];

// -------------------------------------------------------------
// 1. ACTIVE VOTERS FIRESTORE SYNC & CRUD
// -------------------------------------------------------------
export function subscribeVoters(onUpdate: (voters: VotanteRegistrado[]) => void) {
  const path = 'voters';
  const votersRef = collection(db, path);

  const unsubscribe = onSnapshot(
    votersRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default voters to Firestore
        try {
          for (const v of defaultVotantes) {
            await setDoc(doc(db, path, v.id), v);
          }
        } catch (e) {
          console.error('Error seeding voters to Firestore:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as VotanteRegistrado);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function addVoterDoc(voter: VotanteRegistrado) {
  const path = `voters/${voter.id}`;
  try {
    await setDoc(doc(db, 'voters', voter.id), voter);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateVoterDoc(id: string, partial: Partial<VotanteRegistrado>) {
  const path = `voters/${id}`;
  try {
    await updateDoc(doc(db, 'voters', id), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVoterDoc(id: string) {
  const path = `voters/${id}`;
  try {
    await deleteDoc(doc(db, 'voters', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 2. ARCHIVED VOTERS FIRESTORE SYNC & CRUD
// -------------------------------------------------------------
export function subscribeArchivedVoters(onUpdate: (archived: VotanteArchivado[]) => void) {
  const path = 'archived_voters';
  const archivedRef = collection(db, path);

  const unsubscribe = onSnapshot(
    archivedRef,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const va of defaultArchived) {
            await setDoc(doc(db, path, va.id), va);
          }
        } catch (e) {
          console.error('Error seeding archived voters:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as VotanteArchivado);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function addArchivedVoterDoc(archived: VotanteArchivado) {
  const path = `archived_voters/${archived.id}`;
  try {
    await setDoc(doc(db, 'archived_voters', archived.id), archived);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteArchivedVoterDoc(id: string) {
  const path = `archived_voters/${id}`;
  try {
    await deleteDoc(doc(db, 'archived_voters', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// 3. TERRITORIAL ZONES SYNC
// -------------------------------------------------------------
export function subscribeTerritorialZones(onUpdate: (zones: TerritorialZone[]) => void) {
  const path = 'territorial_zones';
  const ref = collection(db, path);

  const unsubscribe = onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const z of initialTerritorialZones) {
            await setDoc(doc(db, path, z.id), z);
          }
        } catch (e) {
          console.error('Error seeding territorial zones:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as TerritorialZone);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function updateTerritorialZoneDoc(id: string, partial: Partial<TerritorialZone>) {
  const path = `territorial_zones/${id}`;
  try {
    await updateDoc(doc(db, 'territorial_zones', id), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// 4. E14 RECORDS SYNC & CRUD
// -------------------------------------------------------------
export function subscribeE14Records(onUpdate: (records: E14Record[]) => void) {
  const path = 'e14_records';
  const ref = collection(db, path);

  const unsubscribe = onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const r of initialE14Records) {
            await setDoc(doc(db, path, r.id), r);
          }
        } catch (e) {
          console.error('Error seeding E14 records:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as E14Record);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function addE14RecordDoc(record: E14Record) {
  const path = `e14_records/${record.id}`;
  try {
    await setDoc(doc(db, 'e14_records', record.id), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateE14RecordDoc(id: string, partial: Partial<E14Record>) {
  const path = `e14_records/${id}`;
  try {
    await updateDoc(doc(db, 'e14_records', id), partial);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// 5. CALENDAR EVENTS SYNC
// -------------------------------------------------------------
export function subscribeCalendarEvents(onUpdate: (events: CalendarEvent[]) => void) {
  const path = 'calendar_events';
  const ref = collection(db, path);

  const unsubscribe = onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const ev of initialCalendarEvents) {
            await setDoc(doc(db, path, ev.id), ev);
          }
        } catch (e) {
          console.error('Error seeding calendar events:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as CalendarEvent);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function addCalendarEventDoc(ev: CalendarEvent) {
  const path = `calendar_events/${ev.id}`;
  try {
    await setDoc(doc(db, 'calendar_events', ev.id), ev);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// 6. BANK TRANSACTIONS SYNC
// -------------------------------------------------------------
export function subscribeBankTransactions(onUpdate: (txs: BankTransaction[]) => void) {
  const path = 'bank_transactions';
  const ref = collection(db, path);

  const unsubscribe = onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const tx of initialBankTransactions) {
            await setDoc(doc(db, path, tx.id), tx);
          }
        } catch (e) {
          console.error('Error seeding bank transactions:', e);
        }
      } else {
        const items = snapshot.docs.map(doc => doc.data() as BankTransaction);
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

export async function addBankTransactionDoc(tx: BankTransaction) {
  const path = `bank_transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'bank_transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
