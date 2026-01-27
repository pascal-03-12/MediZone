<script setup lang="ts">
import { computed, onMounted } from 'vue'; // onMounted importieren
import { useIntakeStore } from '../stores/intake';

const intakeStore = useIntakeStore();

// Daten laden, sobald die Komponente angezeigt wird
onMounted(() => {
  intakeStore.fetchIntakes();
});

const todayIntakes = computed(() => intakeStore.getTodayIntakes());
const count = computed(() => intakeStore.dailyCount());

// Zeitformatierung anpassen
const formatTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="daily-overview p-4 bg-white rounded shadow-md mt-4">
    <h2 class="text-xl font-bold mb-2">Heute</h2>
    <div class="text-gray-600 mb-4">
      {{ count }} Einnahmen
    </div>

    <ul v-if="todayIntakes.length > 0" class="space-y-2">
      <li v-for="intake in todayIntakes" :key="intake.id" class="flex justify-between items-center bg-gray-50 p-2 rounded">
        <span class="font-medium">
             {{ intake.medId }}
        </span>
        <div class="flex items-center gap-2">
            <span class="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {{ intake.dose }} {{ intake.doseUnit }}
            </span>
            <span class="text-gray-500 text-sm">
              {{ formatTime(intake.date) }}
            </span>
        </div>
      </li>
    </ul>
    <div v-else class="text-center text-gray-400 py-4">
      Noch keine Einnahmen heute.
    </div>
  </div>
</template>