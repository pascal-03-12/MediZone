<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useReminderStore } from './stores/reminder';
import { RouterLink, RouterView } from 'vue-router';
import StreakBadge from './components/StreakBadge.vue';

const authStore = useAuthStore();
const reminderStore = useReminderStore();

onMounted(() => {
  authStore.initAuth();
  reminderStore.initReminders();
});
</script>

<template>
  <!-- 🔄 LOADING -->
  <div
      v-if="authStore.loading"
      class="flex justify-center items-center min-h-screen bg-surface"
  >
    <div class="text-xl font-bold text-primary">
      Lade MediZone...
    </div>
  </div>

  <!-- ✅ APP -->
  <template v-else>
    <!-- 🌍 GLOBAL APP WRAPPER -->
    <div class="min-h-screen bg-surface text-textMain">

      <!-- HEADER -->
      <header
          v-if="authStore.user"
          class="p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-50"
      >
        <div class="fixed top-20 right-4 z-50 md:hidden">
          <StreakBadge />
        </div>

        <div class="font-bold text-primary text-xl tracking-tight">
          MediZone
        </div>

        <nav class="hidden md:flex items-center gap-8">
          <RouterLink
              to="/"
              class="text-gray-500 hover:text-primary transition-colors font-medium flex items-center gap-2"
              active-class="text-primary font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </RouterLink>

          <RouterLink
              to="/dashboard"
              class="text-gray-500 hover:text-primary transition-colors font-medium flex items-center gap-2"
              active-class="text-primary font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Kalender
          </RouterLink>

          <StreakBadge />
        </nav>

        <button
            @click="authStore.logout"
            class="text-gray-400 hover:text-red-500 transition-colors"
            title="Abmelden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      <!-- MAIN CONTENT -->
      <div class="md:container md:mx-auto md:max-w-4xl">
        <RouterView />
      </div>

      <!-- MOBILE NAV -->
      <nav
          v-if="authStore.user"
          class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-40 pb-safe"
      >
        <RouterLink
            to="/"
            class="flex flex-col items-center justify-center w-full py-3 text-gray-400 hover:text-primary transition-colors"
            active-class="text-primary font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-xs">Home</span>
        </RouterLink>

        <RouterLink
            to="/dashboard"
            class="flex flex-col items-center justify-center w-full py-3 text-gray-400 hover:text-primary transition-colors"
            active-class="text-primary font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs">Kalender</span>
        </RouterLink>
      </nav>

    </div>
  </template>
</template>

<style>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
</style>