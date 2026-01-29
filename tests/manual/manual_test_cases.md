# Manual Test Cases for MediZone

Diese Datei enthält manuelle Testfälle, um sicherzustellen, dass die Kernfunktionen der MediZone-Anwendung fehlerfrei funktionieren.

## 1. Authentifizierung

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status |
|----|----------|----------|---------------------|--------|
| A1 | Login erfolgreich | 1. Navigiere zur Login-Seite.<br>2. Gib eine gültige E-Mail und Passwort ein.<br>3. Klicke auf "Anmelden". | Weiterleitung zum Dashboard/Home. Keine Fehlermeldung. | [ ] |
| A2 | Login fehlgeschlagen | 1. Navigiere zur Login-Seite.<br>2. Gib eine ungültige E-Mail oder falsches Passwort ein.<br>3. Klicke auf "Anmelden". | Fehlermeldung wird angezeigt ("Ungültige Anmeldedaten" o.ä.). Keine Weiterleitung. | [ ] |
| A3 | Logout | 1. Melde dich an.<br>2. Navigiere zum Profil oder Menü.<br>3. Klicke auf "Abmelden". | Weiterleitung zur Login-Seite. Zugriff auf geschützte Routen nicht mehr möglich. | [ ] |

## 2. Navigation & Dashboard

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status |
|----|----------|----------|---------------------|--------|
| N1 | Dashboard Laden | 1. Melde dich an.<br>2. Warte auf das Laden des Dashboards. | Dashboard zeigt "Heute"-Übersicht. Kein ewiges Ladesymbol. | [ ] |
| N2 | Menü-Navigation | 1. Klicke auf "Kalender" in der Navigation.<br>2. Klicke auf "Medikamente".<br>3. Klicke auf "Profil". | Die jeweilige Ansicht wird korrekt geladen und angezeigt. | [ ] |

## 3. Medikamente Verwalten

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status |
|----|----------|----------|---------------------|--------|
| M1 | Medikament Details | 1. Gehe zur Medikamenten-Liste.<br>2. Wähle ein Medikament aus der Liste aus. | Navigiert zur Detail-Seite des Medikaments. Name, Dosis und Infos werden angezeigt. | [ ] |
| M2 | Custom Medikament | 1. (Falls implementiert) Klicke auf "Neues Medikament".<br>2. Fülle Formular aus (Name, Dosis).<br>3. Speichern. | Medikament erscheint in der Liste/Dashboard. | [ ] |

## 4. Einnahme-Tracking (Core)

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status |
|----|----------|----------|---------------------|--------|
| I1 | Einnahme loggen | 1. Wähle ein Medikament auf dem Dashboard.<br>2. Klicke auf "Einnahme bestätigen" / "Nehmen". | "Einnahme erfolgreich" Bestätigung. Dosis wird zum Tagesfortschritt addiert. | [ ] |
| I2 | Regel-Check (Warnung) | 1. Logge eine Einnahme.<br>2. Versuche sofort danach dieselbe Einnahme erneut zu loggen (innerhalb der Mindestzeit). | Warnmeldung erscheint ("Zu früh", "Mindestabstand beachten"). | [ ] |
| I3 | Einnahme löschen | 1. Gehe zur Übersicht der heutigen Einnahmen.<br>2. Lösche den letzten Eintrag. | Eintrag verschwindet. Tagesfortschritt sinkt entsprechend. | [ ] |

## 5. Streak System

| ID | Testfall | Schritte | Erwartetes Ergebnis | Status |
|----|----------|----------|---------------------|--------|
| S1 | Streak Erhöhung | 1. Stelle sicher, dass für gestern eine Einnahme existiert (oder simuliere es).<br>2. Logge die erste Einnahme für heute. | Streak-Zähler erhöht sich um 1. | [ ] |
| S2 | Streak Reset | 1. Simuliere, dass gestern keine Einnahme erfolgt ist (Lücke im Verlauf).<br>2. Logge Einnahme für heute. | Streak sollte 1 sein (Neustart), oder entspr. Logik. | [ ] |
