package net.jqube.server.utils;

import lombok.RequiredArgsConstructor;
import net.jqube.server.enums.RoleName;
import net.jqube.server.models.Role;
import net.jqube.server.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
    }

    private void seedRoles() {
        if (!roleRepository.existsByName(RoleName.ROLE_ADMIN)) {
            roleRepository.save(new Role(RoleName.ROLE_ADMIN, "Administrator role with full access"));
        }
        if (!roleRepository.existsByName(RoleName.ROLE_USER)) {
            roleRepository.save(new Role(RoleName.ROLE_USER, "User role with standard access"));
        }
        if (!roleRepository.existsByName(RoleName.ROLE_VIEWER)) {
            roleRepository.save(new Role(RoleName.ROLE_VIEWER, "Viewer role with read-only access"));
        }
    }
}
