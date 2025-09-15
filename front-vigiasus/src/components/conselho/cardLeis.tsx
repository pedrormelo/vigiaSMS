"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AdicionarLeiModal from "./AdicionarLeiModal";

interface Lei {
  id: number;
  titulo: string;
}

export default function LeisGrid() {
  const [leis, setLeis] = useState<Lei[]>([]);
  const [open, setOpen] = useState(false);

  const handleAdd = (titulo: string) => {
    setLeis([...leis, { id: Date.now(), titulo }]);
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-2">
        {/* Card de adicionar */}
        <div
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:bg-gray-50 transition"
        >
          <span className="text-4xl text-gray-400">+</span>
          <span className="text-sm text-gray-500 mt-2">Adicionar Lei</span>
        </div>

        {/* Cards das leis */}
        {leis.map((lei) => (
          <div
            key={lei.id}
            className="bg-violet-600 text-white rounded-2xl p-4 flex flex-col justify-center text-center shadow-md"
          >
            <div className="font-bold text-lg">{lei.titulo}</div>
          </div>
        ))}
      </div>

      {/* Modal separado */}
      <AdicionarLeiModal
        open={open}
        onOpenChange={setOpen}
        onSave={handleAdd}
      />
    </>
  );
}
