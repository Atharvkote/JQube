// JQube Platform — Mock Data
// Exact preservation of all existing mock datasets

import type {
  Repository,
  Vulnerability,
  ScanHistoryItem,
  Notification,
  PullRequest,
  WebhookLog,
  GitRepository,
  RemediationHistoryItem,
  AppSettings,
  User,
  DashboardSummary,
  RecentScan,
  SeverityChartItem,
  RepositoryChartItem,
  WeeklyScanItem,
} from '@/types';

// user
export const MOCK_USER: User = {
  name: 'atharvkote',
  email: 'atharv@jqube.dev',
  role: 'Security Lead',
  avatar: '',
};

// settings
export const DEFAULT_SETTINGS: AppSettings = {
  autoRemediation: true,
  emailNotifications: true,
  slackAlerts: false,
};

// repositories
export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: 'repo-001',
    name: 'e-commerce-api',
    url: 'https://github.com/atharvkote/e-commerce-api',
    branch: 'main',
    language: 'Java',
    status: 'Active',
    vulnerabilities: { critical: 1, high: 2, medium: 3, low: 5 },
  },
  {
    id: 'repo-002',
    name: 'auth-service',
    url: 'https://github.com/atharvkote/auth-service',
    branch: 'master',
    language: 'Go',
    status: 'Active',
    vulnerabilities: { critical: 0, high: 1, medium: 2, low: 1 },
  },
  {
    id: 'repo-003',
    name: 'payment-gateway',
    url: 'https://github.com/atharvkote/payment-gateway',
    branch: 'develop',
    language: 'JavaScript',
    status: 'Critical',
    vulnerabilities: { critical: 2, high: 3, medium: 1, low: 4 },
  },
  {
    id: 'repo-004',
    name: 'notification-hub',
    url: 'https://github.com/atharvkote/notification-hub',
    branch: 'main',
    language: 'Python',
    status: 'Safe',
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 2 },
  },
  {
    id: 'repo-005',
    name: 'jqube-dashboard',
    url: 'https://github.com/atharvkote/jqube-dashboard',
    branch: 'feature/dashboard',
    language: 'JavaScript',
    status: 'Scanning',
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
  },
  {
    id: 'repo-006',
    name: 'user-management-system',
    url: 'https://github.com/atharvkote/user-management-system',
    branch: 'main',
    language: 'Java',
    status: 'Inactive',
    vulnerabilities: { critical: 0, high: 2, medium: 8, low: 10 },
  },
];

