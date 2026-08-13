package net.jqube.server.constants;

public final class GithubConstants {

    private GithubConstants() {}

    // OAuth URLs
    public static final String AUTHORIZE_URL =
            "https://github.com/login/oauth/authorize";

    public static final String ACCESS_TOKEN_URL =
            "https://github.com/login/oauth/access_token";

    // API
    public static final String API_BASE_URL =
            "https://api.github.com";

    public static final String USER_ENDPOINT =
            API_BASE_URL + "/user";

    public static final String USER_EMAILS_ENDPOINT =
            API_BASE_URL + "/user/emails";

    public static final String USER_REPOS_ENDPOINT =
            API_BASE_URL + "/user/repos";

    // Headers
    public static final String ACCEPT =
            "application/vnd.github+json";

    public static final String CONTENT_TYPE =
            "application/json";

    public static final String AUTHORIZATION =
            "Authorization";

    public static final String BEARER =
            "Bearer ";

    // OAuth Scopes
    public static final String SCOPE =
            "read:user,user:email,repo";

    // Repo
    public static final String REPOSITORIES_ENDPOINT =
            API_BASE_URL + "/repos";
}