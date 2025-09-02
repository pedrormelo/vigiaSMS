// src/components/validar/DetalhesContextoModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contexto } from "@/components/validar/typesDados";
import { FileText, ArrowLeft, Download, Eye, MessageSquareText, ShieldX, ShieldCheck, FileCheck2, FileX, Weight } from "lucide-react";
import IconeDocumento from "@/components/validar/iconeDocumento";

interface Props {
  contexto: Contexto | null;
  isOpen: boolean;
  onClose: () => void;
  perfil: "diretor" | "gerente" | "membro";
}

export default function DetalhesContextoModal({ contexto, isOpen, onClose, perfil }: Props) {
  const [comentario, setComentario] = useState("");

  if (!contexto) {
    return null;
  }

  const renderFooter = () => {
    if (perfil === "membro") {
      return (
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl px-8 py-3 text-base">
          <MessageSquareText className="mr-2" size={20} />
          COMENTÁRIOS DESSE CONTEXTO
        </Button>
      );
    }
    return (
      <>
        <div className="flex items-center gap-4">
        <Button className="bg-[#E0440E] hover:bg-[#c93a4d] border border-[#B22E00] text-white rounded-2xl px-8 py-3 text-base">
          <FileX className="mr-2" size={25} />
          INDEFERIR
        </Button>
        <Button className="bg-[#50CF5F] hover:bg-[#1E8C56] border border-[#02B917] text-white rounded-2xl px-8 py-3 text-base">
          <FileCheck2 className="mr-2" size={25} />
          DEFERIR
        </Button>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-4xl bg-transparent border-none p-0 shadow-none"
      >
        <div className="bg-white rounded-4xl shadow-2xl overflow-hidden">

          <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-t-4xl flex-row items-center justify-between">
            <div className="flex ml-3 items-center gap-3">
              <FileText className="text-white" />
              <span className="text-white text-xl">Detalhes do Contexto</span>
              <DialogTitle className="text-white "></DialogTitle>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/20">
              <ArrowLeft className="text-white" />
            </Button>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between p-4 items-center border border-gray-200 bg-gray-50 w-full text-gray-500">
              <p className="text-lg font-medium text-[#8983a5]">{contexto.nome}</p>
              <p className="text-lg text-[#8983a5]">{new Date(contexto.data).toLocaleDateString('pt-BR')}</p>
            </div>
            {/* padding geral */}
            <div className="flex flex-col gap-3 p-4 ">
              <div className="flex justify-between items-start rounded-lg">
                <div className="flex gap-4">
                <div className="flex p-3 items-center border border-[#C4C4C4] rounded-3xl gap-3">
                  <IconeDocumento type={contexto.docType} />
                  <span className="font-medium text-gray-700">pas_editado_versao_final.docx</span>
                </div>
                  <button className="text-gray-500 hover:text-gray-800" title="Baixar"><Download size={30} /></button>
                  <button className="text-gray-500 hover:text-gray-800" title="Visualizar"><Eye size={30} /></button>
                </div>
                <div className="text-left text-sm">
                  <p className="font-semibold text-gray-700">Postado por: {contexto.solicitante}</p>
                  <p className="text-gray-500">{contexto.gerencia}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Detalhes do Contexto</h3>
                <div className="text-sm text-gray-600 border border-[#C4C4C4] rounded-3xl p-3 bg-gray-50 min-h-[100px]">
                  {contexto.detalhes}
                </div>
              </div>
              {perfil !== "membro" && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Comentar Observação</h3>
                  <textarea
                    placeholder="Exemplo: Contexto necessita de revisão nos dados de exames, favor corrigir até sexta..."
                    className="w-full border border-[#C4C4C4] rounded-3xl p-3 text-sm bg-gray-50 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  />
                </div>
              )}
            </div>

          </div>

          {/* 👇 ALTERAÇÃO AQUI: Força a centralização horizontalmente */}
          <DialogFooter className="p-6 pt-0 sm:justify-center gap-4">
            {renderFooter()}
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
}