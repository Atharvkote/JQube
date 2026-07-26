package net.jqube.server.responses.dataDTOs;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GithubUserResponse {

    private Long id;
    private String login;
    private String name;
    private String email;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    @JsonProperty("html_url")
    private String profileUrl;

    private String bio;
    private String company;
    private String blog;
    private String location;

    @JsonProperty("public_repos")
    private Integer publicRepos;

    private Integer followers;
    private Integer following;
}