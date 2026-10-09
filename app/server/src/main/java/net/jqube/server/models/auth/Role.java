package net.jqube.server.models.auth;

import jakarta.persistence.*;
import lombok.*;
import net.jqube.server.enums.SystemRoles;
import net.jqube.server.models.base.Auditable;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id", callSuper = false)
@Table(
        name = "roles",
        indexes = {
                @Index(name = "idx_roles_name", columnList = "name")
        }
)
public class Role extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private SystemRoles name;

    @Column(nullable = false, length = 255)
    private String description;

    @JsonIgnore
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> users = new HashSet<>();
}