package net.jqube.server.models.qube;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.server.enums.QubeRoles;
import net.jqube.server.models.auth.User;
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
        name = "qube_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_qube_member",
                        columnNames = {
                                "qube_id",
                                "user_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_qube_member_qube",
                        columnList = "qube_id"
                ),
                @Index(
                        name = "idx_qube_member_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_qube_member_role",
                        columnList = "role"
                )
        }
)
public class QubeMember extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "qube_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_qube_member_qube")
    )
    private Qube qube;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_qube_member_user")
    )
    private User user;


    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private QubeRoles role;

    @Builder.Default
    @Column(
            nullable = false,
            columnDefinition = "BOOLEAN DEFAULT FALSE"
    )
    private Boolean invitationAccepted = false;

    @Builder.Default
    @Column(
            nullable = false,
            columnDefinition = "BOOLEAN DEFAULT TRUE"
    )
    private Boolean active = true;

    private Instant invitedAt;

    private Instant joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "invited_by",
            foreignKey = @ForeignKey(name = "fk_qube_member_invited_by")
    )
    private User invitedBy;
}