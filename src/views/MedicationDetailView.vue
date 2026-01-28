<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMedicationStore } from '../stores/medication';
import { useIntakeStore } from '../stores/intake';
import { useReminderStore } from '../stores/reminder';
import type { IntakeEntry } from '../types/types';

const route = useRoute();
const router = useRouter();
const medStore = useMedicationStore();
const intakeStore = useIntakeStore();
const reminderStore = useReminderStore();
const withFood = ref(false);
const medId = route.params.id as string;
const newReminderTime = ref('');

const logIntake = async () => {
  if (!medStore.currentMedication) return;

  const nowIso = new Date().toISOString();

  const rules = intakeStore.checkIntakeRules({
    medId: medStore.currentMedication.id,
    doseToAdd: medStore.currentMedication.standardDose,
    maxPerDay: medStore.currentMedication.maxPerDay,
    minHoursBetween: medStore.currentMedication.minHoursBetween,
    nowIso,
  });

  // Mindestabstand: hart blocken
  if (rules.tooSoon) {
    alert(
        `Zu früh: Bitte warte noch ca. ${rules.minutesLeft} Minuten, bevor du dieses Medikament wieder nimmst.`
    );
    return;
  }

  // Tageslimit: warnen + optional trotzdem loggen
  if (rules.exceedsMax) {
    const ok = confirm(
        `Warnung: Tageslimit überschritten!\n` +
        `Heute bereits: ${rules.sumToday} ${medStore.currentMedication.doseUnit}\n` +
        `Mit dieser Einnahme: ${rules.wouldBe} ${medStore.currentMedication.doseUnit}\n` +
        `Max/Tag: ${medStore.currentMedication.maxPerDay} ${medStore.currentMedication.doseUnit}\n\n` +
        `Trotzdem protokollieren?`
    );
    if (!ok) return;
  }

  const entry: IntakeEntry = {
    id: crypto.randomUUID(),
    medId: medStore.currentMedication.id,
    medName: medStore.currentMedication.name,
    date: nowIso,
    dose: medStore.currentMedication.standardDose,
    doseUnit: medStore.currentMedication.doseUnit,
    withFood: withFood.value,
  };

  await intakeStore.addIntake(entry);

  alert(
      `Einnahme von ${medStore.currentMedication.name} protokolliert!` +
      (withFood.value ? ' (mit Essen)' : ' (ohne Essen)')
  );
};

const addReminder = () => {
    if(!newReminderTime.value) return;
    reminderStore.addReminder(medId, newReminderTime.value);
    newReminderTime.value = '';
};

onMounted(async () => {
  if (medId) {
    reminderStore.initReminders();
    
    const med = await medStore.fetchMedicationById(medId);
    if (med) {
      medStore.setLastScanned(med);
    }
  }
});
</script>

<template>
  <main class="p-6 max-w-xl mx-auto pb-20">
    
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

      <section class="mb-8 border-t pt-6 border-gray-100">
        <h3 class="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
            ⏰ Erinnerungen
        </h3>
        
        <div class="space-y-3 mb-4">
            <div 
                v-for="reminder in reminderStore.getRemindersByMedId(medId)" 
                :key="reminder.id"
                class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
            >
                <div class="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        :checked="reminder.enabled" 
                        @change="reminderStore.toggleReminder(reminder.id)"
                        class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                    />
                    <span :class="{'text-gray-400 line-through': !reminder.enabled}" class="font-mono text-lg font-medium">
                        {{ reminder.time }} Uhr
                    </span>
                </div>
                <button 
                    @click="reminderStore.removeReminder(reminder.id)"
                    class="text-red-400 hover:text-red-600 text-sm font-medium px-2 py-1 cursor-pointer"
                >
                    Löschen
                </button>
            </div>
            <div v-if="reminderStore.getRemindersByMedId(medId).length === 0" class="text-sm text-gray-400 italic">
                Keine Erinnerungen gesetzt.
            </div>
        </div>

        <div class="flex gap-2">
            <input 
                type="time" 
                v-model="newReminderTime"
                class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-mono text-lg"
            />
            <button 
                @click="addReminder"
                class="bg-secondary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors text-xl cursor-pointer"
            >
                +
            </button>
        </div>
      </section>
      <section class="mb-4">
        <label class="flex items-center gap-3 text-gray-700 cursor-pointer select-none">
          <input
              type="checkbox"
              v-model="withFood"
              class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
          />
          <span class="font-medium">Einnahme mit Essen</span>
        </label>
        <p class="text-xs text-gray-500 mt-1">
          Wird im Einnahmeprotokoll gespeichert.
        </p>
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