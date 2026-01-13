package com.bag.osmanager.service;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.exception.DataIntegrityException; // ✨ ALTERAÇÃO AQUI: Import para validação
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Local; // ✨ ALTERAÇÃO AQUI: Import
import com.bag.osmanager.model.Setor; // ✨ ALTERAÇÃO AQUI: Import
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.LocalRepository; // ✨ ALTERAÇÃO AQUI: Import
import com.bag.osmanager.repository.OrdemServicoRepository;
import com.bag.osmanager.repository.SetorRepository; // ✨ ALTERAÇÃO AQUI: Import
import com.bag.osmanager.repository.TipoServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional; // ✨ ALTERAÇÃO AQUI: Import
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final TipoServicoRepository tipoServicoRepository;
    private final OrdemServicoRepository ordemServicoRepository;
    
    // ✨ ALTERAÇÃO AQUI: Injeção dos repositórios de Setor e Local
    private final SetorRepository setorRepository;
    private final LocalRepository localRepository;

    @Transactional
    public Map<String, Object> deletar(Long id) {
        Map<String, Object> response = new HashMap<>();

        if (!equipamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id);
        }

        if (ordemServicoRepository.existsByEquipamentoId(id)) {
            response.put("success", false);
            response.put("message", "Não é possível excluir o equipamento, pois ele já possui Ordens de Serviço associadas.");
            return response;
        }

        equipamentoRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Equipamento excluído com sucesso.");
        return response;
    }

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

    // ✨ ALTERAÇÃO AQUI: Validação de Tag e Associação de Setor/Local no Cadastro
    @Transactional
    public EquipamentoDTO cadastrar(EquipamentoDTO dto) {
        // 1. Validação: A Tag deve ser única
        // ⚠️ Nota: Certifique-se de que o método findByTag existe no EquipamentoRepository
        Optional<Equipamento> equipExistente = equipamentoRepository.findByTag(dto.getTag());
        if (equipExistente.isPresent()) {
            throw new DataIntegrityException("Já existe um equipamento cadastrado com a Tag " + dto.getTag());
        }

        Equipamento equipamento = new Equipamento();
        BeanUtils.copyProperties(dto, equipamento, "servicosDisponiveis");

        // 2. Associação: Busca e seta Setor e Local
        configurarSetorELocal(equipamento, dto);

        Equipamento salvo = equipamentoRepository.save(equipamento);
        return converteParaDTO(salvo);
    }

    // ✨ ALTERAÇÃO AQUI: Validação de Tag e Associação de Setor/Local na Atualização
    @Transactional
    public EquipamentoDTO atualizar(Long id, EquipamentoDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + id));

        // 1. Validação: Verifica se a Tag já existe em OUTRO equipamento
        Optional<Equipamento> equipExistente = equipamentoRepository.findByTag(dto.getTag());
        if (equipExistente.isPresent() && !equipExistente.get().getId().equals(id)) {
            throw new DataIntegrityException("Já existe outro equipamento cadastrado com a Tag " + dto.getTag());
        }

        BeanUtils.copyProperties(dto, equipamento, "id", "servicosDisponiveis");
        
        // 2. Atualização: Busca e seta Setor e Local
        configurarSetorELocal(equipamento, dto);

        Equipamento atualizado = equipamentoRepository.save(equipamento);
        return converteParaDTO(atualizado);
    }

    // ✨ ALTERAÇÃO AQUI: Método auxiliar para evitar repetição de código
    private void configurarSetorELocal(Equipamento equipamento, EquipamentoDTO dto) {
        if (dto.getSetorId() != null) {
            Setor setor = setorRepository.findById(dto.getSetorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Setor não encontrado com ID: " + dto.getSetorId()));
            equipamento.setSetor(setor);
        }
        
        if (dto.getLocalId() != null) {
            Local local = localRepository.findById(dto.getLocalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado com ID: " + dto.getLocalId()));
            equipamento.setLocal(local);
        }
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

        // ✨ ALTERAÇÃO AQUI: Preenche dados de Setor e Local para exibição no Frontend
        if (equipamento.getSetor() != null) {
            dto.setSetorId(equipamento.getSetor().getId());
            dto.setSetorNome(equipamento.getSetor().getNome());
        }
        if (equipamento.getLocal() != null) {
            dto.setLocalId(equipamento.getLocal().getId());
            dto.setLocalNome(equipamento.getLocal().getNome());
        }

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