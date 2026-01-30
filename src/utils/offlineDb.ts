import type { Medication } from '../types/types';

const DB_NAME = 'MediZoneDB';
const DB_VERSION = 1;
const PENDING_STORE = 'pendingMedications';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Store für ausstehende (offline erstellte) Medikamente
            if (!db.objectStoreNames.contains(PENDING_STORE)) {
                db.createObjectStore(PENDING_STORE, { keyPath: 'tempId' });
            }
        };
    });

    return dbPromise;
}

export interface PendingMedication {
    tempId: string;
    data: Omit<Medication, 'id'>;
    createdAt: string;
}

// Offline erstelltes Medikament speichern
export async function savePendingMedication(data: Omit<Medication, 'id'>): Promise<PendingMedication> {
    const db = await openDB();

    const pending: PendingMedication = {
        tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data,
        createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PENDING_STORE, 'readwrite');
        const store = transaction.objectStore(PENDING_STORE);
        const request = store.add(pending);

        request.onsuccess = () => resolve(pending);
        request.onerror = () => reject(request.error);
    });
}

// Alle ausstehenden Medikamente laden
export async function getPendingMedications(): Promise<PendingMedication[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PENDING_STORE, 'readonly');
        const store = transaction.objectStore(PENDING_STORE);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Austehendes Medikament nach Sync löschen
export async function removePendingMedication(tempId: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PENDING_STORE, 'readwrite');
        const store = transaction.objectStore(PENDING_STORE);
        const request = store.delete(tempId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Anzahl ausstehender Medikamente
export async function getPendingCount(): Promise<number> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PENDING_STORE, 'readonly');
        const store = transaction.objectStore(PENDING_STORE);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
