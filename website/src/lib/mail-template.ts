import 'server-only';

import { company } from '@/content/site';

/**
 * HTML-Gerüst für die versendeten E-Mails.
 *
 * E-Mail-Programme können kein modernes CSS. Deshalb hier bewusst altmodisch:
 * verschachtelte Tabellen statt Flexbox oder Grid, alle Angaben als
 * `style`-Attribut direkt am Element, keine externen Schriften, keine
 * Kurzschreibweisen. Outlook rendert mit der Word-Engine und ignoriert fast
 * alles andere.
 *
 * Jede Mail geht zusätzlich als reiner Text hinaus. Wer HTML abgeschaltet hat
 * oder einen Textclient nutzt, bekommt eine vollwertige Fassung – und
 * Spamfilter bewerten Nur-HTML-Mails schlechter.
 */

/** Verweis auf das eingebettete Logo. Siehe `logoAttachment` in mailer.ts. */
export const LOGO_CID = 'nexoit-logo';

const FARBE = {
  ink: '#14161A',
  accent: '#0A5CFF',
  accentSoft: '#4E8CFF',
  paper: '#FFFFFF',
  paper2: '#F5F7FA',
  muted: '#5C6270',
  line: '#E4E8EF',
} as const;

const SCHRIFT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Maskiert Zeichen, die im HTML eine Sonderbedeutung hätten. */
function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wandelt frei konfigurierten Fliesstext in Absätze um.
 * Leerzeile trennt Absätze, einfacher Umbruch wird zu `<br>`.
 */
function absaetze(text: string, farbe: string = FARBE.ink): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:${farbe};">` +
        escape(block).replace(/\n/g, '<br>') +
        `</p>`,
    )
    .join('');
}

/** Hervorgehobener Block – für die zitierte Nachricht des Absenders. */
function zitat(text: string): string {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">` +
    `<tr><td style="background-color:${FARBE.paper2};border-left:3px solid ${FARBE.accent};padding:16px 18px;">` +
    `<div style="font-size:15px;line-height:1.65;color:${FARBE.ink};">` +
    escape(text).replace(/\n/g, '<br>') +
    `</div></td></tr></table>`
  );
}

/** Zweispaltige Auflistung – für die Angaben aus dem Kontaktformular. */
function angaben(zeilen: Array<[string, string]>): string {
  const inhalt = zeilen
    .map(
      ([bezeichnung, wert]) =>
        `<tr>` +
        `<td style="padding:7px 14px 7px 0;font-size:13px;color:${FARBE.muted};white-space:nowrap;vertical-align:top;">${escape(bezeichnung)}</td>` +
        `<td style="padding:7px 0;font-size:15px;color:${FARBE.ink};vertical-align:top;">${escape(wert)}</td>` +
        `</tr>`,
    )
    .join('');

  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">` +
    inhalt +
    `</table>`
  );
}

export interface MailInhalt {
  /** Vorschautext in der Nachrichtenliste, noch vor dem Öffnen sichtbar. */
  vorschau: string;
  /** Überschrift im Inhaltsbereich. */
  titel: string;
  /** Fertiges HTML des Hauptteils – gebaut aus den Helfern oben. */
  koerper: string;
  /** Optionaler Abbinder unterhalb des Hauptteils, kleiner gesetzt. */
  signatur?: string;
}

/**
 * Baut die vollständige HTML-Mail.
 *
 * Aufbau: dunkles Kopfband mit Zeichen und Wortmarke, weisser Inhaltsbereich,
 * heller Fussbereich mit den Kontaktwegen.
 */
export function mailHtml({ vorschau, titel, koerper, signatur }: MailInhalt): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Verhindert, dass Programme mit dunklem Erscheinungsbild die Farben
     eigenmächtig umkehren und das Kopfband unlesbar machen. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escape(titel)}</title>
</head>
<body style="margin:0;padding:0;background-color:${FARBE.paper2};">

<!-- Vorschauzeile: in der Nachrichtenliste sichtbar, in der Mail selbst nicht.
     Die Leerzeichen dahinter verhindern, dass Programme den folgenden Text
     anhängen. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(vorschau)}</div>
