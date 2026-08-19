package net.jqube.scanner.repositories;

import net.jqube.scanner.models.scan.ScanToolRun;
import net.jqube.scanner.models.scan.ScannerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScanToolRunRepository extends JpaRepository<ScanToolRun, UUID> {

    Optional<ScanToolRun> findByScanIdAndScannerType(UUID scanId, ScannerType scannerType);
}
