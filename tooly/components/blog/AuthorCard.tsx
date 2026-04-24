import type { PostAuthor } from "@/lib/blog/posts";

export default function AuthorCard({ author }: { author: PostAuthor }) {
  const initial = author.name.charAt(0);

  return (
    <section className="my-12 flex items-start gap-5 rounded-2xl bg-slate-50 p-6">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
        {initial}
      </div>
      <div>
        <h3 className="mb-0.5 text-base font-bold text-slate-900">{author.name}</h3>
        {author.role && (
          <p className="mb-3 text-xs text-slate-500">{author.role}</p>
        )}
        {author.bio && (
          <p className="text-sm leading-relaxed text-slate-600">{author.bio}</p>
        )}
      </div>
    </section>
  );
}
