package net.jqube.server.repositories;

// Models

import net.jqube.server.models.auth.User;

import org.springframework.cache.annotation.Cacheable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID; // Import UUID

public interface UserRepository extends JpaRepository<User, UUID> { // Changed Long to UUID
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    @Cacheable(value = "user-profiles", key = "#username")
    @Query("SELECT USER FROM User USER LEFT JOIN FETCH USER.roles WHERE USER.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
}
