package net.jqube.server.services.github;

import net.jqube.server.responses.dataDTOs.GithubProfileResponse;
import java.util.UUID; // Import UUID

public interface GithubAuthService {
    String generateAuthorizationUrl(UUID userId);

    void connect(String state, String code);

    GithubProfileResponse getGithubProfile(UUID userId);

    void disconnect(UUID userId);
}