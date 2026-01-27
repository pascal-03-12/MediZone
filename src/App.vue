<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <div v-if="authStore.loading" class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="text-xl font-bold text-gray-600">Lade MediZone...</div>
  </div>

  <template v-else>
    <header v-if="authStore.user" class="p-4 bg-white shadow flex justify-end">
      <nav>
        <button 
          @click="authStore.logout"
          class="px-4 py-2 bg-danger text-white border-none rounded cursor-pointer hover:bg-danger-hover transition-colors"
        >
          Abmelden
        </button>
      </nav>
    </header>
    <RouterView />
  </template>
</template>