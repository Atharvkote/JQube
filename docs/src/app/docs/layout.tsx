import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { baseOptions } from '@/app/layout.config';
import { SidebarNavTabs } from '@/components/SidebarNavTabs';
import CustomNavBar from '@/components/CustomNavBar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomNavBar />
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions}
        links={[]}
        nav={{ enabled: false }}
        sidebar={{
          defaultOpenLevel: 1,
          banner: (
            <div className="flex flex-col gap-2">
              <SidebarNavTabs />
              <div className="mb-2 rounded-xl border border-[var(--color-fd-border)] bg-[var(--color-fd-card)] p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-fd-muted-foreground)]">
                  <div className="h-2 w-2 rounded-full bg-[#238636] animate-pulse" />
                  <span>v2.0.0 — Latest</span>
                </div>
              </div>
            </div>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
