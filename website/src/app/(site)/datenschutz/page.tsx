import type { Metadata } from 'next';
import Link from 'next/link';

import { company } from '@/content/site';
import { FooterStrip } from '@/components/Footer';
import CookieSettingsLink from '@/components/CookieSettingsLink';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description:
    'Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO auf www.nexoit.de.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/datenschutz' },
};

/**
 * Datenschutzerklärung.
 *
 * Beschreibt exakt die Verarbeitungen, die diese Webseite tatsächlich
 * durchführt: Server-Logs, Kontaktformular per SMTP, cookielose
 * Reichweitenmessung, Einwilligungs-Cookie, selbst gehostete Schriften.
 * Gelb markierte Kästen müssen vor dem Livegang ausgefüllt werden.
 */
export default function DatenschutzPage() {
  return (
    <>
      <article className="nx-legal">
        <div className="nx-legal__inner">
          <Link href="/#top" className="nx-legal__back">
            <span aria-hidden="true">←</span> Zurück zur Startseite
          </Link>

          <h1>Datenschutzerklärung</h1>
          <p className="nx-legal__intro">
            Wir freuen uns über Ihr Interesse an unserem Unternehmen. Der Schutz Ihrer
            personenbezogenen Daten ist uns wichtig. Nachfolgend informieren wir Sie gemäß Art. 13
            und 14 der Datenschutz-Grundverordnung (DSGVO) darüber, welche Daten wir beim Besuch
            dieser Webseite verarbeiten.
          </p>

          <h2>1. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung auf dieser Webseite ist:</p>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> vollständiger Firmenname mit Rechtsform, Anschrift und
            vertretungsberechtigte Person – identisch mit den Angaben im{' '}
            <Link href="/impressum">Impressum</Link>.
          </p>
          <p>
            {company.legalName}
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ Ort]
            <br />
            Telefon: <a href={company.phoneHref}>{company.phoneDisplay}</a>
            <br />
            E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
          </p>

          <h2>2. Datenschutzbeauftragter</h2>
          <p className="nx-todo">
            <strong>Prüfen:</strong> Ein Datenschutzbeauftragter ist nach § 38 BDSG erst ab
            20 Personen erforderlich, die ständig mit automatisierter Verarbeitung
            personenbezogener Daten beschäftigt sind – oder wenn eine
            Datenschutz-Folgenabschätzung nötig ist. Trifft das nicht zu, kann dieser Abschnitt
            gestrichen werden. Andernfalls Name und Kontaktdaten eintragen.
          </p>

          <h2>3. Aufruf der Webseite und Server-Logfiles</h2>
          <p>
            Beim Aufruf dieser Webseite übermittelt Ihr Browser technisch notwendige Daten, die der
            Provider unseres Servers in sogenannten Logfiles speichert. Das sind:
          </p>
          <ul>
            <li>aufgerufene Adresse (URL) und Zeitpunkt des Zugriffs</li>
            <li>übertragene Datenmenge und Meldung über den erfolgreichen Abruf</li>
            <li>Browsertyp und Browserversion, verwendetes Betriebssystem</li>
            <li>Referrer-URL (die zuvor besuchte Seite)</li>
            <li>IP-Adresse</li>
          </ul>
          <p>
            Diese Daten sind erforderlich, um die Webseite auszuliefern, ihre Stabilität und
            Sicherheit zu gewährleisten und Angriffe abzuwehren. Rechtsgrundlage ist unser
            berechtigtes Interesse an einem sicheren und störungsfreien Betrieb (Art. 6 Abs. 1
            lit. f DSGVO). Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht
            statt.
          </p>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> Speicherdauer der Logfiles beim eingesetzten Hoster
            eintragen (üblich sind 7 bis 30 Tage) sowie Name und Anschrift des Hosters. Mit dem
            Hoster ist ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO abzuschließen.
          </p>

          <h2>4. Verschlüsselung</h2>
          <p>
            Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine
            verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers mit
            „https://" beginnt. Daten, die Sie an uns übermitteln, können dadurch nicht von Dritten
            mitgelesen werden.
          </p>

          <h2>5. Kontaktaufnahme</h2>

          <h3>5.1 Kontaktformular</h3>
          <p>
            Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir die von Ihnen
            angegebenen Daten – Name, E-Mail-Adresse, optional Telefonnummer, Betreff und Ihre
            Nachricht – ausschließlich zur Bearbeitung Ihrer Anfrage und für den Fall von
            Anschlussfragen.
          </p>
          <p>
            Ihre Nachricht wird über einen von uns betriebenen bzw. beauftragten E-Mail-Server
            (SMTP) an unser Postfach zugestellt und zusätzlich in einer Datenbank auf unserem Server
            gespeichert, damit keine Anfrage verloren geht. Sofern aktiviert, erhalten Sie eine
            automatische Eingangsbestätigung an die von Ihnen angegebene Adresse.
          </p>
          <p>
            Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie über die
            Checkbox im Formular erteilen, sowie – bei Anfragen mit Bezug zu einem Vertrag oder
            dessen Anbahnung – Art. 6 Abs. 1 lit. b DSGVO. Ihre Einwilligung können Sie jederzeit
            formlos per E-Mail an <a href={`mailto:${company.email}`}>{company.email}</a>{' '}
            widerrufen; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt.
          </p>
          <p>
            Zum Schutz vor automatisiert versendetem Spam prüfen wir beim Absenden, ob ein für
            Menschen unsichtbares Feld ausgefüllt wurde, wie viel Zeit zwischen Aufruf und Absenden
            vergangen ist, und wie viele Anfragen zuletzt von Ihrem Anschluss kamen. Für die letzte
            Prüfung speichern wir keine IP-Adresse, sondern nur einen mit einem täglich wechselnden
            Schlüssel gebildeten, nicht umkehrbaren Prüfwert. Wir setzen dafür bewusst keine
            externen Dienste wie Google reCAPTCHA ein.
          </p>
          <p>
            Wir löschen die Anfragen, sobald sie abschließend bearbeitet sind und keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen. Anfragen mit geschäftlichem Bezug
            unterliegen den handels- und steuerrechtlichen Aufbewahrungsfristen (in der Regel 6
            bzw. 10 Jahre).
          </p>

          <h3>5.2 Telefon und E-Mail</h3>
          <p>
            Wenn Sie uns anrufen oder direkt eine E-Mail schreiben, verarbeiten wir Ihre Angaben
            ebenfalls nur zur Bearbeitung Ihres Anliegens. Rechtsgrundlage ist Art. 6 Abs. 1
            lit. b bzw. lit. f DSGVO.
          </p>

          <h3>5.3 WhatsApp</h3>
          <p>
            Auf unserer Seite finden Sie einen Link zu WhatsApp. Erst wenn Sie diesen Link aktiv
            anklicken, wird eine Verbindung zu den Servern von WhatsApp Ireland Limited bzw. Meta
            Platforms aufgebaut und Ihre Telefonnummer sowie Metadaten der Kommunikation werden dort
            verarbeitet. Dabei kann es zu einer Übermittlung in die USA kommen. Vor dem Klick
            werden keine Daten an WhatsApp übertragen. Wenn Sie das vermeiden möchten, nutzen Sie
            bitte Telefon, E-Mail oder das Kontaktformular. Informationen zum Datenschutz bei
            WhatsApp finden Sie unter{' '}
            <a href="https://www.whatsapp.com/legal/privacy-policy-eea" target="_blank" rel="noopener noreferrer">
              whatsapp.com/legal/privacy-policy-eea
            </a>
            .
          </p>

          <h2>6. Cookies</h2>
          <p>
            Diese Webseite setzt <strong>keine Werbe-, Marketing- oder Tracking-Cookies</strong> und
            bindet keine Dienste von Drittanbietern ein. Gesetzt werden ausschließlich technisch
            notwendige Cookies im Sinne des § 25 Abs. 2 Nr. 2 TDDDG, für die keine Einwilligung
            erforderlich ist:
          </p>
          <ul>
            <li>
              <strong>nexo_consent</strong> – speichert Ihre Auswahl in den
              Datenschutz-Einstellungen, damit wir Sie nicht bei jedem Aufruf erneut fragen.
              Laufzeit: 12 Monate.
            </li>
            <li>
              <strong>nexo_admin_session</strong> – wird ausschließlich im internen
              Verwaltungsbereich gesetzt und hält die Anmeldung. Für Besucherinnen und Besucher der
              öffentlichen Seite entsteht dieses Cookie nicht. Laufzeit: 8 Stunden.
            </li>
          </ul>
          <p>
            Ihre Einstellungen können Sie jederzeit ändern:{' '}
            <span className="nx-footer__links" style={{ display: 'inline' }}>
              <CookieSettingsLink />
            </span>
          </p>

          <h2>7. Reichweitenmessung</h2>
          <p>
            Um zu verstehen, welche Inhalte gefragt sind, zählen wir Seitenaufrufe mit einer
            eigenen, auf unserem Server betriebenen Lösung. Es kommen{' '}
            <strong>keine Cookies</strong> zum Einsatz, es wird nichts auf Ihrem Endgerät
            gespeichert oder ausgelesen, und es werden keine Daten an Dritte übermittelt.
            Insbesondere nutzen wir kein Google Analytics.
          </p>
          <p>Gespeichert wird pro Aufruf:</p>
          <ul>
            <li>Zeitpunkt sowie die aufgerufene Seite unserer Webseite</li>
            <li>der Domainname der verweisenden Seite (ohne Pfad und Suchbegriffe)</li>
            <li>eine grobe Einordnung von Gerätetyp, Browser und Betriebssystem</li>
            <li>die Verweildauer auf der Seite</li>
            <li>
              ein nicht umkehrbarer Prüfwert, der aus IP-Adresse und Browserkennung mit einem{' '}
              <strong>täglich wechselnden Zufallsschlüssel</strong> berechnet wird
            </li>
          </ul>
          <p>
            Ihre IP-Adresse wird zu keinem Zeitpunkt gespeichert. Da sich der Zufallsschlüssel
            täglich ändert und der alte Schlüssel gelöscht wird, ist eine Wiedererkennung über den
            Tag hinaus technisch ausgeschlossen. Ein Personenbezug lässt sich daraus nicht
            herstellen.
          </p>
          <p>
            Rechtsgrundlage ist unser berechtigtes Interesse an einer bedarfsgerechten Gestaltung
            unseres Angebots (Art. 6 Abs. 1 lit. f DSGVO). Da kein Zugriff auf Informationen in
            Ihrem Endgerät erfolgt, ist § 25 TDDDG nicht einschlägig.
          </p>
          <p>
            <strong>Ihr Widerspruchsrecht:</strong> Sie können der Messung jederzeit mit Wirkung für
            die Zukunft widersprechen – über die Datenschutz-Einstellungen (Schaltfläche oben bzw.
            im Seitenfuß). Wir respektieren zusätzlich automatisch die Signale „Do Not Track" und
            „Global Privacy Control" Ihres Browsers: ist eines davon aktiv, findet keine Messung
            statt.
          </p>
          <p className="nx-todo">
            <strong>Prüfen:</strong> Die Aufbewahrungsdauer der Messdaten ist im Verwaltungsbereich
            einstellbar (Voreinstellung: 180 Tage). Bitte den hier genannten Wert an die
            tatsächliche Einstellung anpassen.
          </p>
          <p>Ältere Messdaten werden nach 180 Tagen automatisch gelöscht.</p>

          <h2>8. Schriftarten</h2>
          <p>
            Wir verwenden die Schriftarten „Sora" und „Manrope". Diese werden ausschließlich von
            unserem eigenen Server geladen. Eine Verbindung zu Servern von Google oder anderen
            Anbietern findet dabei nicht statt, es wird keine IP-Adresse an Dritte übermittelt.
          </p>

          <h2>9. Empfänger der Daten</h2>
          <p>
            Eine Weitergabe Ihrer Daten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung
            erforderlich ist, wir gesetzlich dazu verpflichtet sind oder Sie eingewilligt haben.
            Dienstleister, die in unserem Auftrag Daten verarbeiten (insbesondere Hosting- und
            E-Mail-Provider), sind vertraglich nach Art. 28 DSGVO gebunden.
          </p>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> Auflistung der eingesetzten Auftragsverarbeiter –
            mindestens Hosting-Anbieter und E-Mail-/SMTP-Anbieter mit Firmenname und Sitz. Sofern
            ein Anbieter außerhalb der EU/des EWR sitzt, sind zusätzlich die Garantien nach
            Art. 44 ff. DSGVO zu nennen (z. B. EU-Standardvertragsklauseln, EU-US Data Privacy
            Framework).
          </p>

          <h2>10. Speicherdauer</h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck
            erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben. Anschließend
            werden die Daten gelöscht oder anonymisiert.
          </p>

          <h2>11. Ihre Rechte</h2>
          <p>Ihnen stehen gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten zu:</p>
          <ul>
            <li>Auskunft über die verarbeiteten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>
              Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)
            </li>
            <li>
              Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3
              DSGVO)
            </li>
          </ul>
          <p>
            Zur Ausübung genügt eine formlose Nachricht an{' '}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>

          <h2>12. Beschwerderecht bei der Aufsichtsbehörde</h2>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
            Ihrer personenbezogenen Daten zu beschweren (Art. 77 DSGVO).
          </p>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> zuständige Landesdatenschutzbehörde nach dem Firmensitz
            eintragen (Name, Anschrift, Webseite).
          </p>

          <h2>13. Keine automatisierte Entscheidungsfindung</h2>
          <p>
            Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art. 22
            DSGVO findet nicht statt.
          </p>

          <h2>14. Änderungen dieser Erklärung</h2>
          <p>
            Wir passen diese Datenschutzerklärung an, sobald Änderungen der Rechtslage oder unserer
            Verarbeitungen dies erfordern. Es gilt jeweils die hier veröffentlichte Fassung.
          </p>

          <div className="nx-legal__meta">
            <p>
              Hinweis zur Vorlage: Diese Datenschutzerklärung beschreibt die tatsächlich
              umgesetzten technischen Verarbeitungen dieser Webseite. Sie ersetzt keine
              Rechtsberatung – bitte lassen Sie sie vor dem Livegang zusammen mit dem{' '}
              <Link href="/impressum">Impressum</Link> anwaltlich prüfen und ergänzen Sie die
              markierten Angaben.
            </p>
          </div>
        </div>
      </article>
      <FooterStrip />
    </>
  );
}
