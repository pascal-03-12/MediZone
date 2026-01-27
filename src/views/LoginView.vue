
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isRegister = ref(false);

const handleSubmit = async () => {
    if (isRegister.value) {
        await authStore.register(email.value, password.value);
    } else {
        await authStore.login(email.value, password.value);
    }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 class="text-center mb-6 text-gray-800 text-2xl font-bold">
          {{ isRegister ? 'Registrieren' : 'Anmelden' }}
        </h2>
        <form @submit.prevent="handleSubmit">
            <div class="mb-4">
                <label for="email" class="block mb-2 text-gray-600 text-sm">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="email" 
                  required 
                  placeholder="deine@email.com"
                  class="w-full p-3 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary"
                />
            </div>
            <div class="mb-4">
                <label for="password" class="block mb-2 text-gray-600 text-sm">Passwort</label>
                <input 
                  type="password" 
                  id="password" 
                  v-model="password" 
                  required 
                  placeholder="********"
                  class="w-full p-3 border border-gray-300 rounded-md text-base transition-colors focus:outline-none focus:border-primary"
                />
            </div>
            <div v-if="authStore.error" class="text-red-700 bg-red-50 p-3 rounded-md mt-4 text-sm text-center">
                {{ authStore.error }}
            </div>
            <button 
              type="submit" 
              :disabled="authStore.loading"
              class="w-full p-3 bg-primary text-white border-none rounded-md text-base font-bold cursor-pointer transition-colors mt-4 hover:bg-primary-hover disabled:bg-primary-light disabled:cursor-not-allowed"
            >
                {{ authStore.loading ? 'Lade...' : (isRegister ? 'Registrieren' : 'Anmelden') }}
            </button>
        </form>
        <p class="text-center mt-6 text-sm text-gray-600">
            {{ isRegister ? 'Bereits einen Account?' : 'Noch keinen Account?' }}
            <a 
              href="#" 
              @click.prevent="isRegister = !isRegister"
              class="text-primary no-underline font-bold hover:underline"
            >
                {{ isRegister ? 'Hier anmelden' : 'Hier registrieren' }}
            </a>
        </p>
    </div>
  </div>
</template>
