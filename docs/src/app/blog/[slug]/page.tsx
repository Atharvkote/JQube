import { blogSource } from '@/lib/source';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export default async function BlogPost(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-fd-muted-foreground)] hover:text-[#dc143c] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>
      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-fd-muted-foreground)]">
          {page.data.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(page.data.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
          {page.data.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {page.data.author}
            </span>
          )}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="mt-4 text-lg text-[var(--color-fd-muted-foreground)] leading-relaxed">
            {page.data.description}
          </p>
        )}
      </header>
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MDX components={{ ...defaultMdxComponents }} />
      </article>
    </main>
  );
}

export function generateStaticParams() {
  return blogSource.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);
  if (!page) notFound();

  return {
    title: `${page.data.title} | JQube Blog`,
    description: page.data.description,
  };
}
