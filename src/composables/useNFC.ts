import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMedicationStore } from '../stores/medication';

export function useNFC() {
  // Sicherer Check: Prüfen, ob wir im Browser sind UND ob NDEFReader existiert
  const isSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  
  const isScanning = ref(false);
  const isWriting = ref(false);
  const error = ref<string | null>(null);
  const router = useRouter();

  const startScan = async () => {
    // Wenn nicht unterstützt (z.B. am PC), sofort abbrechen
    if (!isSupported) return;

    try {
      // Zugriff über (window as any) verhindert Abstürze auf Desktop-Browsern
      const NDEFReader = (window as any).NDEFReader;
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

  const writeTag = async (path: string) => {
    // Zusätzlicher Schutz: Auf PC gar nicht erst versuchen
    if (!isSupported) {
      error.value = "NFC wird von diesem Gerät nicht unterstützt.";
      return;
    }

    try {
      isWriting.value = true;
      error.value = null;

      // Auch hier: Sicherer Zugriff
      const NDEFReader = (window as any).NDEFReader;
      const ndef = new NDEFReader();
      
      const fullUrl = window.location.origin + path;

      await ndef.write({
        records: [{ recordType: "url", data: fullUrl }]
      });

      alert("Erfolgreich auf NFC-Tag geschrieben!");
    } catch (err: any) {
      console.error(err);
      error.value = "Schreiben fehlgeschlagen: " + err.message;
    } finally {
      isWriting.value = false;
    }
  };

  return { isSupported, isScanning, isWriting, error, startScan, writeTag };
}