# Handoff: Nexo IT Website (www.nexo-it.de)

## Overview
Neue Unternehmens-Webseite für **Nexo IT** (vormals *maass it solution*). Einseitige Marketing-Seite (Onepager) mit Anker-Navigation, die Leistungen, Selbstverständnis und Kontaktwege darstellt. Inhalte sind 1:1 von www.maass-it-solution.de übernommen und auf die neue Marke umgestellt (E-Mail, Domain, Name).

Ziel der Umsetzung: eine performante, SEO-fähige, statisch ausspielbare Marketing-Seite unter www.nexo-it.de.

## About the Design Files
Die Datei in `design/` ist eine **Design-Referenz in HTML** — ein Prototyp, der Aussehen und Verhalten zeigt, **kein Produktionscode zum direkten Übernehmen**. Sie nutzt ein internes Design-Component-Format (`.dc.html`: Template + Logik-Klasse in einer Datei) und lässt sich nicht unverändert deployen.

Aufgabe: die Designs im Ziel-Stack **nachbauen** — mit den dort etablierten Patterns und Libraries. Falls noch kein Stack existiert, ist für diese Seite **Astro oder Next.js (static export) + Tailwind CSS** die naheliegende Wahl: eine Seite, viel statischer Inhalt, wenig Client-JS, gute Lighthouse-Werte.

Das HTML im Prototyp arbeitet ausschließlich mit **Inline-Styles** (Vorgabe der Prototyping-Umgebung). Im Zielcodebase sollen daraus normale Klassen/Utility-Klassen/Komponenten werden. Werte (Farben, Größen, Radien, Timings) sind verbindlich, die Umsetzungsform nicht.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radien, Schatten und Animationen sind final gesetzt und sollen pixelnah übernommen werden. Nicht final:
- **Bilder/Fotos:** keine vorhanden. Die Seite ist bewusst bildlos gestaltet (Grid-Muster, Glow, Orbit-Grafik). Wenn Kundenfotos/Teambilder kommen, müssen Platzierungen neu abgestimmt werden.
- **Responsive:** Das Layout ist für Desktop (≥1240 px) gestaltet. Breakpoints unten sind Vorgabe, aber nicht im Prototyp umgesetzt — Umsetzung liegt beim Entwickler.
- **Rechtliches:** Impressum und Datenschutz sind nur als Footer-Links (`#impressum`, `#datenschutz`) vorhanden, ohne Inhalt. Unterseiten müssen angelegt werden.

## Screens / Views

Eine Seite, neun Abschnitte in dieser Reihenfolge. Maximale Inhaltsbreite durchgehend **1240 px, zentriert, 28 px horizontales Padding**.

### 0. Scroll-Progress-Leiste
- `position: fixed; top: 0; left: 0; height: 3px; z-index: 60`
- Breite = Scroll-Fortschritt in %
- Verlauf `linear-gradient(90deg, #0A5CFF, #8FB6FF)`, `box-shadow: 0 0 14px rgba(10,92,255,.8)`

### 1. Header (sticky)
- **Zweck:** Navigation, direkter Anruf-CTA.
- **Layout:** `position: sticky; top: 0; z-index: 50; overflow: hidden`. Hintergrund `rgba(20,22,26,.82)` + `backdrop-filter: blur(14px)`, untere Grenze `1px solid rgba(255,255,255,.08)`. Inhaltszeile: Flex, `align-items: center`, `gap: 32px`, Padding `14px 28px`. Inhalt liegt auf `position: relative; z-index: 2` über der Cursor-Spur.
- **Logo (links):** Quadrat 38×38, `border-radius: 11px`, Hintergrund `#0A5CFF`, `box-shadow: 0 6px 20px rgba(10,92,255,.45)`, darin das „N"-Icon in Weiß (20×20, SVG siehe Assets). Daneben Wortmarke: Sora, 21 px, „Nexo" `font-weight: 600` in `#FFF`, „IT" `font-weight: 800` in `#4E8CFF`, `letter-spacing: -.02em`.
- **Nav (rechts, `margin-left: auto`, gap 30 px):** Leistungen · Über uns · Was uns antreibt · Versprechen. Manrope 15 px / 500, Farbe `rgba(255,255,255,.72)`, Hover `#FFF`. Ziele: `#leistungen`, `#ueber-uns`, `#werte`, `#versprechen`.
- **Telefon-CTA:** Pill, Padding `10px 18px`, `border-radius: 999px`, Hintergrund `#0A5CFF`, Text `#FFF` 15 px / 600, `box-shadow: 0 8px 24px rgba(10,92,255,.35)`, Hover `#4E8CFF`. Text „0151 / 412 899 74", `href="tel:015141289974"`.
- **Effekt — Cursor-Spur:** siehe Interactions.

