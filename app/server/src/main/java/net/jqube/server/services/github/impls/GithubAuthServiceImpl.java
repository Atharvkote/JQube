package net.jqube.server.services.github.impls;

import lombok.extern.slf4j.Slf4j;
import net.jqube.server.configs.properties.GithubProperties;
import net.jqube.server.constants.GithubConstants;
import net.jqube.server.exceptions.auth.GithubAuthenticationException;
import net.jqube.server.exceptions.shared.UserNotFoundException;
import net.jqube.server.models.github.GithubAccount;
import net.jqube.server.models.auth.User;
import net.jqube.server.repositories.GitHubAccountRepository;
import net.jqube.server.repositories.UserRepository;
import net.jqube.server.responses.dataDTOs.GithubProfileResponse;
import net.jqube.server.responses.dataDTOs.GithubTokenResponse;
import net.jqube.server.responses.dataDTOs.GithubUserResponse;
import net.jqube.server.services.github.utils.GithubStateManager;
import net.jqube.server.services.github.GithubAuthService;
import net.jqube.server.security.crypto.EncryptionService;
import net.jqube.server.services.shared.EmailService;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.beans.factory.annotation.Value;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID; // Import UUID

@Slf4j
@Service
public class GithubAuthServiceImpl implements GithubAuthService {

    private final RestClient restClient;
    private final GithubProperties githubOAuthProperties;
    private final UserRepository userRepository;
    private final GitHubAccountRepository githubAccountRepository;
    private final GithubStateManager stateService;
    private final EncryptionService encryptionService;
    private final EmailService emailService;
    private final CacheManager cacheManager;
    private final String dashboardUrl;

    GithubAuthServiceImpl(
            RestClient restClient,
            GithubProperties githubOAuthProperties,
            UserRepository userRepository,
            GitHubAccountRepository githubAccountRepository,
            GithubStateManager stateService, EncryptionService encryptionService,
            EmailService emailService,
            CacheManager cacheManager,
            @Value("${CLIENT_URL}") String clientUrl) {
        this.githubAccountRepository = githubAccountRepository;
        this.userRepository = userRepository;
        this.githubOAuthProperties = githubOAuthProperties;
        this.restClient = restClient;
        this.stateService = stateService;
        this.encryptionService = encryptionService;
        this.emailService = emailService;
        this.cacheManager = cacheManager;
        this.dashboardUrl = clientUrl + "/dashboard";
    }

    @Override
    public String generateAuthorizationUrl(UUID userId) { // Changed to UUID
        String state = stateService.generate(userId);

        return GithubConstants.AUTHORIZE_URL
                + "?client_id=" + githubOAuthProperties.getClientId()
                + "&redirect_uri=" + encode(githubOAuthProperties.getRedirectUri())
                + "&scope=" + encode(GithubConstants.SCOPE)
                + "&state=" + encode(state)
                + "&allow_signup=false";
    }