<div style="display:none;max-height:0;overflow:hidden;">${'&#8203;&nbsp;'.repeat(60)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FARBE.paper2};">
<tr>
<td align="center" style="padding:28px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:${FARBE.paper};border:1px solid ${FARBE.line};border-radius:14px;overflow:hidden;">

    <!-- Kopfband -->
    <tr>
    <td style="background-color:${FARBE.ink};padding:22px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right:13px;vertical-align:middle;">
          <img src="cid:${LOGO_CID}" width="44" height="44" alt="Nexo IT"
               style="display:block;width:44px;height:44px;border:0;border-radius:12px;">
        </td>
        <td style="vertical-align:middle;">
          <span style="font-family:${SCHRIFT};font-size:21px;font-weight:600;color:#FFFFFF;letter-spacing:-0.3px;">Nexo</span><span style="font-family:${SCHRIFT};font-size:21px;font-weight:700;color:${FARBE.accentSoft};letter-spacing:-0.3px;">IT</span>
          <div style="font-family:${SCHRIFT};font-size:12px;color:rgba(255,255,255,0.55);padding-top:2px;">${escape(company.claim)}</div>
        </td>
      </tr>
      </table>
    </td>
    </tr>

    <!-- Inhalt -->
    <tr>
    <td style="padding:30px 28px 8px 28px;font-family:${SCHRIFT};">
      <h1 style="margin:0 0 20px 0;font-size:20px;line-height:1.3;font-weight:700;color:${FARBE.ink};">${escape(titel)}</h1>
      ${koerper}
    </td>
    </tr>

    ${
      signatur
        ? `<tr><td style="padding:0 28px 26px 28px;font-family:${SCHRIFT};">
             <div style="border-top:1px solid ${FARBE.line};padding-top:16px;font-size:13px;line-height:1.6;color:${FARBE.muted};">${escape(signatur).replace(/\n/g, '<br>')}</div>
           </td></tr>`
        : `<tr><td style="padding:0 0 12px 0;"></td></tr>`
    }

    <!-- Fussbereich -->
    <tr>
    <td style="background-color:${FARBE.paper2};border-top:1px solid ${FARBE.line};padding:20px 28px;font-family:${SCHRIFT};">
      <div style="font-size:13px;line-height:1.7;color:${FARBE.muted};">
        <a href="https://${company.domain}" style="color:${FARBE.accent};text-decoration:none;font-weight:600;">${escape(company.domain)}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${company.email}" style="color:${FARBE.accent};text-decoration:none;">${escape(company.email)}</a>
        &nbsp;·&nbsp;
        <a href="${company.phoneHref}" style="color:${FARBE.muted};text-decoration:none;">${escape(company.phoneDisplay)}</a>
      </div>
      <div style="font-size:12px;line-height:1.7;color:${FARBE.muted};padding-top:8px;">
        ${escape(company.hours[0])} &nbsp;·&nbsp; ${escape(company.hours[1])}
      </div>
    </td>
    </tr>

  </table>

</td>
</tr>
</table>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Fertige Bausteine für die drei Mailarten
// ---------------------------------------------------------------------------

/**
 * Eingangsbestätigung an den Absender.
 *
 * Der Text stammt aus den Einstellungen und bleibt frei bearbeitbar. Für die
 * HTML-Fassung wird er an zwei Stellen aufgeteilt:
 *   - am Platzhalter `{{message}}`: davor und danach werden Absätze, die
 *     Nachricht selbst wird als hervorgehobener Block gesetzt
 *   - an einer Zeile, die nur aus `--` besteht: alles danach wandert als
 *     Abbinder unter den Hauptteil
 * Fehlt der Platzhalter, wird der gesamte Text einfach zu Absätzen.
 */
export function autoReplyHtml(vorlage: string, ersetzungen: Record<string, string>): string {
  const einsetzen = (t: string) =>
    Object.entries(ersetzungen).reduce((acc, [k, v]) => acc.split(`{{${k}}}`).join(v), t);

  const [rohHaupt, rohSignatur] = vorlage.split(/\n--\n/);
  const [vor, nach = ''] = rohHaupt.split('{{message}}');

  const koerper =
    absaetze(einsetzen(vor)) +
    (vorlage.includes('{{message}}') ? zitat(ersetzungen.message ?? '') : '') +
    absaetze(einsetzen(nach));

  return mailHtml({
    vorschau: 'Wir haben Ihre Anfrage erhalten und melden uns in Kürze.',
    titel: 'Ihre Anfrage ist angekommen',
    koerper,
    signatur: rohSignatur ? einsetzen(rohSignatur).trim() : undefined,
  });
}

/** Benachrichtigung an das eigene Postfach über eine neue Anfrage. */
export function anfrageHtml(daten: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  const koerper =
    angaben([
      ['Name', daten.name],
      ['E-Mail', daten.email],
      ['Telefon', daten.phone || '–'],
      ['Betreff', daten.subject],
      ['Eingegangen', new Date().toLocaleString('de-DE')],
    ]) +
    `<p style="margin:0 0 10px 0;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${FARBE.muted};">Nachricht</p>` +
    zitat(daten.message);

  return mailHtml({
    vorschau: `${daten.name}: ${daten.subject}`,
    titel: 'Neue Anfrage über das Kontaktformular',
    koerper,
    signatur: `Antworten Sie einfach auf diese Mail – die Antwort geht direkt an ${daten.email}.`,
  });
}

/** Testmail aus dem Verwaltungsbereich. */
export function testMailHtml(beschreibung: string): string {
  return mailHtml({
    vorschau: 'Der SMTP-Versand der Webseite funktioniert.',
    titel: 'SMTP-Versand funktioniert',
    koerper:
      absaetze(
        'Diese Testmail wurde im Verwaltungsbereich der Webseite ausgelöst.\nDass sie angekommen ist, heisst: Das Kontaktformular kann Anfragen zustellen.',
      ) + zitat(beschreibung),
  });
}
