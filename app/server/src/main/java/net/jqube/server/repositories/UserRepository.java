package net.jqube.server.repositories;

// Models
import net.jqube.server.models.User;

// Repositories
import org.springframework.data.jpa.repository.JpaRepository;

// Utils
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
}
