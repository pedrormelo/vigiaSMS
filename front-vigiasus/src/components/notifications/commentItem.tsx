// src/components/notifications/commentItem.tsx
import { Comment } from "@/constants/types";
import { Lock, ShieldAlert, CheckCircle2, Rocket, AlertTriangle, XCircle, Send } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  hasSolidBg?: boolean;
}

export default function CommentItem({ comment, hasSolidBg = false }: CommentItemProps) {
  const { author, text, time, date, isMyComment, role, isPrivate, toAuthor } = comment;
  const authorLabel = (comment as any).authorLabel;

  // --- MENSAGENS DE SISTEMA (TIMELINE) ---
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
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-sm max-w-[90%] ${sysStyle} backdrop-blur-sm bg-opacity-95`}>
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
  
  // --- MENSAGENS DE USUÁRIO (CHAT) ---
  let roleStyle = "";
  
  // Paleta de Cores "Vidro" (Translúcida com Blur)
  // Usamos gradientes suaves e bordas sutis para um visual moderno
  switch (role) {
    case "info": 
        roleStyle = "bg-white/85 border-gray-200 text-gray-800 shadow-sm"; 
        break;
    
    case "secretaria": 
        // ROXO: Diferente e sofisticado
        roleStyle = "bg-gradient-to-r from-purple-100/90 to-purple-200/80 border-purple-200 text-purple-900 shadow-sm"; 
        break;
    
    case "diretoria": 
        // ÂMBAR/LARANJA: Destaca a autoridade e contrasta com os azuis
        roleStyle = "bg-gradient-to-r from-amber-100/90 to-orange-100/80 border-amber-200 text-amber-900 shadow-sm"; 
        break;
    
    case "gerencia": 
        // AZUL CELESTE: Profissional, mas mais vivo que o cinza
        roleStyle = "bg-gradient-to-r from-sky-100/90 to-blue-100/80 border-sky-200 text-blue-900 shadow-sm"; 
        break;
    
    case "user": 
        // CINZA/SLATE: Neutro para não cansar a vista
        roleStyle = "bg-gradient-to-r from-slate-100/95 to-gray-100/85 border-gray-200 text-slate-800 shadow-sm"; 
        break;
    
    default: 
        roleStyle = "bg-gray-50/90 border-gray-200 text-gray-900 shadow-sm";
  }

  return (
    <div className={`max-w-[85%] p-3 rounded-2xl border text-sm relative backdrop-blur-md ${isMyComment ? "self-end rounded-br-none" : "self-start rounded-bl-none"} ${roleStyle}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-xs opacity-90">{isMyComment ? "Eu" : author}</p>
            {!isMyComment && authorLabel && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/5 border border-black/10 font-bold uppercase tracking-tight leading-none text-black/60">
                    {authorLabel}
                </span>
            )}
        </div>
        
        {isPrivate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-900/90 text-white ml-2 backdrop-blur-sm">
            <Lock className="w-3 h-3" />
            {toAuthor ? `Para ${toAuthor}` : "Privado"}
          </span>
        )}
      </div>
      <p className="leading-relaxed whitespace-pre-wrap font-medium opacity-95">{text}</p>
      <span className="block text-[10px] text-right mt-1 opacity-70 font-medium">{date} às {time}</span>
    </div>
  );
}