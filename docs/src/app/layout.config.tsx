import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Code2, Newspaper, Github } from 'lucide-react';
import Image from 'next/image';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2.5 font-semibold">
        <Image
          src="/JQube.png"
          alt="JQube Logo"
          width={100}
          height={100}
        />
      </div>
    ),
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      icon: <BookOpen className="h-4 w-4" />,
      active: 'nested-url',
    },
    {
      text: 'API',
      url: '/docs/api-reference',
      icon: <Code2 className="h-4 w-4" />,
    },
    {
      text: 'Blog',
      url: '/blog',
      icon: <Newspaper className="h-4 w-4" />,
    },
    {
      type: 'icon',
      text: 'GitHub',
      url: 'https://github.com/jqube',
      icon: <Github className="h-4 w-4" />,
      external: true,
    },
  ],
};
