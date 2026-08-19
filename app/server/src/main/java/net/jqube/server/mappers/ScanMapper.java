package net.jqube.server.mappers;

import net.jqube.server.dtos.responses.ScanJobResponseDTO;
import net.jqube.server.models.scans.ScanJob;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScanMapper {

    @Mapping(target = "jobId", source = "id")
    ScanJobResponseDTO toResponseDTO(ScanJob scanJob);
}
