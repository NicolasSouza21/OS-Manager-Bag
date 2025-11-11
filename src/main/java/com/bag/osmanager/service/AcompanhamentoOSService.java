// Local: src/main/java/com/bag/osmanager/service/AcompanhamentoOSService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.AcompanhamentoOSDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.AcompanhamentoOS;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.repository.AcompanhamentoOSRepository;
import com.bag.osmanager.repository.FuncionarioRepository;
import com.bag.osmanager.repository.OrdemServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcompanhamentoOSService {

    private final AcompanhamentoOSRepository acompanhamentoRepository;
    private final OrdemServicoRepository osRepository;
    private final FuncionarioRepository funcionarioRepository;

    /**
     * Cria um novo registro de acompanhamento (relatório parcial ou pausa) para uma OS.
     *
     * @param dto DTO contendo os dados do acompanhamento.
     * @param funcionarioId ID do funcionário (mecânico) que está registrando.
     * @return O DTO do acompanhamento salvo.
     */
    @Transactional
    public AcompanhamentoOSDTO criarAcompanhamento(AcompanhamentoOSDTO dto, Long funcionarioId) {
        
        // 1. Validar a Ordem de Serviço
        OrdemServico os = osRepository.findById(dto.getOrdemServicoId())
            .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + dto.getOrdemServicoId() + " não encontrada."));

        // 2. Validar o Funcionário
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Funcionário com ID " + funcionarioId + " não encontrado."));

        // 3. Criar a nova entidade AcompanhamentoOS
        AcompanhamentoOS acompanhamento = new AcompanhamentoOS();
        acompanhamento.setDataHora(LocalDateTime.now());
        acompanhamento.setDescricao(dto.getDescricao());
        acompanhamento.setMotivoPausa(dto.getMotivoPausa());
        
        // Salva os minutos de pausa vindos do DTO
        acompanhamento.setMinutosPausa(dto.getMinutosPausa() != null ? dto.getMinutosPausa() : 0);

        // ✨ ALTERAÇÃO AQUI (Request 1): Salva os minutos trabalhados vindos do DTO
        acompanhamento.setMinutosTrabalhados(dto.getMinutosTrabalhados() != null ? dto.getMinutosTrabalhados() : 0);

        acompanhamento.setOrdemServico(os);
        acompanhamento.setFuncionario(funcionario);

        // 4. Salvar o acompanhamento
        AcompanhamentoOS salvo = acompanhamentoRepository.save(acompanhamento);

        // ✨ ALTERAÇÃO AQUI (Request 2): Adiciona o funcionário à lista de executores da OS
        // Verifica se o funcionário já não está na lista de executores da OS
        if (os.getExecutores() == null || !os.getExecutores().contains(funcionario)) {
            os.getExecutores().add(funcionario);
            osRepository.save(os); // Salva a OS principal com o novo executor
        }
        
        // 5. Retornar o DTO
        return converterParaDTO(salvo);
    }

    // Método para buscar o histórico de acompanhamentos (sem alterações)
    @Transactional(readOnly = true)
    public List<AcompanhamentoOSDTO> getAcompanhamentosPorOS(Long osId) {
        if (!osRepository.existsById(osId)) {
            throw new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada.");
        }
        
        List<AcompanhamentoOS> acompanhamentos = acompanhamentoRepository.findByOrdemServicoIdOrderByDataHoraDesc(osId);

        return acompanhamentos.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }


    private AcompanhamentoOSDTO converterParaDTO(AcompanhamentoOS entidade) {
        AcompanhamentoOSDTO dto = new AcompanhamentoOSDTO();
        // O BeanUtils agora copiará 'minutosPausa' E o novo 'minutosTrabalhados'
        BeanUtils.copyProperties(entidade, dto);
        
        if (entidade.getFuncionario() != null) {
            dto.setFuncionarioId(entidade.getFuncionario().getId());
            dto.setFuncionarioNome(entidade.getFuncionario().getNome());
        }
        if (entidade.getOrdemServico() != null) {
            dto.setOrdemServicoId(entidade.getOrdemServico().getId());
        }
        return dto;
    }
}