### 2. Hero (`id="top"`)
- **Zweck:** Positionierung + primärer CTA.
- **Layout:** Hintergrund `#14161A`, Text weiß, Padding `120px 28px 140px`, `overflow: hidden`. Inhalt: Grid `1.05fr .95fr`, `gap: 64px`, `align-items: center`.
- **Hintergrundschichten** (in dieser Z-Reihenfolge):
  1. Grid-Raster: zwei `linear-gradient`-Linien in `rgba(255,255,255,.045)` 1 px, `background-size: 64px 64px`, maskiert mit `radial-gradient(120% 90% at 50% 10%, #000 30%, transparent 75%)`.
  2. Glow (`[data-glow]`): 820×820 Kreis, zentriert bei `left:50%; top:20%`, `radial-gradient(circle, rgba(10,92,255,.42), transparent 62%)`, `filter: blur(20px)`, folgt der Maus (siehe Interactions).
  3. Licht-Beams: drei 1 px breite senkrechte Linien bei `left: 18% / 52% / 81%`, Höhen 130/100/150 px, Verläufe `transparent → rgba(143,182,255,.9|.6) → transparent` bzw. grün `rgba(59,227,154,.55)`, Animation `nx-beam` 6 s / 8,5 s (Delay 1,8 s) / 7,4 s (Delay 3,2 s) linear infinite.
- **Headline:** Sora 700, `clamp(44px, 5.4vw, 78px)`, `line-height: 1.02`. Text: „IT einfach" / Zeilenumbruch / „und sicher." Effekt: Gradient-Glanz `linear-gradient(100deg,#fff 20%,#8FB6FF 42%,#fff 62%)`, `background-size: 220% 100%`, `background-clip: text`, `color: transparent`, Animation `nx-shine` 7 s linear infinite.
- **Subline:** Manrope 21 px, `line-height: 1.55`, `rgba(255,255,255,.72)`, `max-width: 30ch`, `margin-top: 26px`. Text: „Kümmern Sie sich um Ihr Kerngeschäft, wir um Ihre IT. Wir bieten IT Lösungen für jeden Bereich."
- **CTAs** (`margin-top: 38px`, Flex, `gap: 14px`):
  - Primär → `#leistungen`: „Unsere Dienstleistungen →", Padding `17px 30px`, `radius: 14px`, `#0A5CFF`, 16 px / 700, `box-shadow: 0 16px 40px rgba(10,92,255,.4)`; Hover `translateY(-3px)` + `box-shadow: 0 22px 52px rgba(10,92,255,.55)`, Transition `.25s`.
  - Sekundär → `#kontakt`: „Kontakt", gleiche Maße, `border: 1px solid rgba(255,255,255,.22)`, transparent; Hover Hintergrund `rgba(255,255,255,.08)`, Border `rgba(255,255,255,.45)`.
