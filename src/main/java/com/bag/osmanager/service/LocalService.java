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
 * Serviço para gerir a lógica de negócio relacionada a Locais.
 */
@Service
@RequiredArgsConstructor
public class LocalService {

    // Injetamos o repositório para podermos aceder à base de dados
    private final LocalRepository localRepository;

    /**
     * Busca todos os locais cadastrados na base de dados e os converte para DTOs.
     * @return Uma lista de LocalDTO.
     */
    public List<LocalDTO> listarTodos() {
        // Usamos o método findAll() do repositório para obter todas as entidades
        List<Local> locais = localRepository.findAll();

        // Convertemos cada entidade Local para um LocalDTO
        return locais.stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Método privado para converter uma entidade Local num LocalDTO.
     * @param local A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    private LocalDTO converteParaDTO(Local local) {
        LocalDTO dto = new LocalDTO();
        BeanUtils.copyProperties(local, dto);
        return dto;
    }
}
