package net.jqube.scanner.services.fingerprint;

import net.jqube.scanner.enums.ScannerType;

public interface FindingFingerprintService {

    String generateFingerprint(
            ScannerType scanner,
            String ruleId,
            String filePath,
            Integer lineStart,
            String title
    );
}