- **Kennzahlen** (`margin-top: 56px`, Flex, `gap: 44px`): „24/7 / Überwachung", „DSGVO / Hosting in der EU", „Full Service / Web & Infrastruktur". Zahl: Sora 30 px / 700. Label: 14 px, `rgba(255,255,255,.55)`, `margin-top: 4px`.
- **Orbit-Grafik rechts** (`[data-orbits]`, Höhe 480 px, zentriert):
  - Ring 420×420, `1px solid rgba(255,255,255,.10)`, `nx-spin` 46 s linear infinite; darauf ein Punkt 10 px `#4E8CFF` mit `box-shadow: 0 0 18px`.
  - Ring 300×300, `1px dashed rgba(255,255,255,.14)`, `nx-spin` 30 s reverse; Punkt 8 px `#3BE39A`, Glow.
  - Kreis 180×180, `radial-gradient(circle at 35% 30%, rgba(78,140,255,.35), rgba(10,92,255,.10))`, Border `rgba(255,255,255,.12)`.
  - Kern: 112×112, `border-radius: 30px`, `#0A5CFF`, `box-shadow: 0 24px 70px rgba(10,92,255,.6)`, Icon 58 px weiß, Animation `nx-float` 7 s; darüber ein Ring `1px solid rgba(255,255,255,.35)` mit `nx-pulse` 3,6 s.
  - Zwei Glas-Badges: „Server online · 99,9 %" (oben rechts) und „Backup abgeschlossen" (unten links). Padding `13px 17px`, `radius: 14px`, `rgba(255,255,255,.07)`, Border `rgba(255,255,255,.12)`, `backdrop-filter: blur(8px)`, 13 px / 600, `nx-float` 9 s bzw. 11 s.
  - Parallax: verschiebt sich beim Scrollen um `-scrollTop * 0.05` px auf Y.

### 3. Leistungs-Ticker (Marquee)
- Volle Breite, Hintergrund `#0A5CFF`, Text `#FFF`, Padding `15px 0`, `overflow: hidden`.
- Zwei **identische** Hälften nebeneinander in einem `display: flex; width: max-content`-Container, jede mit `gap: 44px; padding-right: 44px`. Animation `nx-marquee` (0 → `translateX(-50%)`) 34 s linear infinite → lückenloser Loop. Wichtig: Duplikat nicht entfernen, sonst reißt die Schleife ab.
- Inhalt je Hälfte, getrennt durch „·": Serverhosting · WebHosting · Webseiten erstellen · Backup Service · SEO · IT Dienstleistungen ·
- Typo: Sora 15 px / 600, `letter-spacing: .06em`, `text-transform: uppercase`, `white-space: nowrap`.
- Abschaltbar über Prop `showMarquee`.

### 4. Über uns (`id="ueber-uns"`)
- Hintergrund `#FFFFFF`, Padding `120px 28px`. Grid `1fr 1fr`, `gap: 80px`, `align-items: start`.
- **Linke Spalte** `position: sticky; top: 110px`:
  - Eyebrow „Über uns": 13 px / 700, `letter-spacing: .12em`, uppercase, `#0A5CFF`.
  - H2 „IT Dienstleistungen / aller Art" (Umbruch nach „Dienstleistungen"): Sora 700, `clamp(34px,3.6vw,52px)`, `line-height: 1.08`, `margin-top: 18px`.
  - Absatz 18 px / 1.65, `#5C6270`: „Als Full-Service-IT-Unternehmen bieten wir unseren Kunden umfassende Lösungen für ihre Webpräsenz und IT-Infrastruktur."
  - Button → `#kontakt`: „Anfrage senden →", `#14161A`, Text weiß, `radius: 13px`, Padding `16px 28px`, 600; Hover `translateY(-2px)` + Hintergrund `#0A5CFF`.
- **Rechte Spalte**, `gap: 26px`, drei Absätze (18 px / 1.7; erster in `#14161A`, die folgenden `#5C6270`) und ein hervorgehobenes Zitat: Padding `26px 28px`, `border-left: 3px solid #0A5CFF`, Hintergrund `#F5F7FA`, `border-radius: 0 14px 14px 0`, 18 px / 1.7 / 500. Exakte Texte siehe Prototyp — Kundentexte, **nicht umschreiben**.

