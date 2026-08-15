package net.jqube.server.security.qube;

import lombok.NoArgsConstructor;
import net.jqube.server.enums.QubeAuthorities;
import net.jqube.server.enums.QubeRoles;

import java.util.EnumSet;
import java.util.Set;

@NoArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public final class QubePermissionPolicy {

    private static final Set<QubeAuthorities> OWNER_AUTHORITIES = EnumSet.allOf(QubeAuthorities.class);

    private static final Set<QubeAuthorities> MAINTAINER_AUTHORITIES = EnumSet.of(
            QubeAuthorities.VIEW_QUBE,
            QubeAuthorities.UPDATE_QUBE,
            QubeAuthorities.VIEW_MEMBERS,
            QubeAuthorities.INVITE_MEMBER,
            QubeAuthorities.REMOVE_MEMBER,
            QubeAuthorities.CHANGE_MEMBER_ROLE,
            QubeAuthorities.VIEW_REPOSITORY,
            QubeAuthorities.SYNC_REPOSITORY,
            QubeAuthorities.VIEW_SCANS,
            QubeAuthorities.START_SCAN,
            QubeAuthorities.CANCEL_SCAN,
            QubeAuthorities.VIEW_FINDINGS,
            QubeAuthorities.CHANGE_FINDING_STATUS,
            QubeAuthorities.GENERATE_REMEDIATION,
            QubeAuthorities.CREATE_PULL_REQUEST,
            QubeAuthorities.MANAGE_WEBHOOKS,
            QubeAuthorities.MANAGE_SETTINGS
    );

    private static final Set<QubeAuthorities> DEVELOPER_AUTHORITIES = EnumSet.of(
            QubeAuthorities.VIEW_QUBE,
            QubeAuthorities.VIEW_MEMBERS,
            QubeAuthorities.VIEW_REPOSITORY,
            QubeAuthorities.VIEW_SCANS,
            QubeAuthorities.START_SCAN,
            QubeAuthorities.VIEW_FINDINGS,
            QubeAuthorities.CHANGE_FINDING_STATUS,
            QubeAuthorities.GENERATE_REMEDIATION
    );

    private static final Set<QubeAuthorities> VIEWER_AUTHORITIES = EnumSet.of(
            QubeAuthorities.VIEW_QUBE,
            QubeAuthorities.VIEW_MEMBERS,
            QubeAuthorities.VIEW_REPOSITORY,
            QubeAuthorities.VIEW_SCANS,
            QubeAuthorities.VIEW_FINDINGS
    );

    public static Set<QubeAuthorities> getAuthorities(QubeRoles role) {
        return switch (role) {
            case OWNER -> EnumSet.copyOf(OWNER_AUTHORITIES);
            case MAINTAINER -> EnumSet.copyOf(MAINTAINER_AUTHORITIES);
            case DEVELOPER -> EnumSet.copyOf(DEVELOPER_AUTHORITIES);
            case VIEWER -> EnumSet.copyOf(VIEWER_AUTHORITIES);
        };
    }
}
