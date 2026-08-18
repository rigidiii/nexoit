import ContactSection from '@/components/ContactSection';
import Hero from '@/components/Hero';
import { About, Marquee, MidCta, Promises, Services, Values } from '@/components/Sections';

/**
 * Startseite – Onepager mit neun Abschnitten in der Reihenfolge des
 * Design-Handoffs. Der Header liegt im Root-Layout, weil ihn auch die
 * Rechtsseiten verwenden.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <About />
      <Services />
      <MidCta />
      <Values />
      <Promises />
      <ContactSection />
    </>
  );
}