### 5. Leistungen (`id="leistungen"`)
- Hintergrund `#F5F7FA`, `border-top: 1px solid rgba(20,22,26,.10)`, Padding `120px 28px`.
- Kopf (max. 760 px): Eyebrow „IT-Services, die zu Ihnen passen"; H2 „Individuelle Lösungen" + Zeile „für Ihr Unternehmen" in `#5C6270`.
- **Karten-Grid:** `repeat(3, 1fr)`, `gap: 24px`, `margin-top: 56px`.
- **Karte (Standard, 5×):** Padding `34px 30px 30px`, `border-radius: 20px`, Hintergrund `#FFF`, `border: 1px solid rgba(20,22,26,.10)`, `overflow: hidden`. **Kein Hover-Effekt** (bewusst entfernt).
  - Icon-Kachel 52×52, `radius: 15px`, Hintergrund `rgba(10,92,255,.10)`, Icon 24 px `stroke: currentColor`, `stroke-width: 1.8` in `#0A5CFF`.
  - H3: Sora 22 px / 600, `margin-top: 22px`.
  - Absatz: 16 px / 1.6, `#5C6270`, `margin-top: 12px`.
  - Liste: `list-style: none`, `gap: 9px`, 15 px, `#14161A`; jedes Item Flex mit `gap: 10px` und Häkchen „✓" in `#0A5CFF`.
