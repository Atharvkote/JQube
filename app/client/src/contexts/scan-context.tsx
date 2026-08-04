import React, { createContext, useState, useCallback, useMemo } from 'react';
import type { Vulnerability, ScanHistoryItem, RemediationHistoryItem } from '@/types';
import {
  MOCK_VULNERABILITIES,
  MOCK_SCAN_HISTORY,
  MOCK_REMEDIATION_HISTORY,
} from '@/constants/mock-data';

// scan context value interface
export interface ScanContextValue {
  vulnerabilities: Vulnerability[];
  scanHistory: ScanHistoryItem[];
  remediationHistory: RemediationHistoryItem[];
  addRemediationEntry: (entry: RemediationHistoryItem) => void;
}

// create scan context
export const ScanContext = createContext<ScanContextValue | undefined>(undefined);

// provider component
export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [vulnerabilities] = useState<Vulnerability[]>(MOCK_VULNERABILITIES);
  const [scanHistory] = useState<ScanHistoryItem[]>(MOCK_SCAN_HISTORY);
  const [remediationHistory, setRemediationHistory] = useState<RemediationHistoryItem[]>(MOCK_REMEDIATION_HISTORY);

  // append remediation entry to history log
  const addRemediationEntry = useCallback((entry: RemediationHistoryItem) => {
    setRemediationHistory((prev) => [entry, ...prev]);
  }, []);

  // memoized context values
  const value = useMemo<ScanContextValue>(
    () => ({
      vulnerabilities,
      scanHistory,
      remediationHistory,
      addRemediationEntry,
    }),
    [vulnerabilities, scanHistory, remediationHistory, addRemediationEntry]
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}
