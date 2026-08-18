/**
 * Rückgabetyp des Kontaktformulars.
 *
 * Liegt bewusst außerhalb der Server-Action-Datei: Module mit 'use server'
 * dürfen ausschließlich asynchrone Funktionen exportieren, keine Objekte.
 */
export interface ContactState {
  status: 'idle' | 'ok' | 'error';
  message: string;
  fieldErrors: Record<string, string>;
  /** Ändert sich bei jeder Antwort, damit der Client neue Ergebnisse erkennt. */
  nonce: number;
}

export const initialContactState: ContactState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
  nonce: 0,
};
