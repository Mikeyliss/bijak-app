import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Caveat } from 'next/font/google';
import { QuizProvider } from '@/context/QuizContext';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' });
const hand = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-hand' });

export const metadata: Metadata = {
  title: 'Bijak! — your SPM quiz buddy',
  description: 'Turn any past-year exam paper into a self-check quiz.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable} ${hand.variable}`}>
        <QuizProvider>
          <div className="page-desk">
            <div className="device">{children}</div>
          </div>
        </QuizProvider>
      </body>
    </html>
  );
}
