package net.jqube.server.services.github;

import net.jqube.server.dtos.github.BranchResponseDTO;
import net.jqube.server.dtos.github.RepoResponseDTO;

import java.util.List;
import java.util.UUID;

public interface GithubRepoService {

    List<RepoResponseDTO> getAllRepos(UUID userId);

    RepoResponseDTO getRepo(
            UUID userId,
            String owner,
            String repository
    );

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

    void synchronizeRepo(
            UUID userId,
            String owner,
            String repository
    );
}