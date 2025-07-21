package com.bag.osmanager.service;

import com.bag.osmanager.dto.PlanoPreventivaDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.PlanoPreventiva;
import com.bag.osmanager.model.TipoServico; // ✅ Importe a nova entidade
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.PlanoPreventivaRepository;
import com.bag.osmanager.repository.TipoServicoRepository; // ✅ Importe o novo repositório
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanoPreventivaService {

    private final PlanoPreventivaRepository planoRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final TipoServicoRepository tipoServicoRepository; // ✅ Injeção do novo repositório

    // Lista todos os planos de um equipamento específico
    public List<PlanoPreventivaDTO> listarPlanosPorEquipamento(Long equipamentoId) {
        return planoRepository.findByEquipamentoId(equipamentoId).stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    // Adiciona um novo plano de manutenção a um equipamento
    @Transactional
    public PlanoPreventivaDTO adicionarPlano(PlanoPreventivaDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + dto.getEquipamentoId()));
        
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + dto.getTipoServicoId()));

        PlanoPreventiva plano = new PlanoPreventiva();
        plano.setEquipamento(equipamento);
        plano.setTipoServico(tipoServico);
        plano.setFrequencia(dto.getFrequencia());
        plano.setToleranciaDias(dto.getToleranciaDias());

        PlanoPreventiva planoSalvo = planoRepository.save(plano);
        return converteParaDTO(planoSalvo);
    }

    // Atualiza um plano de manutenção existente
    @Transactional
    public PlanoPreventivaDTO atualizarPlano(Long planoId, PlanoPreventivaDTO dto) {
        PlanoPreventiva plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plano de manutenção não encontrado com o ID: " + planoId));
        
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + dto.getTipoServicoId()));

        plano.setTipoServico(tipoServico);
        plano.setFrequencia(dto.getFrequencia());
        plano.setToleranciaDias(dto.getToleranciaDias());
        
        PlanoPreventiva planoAtualizado = planoRepository.save(plano);
        return converteParaDTO(planoAtualizado);
    }

    // Exclui um plano de manutenção
    public void deletarPlano(Long planoId) {
        if (!planoRepository.existsById(planoId)) {
            throw new ResourceNotFoundException("Plano de manutenção não encontrado com o ID: " + planoId);
        }
        planoRepository.deleteById(planoId);
    }

    // Converte a entidade PlanoPreventiva para DTO
    private PlanoPreventivaDTO converteParaDTO(PlanoPreventiva plano) {
        PlanoPreventivaDTO dto = new PlanoPreventivaDTO();
        BeanUtils.copyProperties(plano, dto, "tipoServico"); // Copia tudo, exceto o objeto tipoServico

        if (plano.getEquipamento() != null) {
            dto.setEquipamentoId(plano.getEquipamento().getId());
        }
        if (plano.getTipoServico() != null) {
            dto.setTipoServicoId(plano.getTipoServico().getId());
            dto.setTipoServicoNome(plano.getTipoServico().getNome()); // Popula o nome do serviço
        }
        return dto;
    }
}