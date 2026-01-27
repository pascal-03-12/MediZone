<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useReminderStore } from './stores/reminder';

const authStore = useAuthStore();
const reminderStore = useReminderStore();

onMounted(() => {
  authStore.initAuth();
  reminderStore.initReminders();
});
</script>

<template>
  <div v-if="authStore.loading" class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="text-xl font-bold text-gray-600">Lade MediZone...</div>
  </div>

  <template v-else>
    <header v-if="authStore.user" class="p-4 bg-white shadow flex justify-between items-center sticky top-0 z-50">
      <div class="font-bold text-primary text-xl tracking-tight">MediZone</div>
      <nav>
        <button 
          @click="authStore.logout"
          class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Abmelden
        </button>
      </nav>
    </header>
    <RouterView />
  </template>
</template>