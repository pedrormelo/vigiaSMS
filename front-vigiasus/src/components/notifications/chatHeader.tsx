import { MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
}

export default function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-tr-3xl flex items-center justify-between">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex items-center gap-4">
        <button aria-label="Abrir chat">
        <MessageCircle width={24} height={24} /> 
        </button>
      </div>
    </div>
  );
}