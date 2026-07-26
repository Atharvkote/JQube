package net.jqube.server.repositories;

// Enums
import net.jqube.server.enums.RoleName;

// Models
import net.jqube.server.models.Role;

// Repositories
import org.springframework.data.jpa.repository.JpaRepository;

// Annotations
import org.springframework.stereotype.Repository;

// Utils
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}
