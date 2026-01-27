import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthStore } from './auth';
import type { IntakeEntry } from '../types/types';

export const useIntakeStore = defineStore('intake', () => {
    const intakes = ref<IntakeEntry[]>([]);
    const authStore = useAuthStore();

    const addIntake = async (entry: IntakeEntry) => {
        intakes.value.push(entry);
        console.log("Intake added locally:", entry);

        if (!authStore.user) {
            console.warn("Benutzer nicht eingeloggt. Speicherung in Datenbank übersprungen.");
            return;
        }

        try {
            await setDoc(doc(db, 'intakes', entry.id), {
                ...entry,
                userId: authStore.user.uid
            });
            console.log("Einnahme erfolgreich in Firestore gespeichert!");
        } catch (error) {
            console.error("Fehler beim Speichern der Einnahme:", error);
        }
    };

    const getTodayIntakes = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return intakes.value.filter(intake => intake.timestamp >= today.getTime());
    };

    const dailyCount = () => getTodayIntakes().length;

    return {
        intakes,
        addIntake,
        getTodayIntakes,
        dailyCount
    };
});