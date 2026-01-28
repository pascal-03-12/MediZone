<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'; 
import { useIntakeStore } from '../stores/intake';

const intakeStore = useIntakeStore();

// Daten laden, sobald die Komponente angezeigt wird
onMounted(() => {
  intakeStore.fetchIntakes();
});

const currentDate = ref(new Date().toISOString().split('T')[0]);
const dateInput = ref<HTMLInputElement | null>(null);

const filteredIntakes = computed(() => {
    return intakeStore.getIntakesForDate(currentDate.value);
});

const displayDate = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (currentDate.value === today) return 'Heute';
    if (currentDate.value === yesterday) return 'Gestern';
    
    return new Date(currentDate.value).toLocaleDateString('de-DE'); 
});

const changeDate = (days: number) => {
    const date = new Date(currentDate.value);
    date.setDate(date.getDate() + days);
    currentDate.value = date.toISOString().split('T')[0];
};

const openCalendar = () => {
    // Öffnet den nativen Datepicker des Inputs
    if (dateInput.value) {
        // showPicker() ist modern, fallback könnte click() sein
        if ('showPicker' in HTMLInputElement.prototype) {
             try {
                dateInput.value.showPicker();
             } catch (e) {
                // Fallback für Browser die showPicker im Kontext nicht erlauben (z.B. Safari manchmal)
                // In dem Fall machen wir den Input sichtbar(er) über CSS, aber hier versuchen wir es so.
             }
        } else {
             dateInput.value.click();
        }
    }
};

// Zeitformatierung anpassen
const formatTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const deleteIntake = async (id: string) => {
  if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
    await intakeStore.deleteIntake(id);
  }
};
</script>

<template>
  <div class="daily-overview p-4 bg-white rounded shadow-md mt-4">
    <div class="flex justify-between items-center mb-4">
        <button @click="changeDate(-1)" class="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            &lt;
        </button>
        
        <div class="relative cursor-pointer group" @click="openCalendar">
            <h2 class="text-xl font-bold group-hover:text-primary transition-colors">{{ displayDate }}</h2>
            <input 
                ref="dateInput"
                type="date" 
                v-model="currentDate" 
                class="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
            >
            <!-- Hinweis: pointer-events-none auf Input, damit der Klick auf DIV geht und wir showPicker() rufen können, 
                 oder wir lassen es zu und machen input groß. 
                 Aber schöner ist: Input versteckt, aber wir rufen showPicker().
                 Korrektur: Damit showPicker geht, muss man interagieren.
                 Alternative: Input komplett unsichtbar über dem Text legen. -->
        </div>

         <button @click="changeDate(1)" class="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            &gt;
        </button>
    </div>
    
    <div class="text-gray-600 mb-4 text-center">
      {{ filteredIntakes.length }} Einnahmen
    </div>

    <ul v-if="filteredIntakes.length > 0" class="space-y-2">
      <li v-for="intake in filteredIntakes" :key="intake.id" class="flex justify-between items-center bg-gray-50 p-2 rounded">
        <span class="font-medium">
             {{ intake.medName || intake.medId }}
        </span>
        <div class="flex items-center gap-2">
            <span class="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {{ intake.dose }} {{ intake.doseUnit }}
            </span>
            <span class="text-gray-500 text-sm">
              {{ formatTime(intake.date) }}
            </span>
             <button @click="deleteIntake(intake.id)" class="text-red-500 hover:text-red-700 ml-2" title="Löschen">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
      </li>
    </ul>
    <div v-else class="text-center text-gray-400 py-4">
      Keine Einnahmen an diesem Tag.
    </div>
  </div>
</template>