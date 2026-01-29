<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'; 
import { useIntakeStore } from '../stores/intake';

const intakeStore = useIntakeStore();

onMounted(() => {
  intakeStore.fetchIntakes();
});

const viewDate = ref(new Date()); 

const getLocalISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const selectedDate = ref(getLocalISODate(new Date()));

// -- KALENDER LOGIK --
const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const monthTitle = computed(() => {
  return viewDate.value.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
});

// KORRIGIERTE FUNKTION: Nutzt lokale Zeit statt UTC
const formatDateISO = (date: Date) => getLocalISODate(date);

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days = [];

  // Montag als Start (Mo=0 ... So=6 für die Berechnung)
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 
  
  // Auffülltage davor
  for (let i = startDayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({
      date: d,
      iso: formatDateISO(d),
      isCurrentMonth: false
    });
  }

  // Tage des aktuellen Monats
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      iso: formatDateISO(d),
      isCurrentMonth: true
    });
  }

  // Auffülltage danach (um Grid zu füllen)
  const remainingDays = 42 - days.length; // 6 Reihen à 7 Tage = 42
  if (remainingDays > 0 && remainingDays < 7) { // Optional: nur Woche füllen oder festes Grid
     // Wir füllen nur die angefangene Woche auf, sieht meist besser aus als starre 6 Reihen
     const daysToFill = 7 - (days.length % 7);
     if (daysToFill < 7) {
        for (let i = 1; i <= daysToFill; i++) {
            const d = new Date(year, month + 1, i);
            days.push({
                date: d,
                iso: formatDateISO(d),
                isCurrentMonth: false
            });
        }
     }
  }

  return days;
});

const hasIntake = (dateIso: string) => {
  return intakeStore.intakes.some(i => i.date && i.date.startsWith(dateIso));
};

// -- NAVIGATION --
const changeMonth = (delta: number) => {
  const newDate = new Date(viewDate.value);
  newDate.setMonth(newDate.getMonth() + delta);
  viewDate.value = newDate;
};

const selectDay = (iso: string) => {
  selectedDate.value = iso;
};

const jumpToToday = () => {
  const now = new Date();
  viewDate.value = now;
  selectedDate.value = formatDateISO(now);
};

// -- LISTE --
const filteredIntakes = computed(() => {
    return intakeStore.getIntakesForDate(selectedDate.value);
});

const displayDateDetails = computed(() => {
    const today = formatDateISO(new Date());
    

    const displayDateObj = new Date(selectedDate.value + 'T12:00:00');

    if (selectedDate.value === today) return 'Heute';
    return displayDateObj.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
});

const formatTime = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const deleteIntake = async (id: string) => {
  if (confirm('Eintrag löschen?')) {
    await intakeStore.deleteIntake(id);
  }
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
    
    <div class="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
        <button @click="changeMonth(-1)" class="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600">
            ←
        </button>
        <div class="font-bold text-gray-800 text-lg cursor-pointer select-none" @click="jumpToToday" title="Zu Heute springen">
            {{ monthTitle }}
        </div>
         <button @click="changeMonth(1)" class="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-600">
            →
        </button>
    </div>

    <div class="p-4">
        <div class="grid grid-cols-7 mb-2 text-center">
            <span v-for="day in weekDays" :key="day" class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {{ day }}
            </span>
        </div>

        <div class="grid grid-cols-7 gap-1">
            <div 
                v-for="day in calendarDays" 
                :key="day.iso"
                @click="selectDay(day.iso)"
                class="aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors relative"
                :class="[
                    day.iso === selectedDate ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-700',
                    !day.isCurrentMonth ? 'opacity-30' : ''
                ]"
            >
                <span class="text-sm font-medium">{{ day.date.getDate() }}</span>
                <div 
                    v-if="hasIntake(day.iso)" 
                    class="w-1.5 h-1.5 rounded-full mt-1"
                    :class="day.iso === selectedDate ? 'bg-white' : 'bg-green-500'"
                ></div>
            </div>
        </div>
    </div>

    <div class="border-t border-gray-100 p-4 bg-gray-50 min-h-[150px]">
        <h3 class="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            {{ displayDateDetails }}
        </h3>

        <ul v-if="filteredIntakes.length > 0" class="space-y-2">
            <li 
                v-for="intake in filteredIntakes" 
                :key="intake.id" 
                class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100"
            >
                <div>
                    <span class="font-bold text-gray-800 block">{{ intake.medName || 'Unbekannt' }}</span>
                    <span class="text-xs text-gray-500">{{ intake.dose }} {{ intake.doseUnit }}</span>
                </div>
                
                <div class="flex items-center gap-2">
                    <span class="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {{ formatTime(intake.date) }}
                    </span>
                    <button @click="deleteIntake(intake.id)" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </li>
        </ul>
        
        <div v-else class="text-center py-6 text-gray-400 text-sm italic">
            Keine Einnahmen für diesen Tag protokolliert.
        </div>
    </div>
  </div>
</template>