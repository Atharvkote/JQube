package net.jqube.server.services.github;

import net.jqube.server.responses.dataDTOs.GithubProfileResponse;

public interface GithubService {
    String generateAuthorizationUrl(Long userId);

    void connect(String state, String code);

    GithubProfileResponse getGithubProfile(Long userId);

    void disconnect(Long userId);
}