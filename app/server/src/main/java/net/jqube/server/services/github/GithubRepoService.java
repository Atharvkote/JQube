package net.jqube.server.services.github;

import net.jqube.server.dtos.github.BranchResponseDTO;
import net.jqube.server.dtos.github.RepoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface GithubRepoService {

    @org.springframework.cache.annotation.Cacheable(value = "github-repos", key = "#userId")
    List<RepoResponseDTO> getAllRepos(UUID userId);

    @org.springframework.cache.annotation.Cacheable(value = "github-repo", key = "#userId + ':' + #owner + '/' + #repository")
    RepoResponseDTO getRepo(
            UUID userId,
            String owner,
            String repository
    );

    @org.springframework.cache.annotation.Cacheable(value = "github-branches", key = "#userId + ':' + #owner + '/' + #repository")
    List<BranchResponseDTO> getRepoBranches(
            UUID userId,
            String owner,
            String repository
    );

    BranchResponseDTO getDefaultBranch(
            UUID userId,
            String owner,
            String repository
    );

    boolean repositoryExists(
            UUID userId,
            String owner,
            String repository
    );

    boolean hasRepoAccess(
            UUID userId,
            String owner,
            String repository
    );

    @org.springframework.cache.annotation.Caching(evict = {
            @org.springframework.cache.annotation.CacheEvict(value = "github-repos", key = "#userId"),
            @org.springframework.cache.annotation.CacheEvict(value = "github-repo", key = "#userId + ':' + #owner + '/' + #repository"),
            @org.springframework.cache.annotation.CacheEvict(value = "github-branches", key = "#userId + ':' + #owner + '/' + #repository")
    })
    void synchronizeRepo(
            UUID userId,
            String owner,
            String repository
    );
}
