import { Comment } from "@/constants/notificationsData";

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { author, text, time, isMyComment } = comment;

  return (
    <div
      className={`max-w-[75%] p-3 rounded-xl shadow-sm border border-gray-200 text-sm ${
        isMyComment
          ? "bg-green-100 text-gray-800 self-end rounded-br-none"
          : "bg-gray-100 text-gray-800 self-start rounded-bl-none"
      }`}
    >
      <p className="font-semibold text-xs mb-1 text-gray-600">{author}</p>
      <p>{text}</p>
      <span className={`block text-xs text-right mt-2 text-gray-500`}>
        {time}
      </span>
    </div>
  );
}