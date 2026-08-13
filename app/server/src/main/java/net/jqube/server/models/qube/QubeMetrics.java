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
        name = "qube_metrics",
        indexes = {
                @Index(
                        name = "idx_qube_metrics_qube",
                        columnList = "qube_id",
                        unique = true
                )
        }
)
public class QubeMetrics extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "qube_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_qube_metrics_qube")
    )
    private Qube qube;

    private UUID latestScanId;

    @Builder.Default
    @Column(nullable = false)
    private Long totalScans = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long successfulScans = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long failedScans = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long cancelledScans = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long queuedScans = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long totalFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long openFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long resolvedFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long suppressedFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long criticalFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long highFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long mediumFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long lowFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long infoFindings = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long aiRemediationsGenerated = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long pullRequestsCreated = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Long mergedPullRequests = 0L;

    // Average scan duration in milliseconds
    @Builder.Default
    @Column(nullable = false)
    private Long averageScanDurationMs = 0L;

    // Fastest scan duration in milliseconds
    @Builder.Default
    @Column(nullable = false)
    private Long fastestScanDurationMs = 0L;

    // Slowest scan duration in milliseconds
    @Builder.Default
    @Column(nullable = false)
    private Long slowestScanDurationMs = 0L;

    @Builder.Default
    @Column(nullable = false)
    private Double securityScore = 100.0;

    @Builder.Default
    @Column(nullable = false)
    private Double riskScore = 0.0;
}