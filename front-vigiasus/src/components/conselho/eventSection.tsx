// src/components/events/EventsSection.tsx

"use client";

import React, {useState} from 'react';
import { Plus } from 'lucide-react';
import { events } from '@/constants/eventsData';
import EventCard from '@/components/conselho/eventCard';
import AddEventModal from '../popups/addEventModal';

  export default function EventsSection() {
 const [isModalOpen, setIsModalOpen] = useState(false);

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

    <AddEventModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={(event) => {
    console.log("Novo evento:", event);
    // aqui você pode salvar no estado, backend, etc
  }}
/>
    </section>
  );
}
