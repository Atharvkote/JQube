package net.jqube.server.models.github;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.server.models.auth.User;
import net.jqube.server.models.base.Auditable;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id", callSuper = false)
@Table(
        name = "github_accounts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_github_user", columnNames = "user_id"),
                @UniqueConstraint(name = "uk_github_id", columnNames = "github_id")
        },
        indexes = {
                @Index(name = "idx_github_username", columnList = "username"),
                @Index(name = "idx_github_id", columnList = "github_id")
        }
)
public class GithubAccount extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_github_account_user")
    )
    private User user;

    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(length = 255)
    private String name;

    @Column(length = 150)
    private String email;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @Column(name = "profile_url", length = 1000)
    private String profileUrl;

    @Column(length = 1000)
    private String bio;

    @Column(length = 255)
    private String company;

    @Column(length = 1000)
    private String blog;

    @Column(length = 255)
    private String location;

    @Column(name = "public_repos")
    private Integer publicRepos;

    private Integer followers;

    private Integer following;

    // OAuth Tokens
    @Column(name = "encrypted_access_token", nullable = false, length = 5000)
    private String encryptedAccessToken;

    @Column(name = "encrypted_refresh_token", length = 5000)
    private String encryptedRefreshToken;

    @Column(name = "token_type", length = 50)
    private String tokenType;

    @Column(length = 1000)
    private String scope;

    @Column(name = "access_token_expires_at")
    private Instant accessTokenExpiresAt;

    @Column(name = "refresh_token_expires_at")
    private Instant refreshTokenExpiresAt;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;
}