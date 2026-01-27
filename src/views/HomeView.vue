<script setup lang="ts">
import { useNFC } from '../composables/useNFC';
import DailyOverview from '../components/DailyOverview.vue';

const { isSupported, isScanning, error, startScan } = useNFC();
</script>

<template>
  <main class="p-8 text-center">
    <h1 class="text-3xl font-bold text-gray-800 mb-8">MediZone Dashboard</h1>
    
    <div class="scan-section">
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
    </div>

    <DailyOverview/>
  </main>
</template>