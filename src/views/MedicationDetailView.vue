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

  if (rules.tooSoon) {
    alert(
        `Zu früh: Bitte warte noch ca. ${rules.minutesLeft} Minuten, bevor du dieses Medikament wieder nimmst.`
    );
    return;
  }

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
  if (!newReminderTime.value) return;
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
  <main class="p-6 max-w-xl mx-auto pb-24">

    <div
        v-if="medStore.loading"
        class="flex flex-col items-center justify-center py-16 text-primary"
    >
      <div class="animate-pulse text-lg font-semibold">
        Medikament wird geladen…
      </div>
    </div>

    <div
        v-else-if="medStore.error"
        class="bg-white rounded-2xl shadow-soft p-8 text-center border border-borderSoft"
    >
      <h2 class="text-xl font-bold text-danger mb-2">
        Unbekanntes Medikament
      </h2>
      <p class="text-textMuted mb-6">
        Dieses Medikament ist noch nicht in deiner MediZone hinterlegt.
      </p>

      <button
          @click="router.push('/')"
          class="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primaryHover transition"
      >
        Zurück zum Dashboard
      </button>
    </div>

    <div
        v-else-if="medStore.currentMedication"
        class="bg-white rounded-2xl p-8 shadow-soft border border-borderSoft"
    >
      <header class="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-textMain leading-tight">
            {{ medStore.currentMedication.name }}
          </h1>
          <p class="text-sm text-textMuted mt-1">
            {{ medStore.currentMedication.substance }}
          </p>
        </div>

        <span class="bg-primarySoft text-primaryDark px-3 py-1 rounded-full text-sm font-semibold">
          {{ medStore.currentMedication.dosageForm }}
        </span>
      </header>

      <section class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-surface rounded-xl p-4">
          <p class="text-xs text-textMuted mb-1">Standarddosis</p>
          <p class="text-lg font-semibold">
            {{ medStore.currentMedication.standardDose }}
            {{ medStore.currentMedication.doseUnit }}
          </p>
        </div>

        <div class="bg-surface rounded-xl p-4">
          <p class="text-xs text-textMuted mb-1">Max. pro Tag</p>
          <p class="text-lg font-semibold">
            {{ medStore.currentMedication.maxPerDay }}
            {{ medStore.currentMedication.doseUnit }}
          </p>
        </div>

        <div class="col-span-2 bg-surface rounded-xl p-4">
          <p class="text-xs text-textMuted mb-1">Anweisung</p>
          <p class="text-base">
            {{ medStore.currentMedication.instructions }}
          </p>
        </div>
      </section>

      <section class="mb-8 border-t pt-6 border-borderSoft">
        <h3 class="font-bold text-lg mb-4 text-textMain flex items-center gap-2">
          ⏰ Erinnerungen
        </h3>

        <div class="space-y-3 mb-4">
          <div
              v-for="reminder in reminderStore.getRemindersByMedId(medId)"
              :key="reminder.id"
              class="flex items-center justify-between bg-surface p-3 rounded-xl border border-borderSoft"
          >
            <div class="flex items-center gap-3">
              <input
                  type="checkbox"
                  :checked="reminder.enabled"
                  @change="reminderStore.toggleReminder(reminder.id)"
                  class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
              />
              <span
                  :class="{ 'text-textMuted line-through': !reminder.enabled }"
                  class="font-mono text-lg font-medium text-textMain"
              >
                {{ reminder.time }} Uhr
              </span>
            </div>
            <button
                @click="reminderStore.removeReminder(reminder.id)"
                class="text-danger hover:opacity-80 text-sm font-medium px-2 py-1 cursor-pointer"
            >
              Löschen
            </button>
          </div>

          <div
              v-if="reminderStore.getRemindersByMedId(medId).length === 0"
              class="text-sm text-textMuted italic"
          >
            Keine Erinnerungen gesetzt.
          </div>
        </div>

        <div class="flex gap-2">
          <input
              type="time"
              v-model="newReminderTime"
              class="flex-1 p-2 border border-borderSoft rounded-xl focus:outline-none focus:border-primary font-mono text-lg bg-white"
          />
          <button
              @click="addReminder"
              class="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primaryHover transition-colors text-xl cursor-pointer"
          >
            +
          </button>
        </div>
      </section>

      <section class="mb-6 bg-primarySoft rounded-xl p-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
              type="checkbox"
              v-model="withFood"
              class="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
          />
          <span class="font-medium text-primaryDark">
            Einnahme mit Essen
          </span>
        </label>
        <p class="text-xs text-primaryDark/70 mt-1">
          Wird im Einnahmeprotokoll gespeichert.
        </p>
      </section>

      <div class="flex gap-3">
        <button
            @click="logIntake"
            class="flex-1 py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg hover:bg-primaryHover transition"
        >
          Einnahme loggen
        </button>
        <button
            @click="router.push('/')"
            class="flex-1 py-4 bg-surface border border-borderSoft rounded-2xl font-semibold text-textMuted hover:bg-white transition"
        >
          Zurück
        </button>
      </div>

    </div>
  </main>
</template>