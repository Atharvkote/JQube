import Link from 'next/link';
import { blogSource } from '@/lib/source';
import { Calendar, ArrowRight, User, Tag } from 'lucide-react';

export default function BlogPage() {
  const posts = blogSource.getPages().sort((a, b) => {
    const dateA = new Date(a.data.date ?? 0).getTime();
    const dateB = new Date(b.data.date ?? 0).getTime();
    return dateB - dateA;
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="mt-4 text-lg text-[var(--color-fd-muted-foreground)]">
          Latest news, updates, and insights from the JQube team.
        </p>
      </div>
      <div className="space-y-8">
        {posts.map((post) => (
          <Link
            key={post.url}
            href={post.url}
            className="jq-card group block rounded-2xl border border-[var(--color-fd-border)] bg-[var(--color-fd-card)] p-8 transition-all"
          >
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-fd-muted-foreground)]">
              {post.data.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.data.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
              {post.data.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {post.data.author}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight group-hover:text-[#dc143c] transition-colors">
              {post.data.title}
            </h2>
            {post.data.description && (
              <p className="mt-2 text-[var(--color-fd-muted-foreground)] leading-relaxed">
                {post.data.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4">
              {post.data.tags && (
                <div className="flex flex-wrap gap-2">
                  {post.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-md border border-[var(--color-fd-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-fd-muted-foreground)]"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="ml-auto flex items-center gap-1 text-sm font-medium text-[#dc143c] opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
