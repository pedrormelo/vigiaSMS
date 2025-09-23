// src/components/events/EventCard.tsx

import React from 'react';
import { Event } from '@/constants/eventsData';
import { MapPin } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-[#6B47FF] text-white p-6 rounded-3xl flex flex-col items-center text-center shadow-lg w-[280px] h-[210px] transition-transform duration-300 hover:scale-105">
      <div className="mt-4 text-3xl font-bold">{event.day}</div>
      <div className="text-xl font-medium uppercase">{event.month}</div>
      <div className="flex-1 flex flex-col justify-end text-center p-2">
        <div className="mt-auto text-sm font-semibold">{event.title}</div>
        <div className="flex items-center text-xs mt-2 opacity-80">
          <MapPin size={12} className="mr-1" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
}