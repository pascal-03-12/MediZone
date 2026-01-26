import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Medication } from '../types/types';

export const useMedicationStore = defineStore('medication', () => {
  const currentMedication = ref<Medication | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMedicationById = async (id: string) => {
    loading.value = true;
    error.value = null;
    currentMedication.value = null;

    try {
      const docRef = doc(db, 'medications', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        currentMedication.value = { id: docSnap.id, ...docSnap.data() } as Medication;
      } else {
        error.value = 'Medikament nicht gefunden.';
      }
    } catch (err: any) {
      console.error("Fehler beim Laden:", err);
      error.value = 'Fehler beim Laden der Daten: ' + err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    currentMedication,
    loading,
    error,
    fetchMedicationById
  };
});