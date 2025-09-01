// src/components/validar/DetalhesContextoModal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contexto } from "@/components/validar/typesDados";
import { FileText, ArrowLeft, Download, Eye, XCircle, CheckCircle } from "lucide-react";
import IconeDocumento from "@/components/validar/iconeDocumento";

interface Props {
  contexto: Contexto | null;
  isOpen: boolean;
  onClose: () => void;
  perfil: "diretor" | "gerente" | "membro"; //  Recebe o perfil
}

export default function DetalhesContextoModal({ contexto, isOpen, onClose, perfil }: Props) {
  const [comentario, setComentario] = useState("");

  if (!contexto) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 bg-white rounded-lg" showCloseButton={false}>
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-t-lg flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-white" />
            <DialogTitle className="text-white text-xl">Detalhes do Contexto</DialogTitle>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-white/20">
            <ArrowLeft className="text-white" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Seção de detalhes do contexto (sem alteração) */}
          <div className="flex justify-between items-center text-gray-500">
            <p className="text-lg font-semibold text-gray-800">{contexto.nome}</p>
            <p className="text-sm">{new Date(contexto.data).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="flex justify-between items-start border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IconeDocumento type={contexto.docType} />
              <span className="font-medium text-gray-700">pas_editado_versao_final.docx</span>
              <button className="text-gray-500 hover:text-gray-800" title="Baixar"><Download size={20} /></button>
              <button className="text-gray-500 hover:text-gray-800" title="Visualizar"><Eye size={20} /></button>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-gray-800">Postado por: {contexto.solicitante}</p>
              <p className="text-gray-500">{contexto.gerencia}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Detalhes do Contexto</h3>
            <div className="text-sm text-gray-600 border rounded-lg p-3 bg-gray-50 min-h-[100px]">
              {contexto.detalhes}
            </div>
          </div>

          {/* Renderização condicional para a seção de comentários */}
          {perfil !== 'membro' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Comentar Observação</h3>
              <textarea
                placeholder="Exemplo: Contexto necessita de revisão nos dados de exames, favor corrigir até sexta..."
                className="w-full border rounded-lg p-3 text-sm bg-gray-50 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Renderização condicional para os botões de ação */}
        {perfil !== 'membro' && (
          <DialogFooter className="p-6 pt-0">
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600 rounded-full px-6">
              <XCircle className="mr-2" size={20} />
              INDEFERIR
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 rounded-full px-6">
              <CheckCircle className="mr-2" size={20} />
              DEFERIR
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}