// vulnerabilities
export const MOCK_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'VULN-001',
    severity: 'Critical',
    repository: 'payment-gateway',
    fileName: 'PaymentController.java',
    lineNumber: 48,
    cve: 'CVE-2026-7569',
    cwe: 'CWE-89 SQL Injection',
    cvss: 9.8,
    status: 'Open',
    description: 'Unsanitized user input concatenated directly into SQL query string in payment controller, enabling SQL injection attacks.',
    risk: 'An attacker could extract the complete database including payment details, user records, and credentials. Full database compromise possible.',
    recommendation: 'Replace string concatenation with parameterized queries using PreparedStatement or JPA Criteria API.',
    codeSnippet: `public Response getTransactionDetails(String transactionId) {\n    String query = "SELECT * FROM transactions WHERE tx_id = '" + transactionId + "'";\n    Query sqlQuery = entityManager.createNativeQuery(query);\n    List<Transaction> results = sqlQuery.getResultList();\n    return new Response("success", results);\n}`,
    secureCodeSuggestion: `public Response getTransactionDetails(String transactionId) {\n    TypedQuery<Transaction> query = entityManager.createQuery(\n        "SELECT t FROM Transaction t WHERE t.txId = :txId", Transaction.class);\n    query.setParameter("txId", transactionId);\n    List<Transaction> results = query.getResultList();\n    return new Response("success", results);\n}`,
  },
  {
    id: 'VULN-002',
    severity: 'High',
    repository: 'payment-gateway',
    fileName: 'JwtUtil.java',
    lineNumber: 22,
    cve: 'CVE-2026-1987',
    cwe: 'CWE-328 Broken Cryptographic Hash',
    cvss: 7.5,
    status: 'Open',
    description: 'JWT token signed using weak MD5 hash instead of SHA-256, allowing token forgery.',
    risk: 'Attackers can forge JWT tokens and impersonate any user, gaining unauthorized access to payment endpoints.',
    recommendation: 'Replace MD5 with HMAC-SHA256 for JWT signing.',
    codeSnippet: `private static final String SECRET = "jqube-secret";\npublic String generateToken(User user) {\n    return Jwts.builder()\n        .setSubject(user.getUsername())\n        .signWith(SignatureAlgorithm.HS256, SECRET.getBytes())\n        .compact();\n}`,
  },
  {
    id: 'VULN-003',
    severity: 'Critical',
    repository: 'e-commerce-api',
    fileName: 'ProductService.java',
    lineNumber: 112,
    cve: 'CVE-2026-4521',
    cwe: 'CWE-502 Deserialization',
    cvss: 9.1,
    status: 'Open',
    description: 'Untrusted data deserialized without validation in product import service.',
    risk: 'Remote code execution possible through crafted serialized objects in the product import pipeline.',
    recommendation: 'Implement input validation and use a safe deserialization library with whitelist filtering.',
    codeSnippet: `public Product importProduct(InputStream input) throws Exception {\n    ObjectInputStream ois = new ObjectInputStream(input);\n    return (Product) ois.readObject();\n}`,
  },
  {
    id: 'VULN-004',
    severity: 'Medium',
    repository: 'auth-service',
    fileName: 'AuthController.go',
    lineNumber: 85,
    cve: 'N/A',
    cwe: 'CWE-307 Brute Force',
    cvss: 5.3,
    status: 'Open',
    description: 'No rate limiting on authentication endpoint allowing brute force attacks.',
    risk: 'Attackers can attempt unlimited login requests to crack user passwords.',
    recommendation: 'Implement rate limiting middleware with progressive backoff.',
    codeSnippet: `func LoginHandler(w http.ResponseWriter, r *http.Request) {\n    var creds Credentials\n    json.NewDecoder(r.Body).Decode(&creds)\n    if authenticate(creds) {\n        generateToken(w, creds.Username)\n    }\n}`,
  },
  {
    id: 'VULN-005',
    severity: 'High',
    repository: 'e-commerce-api',
    fileName: 'UserController.java',
    lineNumber: 67,
    cve: 'CVE-2026-8834',
    cwe: 'CWE-79 Cross-Site Scripting',
    cvss: 7.1,
    status: 'Remediated',
    description: 'User-supplied name rendered without HTML encoding in admin panel.',
    risk: 'Stored XSS could steal admin session tokens and escalate privileges.',
    recommendation: 'Apply HTML output encoding using OWASP Java Encoder for all user-supplied content.',
    codeSnippet: `@GetMapping("/profile")\npublic String getProfile(Model model, @RequestParam String name) {\n    model.addAttribute("username", name);\n    return "profile";\n}`,
  },
  {
    id: 'VULN-006',
    severity: 'Low',
    repository: 'notification-hub',
    fileName: 'email_sender.py',
    lineNumber: 34,
    cve: 'N/A',
    cwe: 'CWE-532 Information Exposure',
    cvss: 3.1,
    status: 'Open',
    description: 'Sensitive email credentials logged in plaintext to application logs.',
    risk: 'Log files could expose SMTP credentials if accessed by unauthorized personnel.',
    recommendation: 'Remove credential logging and use environment variable references only.',
    codeSnippet: `def send_email(to, subject, body):\n    logger.info(f"Connecting with credentials: {SMTP_USER}:{SMTP_PASS}")\n    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)\n    server.login(SMTP_USER, SMTP_PASS)\n    server.sendmail(SMTP_USER, to, msg.as_string())`,
  },
  {
    id: 'VULN-007',
    severity: 'Medium',
    repository: 'payment-gateway',
    fileName: 'RefundService.java',
    lineNumber: 91,
    cve: 'N/A',
    cwe: 'CWE-862 Missing Authorization',
    cvss: 6.5,
    status: 'Open',
    description: 'Refund endpoint lacks authorization check, allowing any authenticated user to issue refunds.',
    risk: 'Unauthorized users can process fraudulent refunds on any transaction.',
    recommendation: 'Implement role-based access control (RBAC) with @PreAuthorize annotation.',
    codeSnippet: `@PostMapping("/refund")\npublic Response processRefund(@RequestBody RefundRequest request) {\n    Transaction tx = transactionService.findById(request.getTxId());\n    tx.setStatus("REFUNDED");\n    return new Response("success", tx);\n}`,
  },
  {
    id: 'VULN-008',
    severity: 'High',
    repository: 'payment-gateway',
    fileName: 'CryptoUtil.java',
    lineNumber: 15,
    cve: 'CVE-2026-3322',
    cwe: 'CWE-327 Broken Encryption',
    cvss: 8.1,
    status: 'Open',
    description: 'DES encryption used for sensitive payment data instead of AES-256.',
    risk: 'DES encryption is trivially breakable, exposing payment card data.',
    recommendation: 'Upgrade to AES-256-GCM encryption for all sensitive data.',
    codeSnippet: `public byte[] encrypt(String data) throws Exception {\n    Cipher cipher = Cipher.getInstance("DES");\n    cipher.init(Cipher.ENCRYPT_MODE, desKey);\n    return cipher.doFinal(data.getBytes());\n}`,
  },
];

