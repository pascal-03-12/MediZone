
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  const initAuth = () => {
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser;

      if (currentUser) {
        const { useIntakeStore } = await import('./intake');
        const intakeStore = useIntakeStore();
        await intakeStore.fetchIntakes();
      }

      loading.value = false;
      if (!currentUser && router.currentRoute.value.meta.requiresAuth) {
        router.push('/login');
      }
    });
  };

  const register = async (email: string, password: string) => {
    error.value = null;
    loading.value = true;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    error.value = null;
    loading.value = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    error.value = null;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err: any) {
      error.value = err.message;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initAuth,
    register,
    login,
    logout
  };
});
