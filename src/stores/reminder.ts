import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Reminder } from '../types/types';
import { useMedicationStore } from './medication';

export const useReminderStore = defineStore('reminder', () => {
    const reminders = ref<Reminder[]>([]);

    const initReminders = () => {
        const stored = localStorage.getItem('medizone_reminders');
        if (stored) {
            reminders.value = JSON.parse(stored);
        }
        if ('Notification' in window && Notification.permission === 'default') {
            // Wir fragen hier noch nicht explizit an, um den User nicht beim Start zu nerven.
            // Die Anfrage kommt spätestens beim Erstellen eines Reminders.
            console.log("Benachrichtigungen sind möglich, aber noch nicht erlaubt.");
        }
        startReminderLoop();
    };

    const saveReminders = () => {
        localStorage.setItem('medizone_reminders', JSON.stringify(reminders.value));
    };

    const addReminder = async (medId: string, time: string) => {
        // Berechtigung anfragen, falls noch nicht geschehen
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Benachrichtigungen müssen erlaubt sein, damit Erinnerungen funktionieren.');
            }
        }

        reminders.value.push({
            id: crypto.randomUUID(),
            medId,
            time,
            enabled: true
        });
        saveReminders();
    };

    const removeReminder = (id: string) => {
        reminders.value = reminders.value.filter(r => r.id !== id);
        saveReminders();
    };

    const toggleReminder = (id: string) => {
        const reminder = reminders.value.find(r => r.id === id);
        if (reminder) {
            reminder.enabled = !reminder.enabled;
            reminder.snoozedUntil = undefined;
            saveReminders();
        }
    };

    const startReminderLoop = () => {
        setInterval(() => {
            checkReminders();
        }, 60000);
    };

    const checkReminders = async () => {
        const now = new Date();

        const medStore = useMedicationStore();

        for (const reminder of reminders.value) {
            if (!reminder.enabled) continue;

            // Neue Zeit-Logik: Unabhängig von Locale
            // time ist im Format "HH:MM" gespeichert (vom input type="time")
            const [remHour, remMinute] = reminder.time.split(':').map(Number);

            const isTime = now.getHours() === remHour && now.getMinutes() === remMinute;
            const isSnoozeOver = reminder.snoozedUntil && now.getTime() >= reminder.snoozedUntil;

            console.log(`Check Reminder: ${reminder.time} vs ${now.getHours()}:${now.getMinutes()} -> isTime=${isTime}`);

            if ((isTime && !reminder.snoozedUntil) || isSnoozeOver) {
                let medName = "Medikament";
                if (medStore.currentMedication?.id === reminder.medId) {
                    medName = medStore.currentMedication.name;
                } else if (medStore.lastScannedMedication?.id === reminder.medId) {
                    medName = medStore.lastScannedMedication.name;
                }

                triggerNotification(reminder, medName);
            }
        }
    };

    const triggerNotification = (reminder: Reminder, medName: string) => {
        reminder.snoozedUntil = undefined;
        saveReminders();

        if (Notification.permission === 'granted') {
            const notif = new Notification("MediZone Zeit", {
                body: `Einnahme fällig: ${medName}`,
                icon: '/pwa-192x192.png',
                requireInteraction: true
            });

            notif.onclick = () => {
                window.focus();
                const snooze = confirm(`${medName} jetzt einnehmen?\nOK = Ja\nAbbrechen = 10 Min Snooze`);
                if (!snooze) {
                    reminder.snoozedUntil = Date.now() + (10 * 60 * 1000); // 10 Min
                    saveReminders();
                }
                notif.close();
            };
        } else {
            alert(`Erinnerung: ${medName} einnehmen!`);
        }
    };

    const getRemindersByMedId = (medId: string) => {
        return reminders.value.filter(r => r.medId === medId);
    };

    return {
        reminders,
        initReminders,
        addReminder,
        removeReminder,
        toggleReminder,
        getRemindersByMedId
    };
});