// scan history
export const MOCK_SCAN_HISTORY: ScanHistoryItem[] = [
  { id: 'SCN-8841', repository: 'payment-gateway', trigger: 'Push to develop by atharvkote', time: '2026-07-30 09:45', duration: '2m 34s', totalIssues: 8, status: 'Completed' },
  { id: 'SCN-8840', repository: 'e-commerce-api', trigger: 'PR #142 merge to main', time: '2026-07-30 08:22', duration: '1m 47s', totalIssues: 3, status: 'Completed' },
  { id: 'SCN-8839', repository: 'auth-service', trigger: 'Scheduled daily scan', time: '2026-07-30 06:00', duration: '1m 12s', totalIssues: 1, status: 'Completed' },
  { id: 'SCN-8838', repository: 'notification-hub', trigger: 'Manual trigger by atharvkote', time: '2026-07-29 14:33', duration: '45s', totalIssues: 0, status: 'Completed' },
  { id: 'SCN-8837', repository: 'jqube-dashboard', trigger: 'Push to feature/dashboard', time: '2026-07-29 11:18', duration: 'Scanning...', totalIssues: 0, status: 'Scanning' },
  { id: 'SCN-8836', repository: 'user-management-system', trigger: 'Webhook push event', time: '2026-07-28 17:55', duration: '3m 22s', totalIssues: 12, status: 'Completed' },
  { id: 'SCN-8835', repository: 'payment-gateway', trigger: 'PR #89 to main', time: '2026-07-28 15:10', duration: '2m 05s', totalIssues: 5, status: 'Completed' },
  { id: 'SCN-8834', repository: 'e-commerce-api', trigger: 'Scheduled weekly scan', time: '2026-07-27 06:00', duration: 'N/A', totalIssues: 0, status: 'Failed' },
];

// notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', type: 'critical', title: 'Critical SQL Injection Found', message: 'CWE-89 SQL Injection detected in PaymentController.java:48. Immediate remediation recommended.', time: '10 minutes ago', read: false },
  { id: 'notif-002', type: 'scan', title: 'Scan Completed: payment-gateway', message: 'AST scan completed on develop branch. Found 8 vulnerabilities (2 Critical, 3 High).', time: '25 minutes ago', read: false },
  { id: 'notif-003', type: 'pr', title: 'Pull Request Created', message: 'AI-remediated PR #91 opened for CWE-89 fix in payment-gateway repository.', time: '1 hour ago', read: true },
  { id: 'notif-004', type: 'warning', title: 'Weak Cryptography Detected', message: 'DES encryption found in CryptoUtil.java. Upgrade to AES-256-GCM recommended.', time: '2 hours ago', read: true },
  { id: 'notif-005', type: 'scan', title: 'Scan Completed: e-commerce-api', message: 'Routine security scan completed. 3 issues detected across ProductService and UserController.', time: '3 hours ago', read: true },
];

