import Link from 'next/link';
import {
  Shield,
  Github,
  ArrowRight,
  Scan,
  Bot,
  GitPullRequest,
  Lock,
  Code2,
  Activity,
  Zap,
  Globe,
  Server,
  Database,
  Layers,
  CheckCircle,
  AlertTriangle,
  Eye,
  Terminal,
  Quote,
  Building2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative bg-[#08080a] text-[#f2f2f4]">
      {/* Ambient scan-line keyframes, scoped locally */}
      <style>{`
        @keyframes jq-sweep {
          0% { transform: translateY(-10%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(340%); opacity: 0; }
        }
        @keyframes jq-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .jq-sweep, .jq-caret { animation: none !important; }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--color-fd-border)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(220,20,60,0.14),transparent)]" />
        <div className="relative flex flex-row justify-between  mx-auto max-w-6xl px-6 pt-4 pb-4 md:pt-12 md:pb-12">
          <div className="flex flex-col font-mono justify-center  items-center text-center">

            <h1 className="max-w-3xl text-[2.5rem] font-black leading-[1.05] tracking-tight sm:text-6xl md:text-[4.25rem]">
              Less "Oops"
              <br />
              <span className="bg-gradient-to-r from-[#ff5470] to-[#dc143c] bg-clip-text text-transparent">
                more "Fixed & Merged".
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[var(--color-fd-muted-foreground)] md:text-lg">
              JQube scans every commit with Semgrep, writes the fix with AI, and
              opens the pull request itself — so security review happens before
              merge, not after a breach.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg bg-[#dc143c] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#ff4d6d]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/jqube"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-fd-border)] px-5 py-2.5 text-sm font-semibold text-[#f2f2f4] transition-all hover:border-[#48484f] hover:bg-white/[0.03]"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </Link>
            </div>
          </div>

          {/* Signature element: live remediation mockup */}
          <div className="relative  mx-auto mt-16 max-w-3xl">
            <div className="absolute -inset-x-8 -inset-y-6 rounded-[2rem] bg-[#dc143c]/[0.06] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-fd-border)] bg-[#0d0d10] shadow-2xl shadow-black/60">
              {/* chrome */}
              <div className="flex items-center gap-3 border-b border-[var(--color-fd-border)] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e8384f]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d29922]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#238636]/70" />
                </div>
                <span className="font-mono text-xs text-[var(--color-fd-muted-foreground)]">
                  api/auth/session.py — pull request #482
                </span>
                <span className="ml-auto hidden items-center gap-1.5 rounded-md bg-[#238636]/10 px-2 py-0.5 font-mono text-[11px] text-[#3fb950] sm:flex">
                  <CheckCircle className="h-3 w-3" />
                  resolved
                </span>
              </div>

              {/* code body */}
              <div className="relative overflow-hidden">
                <div
                  className="jq-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#dc143c]/[0.10] to-transparent"
                  style={{ animation: 'jq-sweep 5s ease-in-out infinite' }}
                />
                <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-6">
                  <code>
                    <span className="block text-[#6e6e78]">
                      1  def get_user(request):
                    </span>
                    <span className="block text-[#6e6e78]">
                      {'2      user_id = request.args.get("id")'}
                    </span>
                    <span className="block bg-[#dc143c]/[0.12] text-[#ff8a9a]">
                      {'3 -    query = f"SELECT * FROM users WHERE id={user_id}"'}
                    </span>
                    <span className="block bg-[#238636]/[0.14] text-[#7ee2a8]">
                      {'3 +    query = "SELECT * FROM users WHERE id = %s"'}
                    </span>
                    <span className="block bg-[#238636]/[0.14] text-[#7ee2a8]">
                      {'4 +    cursor.execute(query, (user_id,))'}
                    </span>
                    <span className="block text-[#6e6e78]">
                      5      return cursor.fetchone()
                      <span
                        className="jq-caret ml-1 inline-block h-3.5 w-[7px] translate-y-[2px] bg-[#e8384f]/70"
                        style={{ animation: 'jq-blink 1s step-end infinite' }}
                      />
                    </span>
                  </code>
                </pre>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-fd-border)] bg-white/[0.015] px-5 py-3 font-mono text-[11px] text-[var(--color-fd-muted-foreground)]">
                <span className="rounded bg-[#dc143c]/10 px-1.5 py-0.5 text-[#ff8a9a]">
                  CRITICAL
                </span>
                <span>SQL injection · CWE-89</span>
                <span className="mx-1 text-[#3a3a40]">·</span>
                <span className="inline-flex items-center gap-1 text-[#a78bfa]">
                  <Bot className="h-3 w-3" />
                  fix generated in 4.2s
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-[var(--color-fd-border)]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 divide-x divide-[var(--color-fd-border)] md:grid-cols-4">
            {[
              { label: 'Vulnerabilities detected', value: '50K+', icon: AlertTriangle },
              { label: 'AI remediations written', value: '30K+', icon: Bot },
              { label: 'Pull requests opened', value: '10K+', icon: GitPullRequest },
              { label: 'Languages covered', value: '25+', icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center px-4 text-center">
                <stat.icon className="mb-3 h-4 w-4 text-[#e8384f]" />
                <div className="text-3xl font-black tracking-tight md:text-4xl">{stat.value}</div>
                <div className="mt-1.5 max-w-[9rem] text-xs text-[var(--color-fd-muted-foreground)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Pipeline */}
      <section className="border-b border-[var(--color-fd-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e8384f]">
              the pipeline
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Four steps, zero manual triage
            </h2>
            <p className="mx-auto mt-4 text-[var(--color-fd-muted-foreground)]">
              Each run moves straight from finding to fix — no ticket queue in between.
            </p>
          </div>

          <div className="relative mt-16 grid gap-px overflow-hidden rounded-2xl border border-[var(--color-fd-border)] bg-[var(--color-fd-border)] md:grid-cols-4">
            {[
              {
                step: '01',
                icon: Github,
                title: 'Connect repository',
                description: 'Authenticate with GitHub OAuth and choose which repos JQube watches.',
              },
              {
                step: '02',
                icon: Scan,
                title: 'Run security scan',
                description: 'Semgrep checks every diff against 2,000+ rules across 25+ languages.',
              },
              {
                step: '03',
                icon: Bot,
                title: 'Generate remediation',
                description: 'An LLM reads the surrounding code and writes a fix that matches it.',
              },
              {
                step: '04',
                icon: GitPullRequest,
                title: 'Open pull request',
                description: 'The patch, diff, and explanation land on your repo, ready to review.',
              },
            ].map((item) => (
              <div key={item.step} className="group relative bg-[#0d0d10] p-6">
                <div className="mb-6 font-mono text-xs text-[#5a5a62]">{item.step}</div>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#dc143c]/10 transition-colors group-hover:bg-[#dc143c]/20">
                  <item.icon className="h-4 w-4 text-[#e8384f]" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-fd-muted-foreground)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Docs as code / AI chat style two-up */}
      <section className="border-b border-[var(--color-fd-border)] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-6">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f6feb]/10">
                <Eye className="h-4 w-4 text-[#4a9eff]" />
              </div>
              <h3 className="mb-2 font-semibold">Diff viewer, not a ticket</h3>
              <p className="mb-5 text-sm leading-relaxed text-[var(--color-fd-muted-foreground)]">
                Every finding renders as a side-by-side diff with syntax
                highlighting, so a reviewer sees the exact change, not a
                paragraph describing it.
              </p>
              <div className="overflow-hidden rounded-lg border border-[var(--color-fd-border)] font-mono text-xs">
                <div className="flex items-center justify-between bg-white/[0.02] px-3 py-2 text-[var(--color-fd-muted-foreground)]">
                  <span>config/secrets.yaml</span>
                  <span className="text-[#d29922]">MEDIUM</span>
                </div>
                <div className="space-y-0.5 px-3 py-2.5">
                  <div className="bg-[#dc143c]/[0.10] text-[#ff8a9a]">- api_key: "sk_live_4f8a..."</div>
                  <div className="bg-[#238636]/[0.14] text-[#7ee2a8]">+ api_key: {'${env.API_KEY}'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-6">
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#a78bfa]/10">
                <Bot className="h-4 w-4 text-[#a78bfa]" />
              </div>
              <h3 className="mb-2 font-semibold">Ask why, right in the PR</h3>
              <p className="mb-5 text-sm leading-relaxed text-[var(--color-fd-muted-foreground)]">
                A built-in assistant explains the vulnerability class, the
                exploit path, and why the suggested patch closes it — before
                anyone approves the merge.
              </p>
              <div className="rounded-lg border border-[var(--color-fd-border)] p-3">
                <p className="mb-2 font-mono text-[11px] text-[var(--color-fd-muted-foreground)]">
                  reviewer
                </p>
                <p className="mb-3 text-sm text-[#d7d7dc]">
                  Why parameterize instead of just escaping the string?
                </p>
                <p className="mb-2 font-mono text-[11px] text-[#a78bfa]">jqube</p>
                <p className="text-sm text-[#d7d7dc]">
                  Escaping still trusts the driver's parser. Parameterized
                  queries send the value outside the SQL text entirely, so
                  there's nothing left for an attacker to inject.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b border-[var(--color-fd-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e8384f]">
              capabilities
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Enterprise-grade, by default
            </h2>
            <p className="mx-auto mt-4 text-[var(--color-fd-muted-foreground)]">
              Everything a security team asks for in the first procurement call.
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Scan,
                title: 'Semgrep integration',
                description: '2,000+ security rules across Java, Python, JavaScript, Go, and more.',
              },
              {
                icon: Bot,
                title: 'AI-powered fixes',
                description: 'Context-aware patches that read the surrounding code before writing one line.',
              },
              {
                icon: GitPullRequest,
                title: 'Automated PRs',
                description: 'One-click pull requests with diff previews and commit messages that explain the fix.',
              },
              {
                icon: Lock,
                title: 'GitHub OAuth',
                description: 'Fine-grained repository access with scoped tokens, nothing over-permissioned.',
              },
              {
                icon: Activity,
                title: 'Severity tracking',
                description: 'CRITICAL to LOW classification with trend lines across every scan.',
              },
              {
                icon: Code2,
                title: 'Monaco editor',
                description: 'IntelliSense and inline vulnerability annotations, right where you already work.',
              },
              {
                icon: Server,
                title: 'Docker-ready',
                description: 'Production Docker and Compose configs, deploy behind your own firewall.',
              },
              {
                icon: Zap,
                title: 'CI/CD native',
                description: 'GitHub Actions workflows scan every push, PR, and scheduled interval.',
              },
              {
                icon: Database,
                title: 'Full audit trail',
                description: 'Every finding, fix, and approval logged for compliance review.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-5 transition-colors hover:border-[#3a3a40]"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#dc143c]/10 transition-colors group-hover:bg-[#dc143c]/20">
                  <feature.icon className="h-4 w-4 text-[#e8384f]" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-fd-muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="border-b border-[var(--color-fd-border)] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e8384f]">
              under the hood
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              A stack built to scale with your repos
            </h2>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: 'Frontend',
                items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Monaco Editor', 'Zustand'],
                color: '#4a9eff',
              },
              {
                icon: Server,
                title: 'Backend',
                items: ['Spring Boot 3', 'Java 21', 'REST API', 'WebSocket', 'JWT auth'],
                color: '#3fb950',
              },
              {
                icon: Database,
                title: 'Data layer',
                items: ['PostgreSQL', 'Redis cache', 'JPA / Hibernate', 'Flyway migrations', 'Connection pool'],
                color: '#d29922',
              },
            ].map((tier) => (
              <div
                key={tier.title}
                className="rounded-xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-6"
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${tier.color}1a` }}
                >
                  <tier.icon className="h-4 w-4" style={{ color: tier.color }} />
                </div>
                <h3 className="mb-4 text-sm font-semibold">{tier.title}</h3>
                <ul className="space-y-2">
                  {tier.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-[var(--color-fd-muted-foreground)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#3fb950]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="border-b border-[var(--color-fd-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              25+ languages, one scanner
            </h2>
            <p className="mx-auto mt-4 text-[var(--color-fd-muted-foreground)]">
              Semgrep rules cover every stack a polyglot codebase touches.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {[
              'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Ruby', 'PHP',
              'C#', 'C', 'C++', 'Rust', 'Kotlin', 'Swift', 'Scala', 'R',
              'Terraform', 'Dockerfile', 'YAML', 'JSON', 'Bash', 'Solidity',
              'HTML', 'JSX', 'TSX', 'Vue',
            ].map((lang) => (
              <span
                key={lang}
                className="rounded-lg border border-[var(--color-fd-border)] bg-[#0d0d10] px-3.5 py-1.5 font-mono text-xs text-[#d7d7dc] transition-all hover:border-[#e8384f]/50 hover:text-[#ff8a9a]"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-[var(--color-fd-border)] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#e8384f]">
              from the field
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Teams stop finding out about vulnerabilities in prod
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              {
                quote:
                  'We went from a quarterly pen-test surprise to fixes landing in the same PR the vulnerability was introduced in.',
                name: 'Security engineering lead',
                context: 'Series C fintech',
              },
              {
                quote:
                  'The generated patches actually match our style guide. Reviewers approve them like any other teammate\u2019s commit.',
                name: 'Staff engineer',
                context: 'Infrastructure platform team',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-6"
              >
                <Quote className="mb-4 h-5 w-5 text-[#e8384f]/60" />
                <p className="mb-6 text-[15px] leading-relaxed text-[#e4e4e8]">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]">
                    <Building2 className="h-4 w-4 text-[var(--color-fd-muted-foreground)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-[var(--color-fd-muted-foreground)]">{t.context}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-[11px] text-[#5a5a62]">
            placeholder quotes — swap in real customer testimonials before shipping
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-[var(--color-fd-border)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-fd-border)] bg-[#0d0d10] p-12 text-center md:p-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(220,20,60,0.10),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Find the next vulnerability before it ships
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[var(--color-fd-muted-foreground)]">
                Connect a repository and get your first scan back in under two minutes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/docs/getting-started"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#dc143c] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#ff4d6d]"
                >
                  Quick start guide
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/api-reference"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-fd-border)] px-6 py-2.5 text-sm font-semibold transition-all hover:border-[#48484f] hover:bg-white/[0.03]"
                >
                  <Terminal className="h-4 w-4" />
                  API reference
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dc143c]">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                JQube
              </div>
              <p className="mt-3 text-sm text-[var(--color-fd-muted-foreground)]">
                AI-powered DevSecOps.
                <br />
                Build secure software faster.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Documentation</h4>
              <ul className="space-y-2 text-sm text-[var(--color-fd-muted-foreground)]">
                <li><Link href="/docs" className="hover:text-[#e8384f]">Introduction</Link></li>
                <li><Link href="/docs/getting-started" className="hover:text-[#e8384f]">Getting started</Link></li>
                <li><Link href="/docs/architecture" className="hover:text-[#e8384f]">Architecture</Link></li>
                <li><Link href="/docs/api-reference" className="hover:text-[#e8384f]">API reference</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-[var(--color-fd-muted-foreground)]">
                <li><Link href="/docs/scanner" className="hover:text-[#e8384f]">Scanner</Link></li>
                <li><Link href="/docs/ai-remediation" className="hover:text-[#e8384f]">AI remediation</Link></li>
                <li><Link href="/docs/deployment" className="hover:text-[#e8384f]">Deployment</Link></li>
                <li><Link href="/docs/configuration" className="hover:text-[#e8384f]">Configuration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Community</h4>
              <ul className="space-y-2 text-sm text-[var(--color-fd-muted-foreground)]">
                <li><Link href="https://github.com/jqube" className="hover:text-[#e8384f]">GitHub</Link></li>
                <li><Link href="/docs/contributing" className="hover:text-[#e8384f]">Contributing</Link></li>
                <li><Link href="/docs/changelog" className="hover:text-[#e8384f]">Changelog</Link></li>
                <li><Link href="/blog" className="hover:text-[#e8384f]">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--color-fd-border)] pt-6 text-center text-sm text-[var(--color-fd-muted-foreground)]">
            © {new Date().getFullYear()} JQube. Built with passion for developer security.
          </div>
        </div>
      </footer>
    </main>
  );
}