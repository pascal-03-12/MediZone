<script setup lang="ts">
import { useNFC } from '../composables/useNFC';
// DailyOverview Import ENTFERNT
import { useMedicationStore } from '../stores/medication';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import ManualIntakeDialog from '../components/ManualIntakeDialog.vue';

const { isSupported, isScanning, error, startScan } = useNFC();
const store = useMedicationStore();
const { lastScannedMedication } = storeToRefs(store);
const router = useRouter();

const showManualDialog = ref(false);

// iOS Detection - zeige passiven Scan Hinweis nur auf iOS
const isIOS = computed(() => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
});

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
  <main class="p-8 text-center pb-24">
    <h1 class="text-3xl font-bold text-textMain mb-8">MediZone</h1>

    <div class="scan-section">
      <div
          v-if="lastScannedMedication"
          class="mb-8 cursor-pointer transform transition-transform"
          @click="openLastScanned"
      >
        <div
            class="bg-primarySoft border border-primary/20 rounded-2xl p-4 shadow-soft inline-block min-w-[300px]
                 hover:shadow-lg hover:scale-[1.02] transition"
        >
          <h2 class="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            Zuletzt aktiv
          </h2>
          <p class="text-xl font-bold text-textMain">
            {{ lastScannedMedication.name }}
          </p>
        </div>
      </div>

      <div v-if="isSupported" class="active-scan">
        <button
            @click="startScan"
            :disabled="isScanning"
            class="bg-primary text-white border-none px-8 py-4 text-xl rounded-2xl cursor-pointer shadow-lg
                 hover:bg-primaryHover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ isScanning ? 'Scanne...' : 'Scan starten' }}
        </button>
        <p v-if="error" class="text-danger mt-4">{{ error }}</p>
      </div>

      <div v-else-if="isIOS" class="passive-scan">
        <div class="bg-white p-8 rounded-2xl border border-dashed border-borderSoft mt-8 shadow-soft">
          <h3 class="text-xl font-semibold text-textMain mb-2">Bereit zum Scannen</h3>
          <p class="text-textMuted">Halte dein iPhone an den Tag.</p>
        </div>
      </div>

      <div v-else class="desktop-info">
        <div class="bg-surface p-8 rounded-2xl border border-borderSoft mt-8 shadow-soft">
          <h3 class="text-xl font-semibold text-textMain mb-2">NFC nicht verfügbar</h3>
          <p class="text-textMuted">NFC-Scan ist nur auf mobilen Geräten möglich.</p>
        </div>
      </div>

      <button
          @click="showManualDialog = true"
          class="mt-8 px-6 py-3 bg-white border border-borderSoft rounded-2xl text-primary font-bold shadow-soft
               hover:bg-surface transition-colors"
      >
        Manuell eintragen
      </button>
    </div>

    <ManualIntakeDialog
        :is-open="showManualDialog"
        @close="showManualDialog = false"
    />
  </main>
</template>