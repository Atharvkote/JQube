package net.jqube.server.services.scan;

import net.jqube.server.dtos.requests.ScanRequestDTO;
import net.jqube.server.dtos.responses.ScanJobResponseDTO;

import java.util.UUID;

public interface ScanService {

    ScanJobResponseDTO startScan(UUID qubeId, ScanRequestDTO request);

    ScanJobResponseDTO getScanJob(UUID jobId);
}
