/**
 * Gemeinsamer Rückgabetyp der Admin-Server-Aktionen.
 * Liegt außerhalb der 'use server'-Datei, weil dort nur asynchrone Funktionen
 * exportiert werden dürfen.
 */
export interface AdminActionState {
  status: 'idle' | 'ok' | 'error';
  message: string;
  nonce: number;
}

export const initialAdminState: AdminActionState = {
  status: 'idle',
  message: '',
  nonce: 0,
};
