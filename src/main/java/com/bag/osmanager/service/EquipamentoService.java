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
        List<Equipamento> equipamentos = equipamentoRepository.findAll();
        return equipamentos.stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cadastra um novo equipamento na base de dados.
     * @param dto DTO com os dados do equipamento.
     * @return O DTO do equipamento salvo.
     */
    public EquipamentoDTO cadastrar(EquipamentoDTO dto) {
        Equipamento equipamento = new Equipamento();
        BeanUtils.copyProperties(dto, equipamento);
        Equipamento salvo = equipamentoRepository.save(equipamento);
        EquipamentoDTO dtoSalvo = new EquipamentoDTO();
        BeanUtils.copyProperties(salvo, dtoSalvo);
        return dtoSalvo;
    }

    private EquipamentoDTO converteParaDTO(Equipamento equipamento) {
        EquipamentoDTO dto = new EquipamentoDTO();
        BeanUtils.copyProperties(equipamento, dto);
        return dto;
    }
}