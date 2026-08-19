package net.jqube.server.repositories;

import net.jqube.server.enums.OutboxStatus;
import net.jqube.server.models.scans.OutboxEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    List<OutboxEvent> findTop100ByStatusOrderByCreatedAtAsc(@Param("status") OutboxStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ENTITY FROM OutboxEvent ENTITY WHERE ENTITY.id = :id AND ENTITY.status = :status")
    Optional<OutboxEvent> findByIdAndStatus(@Param("id") UUID id, @Param("status") OutboxStatus status);
}
