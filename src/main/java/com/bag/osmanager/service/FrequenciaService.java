package com.bag.osmanager.service;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Frequencia;
import com.bag.osmanager.repository.FrequenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Contém a lógica de negócio para o gerenciamento de Frequências.
 */
@Service
@RequiredArgsConstructor // Injeta as dependências via construtor (melhor prática)
public class FrequenciaService {

    private final FrequenciaRepository frequenciaRepository;

    /**
     * Busca todas as frequências cadastradas.
     * @return Uma lista de FrequenciaDTO.
     */
    @Transactional(readOnly = true) // Otimização para operações de leitura
    public List<FrequenciaDTO> getAllFrequencias() {
        return frequenciaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cria uma nova frequência no banco de dados.
     * @param frequenciaDTO Os dados da nova frequência.
     * @return O DTO da frequência criada.
     */
    @Transactional
    public FrequenciaDTO createFrequencia(FrequenciaDTO frequenciaDTO) {
        Frequencia frequencia = new Frequencia();
        BeanUtils.copyProperties(frequenciaDTO, frequencia);
        Frequencia savedFrequencia = frequenciaRepository.save(frequencia);
        return convertToDTO(savedFrequencia);
    }

    /**
     * Deleta uma frequência pelo seu ID.
     * @param id O ID da frequência a ser deletada.
     */
    @Transactional
    public void deleteFrequencia(Long id) {
        Frequencia frequencia = frequenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Frequência com ID " + id + " não encontrada."));
        frequenciaRepository.delete(frequencia);
    }

    /**
     * Método utilitário para converter uma entidade Frequencia em um FrequenciaDTO.
     * @param frequencia A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    private FrequenciaDTO convertToDTO(Frequencia frequencia) {
        FrequenciaDTO dto = new FrequenciaDTO();
        BeanUtils.copyProperties(frequencia, dto);
        return dto;
    }
}