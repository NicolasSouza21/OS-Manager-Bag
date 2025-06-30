package com.bag.osmanager.service;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.repository.EquipamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço para gerir a lógica de negócio relacionada a Equipamentos.
 */
@Service
@RequiredArgsConstructor
public class EquipamentoService {

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
     * Busca um equipamento pelo ID.
     * @param id ID do equipamento.
     * @return EquipamentoDTO ou null se não encontrado.
     */
    public EquipamentoDTO buscarPorId(Long id) {
        Optional<Equipamento> op = equipamentoRepository.findById(id);
        return op.map(this::converteParaDTO).orElse(null);
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

    /**
     * Atualiza um equipamento existente.
     * @param id ID do equipamento a ser atualizado.
     * @param dto DTO com os novos dados.
     * @return O DTO atualizado, ou null se não encontrado.
     */
    public EquipamentoDTO atualizar(Long id, EquipamentoDTO dto) {
        Optional<Equipamento> op = equipamentoRepository.findById(id);
        if (op.isPresent()) {
            Equipamento equipamento = op.get();
            BeanUtils.copyProperties(dto, equipamento, "id"); // Garante que o id não será sobrescrito
            equipamento.setId(id); // Garante que está com o ID correto
            Equipamento atualizado = equipamentoRepository.save(equipamento);
            return converteParaDTO(atualizado);
        }
        return null;
    }

    /**
     * Deleta um equipamento pelo ID.
     * @param id ID do equipamento.
     * @return true se deletou, false se não encontrou.
     */
    public boolean deletar(Long id) {
        if (equipamentoRepository.existsById(id)) {
            equipamentoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private EquipamentoDTO converteParaDTO(Equipamento equipamento) {
        EquipamentoDTO dto = new EquipamentoDTO();
        BeanUtils.copyProperties(equipamento, dto);
        return dto;
    }
}