// pull requests
export const MOCK_PULL_REQUESTS: PullRequest[] = [
  { id: 'pr-001', number: '#91', repository: 'payment-gateway', title: 'fix: AI-remediated CWE-89 in PaymentController.java', branch: 'fix/cwe-89-sql-injection', status: 'Open', createdDate: '2026-07-30', prUrl: 'https://github.com/atharvkote/payment-gateway/pull/91' },
  { id: 'pr-002', number: '#88', repository: 'payment-gateway', title: 'fix: Upgrade JWT signing algorithm to HS256', branch: 'fix/cwe-328-jwt-hash', status: 'Merged', createdDate: '2026-07-28', prUrl: 'https://github.com/atharvkote/payment-gateway/pull/88' },
  { id: 'pr-003', number: '#142', repository: 'e-commerce-api', title: 'fix: Safe deserialization for product import', branch: 'fix/cwe-502-deserialize', status: 'Open', createdDate: '2026-07-29', prUrl: 'https://github.com/atharvkote/e-commerce-api/pull/142' },
  { id: 'pr-004', number: '#45', repository: 'auth-service', title: 'feat: Add rate limiting middleware', branch: 'feat/rate-limit', status: 'Merged', createdDate: '2026-07-25', prUrl: 'https://github.com/atharvkote/auth-service/pull/45' },
  { id: 'pr-005', number: '#12', repository: 'notification-hub', title: 'fix: Remove credential logging from email sender', branch: 'fix/cwe-532-log-exposure', status: 'Closed', createdDate: '2026-07-20', prUrl: 'https://github.com/atharvkote/notification-hub/pull/12' },
];

// webhook logs
export const MOCK_WEBHOOK_LOGS: WebhookLog[] = [
  { id: 'wh-001', receivedAt: '2026-07-30 09:44:58', provider: 'github', eventType: 'push', repository: 'payment-gateway', branch: 'develop', commitHash: 'a1b2c3d', status: 'scanned', payload: '{"ref":"refs/heads/develop","commits":[{"id":"a1b2c3d","message":"Add refund endpoint","author":{"name":"atharvkote"}}]}' },
  { id: 'wh-002', receivedAt: '2026-07-30 08:20:11', provider: 'github', eventType: 'pull_request', repository: 'e-commerce-api', branch: 'main', commitHash: 'e4f5g6h', status: 'scanned', payload: '{"action":"closed","pull_request":{"number":142,"title":"fix: Safe deserialization","merged":true}}' },
  { id: 'wh-003', receivedAt: '2026-07-29 11:16:44', provider: 'github', eventType: 'push', repository: 'jqube-dashboard', branch: 'feature/dashboard', commitHash: 'i7j8k9l', status: 'scanning', payload: '{"ref":"refs/heads/feature/dashboard","commits":[{"id":"i7j8k9l","message":"Dashboard chart update"}]}' },
  { id: 'wh-004', receivedAt: '2026-07-28 17:54:02', provider: 'gitlab', eventType: 'push', repository: 'user-management-system', branch: 'main', commitHash: 'm0n1o2p', status: 'scanned', payload: '{"ref":"refs/heads/main","commits":[{"id":"m0n1o2p","message":"User role migration"}]}' },
];

// connected git repositories
export const MOCK_GIT_REPOSITORIES: GitRepository[] = [
  { id: 'git-001', provider: 'github', owner: 'atharvkote', repo: 'payment-gateway', branch: 'develop', webhookStatus: 'Active' },
  { id: 'git-002', provider: 'github', owner: 'atharvkote', repo: 'e-commerce-api', branch: 'main', webhookStatus: 'Active' },
  { id: 'git-003', provider: 'gitlab', owner: 'atharvkote', repo: 'auth-service', branch: 'master', webhookStatus: 'Active' },
];

