package net.jqube.scanner.models.scan;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "scan_findings",
        indexes = {
                @Index(
                        name = "idx_scan_findings_tool_run",
                        columnList = "tool_run_id"
                ),
                @Index(
                        name = "idx_scan_findings_fingerprint",
                        columnList = "fingerprint"
                ),
                @Index(
                        name = "idx_scan_findings_severity",
                        columnList = "severity"
                ),
                @Index(
                        name = "idx_scan_findings_file_path",
                        columnList = "file_path"
                )
        }
)
public class ScanFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "tool_run_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_scan_findings_tool_run"
            )
    )
    private ScanToolRun toolRun;

    @Column(
            name = "rule_id",
            length = 255
    )
    private String ruleId;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private FindingSeverity severity;

    @Column(
            nullable = false,
            length = 500
    )
    private String title;

    @Column(
            columnDefinition = "TEXT"
    )
    private String message;

    @Column(
            name = "file_path",
            length = 1000
    )
    private String filePath;

    @Column(name = "line_start")
    private Integer lineStart;

    @Column(name = "line_end")
    private Integer lineEnd;

    @Column(name = "column_start")
    private Integer columnStart;

    @Column(name = "column_end")
    private Integer columnEnd;

    @Column(
            name = "code_snippet",
            columnDefinition = "TEXT"
    )
    private String codeSnippet;

    @Column(length = 128)
    private String fingerprint;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
