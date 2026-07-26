package net.jqube.server.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "github_accounts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "user_id"),
                @UniqueConstraint(columnNames = "github_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;

    @Column(nullable = false)
    private String username;

    private String name;

    private String email;

    @Column(length = 1000)
    private String avatarUrl;

    @Column(length = 1000)
    private String profileUrl;

    @Column(length = 1000)
    private String bio;

    private String company;

    @Column(length = 1000)
    private String blog;

    private String location;

    private Integer publicRepos;

    private Integer followers;

    private Integer following;

    @Column(length = 5000, nullable = false)
    private String accessToken;

    @Column(length = 5000)
    private String refreshToken;

    private String tokenType;

    @Column(length = 1000)
    private String scope;

    private Instant accessTokenExpiresAt;

    private Instant refreshTokenExpiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant connectedAt;

    @UpdateTimestamp
    private Instant updatedAt;
}