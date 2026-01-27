import { defineStore } from 'pinia';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import type { Medication } from '../types/types';

export const useMedicationStore = defineStore('medication', () => {
  
  /**
   * Holt ein Medikament anhand seiner ID aus Firestore.
   * Diese Funktion dient als Schnittstelle für den NFC-Scanner.
   * * @param id - Die ID, die vom NFC-Tag gescannt wurde (entspricht der Dokument-ID in Firestore)
   * @returns Das Medikamenten-Objekt oder null, wenn nicht gefunden
   */
  const fetchMedicationById = async (id: string): Promise<Medication | null> => {
    if (!id) return null;

    try {
      const docRef = doc(db, "medications", id);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { 
          id: docSnap.id, 
          ...docSnap.data() 
        } as Medication;
      } else {
        console.warn(`Medikament mit ID ${id} nicht in der Datenbank gefunden.`);
        return null;
      }
    } catch (error) {
      console.error("Fehler beim Abrufen des Medikaments:", error);
      return null;
    }
  };

  return { 
    fetchMedicationById 
  };
});