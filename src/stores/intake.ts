import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebaseConfig';
import { useAuthStore } from './auth';
import type { IntakeEntry } from '../types/types';

export const useIntakeStore = defineStore('intake', () => {
    const intakes = ref<IntakeEntry[]>([]);
    const authStore = useAuthStore();

    const fetchIntakes = async () => {
        if (!authStore.user) return;

        try {
            const q = query(
                collection(db, 'intakes'),
                where("userId", "==", authStore.user.uid)
            );

            const querySnapshot = await getDocs(q);
            
            intakes.value = querySnapshot.docs.map(doc => {
                return doc.data() as IntakeEntry;
            });
            
            console.log("Einnahmen geladen:", intakes.value);
        } catch (error) {
            console.error("Fehler beim Laden der Einnahmen:", error);
        }
    };

    const addIntake = async (entry: IntakeEntry) => {
        intakes.value.push(entry);
        // ...
        if (!authStore.user) return;

        try {
            await setDoc(doc(db, 'intakes', entry.id), {
                ...entry,
                userId: authStore.user.uid
            });
        } catch (error) {
        }
    };

    const getTodayIntakes = () => {
        const todayPrefix = new Date().toISOString().split('T')[0];
        return intakes.value.filter(intake => intake.date && intake.date.startsWith(todayPrefix));
    };

    const dailyCount = () => getTodayIntakes().length;

    return {
        intakes,
        addIntake,
        fetchIntakes, 
        getTodayIntakes,
        dailyCount
    };
});