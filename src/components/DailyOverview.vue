<script setup lang="ts">
import { computed, onMounted } from 'vue'; 
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
const deleteIntake = async (id: string) => {
  if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
    await intakeStore.deleteIntake(id);
  }
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
             {{ intake.medName || intake.medId }}
        </span>
        <div class="flex items-center gap-2">
            <span class="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {{ intake.dose }} {{ intake.doseUnit }}
            </span>
            <span class="text-gray-500 text-sm">
              {{ formatTime(intake.date) }}
            </span>
             <button @click="deleteIntake(intake.id)" class="text-red-500 hover:text-red-700 ml-2" title="Löschen">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
      </li>
    </ul>
    <div v-else class="text-center text-gray-400 py-4">
      Noch keine Einnahmen heute.
    </div>
  </div>
</template>