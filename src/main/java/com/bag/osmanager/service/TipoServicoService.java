package com.bag.osmanager.service;

import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.TipoServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoServicoService {

    private final TipoServicoRepository tipoServicoRepository;
    private final EquipamentoRepository equipamentoRepository; // ✅ Repositório injetado

    public List<TipoServicoDTO> listarTodos() {
        return tipoServicoRepository.findAll().stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    // ✅ MÉTODO 'criar' ATUALIZADO
    @Transactional
    public TipoServicoDTO criar(TipoServicoDTO dto) {
        TipoServico tipoServico = new TipoServico();
        BeanUtils.copyProperties(dto, tipoServico, "equipamentoIds");
        TipoServico salvo = tipoServicoRepository.save(tipoServico);

        // Se o DTO veio com uma lista de IDs de equipamentos, faz a associação
        if (dto.getEquipamentoIds() != null && !dto.getEquipamentoIds().isEmpty()) {
            List<Equipamento> equipamentosParaAssociar = equipamentoRepository.findAllById(dto.getEquipamentoIds());
            for (Equipamento equip : equipamentosParaAssociar) {
                equip.getServicosDisponiveis().add(salvo);
                equipamentoRepository.save(equip); // Salva a associação
            }
        }
        
        return converteParaDTO(salvo);
    }

    public void deletar(Long id) {
        if (!tipoServicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tipo de serviço não encontrado com o ID: " + id);
        }
        tipoServicoRepository.deleteById(id);
    }

    // ✅ MÉTODO DE CONVERSÃO ATUALIZADO
    private TipoServicoDTO converteParaDTO(TipoServico tipoServico) {
        TipoServicoDTO dto = new TipoServicoDTO();
        BeanUtils.copyProperties(tipoServico, dto, "equipamentos");

        if (tipoServico.getEquipamentos() != null) {
            dto.setEquipamentoIds(
                tipoServico.getEquipamentos().stream()
                    .map(Equipamento::getId)
                    .collect(Collectors.toSet())
            );
        } else {
            dto.setEquipamentoIds(new HashSet<>());
        }

        return dto;
    }
}