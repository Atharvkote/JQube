import { source } from '@/lib/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Steps, Step } from 'fumadocs-ui/components/steps';
import type { Metadata } from 'next';
import {
  Github,
  Shield,
  Sparkles,
  Brain,
  GitPullRequest,
  Terminal,
  Box,
  Layers,
  Play,
  Workflow,
  Cpu,
  Activity,
  Server,
  Code
} from 'lucide-react';
import Mermaid from '@/components/Mermaid';
import CustomCallout from '@/components/CustomCallout';

function getTextContent(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (node.props?.children) return getTextContent(node.props.children);
  return '';
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={page.data.lastModified}
      editOnGithub={{
        repo: 'jqube',
        owner: 'jqube',
        sha: 'main',
        path: `content/docs/${page.file.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={{
            ...defaultMdxComponents,
            Callout: (props: any) => <CustomCallout {...props} />,
            Steps,
            Step,
            Github: (props: any) => <Github {...props} />,
            Shield: (props: any) => <Shield {...props} />,
            Sparkles: (props: any) => <Sparkles {...props} />,
            Brain: (props: any) => <Brain {...props} />,
            GitPullRequest: (props: any) => <GitPullRequest {...props} />,
            Terminal: (props: any) => <Terminal {...props} />,
            Box: (props: any) => <Box {...props} />,
            Layers: (props: any) => <Layers {...props} />,
            Play: (props: any) => <Play {...props} />,
            Workflow: (props: any) => <Workflow {...props} />,
            Cpu: (props: any) => <Cpu {...props} />,
            Activity: (props: any) => <Activity {...props} />,
            Server: (props: any) => <Server {...props} />,
            Code: (props: any) => <Code {...props} />,
            Mermaid: (props: any) => <Mermaid {...props} />,
            pre: (props: any) => {
              const children = Array.isArray(props.children) ? props.children : [props.children];
              const codeChild = children.find(
                (child: any) =>
                  child &&
                  child.props &&
                  typeof child.props.className === 'string' &&
                  child.props.className.includes('mermaid')
              );
              if (codeChild) {
                const chart = getTextContent(codeChild.props.children);
                return <Mermaid chart={chart} />;
              }
              const PreComponent = defaultMdxComponents.pre || 'pre';
              return <PreComponent {...props} />;
            }
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}


export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      url: page.url,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.data.title,
      description: page.data.description,
    },
  };
}
