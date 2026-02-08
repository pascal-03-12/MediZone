# MediZone

MediZone ist eine **Offline-First Progressive Web App (PWA)** zur Verwaltung und Protokollierung von Medikamenteneinnahmen. Sie ermöglicht das Scannen von Medikamenten via NFC (WebNFC API) und synchronisiert Daten nahtlos mit Firebase, sobald eine Internetverbindung besteht.

## Kern-Features

* **Offline-First Architektur:** Volle Funktionalität auch ohne Internetverbindung dank IndexedDB und Service Workern.
* **NFC-Integration:** Scannen von Medikamentenpackungen (oder Tags) zur schnellen Erfassung.
* **Intelligenter Sync:** Automatische Synchronisierung lokaler Änderungen mit Cloud Firestore.
* **PWA:** Installierbar auf dem Homescreen (Android & iOS).

---

## Notfall-Installation (Fallback)

Sollte das Firebase Hosting (`medizone.info`) nicht erreichbar sein, kann das Projekt lokal ausgeführt werden. Die Firebase-Konfiguration ist bereits integriert.

**Voraussetzung:** [Node.js](https://nodejs.org/) ist installiert.

1. **Repository klonen & in das Verzeichnis wechseln**
2. **Abhängigkeiten installieren:**

npm install

npm run dev

### PWA-Funktionen lokal testen (Optional)

Da Service Worker im normalen Dev-Modus oft inaktiv sind, nutze diese Befehle, um die volle PWA-Funktionalität (Offline-Modus & Installation) lokal zu testen:

1. **Produktions-Build erstellen:**

npm run build

2. **Produktions-Server starten:**

npm run preview

Die PWA läuft nun unter http://localhost:4173.