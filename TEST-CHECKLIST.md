# Test-Checkliste: Notizen-System

## ✅ Vor dem Deployment testen

### 1. Ordner-Erstellung

**Test 1.1: Root-Ordner erstellen**
- [ ] Notizen-Seite öffnen
- [ ] "Neuer Ordner" klicken
- [ ] Name eingeben (z.B. "Test")
- [ ] Speichern
- [ ] **Erwartung**: Ordner erscheint in Liste
- [ ] **Backend-Check**: `ls /volume1/docker/AIO-Hub-Data/Sarkei/` → `Test/` sollte existieren

**Test 1.2: Unterordner erstellen**
- [ ] Ordner "Test" anklicken (auswählen)
- [ ] "Neuer Ordner" klicken
- [ ] Name eingeben (z.B. "Unterordner")
- [ ] Speichern
- [ ] **Erwartung**: Unterordner erscheint unter "Test"
- [ ] **Backend-Check**: `ls /volume1/docker/AIO-Hub-Data/Sarkei/Test/` → `Unterordner/` sollte existieren

**Test 1.3: Mehrere Ebenen tief**
- [ ] Erstelle: `Projekt` → `2025` → `Januar` → `Woche1`
- [ ] **Erwartung**: Alle Ordner in Hierarchie sichtbar
- [ ] **Backend-Check**: `ls -R /volume1/docker/AIO-Hub-Data/Sarkei/Projekt/`

### 2. Datei-Upload

**Test 2.1: PDF hochladen (Root)**
- [ ] Kein Ordner ausgewählt
- [ ] "Datei hochladen" klicken
- [ ] PDF auswählen
- [ ] **Erwartung**: Datei erscheint in Liste
- [ ] **Backend-Check**: `ls /volume1/docker/AIO-Hub-Data/Sarkei/uploads/`

**Test 2.2: PDF hochladen (in Ordner)**
- [ ] Ordner "Test" auswählen
- [ ] "Datei hochladen" klicken
- [ ] PDF auswählen
- [ ] **Erwartung**: Datei erscheint unter "Test"
- [ ] **Backend-Check**: `ls /volume1/docker/AIO-Hub-Data/Sarkei/Test/`

**Test 2.3: Bild hochladen**
- [ ] JPG/PNG hochladen
- [ ] **Erwartung**: Bild erscheint in Liste
- [ ] Bild anklicken → ImageEditor sollte öffnen

### 3. PDF-Bearbeitung

**Test 3.1: PDF öffnen**
- [ ] Hochgeladenes PDF anklicken
- [ ] **Erwartung**: PDFViewer öffnet sich
- [ ] Seiten navigieren (vor/zurück)
- [ ] Zoom (in/out)

**Test 3.2: PDF-Annotationen**
- [ ] PDF öffnen
- [ ] Auf Canvas zeichnen (über PDF)
- [ ] "Speichern" klicken
- [ ] **Erwartung**: "Annotationen gespeichert!" Meldung
- [ ] PDF schließen und neu öffnen
- [ ] **Erwartung**: Annotationen sind noch da

### 4. Bild-Bearbeitung

**Test 4.1: Bild öffnen**
- [ ] Hochgeladenes Bild anklicken
- [ ] **Erwartung**: ImageEditor öffnet sich
- [ ] Bild wird korrekt angezeigt

**Test 4.2: Bild annotieren**
- [ ] Zeichenmodus: Stift auswählen
- [ ] Mit verschiedenen Farben zeichnen
- [ ] Rechteck, Kreis, Text hinzufügen
- [ ] "Speichern" klicken
- [ ] **Erwartung**: "Änderungen erfolgreich gespeichert!" Meldung

**Test 4.3: Bearbeitetes Bild prüfen**
- [ ] Bild schließen und neu öffnen
- [ ] **Erwartung**: Annotationen sind auf dem Bild
- [ ] **Backend-Check**: Datei wurde physisch überschrieben

### 5. Notizen (ReactQuill)

**Test 5.1: Notiz erstellen**
- [ ] "Neue Notiz" klicken
- [ ] Titel eingeben
- [ ] Text mit Formatierung eingeben (Fett, Kursiv, Farben)
- [ ] Speichern
- [ ] **Erwartung**: Notiz erscheint in Liste

**Test 5.2: Notiz bearbeiten**
- [ ] Notiz anklicken
- [ ] Text ändern
- [ ] Speichern
- [ ] **Erwartung**: Änderungen werden gespeichert

### 6. Dateisystem-Synchronisation

**Test 6.1: Manuell Ordner erstellen**
```bash
ssh nasadmin@NAS-TIMGREEN01
mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei/ManuellerOrdner
```
- [ ] Notizen-Seite neu laden (F5)
- [ ] **Erwartung**: "ManuellerOrdner" erscheint in Liste

