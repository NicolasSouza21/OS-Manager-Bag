package com.bag.osmanager.service;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Frequencia;
import com.bag.osmanager.repository.FrequenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataIntegrityViolationException; // ✨ ALTERAÇÃO AQUI: Import necessário
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Contém a lógica de negócio para o gerenciamento de Frequências.
 */
@Service
@RequiredArgsConstructor
public class FrequenciaService {

    private final FrequenciaRepository frequenciaRepository;

    @Transactional(readOnly = true)
    public List<FrequenciaDTO> getAllFrequencias() {
        return frequenciaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FrequenciaDTO createFrequencia(FrequenciaDTO frequenciaDTO) {
        Frequencia frequencia = new Frequencia();
        BeanUtils.copyProperties(frequenciaDTO, frequencia);
        Frequencia savedFrequencia = frequenciaRepository.save(frequencia);
        return convertToDTO(savedFrequencia);
    }

    // ✨ ALTERAÇÃO AQUI: Novo método para atualizar uma frequência
    @Transactional
    public FrequenciaDTO updateFrequencia(Long id, FrequenciaDTO frequenciaDTO) {
        Frequencia frequencia = frequenciaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Frequência com ID " + id + " não encontrada."));
        
        BeanUtils.copyProperties(frequenciaDTO, frequencia, "id"); // Copia os dados, mas ignora o ID
        Frequencia updatedFrequencia = frequenciaRepository.save(frequencia);
        return convertToDTO(updatedFrequencia);
    }

    // ✨ ALTERAÇÃO AQUI: Método de exclusão agora trata o erro de integridade
    @Transactional
    public void deleteFrequencia(Long id) {
        if (!frequenciaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Frequência com ID " + id + " não encontrada.");
        }
        try {
            frequenciaRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            // Lança uma exceção mais amigável que será convertida em uma resposta 400 (Bad Request)
            throw new IllegalStateException("Não é possível excluir a frequência, pois ela já está em uso.");
        }
    }

    private FrequenciaDTO convertToDTO(Frequencia frequencia) {
        FrequenciaDTO dto = new FrequenciaDTO();
        BeanUtils.copyProperties(frequencia, dto);
        return dto;
    }
}