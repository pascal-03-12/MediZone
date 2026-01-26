<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});
</script>

<template>
  <header v-if="authStore.user">
    <nav>
      <button @click="authStore.logout">Abmelden</button>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: flex-end;
}

button {
  padding: 0.5rem 1rem;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #ff1744;
}
</style>
