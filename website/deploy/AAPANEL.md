# Installation auf aaPanel

Anleitung für den Betrieb von **www.nexoit.de** auf einem aaPanel-Server.

Wichtig vorweg: Diese Webseite ist **keine PHP-Anwendung**. Sie läuft als
eigenständiger Node.js-Prozess, nginx reicht die Anfragen nur durch. Die
PHP-Version im Dialog „Add site" ist deshalb ohne Bedeutung, und eine MySQL-
Datenbank wird nicht gebraucht – die Daten liegen in einer SQLite-Datei.

Reihenfolge einhalten: SSL lässt sich erst beantragen, wenn die DNS-Einträge
stehen, und der Reverse-Proxy funktioniert erst, wenn der Node-Prozess läuft.

---

## 1. DNS vorbereiten

Beim Domain-Anbieter vier A-Records auf die Server-IP setzen:

| Name | Typ | Ziel |
|---|---|---|
| `nexoit.de` | A | Server-IP |
| `www.nexoit.de` | A | Server-IP |
| `nexo-it.de` | A | Server-IP |
| `www.nexo-it.de` | A | Server-IP |

Die beiden `nexo-it.de`-Einträge werden gebraucht, damit Let's Encrypt auch für
die Weiterleitungsdomain ein Zertifikat ausstellen kann.

Prüfen, bevor es weitergeht:

```bash
dig +short www.nexoit.de A
```

Erscheint die Server-IP, ist die Verbreitung durch. Das kann bis zu einigen
Stunden dauern.

---

## 2. Node.js und PM2 installieren

Im aaPanel: **App Store → PM2 Manager** installieren. Node.js kommt dabei mit.
Dort **Node 22 (LTS)** auswählen; mindestens Node 20.9 ist erforderlich.

Danach im Terminal die Befehle global verfügbar machen – aaPanel legt Node in
einem versionierten Pfad ab, der nicht in `PATH` steht:

```bash
NODEDIR=$(ls -d /www/server/nodejs/v22* | tail -1)
for b in node npm npx pm2; do ln -sf "$NODEDIR/bin/$b" /usr/local/bin/$b; done
node -v && npm -v && pm2 -v
```

**Arbeitsspeicher prüfen.** Der Build braucht kurzzeitig etwa 1,5 GB. Bei
Servern mit 1–2 GB RAM vorher Auslagerungsspeicher anlegen, sonst bricht der
Build kommentarlos ab:

```bash
free -m
# nur falls nötig:
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 3. Site anlegen

**Website → Add site.** Abweichend von den Voreinstellungen:

| Feld | Wert | Warum |
|---|---|---|
| Domain name | `nexoit.de` und `www.nexoit.de` | beide Zeilen |
| **Apply for SSL** | **abwählen** | erst nach dem Deployment beantragen, sonst scheitert das Anlegen |
| Website Path | `/www/wwwroot/nexoit.de` | Standard |
| FTP | Not create | Zugriff läuft über Git |
| Database | Not create | die Anwendung nutzt SQLite |
| PHP version | `Static` bzw. `Not create` | es läuft kein PHP |
| Site category | beliebig | |

Steht in der Auswahlliste kein „Static" zur Verfügung, kann PHP-84 stehen
bleiben – die PHP-Zeile wird in Schritt 7 ohnehin aus der Konfiguration
entfernt.

---

## 4. Deploy-Key einrichten und Code holen

Das Repository ist privat, der Server braucht also einen eigenen Lesezugriff.
Ein **Deploy-Key** ist dafür der richtige Weg: Er gilt nur für dieses eine
Repository und wird schreibgeschützt vergeben. Ein persönlicher Zugriffstoken
hätte dagegen Zugriff auf alle Repositories des Kontos.

```bash
ssh-keygen -t ed25519 -C "nexoit-deploy" -f /root/.ssh/nexoit_deploy -N ""
cat /root/.ssh/nexoit_deploy.pub
```

Den ausgegebenen öffentlichen Schlüssel auf GitHub eintragen:
**Repository `rigidiii/nexoit` → Settings → Deploy keys → Add deploy key**.
Titel frei wählbar, **„Allow write access" NICHT ankreuzen**.

SSH-Zugang für diesen Schlüssel festlegen:

```bash
cat >> /root/.ssh/config <<'EOF'

