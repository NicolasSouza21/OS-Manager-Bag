package com.bag.osmanager.service;

import com.bag.osmanager.dto.EquipamentoDTO;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final TipoServicoRepository tipoServicoRepository;

    public List<EquipamentoDTO> listarTodos() {
        return equipamentoRepository.findAll().stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    public EquipamentoDTO buscarPorId(Long id) {
        return equipamentoRepository.findById(id)
                .map(this::converteParaDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id));
    }

    public EquipamentoDTO cadastrar(EquipamentoDTO dto) {
        Equipamento equipamento = new Equipamento();
        BeanUtils.copyProperties(dto, equipamento, "servicosDisponiveis");
        Equipamento salvo = equipamentoRepository.save(equipamento);
        return converteParaDTO(salvo);
    }

    public EquipamentoDTO atualizar(Long id, EquipamentoDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id));
        
        BeanUtils.copyProperties(dto, equipamento, "id", "servicosDisponiveis");
        Equipamento atualizado = equipamentoRepository.save(equipamento);
        return converteParaDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!equipamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id);
        }
        equipamentoRepository.deleteById(id);
    }
    
    @Transactional
    public EquipamentoDTO associarServico(Long equipamentoId, Long servicoId) {
        Equipamento equipamento = equipamentoRepository.findById(equipamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + equipamentoId));
        TipoServico tipoServico = tipoServicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + servicoId));
        
        equipamento.getServicosDisponiveis().add(tipoServico);
        equipamentoRepository.save(equipamento);
        return converteParaDTO(equipamento);
    }

    @Transactional
    public void desassociarServico(Long equipamentoId, Long servicoId) {
        Equipamento equipamento = equipamentoRepository.findById(equipamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + equipamentoId));
        
        equipamento.getServicosDisponiveis().removeIf(servico -> servico.getId().equals(servicoId));
        equipamentoRepository.save(equipamento);
    }

    public Set<TipoServicoDTO> listarServicosPorEquipamento(Long equipamentoId) {
        Equipamento equipamento = equipamentoRepository.findById(equipamentoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + equipamentoId));
        
        return equipamento.getServicosDisponiveis().stream()
                // ✅ CORREÇÃO APLICADA AQUI
                .map(servico -> {
                    TipoServicoDTO servicoDto = new TipoServicoDTO();
                    servicoDto.setId(servico.getId());
                    servicoDto.setNome(servico.getNome());
                    servicoDto.setDescricao(servico.getDescricao());
                    return servicoDto;
                })
                .collect(Collectors.toSet());
    }

    private EquipamentoDTO converteParaDTO(Equipamento equipamento) {
        EquipamentoDTO dto = new EquipamentoDTO();
        BeanUtils.copyProperties(equipamento, dto, "servicosDisponiveis");

        if (equipamento.getServicosDisponiveis() != null) {
            dto.setServicosDisponiveis(
                equipamento.getServicosDisponiveis().stream()
                    // ✅ CORREÇÃO APLICADA AQUI
                    .map(servico -> {
                        TipoServicoDTO servicoDto = new TipoServicoDTO();
                        servicoDto.setId(servico.getId());
                        servicoDto.setNome(servico.getNome());
                        servicoDto.setDescricao(servico.getDescricao());
                        return servicoDto;
                    })
                    .collect(Collectors.toSet())
            );
        } else {
            dto.setServicosDisponiveis(new HashSet<>());
        }
        return dto;
    }
}