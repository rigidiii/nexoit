# Nexo IT – Unternehmenswebseite

Umsetzung des Design-Handoffs `../design_handoff_nexo_it_website/` als Next.js-Anwendung,
ergänzt um einen Verwaltungsbereich für SMTP-Versand und Besucherstatistik.

**Stack:** Next.js 15 (App Router, Node-Runtime) · React 19 · SQLite (better-sqlite3) ·
Nodemailer · plain CSS. Bewusst ohne CSS-Framework: die Design-Vorgaben sind pixelgenau
gesetzt, und ein kleiner Abhängigkeitsbaum ist auf Jahre leichter zu warten.

---

## Schnellstart

```bash
npm install
cp .env.example .env   # danach ausfüllen, siehe unten
npm run dev
```

Die Seite läuft auf <http://localhost:3000>, der Verwaltungsbereich unter
<http://localhost:3000/admin>.

### Umgebungsvariablen

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `SITE_URL` | ja | Öffentliche Basis-URL ohne Slash am Ende. Steuert Canonical-URLs, `sitemap.xml`, `robots.txt` und Open-Graph-Tags. |
| `APP_SECRET` | ja | Mindestens 32 Zeichen. Verschlüsselt das SMTP-Passwort (AES-256-GCM) und signiert die Formular-Token. **Ändern macht das gespeicherte SMTP-Passwort unlesbar** – es muss dann neu eingegeben werden. |
| `DATABASE_PATH` | nein | Pfad zur SQLite-Datei, Standard `./data/nexo.db`. |
| `ADMIN_USERNAME` | ja | Benutzername des ersten Admin-Kontos. |
| `ADMIN_INITIAL_PASSWORD` | ja | Mindestens 12 Zeichen. Wird **nur beim allerersten Start** übernommen und danach ignoriert. |
| `TRUST_PROXY` | nein | Auf `1` setzen, wenn die App hinter nginx/Traefik/Cloudflare läuft, damit die Besucher-IP aus `X-Forwarded-For` gelesen wird. |

`APP_SECRET` erzeugen:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Vor dem Livegang

1. **Impressum und Datenschutzerklärung ausfüllen.** Beide Seiten sind Vorlagen; die
   auszufüllenden Stellen sind im Browser gelb hinterlegt und im Code als `nx-todo`
   markiert: `src/app/(site)/impressum/page.tsx` und `src/app/(site)/datenschutz/page.tsx`.
   Ein unvollständiges Impressum ist abmahnfähig – bitte anwaltlich prüfen lassen.
2. **SMTP hinterlegen** unter `/admin/smtp`, danach „Verbindung prüfen" und „Testmail senden".
3. **Demo-Statistik löschen:** Verwaltung → Einstellungen → „Alle Statistikdaten löschen".
   Die mitgelieferte Entwicklungsdatenbank enthält Beispieldaten aus
   `scripts/seed-demo-stats.mjs`.
4. **Admin-Passwort ändern** unter `/admin/einstellungen`.
5. **301-Weiterleitungen** von `maass-it-solution.de` auf die entsprechenden Ziele
   einrichten (Punkt 4 der offenen Punkte im Handoff).
6. `data/` und `.env` gehören **nicht** ins Repository und dürfen **nicht** per HTTP
   erreichbar sein. Beide stehen in `.gitignore`.

---

## Aufbau

```
src/
  app/
    (site)/          Öffentliche Seiten – eigenes Root-Layout mit Header,
                     Cookie-Banner und Reichweitenmessung
      layout.tsx     Metadaten, Schriften, JSON-LD, Skip-Link
      page.tsx       Onepager mit den neun Abschnitten des Handoffs
      globals.css    Design-System: Tokens, Komponenten, Keyframes, Breakpoints
      impressum/ datenschutz/
    (admin)/         Verwaltung – eigenes Root-Layout, bewusst ohne
                     Marketing-Navigation, Banner und Messung
      admin/login/   Anmeldung
      admin/(auth)/  Geschützt: Statistik, Nachrichten, SMTP, Einstellungen
    api/track/       Endpunkt der cookielosen Reichweitenmessung
    api/form-token/  Signierter Zeitstempel gegen Formular-Spam
    robots.ts sitemap.ts
  actions/           Server Actions (Kontaktformular, Verwaltung)
  components/        Sektionen, Effekte, Admin-Bausteine
  content/site.ts    Alle Texte an einem Ort – Kundentexte, wörtlich übernommen
  lib/               Datenbank, Krypto, Auth, Mailer, Statistik, Einwilligung
```

Zwei Root-Layouts über Route-Groups: die öffentliche Seite und die Verwaltung teilen
sich nichts außer den Design-Tokens. Ein Wechsel zwischen beiden Bereichen lädt die
Seite komplett neu – gewollt, weil kein gemeinsames Bundle nötig ist.

---

## Datenschutz und Recht

Die Umsetzung ist so gebaut, dass ohne Einwilligung nichts Einwilligungspflichtiges
passiert:

- **Keine Drittanbieter.** Kein Google Analytics, kein reCAPTCHA, keine Karten, keine
  Social-Plugins, keine CDNs.
- **Schriften selbst gehostet.** `next/font` lädt Sora und Manrope zur Bauzeit herunter
  und liefert sie von der eigenen Domain aus – keine Verbindung zu Google Fonts
  (vgl. LG München I, 20.01.2022 – 3 O 17493/20).
- **Reichweitenmessung ohne Cookies.** Gespeichert werden Zeitpunkt, Pfad,
  Referrer-*Host* (ohne Pfad und Suchbegriffe), grobe Geräteklasse, Browser, System und
  Verweildauer. Statt der IP-Adresse nur ein HMAC mit **täglich wechselndem Salt**; alte
  Salts werden nach zwei Tagen gelöscht, eine Wiedererkennung über den Tag hinaus ist
  damit ausgeschlossen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO; § 25 TDDDG greift
  nicht, weil nichts auf dem Endgerät gespeichert oder ausgelesen wird.
