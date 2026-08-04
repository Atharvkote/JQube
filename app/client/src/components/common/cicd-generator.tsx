// JQube — CICDGenerator Component (TSX)

import { useState } from 'react';
import {
  Copy,
  Download,
  Check,
  Eye,
  FileCode,
  Terminal,
  Layers,
} from 'lucide-react';

type CICDTemplateKey = 'github' | 'gitlab' | 'precommit' | 'docker';

interface CICDTemplate {
  fileName: string;
  title: string;
  description: string;
  content: string;
}

const cicdTemplates: Record<CICDTemplateKey, CICDTemplate> = {
  github: {
    fileName: '.github/workflows/jqube-scan.yml',
    title: 'GitHub Actions Workflow',
    description: 'Automatic security & vulnerability scan on push and pull request events.',
    content: `name: JQube Security & AST Vulnerability Scan

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  jqube-security-scan:
    name: AST & Dependency Vulnerability Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Execute JQube Security Analyzer
        env:
          JQUBE_TOKEN: \${{ secrets.JQUBE_API_TOKEN }}
          JQUBE_SERVER_URL: 'https://jqube-server.internal.net'
        run: |
          echo "[INFO] Launching JQube AST Engine..."
          curl -sSL https://raw.githubusercontent.com/atharvkote/JQube/main/scripts/jqube-cli.sh | bash -s -- --repo \${{ github.repository }} --branch \${{ github.ref_name }}
`,
  },
  gitlab: {
    fileName: '.gitlab-ci.yml',
    title: 'GitLab CI Pipeline',
    description: 'Integrate continuous SAST scanning into GitLab merge requests.',
    content: `stages:
  - security-scan

jqube-ast-scan:
  stage: security-scan
  image: maven:3.9-eclipse-temurin-17
  script:
    - echo "[INFO] Starting JQube GitLab Runner scan..."
    - curl -sSL https://jqube.internal.net/api/cli/download -o jqube-cli
    - chmod +x jqube-cli
    - ./jqube-cli --provider gitlab --project-id $CI_PROJECT_ID --token $JQUBE_PAT_TOKEN
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'
  artifacts:
    reports:
      sast: gl-sast-report.json
`,
  },
  precommit: {
    fileName: '.pre-commit-config.yaml',
    title: 'Git Pre-Commit Hook',
    description: 'Prevent developers from committing insecure SQL queries or secrets locally.',
    content: `# JQube Pre-Commit Security Hook Configuration
repos:
  - repo: https://github.com/atharvkote/jqube-precommit-hooks
    rev: v1.2.0
    hooks:
      - id: jqube-ast-checker
        name: JQube Pre-Commit Vulnerability Inspector
        entry: jqube-scan --local
        language: python
        types: [java, javascript, python, go]
        stages: [commit]
`,
  },
  docker: {
    fileName: 'Dockerfile.scan',
    title: 'Docker Image Security Scanner',
    description: 'Containerized AST and dependency vulnerability scan image.',
    content: `# JQube Standalone Scanner Container
FROM openjdk:17-slim

LABEL maintainer="security@jqube.net"
LABEL description="JQube AST Vulnerability Scanner Container"

WORKDIR /app

# Download latest JQube scanner binary
COPY jqube-server.jar /app/jqube-server.jar

ENTRYPOINT ["java", "-jar", "/app/jqube-server.jar", "--mode=container-scan"]
`,
  },
};

export default function CICDGenerator() {
  const [activeTab, setActiveTab] = useState<CICDTemplateKey>('github');
  const [copied, setCopied] = useState(false);
  const [isPreview, setIsPreview] = useState(true);

  const currentTemplate = cicdTemplates[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentTemplate.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTemplate.fileName.split('/').pop() || 'cicd-config.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl p-6 space-y-5 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF3B3B]/15 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF3B3B]" /> CI/CD Automation Workflow Generator
          </h3>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-[1.7]">
            Automatically generate ready-to-use pipeline configurations for GitHub, GitLab, Pre-Commit, and Docker.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-[#0F1117] p-1 rounded-xl border border-[#FF3B3B]/15">
          {(Object.keys(cicdTemplates) as CICDTemplateKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === key
                  ? 'bg-[#FF3B3B] text-white shadow-md shadow-[#FF3B3B]/20'
                  : 'text-[#A1A1AA] hover:text-white'
                }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner for Active Tab */}
      <div className="p-4 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-[#FF3B3B]" />
          <div>
            <h4 className="text-xs font-bold text-white">{currentTemplate.title}</h4>
            <p className="text-[11px] text-[#A1A1AA]">{currentTemplate.description}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-[#FF3B3B] font-bold bg-[#FF3B3B]/10 px-2.5 py-1 rounded-lg border border-[#FF3B3B]/20">
          {currentTemplate.fileName}
        </span>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-2xl">
        {/* Viewer Actions Header */}
        <div className="px-4 py-2.5 bg-[#0F1117] border-b border-[#FF3B3B]/15 flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#71717A]" /> {currentTemplate.fileName}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-2.5 py-1 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-[#A1A1AA] hover:text-white text-xs font-medium rounded-lg border border-[#FF3B3B]/15 flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#FF3B3B]" /> {isPreview ? 'Formatted' : 'Raw'}
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-[#A1A1AA] hover:text-white text-xs font-medium rounded-lg border border-[#FF3B3B]/15 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#71717A]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#FF3B3B]/20 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 text-xs font-mono text-[#A1A1AA] overflow-x-auto leading-relaxed">
          <code>{currentTemplate.content}</code>
        </pre>
      </div>
    </div>
  );
}
