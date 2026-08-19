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

    @CacheEvict(value = "qubes-list", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    ImportRepoResponseDTO importRepoFromGithubAndCreateQube(ImportRepoRequestDTO request);

    @Cacheable(value = "qubes", key = "#qubeId + ':' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    QubeDTO getQube(UUID qubeId);

    @Cacheable(value = "qubes", key = "#slug + ':' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    QubeDTO getQubeBySlug(String slug);

    @Cacheable(value = "qubes-list", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    List<QubeDTO> getAllQubes();

    @Caching(evict = {
            @CacheEvict(value = "qubes", key = "#qubeId + ':' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()"),
            @CacheEvict(value = "qubes-list", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    })
    QubeDTO updateQube(UUID qubeId, NewQubeDTO request);

    @Caching(evict = {
            @CacheEvict(value = "qubes", key = "#qubeId + ':' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()"),
            @CacheEvict(value = "qubes-list", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    })
    void deleteQube(UUID qubeId);

    @Caching(evict = {
            @CacheEvict(value = "qubes", key = "#qubeId + ':' + T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()"),
            @CacheEvict(value = "qubes-list", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    })
    void archiveQube(UUID qubeId);
}
