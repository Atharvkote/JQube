import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { generateRemediation, createPullRequestAPI } from '../../services/api';
import DiffViewer from '../../components/common/DiffViewer';
import {
  Bot,
  Cpu,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Code2,
  RefreshCw,
  Zap,
  Sliders
} from 'lucide-react';

const AIRemediation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    vulnerabilities,
    aiProvider,
    setAiProvider,
    addRemediationHistory,
    setVulnerabilities
  } = useContext(AppContext);

  const [selectedVuln, setSelectedVuln] = useState(null);
  const [customLanguage, setCustomLanguage] = useState('Java');
  const [customCode, setCustomCode] = useState('');
  const [remediationResult, setRemediationResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [creatingPR, setCreatingPR] = useState(false);
  const [prCreated, setPrCreated] = useState(null);

  useEffect(() => {
    if (id) {
      const vuln = vulnerabilities.find(v => v.id === id);
      if (vuln) {
        setSelectedVuln(vuln);
        setCustomLanguage(vuln.fileName?.endsWith('.java') ? 'Java' : 'JavaScript');
        setCustomCode(vuln.codeSnippet || '');
      }
    } else if (vulnerabilities.length > 0) {
      const defaultVuln = vulnerabilities[0];
      setSelectedVuln(defaultVuln);
      setCustomLanguage('Java');
      setCustomCode(defaultVuln.codeSnippet || '');
    }
  }, [id, vulnerabilities]);

  const handleSelectVuln = (vulnId) => {
    const vuln = vulnerabilities.find(v => v.id === vulnId);
    if (vuln) {
      setSelectedVuln(vuln);
      setCustomCode(vuln.codeSnippet || '');
      setRemediationResult(null);
      setPrCreated(null);
    }
  };

  const handleGenerateFix = async () => {
    setGenerating(true);
    setRemediationResult(null);
    setPrCreated(null);

    const payload = {
      language: customLanguage,
      type: selectedVuln?.cwe || 'CWE-89 SQL Injection',
      severity: selectedVuln?.severity || 'Critical',
      cwe: selectedVuln?.cwe ? selectedVuln.cwe.split(' ')[0] : 'CWE-89',
      filePath: selectedVuln?.fileName || 'PaymentController.java',
      code: customCode,
      astResult: 'AST traversal verified SQL concatenation in method body.',
      owaspCategory: 'A03:2021-Injection',
      vulnerabilityId: selectedVuln?.id || 'VULN-001',
      projectId: selectedVuln?.repository || 'payment-gateway'
    };

    try {
      const response = await generateRemediation(payload);
      setRemediationResult(response);

      // Record in local state history
      addRemediationHistory({
        id: response.historyId || Date.now(),
        projectId: selectedVuln?.repository || 'payment-gateway',
        vulnerabilityId: selectedVuln?.id || 'VULN-001',
        language: customLanguage,
        severity: selectedVuln?.severity || 'Critical',
        originalCode: customCode,
        fixedCode: response.fixedCode,
        summary: response.summary,
        confidence: response.confidence,
        status: 'Remediated',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePullRequest = async () => {
    if (!remediationResult) return;
    setCreatingPR(true);

    try {
      const payload = {
        vulnerabilityId: selectedVuln?.id || 'VULN-001',
        owner: 'atharvkote',
        repo: selectedVuln?.repository || 'payment-gateway',
        filePath: selectedVuln?.fileName || 'PaymentController.java',
        fixedCode: remediationResult.fixedCode,
        commitMessage: `fix: AI remediation patch for ${selectedVuln?.cwe || 'vulnerability'}`,
        prTitle: `fix: AI-remediated ${selectedVuln?.cwe ? selectedVuln.cwe.split(' ')[0] : 'vulnerability'} in ${selectedVuln?.fileName || 'PaymentController.java'}`
      };

      const pr = await createPullRequestAPI(payload);
      setPrCreated(pr);

      // Update vulnerability status in context
      if (selectedVuln) {
        setVulnerabilities(prev => prev.map(v => v.id === selectedVuln.id ? { ...v, status: 'Remediated' } : v));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPR(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & AI Provider Switcher */}
      <div className="p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-blue-500" /> AI Remediation Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated AST-aware patch generation preserving original business logic with OWASP best practices.
          </p>
        </div>

        {/* AI Provider Config Selection */}
        <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <Sliders className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-semibold text-slate-300">Provider:</span>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-blue-400 font-bold px-3 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="openai">OpenAI (GPT-4o)</option>
            <option value="gemini">Google Gemini 1.5</option>
            <option value="ollama">Ollama (Local Llama 3)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Selector & Remediator */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Vulnerability Details */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white tracking-wide">Target Vulnerability</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
              {selectedVuln?.id}
            </span>
          </div>

          {/* Vulnerability Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Vulnerability</label>
            <select
              value={selectedVuln?.id || ''}
              onChange={(e) => handleSelectVuln(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {vulnerabilities.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.cwe.split(' ')[0]} ({v.repository})
                </option>
              ))}
            </select>
          </div>

          {selectedVuln && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-500 font-medium">Severity</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  selectedVuln.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-400'
                }`}>
                  {selectedVuln.severity}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-500 font-medium">Repository</span>
                <span className="text-slate-200 font-mono">{selectedVuln.repository}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-500 font-medium">File Path</span>
                <span className="text-slate-200 font-mono">{selectedVuln.fileName}:{selectedVuln.lineNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-500 font-medium">CWE Specification</span>
                <span className="text-blue-400 font-medium">{selectedVuln.cwe}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerateFix}
            disabled={generating}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing AST & Patching...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate AI Remediation
              </>
            )}
          </button>
        </div>

        {/* Right Column: Code Comparison & Results */}
        <div className="lg:col-span-2 space-y-6">

          {/* Code Viewer / Diff Viewer Box */}
          {remediationResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-green-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" /> AI Remediation Patch Ready
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{remediationResult.summary}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-xl w-max">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-green-400">Confidence: {remediationResult.confidence}%</span>
                </div>
              </div>

              {/* Interactive Diff Viewer */}
              <DiffViewer
                oldCode={customCode}
                newCode={remediationResult.fixedCode}
                splitView={true}
                fileName={selectedVuln?.fileName || 'PaymentController.java'}
              />
            </div>
          ) : (
            <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Original Vulnerable Code
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedVuln?.fileName || 'PaymentController.java'}</span>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>{customCode}</code>
              </pre>
            </div>
          )}

          {/* Create PR Action Box */}
          {remediationResult && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Ready to deploy? Open an automated Pull Request to apply this patch directly to your repository branch.
              </p>

              {prCreated ? (
                <a
                  href={prCreated.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                >
                  <GitPullRequest className="w-4 h-4" /> View PR ({prCreated.branch})
                </a>
              ) : (
                <button
                  onClick={handleCreatePullRequest}
                  disabled={creatingPR}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {creatingPR ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Pushing & Opening PR...
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-4 h-4" /> Create Pull Request
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AIRemediation;


