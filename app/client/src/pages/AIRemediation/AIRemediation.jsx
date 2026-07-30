import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { generateRemediation, createPullRequestAPI } from '../../services/api';
import DiffViewer from '../../components/common/DiffViewer';
import {
  Bot,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  ShieldCheck,
  Code2,
  RefreshCw,
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
      <div className="p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-[#FF3B3B]" /> AI Remediation Engine
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-[1.7]">
            Automated AST-aware patch generation preserving original business logic with OWASP best practices.
          </p>
        </div>

        {/* AI Provider Config Selection */}
        <div className="flex items-center gap-3 bg-[#0F1117] p-2 rounded-xl border border-[#FF3B3B]/15">
          <Sliders className="w-4 h-4 text-[#71717A] ml-1" />
          <span className="text-xs font-semibold text-[#A1A1AA]">Provider:</span>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="bg-[#09090B] border border-[#FF3B3B]/20 text-xs text-[#FF3B3B] font-bold px-3 py-1.5 rounded-lg focus:outline-none"
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
        <div className="lg:col-span-1 p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#FF3B3B]/15 pb-3">
            <h2 className="text-sm font-bold text-white tracking-wide">Target Vulnerability</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#FF3B3B]/10 text-[#FF3B3B] rounded">
              {selectedVuln?.id}
            </span>
          </div>

          {/* Vulnerability Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Select Vulnerability</label>
            <select
              value={selectedVuln?.id || ''}
              onChange={(e) => handleSelectVuln(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF3B3B]"
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
              <div className="flex justify-between py-2 border-b border-[#FF3B3B]/10">
                <span className="text-[#71717A] font-medium">Severity</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  selectedVuln.severity === 'Critical' ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]' : 'bg-orange-500/10 text-orange-400'
                }`}>
                  {selectedVuln.severity}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#FF3B3B]/10">
                <span className="text-[#71717A] font-medium">Repository</span>
                <span className="text-white font-mono">{selectedVuln.repository}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#FF3B3B]/10">
                <span className="text-[#71717A] font-medium">File Path</span>
                <span className="text-white font-mono">{selectedVuln.fileName}:{selectedVuln.lineNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#FF3B3B]/10">
                <span className="text-[#71717A] font-medium">CWE Specification</span>
                <span className="text-[#FF3B3B] font-medium">{selectedVuln.cwe}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerateFix}
            disabled={generating}
            className="w-full py-3.5 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF3B3B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
              <div className="p-4 bg-[#151922] border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> AI Remediation Patch Ready
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-1">{remediationResult.summary}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl w-max">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Confidence: {remediationResult.confidence}%</span>
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
            <div className="p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#FF3B3B]/15 pb-2">
                <span className="text-xs font-bold text-[#FF3B3B] flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Original Vulnerable Code
                </span>
                <span className="text-[10px] text-[#71717A] font-mono">{selectedVuln?.fileName || 'PaymentController.java'}</span>
              </div>
              <pre className="p-4 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl text-xs font-mono text-[#A1A1AA] overflow-x-auto leading-relaxed">
                <code>{customCode}</code>
              </pre>
            </div>
          )}

          {/* Create PR Action Box */}
          {remediationResult && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#FF3B3B]/15">
              <p className="text-xs text-[#A1A1AA]">
                Ready to deploy? Open an automated Pull Request to apply this patch directly to your repository branch.
              </p>

              {prCreated ? (
                <a
                  href={prCreated.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <GitPullRequest className="w-4 h-4" /> View PR ({prCreated.branch})
                </a>
              ) : (
                <button
                  onClick={handleCreatePullRequest}
                  disabled={creatingPR}
                  className="px-5 py-2.5 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF3B3B]/20 transition-all flex items-center gap-2 disabled:opacity-50"
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
