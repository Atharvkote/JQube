package net.jqube.server.security.qube;

import net.jqube.server.enums.QubeAuthorities;
import net.jqube.server.enums.QubeRoles;
import net.jqube.server.exceptions.qube.AccessDeniedException;
import net.jqube.server.models.qube.QubeMember;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class QubeAuthorizationService {

    public boolean hasPermission(QubeMember member, QubeAuthorities authority) {
        if (member == null || !Boolean.TRUE.equals(member.getActive())) {
            return false;
        }

        QubeRoles role = member.getRole();
        if (role == null) {
            return false;
        }

        Set<QubeAuthorities> authorities = QubePermissionPolicy.getAuthorities(role);
        return authorities.contains(authority);
    }

    public void requirePermission(QubeMember member, QubeAuthorities authority) {
        if (!hasPermission(member, authority)) {
            throw new AccessDeniedException(
                    "Access denied. Required permission: " + authority
            );
        }
    }
}
