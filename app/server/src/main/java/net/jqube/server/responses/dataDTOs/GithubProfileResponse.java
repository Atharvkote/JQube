package net.jqube.server.responses.dataDTOs;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class GithubProfileResponse {
    private String username;
    private String name;
    private String email;
    private String avatarUrl;
    private String profileUrl;
    private String bio;
    private String company;
    private String blog;
    private String location;
    private Integer publicRepos;
    private Integer followers;
    private Integer following;
    private Instant connectedAt;
}