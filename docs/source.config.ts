import { defineDocs, defineConfig, defineCollections, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: frontmatterSchema.extend({
    author: z.string().default('JQube Team'),
    date: z.string().date().or(z.date()),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

function remarkMermaid() {
  return (tree: any) => {
    function visit(node: any) {
      if (!node) return;
      if (node.type === 'code' && node.lang === 'mermaid') {
        node.type = 'mdxJsxFlowElement';
        node.name = 'Mermaid';
        node.attributes = [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: node.value,
          },
        ];
        node.children = [];
        return;
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    }
    visit(tree);
  };
}

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
