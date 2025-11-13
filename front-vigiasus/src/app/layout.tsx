// src/app/layout.tsx

//import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
// App shell (handles Navbar/Footer visibility)
import AppShell from '@/components/layout/AppShell';
import { PanelRightOpen, Scroll } from 'lucide-react';
import GlobalScrollArea from '@/components/ui/global-scroll-area';
import { Toaster } from "sonner"; 


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
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </GlobalScrollArea>
      </body>
    </html>
  );
}