import { useContext } from 'react';
import { ScanContext, type ScanContextValue } from '@/contexts/scan-context';

// hook to consume scan context
export function useScan(): ScanContextValue {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
export default useScan;