Host github.com-nexoit
  HostName github.com
  User git
  IdentityFile /root/.ssh/nexoit_deploy
  IdentitiesOnly yes
EOF
chmod 600 /root/.ssh/config
ssh -T git@github.com-nexoit    # erwartet: "You've successfully authenticated"
```

Klonen. aaPanel hat im Website-Verzeichnis Platzhalterdateien abgelegt, die
vorher weg müssen – `git clone` verlangt ein leeres Ziel:

```bash
rm -rf /www/wwwroot/nexoit.de
git clone git@github.com-nexoit:rigidiii/nexoit.git /www/wwwroot/nexoit.de
ls /www/wwwroot/nexoit.de     # erwartet: website  design_handoff_nexo_it_website
```

Die Anwendung liegt also unter `/www/wwwroot/nexoit.de/website`.

---

## 5. Konfiguration anlegen

Die Datenbank kommt bewusst **außerhalb** des Website-Verzeichnisses zu liegen.
Sollte der Reverse-Proxy irgendwann versehentlich abgeschaltet werden und nginx
wieder Dateien direkt ausliefern, sind Kontaktanfragen und Besucherdaten so
trotzdem nicht über das Netz erreichbar.

```bash
mkdir -p /www/nexoit-data && chmod 700 /www/nexoit-data

cd /www/wwwroot/nexoit.de/website
cp .env.example .env

# Schlüssel erzeugen und notieren
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

nano .env
```

Inhalt der `.env`:

```ini
SITE_URL=https://www.nexoit.de
APP_SECRET=<der eben erzeugte Schlüssel>
DATABASE_PATH=/www/nexoit-data/nexo.db
ADMIN_USERNAME=admin
ADMIN_INITIAL_PASSWORD=<mindestens 12 Zeichen>
TRUST_PROXY=1
```

`TRUST_PROXY=1` ist hier zwingend. Ohne diesen Wert ignoriert die Anwendung den
`X-Forwarded-For`-Header und zählt jeden Besuch auf die IP des nginx – die
Statistik würde dann dauerhaft genau einen Besucher anzeigen.

Rechte einschränken, damit die Zugangsdaten nur für root lesbar sind:

```bash
chmod 600 .env
```

**`APP_SECRET` niemals nachträglich ändern.** Damit ist das gespeicherte
SMTP-Passwort verschlüsselt; nach einer Änderung muss es im Verwaltungsbereich
neu eingegeben werden.

---

## 6. Abhängigkeiten installieren und bauen

> **Reihenfolge beachten:** Die `.env` aus Schritt 5 muss vor dem Build stehen.
> Canonical-URLs und Open-Graph-Angaben der statischen Seiten werden beim Build
> festgeschrieben – ein falscher `SITE_URL` bleibt sonst bis zum nächsten Build
> bestehen. Steht dort etwas mit `localhost`, gibt der Build eine Warnung aus.
> (`robots.txt` und `sitemap.xml` lesen den Wert dagegen bei jedem Abruf neu.)

```bash
cd /www/wwwroot/nexoit.de/website
npm ci
npm run build
```

`better-sqlite3` bringt fertige Binärdateien mit. Nur falls die Installation
mit einem Kompilierfehler abbricht, fehlen die Build-Werkzeuge:

```bash
# Debian / Ubuntu
apt-get install -y python3 make g++
# AlmaLinux / Rocky / CentOS
yum install -y python3 gcc-c++ make
```

Bricht der Build mit `JavaScript heap out of memory` ab, ist der
Arbeitsspeicher zu knapp – Auslagerungsspeicher aus Schritt 2 anlegen oder:

```bash
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

