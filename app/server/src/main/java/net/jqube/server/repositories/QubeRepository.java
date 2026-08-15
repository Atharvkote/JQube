package net.jqube.server.repositories;

import net.jqube.server.models.qube.Qube;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QubeRepository extends JpaRepository<Qube, UUID> {
    Optional<Qube> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    Optional<Qube> findByGithubRepositoryIdAndIsDeletedFalse(Long githubRepositoryId);

    boolean existsByGithubRepositoryIdAndIsDeletedFalse(Long githubRepositoryId);

    Optional<Qube> findByWorkspacePathAndIsDeletedFalse(String workspacePath);

    boolean existsByWorkspacePathAndIsDeletedFalse(String workspacePath);

    Optional<Qube> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByGithubRepositoryId(Long githubRepositoryId);

    boolean existsByWorkspacePath(String workspacePath);
}
