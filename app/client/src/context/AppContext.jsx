import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Mock Initial Data
const initialRepositories = [
  { id: 1, name: 'e-commerce-api', url: 'https://github.com/atharvkote/e-commerce-api', language: 'Java', branch: 'main', status: 'Active', lastScan: '2026-07-22 14:32', vulnerabilities: { critical: 1, high: 2, medium: 3, low: 5 } },
  { id: 2, name: 'auth-service', url: 'https://github.com/atharvkote/auth-service', language: 'Go', branch: 'master', status: 'Active', lastScan: '2026-07-21 09:15', vulnerabilities: { critical: 0, high: 1, medium: 2, low: 1 } },
  { id: 3, name: 'payment-gateway', url: 'https://github.com/atharvkote/payment-gateway', language: 'JavaScript', branch: 'develop', status: 'Critical', lastScan: '2026-07-22 18:45', vulnerabilities: { critical: 2, high: 3, medium: 1, low: 4 } },
  { id: 4, name: 'notification-hub', url: 'https://github.com/atharvkote/notification-hub', language: 'Python', branch: 'main', status: 'Safe', lastScan: '2026-07-20 11:20', vulnerabilities: { critical: 0, high: 0, medium: 0, low: 2 } },
  { id: 5, name: 'jqube-dashboard', url: 'https://github.com/atharvkote/jqube-dashboard', language: 'JavaScript', branch: 'feature/dashboard', status: 'Scanning', lastScan: 'Scanning...', vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 } },
  { id: 6, name: 'user-management-system', url: 'https://github.com/atharvkote/user-management-system', language: 'Java', branch: 'main', status: 'Inactive', lastScan: '2026-07-15 16:10', vulnerabilities: { critical: 0, high: 2, medium: 8, low: 10 } }
];