- **Karte 6 (invertiert, „IT Dienstleistungen"):** Hintergrund `#14161A`, Text weiß, darüber `radial-gradient(120% 90% at 85% 0%, rgba(10,92,255,.55), transparent 60%)`. Icon-Kachel `rgba(255,255,255,.12)`, Absatz `rgba(255,255,255,.72)`, Häkchen `#4E8CFF`.
- **Inhalte der sechs Karten** (Titel / Beschreibung / 4 Bullets) exakt wie im Prototyp: Serverhosting, WebHosting, Webseiten erstellen, Backup Service, SEO, IT Dienstleistungen.
- **Effekt:** Karten fliegen beim Scrollen ein — Richtung je Karte in Lesereihenfolge: links, unten, rechts, links, unten, rechts (siehe Interactions).

### 6. Zwischen-CTA (dunkles Band)
- Hintergrund `#14161A`, Padding `110px 28px`, `overflow: hidden`. Hintergrund: senkrechte Linien `rgba(255,255,255,.05)` 1 px, `background-size: 52px 52px`, maskiert `linear-gradient(90deg, transparent, #000 40%, #000 60%, transparent)`.
- Zentriert, max. 900 px: Vorzeile 14 px / 1.6 `rgba(255,255,255,.6)` („Von der Idee bis zur Umsetzung / wir begleiten Sie auf jedem Schritt"), H2 Sora 700 `clamp(30px,3.4vw,46px)` / 1.15 („Weil Erfolg Teamarbeit ist – wir sind Ihr Partner für digitale Lösungen."), Button weiß auf dunkel („Kontakt aufnehmen →", `#FFF` / `#14161A`, `radius: 14px`, Padding `17px 32px`, 700; Hover `translateY(-3px)` + `box-shadow: 0 20px 46px rgba(255,255,255,.18)`).

### 7. Was uns antreibt (`id="werte"`)
- Hintergrund `#FFF`, Padding `120px 28px`. Kopf: Eyebrow „Unsere Leitlinien", H2 „Was uns antreibt", Subline 18 px `#5C6270` „auf Ihre Bedürfnisse abgestimmt".
- Zwei Karten, Grid `1fr 1fr`, `gap: 26px`, `margin-top: 52px`. Karte: Padding `42px 40px`, `radius: 22px`, Hintergrund `#F5F7FA`, Border `rgba(20,22,26,.10)`.
  - Kopfzeile: Icon-Kachel 46×46, `radius: 13px` (Vision: `#0A5CFF`; Mission: `#14161A`), Icon weiß 22 px; daneben H3 Sora 26 px / 600.
  - Text 16,5 px / 1.72, `#5C6270`, `margin-top: 22px`. Volltexte „Vision" und „Mission" wie im Prototyp — Kundentexte, unverändert übernehmen.

### 8. Versprechen (`id="versprechen"`)
- Hintergrund `#F5F7FA`, `border-top: 1px solid rgba(20,22,26,.10)`, Padding `120px 28px`. Kopf: Eyebrow „Ihre Zufriedenheit ist unser Antrieb", H2 „Was Sie von uns / erwarten können", Subline „zuverlässige IT-Lösungen aus einer Hand".
- **Vier-Spalten-Tabelle als Hairline-Grid:** `grid-template-columns: repeat(4,1fr)`, `gap: 1px`, Container-Hintergrund = Linienfarbe `rgba(20,22,26,.10)`, `border-radius: 22px`, `overflow: hidden`, `border: 1px solid` derselben Farbe. Zellen `background: #FFF`.
- Zelle: Padding `38px 30px`; Nummer „01"–„04" Sora 14 px / 700 `#0A5CFF`; H3 21 px / 600 `margin-top: 16px`; Text 15,5 px / 1.65 `#5C6270`.
- **Hover:** Zelle invertiert zu `background: #14161A; color: #FFF`, Transition `.3s`.
- Inhalte: 01 Individualität, 02 Reaktionszeit, 03 Hochverfügbarkeit, 04 Transparenz (Texte wie im Prototyp).

### 9. Kontakt + Footer (`id="kontakt"`)
- Hintergrund `#14161A`, Text weiß, Padding `120px 28px 70px`, `overflow: hidden`. Hintergrund-Raster 64 px, `rgba(255,255,255,.04)`, maskiert `radial-gradient(100% 80% at 20% 0%, #000, transparent 70%)`.
- **Oberer Block:** Grid `1fr 1fr`, `gap: 70px`, `align-items: end`, `padding-bottom: 70px`, `border-bottom: 1px solid rgba(255,255,255,.10)`.
  - Links: H2 `clamp(32px,3.6vw,50px)` / 1.1 „Nutzen Sie jetzt die Chance auf individuelle Beratung"; Button „Kontakt aufnehmen →" (`#0A5CFF`, Padding `18px 32px`, `radius: 14px`, 700, Shadow wie Hero-CTA) → `mailto:info@nexo-it.de`.
  - Rechts: 2×2-Grid, `gap: 20px`. Karten: Padding `24px 22px`, `radius: 16px`, `rgba(255,255,255,.06)`, Border `rgba(255,255,255,.12)`; Label 13 px uppercase `letter-spacing: .08em` `rgba(255,255,255,.55)`, Wert Sora 19 px / 600. Hover (nur die 3 Links): Hintergrund `rgba(255,255,255,.12)` + `translateY(-3px)`.
    1. Telefon — 0151 / 412 899 74 → `tel:015141289974`
    2. WhatsApp — 0151 / 412 899 74 → `https://wa.me/49015141289974`
    3. E-Mail — info@nexo-it.de → `mailto:info@nexo-it.de` (Wert 17 px)
    4. Öffnungszeiten — „Mo–Do: 08:00 – 17:00 Uhr" / „Fr: 08:00 – 15:00 Uhr" (kein Link, 15 px / 1.6)
- **Footer-Zeile:** `padding-top: 36px`, Flex `space-between`, `gap: 24px`, umbruchfähig. Links: Logo-Kachel 34×34 + Wortmarke Sora 18 px + Claim „Mit uns in die Zukunft" 14 px `rgba(255,255,255,.45)`. Rechts (`gap: 26px`, 14 px): „www.nexo-it.de", „Impressum" (`#impressum`), „Datenschutz" (`#datenschutz`) — Linkfarbe `rgba(255,255,255,.6)`, Hover `#FFF`.

## Interactions & Behavior

### Scroll-Reveal / Fly-in
Alle Elemente mit `[data-reveal]` starten unsichtbar und blenden beim Eintritt in den Viewport ein.
- Startzustand: `opacity: 0`; Transform je Richtung (`data-fly`):
  - `left` → `translateX(-90px)`
  - `right` → `translateX(90px)`
  - `y` → `translateY(60px)`
  - ohne Attribut → `translateY(26px)`
- Zielzustand: `opacity: 1; transform: none`.
- Transition: Dauer **0,85 s** für Fly-in-Karten, **0,7 s** sonst. Easing `cubic-bezier(.2,.7,.2,1)` für Opazität, `cubic-bezier(.16,.84,.24,1)` für Transform. Staffelung: `(index % 3) * 0.08s`.
- Auslöser: `IntersectionObserver`, `rootMargin: '0px 0px -8% 0px'`, `threshold: 0.01`.
- Die sechs Leistungs-Karten tragen in Reihenfolge: `left, y, right, left, y, right`.
- Der Prototyp enthält zusätzlich einen Scroll-Fallback und ein 1,5-s-Timeout, das alles einblendet. Das ist eine Absicherung gegen den Preview-Container der Prototyping-Umgebung — **im Produktionscode nicht nötig**, dort genügt der IntersectionObserver (idealerweise als reine CSS-Klasse `is-visible`).

### Header-Cursor-Spur
- 14 vorab erzeugte `<span>` (8×8 px, `border-radius: 50%`, `radial-gradient(circle, #8FB6FF, rgba(10,92,255,0) 70%)`, `position: absolute`, `pointer-events: none`, `z-index: 1`), im Header als Pool recycelt (Ring-Buffer).
- Auf `pointermove` (Throttle **28 ms**): nächster Span wird auf die Cursorposition relativ zum Header gesetzt, `scale` zufällig `0.5–1.9`, `opacity: .95`, ohne Transition. Im nächsten Frame: Transition `opacity .7s linear, transform .7s ease-out`, `opacity: 0`, `translateY(-12px)`, `scale × 2.1` → verblassende, aufsteigende Spur.
- Voraussetzung: Header `overflow: hidden`, Inhaltszeile auf `z-index: 2`.

### Hero-Glow folgt der Maus
- Auf `mousemove` (window, passive): `translate3d(x, y, 0)` mit `x = (clientX/innerWidth − .5) * 90`, `y = (clientY/innerHeight − .5) * 60`; Transition `.6s cubic-bezier(.2,.7,.2,1)`.

### Scroll-Progress + Parallax
- Fortschritt = `scrollTop / (scrollHeight − innerHeight)`, als Breite in % auf die Fixed-Leiste.
- Orbit-Grafik: `translateY(−scrollTop * 0.05)`.

### Weitere States
- Anker-Navigation mit `html { scroll-behavior: smooth }`.
- Hover-States: nur Buttons, Nav-Links, Kontaktkarten und Versprechen-Zellen. **Leistungs-Karten haben ausdrücklich keinen Hover-Effekt.**
- `prefers-reduced-motion: reduce` schaltet Reveals, Cursor-Spur, Glow-Verfolgung und Parallax ab; Inhalte werden direkt sichtbar. CSS-Keyframe-Animationen (Marquee, Spin, Float, Shine, Beams) sollten in der Umsetzung dort ebenfalls auf `animation: none` gesetzt werden.
- Keine Formulare, keine Ladezustände, kein Client-Routing. Alle Kontaktwege sind `tel:` / `mailto:` / WhatsApp-Deeplinks.

## State Management
Kein Anwendungs-State. Nur ephemere UI-Werte:
- Sichtbarkeitsflag pro Reveal-Element (im Produktionscode am besten eine CSS-Klasse).
- Scroll-Offset für Progress-Leiste und Parallax.
- Ring-Buffer-Index der Cursor-Spur.

Konfigurationsflags (im Prototyp Props, im Zielcode z. B. Build-Konstanten oder CMS-Felder):
| Name | Typ | Default | Wirkung |
|---|---|---|---|
| `accentColor` | string | `#0A5CFF` | setzt `--accent` global |
| `showMarquee` | boolean | `true` | Leistungs-Ticker ein/aus |
| `animations` | boolean | `true` | alle JS-Effekte aus |

## Design Tokens

### Farben
| Token | Wert | Verwendung |
|---|---|---|
| `--accent` | `#0A5CFF` | Primärfarbe, Buttons, Icons, Eyebrows, Ticker |
| `--accent-soft` | `#4E8CFF` | Hover, „IT" in der Wortmarke, Akzente auf dunkel |
| — | `#8FB6FF` | Cursor-Spur, Beams, Headline-Glanz |
| `--ink` | `#14161A` | dunkle Sektionen, Primärtext |
| `--ink-2` | `#1C1F26` | reserviert (aktuell ungenutzt) |
| `--paper` | `#FFFFFF` | helle Sektionen, Karten |
| `--paper-2` | `#F5F7FA` | alternierende Sektionen, Zitat, Wertekarten |
| `--line` | `rgba(20,22,26,.10)` | Borders, Hairline-Grid |
| `--muted` | `#5C6270` | Sekundärtext |
| — | `#3BE39A` | Signalgrün (Orbit-Punkt, grüner Beam) |
| — | `rgba(255,255,255,.72 / .55 / .45)` | Textstufen auf dunkel |
| — | `rgba(255,255,255,.06 / .12)` | Glasflächen und ‑borders auf dunkel |

### Typografie
- **Sora** (400/600/700/800): Headlines, Wortmarke, Zahlen, Ticker. `letter-spacing: -.02em` auf Headlines.
- **Manrope** (400/500/600/700): Fließtext, Navigation, Buttons, Listen.
- Beide via Google Fonts. Skala: 78/52/46/30/26/22/21/19/18/16.5/16/15.5/15/14/13 px. Fluid: `clamp(44px,5.4vw,78px)` (H1), `clamp(34px,3.6vw,52px)` (H2), `clamp(30px,3.4vw,46px)` / `clamp(32px,3.6vw,50px)` (CTA-/Kontakt-H2).
- Zeilenhöhen: 1.02 (H1), 1.08–1.15 (H2), 1.55–1.72 (Text).
- `text-wrap: balance` auf Headlines, `text-wrap: pretty` auf Absätzen.

### Abstände
Sektions-Padding vertikal 110–120 px (Hero 120/140). Content-Padding horizontal 28 px. Grid-Gaps 20 / 24 / 26 / 64 / 70 / 80 px. Karten-Padding 24 / 34 / 38 / 42 px. Button-Padding 10–18 px vertikal, 18–32 px horizontal.

### Radien
`999px` (Pills) · `30px` (Orbit-Kern) · `22px` (große Karten) · `20px` (Leistungs-Karten) · `16px` (Kontaktkarten) · `15px` / `13px` / `11px` / `10px` (Icon-Kacheln) · `14px` (Buttons, Badges) · `0 14px 14px 0` (Zitat).

### Schatten
- `0 6px 20px rgba(10,92,255,.45)` Logo-Kachel
- `0 8px 24px rgba(10,92,255,.35)` Header-CTA
- `0 16px 40px rgba(10,92,255,.4)` → Hover `0 22px 52px rgba(10,92,255,.55)` Primärbuttons
- `0 24px 70px rgba(10,92,255,.6)` Orbit-Kern
- `0 20px 46px rgba(255,255,255,.18)` weißer Button auf dunkel
- `0 0 14px rgba(10,92,255,.8)` Progress-Leiste
- `0 0 18px` / `0 0 16px` Glow der Orbit-Punkte

### Keyframes
| Name | Definition | Dauer |
|---|---|---|
| `nx-marquee` | `translateX(0)` → `translateX(-50%)` | 34 s linear |
| `nx-float` | 0/100 % `translateY(0)`, 50 % `translateY(-14px)` | 7 / 9 / 11 s ease-in-out |
| `nx-spin` | `rotate(0)` → `rotate(360deg)` | 46 s / 30 s reverse |
| `nx-pulse` | `scale(.6) opacity .7` → `scale(2.4) opacity 0` | 3,6 s ease-out |
| `nx-shine` | `background-position` → `-200% 0` | 7 s linear |
| `nx-beam` | `translateY(-100%)` → `translateY(400%)` | 6 / 7,4 / 8,5 s linear |
| `nx-blink` | 0/100 % `opacity .25`, 50 % `opacity 1` | 2,4 s (aktuell ungenutzt) |

## Assets
- `design/assets/logo-primary.svg`, `logo-dark.svg`, `icon.svg` — die vom Kunden bereitgestellten Nexo-IT-Logos.
- Im HTML ist das „N"-Icon zusätzlich als **Inline-SVG** eingebaut (Header, Orbit-Kern, Footer), damit es die Elternfarbe/-größe erbt:
  `viewBox="0 0 96 96"`, `path d="M30.7 69.1 L30.7 28.8 L36.5 28.8 L65.3 59.5 L65.3 28.8"`, `stroke-width="8.6"`, `fill="none"`, runde Caps/Joins, plus `circle cx="65.3" cy="28.8" r="6.7"`.
- Alle übrigen Icons (Leistungen, Vision, Mission) sind Inline-SVGs, 24 px `viewBox="0 0 24 24"`, `stroke: currentColor`, `stroke-width: 1.8`, `stroke-linecap: round`, `fill: none` — im Stil von Lucide/Feather. Beim Nachbau bevorzugt die Icon-Library des Zielcodebase verwenden (Lucide passt).
- **Keine Bitmap-Bilder, keine Fotos.** Falls Bildmaterial nachkommt, ist ein Nachschärfen des Layouts erforderlich.
- Fonts: Sora + Manrope, Google Fonts. Für die Produktion self-hosten (Performance + DSGVO).

## Responsive-Vorgaben (nicht im Prototyp umgesetzt)
- **≥ 1240 px:** wie beschrieben.
- **1024–1239 px:** Hero-Grid auf eine Spalte, Orbit-Grafik unter dem Text oder ausblenden. Leistungen auf 2 Spalten. Versprechen auf 2×2.
- **768–1023 px:** alle Zwei-Spalten-Grids einspaltig. Sticky-Spalte in „Über uns" aufheben. Sektions-Padding auf ~80 px.
- **< 768 px:** Nav als Burger-Menü (im Design nicht vorhanden — muss entworfen bzw. mit Kunden abgestimmt werden); Telefon-CTA im Header behalten. Leistungen einspaltig. Sektions-Padding ~64 px. H1 folgt dem `clamp` bis 44 px. Touch-Targets ≥ 44 px. Cursor-Spur und Glow auf Touch-Geräten deaktivieren.

## Offene Punkte für die Umsetzung
1. **Impressum & Datenschutz** fehlen inhaltlich und als Seiten — rechtlich zwingend, Texte müssen vom Kunden kommen.
2. **Mobile Navigation** (Burger) ist nicht designt.
3. **Unterseiten je Leistung** (Serverhosting, WebHosting, Webseiten, Backup, SEO, IT-Dienstleistungen) existieren auf der Altseite; der Onepager fasst sie zusammen. Falls Einzelseiten gewünscht sind, ist SEO-seitig eine Entscheidung samt Redirect-Konzept nötig.
4. **Redirects von maass-it-solution.de** auf die entsprechenden Ziele unter nexo-it.de einplanen (301), Domain-Umzug SEO-seitig begleiten.
5. **Kontaktformular** ist nicht vorgesehen — bewusst nur Direktkanäle. Bei Bedarf nachträglich designen.
6. **Meta/SEO:** Title, Description, Open-Graph-Bild, `favicon` aus `icon.svg`, `lang="de"`, strukturierte Daten (`LocalBusiness` / `Organization`) fehlen noch.
7. Texte sind **Kundentexte** — bei der Umsetzung wörtlich übernehmen, nicht umformulieren.

## Files
- `design/Nexo IT Website.dc.html` — der vollständige Prototyp (Template + Effekt-Logik). Maßgebliche Quelle für Copy, Reihenfolge und exakte Werte.
- `design/assets/logo-primary.svg`, `design/assets/logo-dark.svg`, `design/assets/icon.svg` — Logodateien.
