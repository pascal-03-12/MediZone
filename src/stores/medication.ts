import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthStore } from './auth';
import type { Medication } from '../types/types';

export const useMedicationStore = defineStore('medication', () => {
  const currentMedication = ref<Medication | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastScannedMedication = ref<Medication | null>(null);
  const allMedications = ref<Medication[]>([]);

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
        // Zeige Medikament wenn: Es keine userId hat (Global) ODER userId == eigener UID
        if (!data.userId || (uid && data.userId === uid)) {
          relevantMeds.push({ id: doc.id, ...data } as Medication);
        }
      });

      allMedications.value = relevantMeds;
    } catch (e) {
      console.error("Fehler beim Laden aller Medikamente", e);
    } finally {
      loading.value = false;
    }
  };

  const addCustomMedication = async (medData: Omit<Medication, 'id'>) => {
    const authStore = useAuthStore();
    if (!authStore.user?.uid) throw new Error("Nicht eingeloggt");

    try {
      const newMed = {
        ...medData,
        userId: authStore.user.uid
      };

      const docRef = await addDoc(collection(db, 'medications'), newMed);
      const savedMed = { id: docRef.id, ...newMed } as Medication;

      allMedications.value.push(savedMed);
      return savedMed;
    } catch (e) {
      console.error("Fehler beim Erstellen des Medikaments", e);
      throw e;
    }
  };

  return {
    currentMedication,
    lastScannedMedication,
    allMedications,
    loading,
    error,
    fetchMedicationById,
    setLastScanned,
    fetchLastScanned,
    fetchAllMedications,
    addCustomMedication
  };
});