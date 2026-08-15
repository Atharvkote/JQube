package net.jqube.server.repositories;

import net.jqube.server.models.qube.QubeMember;
import net.jqube.server.enums.QubeRoles;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QubeMemberRepository extends JpaRepository<QubeMember, UUID> {
    Optional<QubeMember> findByQubeIdAndUserId(UUID qubeId, UUID userId);

    Optional<QubeMember> findByQubeIdAndUserIdAndActiveTrue(UUID qubeId, UUID userId);

    boolean existsByQubeIdAndUserId(UUID qubeId, UUID userId);

    boolean existsByQubeIdAndUserIdAndRole(
            UUID qubeId,
            UUID userId,
            QubeRoles role
    );

    List<QubeMember> findAllByUserIdAndActiveTrue(UUID userId);
}
