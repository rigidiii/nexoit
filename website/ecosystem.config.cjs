/**
 * PM2-Konfiguration für den Betrieb hinter nginx (aaPanel).
 *
 * Start:    pm2 start ecosystem.config.cjs
 * Neustart: pm2 reload nexoit-web
 * Log:      pm2 logs nexoit-web
 *
 * Bewusst `instances: 1` und `fork`-Modus statt Cluster: Die Anwendung
 * schreibt in eine SQLite-Datei. WAL verkraftet zwar mehrere Prozesse, aber
 * ein einzelner Prozess vermeidet Schreibkonflikte vollständig und reicht für
 * die Last einer Firmenwebseite um Größenordnungen aus.
 */
module.exports = {
  apps: [
    {
      name: 'nexoit-web',
      cwd: '/www/wwwroot/nexoit.de/website',

      // Direkt die Next-Binärdatei starten statt über npm – so ist der
      // Prozessbaum flach und `pm2 reload` beendet wirklich den Server.
      script: 'node_modules/next/dist/bin/next',
      // -H 127.0.0.1: nur über nginx erreichbar, nicht direkt aus dem Netz.
      args: 'start -H 127.0.0.1 -p 3000',

      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 5000,

      env: {
        NODE_ENV: 'production',
        // Die übrigen Werte kommen aus der Datei .env im Projektverzeichnis,
        // die Next.js beim Start selbst einliest. Zugangsdaten gehören nicht
        // hierher – diese Datei liegt im Repository.
      },

      error_file: '/www/wwwlogs/nexoit-web.error.log',
      out_file: '/www/wwwlogs/nexoit-web.out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
