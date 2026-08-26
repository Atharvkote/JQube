package net.jqube.scanner.repositories;

import net.jqube.scanner.models.scan.ScanFinding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScanFindingRepository
        extends JpaRepository<ScanFinding, UUID> {

    List<ScanFinding> findAllByToolRunId(UUID toolRunId);

    long countByToolRunId(UUID toolRunId);
}
