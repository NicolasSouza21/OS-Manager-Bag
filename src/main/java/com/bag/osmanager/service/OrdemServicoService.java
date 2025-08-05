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
    private final FrequenciaRepository frequenciaRepository;

    // O método criarOS já está correto e compatível com LocalDateTime
    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        OrdemServico os = new OrdemServico();
        BeanUtils.copyProperties(dto, os, "equipamentoId", "localId", "tipoServicoId", "frequenciaId");

        os.setDataSolicitacao(LocalDateTime.now());
        os.setStatus(StatusOrdemServico.ABERTA);
        os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);

        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento com ID " + dto.getEquipamentoId() + " não encontrado!"));
        os.setEquipamento(equipamento);

        // ✅ CORREÇÃO: Verifica se o localId não é nulo e é maior que zero
        if (dto.getLocalId() != null && dto.getLocalId() > 0) {
            Local local = localRepository.findById(dto.getLocalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Local com ID " + dto.getLocalId() + " não encontrado!"));
            os.setLocal(local);
        }

        if (dto.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            if (dto.getTipoServicoId() == null || dto.getFrequenciaId() == null || dto.getDataInicioPreventiva() == null) {
                throw new IllegalArgumentException("Para OS Preventiva, o serviço, a frequência e a data de início são obrigatórios.");
            }
            TipoServico tipoServico = tipoServicoRepository.findById(dto.getTipoServicoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de Serviço com ID " + dto.getTipoServicoId() + " não encontrado!"));

            Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Frequência com ID " + dto.getFrequenciaId() + " não encontrada!"));

            os.setTipoServico(tipoServico);
            os.setFrequencia(frequencia);
            os.setDescricaoProblema(tipoServico.getNome());
            os.setDataInicioPreventiva(dto.getDataInicioPreventiva());

            long proximoNumero = osRepository.findMaxNumeroPreventivaByTipoManutencao(TipoManutencao.PREVENTIVA).orElse(0L) + 1;
            os.setNumeroPreventiva(proximoNumero);
            os.setCodigoOs("PRE-" + proximoNumero);

        } else { // CORRETIVA
            switch (dto.getPrioridade()) {
                case ALTA: os.setDataLimite(LocalDateTime.now().with(LocalTime.MAX)); break;
                case MEDIA: os.setDataLimite(LocalDateTime.now().plusDays(4)); break;
                case BAIXA: os.setDataLimite(LocalDateTime.now().plusDays(7)); break;
            }
            long proximoNumero = osRepository.findMaxNumeroCorretivaByTipoManutencao(TipoManutencao.CORRETIVA).orElse(0L) + 1;
            os.setNumeroCorretiva(proximoNumero);
            os.setCodigoOs("COR-" + proximoNumero);
        }

        OrdemServico osSalva = osRepository.save(os);
        return converteParaDTO(osSalva);
    }

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


    public Page<OrdemServicoDTO> buscarComFiltros(
            String keyword,
            StatusOrdemServico status,
            TipoManutencao tipoManutencao,
            Long equipamentoId,
            Long localId,
            Long mecanicoId,
            StatusVerificacao statusVerificacao,
            LocalDate dataInicio,
            LocalDate dataFim,
            Pageable pageable
    ) {
        Specification<OrdemServico> spec = OrdemServicoSpecification.comFiltros(
                keyword, status, tipoManutencao, equipamentoId, localId, mecanicoId, statusVerificacao, dataInicio, dataFim
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
    
    // ✨ CORREÇÃO APLICADA AQUI
    private void agendarProximaPreventiva(OrdemServico osConcluida) {
        if (osConcluida.getTipoManutencao() != TipoManutencao.PREVENTIVA || osConcluida.getFrequencia() == null || osConcluida.getDataInicioPreventiva() == null) {
            return;
        }

        Frequencia frequencia = osConcluida.getFrequencia();
        LocalDateTime dataBase = osConcluida.getDataInicioPreventiva();
        LocalDateTime proximaDataHora;

        switch (frequencia.getUnidadeTempo()) {
            case HORA:
                proximaDataHora = dataBase.plusHours(frequencia.getIntervalo());
                break;
            case DIA:
                proximaDataHora = dataBase.plusDays(frequencia.getIntervalo());
                break;
            case SEMANA:
                proximaDataHora = dataBase.plusWeeks(frequencia.getIntervalo());
                break;
            case MES:
                proximaDataHora = dataBase.plusMonths(frequencia.getIntervalo());
                break;
            case ANO:
                proximaDataHora = dataBase.plusYears(frequencia.getIntervalo());
                break;
            default:
                return;
        }

        // ✅ Regra de pular o domingo foi movida para fora do switch para aplicar a todas as frequências baseadas em dias
        if (frequencia.getUnidadeTempo() != UnidadeTempo.HORA && proximaDataHora.getDayOfWeek() == DayOfWeek.SUNDAY) {
            proximaDataHora = proximaDataHora.plusDays(1); // Pula para segunda-feira
        }

        OrdemServico proximaOS = new OrdemServico();
        proximaOS.setEquipamento(osConcluida.getEquipamento());
        proximaOS.setLocal(osConcluida.getLocal());
        proximaOS.setTipoManutencao(TipoManutencao.PREVENTIVA);
        proximaOS.setTipoServico(osConcluida.getTipoServico());
        proximaOS.setFrequencia(osConcluida.getFrequencia());
        proximaOS.setDescricaoProblema(osConcluida.getTipoServico().getNome());
        proximaOS.setSolicitante("SISTEMA (AUTO)");
        proximaOS.setPrioridade(Prioridade.MEDIA);
        proximaOS.setDataSolicitacao(LocalDateTime.now());
        proximaOS.setDataInicioPreventiva(proximaDataHora);
        proximaOS.setStatus(StatusOrdemServico.ABERTA);
        proximaOS.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);

        long proximoNumero = osRepository.findMaxNumeroPreventivaByTipoManutencao(TipoManutencao.PREVENTIVA).orElse(0L) + 1;
        proximaOS.setNumeroPreventiva(proximoNumero);
        proximaOS.setCodigoOs("PRE-" + proximoNumero);

        osRepository.save(proximaOS);
    }
    
    private OrdemServicoDTO converteParaDTO(OrdemServico os) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        BeanUtils.copyProperties(os, dto, "frequencia");

        dto.setCodigoOs(os.getCodigoOs());

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
            FrequenciaDTO freqDTO = new FrequenciaDTO();
            BeanUtils.copyProperties(os.getFrequencia(), freqDTO);
            dto.setFrequencia(freqDTO);
        }
        return dto;
    }
}