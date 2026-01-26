<script setup lang="ts">
import { useNFC } from '../composables/useNFC';

const { isSupported, isScanning, error, startScan } = useNFC();
</script>

<template>
  <main class="home-container">
    <h1>MediZone Dashboard</h1>
    
    <div class="scan-section">
      <div v-if="isSupported" class="active-scan">
        <button @click="startScan" :disabled="isScanning" class="scan-btn">
          {{ isScanning ? 'Scanne...' : 'Medikament scannen' }}
        </button>
        <p v-if="isScanning" class="hint">Halte jetzt den Tag an die Rückseite.</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <div v-else class="passive-scan">
        <div class="ios-instruction">
          <h3>Scannen auf iOS</h3>
          <p>Halte dein iPhone einfach oben an die Medikamentenpackung.</p>
          <p class="sub-hint">(Kein Klick notwendig - funktioniert über Systembenachrichtigung)</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-container { padding: 2rem; text-align: center; }
.scan-btn { 
  background-color: #3498db; color: white; border: none; 
  padding: 1rem 2rem; font-size: 1.2rem; border-radius: 50px; 
  cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.scan-btn:disabled { background-color: #95a5a6; }
.error { color: red; margin-top: 1rem; }
.ios-instruction { 
  background: #f8f9fa; padding: 2rem; border-radius: 12px; 
  border: 1px dashed #ccc; margin-top: 2rem;
}
.sub-hint { font-size: 0.8rem; color: #666; }
</style>