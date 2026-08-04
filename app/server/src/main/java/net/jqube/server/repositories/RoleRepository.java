package net.jqube.server.repositories;

// Enums
import net.jqube.server.enums.SystemRoles;

// Models
import net.jqube.server.models.Role;

// Repositories
import org.springframework.data.jpa.repository.JpaRepository;

// Annotations
import org.springframework.stereotype.Repository;

// Utils
import java.util.Optional;
import java.util.UUID; // Import UUID

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> { // Changed Long to UUID
    Optional<Role> findByName(SystemRoles name);
    boolean existsByName(SystemRoles name);
}