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
    LoginDTO,
    RegisterDTO,
} from '@/types';

// context value interface for compatibility
export interface AppContextValue {
    // auth
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    isGithubConnected: boolean;
    login: (loginDTO: LoginDTO) => Promise<void>;
    register: (registerDTO: RegisterDTO) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<boolean>;
    resendVerification: (email: string) => Promise<void>;
    logout: () => void;
    connectGithub: () => Promise<void> | void;
    githubProfile?: any | null;
    disconnectGithub?: () => Promise<void> | void;

    // repositories
    repositories: Repository[];
    triggerScan: (repoId: string) => void;

    // vulnerabilities
    vulnerabilities: Vulnerability[];

    // scan history
    scanHistory: ScanHistoryItem[];

    // notifications
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
    markAllRead: () => void;
    markAllNotificationsAsRead: () => void;
    clearNotifications: () => void;

    // pull requests
    pullRequests: PullRequest[];

    // webhook logs
    webhookLogs: WebhookLog[];

    // git integration
    gitRepositories: GitRepository[];
    connectGitRepo: (repo: GitRepository) => void;
    disconnectGitRepo: (id: string) => void;

    // remediation history
    remediationHistory: RemediationHistoryItem[];
    addRemediationEntry: (entry: RemediationHistoryItem) => void;

    // settings
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

// export all context components and providers
export * from './auth-context';
export * from './github-context';
export * from './theme-context';
export * from './notification-context';
export * from './repository-context';
export * from './scan-context';
export * from './user-preferences-context';
export * from './app-providers';
