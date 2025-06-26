package com.bag.osmanager.service;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.repository.EquipamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço para gerir a lógica de negócio relacionada a Equipamentos.
 */
@Service
@RequiredArgsConstructor // Anotação do Lombok que cria um construtor com os campos 'final'
public class EquipamentoService {

    // 1. Injetamos o repositório para podermos aceder à base de dados
    private final EquipamentoRepository equipamentoRepository;

    /**
     * Busca todos os equipamentos cadastrados na base de dados e os converte para DTOs.
     * @return Uma lista de EquipamentoDTO.
     */
    public List<EquipamentoDTO> listarTodos() {
        // 2. Usamos o método findAll() do repositório para obter todas as entidades
        List<Equipamento> equipamentos = equipamentoRepository.findAll();

        // 3. Convertemos cada entidade Equipamento para um EquipamentoDTO
        return equipamentos.stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Método privado para converter uma entidade Equipamento num EquipamentoDTO.
     * @param equipamento A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    private EquipamentoDTO converteParaDTO(Equipamento equipamento) {
        EquipamentoDTO dto = new EquipamentoDTO();
        // O BeanUtils.copyProperties copia os campos com nomes iguais de um objeto para o outro.
        BeanUtils.copyProperties(equipamento, dto);
        return dto;
    }
}