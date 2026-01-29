<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMedicationStore } from '../stores/medication';
import { useIntakeStore } from '../stores/intake';
import { storeToRefs } from 'pinia';
import type { Medication } from '../types/types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);

const medicationStore = useMedicationStore();
const intakeStore = useIntakeStore();
const { allMedications, loading } = storeToRefs(medicationStore);

const activeTab = ref<'select' | 'create'>('select');
const selectedMedId = ref('');
const intakeDate = ref(new Date().toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm
const isSubmitting = ref(false);

// Neues Ref für "Mit Essen"
const withFood = ref(false);

// Form for new medication
const newMedName = ref('');
const newMedSubstance = ref('');
const newMedDose = ref<number | null>(null);
const newMedUnit = ref('mg');
const newMedForm = ref<any>('tablet');

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
    withFood.value = false; // Zurücksetzen
};

const saveIntake = async () => {
    if (activeTab.value === 'select' && !selectedMedId.value) return;
    if (activeTab.value === 'create' && (!newMedName.value || !newMedDose.value)) return;
    
    isSubmitting.value = true;
    
    try {
        let medToLog: Medication | undefined;
        
        if (activeTab.value === 'create') {
            // Erst Medikament erstellen
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

        // Einnahme loggen
        await intakeStore.addIntake({
            id: Date.now().toString(),
            medId: medToLog.id,
            medName: medToLog.name,
            date: intakeDate.value,
            dose: medToLog.standardDose,
            doseUnit: medToLog.doseUnit,
            withFood: withFood.value // Hier wird der Wert gespeichert
        });

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
      <div class="flex border-b">
        <button 
            @click="activeTab = 'select'"
            class="flex-1 py-3 font-medium text-sm transition-colors"
            :class="activeTab === 'select' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
        >
            Aus Liste wählen
        </button>
        <button 
            @click="activeTab = 'create'"
            class="flex-1 py-3 font-medium text-sm transition-colors"
            :class="activeTab === 'create' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
        >
            Neu anlegen
        </button>
      </div>

      <div class="p-6">
        <div v-if="activeTab === 'select'" class="space-y-4">
            <h3 class="font-bold text-lg">Medikament wählen</h3>
            <div v-if="loading" class="text-center py-4 text-gray-400">Lade...</div>
            <select v-else v-model="selectedMedId" class="w-full p-3 border rounded-lg bg-gray-50">
                <option value="" disabled>Bitte wählen...</option>
                <option v-for="med in sortedMedications" :key="med.id" :value="med.id">
                    {{ med.name }} ({{ med.standardDose }}{{ med.doseUnit }})
                </option>
            </select>
        </div>

        <div v-else class="space-y-4">
            <h3 class="font-bold text-lg">Neues Medikament anlegen</h3>
            <div class="grid gap-3">
                <input v-model="newMedName" placeholder="Name (z.B. Kopfschmerztablette)" class="w-full p-3 border rounded-lg">
                <input v-model="newMedSubstance" placeholder="Wirkstoff (optional)" class="w-full p-3 border rounded-lg">
                <div class="flex gap-2">
                    <input type="number" v-model="newMedDose" placeholder="Dosis" class="flex-1 p-3 border rounded-lg">
                    <select v-model="newMedUnit" class="w-24 p-3 border rounded-lg bg-white">
                        <option>mg</option>
                        <option>ml</option>
                        <option>g</option>
                        <option>Stk</option>
                    </select>
                </div>
                <select v-model="newMedForm" class="w-full p-3 border rounded-lg bg-white">
                    <option value="tablet">Tablette</option>
                    <option value="capsule">Kapsel</option>
                    <option value="drops">Tropfen</option>
                    <option value="spray">Spray</option>
                     <option value="other">Andere</option>
                </select>
            </div>
            <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Dieses Medikament wird nur für DICH sichtbar gespeichert.
            </p>
        </div>

        <div class="mt-6 space-y-2">
             <label class="text-sm font-medium text-gray-700 block">Zeitpunkt der Einnahme</label>
             <input type="datetime-local" v-model="intakeDate" class="w-full p-3 border rounded-lg text-gray-600">
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
                :disabled="isSubmitting || (activeTab === 'select' && !selectedMedId) || (activeTab === 'create' && !newMedName)"
                class="flex-1 py-3 text-white bg-primary rounded-lg font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {{ isSubmitting ? 'Speichere...' : 'Speichern' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>