- **Do Not Track und Global Privacy Control** werden serverseitig respektiert,
  Crawler werden herausgefiltert, der Verwaltungsbereich wird nicht gezählt.
- **Cookie-Banner** mit gleichwertigem „Ablehnen", ohne Vorauswahl zugunsten optionaler
  Verarbeitungen, jederzeit über den Footer widerrufbar.
- **Gesetzte Cookies:** nur `nexo_consent` (die Auswahl, 12 Monate) und
  `nexo_admin_session` (nur im Verwaltungsbereich, 8 Stunden) – beide technisch
  notwendig nach § 25 Abs. 2 Nr. 2 TDDDG.
- **Aufbewahrungsfrist** der Messdaten einstellbar, Standard 180 Tage; ältere Daten
  werden bei jedem Aufruf der Verwaltung automatisch gelöscht.

Das ersetzt keine Rechtsberatung – die Textvorlagen gehören vor dem Livegang geprüft.

## Sicherheit

- SMTP-Passwort mit AES-256-GCM verschlüsselt in der Datenbank; es wird nie an den
  Browser zurückgegeben.
- Admin-Passwort als bcrypt-Hash (12 Runden), Session als httpOnly-Cookie mit
  `SameSite=Lax` und `Secure` in Produktion, 8 Stunden gleitende Gültigkeit.
- Anmeldung: 10 Fehlversuche pro 15 Minuten und Anschluss; konstante Antwortzeit, damit
  sich gültige Benutzernamen nicht erraten lassen.
- Kontaktformular: Honeypot, signierter Zeitstempel (frühestens nach 3 Sekunden gültig,
  längstens 2 Stunden), 5 Anfragen pro Stunde und Anschluss. Steuerzeichen und
  Zeilenumbrüche werden aus einzeiligen Feldern entfernt, damit sich keine Mail-Header
  einschleusen lassen.
- CSRF-Schutz über den Origin-Abgleich der Server Actions; `/api/track` prüft den Origin
  zusätzlich selbst.
- Security-Header in `next.config.mjs`: CSP, HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Der
  Verwaltungsbereich ist zusätzlich per `X-Robots-Tag` und `robots.txt` ausgenommen.

---

## Abweichungen vom Design-Handoff

Bewusste Ergänzungen, alle im Handoff als offene Punkte benannt:

| Punkt | Umsetzung |
|---|---|
| Kontaktformular (Handoff: „nicht vorgesehen") | Im dunklen Kontakt-Block links, an Stelle des einzelnen CTA-Buttons. Telefon, WhatsApp, E-Mail und Öffnungszeiten bleiben rechts unverändert. |
| Mobile Navigation (im Design nicht enthalten) | Burger-Menü unter 768 px, Telefon-CTA bleibt immer sichtbar, Touch-Targets ≥ 44 px. |
| Responsive (im Prototyp nicht umgesetzt) | Breakpoints exakt nach den Vorgaben: ≥ 1240 / 1024–1239 / 768–1023 / < 768 px. |
| Impressum & Datenschutz | Als eigene Seiten angelegt, Footer-Links zeigen dorthin statt auf tote Anker. |
| Mausspur im Hero | Neu (Wunsch aus der Beauftragung), siehe unten. |
| Sichtbarer Tastaturfokus, Skip-Link, `aria`-Auszeichnung | Im Prototyp nicht vorhanden, für Bedienbarkeit ergänzt. |
| Sicherheits-Fallbacks des Prototyps (1,5-s-Timeout, Scroll-Fallback) | Wie im Handoff vorgesehen entfallen; es genügt der IntersectionObserver mit der CSS-Klasse `is-visible`. |

### Mausspur im Hero

`src/components/HeroTrail.tsx` zeichnet auf einem Canvas eine blaue, sich verjüngende
und ausblendende Spur hinter dem Mauszeiger. Die Schichtung im Hero:

```
z-index 0  Raster
z-index 1  Glow (folgt der Maus)
z-index 2  Licht-Beams
z-index 3  Mausspur          <- liegt hinter dem Text
z-index 10 Überschrift, Text, Buttons, Kennzahlen
```

Nicht aktiv bei Touch-Eingabe und bei `prefers-reduced-motion: reduce`. Die im Handoff
beschriebene Punkt-Spur im Header bleibt davon unberührt und ist unverändert umgesetzt.

---

## Betrieb

```bash
npm run build
npm start          # Port 3000
```

Voraussetzung ist eine Node-Umgebung (Node 20+); ein statischer Export ist wegen
Datenbank und Mailversand nicht möglich. Hinter einem Reverse-Proxy `TRUST_PROXY=1`
setzen, sonst zählt die Statistik alle Besuche auf die Proxy-IP.

**Sicherung:** Die gesamte Anwendungsdatenbank liegt in `data/nexo.db` (plus
`-wal`/`-shm` im laufenden Betrieb). Für ein konsistentes Backup:

```bash
sqlite3 data/nexo.db ".backup 'backup/nexo-$(date +%F).db'"
```

### Skripte

| Befehl | Wirkung |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` | Produktions-Build |
| `npm start` | Produktionsserver |
| `node scripts/seed-demo-stats.mjs [Tage]` | Beispieldaten für die Statistik (nur Entwicklung) |

> `npm run build` und `npm run dev` teilen sich das Verzeichnis `.next`. Beides
> gleichzeitig laufen zu lassen beschädigt den Cache – dann hilft `rm -rf .next`.
