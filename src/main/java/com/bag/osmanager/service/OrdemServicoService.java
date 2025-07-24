// Local: src/main/java/com/bag/osmanager/service/OrdemServicoService.java

package com.bag.osmanager.service;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.*;
import com.bag.osmanager.model.enums.*;
import com.bag.osmanager.repository.*;
import com.bag.osmanager.service.specification.OrdemServicoSpecification;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdemServicoService {

    private final OrdemServicoRepository osRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final LocalRepository localRepository;
    private final TipoServicoRepository tipoServicoRepository;

    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        OrdemServico os = new OrdemServico();
        BeanUtils.copyProperties(dto, os, "equipamentoId", "localId", "tipoServicoId");
        
        LocalDateTime agora = LocalDateTime.now();
        os.setDataSolicitacao(agora);
        os.setStatus(StatusOrdemServico.ABERTA);
        os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);

        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento com ID " + dto.getEquipamentoId() + " não encontrado!"));
        os.setEquipamento(equipamento);

        if (dto.getLocalId() != null) {
            Local local = localRepository.findById(dto.getLocalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Local com ID " + dto.getLocalId() + " não encontrado!"));
            os.setLocal(local);
        }

        if (dto.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            if (dto.getTipoServicoId() == null || dto.getFrequencia() == null || dto.getDataInicioPreventiva() == null) {
                throw new IllegalArgumentException("Para OS Preventiva, o serviço, a frequência e a data de início são obrigatórios.");
            }
            TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço com ID " + dto.getTipoServicoId() + " não encontrado!"));
            
            os.setTipoServico(tipoServico);
            os.setFrequencia(dto.getFrequencia());
            os.setDescricaoProblema(tipoServico.getNome());
            
            // ✅ --- CORREÇÃO DEFINITIVA APLICADA AQUI --- ✅
            // Salva a data de início da preventiva que vem do formulário.
            os.setDataInicioPreventiva(dto.getDataInicioPreventiva());

        } else { // CORRETIVA
            switch (dto.getPrioridade()) {
                case ALTA: os.setDataLimite(agora.with(LocalTime.MAX)); break;
                case MEDIA: os.setDataLimite(agora.plusDays(4)); break;
                case BAIXA: os.setDataLimite(agora.plusDays(7)); break;
            }
        }
        
        OrdemServico osSalva = osRepository.save(os);
        
        return converteParaDTO(osSalva);
    }
    
    // ... (O resto da classe, incluindo agendarProximaPreventiva, permanece o mesmo)
    @Transactional
    public OrdemServicoDTO registrarCiencia(Long osId, Long funcionarioId) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));

        if (os.getStatus() != StatusOrdemServico.ABERTA) {
            throw new IllegalStateException("Ação não permitida: a OS não está com o status 'ABERTA'.");
        }

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário com ID " + funcionarioId + " não encontrado!"));
        
        if (funcionario.getTipoFuncionario() != TipoFuncionario.MECANICO && funcionario.getTipoFuncionario() != TipoFuncionario.LIDER) {
            throw new IllegalStateException("Ação não permitida. O funcionário não tem permissão para dar ciência na OS.");
        }

        os.setMecanicoCiencia(funcionario);
        os.setDataCiencia(LocalDateTime.now());
        os.setStatus(StatusOrdemServico.CIENTE);
        
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO iniciarExecucao(Long osId) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));

        if (os.getStatus() != StatusOrdemServico.CIENTE) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com o status 'CIENTE' para iniciar a execução.");
        }
        
        os.setStatus(StatusOrdemServico.EM_EXECUCAO);
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, Long executanteId, ExecucaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        if (os.getStatus() != StatusOrdemServico.EM_EXECUCAO) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com status 'EM EXECUÇÃO' para ser finalizada.");
        }

        Funcionario executante = funcionarioRepository.findById(executanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico executante com ID " + executanteId + " não encontrado!"));

        os.setExecutadoPor(executante);
        os.setDataExecucao(LocalDateTime.now());
        os.setAcaoRealizada(dto.getAcaoRealizada());
        os.setTrocaPecas(dto.getTrocaPecas());
        os.setInicio(dto.getInicio());
        os.setTermino(dto.getTermino());
        os.setMaquinaParada(dto.getMaquinaParada());

        if (os.getTipoManutencao() == TipoManutencao.PREVENTIVA && dto.getStatusFinal() == StatusOrdemServico.CONCLUIDA) {
            os.setStatus(StatusOrdemServico.AGUARDANDO_VERIFICACAO);
            os.setStatusVerificacao(StatusVerificacao.PENDENTE);
        } else {
            os.setStatus(dto.getStatusFinal());
            os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);
        }

        if (Boolean.TRUE.equals(dto.getTrocaPecas()) && dto.getPecasSubstituidas() != null) {
            if (os.getPecasSubstituidas() == null) {
                os.setPecasSubstituidas(new ArrayList<>());
            } else {
                os.getPecasSubstituidas().clear();
            }
            dto.getPecasSubstituidas().forEach(pecaDTO -> {
                PecaSubstituida peca = new PecaSubstituida();
                BeanUtils.copyProperties(pecaDTO, peca);
                peca.setOrdemServico(os);
                os.getPecasSubstituidas().add(peca);
            });
        }

        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }
    
    @Transactional
    public OrdemServicoDTO verificarOS(Long osId, Long verificadorId, VerificacaoDTO dto) {
        OrdemServico osConcluida = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        if (osConcluida.getStatus() != StatusOrdemServico.AGUARDANDO_VERIFICACAO) {
            throw new IllegalStateException("A OS não está aguardando verificação.");
        }

        Funcionario verificador = funcionarioRepository.findById(verificadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário com ID " + verificadorId + " não encontrado!"));
        
        if (verificador.getTipoFuncionario() != TipoFuncionario.ENCARREGADO) {
            throw new IllegalStateException("Ação não permitida. Apenas ENCARREGADOS podem realizar a verificação.");
        }

        osConcluida.setVerificadoPor(verificador);
        osConcluida.setDataVerificacao(LocalDateTime.now());
        osConcluida.setComentarioVerificacao(dto.getComentarioVerificacao());

        if (dto.getAprovado()) {
            osConcluida.setStatus(StatusOrdemServico.CONCLUIDA);
            osConcluida.setStatusVerificacao(StatusVerificacao.APROVADO);
            agendarProximaPreventiva(osConcluida);
        } else {
            osConcluida.setStatus(StatusOrdemServico.EM_EXECUCAO); 
            osConcluida.setStatusVerificacao(StatusVerificacao.REPROVADO);
        }

        OrdemServico osAtualizada = osRepository.save(osConcluida);
        return converteParaDTO(osAtualizada);
    }

    private void agendarProximaPreventiva(OrdemServico osConcluida) {
        if (osConcluida.getTipoManutencao() != TipoManutencao.PREVENTIVA || osConcluida.getFrequencia() == null || osConcluida.getDataInicioPreventiva() == null) {
            return;
        }

        LocalDate dataBase = osConcluida.getDataInicioPreventiva();
        LocalDate proximaData;

        switch (osConcluida.getFrequencia()) {
            case DIARIO: proximaData = dataBase.plusDays(1); break;
            case BIDIARIO: proximaData = dataBase.plusDays(2); break;
            case SEMANAL: proximaData = dataBase.plusWeeks(1); break;
            case QUINZENAL: proximaData = dataBase.plusWeeks(2); break;
            case MENSAL: proximaData = dataBase.plusMonths(1); break;
            case BIMESTRAL: proximaData = dataBase.plusMonths(2); break;
            case TRIMESTRAL: proximaData = dataBase.plusMonths(3); break;
            case SEMESTRAL: proximaData = dataBase.plusMonths(6); break;
            case ANUAL: proximaData = dataBase.plusYears(1); break;
            default: return;
        }
        
        if (proximaData.getDayOfWeek() == DayOfWeek.SUNDAY) {
            proximaData = proximaData.plusDays(1);
        }
        
        OrdemServico proximaOS = new OrdemServico();
        proximaOS.setEquipamento(osConcluida.getEquipamento());
        proximaOS.setLocal(osConcluida.getLocal());
        proximaOS.setTipoManutencao(TipoManutencao.PREVENTIVA);
        proximaOS.setTipoServico(osConcluida.getTipoServico());
        proximaOS.setFrequencia(osConcluida.getFrequencia());
        proximaOS.setDescricaoProblema(osConcluida.getDescricaoProblema());
        proximaOS.setSolicitante("SISTEMA (AUTO)");
        proximaOS.setPrioridade(Prioridade.MEDIA);
        
        proximaOS.setDataSolicitacao(LocalDateTime.now());
        proximaOS.setDataInicioPreventiva(proximaData);
        
        proximaOS.setStatus(StatusOrdemServico.ABERTA);
        proximaOS.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);

        osRepository.save(proximaOS);
    }

    public Page<OrdemServicoDTO> buscarComFiltros(
            String keyword,
            StatusOrdemServico status,
            TipoManutencao tipoManutencao,
            Long equipamentoId,
            Long localId,
            Long mecanicoId,
            StatusVerificacao statusVerificacao,
            Pageable pageable
    ) {
        Specification<OrdemServico> spec = OrdemServicoSpecification.comFiltros(
                keyword, status, tipoManutencao, equipamentoId, localId, mecanicoId, statusVerificacao
        );
        Page<OrdemServico> paginaDeOS = osRepository.findAll(spec, pageable);
        return paginaDeOS.map(this::converteParaDTO);
    }

    public OrdemServicoDTO buscarPorId(Long id) {
        return osRepository.findById(id)
                .map(this::converteParaDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
    }

    @Transactional
    public void deletarOrdemServico(Long id) {
        OrdemServico os = osRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
        osRepository.delete(os);
    }
    
    private OrdemServicoDTO converteParaDTO(OrdemServico os) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        BeanUtils.copyProperties(os, dto);

        if (os.getMecanicoCiencia() != null) {
            dto.setLiderCienciaId(os.getMecanicoCiencia().getId());
            dto.setLiderCienciaNome(os.getMecanicoCiencia().getNome());
        }
        if (os.getExecutadoPor() != null) {
            dto.setExecutadoPorId(os.getExecutadoPor().getId());
            dto.setExecutadoPorNome(os.getExecutadoPor().getNome());
        }
        if (os.getVerificadoPor() != null) {
            dto.setVerificadoPorId(os.getVerificadoPor().getId());
            dto.setVerificadoPorNome(os.getVerificadoPor().getNome());
        }
        if (os.getAprovadoPor() != null) {
            dto.setAprovadoPorId(os.getAprovadoPor().getId());
            dto.setAprovadoPorNome(os.getAprovadoPor().getNome());
        }
        if (os.getEquipamento() != null) {
            dto.setEquipamentoId(os.getEquipamento().getId());
        }
        if (os.getLocal() != null) {
            dto.setLocalId(os.getLocal().getId());
        }
        if (os.getPecasSubstituidas() != null) {
            dto.setPecasSubstituidas(os.getPecasSubstituidas().stream().map(peca -> {
                PecaSubstituidaDTO pecaDTO = new PecaSubstituidaDTO();
                BeanUtils.copyProperties(peca, pecaDTO);
                return pecaDTO;
            }).collect(Collectors.toList()));
        }
        if (os.getTipoServico() != null) {
            dto.setTipoServicoId(os.getTipoServico().getId());
            dto.setTipoServicoNome(os.getTipoServico().getNome());
        }
        if (os.getFrequencia() != null) {
            dto.setFrequencia(os.getFrequencia());
        }
        return dto;
    }
}