// remediation history
export const MOCK_REMEDIATION_HISTORY: RemediationHistoryItem[] = [
  {
    id: 'rem-001',
    projectId: 'payment-gateway',
    vulnerabilityId: 'VULN-001',
    language: 'Java',
    severity: 'Critical',
    originalCode: 'String query = "SELECT * FROM transactions WHERE tx_id = \'" + transactionId + "\'";',
    fixedCode: 'TypedQuery<Transaction> query = entityManager.createQuery("SELECT t FROM Transaction t WHERE t.txId = :txId", Transaction.class);\nquery.setParameter("txId", transactionId);',
    summary: 'Replaced concatenated SQL with parameterized JPA TypedQuery to prevent SQL injection.',
    confidence: 97,
    status: 'Remediated',
    createdAt: '2026-07-30 09:48',
  },
  {
    id: 'rem-002',
    projectId: 'payment-gateway',
    vulnerabilityId: 'VULN-002',
    language: 'Java',
    severity: 'High',
    originalCode: 'return Jwts.builder().signWith(SignatureAlgorithm.HS256, SECRET.getBytes()).compact();',
    fixedCode: 'SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_B64));\nreturn Jwts.builder().signWith(key, SignatureAlgorithm.HS256).compact();',
    summary: 'Replaced raw string secret with Base64-decoded HMAC key using JJWT secure key builder.',
    confidence: 94,
    status: 'Remediated',
    createdAt: '2026-07-28 16:12',
  },
];

// dashboard summary (fallback)
export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  totalVulnerabilities: 102,
  critical: 8,
  high: 24,
  medium: 42,
  low: 28,
  connectedRepositories: 6,
  successfulScans: 156,
  failedScans: 5,
  avgRiskScore: 34,
  securityHealth: 78,
  trends: {
    total: '+12.4%',
    critical: '-15.0%',
    high: '+4.2%',
    health: '+2.1%',
  },
};

// dashboard severity data (fallback)
export const MOCK_SEVERITY_DATA: SeverityChartItem[] = [
  { name: 'Critical', value: 8, color: '#FF3B3B' },
  { name: 'High', value: 24, color: '#F97316' },
  { name: 'Medium', value: 42, color: '#F59E0B' },
  { name: 'Low', value: 28, color: '#3B82F6' },
];

// dashboard repository data (fallback)
export const MOCK_REPOSITORY_DATA: RepositoryChartItem[] = [
  { name: 'e-commerce-api', vulnerabilities: 11, resolved: 6 },
  { name: 'auth-service', vulnerabilities: 4, resolved: 3 },
  { name: 'payment-gateway', vulnerabilities: 22, resolved: 4 },
  { name: 'user-management-system', vulnerabilities: 20, resolved: 10 },
];

// dashboard weekly scan data (fallback)
export const MOCK_WEEKLY_SCANS: WeeklyScanItem[] = [
  { day: 'Mon', scans: 12 },
  { day: 'Tue', scans: 18 },
  { day: 'Wed', scans: 15 },
  { day: 'Thu', scans: 22 },
  { day: 'Fri', scans: 28 },
  { day: 'Sat', scans: 35 },
  { day: 'Sun', scans: 20 },
];

// dashboard recent scans (fallback)
export const MOCK_RECENT_SCANS: RecentScan[] = [
  { id: 'SCN-8841', repository: 'payment-gateway', status: 'Completed', severity: 'Critical', cveId: 'CVE-2026-7569', timestamp: '10 mins ago' },
  { id: 'SCN-8840', repository: 'e-commerce-api', status: 'Completed', severity: 'High', cveId: 'CVE-2026-1987', timestamp: '42 mins ago' },
  { id: 'SCN-8839', repository: 'auth-service', status: 'Completed', severity: 'Medium', cveId: 'N/A', timestamp: '1 hour ago' },
  { id: 'SCN-8838', repository: 'notification-hub', status: 'Completed', severity: 'Low', cveId: 'N/A', timestamp: '3 hours ago' },
  { id: 'SCN-8837', repository: 'jqube-dashboard', status: 'Scanning', severity: 'Medium', cveId: 'N/A', timestamp: '5 hours ago' },
  { id: 'SCN-8836', repository: 'user-management-system', status: 'Completed', severity: 'High', cveId: 'CVE-2026-4521', timestamp: '8 hours ago' },
  { id: 'SCN-8835', repository: 'payment-gateway', status: 'Completed', severity: 'Critical', cveId: 'CVE-2026-3322', timestamp: '12 hours ago' },
  { id: 'SCN-8834', repository: 'e-commerce-api', status: 'Failed', severity: 'Low', cveId: 'N/A', timestamp: '1 day ago' },
];