const initialVulnerabilities = [
  {
    id: 'VULN-001',
    severity: 'Critical',
    repository: 'payment-gateway',
    fileName: 'PaymentController.java',
    lineNumber: 48,
    cve: 'CVE-2026-2549',
    cwe: 'CWE-89 (SQL Injection)',
    cvss: 9.8,
    status: 'Open',
    description: 'Improper neutralization of special elements used in an SQL Command (SQL Injection) allows remote attackers to execute arbitrary SQL commands via the transactionId parameter.',
    risk: 'An attacker can read, modify, or delete sensitive payment database records, bypass authentication, or execute administrative operations.',
    codeSnippet: `public Response getTransactionDetails(String transactionId) {
    String query = "SELECT * FROM transactions WHERE tx_id = '" + transactionId + "'";
    Query sqlQuery = entityManager.createNativeQuery(query);
    List<Transaction> results = sqlQuery.getResultList();
    return new Response("success", results);
}`,
    recommendation: 'Use prepared statements or parameterized queries instead of concatenating raw strings in native SQL queries.',
    aiExplanation: 'The vulnerability is a classic SQL Injection. By concatenating `transactionId` directly into the SQL query string, any user-supplied input in `transactionId` is parsed as SQL commands. To remedy this, we should bind the parameter using JPA/Hibernate standard ParameterBinding.',
    secureCodeSuggestion: `public Response getTransactionDetails(String transactionId) {
    String query = "SELECT * FROM transactions WHERE tx_id = :transactionId";
    Query sqlQuery = entityManager.createNativeQuery(query, Transaction.class);
    sqlQuery.setParameter("transactionId", transactionId);
    List<Transaction> results = sqlQuery.getResultList();
    return new Response("success", results);
}`,
    patchPreview: `@@ -48,3 +48,4 @@
-    String query = "SELECT * FROM transactions WHERE tx_id = '" + transactionId + "'";
-    Query sqlQuery = entityManager.createNativeQuery(query);
+    String query = "SELECT * FROM transactions WHERE tx_id = :transactionId";
+    Query sqlQuery = entityManager.createNativeQuery(query, Transaction.class);
+    sqlQuery.setParameter("transactionId", transactionId);`,
    regressionTests: '✔️ Verify valid input format matching transaction pattern (TX-[0-9]{6})\n✔️ Check behavior with SQL characters (\', --, /*) - returns empty rather than error\n✔️ Ensure database connection uses least privilege policy'
  },
  {
    id: 'VULN-002',
    severity: 'High',
    repository: 'e-commerce-api',
    fileName: 'JwtUtil.java',
    lineNumber: 22,
    cve: 'CVE-2026-1982',
    cwe: 'CWE-328 (Weak Hash)',
    cvss: 7.5,
    status: 'Open',
    description: 'Use of a Broken or Risky Cryptographic Algorithm. The JWT configuration is using standard SHA-1 or MD5 algorithms for encryption/signature verification which are vulnerable to collision attacks.',
    risk: 'Attackers can forge JWT tokens containing arbitrary authorization levels, resulting in complete authentication bypass and privilege escalation.',
    codeSnippet: `public String generateToken(UserDetails userDetails) {
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .signWith(SignatureAlgorithm.HS256, "my-very-weak-secret-key-that-is-too-short-12345")
        .compact();
}`,
    recommendation: 'Use HS256 with a cryptographically secure key of at least 256 bits, or use RS256 (asymmetric keys) and load the secret key from environment configurations.',
    aiExplanation: 'The cryptographic key used for HS256 signing is a hardcoded, weak string literal. This allows off-line brute force attacks to retrieve the secret. Additionally, using short secret keys with HS256 violates security requirements.',
    secureCodeSuggestion: `@Value("\${jwt.secret}")
private String jwtSecret;

public String generateToken(UserDetails userDetails) {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    Key key = Keys.hmacShaKeyFor(keyBytes);
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
}`,
    patchPreview: `@@ -22,3 +22,5 @@
-        .signWith(SignatureAlgorithm.HS256, "my-very-weak-secret-key-that-is-too-short-12345")
+        .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)), SignatureAlgorithm.HS256)`,
    regressionTests: '✔️ Assert token signature validation fails when modified by 1 bit\n✔️ Verify key size is >= 256 bits on startup\n✔️ Test compatibility with expired tokens rejection'
  },
  {
    id: 'VULN-003',
    severity: 'High',
    repository: 'payment-gateway',
    fileName: 'SecurityConfiguration.java',
    lineNumber: 15,
    cve: 'CVE-2025-8891',
    cwe: 'CWE-319 (Cleartext Transmission)',
    cvss: 8.1,
    status: 'Open',
    description: 'Transmission of Sensitive Information of Cleartext. The Spring Security config allows HTTP access to the webhook endpoints without enforcing TLS/SSL protocols.',
    risk: 'Sensitive transaction details and webhooks payload (including signatures and customer emails) can be intercepted via a Man-in-the-Middle (MitM) attack.',
    codeSnippet: `http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/webhooks/**").permitAll()
    .anyRequest().authenticated()
);`,
    recommendation: 'Configure Spring Security to enforce HTTPS channel security for sensitive endpoints or globally.',
    aiExplanation: 'The webhook configuration allows plain-text HTTP connections. In addition to forcing SSL in the server configurations, configuring channel security in Spring Security prevents unencrypted payloads from reaching the controllers.',
    secureCodeSuggestion: `http.requiresChannel(channel -> channel
    .requestMatchers("/api/webhooks/**").requiresSecure()
)
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/webhooks/**").permitAll()
    .anyRequest().authenticated()
);`,
    patchPreview: `@@ -15,3 +15,6 @@
+http.requiresChannel(channel -> channel
+    .requestMatchers("/api/webhooks/**").requiresSecure()
+)`,
    regressionTests: '✔️ Confirm requests on HTTP are redirected to HTTPS\n✔️ Check TLS 1.3 handshake negotiation works\n✔️ Assert API client connections without SSL are rejected'
  },
  {
    id: 'VULN-004',
    severity: 'Medium',
    repository: 'e-commerce-api',
    fileName: 'ProductService.java',
    lineNumber: 104,
    cve: 'CVE-2025-4122',
    cwe: 'CWE-400 (Uncontrolled Resource Consumption)',
    cvss: 5.3,
    status: 'Remediated',
    description: 'Uncontrolled Resource Consumption (DoS). The service does not enforce pagination limits on catalog database queries, leading to memory exhaustion if the product list grows.',
    risk: 'An attacker can query a extremely large number of products causing Server Out of Memory (OOM) errors and service outage.',
    codeSnippet: `public List<Product> getAllProducts() {
    return productRepository.findAll();
}`,
    recommendation: 'Enforce default and maximum limits on request parameters and return a Page object instead of a full List.',
    aiExplanation: 'Requesting the entire product list at once places a high burden on JVM heap memory and SQL bandwidth. Using Pageable wraps query execution in limits.',
    secureCodeSuggestion: `public Page<Product> getAllProducts(Pageable pageable) {
    int size = Math.min(pageable.getPageSize(), 100); // enforce max limit
    Pageable limited = PageRequest.of(pageable.getPageNumber(), size, pageable.getSort());
    return productRepository.findAll(limited);
}`,
    patchPreview: `@@ -104,2 +104,4 @@
-public List<Product> getAllProducts() {
-    return productRepository.findAll();
+public Page<Product> getAllProducts(Pageable pageable) {
+    Pageable limited = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), 100));
+    return productRepository.findAll(limited);`,
    regressionTests: '✔️ Assert max page size is never higher than 100\n✔️ Verify database latency is bounded'
  },
  {
    id: 'VULN-005',
    severity: 'Low',
    repository: 'auth-service',
    fileName: 'UserService.java',
    lineNumber: 73,
    cve: 'N/A',
    cwe: 'CWE-544 (Missing Standard Error Handling)',
    cvss: 3.1,
    status: 'Open',
    description: 'Use of raw Exceptions instead of typed custom exceptions. The login method prints stack traces directly to console output which may leak inner file layouts.',
    risk: 'System execution paths and component paths might be exposed in logs to users during login failures.',
    codeSnippet: `try {
    authenticateUser(username, password);
} catch (Exception e) {
    e.printStackTrace();
    throw new RuntimeException("Login failed");
}`,
    recommendation: 'Log errors using a secure structured logger framework and throw typed errors (e.g., InvalidCredentialsException).',
    aiExplanation: '`e.printStackTrace()` writes directly to standard error streams, bypassing centralized log formatters and encryption. Throwing a generic `RuntimeException` masks internal state errors.',
    secureCodeSuggestion: `private static final Logger log = LoggerFactory.getLogger(UserService.class);

try {
    authenticateUser(username, password);
} catch (BadCredentialsException e) {
    log.error("Authentication failed for user: {}", username);
    throw new InvalidCredentialsException("Username or password incorrect");
}`,
    patchPreview: `@@ -73,4 +73,4 @@
-    e.printStackTrace();
-    throw new RuntimeException("Login failed");
+    log.error("Authentication failed for user: {}", username);
+    throw new InvalidCredentialsException("Username or password incorrect");`,
    regressionTests: '✔️ Check console streams do not contain stacks during tests\n✔️ Verify invalid login returns uniform message without backend metadata'
  }
];

