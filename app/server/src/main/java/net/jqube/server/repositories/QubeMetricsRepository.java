package net.jqube.server.repositories;

import net.jqube.server.models.qube.QubeMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QubeMetricsRepository extends JpaRepository<QubeMetrics, UUID> {
    Optional<QubeMetrics> findByQubeId(UUID qubeId);

    boolean existsByQubeId(UUID qubeId);
}