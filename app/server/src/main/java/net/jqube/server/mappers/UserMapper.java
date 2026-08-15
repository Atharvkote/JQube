package net.jqube.server.mappers;

import net.jqube.server.dtos.auth.UserProfileDTO;
import net.jqube.server.dtos.auth.UserResponseDTO;
import net.jqube.server.models.auth.Role;
import net.jqube.server.models.auth.User;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDTO toResponseDTO(User user);

    UserProfileDTO toProfileDTO(User user);

    default String mapRole(Role role) {
        return role.getName().name();
    }
}
