package net.jqube.server.services.qubes;

import net.jqube.server.dtos.qube.ImportRepoRequestDTO;
import net.jqube.server.dtos.qube.ImportRepoResponseDTO;
import net.jqube.server.dtos.qube.NewQubeDTO;
import net.jqube.server.dtos.qube.QubeDTO;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.util.UUID;

public interface QubeService {

    ImportRepoResponseDTO importRepoFromGithubAndCreateQube(ImportRepoRequestDTO request);

    QubeDTO getQube(UUID qubeId);

    QubeDTO getQubeBySlug(String slug);

    List<QubeDTO> getAllQubes();

    QubeDTO updateQube(UUID qubeId, NewQubeDTO request);

    void deleteQube(UUID qubeId);

    void archiveQube(UUID qubeId);
}
