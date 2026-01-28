import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

    const currentStreak = computed(() => {
        if (intakes.value.length === 0) return 0;

        const uniqueDates = new Set(
            intakes.value.map(entry => entry.date.split('T')[0])
        );

        const sortedDates = Array.from(uniqueDates).sort().reverse();

        if (sortedDates.length === 0) return 0;

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let streak = 0;
        let checkIndex = 0;
        if (sortedDates[0] === todayStr) {
            checkIndex = 0;
        } else if (sortedDates[0] === yesterdayStr) {
            checkIndex = 0;
        } else {
            return 0;
        }

        let currentDateToCheck = new Date();
        if (sortedDates[0] === yesterdayStr) {
            currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
        }

        for (let i = 0; i < sortedDates.length; i++) {
            const expectedDate = currentDateToCheck.toISOString().split('T')[0];

            if (sortedDates[i] === expectedDate) {
                streak++;
                currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    });

    return {
        intakes,
        addIntake,
        fetchIntakes,
        getTodayIntakes,
        dailyCount,
        currentStreak
    };
});