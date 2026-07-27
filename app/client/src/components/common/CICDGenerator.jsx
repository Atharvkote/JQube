import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Copy,
  Download,
  Check,
  Eye,
  FileCode,
  CheckCircle2,
  FolderGit2,
  Terminal,
  Layers
} from 'lucide-react';

const cicdTemplates = {
  github: {
    fileName: '.github/workflows/jqube-scan.yml',
    title: 'GitHub Actions Workflow',
    description: 'Automatic security & vulnerability scan on push and pull request events.',
    content: `name: J-QUBE Security & AST Vulnerability Scan

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

      - name: Execute J-QUBE Security Analyzer
        env:
          JQUBE_TOKEN: \${{ secrets.JQUBE_API_TOKEN }}
          JQUBE_SERVER_URL: 'https://jqube-server.internal.net'
        run: |
          echo "[INFO] Launching J-QUBE AST Engine..."
          curl -sSL https://raw.githubusercontent.com/atharvkote/J-QUBE/main/scripts/jqube-cli.sh | bash -s -- --repo \${{ github.repository }} --branch \${{ github.ref_name }}
`
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
    - echo "[INFO] Starting J-QUBE GitLab Runner scan..."
    - curl -sSL https://jqube.internal.net/api/cli/download -o jqube-cli
    - chmod +x jqube-cli
    - ./jqube-cli --provider gitlab --project-id $CI_PROJECT_ID --token $JQUBE_PAT_TOKEN
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'
  artifacts:
    reports:
      sast: gl-sast-report.json
`
  },
  precommit: {
    fileName: '.pre-commit-config.yaml',
    title: 'Git Pre-Commit Hook',
    description: 'Prevent developers from committing insecure SQL queries or secrets locally.',
    content: `# J-QUBE Pre-Commit Security Hook Configuration
repos:
  - repo: https://github.com/atharvkote/jqube-precommit-hooks
    rev: v1.2.0
    hooks:
      - id: jqube-ast-checker
        name: J-QUBE Pre-Commit Vulnerability Inspector
        entry: jqube-scan --local
        language: python
        types: [java, javascript, python, go]
        stages: [commit]
`
  },
  docker: {
    fileName: 'Dockerfile.scan',
    title: 'Docker Image Security Scanner',
    description: 'Containerized AST and dependency vulnerability scan image.',
    content: `# J-QUBE Standalone Scanner Container
FROM openjdk:17-slim

LABEL maintainer="security@jqube.net"
LABEL description="J-QUBE AST Vulnerability Scanner Container"

WORKDIR /app

# Download latest J-QUBE scanner binary
COPY jqube-server.jar /app/jqube-server.jar

ENTRYPOINT ["java", "-jar", "/app/jqube-server.jar", "--mode=container-scan"]
`
  }
};

const CICDGenerator = () => {
  const [activeTab, setActiveTab] = useState('github');
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
    a.download = currentTemplate.fileName.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> CI/CD Automation Workflow Generator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automatically generate ready-to-use pipeline configurations for GitHub, GitLab, Pre-Commit, and Docker.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {Object.keys(cicdTemplates).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner for Active Tab */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-blue-400" />
          <div>
            <h4 className="text-xs font-bold text-white">{currentTemplate.title}</h4>
            <p className="text-[11px] text-slate-400">{currentTemplate.description}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
          {currentTemplate.fileName}
        </span>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-[#090d16] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Viewer Actions Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-500" /> {currentTemplate.fileName}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-800 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" /> {isPreview ? 'Formatted' : 'Raw'}
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-800 flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/30 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
          <code>{currentTemplate.content}</code>
        </pre>
      </div>

    </div>
  );
};

export default CICDGenerator;
