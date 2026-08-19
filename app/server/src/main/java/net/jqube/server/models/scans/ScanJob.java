package net.jqube.server.models.scans;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.server.enums.ScanStatus;
import net.jqube.server.models.base.Auditable;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "scan_jobs",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_scan_jobs_qube_repo_commit",
                        columnNames = {
                                "qube_id",
                                "repository_id",
                                "commit_sha"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_scan_jobs_qube",
                        columnList = "qube_id"
                ),
                @Index(
                        name = "idx_scan_jobs_repository",
                        columnList = "repository_id"
                ),
                @Index(
                        name = "idx_scan_jobs_status",
                        columnList = "status"
                )
        }
)
public class ScanJob extends Auditable {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(
            name = "qube_id",
            nullable = false
    )
    private UUID qubeId;

    @Column(
            name = "repository_id",
            nullable = false
    )
    private Long repositoryId;

    @Column(
            name = "commit_sha",
            nullable = false,
            length = 64
    )
    private String commitSha;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private ScanStatus status = ScanStatus.QUEUED;

    @Column(
            nullable = false
    )
    @Builder.Default
    private Integer attempt = 0;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;
}