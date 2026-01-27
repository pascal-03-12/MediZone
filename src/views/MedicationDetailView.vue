<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMedicationStore } from '../stores/medication';
import { useIntakeStore } from '../stores/intake';
import type { IntakeEntry } from '../types/types';

const route = useRoute();
const router = useRouter();
const medStore = useMedicationStore();
const intakeStore = useIntakeStore();

const logIntake = () => {
  if (!medStore.currentMedication) return;

  const entry: IntakeEntry = {
    id: crypto.randomUUID(),
    medId: medStore.currentMedication.id,
    date: new Date().toISOString(), // Geändert zu Datummm
    dose: medStore.currentMedication.standardDose,
    doseUnit: medStore.currentMedication.doseUnit,
  };

  intakeStore.addIntake(entry);
  alert(`Einnahme von ${medStore.currentMedication.name} protokolliert!`);
};

const medId = route.params.id as string;

onMounted(async () => {
  if (medId) {
    const med = await medStore.fetchMedicationById(medId);
    if (med) {
      medStore.setLastScanned(med);
    }
  }
});
</script>

<template>
  <main class="p-6 max-w-xl mx-auto">
    
    <div v-if="medStore.loading" class="text-center p-8 text-gray-600">
      <p>Lade Medikamenten-Daten...</p>
    </div>

    <div v-else-if="medStore.error" class="text-center text-red-500">
      <h2 class="text-2xl font-bold mb-4">Hoppla!</h2>
      <p class="mb-4">{{ medStore.error }}</p>
      <button 
        @click="router.push('/')"
        class="px-6 py-3 bg-gray-100 text-gray-800 border-none rounded-lg font-bold cursor-pointer hover:bg-gray-200 transition-colors"
      >
        Zurück zum Dashboard
      </button>
    </div>

    <div v-else-if="medStore.currentMedication" class="bg-white rounded-xl p-8 shadow-lg">
      <header class="flex justify-between items-center mb-8">
        <h1 class="m-0 text-2xl font-bold text-gray-800">{{ medStore.currentMedication.name }}</h1>
        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {{ medStore.currentMedication.dosageForm }}
        </span>
      </header>

      <section class="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label class="block text-sm text-gray-500 mb-1">Wirkstoff</label>
          <p class="m-0 font-medium text-lg">{{ medStore.currentMedication.substance }}</p>
        </div>
        <div>
          <label class="block text-sm text-gray-500 mb-1">Dosierung</label>
          <p class="m-0 font-medium text-lg">{{ medStore.currentMedication.standardDose }} {{ medStore.currentMedication.doseUnit }}</p>
        </div>
        <div class="col-span-2">
          <label class="block text-sm text-gray-500 mb-1">Anweisung</label>
          <p class="m-0 font-medium text-lg">{{ medStore.currentMedication.instructions }}</p>
        </div>
      </section>

      <div class="flex gap-4">
        <button 
          @click="logIntake"
          class="flex-1 py-3 bg-primary text-white border-none rounded-lg font-bold cursor-pointer hover:bg-primary-hover transition-colors"
        >
          Einnahme loggen
        </button>
        <button 
          @click="router.push('/')"
          class="flex-1 py-3 bg-gray-100 text-gray-800 border-none rounded-lg font-bold cursor-pointer hover:bg-gray-200 transition-colors"
        >
          Zurück
        </button>
      </div>
    </div>

  </main>
</template>