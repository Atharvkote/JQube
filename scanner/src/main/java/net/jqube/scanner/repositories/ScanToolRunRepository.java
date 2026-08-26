package net.jqube.scanner.repositories;

import net.jqube.scanner.models.scan.ScanToolRun;
import net.jqube.scanner.enums.ScannerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScanToolRunRepository
        extends JpaRepository<ScanToolRun, UUID> {

    Optional<ScanToolRun> findByScanIdAndScannerType(
            UUID scanId,
            ScannerType scannerType
    );

    List<ScanToolRun> findAllByScanId(UUID scanId);
}
