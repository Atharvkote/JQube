package net.jqube.server.models.qube;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.server.models.base.Auditable;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "qubes",
        indexes = {
                @Index(name = "idx_qube_slug", columnList = "slug", unique = true),
                @Index(name = "idx_qube_repo", columnList = "githubRepositoryId"),
                @Index(name = "idx_qube_full_name", columnList = "repositoryFullName")
        }
)
public class Qube extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Basic Information
    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(length = 2000)
    private String description;

    // GitHub Repository
    @Column(nullable = false)
    private Long githubRepositoryId;

    @Column(length = 255)
    private String githubNodeId;

    @Column(nullable = false, length = 255)
    private String repositoryOwner;

    @Column(nullable = false, length = 255)
    private String repositoryName;

    @Column(nullable = false, length = 512)
    private String repositoryFullName;

    @Column(nullable = false, length = 100)
    private String defaultBranch;

    @Column(nullable = false, length = 100)
    private String targetBranch;

    @Column(nullable = false, length = 1000)
    private String cloneUrl;

    @Column(nullable = false, length = 1000)
    private String htmlUrl;

    @Column(nullable = false)
    private Boolean privateRepository;

    @Builder.Default
    @Column(nullable = false)
    private Boolean webhookEnabled = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean autoScanEnabled = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean aiRemediationEnabled = false;

    // Lifecycle
    @Builder.Default
    @Column(nullable = false)
    private Boolean archived = false;
}