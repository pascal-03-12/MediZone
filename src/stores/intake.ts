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
                where('userId', '==', authStore.user.uid)
            );

            const querySnapshot = await getDocs(q);

            intakes.value = querySnapshot.docs.map(d => {
                return {
                    id: d.id,
                    ...(d.data() as Omit<IntakeEntry, 'id'>),
                } as IntakeEntry;
            });

            console.log('Einnahmen geladen:', intakes.value);
        } catch (error) {
            console.error('Fehler beim Laden der Einnahmen:', error);
        }
    };

    const addIntake = async (entry: IntakeEntry) => {
        intakes.value.push(entry);

        if (!authStore.user) return;

        try {
            await setDoc(doc(db, 'intakes', entry.id), {
                ...entry,
                userId: authStore.user.uid
            });
        } catch (error) {
            console.error('Fehler beim Speichern der Einnahme:', error);
        }
    };

    const getTodayIntakes = () => {
        const todayPrefix = new Date().toISOString().split('T')[0];
        return intakes.value.filter(intake => intake.date && intake.date.startsWith(todayPrefix));
    };

    const getTodayIntakesForMed = (medId: string) => {
        return getTodayIntakes().filter(i => i.medId === medId);
    };

    const getTodayDoseSumForMed = (medId: string) => {
        return getTodayIntakesForMed(medId).reduce((sum, i) => sum + (i.dose ?? 0), 0);
    };

    const getLastIntakeForMed = (medId: string) => {
        const list = getTodayIntakesForMed(medId);
        if (list.length === 0) return null;

        return [...list].sort((a, b) => {
            const ta = new Date(a.date).getTime();
            const tb = new Date(b.date).getTime();
            return tb - ta;
        })[0];
    };

    const checkIntakeRules = (params: {
        medId: string;
        doseToAdd: number;
        maxPerDay: number;
        minHoursBetween: number;
        nowIso?: string;
    }) => {
        const nowIso = params.nowIso ?? new Date().toISOString();
        const nowTs = new Date(nowIso).getTime();

        const sumToday = getTodayDoseSumForMed(params.medId);
        const wouldBe = sumToday + params.doseToAdd;
        const exceedsMax = params.maxPerDay > 0 && wouldBe > params.maxPerDay;

        const last = getLastIntakeForMed(params.medId);
        let tooSoon = false;
        let minutesLeft = 0;

        if (params.minHoursBetween > 0 && last?.date) {
            const lastTs = new Date(last.date).getTime();
            const minMs = params.minHoursBetween * 60 * 60 * 1000;
            const diff = nowTs - lastTs;

            if (diff < minMs) {
                tooSoon = true;
                minutesLeft = Math.ceil((minMs - diff) / (60 * 1000));
            }
        }

        return {
            sumToday,
            wouldBe,
            exceedsMax,
            tooSoon,
            minutesLeft
        };
    };

    const dailyCount = () => getTodayIntakes().length;

    return {
        intakes,
        addIntake,
        fetchIntakes,
        getTodayIntakes,
        getTodayIntakesForMed,
        getTodayDoseSumForMed,
        getLastIntakeForMed,
        checkIntakeRules,
        dailyCount
    };
});