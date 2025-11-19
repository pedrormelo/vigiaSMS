// src/components/notifications/commentItem.tsx
import { Comment } from "@/constants/types";
import { Lock, ShieldAlert, CheckCircle2, Rocket, AlertTriangle, XCircle, Send } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  // Adicionamos authorLabel à desestruturação (adicione ao type Comment se usar TS estrito)
  const { author, text, time, date, isMyComment, role, isPrivate, toAuthor } = comment;
  const authorLabel = (comment as any).authorLabel; // Cast se necessário

  // --- ESTILO DE SISTEMA (MANTIDO) ---
  if (role === 'system') {
    let sysStyle = "bg-gray-50 border-gray-200 text-gray-600";
    let Icon = ShieldAlert;
    let statusTitle = "Atualização de Status";

    if (text.includes('✅')) { sysStyle = "bg-emerald-50 border-emerald-100 text-emerald-700"; Icon = CheckCircle2; statusTitle = "ENCAMINHADO PARA DIRETORIA"; }
    else if (text.includes('🚀')) { sysStyle = "bg-blue-50 border-blue-100 text-blue-700"; Icon = Rocket; statusTitle = "PUBLICADO"; }
    else if (text.includes('⚠️')) { sysStyle = "bg-amber-50 border-amber-100 text-amber-700"; Icon = AlertTriangle; statusTitle = "CORREÇÃO SOLICITADA"; }
    else if (text.includes('❌')) { sysStyle = "bg-red-50 border-red-100 text-red-700"; Icon = XCircle; statusTitle = "INDEFERIDO"; }
    else if (text.includes('📤')) { sysStyle = "bg-indigo-50 border-indigo-100 text-indigo-700"; Icon = Send; statusTitle = "AGUARDANDO GERÊNCIA"; }

    return (
      <div className="w-full flex justify-center my-2">
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm max-w-[90%] ${sysStyle}`}>
          <div className="mt-0.5"><Icon className="w-5 h-5" /></div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-90">{statusTitle}</p>
            <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">{text}</p>
            <div className="mt-2 flex items-center justify-end gap-1 text-[10px] opacity-75 font-semibold border-t border-black/5 pt-1.5">
              <span>Ação de: {author}</span>
              <span>•</span>
              <span>{date} às {time}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // -----------------------------------------------

  let roleStyle = "";
  switch (role) {
    case "info": roleStyle = "bg-white border-gray-300 text-gray-600 font-semibold"; break;
    case "secretaria": roleStyle = "bg-gradient-to-r from-indigo-400/30 to-indigo-600/30 border-indigo-300 text-gray-800"; break;
    case "diretoria": roleStyle = "bg-gradient-to-r from-emerald-300/30 to-emerald-400/30 border-emerald-300 text-gray-800"; break;
    case "gerencia": roleStyle = "bg-gradient-to-r from-blue-400/30 to-blue-500/30 border-blue-400 text-gray-800"; break;
    case "user": roleStyle = "bg-gradient-to-r from-white/70 to-white/80 border-gray-100 text-gray-800"; break;
    default: roleStyle = "bg-blue-100 border-gray-200 text-gray-800";
  }

  return (
    <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm border text-sm relative ${isMyComment ? "self-end rounded-br-none" : "self-start rounded-bl-none"} ${roleStyle}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
            {/* Nome do Autor */}
            <p className="font-semibold text-xs opacity-80">{isMyComment ? "Eu" : author}</p>
            {/* Etiqueta de Cargo (NOVO) */}
            {!isMyComment && authorLabel && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-medium uppercase tracking-tight leading-none text-black/60">
                    {authorLabel}
                </span>
            )}
        </div>
        
        {isPrivate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-white ml-2">
            <Lock className="w-3 h-3" />
            {toAuthor ? `Para ${toAuthor}` : "Privado"}
          </span>
        )}
      </div>
      <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
      <span className="block text-[10px] text-right mt-1 opacity-60">{date} às {time}</span>
    </div>
  );
}