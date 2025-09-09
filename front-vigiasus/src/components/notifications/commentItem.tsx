import { Comment } from "@/constants/notificationsData"; // Certifique-se de que o caminho para o seu mock de dados está correto

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { author, text, time, date, isMyComment, role } = comment;

  // Style by role
  let roleStyle = "";
  switch (role) {
    case "info":
      roleStyle = "bg-gray-100 border-gray-300 text-gray-700";
      break;
    case "secretaria":
      roleStyle = "bg-blue-100 border-blue-300 text-gray-700";
      break;
    case "diretoria":
      roleStyle = "bg-purple-100 border-purple-300 text-gray-700";
      break;
    case "gerencia":
      roleStyle = "bg-green-100 border-green-300 text-gray-700";
      break;
    case "user":
      roleStyle = "bg-blue-50 border-blue-100 text-gray-700";
      break;
    case "zelma":
      roleStyle = "bg-blue-200 border-blue-300 text-gray-700";
      break;
    default:
      roleStyle = "bg-blue-100 border-gray-200 text-gray-800";
  }

  return (
    <div
      className={`max-w-[75%] p-3 rounded-2xl shadow-sm border text-sm ${
        isMyComment
          ? "self-end rounded-br-none"
          : "self-start rounded-bl-none"
      } ${roleStyle}`}
    >
      <p className="font-semibold text-xs mb-1 text-gray-600">{author}</p>
      <p>{text}</p>
      <span className={`block text-xs text-right mt-2 text-gray-500`}>
        {date} - {time}
      </span>
    </div>
  );
}