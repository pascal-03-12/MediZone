
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
  <div class="login-container">
    <div class="card">
        <h2>{{ isRegister ? 'Registrieren' : 'Anmelden' }}</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="email" required placeholder="deine@email.com" />
            </div>
            <div class="form-group">
                <label for="password">Passwort</label>
                <input type="password" id="password" v-model="password" required placeholder="********" />
            </div>
            <div v-if="authStore.error" class="error">
                {{ authStore.error }}
            </div>
            <button type="submit" :disabled="authStore.loading">
                {{ authStore.loading ? 'Lade...' : (isRegister ? 'Registrieren' : 'Anmelden') }}
            </button>
        </form>
        <p class="toggle-text">
            {{ isRegister ? 'Bereits einen Account?' : 'Noch keinen Account?' }}
            <a href="#" @click.prevent="isRegister = !isRegister">
                {{ isRegister ? 'Hier anmelden' : 'Hier registrieren' }}
            </a>
        </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
    padding: 1rem;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input:focus {
    outline: none;
    border-color: #4CAF50;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #a5d6a7;
    cursor: not-allowed;
}

.error {
    color: #d32f2f;
    background-color: #ffebee;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 1rem;
    font-size: 0.9rem;
    text-align: center;
}

.toggle-text {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: #666;
}

a {
    color: #4CAF50;
    text-decoration: none;
    font-weight: bold;
}

a:hover {
    text-decoration: underline;
}
</style>