const initialScanHistory = [
  { id: 'SCAN-87', repository: 'payment-gateway', time: '2026-07-22 18:45', duration: '2m 14s', totalIssues: 6, status: 'Completed', trigger: 'Git Webhook (Commit a1b2c3d)' },
  { id: 'SCAN-86', repository: 'e-commerce-api', time: '2026-07-22 14:32', duration: '3m 05s', totalIssues: 8, status: 'Completed', trigger: 'Manual Trigger' },
  { id: 'SCAN-85', repository: 'auth-service', time: '2026-07-21 09:15', duration: '1m 40s', totalIssues: 3, status: 'Completed', trigger: 'Git Webhook (PR #14)' },
  { id: 'SCAN-84', repository: 'notification-hub', time: '2026-07-20 11:20', duration: '45s', totalIssues: 2, status: 'Completed', trigger: 'Cron Schedule' },
  { id: 'SCAN-83', repository: 'payment-gateway', time: '2026-07-19 15:30', duration: '2m 10s', totalIssues: 9, status: 'Completed', trigger: 'Manual Trigger' }
];

const initialPullRequests = [
  { id: 'PR-102', number: '#12', title: 'fix: remediate SQL Injection in PaymentController', repository: 'payment-gateway', branch: 'jqube-patch-sql-injection', status: 'Merged', createdDate: '2026-07-22 19:10', prUrl: 'https://github.com/atharvkote/payment-gateway/pull/12' },
  { id: 'PR-101', number: '#5', title: 'security: fix JwtUtil broken key specification', repository: 'e-commerce-api', branch: 'jqube-patch-jwt-weak-key', status: 'Open', createdDate: '2026-07-22 15:00', prUrl: 'https://github.com/atharvkote/e-commerce-api/pull/5' },
  { id: 'PR-100', number: '#8', title: 'fix: add pagination limits in ProductService', repository: 'e-commerce-api', branch: 'jqube-patch-product-pagination', status: 'Merged', createdDate: '2026-07-22 14:50', prUrl: 'https://github.com/atharvkote/e-commerce-api/pull/8' }
];

