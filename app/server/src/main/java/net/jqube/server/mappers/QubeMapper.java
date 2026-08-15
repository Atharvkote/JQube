package net.jqube.server.mappers;

import net.jqube.server.constants.QubeConstants;
import net.jqube.server.dtos.github.RepoResponseDTO;
import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.dtos.qube.NewQubeDTO;
import net.jqube.server.dtos.qube.QubeDTO;
import net.jqube.server.enums.QubeRoles;
import net.jqube.server.models.qube.Qube;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface QubeMapper {

    QubeDTO toDTO(Qube qube, QubeRoles currentUserRole);

    ImportRepoResponseDTO toImportResponse(
            Qube qube,
            QubeRoles currentUserRole,
            String importedFrom
    );

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", source = "importRequest.name")
    @Mapping(target = "description", source = "repo.description")
    @Mapping(target = "githubRepositoryId", source = "repo.id")
    @Mapping(target = "githubNodeId", source = "repo.nodeId")
    @Mapping(target = "repositoryOwner", source = "repo.owner.login")
    @Mapping(target = "repositoryName", source = "repo.name")
    @Mapping(target = "repositoryFullName", source = "repo.fullName")
    @Mapping(target = "defaultBranch", source = "defaultBranch")
    @Mapping(target = "targetBranch", source = "targetBranch")
    @Mapping(target = "cloneUrl", source = "repo.cloneUrl")
    @Mapping(target = "htmlUrl", source = "repo.htmlUrl")
    @Mapping(target = "privateRepository", source = "repo.privateRepository")
    @Mapping(target = "workspacePath", source = "workspacePath")
    @Mapping(target = "webhookEnabled", defaultValue = QubeConstants.DEFAULT_WEBHOOK_ENABLED)
    @Mapping(target = "autoScanEnabled", defaultValue = QubeConstants.DEFAULT_AUTO_SCAN_ENABLED)
    @Mapping(target = "aiRemediationEnabled", defaultValue = QubeConstants.DEFAULT_AI_REMEDIATION_ENABLED)
    @Mapping(target = "archived", constant = "false")
    Qube toEntity(
            ImportRepoRequestDTO importRequest,
            RepoResponseDTO repo,
            String defaultBranch,
            String targetBranch,
            String workspacePath,
            String slug
    );

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Qube qube, NewQubeDTO request);
}
