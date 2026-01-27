import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMedicationStore } from '../stores/medication';

export function useNFC() {
  const isSupported = 'NDEFReader' in window;
  const isScanning = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const startScan = async () => {
    if (!isSupported) return;

    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      isScanning.value = true;
      error.value = null;

      ndef.onreading = (event: any) => {
        const textDecoder = new TextDecoder();
        for (const record of event.message.records) {
          if (record.recordType === "url") {
            const url = textDecoder.decode(record.data);
            handleUrlScan(url);
          }
          else if (record.recordType === "text") {
            const text = textDecoder.decode(record.data);
            if (text.includes('/medication/')) {
              handleUrlScan(text);
            }
          }
        }
      };
    } catch (err: any) {
      isScanning.value = false;
      error.value = "Scan fehlgeschlagen: " + err.message;
    }
  };

  const handleUrlScan = async (url: string) => {
    try {
      const parts = url.split('/');
      const id = parts[parts.length - 1];

      if (id) {
        // Fetch medication data to cache it
        const store = useMedicationStore();
        const medication = await store.fetchMedicationById(id);

        if (medication) {
          store.setLastScanned(medication);
        }

        router.push(`/medication/${id}`);
        isScanning.value = false;
      }
    } catch (e) {
      error.value = "Konnte ID nicht aus URL lesen";
    }
  }

  return { isSupported, isScanning, error, startScan };
}