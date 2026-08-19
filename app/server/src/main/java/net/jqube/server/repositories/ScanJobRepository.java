package net.jqube.server.repositories;


import net.jqube.server.enums.ScanStatus;
import net.jqube.server.models.scans.ScanJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ScanJobRepository extends JpaRepository<ScanJob, UUID> {

    Optional<ScanJob> findFirstByQubeIdAndStatusOrderByCreatedAtDesc(
            UUID qubeId,
            ScanStatus status
    );
}