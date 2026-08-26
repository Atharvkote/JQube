package net.jqube.scanner.models.scan;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.scanner.enums.ScanToolStatus;
import net.jqube.scanner.enums.ScannerType;
import net.jqube.scanner.models.base.Auditable;

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
        name = "scan_tool_runs",
        indexes = {
                @Index(
                        name = "idx_scan_tool_runs_scan_id",
                        columnList = "scan_id"
                ),
                @Index(
                        name = "idx_scan_tool_runs_scanner_type",
                        columnList = "scanner_type"
                ),
                @Index(
                        name = "idx_scan_tool_runs_status",
                        columnList = "status"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_scan_tool_runs_scan_scanner",
                        columnNames = {
                                "scan_id",
                                "scanner_type"
                        }
                )
        }
)
public class ScanToolRun extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "scan_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_scan_tool_runs_scan"
            )
    )
    private Scan scan;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "scanner_type",
            nullable = false,
            length = 50
    )
    private ScannerType scannerType;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private ScanToolStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(
            name = "finding_count",
            nullable = false
    )
    private int findingCount;

    @Column(
            name = "exit_code"
    )
    private Integer exitCode;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;

    @OneToMany(
            mappedBy = "toolRun",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ScanFinding> findings = new ArrayList<>();

}
