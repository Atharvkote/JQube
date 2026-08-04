// JQube Platform — API Service Layer
// All external calls + mock fallbacks for offline development

import type {
  DashboardSummary,
  SeverityChartItem,
  RepositoryChartItem,
  WeeklyScanItem,
  RecentScan,
  RemediationPayload,
  RemediationResponse,
  PullRequestPayload,
  PullRequestResponse,
  GitConnectPayload,
  GitRepository,
  TimeRange,
  ExportFormat,
  LoginDTO,
  RegisterDTO,
  LoginResponse,
  RegistrationSuccessDTO,
  ApiResponse,
} from '@/types';

import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_SEVERITY_DATA,
  MOCK_REPOSITORY_DATA,
  MOCK_WEEKLY_SCANS,
  MOCK_RECENT_SCANS,
} from '@/constants/mock-data';

// helpers
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Dashboard APIs

export async function fetchDashboardSummary(
  _timeRange: TimeRange
): Promise<DashboardSummary> {
  await delay(800);
  return MOCK_DASHBOARD_SUMMARY;
}

export async function fetchSeverityData(
  _timeRange: TimeRange
): Promise<SeverityChartItem[]> {
  await delay(600);
  return MOCK_SEVERITY_DATA;
}

export async function fetchRepositoryMetrics(
  _timeRange: TimeRange
): Promise<RepositoryChartItem[]> {
  await delay(700);
  return MOCK_REPOSITORY_DATA;
}

export async function fetchWeeklyScans(
  _timeRange: TimeRange
): Promise<WeeklyScanItem[]> {
  await delay(500);
  return MOCK_WEEKLY_SCANS;
}

export async function fetchRecentScans(
  _timeRange: TimeRange
): Promise<RecentScan[]> {
  await delay(650);
  return MOCK_RECENT_SCANS;
}

// Export APIs

export async function exportDashboardReport(
  format: ExportFormat,
  _options: { timeRange: TimeRange }
): Promise<void> {
  await delay(1200);
  console.info(`[API] Exported dashboard report in format: ${format}`);
}

// AI Remediation APIs

export async function generateRemediation(
  payload: RemediationPayload,
  _provider: string
): Promise<RemediationResponse> {
  await delay(2000);
  return {
    fixedCode: `// AI-remediated code for ${payload.vulnerabilityId}\n// Provider used for generation\nimport javax.persistence.TypedQuery;\n\npublic Response getTransactionDetails(String transactionId) {\n    TypedQuery<Transaction> query = entityManager.createQuery(\n        "SELECT t FROM Transaction t WHERE t.txId = :txId", Transaction.class);\n    query.setParameter("txId", transactionId);\n    List<Transaction> results = query.getResultList();\n    return new Response("success", results);\n}`,
    summary: 'Replaced direct SQL string concatenation with JPA TypedQuery parameterized binding to prevent SQL injection (CWE-89). The fix preserves the original query semantics while eliminating the injection vector.',
    confidence: 97,
    historyId: `rem-${Date.now()}`,
  };
}

// Pull Request APIs

export async function createPullRequest(
  payload: PullRequestPayload
): Promise<PullRequestResponse> {
  await delay(1500);
  return {
    pullRequestUrl: `https://github.com/${payload.owner}/${payload.repo}/pull/${Math.floor(Math.random() * 100 + 100)}`,
    branch: `fix/${payload.vulnerabilityId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  };
}

export const createPullRequestAPI = createPullRequest;

// Git Integration APIs

export async function connectGitHubRepo(
  payload: GitConnectPayload
): Promise<GitRepository> {
  await delay(1200);
  return {
    id: `git-${Date.now()}`,
    provider: payload.provider,
    owner: payload.owner,
    repo: payload.repo,
    branch: payload.branch,
    webhookStatus: 'Active',
  };
}

export async function disconnectRepo(_id: string): Promise<void> {
  await delay(500);
  console.info(`[API] Repository disconnected: ${_id}`);
}

// Authentication APIs (Spring Boot Endpoints integration)

export async function loginUser(
  loginDTO: LoginDTO
): Promise<ApiResponse<LoginResponse>> {
  await delay(1000);
  const username = loginDTO.email.split('@')[0] || 'User';
  return {
    success: true,
    status: 200,
    message: 'User logged in successfully!',
    data: {
      username,
      email: loginDTO.email,
      token: `mock-jwt-token-${Date.now()}`,
      expiresIn: 86400,
    },
  };
}

export async function registerUser(
  registerDTO: RegisterDTO
): Promise<ApiResponse<RegistrationSuccessDTO>> {
  await delay(1200);
  return {
    success: true,
    status: 200,
    message: `User registered successfully! Please verify your email (${registerDTO.email}) to activate your account.`,
    data: {
      email: registerDTO.email,
      username: registerDTO.username,
    },
  };
}

export async function verifyEmailOTP(
  email: string,
  code: string
): Promise<ApiResponse<{ verified: boolean }>> {
  await delay(1000);
  if (code.length !== 6) {
    throw new Error('Verification code must be 6 digits');
  }
  return {
    success: true,
    status: 200,
    message: `Email ${email} verified successfully! Account is now activated.`,
    data: { verified: true },
  };
}

