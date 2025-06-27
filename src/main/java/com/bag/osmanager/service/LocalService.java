package com.bag.osmanager.service;

import com.bag.osmanager.dto.LocalDTO;
import com.bag.osmanager.model.Local;
import com.bag.osmanager.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço para lógica de negócio relacionada a Locais.
 */
@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;

    public List<LocalDTO> listarTodos() {
        return localRepository.findAll().stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }

    public LocalDTO criar(LocalDTO dto) {
        Local local = new Local();
        BeanUtils.copyProperties(dto, local);
        Local salvo = localRepository.save(local);
        LocalDTO dtoSalvo = new LocalDTO();
        BeanUtils.copyProperties(salvo, dtoSalvo);
        return dtoSalvo;
    }

    private LocalDTO converterParaDTO(Local local) {
        LocalDTO dto = new LocalDTO();
        BeanUtils.copyProperties(local, dto);
        return dto;
    }
}