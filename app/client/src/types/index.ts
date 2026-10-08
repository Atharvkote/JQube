import type { LucideIcon } from 'lucide-react';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type VulnerabilityStatus = 'Open' | 'Remediated';
export type ScanStatus = 'Completed' | 'Scanning' | 'Failed';
export type PullRequestStatus = 'Open' | 'Merged' | 'Closed';
export type GitProvider = 'github' | 'gitlab';
export type AIProvider = 'openai' | 'gemini' | 'ollama';
export type NotificationType = 'critical' | 'scan' | 'pr' | 'warning' | 'info';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type RepoStatus = 'Active' | 'Critical' | 'Safe' | 'Scanning' | 'Inactive';
export type TimeRange = 'today' | '7d' | '30d' | '90d' | 'custom';
export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'summary' | 'scan-log';

// severity counts
export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// repository
export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  language: string;
  status: RepoStatus;
  vulnerabilities: SeverityCounts;
}

// vulnerability
export interface Vulnerability {
  id: string;
  severity: Severity;
  repository: string;
  fileName: string;
  lineNumber: number;
  cve: string;
  cwe: string;
  cvss: number;
  status: VulnerabilityStatus;
  description: string;
  risk: string;
  recommendation: string;
  codeSnippet: string;
  secureCodeSuggestion?: string;
}

// scan history / record
export interface ScanHistoryItem {
  id: string;
  repository: string;
  trigger: string;
  time: string;
  duration: string;
  totalIssues: number;
  status: ScanStatus;
}
export type ScanRecord = ScanHistoryItem;

// notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// pull request
export interface PullRequest {
  id: string;
  number: string;
  repository: string;
  title: string;
  branch: string;
  status: PullRequestStatus;
  createdDate: string;
  prUrl: string;
}

// webhook log
export interface WebhookLog {
  id: string;
  receivedAt: string;
  provider: GitProvider;
  eventType: string;
  repository: string;
  branch: string;
  commitHash: string;
  status: string;
  payload: string;
}

// git repository (connected)
export interface GitRepository {
  id: string;
  provider: GitProvider;
  owner: string;
  repo: string;
  branch: string;
  webhookStatus: string;
}

// remediation history
export interface RemediationHistoryItem {
  id: string | number;
  projectId: string;
  vulnerabilityId: string;
  language: string;
  severity: Severity;
  originalCode: string;
  fixedCode: string;
  summary: string;
  confidence: number;
  status: string;
  createdAt: string;
  pullRequestUrl?: string;
}

// settings
export interface AppSettings {
  autoRemediation: boolean;
  emailNotifications: boolean;
  slackAlerts: boolean;
}

// user & auth dtos
export interface User {
  name: string;
  username?: string;
  email: string;
  role: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  email: string;
  token: string;
  expiresIn: number;
}

export interface RegistrationSuccessDTO {
  email: string;
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// dashboard summary
export interface DashboardSummary {
  totalVulnerabilities: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  connectedRepositories: number;
  successfulScans: number;
  failedScans: number;
  avgRiskScore: number;
  securityHealth: number;
  trends?: {
    total?: string;
    critical?: string;
    high?: string;
    health?: string;
  };
}

// chart data types
export interface SeverityChartItem {
  name: string;
  value: number;
  color: string;
  percentage?: string | number;
}

export interface RepositoryChartItem {
  name: string;
  vulnerabilities: number;
  resolved: number;
}

export interface WeeklyScanItem {
  day: string;
  scans: number;
}
export type WeeklyScanDataItem = WeeklyScanItem;

// recent scan
export interface RecentScan {
  id: string;
  repository: string;
  status: ScanStatus;
  severity: Severity;
  cveId: string;
  timestamp: string;
}

// remediation request/response
export interface RemediationPayload {
  language: string;
  type: string;
  severity: string;
  cwe: string;
  filePath: string;
  code: string;
  astResult: string;
  owaspCategory: string;
  vulnerabilityId: string;
  projectId: string;
}

export interface RemediationResponse {
  fixedCode: string;
  summary: string;
  confidence: number;
  historyId?: string | number;
}

// pr creation
export interface PullRequestPayload {
  vulnerabilityId: string;
  owner: string;
  repo: string;
  filePath: string;
  fixedCode: string;
  commitMessage: string;
  prTitle: string;
}

export interface PullRequestResponse {
  pullRequestUrl: string;
  branch: string;
}

// git connect
export interface GitConnectPayload {
  provider: GitProvider;
  owner: string;
  repo: string;
  branch: string;
  personalAccessToken: string;
}

// export option
export interface ExportOption {
  label: string;
  format: ExportFormat;
  icon: LucideIcon;
}

// time range option
export interface TimeRangeOption {
  label: string;
  value: TimeRange;
}

// metric card
export interface MetricCardData {
  id: string;
  name: string;
  value: number | string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconBg: string;
}

// toast message
export interface ToastMessage {
  type: ToastType;
  title?: string;
  message: string;
}

// cicd template
export interface CICDTemplate {
  fileName: string;
  title: string;
  description: string;
  content: string;
}

// login feature
export interface LoginFeature {
  title: string;
  desc: string;
  icon: LucideIcon;
}

// component props
export interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  splitView?: boolean;
  fileName?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export interface ErrorPageProps {
  code?: string;
  title?: string;
  description?: string;
}

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

export interface ScanTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
}

export interface ChartBaseProps {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export interface SeverityPieChartProps extends ChartBaseProps {
  data?: SeverityChartItem[];
  severityData?: SeverityChartItem[] | SeverityCounts;
}

export interface RepositoryBarChartProps extends ChartBaseProps {
  data?: RepositoryChartItem[];
  repositoryData?: RepositoryChartItem[];
}

export interface WeeklyScanChartProps extends ChartBaseProps {
  data?: WeeklyScanItem[];
  weeklyScanData?: WeeklyScanItem[];
}

// ─── Qube / GitHub Repo types ───────────────────────────────────────────────

export type QubeStatus = 'Active' | 'Importing' | 'Error' | 'Inactive';
export type QubeVisibility = 'public' | 'private';

/** Shape of a GitHub repository returned from the user's account */
export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  private: boolean;
  visibility: QubeVisibility;
  html_url: string;
  language: string | null;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
}

/** A Qube — an imported GitHub repository linked to this JQube workspace */
export interface Qube {
  id: string;
  qubeName: string;
  repoName: string;
  repoOwner: string;
  fullName: string;
  description: string;
  githubUrl: string;
  visibility: QubeVisibility;
  language: string | null;
  defaultBranch: string;
  status: QubeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateQubeDTO {
  qubeName: string;
  description: string;
}
