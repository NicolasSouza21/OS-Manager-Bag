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
    private final EquipamentoRepository equipamentoRepository;

    public List<TipoServicoDTO> listarTodos() {
        return tipoServicoRepository.findAll().stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TipoServicoDTO criar(TipoServicoDTO dto) {
        TipoServico tipoServico = new TipoServico();
        BeanUtils.copyProperties(dto, tipoServico, "equipamentoIds");
        TipoServico salvo = tipoServicoRepository.save(tipoServico);

        if (dto.getEquipamentoIds() != null && !dto.getEquipamentoIds().isEmpty()) {
            List<Equipamento> equipamentosParaAssociar = equipamentoRepository.findAllById(dto.getEquipamentoIds());
            for (Equipamento equip : equipamentosParaAssociar) {
                equip.getServicosDisponiveis().add(salvo);
                equipamentoRepository.save(equip);
            }
        }
        
        return converteParaDTO(salvo);
    }
    
    // ✨ ALTERAÇÃO AQUI: Novo método para a lógica de atualização.
    @Transactional
    public TipoServicoDTO atualizar(Long id, TipoServicoDTO dto) {
        // 1. Busca o serviço existente no banco de dados.
        TipoServico servico = tipoServicoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de serviço não encontrado com o ID: " + id));
            
        // 2. Copia as novas propriedades (nome, descricao) do DTO para a entidade.
        //    Ignoramos o 'id' e 'equipamentoIds' para não alterar o ID nem as associações aqui.
        BeanUtils.copyProperties(dto, servico, "id", "equipamentoIds");
        
        // 3. Salva a entidade atualizada no banco.
        TipoServico servicoAtualizado = tipoServicoRepository.save(servico);
        
        // 4. Retorna o DTO correspondente à entidade atualizada.
        return converteParaDTO(servicoAtualizado);
    }


    public void deletar(Long id) {
        if (!tipoServicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tipo de serviço não encontrado com o ID: " + id);
        }
        tipoServicoRepository.deleteById(id);
    }

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