// src/components/events/EventsSection.tsx

"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { events } from '@/constants/eventsData';
import EventCard from '@/components/conselho/eventCard';

  export default function EventsSection() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <section className="bg-white py-12 px-6">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">Datas importantes</h2>
      <div className="flex items-center justify-center space-x-6">
        {/* Botão de Adicionar Evento */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-gray-500 border border-dashed border-gray-300 rounded-3xl p-6 flex flex-col items-center justify-center w-[280px] h-[220px] transition-transform duration-300 hover:scale-105"
        >
          <Plus className="h-12 w-12 mb-2" />
          <span className="text-sm font-medium">Adicionar Evento</span>
        </button>

        {/* Lista de Eventos */}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold">Adicionar Novo Evento</h3>
            <p className="mt-2 text-sm text-gray-600">Formulário de evento aqui...</p>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
