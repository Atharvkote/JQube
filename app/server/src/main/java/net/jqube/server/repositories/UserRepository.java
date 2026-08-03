package net.jqube.server.repositories;

// Models
import net.jqube.server.models.User;

// Repositories
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Utils
import java.util.Optional;
import java.util.UUID; // Import UUID

public interface UserRepository extends JpaRepository<User, UUID> { // Changed Long to UUID
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @Query("select u from User u left join fetch u.roles where u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
}