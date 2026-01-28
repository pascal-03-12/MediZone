<script setup lang="ts">
import { useNFC } from '../composables/useNFC';
import DailyOverview from '../components/DailyOverview.vue';
import { useMedicationStore } from '../stores/medication';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ManualIntakeDialog from '../components/ManualIntakeDialog.vue';

const { isSupported, isScanning, error, startScan } = useNFC();
const store = useMedicationStore();
const { lastScannedMedication } = storeToRefs(store);
const router = useRouter();

const showManualDialog = ref(false);

onMounted(() => {
  store.fetchLastScanned();
});

const openLastScanned = () => {
  if (lastScannedMedication.value) {
    router.push(`/medication/${lastScannedMedication.value.id}`);
  }
};
</script>

<template>
  <main class="p-8 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">MediZone Dashboard</h1>
    
    <div class="scan-section">
      <div v-if="lastScannedMedication" class="mb-8 cursor-pointer transform transition-transform" @click="openLastScanned">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm inline-block min-w-[300px]">
          <h2 class="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Letztes gescanntes Medikament</h2>
          <p class="text-xl font-bold text-gray-900">{{ lastScannedMedication.name }}</p>
          <p class="text-gray-600">{{ lastScannedMedication.substance }}</p>
        </div>
      </div>
      
      <div v-if="isSupported" class="active-scan">
        <button 
          @click="startScan" 
          :disabled="isScanning"
          class="bg-secondary text-white border-none px-8 py-4 text-xl rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ isScanning ? 'Scanne...' : 'Medikament scannen' }}
        </button>
        <p v-if="isScanning" class="mt-4 text-gray-600">Halte jetzt den Tag an die Rückseite.</p>
        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
      </div>

      <div v-else class="passive-scan">
        <div class="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 mt-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Scannen auf iOS</h3>
          <p class="text-gray-700">Halte dein iPhone einfach oben an die Medikamentenpackung.</p>
          <p class="text-sm text-gray-500 mt-2">(Kein Klick notwendig - funktioniert über Systembenachrichtigung)</p>
        </div>
      </div>

      <button 
        @click="showManualDialog = true"
        class="mt-6 text-primary underline text-sm font-medium hover:text-blue-700"
      >
        Ohne Scan eintragen
      </button>
    </div>

    <DailyOverview/>

    <ManualIntakeDialog 
      :is-open="showManualDialog" 
      @close="showManualDialog = false"
    />
  </main>
</template>