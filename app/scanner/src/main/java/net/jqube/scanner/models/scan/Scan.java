package net.jqube.scanner.models.scan;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "scans",
        indexes = {
                @Index(
                        name = "idx_scans_job_id",
                        columnList = "job_id"
                ),
                @Index(
                        name = "idx_scans_qube_id",
                        columnList = "qube_id"
                ),
                @Index(
                        name = "idx_scans_repository_id",
                        columnList = "repository_id"
                ),
                @Index(
                        name = "idx_scans_commit_sha",
                        columnList = "commit_sha"
                ),
                @Index(
                        name = "idx_scans_status",
                        columnList = "status"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_scans_job_id",
                        columnNames = "job_id"
                )
        }
)
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "job_id",
            nullable = false,
            updatable = false
    )
    private UUID jobId;

    @Column(
            name = "qube_id",
            nullable = false,
            updatable = false
    )
    private UUID qubeId;

    @Column(
            name = "repository_id",
            nullable = false,
            updatable = false
    )
    private Long repositoryId;

    @Column(
            nullable = false,
            length = 255
    )
    private String branch;

    @Column(
            name = "commit_sha",
            nullable = false,
            length = 64,
            updatable = false
    )
    private String commitSha;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "scan_type",
            nullable = false,
            length = 50
    )
    private ScanType scanType;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "trigger_type",
            nullable = false,
            length = 50
    )
    private TriggerType triggerType;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private ScanStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(
            name = "total_findings",
            nullable = false
    )
    private int totalFindings;

    @Column(
            name = "critical_count",
            nullable = false
    )
    private int criticalCount;

    @Column(
            name = "high_count",
            nullable = false
    )
    private int highCount;

    @Column(
            name = "medium_count",
            nullable = false
    )
    private int mediumCount;

    @Column(
            name = "low_count",
            nullable = false
    )
    private int lowCount;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;

    @OneToMany(
            mappedBy = "scan",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ScanToolRun> toolRuns = new ArrayList<>();

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
