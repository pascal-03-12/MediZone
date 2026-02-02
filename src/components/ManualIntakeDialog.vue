<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useMedicationStore } from '../stores/medication';
import { useIntakeStore } from '../stores/intake';
import { useNFC } from '../composables/useNFC';
import { useOnlineStatus } from '../composables/useOnlineStatus';
import { storeToRefs } from 'pinia';
import type { Medication } from '../types/types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const medicationStore = useMedicationStore();
const intakeStore = useIntakeStore();
const { allMedications, loading } = storeToRefs(medicationStore);

const { writeTag, isSupported: nfcSupported } = useNFC();

const { isOnline } = useOnlineStatus();

const activeTab = ref<'select' | 'create'>('select');
const selectedMedId = ref('');
const intakeDate = ref(new Date().toISOString().slice(0, 16));
const isSubmitting = ref(false);

const withFood = ref(false);

const createNfcTag = ref(false);

const newMedName = ref('');
const newMedSubstance = ref('');
const newMedDose = ref<number | null>(null);
const newMedUnit = ref('mg');
const newMedForm = ref<any>('tablet');

const touchedFields = ref({
  name: false,
  dose: false,
  select: false
});

const isNameValid = computed(() => newMedName.value.trim().length > 0);
const isDoseValid = computed(() => {
  const dose = newMedDose.value;
  if (dose === null || dose === undefined) return false;
  const numDose = Number(dose);
  return !isNaN(numDose) && numDose > 0;
});
const isSelectValid = computed(() => !!selectedMedId.value);

const showNameError = computed(() => touchedFields.value.name && !isNameValid.value);
const showDoseError = computed(() => touchedFields.value.dose && !isDoseValid.value);
const showSelectError = computed(() => touchedFields.value.select && !isSelectValid.value);

const isFormValid = computed(() => {
  if (activeTab.value === 'select') {
    return isSelectValid.value;
  }
  return isNameValid.value && isDoseValid.value;
});

watch(activeTab, () => {
  touchedFields.value = { name: false, dose: false, select: false };
});

onMounted(() => {
  medicationStore.fetchAllMedications();
});

const sortedMedications = computed(() => {
    return [...allMedications.value].sort((a, b) => a.name.localeCompare(b.name));
});

const close = () => {
    emit('close');
    resetForm();
};

const resetForm = () => {
    selectedMedId.value = '';
    newMedName.value = '';
    newMedSubstance.value = '';
    newMedDose.value = null;
    activeTab.value = 'select';
    withFood.value = false;
    createNfcTag.value = false;
    touchedFields.value = { name: false, dose: false, select: false };
};

