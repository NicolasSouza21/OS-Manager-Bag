// Local: src/main/java/com/bag/osmanager/service/PlanoPreventivaService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.dto.PlanoPreventivaDTO;
import com.bag.osmanager.dto.ProgramacaoManutencaoDTO; 
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Frequencia;
import com.bag.osmanager.model.Funcionario; // ✨ ALTERAÇÃO AQUI: Import adicionado
import com.bag.osmanager.model.OrdemServico; 
import com.bag.osmanager.model.PlanoPreventiva;
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.model.enums.StatusOrdemServico; 
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.FrequenciaRepository;
import com.bag.osmanager.repository.OrdemServicoRepository; 
import com.bag.osmanager.repository.PlanoPreventivaRepository;
import com.bag.osmanager.repository.TipoServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Sort; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Comparator; 
import java.util.List;
import java.util.Optional; 
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanoPreventivaService {

    private final PlanoPreventivaRepository planoRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final TipoServicoRepository tipoServicoRepository;
    private final FrequenciaRepository frequenciaRepository;
    private final OrdemServicoRepository ordemServicoRepository; 

    @Transactional(readOnly = true)
    public List<ProgramacaoManutencaoDTO> getProgramacaoManutencao(Long equipamentoId) {
        List<PlanoPreventiva> planos = planoRepository.findByEquipamentoId(equipamentoId);

        return planos.stream().map(plano -> {
            String servico = plano.getTipoServico() != null ? plano.getTipoServico().getNome() : "N/A";
            String frequencia = plano.getFrequencia() != null ? plano.getFrequencia().getNome() : "N/A";
            String tempoPadrao = plano.getTempoPadrao(); // Pode ser nulo
            
            // ✨ ALTERAÇÃO AQUI: Busca o manutentor do PLANO, não do histórico
            String manutentor = plano.getManutentor() != null ? plano.getManutentor() : "N/A";

            /* LÓGICA ANTIGA (REMOVIDA)
            // Busca a última OS concluída para este serviço e equipamento
            Optional<OrdemServico> ultimaOsConcluida = ordemServicoRepository
                    .findAll((root, query, cb) -> {
                        // Condições da busca
                        return cb.and(
                            cb.equal(root.get("equipamento").get("id"), equipamentoId),
                            cb.isMember(plano.getTipoServico(), root.get("tiposServico")),
                            cb.equal(root.get("status"), StatusOrdemServico.CONCLUIDA)
                        );
                    }, Sort.by(Sort.Direction.DESC, "dataExecucao"))
                    .stream().findFirst();

            String ultimoManutentor = ultimaOsConcluida
                    .map(os -> {
                        if (os.getExecutores() == null || os.getExecutores().isEmpty()) {
                            return "Não informado";
                        }
                        return os.getExecutores().stream()
                                .map(Funcionario::getNome)
                                .collect(Collectors.joining(", "));
                    })
                    .orElse("Nenhuma execução anterior");
            */
            
            // ✨ ALTERAÇÃO AQUI: Passa o 'manutentor' do plano (não 'ultimoManutentor')
            return new ProgramacaoManutencaoDTO(servico, frequencia, manutentor, tempoPadrao);
        }).collect(Collectors.toList());
    }


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

        Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                .orElseThrow(() -> new ResourceNotFoundException("Frequência não encontrada com o ID: " + dto.getFrequenciaId()));

        PlanoPreventiva plano = new PlanoPreventiva();
        plano.setEquipamento(equipamento);
        plano.setTipoServico(tipoServico);
        plano.setFrequencia(frequencia);
        plano.setToleranciaDias(dto.getToleranciaDias());
        plano.setTempoPadrao(dto.getTempoPadrao());
        
        // ✨ ALTERAÇÃO AQUI: Salva o novo campo 'manutentor'
        plano.setManutentor(dto.getManutentor());

        PlanoPreventiva planoSalvo = planoRepository.save(plano);
        return converteParaDTO(planoSalvo);
    }

    @Transactional
    public PlanoPreventivaDTO atualizarPlano(Long planoId, PlanoPreventivaDTO dto) {
        PlanoPreventiva plano = planoRepository.findById(planoId)
                .orElseThrow(() -> new ResourceNotFoundException("Plano de manutenção não encontrado com o ID: " + planoId));
        
        TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço não encontrado com o ID: " + dto.getTipoServicoId()));
        
        Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                .orElseThrow(() -> new ResourceNotFoundException("Frequência não encontrada com o ID: " + dto.getFrequenciaId()));

        plano.setTipoServico(tipoServico);
        plano.setFrequencia(frequencia);
        plano.setToleranciaDias(dto.getToleranciaDias());
        plano.setTempoPadrao(dto.getTempoPadrao());
        
        // ✨ ALTERAÇÃO AQUI: Atualiza o novo campo 'manutentor'
        plano.setManutentor(dto.getManutentor());
        
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
        
        // ✨ ALTERAÇÃO AQUI: Copia todos os campos, incluindo 'tempoPadrao' e 'manutentor'
        BeanUtils.copyProperties(plano, dto, "tipoServico", "frequencia");

        if (plano.getEquipamento() != null) {
            dto.setEquipamentoId(plano.getEquipamento().getId());
        }
        if (plano.getTipoServico() != null) {
            dto.setTipoServicoId(plano.getTipoServico().getId());
            dto.setTipoServicoNome(plano.getTipoServico().getNome());
        }
        
        if (plano.getFrequencia() != null) {
            dto.setFrequenciaId(plano.getFrequencia().getId());
            FrequenciaDTO freqDTO = new FrequenciaDTO();
            BeanUtils.copyProperties(plano.getFrequencia(), freqDTO);
            dto.setFrequencia(freqDTO);
        }
        return dto;
    }
}