import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthStore } from './auth';
import type { Medication } from '../types/types';
import {
  savePendingMedication,
  getPendingMedications,
  removePendingMedication,
  getPendingCount
} from '../utils/offlineDb';

export const useMedicationStore = defineStore('medication', () => {
  const currentMedication = ref<Medication | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastScannedMedication = ref<Medication | null>(null);
  const allMedications = ref<Medication[]>([]);

  // Offline-Status!!!
  const pendingCount = ref(0);
  const isSyncing = ref(false);

  const fetchMedicationById = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentMedication.value = null;

    try {
      const docRef = doc(db, 'medications', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        currentMedication.value = { id: docSnap.id, ...docSnap.data() } as Medication;
        return currentMedication.value;
      } else {
        error.value = 'Medikament nicht gefunden.';
        return null;
      }
    } catch (err: any) {
      console.error("Fehler beim Laden:", err);
      error.value = 'Fehler beim Laden der Daten: ' + err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const setLastScanned = async (medication: Medication) => {
    lastScannedMedication.value = medication;
    const authStore = useAuthStore();
    if (authStore.user?.uid) {
      try {
        const userRef = doc(db, 'users', authStore.user.uid);
        await setDoc(userRef, {
          lastScannedId: medication.id
        }, { merge: true });
      } catch (e) {
        console.error("Failed to save to Firestore", e);
      }
    }
  };

  const fetchLastScanned = async () => {
    const authStore = useAuthStore();
    if (!authStore.user?.uid) return;

    lastScannedMedication.value = null;

    try {
      const userRef = doc(db, 'users', authStore.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().lastScannedId) {
        const lastId = userSnap.data().lastScannedId;
        await fetchMedicationById(lastId);
        const medRef = doc(db, 'medications', lastId);
        const medSnap = await getDoc(medRef);
        if (medSnap.exists()) {
          lastScannedMedication.value = { id: medSnap.id, ...medSnap.data() } as Medication;
        }
      }
    } catch (e) {
      console.error("Failed to load last scanned from Firestore", e);
    }
  };

  const fetchAllMedications = async () => {
    const authStore = useAuthStore();
    loading.value = true;

    try {
      const medsRef = collection(db, 'medications');
      const allSnap = await getDocs(query(medsRef));

      const relevantMeds: Medication[] = [];
      const uid = authStore.user?.uid;

      allSnap.forEach(doc => {
        const data = doc.data() as any;

        if (!data.userId || (uid && data.userId === uid)) {
          relevantMeds.push({ id: doc.id, ...data } as Medication);
        }
      });

      allMedications.value = relevantMeds;

      await loadPendingMedications();
    } catch (e) {
      console.error("Fehler beim Laden aller Medikamente", e);
    } finally {
      loading.value = false;
    }
  };

  const loadPendingMedications = async () => {
    try {
      const pending = await getPendingMedications();
      pendingCount.value = pending.length;

      for (const p of pending) {
        const tempMed: Medication = {
          id: p.tempId,
          ...p.data
        } as Medication;

        if (!allMedications.value.some(m => m.id === p.tempId)) {
          allMedications.value.push(tempMed);
        }
      }
    } catch (e) {
      console.error("Fehler beim Laden ausstehender Medikamente", e);
    }
  };

  const addCustomMedication = async (medData: Omit<Medication, 'id'>) => {
    const authStore = useAuthStore();
    if (!authStore.user?.uid) throw new Error("Nicht eingeloggt");

    const newMed = {
      ...medData,
      userId: authStore.user.uid
    };

    if (navigator.onLine) {
      try {
        const docRef = await addDoc(collection(db, 'medications'), newMed);
        const savedMed = { id: docRef.id, ...newMed } as Medication;
        allMedications.value.push(savedMed);
        return savedMed;
      } catch (e) {
        console.error("Fehler beim Erstellen des Medikaments", e);
        throw e;
      }
    } else {
      try {
        const pending = await savePendingMedication(newMed);
        pendingCount.value++;

        const tempMed: Medication = {
          id: pending.tempId,
          ...newMed
        } as Medication;

        allMedications.value.push(tempMed);
        return tempMed;
      } catch (e) {
        console.error("Fehler beim Offline-Speichern", e);
        throw e;
      }
    }
  };

  // Synchronisiert ausstehende Medikamente mit Firebase
  const syncPendingMedications = async () => {
    if (!navigator.onLine || isSyncing.value) return;

    const authStore = useAuthStore();
    if (!authStore.user?.uid) return;

    isSyncing.value = true;

    try {
      const pending = await getPendingMedications();

      for (const p of pending) {
        try {
          const docRef = await addDoc(collection(db, 'medications'), p.data);

          await removePendingMedication(p.tempId);

          const idx = allMedications.value.findIndex(m => m.id === p.tempId);
          if (idx !== -1) {
            allMedications.value[idx] = { id: docRef.id, ...p.data } as Medication;
          }

          pendingCount.value--;
        } catch (e) {
          console.error(`Fehler beim Synchronisieren von ${p.tempId}:`, e);
        }
      }
    } catch (e) {
      console.error("Fehler beim Synchronisieren", e);
    } finally {
      isSyncing.value = false;
    }
  };

  const updatePendingCount = async () => {
    try {
      pendingCount.value = await getPendingCount();
    } catch (e) {
      console.error("Fehler beim Laden der ausstehenden Anzahl", e);
    }
  };

  return {
    currentMedication,
    lastScannedMedication,
    allMedications,
    loading,
    error,
    pendingCount,
    isSyncing,
    fetchMedicationById,
    setLastScanned,
    fetchLastScanned,
    fetchAllMedications,
    addCustomMedication,
    syncPendingMedications,
    updatePendingCount,
    loadPendingMedications
  };
});