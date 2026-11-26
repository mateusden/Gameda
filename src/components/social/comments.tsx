"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import { addComment, deleteComment, type Target } from "@/app/actions/social";
import ReportButton from "@/components/social/report-button";

export interface CommentItem {
  id: number;
  user_id: string;
  parent_id: number | null;
  body: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface CommentsProps {
  target: Target;
  path: string;
  comments: CommentItem[];
  viewerId: string | null;
}

function CommentForm({
  target,
  path,
  parentId,
  placeholder,
  onDone,
}: {
  target: Target;
  path: string;
  parentId?: number;
  placeholder: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addComment(target, body, path, parentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      onDone?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-[#E9E3D5] border border-[#343A35]/10 rounded-lg px-3 py-2 text-sm text-[#343A35] placeholder:text-[#343A35]/50 focus:border-[#66836A]/60 outline-none resize-none"
      />
      {error && (
        <p role="alert" className="text-xs text-[#A9574D] font-medium">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#343A35] hover:bg-[#343A35]/10 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="bg-[#66836A] hover:bg-[#263A30] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          {pending ? "Enviando..." : "Comentar"}
        </button>
      </div>
    </form>
  );
}

function CommentRow({
  comment,
  target,
  path,
  viewerId,
  canReply,
}: {
  comment: CommentItem;
  target: Target;
  path: string;
  viewerId: string | null;
  canReply: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [replying, setReplying] = useState(false);

  const handleDelete = () => {
    if (!window.confirm("Apagar este comentário?")) return;
    startTransition(async () => {
      const result = await deleteComment(comment.id, path);
      if (result.ok) router.refresh();
    });
  };

  const username = comment.profiles?.username;

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <Avatar
          src={comment.profiles?.avatar_url}
          name={username ?? "?"}
          className="w-7 h-7 text-xs"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#343A35]/70">
            {username ? (
              <Link
                href={`/profile/${username}`}
                className="font-semibold text-[#343A35] hover:text-[#66836A] transition-colors"
              >
                @{username}
              </Link>
            ) : (
              <span className="font-semibold text-[#343A35]">Usuário</span>
            )}
            <span>
              {new Date(comment.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          <p className="text-sm text-[#343A35]/90 whitespace-pre-line break-words">
            {comment.body}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {canReply && viewerId && (
              <button
                type="button"
                onClick={() => setReplying(!replying)}
                className="font-medium text-[#343A35]/70 hover:text-[#66836A] transition-colors cursor-pointer"
              >
                Responder
              </button>
            )}
            {comment.user_id === viewerId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                aria-label="Apagar comentário"
                className="text-[#343A35]/50 hover:text-[#A9574D] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {viewerId && comment.user_id !== viewerId && (
              <ReportButton
                viewerId={viewerId}
                target={{ kind: "comment", id: comment.id }}
              />
            )}
          </div>
        </div>
      </div>

      {replying && (
        <div className="ml-9">
          <CommentForm
            target={target}
            path={path}
            parentId={comment.id}
            placeholder={
              username ? `Responder a @${username}...` : "Responder..."
            }
            onDone={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function Comments({
  target,
  path,
  comments,
  viewerId,
}: CommentsProps) {
  const [open, setOpen] = useState(false);

  const roots = comments
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const repliesOf = (id: number) =>
    comments
      .filter((c) => c.parent_id === id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-[#343A35]/70 hover:text-[#66836A] transition-colors cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        {comments.length}
      </button>

      {open && (
        <div className="space-y-4 animate-fadeIn">
          {roots.length === 0 && (
            <p className="text-xs text-[#343A35]/70">
              Nenhum comentário ainda.
            </p>
          )}

          {roots.map((root) => (
            <div key={root.id} className="space-y-3">
              <CommentRow
                comment={root}
                target={target}
                path={path}
                viewerId={viewerId}
                canReply
              />
              {repliesOf(root.id).length > 0 && (
                <div className="ml-9 space-y-3 border-l-2 border-[#343A35]/10 pl-3">
                  {repliesOf(root.id).map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      target={target}
                      path={path}
                      viewerId={viewerId}
                      canReply={false}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {viewerId ? (
            <CommentForm
              target={target}
              path={path}
              placeholder="Escreva um comentário..."
            />
          ) : (
            <p className="text-xs text-[#343A35]/70">
              <Link
                href="/login"
                className="font-semibold text-[#66836A] hover:text-[#263A30]"
              >
                Entre
              </Link>{" "}
              para comentar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