const initialNotifications = [
  { id: 1, type: 'critical', title: 'Critical Vulnerability Detected', message: 'SQL Injection found in payment-gateway:PaymentController.java', time: '5 mins ago', read: false },
  { id: 2, type: 'scan', title: 'Scan Completed Successfully', message: 'Repository e-commerce-api scan completed. 8 vulnerabilities found.', time: '2 hours ago', read: false },
  { id: 3, type: 'pr', title: 'Secure Pull Request Created', message: 'PR #12 opened for payment-gateway automated remediation.', time: '4 hours ago', read: true },
  { id: 4, type: 'warning', title: 'Scanner Warning', message: 'Branch develop on payment-gateway lacks pre-commit hooks configured.', time: '1 day ago', read: true }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: 'atharvkote',
    email: 'atharvkote@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
    repoCount: 6,
    scansCount: 87,
    connectedRepos: ['payment-gateway', 'e-commerce-api', 'auth-service', 'notification-hub']
  });

  const initialGitRepos = [
    { id: 1, provider: 'github', owner: 'atharvkote', repo: 'payment-gateway', branch: 'develop', webhookStatus: 'Active', connectedAt: '2026-07-22 14:00' },
    { id: 2, provider: 'github', owner: 'atharvkote', repo: 'e-commerce-api', branch: 'main', webhookStatus: 'Active', connectedAt: '2026-07-21 11:30' },
    { id: 3, provider: 'gitlab', owner: 'atharvkote', repo: 'auth-service', branch: 'master', webhookStatus: 'Active', connectedAt: '2026-07-20 09:15' }
  ];

  const initialRemediationHistory = [
    {
      id: 101,
      projectId: 'payment-gateway',
      vulnerabilityId: 'VULN-001',
      language: 'Java',
      severity: 'Critical',
      originalCode: `String query = "SELECT * FROM transactions WHERE tx_id = '" + transactionId + "'";\nQuery sqlQuery = entityManager.createNativeQuery(query);`,
      fixedCode: `String query = "SELECT * FROM transactions WHERE tx_id = :transactionId";\nQuery sqlQuery = entityManager.createNativeQuery(query, Transaction.class);\nsqlQuery.setParameter("transactionId", transactionId);`,
      summary: 'Remediated CWE-89 (SQL Injection) via OpenAI GPT-4o. Applied parameter binding.',
      confidence: 96,
      status: 'Remediated',
      pullRequestUrl: 'https://github.com/atharvkote/payment-gateway/pull/12',
      createdAt: '2026-07-22 19:10'
    },
    {
      id: 102,
      projectId: 'e-commerce-api',
      vulnerabilityId: 'VULN-004',
      language: 'Java',
      severity: 'Medium',
      originalCode: `public List<Product> getAllProducts() {\n    return productRepository.findAll();\n}`,
      fixedCode: `public Page<Product> getAllProducts(Pageable pageable) {\n    int size = Math.min(pageable.getPageSize(), 100);\n    Pageable limited = PageRequest.of(pageable.getPageNumber(), size, pageable.getSort());\n    return productRepository.findAll(limited);\n}`,
      summary: 'Remediated CWE-400 (DoS) via Gemini 1.5. Added pagination memory limit bounds.',
      confidence: 94,
      status: 'PR_Created',
      pullRequestUrl: 'https://github.com/atharvkote/e-commerce-api/pull/8',
      createdAt: '2026-07-22 14:50'
    }
  ];

  const initialWebhookLogs = [
    { id: 1, provider: 'github', eventType: 'push', repository: 'payment-gateway', branch: 'main', commitHash: 'a1b2c3d', status: 'scanned', receivedAt: '2026-07-22 18:45', payload: '{"ref":"refs/heads/main","repository":{"full_name":"atharvkote/payment-gateway"}}' },
    { id: 2, provider: 'github', eventType: 'pull_request', repository: 'e-commerce-api', branch: 'feature/payment', commitHash: '5e6f7g8', status: 'scanned', receivedAt: '2026-07-22 14:32', payload: '{"action":"opened","pull_request":{"title":"Feature update"}}' },
    { id: 3, provider: 'gitlab', eventType: 'Push Hook', repository: 'auth-service', branch: 'master', commitHash: '9h0i1j2', status: 'scanned', receivedAt: '2026-07-21 09:15', payload: '{"event_name":"push","project":{"name":"auth-service"}}' }
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [repositories, setRepositories] = useState(initialRepositories);
  const [gitRepositories, setGitRepositories] = useState(initialGitRepos);
  const [vulnerabilities, setVulnerabilities] = useState(initialVulnerabilities);
  const [scanHistory, setScanHistory] = useState(initialScanHistory);
  const [remediationHistory, setRemediationHistory] = useState(initialRemediationHistory);
  const [webhookLogs, setWebhookLogs] = useState(initialWebhookLogs);
  const [pullRequests, setPullRequests] = useState(initialPullRequests);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState('openai'); // openai | gemini | ollama
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    slackAlerts: false,
    autoRemediation: true,
    aiProvider: 'openai'
  });

  // Calculate stats based on vulnerabilities
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    totalScans: 87,
    totalRepos: 6
  });

  useEffect(() => {
    // Dynamically calculate stats from vulnerabilities database
    const openVulns = vulnerabilities.filter(v => v.status === 'Open');
    const counts = openVulns.reduce((acc, curr) => {
      const sev = curr.severity.toLowerCase();
      if (acc[sev] !== undefined) acc[sev]++;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });

    setStats({
      critical: counts.critical,
      high: counts.high,
      medium: counts.medium,
      low: counts.low,
      totalScans: scanHistory.length,
      totalRepos: repositories.length
    });
  }, [vulnerabilities, scanHistory, repositories]);

  // Login handler
  const login = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
    }, 1200);
  };

  // Logout handler
  const logout = () => {
    setIsLoggedIn(false);
  };

  // Trigger a repository scan
  const triggerScan = (repoId) => {
    const repo = repositories.find(r => r.id === repoId);
    if (!repo) return;

    // Update Repository status to Scanning
    setRepositories(prev => prev.map(r => r.id === repoId ? { ...r, status: 'Scanning', lastScan: 'Scanning...' } : r));
    
    // Add temporary scan to history
    const newScanId = `SCAN-${scanHistory.length + 88}`;
    const newScan = {
      id: newScanId,
      repository: repo.name,
      time: 'Just now',
      duration: 'Scanning...',
      totalIssues: '...',
      status: 'Scanning',
      trigger: 'Manual Trigger (J-QUBE Web Console)'
    };
    setScanHistory(prev => [newScan, ...prev]);

    // Simulate completion
    setTimeout(() => {
      setRepositories(prev => prev.map(r => r.id === repoId ? { ...r, status: 'Active', lastScan: new Date().toISOString().replace('T', ' ').substring(0, 16) } : r));
      
      setScanHistory(prev => prev.map(s => s.id === newScanId ? { ...s, duration: '1m 24s', totalIssues: 3, status: 'Completed' } : s));

      // Add a notification
      const newNotif = {
        id: Date.now(),
        type: 'scan',
        title: 'Scan Finished',
        message: `Manual scan of ${repo.name} completed successfully. 3 minor issues detected.`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 5000);
  };

  // Remediate a vulnerability and auto-create a PR
  const remediateVulnerability = (vulnId) => {
    const vuln = vulnerabilities.find(v => v.id === vulnId);
    if (!vuln) return null;

    // Simulate Remediation action
    setLoading(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        // Update vulnerability status
        setVulnerabilities(prev => prev.map(v => v.id === vulnId ? { ...v, status: 'Remediated' } : v));

        // Create a PR
        const newPrNum = pullRequests.length + 13;
        const newPr = {
          id: `PR-${pullRequests.length + 103}`,
          number: `#${newPrNum}`,
          title: `fix: AI-remediated ${vuln.cwe.split(' ')[0]} in ${vuln.fileName}`,
          repository: vuln.repository,
          branch: `jqube-patch-${vuln.id.toLowerCase()}`,
          status: 'Open',
          createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          prUrl: `https://github.com/atharvkote/${vuln.repository}/pull/${newPrNum}`
        };
        setPullRequests(prev => [newPr, ...prev]);

        // Add a notification
        const newNotif = {
          id: Date.now(),
          type: 'pr',
          title: 'Secure Pull Request Created',
          message: `Remediation patch generated. Opened PR ${newPr.number} in repository ${vuln.repository}.`,
          time: 'Just now',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);

        setLoading(false);
        resolve(newPr);
      }, 2000);
    });
  };

  // Connect Git repository
  const connectGitRepo = (data) => {
    const newRepo = {
      id: Date.now(),
      provider: data.provider || 'github',
      owner: data.owner,
      repo: data.repo,
      branch: data.branch || 'main',
      webhookStatus: 'Active',
      connectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setGitRepositories(prev => [newRepo, ...prev]);
    return newRepo;
  };

  // Disconnect Git repository
  const disconnectGitRepo = (id) => {
    setGitRepositories(prev => prev.filter(r => r.id !== id));
  };

  // Add remediation record to history
  const addRemediationHistory = (record) => {
    setRemediationHistory(prev => [record, ...prev]);
  };

  // Notification methods
  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      isLoggedIn,
      login,
      logout,
      repositories,
      setRepositories,
      gitRepositories,
      setGitRepositories,
      vulnerabilities,
      setVulnerabilities,
      scanHistory,
      remediationHistory,
      setRemediationHistory,
      webhookLogs,
      setWebhookLogs,
      pullRequests,
      notifications,
      stats,
      loading,
      setLoading,
      aiProvider,
      setAiProvider,
      settings,
      setSettings,
      triggerScan,
      remediateVulnerability,
      connectGitRepo,
      disconnectGitRepo,
      addRemediationHistory,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

