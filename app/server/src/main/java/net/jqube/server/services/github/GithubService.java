package net.jqube.server.services.github;

import net.jqube.server.responses.dataDTOs.GithubProfileResponse;
import java.util.UUID; // Import UUID

public interface GithubService {
    String generateAuthorizationUrl(UUID userId); // Changed to UUID

    void connect(String state, String code);

    GithubProfileResponse getGithubProfile(UUID userId); // Changed to UUID

    void disconnect(UUID userId); // Changed to UUID
}