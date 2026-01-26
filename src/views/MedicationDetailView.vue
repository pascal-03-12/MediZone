<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMedicationStore } from '../stores/medication';

const route = useRoute();
const router = useRouter();
const medStore = useMedicationStore();

const medId = route.params.id as string;

onMounted(() => {
  if (medId) {
    medStore.fetchMedicationById(medId);
  }
});
</script>

<template>
  <main class="detail-container">
    
    <div v-if="medStore.loading" class="loading">
      <p>Lade Medikamenten-Daten...</p>
    </div>

    <div v-else-if="medStore.error" class="error-card">
      <h2>Hoppla!</h2>
      <p>{{ medStore.error }}</p>
      <button @click="router.push('/')">Zurück zum Dashboard</button>
    </div>

    <div v-else-if="medStore.currentMedication" class="med-card">
      <header>
        <h1>{{ medStore.currentMedication.name }}</h1>
        <span class="badge">{{ medStore.currentMedication.dosageForm }}</span>
      </header>

      <section class="info-grid">
        <div class="info-item">
          <label>Wirkstoff</label>
          <p>{{ medStore.currentMedication.substance }}</p>
        </div>
        <div class="info-item">
          <label>Dosierung</label>
          <p>{{ medStore.currentMedication.standardDose }} {{ medStore.currentMedication.doseUnit }}</p>
        </div>
        <div class="info-item full-width">
          <label>Anweisung</label>
          <p>{{ medStore.currentMedication.instructions }}</p>
        </div>
      </section>

      <div class="actions">
        <button class="btn-primary">Einnahme loggen</button>
        <button class="btn-secondary" @click="router.push('/')">Zurück</button>
      </div>
    </div>

  </main>
</template>

<style scoped>
.detail-container { padding: 1.5rem; max-width: 600px; margin: 0 auto; }
.med-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { margin: 0; color: #2c3e50; }
.badge { background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 0.9rem; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.info-item label { display: block; font-size: 0.85rem; color: #7f8c8d; margin-bottom: 4px; }
.info-item p { margin: 0; font-weight: 500; font-size: 1.1rem; }
.full-width { grid-column: 1 / -1; }

.actions { display: flex; gap: 1rem; }
button { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-primary { background: #4CAF50; color: white; }
.btn-secondary { background: #f5f5f5; color: #333; }

.error-card { text-align: center; color: #e74c3c; }
.loading { text-align: center; padding: 2rem; color: #666; }
</style>