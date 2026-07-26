package net.jqube.server.repositories;

import net.jqube.server.models.GithubAccount;
import net.jqube.server.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GitHubAccountRepository extends JpaRepository<GithubAccount, UUID> {

    Optional<GithubAccount> findByUser(User user);

    Optional<GithubAccount> findByGithubId(Long githubId);

    boolean existsByUser(User user);

    boolean existsByGithubId(Long githubId);

}