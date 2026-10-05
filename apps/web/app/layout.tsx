import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSMS Voksel',
  description: 'CSMS and OCPP 1.6J charger simulator'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
