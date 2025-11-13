import { Comment } from "@/constants/types";
import { Lock, User } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { author, text, time, date, isMyComment, role, isPrivate, toAuthor } = comment;

  // Style by role
  let roleStyle = "";
  switch (role) {
    case "info":
      roleStyle = "bg-white border-gray-300 text-gray-600 font-semibold";
      break;
    case "secretaria":
      roleStyle = "bg-gradient-to-r from-indigo-400/30 to-indigo-600/30 border-indigo-300 text-gray-800";
      break;
    // case "secretaria":
    //   roleStyle = "bg-gradient-to-r from-blue-400/30 to-blue-500/30 border-blue-400 text-gray-800";
    //   break;
    case "diretoria":
      roleStyle = "bg-gradient-to-r from-emerald-300/30 to-emerald-400/30 border-emerald-300 text-gray-800";
      break;
    case "gerencia":
      roleStyle = "bg-gradient-to-r from-blue-400/30 to-blue-500/30 border-blue-400 text-gray-800";
      break;
    // case "gerencia":
    //   roleStyle = "bg-gradient-to-r from-rose-300/30 to-rose-400/30 border-rose-300 text-gray-800";
    //   break;
    // case "gerencia":
    //   roleStyle = "bg-gradient-to-r from-orange-300/30 to-orange-400/30 border-orange-300 text-gray-800";
    //   break;
    case "user":
      roleStyle = "bg-gradient-to-r from-white/70 to-white/80 border-gray-100 text-gray-800";
      break;
    case "zelma":
      roleStyle = "bg-gradient-to-r from-indigo-400/30 to-indigo-600/30 border-indigo-300 text-gray-800";
      break;
    default:
      roleStyle = "bg-blue-100 border-gray-200 text-gray-800";
  }

  return (
    <div
      className={`max-w-[75%] p-3 rounded-2xl shadow-sm border text-sm ${
        isMyComment ? "self-end rounded-br-none" : "self-start rounded-bl-none"
      } ${roleStyle}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="font-semibold text-xs text-gray-600">{author}</p>
        {isPrivate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-white">
            <Lock className="w-3 h-3" />
            {toAuthor ? `Privado para ${toAuthor}` : "Privado"}
          </span>
        )}
      </div>
      <p>{text}</p>
      <span className="block text-xs text-right mt-2 text-gray-500">
        {date} - {time}
      </span>
    </div>
  );
}