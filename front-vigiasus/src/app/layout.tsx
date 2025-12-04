// src/app/layout.tsx

import { Montserrat } from 'next/font/google';
import './globals.css';
// App shell (handles Navbar/Footer visibility)
import AppShell from '@/components/layout/AppShell';
import GlobalScrollArea from '@/components/ui/global-scroll-area';
import { Toaster } from "sonner"; 
// [NOVO IMPORT] Importa o provedor de sessão
import SessionTimeoutProvider from "@/components/providers/session-timeout-provider";
import OnboardingModal from '@/components/onboarding/onboardingModal';
import OnboardingWrapper from '@/components/onboarding/onboardingWrapper';
import AppTour from '@/components/tour/appTour';
import { TourProvider } from '@/contexts/tourContext';
import TourManager from '@/components/tour/tourManager';

const montserrat = Montserrat({
  subsets: ['latin'],
});

export const metadata = {
  title: 'VigiaSUS',
  description: 'Painel de Monitoramento',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} antialiased flex flex-col selection:bg-green-400 selection:text-white`}>
   <GlobalScrollArea>
          {/* Envolvemos com o TourProvider */}
          <TourProvider>
             <SessionTimeoutProvider>
                <AppShell>
                  {children}
                </AppShell>
                 {/*<OnboardingWrapper />*/}
                <TourManager />
                <AppTour />
                <Toaster />
             </SessionTimeoutProvider>
          </TourProvider>
        </GlobalScrollArea>
      </body>
    </html>
  );
}