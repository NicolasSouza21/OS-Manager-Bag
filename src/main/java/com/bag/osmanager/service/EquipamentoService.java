package com.bag.osmanager.service;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.OrdemServicoRepository;
import com.bag.osmanager.repository.TipoServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap; // 1. ✅ Importe o HashMap
import java.util.HashSet;
import java.util.List;
import java.util.Map; // 2. ✅ Importe o Map
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final TipoServicoRepository tipoServicoRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    // --- ✅ MÉTODO DELETAR ATUALIZADO ---
    /**
     * Tenta deletar um equipamento. Em vez de lançar DataIntegrityException,
     * retorna um Map indicando o resultado da operação.
     * @param id O ID do equipamento a ser deletado.
     * @return Um Map contendo a chave "success" (boolean) e "message" (String).
     * @throws ResourceNotFoundException se o equipamento não for encontrado.
     */
    @Transactional
    public Map<String, Object> deletar(Long id) {
        Map<String, Object> response = new HashMap<>();

        // Primeiro, verifica se o equipamento existe.
        if (!equipamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id);
        }

        // VERIFICAÇÃO DE INTEGRIDADE: Checa se existem OS para este equipamento.
        if (ordemServicoRepository.existsByEquipamentoId(id)) {
            response.put("success", false);
            response.put("message", "Não é possível excluir o equipamento, pois ele já possui Ordens de Serviço associadas.");
            return response;
        }

        // Se passar na verificação, pode deletar.
        equipamentoRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Equipamento excluído com sucesso.");
        return response;
    }
    
    // --- O RESTO DA CLASSE PERMANECE IGUAL ---

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