Optional nach erfolgreichem Build Platz sparen; die Werkzeuge für den Build
werden zur Laufzeit nicht mehr gebraucht:

```bash
npm prune --omit=dev
```

---

## 7. Anwendung als Dienst starten

```bash
cd /www/wwwroot/nexoit.de/website
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root      # Ausgabezeile ausführen, falls verlangt
```

Prüfen, ob der Prozess antwortet:

```bash
pm2 status
curl -I http://127.0.0.1:3000               # erwartet: HTTP/1.1 200 OK
```

Der Server lauscht ausschließlich auf `127.0.0.1`. Aus dem Internet ist Port
3000 damit nicht erreichbar, unabhängig von der Firewall.

---

## 8. Reverse-Proxy einrichten

**Website → nexoit.de → Konfigurationsdatei** öffnen und nach der Vorlage in
[`nginx-nexoit.conf`](nginx-nexoit.conf) anpassen. Kurzfassung:

1. Die beiden `location ~ .*\.(gif|jpg|...)$` und `location ~ .*\.(js|css)?$`
   **löschen**. Sie liefern statische Dateien von der Festplatte aus – bei
   dieser Anwendung liegt dort aber nichts. Bleiben sie stehen, antwortet nginx
   auf `/_next/static/...` mit 404 und die Seite erscheint ohne Gestaltung.
   Das ist mit Abstand der häufigste Fehler bei diesem Setup.
2. Die Zeile `include enable-php-84.conf;` löschen.
3. Den `location ^~ / { proxy_pass ... }`-Block aus der Vorlage einsetzen.

Danach prüfen und übernehmen:

```bash
nginx -t && nginx -s reload
```

Alternativ geht auch **Website → nexoit.de → Reverse proxy** über die
Oberfläche (Ziel `http://127.0.0.1:3000`, **Cache aus**). Die beiden
Regex-Blöcke aus Punkt 1 müssen aber auch dann von Hand verschwinden.

---

## 9. SSL beantragen

**Website → nexoit.de → SSL → Let's Encrypt**, beide Domains auswählen,
beantragen. Anschließend **„Force HTTPS" einschalten**.

Erst danach steht die Seite unter <https://www.nexoit.de>.

---

## 10. Weiterleitung von nexo-it.de

Zweite Site anlegen für `nexo-it.de` und `www.nexo-it.de` (wieder ohne PHP,
ohne Datenbank), dafür SSL beantragen und die Konfiguration durch
[`nginx-redirect-nexo-it.conf`](nginx-redirect-nexo-it.conf) ersetzen. Damit
landen alle Aufrufe der alten Schreibweise per 301 auf der Hauptdomain, unter
Beibehaltung des Pfades.

Prüfen:

```bash
curl -sI https://nexo-it.de/impressum | grep -i "^location"
# erwartet: location: https://www.nexoit.de/impressum
```

---

## 11. Nach dem Livegang

Diese Punkte sind noch offen und gehören erledigt, bevor die Seite beworben wird:

1. **Impressum und Datenschutzerklärung ausfüllen.** Beide Seiten sind
   Vorlagen; die Lücken sind im Browser gelb hinterlegt. Ein unvollständiges
   Impressum ist abmahnfähig.
2. **E-Mail-Adresse prüfen.** Im Seitentext steht jetzt `info@nexoit.de`.
   Existiert dieses Postfach nicht, in
   `src/content/site.ts` die Zeile `email:` anpassen (eine Zeile, danach neu
   bauen).
3. **SMTP hinterlegen** unter `/admin/smtp`, dann „Verbindung prüfen" und
   „Testmail senden".
4. **Demo-Statistik löschen:** Verwaltung → Einstellungen → „Alle
   Statistikdaten löschen". Im Repository liegen Beispieldaten aus der
   Entwicklung.