    @Override
    @Transactional
    public void connect(String state, String code) {
        UUID userId = stateService.validateAndExtractUserId(state); // Changed to UUID
        // log.info("User ID extracted from state: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        GithubTokenResponse token = exchangeCodeForToken(code);

        if (token == null || token.getAccessToken() == null) {
            String reason = token != null ? token.getErrorDescription() : "Unknown error";
            log.warn("GitHub token exchange failed for user {}: {}", userId, reason);
            throw new GithubAuthenticationException("Failed to connect GitHub account: " + reason);
        }

        GithubUserResponse githubUser = fetchGithubUser(token.getAccessToken());

        // Prevent one GitHub account being linked to two different users
        githubAccountRepository.findByGithubId(githubUser.getId())
                .filter(existing -> !existing.getUser().getId().equals(userId))
                .ifPresent(existing -> {
                    throw new GithubAuthenticationException(
                            "This GitHub account is already linked to another user.");
                });

        GithubAccount account = githubAccountRepository
                .findByUser(user)
                .orElseGet(GithubAccount::new);

        account.setUser(user);
        account.setGithubId(githubUser.getId());
        account.setUsername(githubUser.getLogin());
        account.setName(githubUser.getName());
        account.setEmail(githubUser.getEmail());
        account.setAvatarUrl(githubUser.getAvatarUrl());
        account.setProfileUrl(githubUser.getProfileUrl());
        account.setBio(githubUser.getBio());
        account.setCompany(githubUser.getCompany());
        account.setBlog(githubUser.getBlog());
        account.setLocation(githubUser.getLocation());
        account.setFollowers(githubUser.getFollowers());
        account.setFollowing(githubUser.getFollowing());
        account.setPublicRepos(githubUser.getPublicRepos());
        account.setEncryptedAccessToken(
                encryptionService.encrypt(token.getAccessToken())
        ); // AES-256 GCM Encryption

        account.setEncryptedRefreshToken(
                encryptionService.encrypt(token.getRefreshToken())
        ); // AES-256 GCM Encryption

        account.setTokenType(token.getTokenType());
        account.setScope(token.getScope());

        Instant now = Instant.now();
        account.setAccessTokenExpiresAt(
                token.getExpiresIn() != null ? now.plusSeconds(token.getExpiresIn()) : null);
        account.setRefreshTokenExpiresAt(
                token.getRefreshTokenExpiresIn() != null
                        ? now.plusSeconds(token.getRefreshTokenExpiresIn())
                        : null);

        log.info("Github account Created : {}code :{}state : {}", account, code, state);

        boolean isFirstConnection = !githubAccountRepository.existsByUser(user);
        githubAccountRepository.save(account);

        if (isFirstConnection) {
            try {
                emailService.sendWelcomeEmail(
                        user.getEmail(),
                        user.getUsername(),
                        dashboardUrl);
            } catch (Exception e) {
                log.error("Failed to send welcome email to {}", user.getEmail(), e);
            }
        }

        evictGithubCaches(userId);
    }

    @Override
    public GithubProfileResponse getGithubProfile(UUID userId) { // Changed to UUID

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        GithubAccount account = githubAccountRepository
                .findByUser(user)
                .orElseThrow(() -> new GithubAuthenticationException(
                        "No GitHub account connected for this user."));

        return GithubProfileResponse.builder()
                .username(account.getUsername())
                .name(account.getName())
                .email(account.getEmail())
                .avatarUrl(account.getAvatarUrl())
                .profileUrl(account.getProfileUrl())
                .bio(account.getBio())
                .company(account.getCompany())
                .blog(account.getBlog())
                .location(account.getLocation())
                .publicRepos(account.getPublicRepos())
                .followers(account.getFollowers())
                .following(account.getFollowing())
                .connectedAt(account.getCreatedAt()) // Fixed: Using getCreatedAt() as there is no
                // getConnectedAt()
                .build();
    }

    @Override
    public void disconnect(UUID userId) { // Changed to UUID

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found."));

        GithubAccount account = githubAccountRepository
                .findByUser(user)
                .orElseThrow(() -> new GithubAuthenticationException(
                        "No GitHub account connected for this user."));

        githubAccountRepository.delete(account);

        evictGithubCaches(userId);
    }

    private void evictGithubCaches(UUID userId) {
        cacheManager.getCache("github-profiles").evict(userId);
        cacheManager.getCache("github-repos").evict(userId);
    }

    private GithubTokenResponse exchangeCodeForToken(String code) {
        return restClient.post()
                .uri(GithubConstants.ACCESS_TOKEN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(new TokenRequest(
                        githubOAuthProperties.getClientId(),
                        githubOAuthProperties.getClientSecret(),
                        code,
                        githubOAuthProperties.getRedirectUri()))
                .retrieve()
                .body(GithubTokenResponse.class);
    }

    private GithubUserResponse fetchGithubUser(String accessToken) {
        return restClient.get()
                .uri(GithubConstants.USER_ENDPOINT)
                .header(GithubConstants.AUTHORIZATION, GithubConstants.BEARER + accessToken)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(GithubUserResponse.class);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record TokenRequest(
            String client_id,
            String client_secret,
            String code,
            String redirect_uri) {
    }
}