**Test 6.2: Manuell Datei hochladen**
```bash
scp test.pdf nasadmin@NAS-TIMGREEN01:/volume1/docker/AIO-Hub-Data/Sarkei/ManuellerOrdner/
```
- [ ] Ordner "ManuellerOrdner" öffnen
- [ ] **Erwartung**: "test.pdf" erscheint in Liste
- [ ] PDF anklicken → PDFViewer öffnet sich

**Test 6.3: Mehrere Ebenen manuell**
```bash
mkdir -p /volume1/docker/AIO-Hub-Data/Sarkei/A/B/C
touch /volume1/docker/AIO-Hub-Data/Sarkei/A/B/C/dokument.pdf
```
- [ ] Seite neu laden
- [ ] **Erwartung**: Ordner A → B → C sichtbar
- [ ] "dokument.pdf" im Ordner C sichtbar

### 7. Edge Cases

**Test 7.1: Sonderzeichen in Ordnernamen**
- [ ] Ordner mit Umlauten: "Übungen"
- [ ] Ordner mit Leerzeichen: "Meine Notizen"
- [ ] **Erwartung**: Beide Ordner funktionieren

**Test 7.2: Große Dateien**
- [ ] 9MB PDF hochladen → sollte funktionieren
- [ ] 11MB PDF hochladen → sollte Fehlermeldung geben (max 10MB)

**Test 7.3: Nicht unterstützte Dateitypen**
- [ ] .exe Datei hochladen → sollte abgelehnt werden
- [ ] .zip Datei hochladen → sollte abgelehnt werden

**Test 7.4: Leere Ordner**
- [ ] Ordner ohne Dateien erstellen
- [ ] **Erwartung**: Ordner bleibt sichtbar

### 8. Datenbank-Konsistenz

**SQL-Checks nach Tests:**

```sql
-- PostgreSQL
docker exec -it aiohub_db psql -U aiohub -d aiohub_main
SET search_path TO user_sarkei_1760989676750;

-- Check 1: Ordner-Hierarchie
SELECT id, name, path, parent_id FROM note_folders ORDER BY path;

-- Check 2: Dateien
SELECT id, filename, file_path, file_type, file_size FROM note_files;

-- Check 3: Annotationen
SELECT id, filename, annotations FROM note_files WHERE annotations IS NOT NULL;

-- Check 4: Notizen
SELECT id, title, LENGTH(content) as content_length FROM notes;
```

**Erwartungen:**
- [ ] Alle erstellten Ordner in `note_folders`
- [ ] Pfade ohne `/notes/` Präfix
- [ ] `file_path` mit Forward Slashes (`/`)
- [ ] Annotationen als JSONB gespeichert

### 9. Performance-Tests

**Test 9.1: Viele Ordner**
- [ ] 50+ Ordner erstellen (manuell oder per Script)
- [ ] Seite laden
- [ ] **Erwartung**: < 5 Sekunden Ladezeit

**Test 9.2: Große PDF**
- [ ] 50+ Seiten PDF hochladen
- [ ] PDF öffnen
- [ ] **Erwartung**: Seite wird geladen (kann etwas dauern)
- [ ] Navigation funktioniert

### 10. Browser-Kompatibilität

- [ ] Chrome/Edge: Alle Features funktionieren
- [ ] Firefox: Alle Features funktionieren
- [ ] Safari: Alle Features funktionieren
- [ ] Mobile (optional): Grundfunktionen funktionieren

## 🐛 Bekannte Probleme

### Problem: "Fehler beim Speichern"

**Ursache**: SQL-Fehler durch Sonderzeichen
**Check**: Backend-Logs prüfen (`docker logs aiohub_backend`)
**Lösung**: Alle Single-Quotes sollten escaped werden (`replace(/'/g, "''")`)

### Problem: Upload schlägt fehl

**Ursache**: Ordner existiert nicht
**Check**: `ls -la /volume1/docker/AIO-Hub-Data/Sarkei/`
**Lösung**: Upload-Middleware erstellt Ordner mit `{ recursive: true }`

### Problem: PDF/Bild wird nicht angezeigt

**Ursache**: CORS oder falsche URL
**Check**: Browser DevTools → Network Tab
**Lösung**: URL sollte `/api/school/notes/files/:id` sein (nicht localhost)

### Problem: Annotationen gehen verloren

**Ursache**: Annotations-Endpoint fehlgeschlagen
**Check**: Backend-Logs
**Lösung**: `PUT /api/school/notes/files/:id/annotations` sollte 200 zurückgeben

## 📝 Test-Protokoll

**Datum**: _______________
**Tester**: _______________
**Version**: _______________

**Ergebnis**:
- [ ] ✅ Alle Tests bestanden
- [ ] ⚠️ Einige Tests fehlgeschlagen (Details unten)
- [ ] ❌ Kritische Fehler gefunden

**Fehler-Details**:
```
Test X.Y: [Beschreibung]
Erwartung: ...
Tatsächlich: ...
Logs: ...
```

**Sign-off**:
- [ ] System ist produktionsreif
- [ ] Dokumentation ist aktuell
- [ ] Backup vor Deployment erstellt
