package net.jqube.scanner.repositories;

import net.jqube.scanner.models.scan.Scan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScanRepository extends JpaRepository<Scan, UUID> {

    Optional<Scan> findByJobId(UUID jobId);

    boolean existsByJobId(UUID jobId);
}