5. **Admin-Passwort ändern** unter `/admin/einstellungen`. Danach wirkt
   `ADMIN_INITIAL_PASSWORD` nicht mehr.
6. Kontrolle: `https://www.nexoit.de/robots.txt` und `/sitemap.xml` müssen die
   richtige Domain nennen. Tun sie das nicht, stimmt `SITE_URL` nicht.

---

## 12. Aktualisieren

```bash
cd /www/wwwroot/nexoit.de
git pull
cd website
npm ci
npm run build
pm2 reload nexoit-web
```

`pm2 reload` statt `restart`: Der alte Prozess bleibt stehen, bis der neue
Anfragen annimmt – dadurch entsteht keine Lücke.

---

## 13. Sicherung

Die gesamte Anwendung ist aus dem Repository wiederherstellbar. Nicht
wiederherstellbar sind zwei Dinge, die deshalb ins Backup gehören:

| Was | Wo | Inhalt |
|---|---|---|
| Datenbank | `/www/nexoit-data/nexo.db` | Kontaktanfragen, Statistik, SMTP-Konfiguration |
| Konfiguration | `/www/wwwroot/nexoit.de/website/.env` | `APP_SECRET`, ohne den das SMTP-Passwort unlesbar wird |

Tägliche Sicherung einrichten (**Cron → Add task → Shell script**):

```bash
mkdir -p /www/backup/nexoit
sqlite3 /www/nexoit-data/nexo.db ".backup '/www/backup/nexoit/nexo-$(date +\%F).db'"
find /www/backup/nexoit -name 'nexo-*.db' -mtime +30 -delete
```

`.backup` statt einer Dateikopie: Bei laufendem Betrieb wäre eine einfache
Kopie inkonsistent, weil parallel geschrieben werden kann.

---

## 14. Wenn etwas nicht läuft

| Symptom | Ursache | Abhilfe |
|---|---|---|
| **502 Bad Gateway** | Node-Prozess läuft nicht | `pm2 status`, `pm2 logs nexoit-web --lines 50` |
| **Seite ohne Gestaltung, `/_next/...` liefert 404** | Regex-Blöcke für js/css/Bilder noch in der nginx-Konfiguration | Schritt 8, Punkt 1 |
| **`listen EADDRNOTAVAIL`** | Linux setzt die Umgebungsvariable `HOSTNAME` auf den Rechnernamen, Next.js versucht darauf zu lauschen | Wird durch `-H 127.0.0.1` in `ecosystem.config.cjs` verhindert – Datei nicht ändern |
| **Statistik zeigt dauerhaft 1 Besucher** | `TRUST_PROXY` fehlt oder nginx sendet `X-Forwarded-For` nicht | Schritt 5 und 8 |
| **`APP_SECRET fehlt oder ist zu kurz`** beim Start | `.env` nicht gefunden oder Wert zu kurz | Datei muss in `/www/wwwroot/nexoit.de/website/.env` liegen, mindestens 32 Zeichen |
| **SMTP-Passwort plötzlich falsch** | `APP_SECRET` wurde geändert | Passwort unter `/admin/smtp` neu eingeben |
| **`SQLITE_CANTOPEN`** | Verzeichnis fehlt oder ist schreibgeschützt | `mkdir -p /www/nexoit-data && chmod 700 /www/nexoit-data` |
| **Let's Encrypt schlägt fehl** | DNS zeigt noch nicht auf den Server | `dig +short www.nexoit.de A` prüfen, dann erneut versuchen |
| **Build bricht ohne Meldung ab** | Arbeitsspeicher erschöpft | Auslagerungsspeicher, Schritt 2 |

Laufende Ausgabe der Anwendung:

```bash
pm2 logs nexoit-web
tail -f /www/wwwlogs/nexoit.de.error.log
```
