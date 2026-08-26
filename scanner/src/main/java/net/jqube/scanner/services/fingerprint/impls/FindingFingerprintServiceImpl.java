package net.jqube.scanner.services.fingerprint.impls;

import net.jqube.scanner.enums.ScannerType;
import net.jqube.scanner.services.fingerprint.FindingFingerprintService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class FindingFingerprintServiceImpl implements FindingFingerprintService {

    @Override
    public String generateFingerprint(
            ScannerType scanner,
            String ruleId,
            String filePath,
            Integer lineStart,
            String title
    ) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            String raw = String.join(
                    "|",
                    scanner.name(),
                    safe(ruleId),
                    safe(filePath),
                    lineStart != null ? lineStart.toString() : "",
                    safe(title)
            );

            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }

            return hex.substring(0, 128);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
