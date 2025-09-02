// src/app/layout.tsx

//import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
// Navbar 
import Navbar from '@/components/navbar/navbar';
import Footer from '../components/footer/footer';
import { PanelRightOpen } from 'lucide-react';


const montserrat = Montserrat({
  subsets: ['latin']
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
      <body className={`${montserrat.className} antialiased min-h-screen flex flex-col`}>
        {/* A Navbar é renderizada aqui */}
        <Navbar />
        {/* O conteúdo da página (nossa {homePage} será renderizado aqui quando a gentr construir, Pedro*/}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}