import './global.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CustomSearchDialog from '@/components/CustomSearchDialog';

export const metadata: Metadata = {
  title: {
    default: 'JQube — AI-Powered DevSecOps Platform',
    template: '%s | JQube Docs',
  },
  description:
    'JQube is an AI-powered DevSecOps platform that integrates with GitHub, performs security scanning with Semgrep, generates AI-powered remediations, and creates Pull Requests automatically.',
  metadataBase: new URL('https://docs.jqube.dev'),
  keywords: [
    'JQube',
    'DevSecOps',
    'AI Security',
    'Semgrep',
    'GitHub',
    'Security Scanner',
    'Vulnerability Detection',
    'AI Remediation',
    'SAST',
    'Developer Tools',
  ],
  authors: [{ name: 'JQube Team' }],
  creator: 'JQube',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.jqube.dev',
    title: 'JQube — AI-Powered DevSecOps Platform',
    description:
      'Build secure software faster with AI-powered security scanning, vulnerability detection, and automated remediation.',
    siteName: 'JQube Documentation',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JQube — AI-Powered DevSecOps Platform',
    description:
      'Build secure software faster with AI-powered security scanning, vulnerability detection, and automated remediation.',
    creator: '@jqube',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            attribute: 'class',
          }}
          search={{
            SearchDialog: CustomSearchDialog,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