const saveIntake = async () => {
    if (activeTab.value === 'create') {
      touchedFields.value = { name: true, dose: true, select: false };
    } else {
      touchedFields.value = { name: false, dose: false, select: true };
    }
    
    if (!isFormValid.value) return;
    
    isSubmitting.value = true;
    const wasOffline = !isOnline.value;
    
    try {
        let medToLog: Medication | undefined;
        
        if (activeTab.value === 'create') {
            medToLog = await medicationStore.addCustomMedication({
                name: newMedName.value,
                substance: newMedSubstance.value,
                dosageForm: newMedForm.value,
                standardDose: newMedDose.value!,
                doseUnit: newMedUnit.value,
                instructions: 'Benutzerdefiniert',
                maxPerDay: 0,
                minHoursBetween: 0
            });
        } else {
            medToLog = allMedications.value.find(m => m.id === selectedMedId.value);
        }

        if (!medToLog) throw new Error("Medikament nicht gefunden");

        intakeStore.addIntake({
            id: Date.now().toString(),
            medId: medToLog.id,
            medName: medToLog.name,
            date: intakeDate.value,
            dose: medToLog.standardDose,
            doseUnit: medToLog.doseUnit,
            withFood: withFood.value
        });

        await medicationStore.setLastScanned(medToLog);

        if (activeTab.value === 'create' && createNfcTag.value && nfcSupported && isOnline.value) {
            await writeTag(`/medication/${medToLog.id}`);
        }

        if (wasOffline && activeTab.value === 'create') {
            alert('Medikament lokal gespeichert! Es wird synchronisiert, sobald du wieder online bist.');
        }

        close();
    } catch (e) {
        console.error(e);
        alert("Fehler beim Speichern");
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      <div class="flex border-b p-1 gap-1">
        <button 
            @click="activeTab = 'select'"
            class="flex-1 py-2 font-medium text-sm transition-all rounded-lg border"
            :class="activeTab === 'select' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'"
        >
            Aus Liste wählen
        </button>
        <button 
            @click="activeTab = 'create'"
            class="flex-1 py-2 font-medium text-sm transition-all rounded-lg border"
            :class="activeTab === 'create' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'"
        >
            Neu anlegen
        </button>
      </div>

      <div class="p-6">
        <div v-if="activeTab === 'select'" class="space-y-4">
            <h3 class="font-bold text-lg">Medikament wählen</h3>
            <div v-if="loading" class="text-center py-4 text-gray-400">Lade...</div>
            <div v-else>
                <select 
                    v-model="selectedMedId" 
                    class="w-full p-3 border rounded-lg transition-colors"
                    :class="showSelectError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'"
                >
                    <option value="" disabled>Bitte wählen... *</option>
                    <option v-for="med in sortedMedications" :key="med.id" :value="med.id">
                        {{ med.name }} ({{ med.standardDose }}{{ med.doseUnit }})
                    </option>
                </select>
                <p v-if="showSelectError" class="text-red-500 text-xs mt-1">
                    Bitte wähle ein Medikament aus.
                </p>
            </div>
        </div>

        <div v-else class="space-y-4 overflow-hidden">
            <h3 class="font-bold text-lg">Neues Medikament anlegen</h3>
            <div class="flex flex-col gap-3">
                <div>
                    <input 
                        v-model="newMedName" 
                        placeholder="Name (z.B. Kopfschmerztablette) *"
                        @blur="touchedFields.name = true"
                        class="w-full p-3 border rounded-lg transition-colors box-border"
                        :class="showNameError ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                    >
                    <p v-if="showNameError" class="text-red-500 text-xs mt-1">
                        Bitte gib einen Namen ein.
                    </p>
                </div>
                <input v-model="newMedSubstance" placeholder="Wirkstoff (optional)" class="w-full p-3 border border-gray-300 rounded-lg box-border">
                <div>
                    <div class="flex gap-2">
                        <input 
                            type="number" 
                            v-model="newMedDose" 
                            placeholder="Dosis *"
                            @blur="touchedFields.dose = true"
                            class="flex-1 min-w-0 p-3 border rounded-lg transition-colors box-border"
                            :class="showDoseError ? 'border-red-500 bg-red-50' : 'border-gray-300'"
                        >
                        <select v-model="newMedUnit" class="w-20 p-3 border border-gray-300 rounded-lg bg-white box-border flex-shrink-0">
                            <option>mg</option>
                            <option>ml</option>
                            <option>g</option>
                            <option>Stk</option>
                        </select>
                    </div>
                    <p v-if="showDoseError" class="text-red-500 text-xs mt-1">
                        Bitte gib eine gültige Dosis ein.
                    </p>
                </div>
                <select v-model="newMedForm" class="w-full p-3 border border-gray-300 rounded-lg bg-white box-border">
                    <option value="tablet">Tablette</option>
                    <option value="capsule">Kapsel</option>
                    <option value="drops">Tropfen</option>
                    <option value="spray">Spray</option>
                    <option value="other">Andere</option>
                </select>
            </div>
            
            <div v-if="nfcSupported" class="bg-gray-100 p-3 rounded-lg border border-gray-200 mt-2">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        v-model="createNfcTag" 
                        class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                    />
                    <div class="flex flex-col">
                        <span class="text-gray-800 font-medium text-sm">
                            Direkt auf NFC-Tag speichern
                        </span>
                        <span class="text-xs text-gray-500">
                            Halte nach dem Speichern den Tag bereit.
                        </span>
                    </div>
                </label>
            </div>

            <!-- Offline-Indikator -->
            <div v-if="!isOnline" class="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 010-7.07m-2.828 2.828a1 1 0 010 1.414" />
                    </svg>
                    <span class="text-amber-800 font-medium text-sm">Offline-Modus</span>
                </div>
                <p class="text-xs text-amber-700 mt-1">
                    Das Medikament wird lokal gespeichert und bei Internetverbindung automatisch synchronisiert.
                </p>
            </div>

            <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Dieses Medikament wird nur für DICH sichtbar gespeichert.
            </p>
        </div>

        <div class="mt-6 space-y-2">
             <label class="text-sm font-medium text-gray-700 block">Zeitpunkt der Einnahme</label>
             <input 
                 type="datetime-local" 
                 v-model="intakeDate" 
                 class="w-full p-3 border rounded-lg text-gray-600 bg-gray-100 shadow-sm appearance-none"
             />
        </div>

        <div class="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <label class="flex items-center gap-3 cursor-pointer">
                <input 
                    type="checkbox" 
                    v-model="withFood" 
                    class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                />
                <span class="text-gray-800 font-medium">
                    Einnahme mit Essen
                </span>
            </label>
        </div>

        <div class="flex gap-3 mt-8">
            <button @click="close" class="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200">
                Abbrechen
            </button>
            <button 
                @click="saveIntake" 
                :disabled="isSubmitting || !isFormValid"
                class="flex-1 py-3 text-white rounded-lg font-bold shadow-lg transition-colors"
                :class="isFormValid && !isSubmitting ? 'bg-primary hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'"
            >
                <span v-if="isSubmitting">
                    {{ (activeTab === 'create' && createNfcTag) ? 'Warte auf NFC...' : 'Speichere...' }}
                </span>
                <span v-else>
                    {{ (activeTab === 'create' && createNfcTag) ? 'Speichern & Scannen' : 'Speichern' }}
                </span>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1.25em;
  padding-right: 2rem;
}
</style>