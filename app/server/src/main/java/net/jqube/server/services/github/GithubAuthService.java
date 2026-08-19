package net.jqube.server.services.github;

import net.jqube.server.responses.dataDTOs.GithubProfileResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.UUID; // Import UUID

public interface GithubAuthService {
    String generateAuthorizationUrl(UUID userId);

    @CacheEvict(value = "github-profiles", key = "#userId")
    void connect(String state, String code);

    @Cacheable(value = "github-profiles", key = "#userId")
    GithubProfileResponse getGithubProfile(UUID userId);

    @CacheEvict(value = "github-profiles", key = "#userId")
    void disconnect(UUID userId);
}
