import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IntakeEntry } from '../types/types';

export const useIntakeStore = defineStore('intake', () => {
    const intakes = ref<IntakeEntry[]>([]);

    const addIntake = (entry: IntakeEntry) => {
        intakes.value.push(entry);
        console.log("Intake added:", entry);
        // Here we would typically persist to storage (Person D's task)
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
