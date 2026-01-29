<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CalendarOverview from '../components/CalendarOverview.vue';import { useIntakeStore } from '../stores/intake';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();
const intakeStore = useIntakeStore();
const { intakes } = storeToRefs(intakeStore);
const selectedDate = ref(new Date());

onMounted(() => {
  intakeStore.fetchIntakes();
});

// Robuste Datumsprüfung für die Liste
const selectedDateIntakes = computed(() => {
  return intakes.value.filter(intake => {
    if (!intake.date) return false;
    const d1 = new Date(intake.date);
    const d2 = selectedDate.value;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const formatDate = (date: Date) => {
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
};
</script>

<template>
  <main class="p-6 pb-24 max-w-2xl mx-auto">
    <div class="flex items-center mb-6">
      <button @click="router.back()" class="mr-4 text-gray-600 hover:text-gray-900">
        &larr; Zurück
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Historie</h1>
    </div>
    
    <CalendarOverview v-model="selectedDate" />

    <div class="mt-8">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ formatDate(selectedDate) }}</h2>
      
      <div v-if="selectedDateIntakes.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        Keine Einnahmen.
      </div>

      <div v-else class="space-y-3">
        <div v-for="entry in selectedDateIntakes" :key="entry.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <div class="font-bold text-gray-800">{{ entry.medName }}</div>
            <div class="text-xs text-gray-500">
              {{ new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} Uhr
            </div>
          </div>
          <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {{ entry.dose }} {{ entry.doseUnit }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>