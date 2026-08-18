import type { Metadata } from 'next';
import Link from 'next/link';

import { company } from '@/content/site';
import { FooterStrip } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Anbieterkennzeichnung nach § 5 DDG und § 18 Abs. 2 MStV.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/impressum' },
};

/**
 * Impressum.
 *
 * ACHTUNG: Vorlage. Die mit einem gelben Kasten markierten Stellen müssen vor
 * dem Livegang durch die tatsächlichen Angaben ersetzt werden – ein
 * unvollständiges Impressum ist abmahnfähig. Rechtsverbindliche Prüfung durch
 * einen Rechtsanwalt wird empfohlen.
 */
export default function ImpressumPage() {
  return (
    <>
      <article className="nx-legal">
        <div className="nx-legal__inner">
          <Link href="/#top" className="nx-legal__back">
            <span aria-hidden="true">←</span> Zurück zur Startseite
          </Link>

          <h1>Impressum</h1>
          <p className="nx-legal__intro">
            Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag
            (MStV).
          </p>

          <h2>Diensteanbieter</h2>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> vollständiger Firmenname mit Rechtsform (z. B. „Nexo IT
            GmbH", „Nexo IT – Inhaber Vorname Nachname, e. K." oder bei Einzelunternehmen der
            bürgerliche Vor- und Nachname), Straße und Hausnummer, PLZ und Ort. Ein Postfach genügt
            nicht.
          </p>
          <p>
            {company.legalName}
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ Ort]
            <br />
            Deutschland
          </p>

          <h2>Vertreten durch</h2>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> Bei GmbH/UG die Geschäftsführung, bei AG der Vorstand, bei
            Personengesellschaften die vertretungsberechtigten Gesellschafter. Bei
            Einzelunternehmen entfällt dieser Abschnitt.
          </p>
          <p>[Vor- und Nachname der vertretungsberechtigten Person]</p>

          <h2>Kontakt</h2>
          <p>
            Telefon: <a href={company.phoneHref}>{company.phoneDisplay}</a>
            <br />
            E-Mail: <a href={`mailto:${company.email}`}>{company.email}</a>
            <br />
            Internet: {company.domain}
          </p>

          <h2>Registereintrag</h2>
          <p className="nx-todo">
            <strong>Auszufüllen oder streichen:</strong> Nur erforderlich, wenn eine Eintragung
            besteht – Registergericht und Registernummer (z. B. „Amtsgericht Musterstadt, HRB
            12345"). Nicht eingetragene Einzelunternehmen streichen diesen Abschnitt.
          </p>
          <p>
            Registergericht: [Amtsgericht]
            <br />
            Registernummer: [HRB/HRA …]
          </p>

          <h2>Umsatzsteuer-Identifikationsnummer</h2>
          <p className="nx-todo">
            <strong>Auszufüllen oder streichen:</strong> USt-IdNr. gemäß § 27a Umsatzsteuergesetz,
            sofern vorhanden. Kleinunternehmer nach § 19 UStG können stattdessen die
            Steuernummer angeben oder den Abschnitt streichen.
          </p>
          <p>USt-IdNr.: [DE…]</p>

          <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p className="nx-todo">
            <strong>Auszufüllen:</strong> Name und vollständige Anschrift der inhaltlich
            verantwortlichen Person. Diese muss ihren Wohnsitz im Inland haben.
          </p>
          <p>
            [Vor- und Nachname]
            <br />
            [Straße und Hausnummer]
            <br />
            [PLZ Ort]
          </p>

          <h2>Berufshaftpflichtversicherung</h2>
          <p className="nx-todo">
            <strong>Optional:</strong> Für IT-Dienstleister nicht zwingend, aber üblich – Name und
            Anschrift des Versicherers sowie der räumliche Geltungsbereich.
          </p>

          <h2>Streitbeilegung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
            bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            . Unsere E-Mail-Adresse finden Sie oben in diesem Impressum.
          </p>
          <p>
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
            Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
            diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir
            diese Inhalte umgehend entfernen.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
            übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
            Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
            Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren zum
            Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der
            verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar.
            Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
            nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
            dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter
            beachtet. Sollten Sie dennoch auf eine Urheberrechtsverletzung aufmerksam werden, bitten
            wir um einen entsprechenden Hinweis.
          </p>

          <div className="nx-legal__meta">
            <p>
              Hinweis zur Vorlage: Dieses Impressum ist eine technische Vorlage und ersetzt keine
              Rechtsberatung. Bitte lassen Sie die Angaben vor dem Livegang prüfen. Datenschutz­hinweise
              finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.
            </p>
          </div>
        </div>
      </article>
      <FooterStrip />
    </>
  );
}
