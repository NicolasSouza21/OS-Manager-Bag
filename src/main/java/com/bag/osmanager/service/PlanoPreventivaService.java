package com.bag.osmanager.service;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.dto.PlanoPreventivaDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Frequencia; // ✨ ALTERAÇÃO AQUI: Importa a nova entidade
import com.bag.osmanager.model.PlanoPreventiva;
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.FrequenciaRepository; // ✨ ALTERAÇÃO AQUI: Importa o novo repositório
import com.bag.osmanager.repository.PlanoPreventivaRepository;
import com.bag.osmanager.repository.TipoServicoRepository;
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
    private final TipoServicoRepository tipoServicoRepository;
    
    // ✨ ALTERAÇÃO AQUI: Injeção do novo repositório de Frequencia.
    private final FrequenciaRepository frequenciaRepository;

    public List<PlanoPreventivaDTO> listarPlanosPorEquipamento(Long equipamentoId) {
        return planoRepository.findByEquipamentoId(equipamentoId).stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlanoPreventivaDTO adicionarPlano(PlanoPreventivaDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com o ID: " + dto.getEquipamentoId()));
        
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + dto.getTipoServicoId()));

        // ✨ ALTERAÇÃO AQUI: Busca a entidade Frequencia pelo ID recebido do DTO.
        Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                .orElseThrow(() -> new ResourceNotFoundException("Frequência não encontrada com o ID: " + dto.getFrequenciaId()));

        PlanoPreventiva plano = new PlanoPreventiva();
        plano.setEquipamento(equipamento);
        plano.setTipoServico(tipoServico);
        plano.setFrequencia(frequencia); // Associa a entidade Frequencia
        plano.setToleranciaDias(dto.getToleranciaDias());

        PlanoPreventiva planoSalvo = planoRepository.save(plano);
        return converteParaDTO(planoSalvo);
    }

    @Transactional
    public PlanoPreventivaDTO atualizarPlano(Long planoId, PlanoPreventivaDTO dto) {
        PlanoPreventiva plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plano de manutenção não encontrado com o ID: " + planoId));
        
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + dto.getTipoServicoId()));
        
        // ✨ ALTERAÇÃO AQUI: Busca a entidade Frequencia pelo ID para garantir que ela exista.
        Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                .orElseThrow(() -> new ResourceNotFoundException("Frequência não encontrada com o ID: " + dto.getFrequenciaId()));

        plano.setTipoServico(tipoServico);
        plano.setFrequencia(frequencia); // Atualiza a associação da entidade
        plano.setToleranciaDias(dto.getToleranciaDias());
        
        PlanoPreventiva planoAtualizado = planoRepository.save(plano);
        return converteParaDTO(planoAtualizado);
    }

    public void deletarPlano(Long planoId) {
        if (!planoRepository.existsById(planoId)) {
            throw new ResourceNotFoundException("Plano de manutenção não encontrado com o ID: " + planoId);
        }
        planoRepository.deleteById(planoId);
    }

    private PlanoPreventivaDTO converteParaDTO(PlanoPreventiva plano) {
        PlanoPreventivaDTO dto = new PlanoPreventivaDTO();
        // ✨ ALTERAÇÃO AQUI: Copia ignorando os objetos complexos que serão tratados manualmente.
        BeanUtils.copyProperties(plano, dto, "tipoServico", "frequencia");

        if (plano.getEquipamento() != null) {
            dto.setEquipamentoId(plano.getEquipamento().getId());
        }
        if (plano.getTipoServico() != null) {
            dto.setTipoServicoId(plano.getTipoServico().getId());
            dto.setTipoServicoNome(plano.getTipoServico().getNome());
        }
        
        // ✨ ALTERAÇÃO AQUI: Conversão manual da entidade Frequencia para o FrequenciaDTO.
        if (plano.getFrequencia() != null) {
            dto.setFrequenciaId(plano.getFrequencia().getId()); // Popula o ID
            FrequenciaDTO freqDTO = new FrequenciaDTO(); // Cria o objeto aninhado
            BeanUtils.copyProperties(plano.getFrequencia(), freqDTO);
            dto.setFrequencia(freqDTO); // Popula o objeto FrequenciaDTO
        }
        return dto;
    }
}