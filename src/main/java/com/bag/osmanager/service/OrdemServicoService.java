// Local do arquivo: src/main/java/com/bag/osmanager/service/OrdemServicoService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.*;
import com.bag.osmanager.model.enums.*;
import com.bag.osmanager.repository.*;
// ✨ ALTERAÇÃO AQUI: Importa o novo Mapper
import com.bag.osmanager.service.mapper.OrdemServicoMapper;
import com.bag.osmanager.service.specification.OrdemServicoSpecification;
// ✨ ALTERAÇÃO AQUI: Importa o novo serviço de cálculo de horas
import com.bag.osmanager.service.HorarioUtilService; 
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
import java.util.HashSet;
import java.util.List;
import java.util.Objects; 
import java.util.Optional;
import java.util.Set;
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
    private final HistoricoService historicoService;
    private final OrdemServicoMapper ordemServicoMapper;
    // ✨ ALTERAÇÃO AQUI: Injeta o novo serviço de cálculo de horas
    private final HorarioUtilService horarioUtilService; 

    public List<OrdemServicoDTO> getHistoricoPorEquipamento(Long equipamentoId) {
        return historicoService.getHistoricoPorEquipamento(equipamentoId);
    }
    
    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        if (dto.getEquipamentoId() == null) {
            throw new IllegalArgumentException("O ID do equipamento é obrigatório.");
        }
        if (dto.getTipoManutencao() == null) {
            throw new IllegalArgumentException("O tipo de manutenção é obrigatório.");
        }
        OrdemServico os = new OrdemServico();
        os.setSolicitante(dto.getSolicitante());
        os.setTipoManutencao(dto.getTipoManutencao());
        os.setDescricaoProblema(dto.getDescricaoProblema());
        os.setTurno(dto.getTurno());
        os.setDataSolicitacao(LocalDateTime.now());
        os.setStatus(StatusOrdemServico.ABERTA);
        os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);
        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento com ID " + dto.getEquipamentoId() + " não encontrado!"));
        os.setEquipamento(equipamento);
        if (dto.getLocalId() != null && dto.getLocalId() > 0) {
            Local local = localRepository.findById(dto.getLocalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Local com ID " + dto.getLocalId() + " não encontrado!"));
            os.setLocal(local);
        }
        long proximoNumero = osRepository.findMaxNumeroSequencial().orElse(0L) + 1;
        os.setNumeroSequencial(proximoNumero);
        os.setCodigoOs(String.valueOf(proximoNumero));

        if (dto.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            if (dto.getTipoServicoIds() == null || dto.getTipoServicoIds().isEmpty() || dto.getFrequenciaId() == null || dto.getDataInicioPreventiva() == null) {
                throw new IllegalArgumentException("Para OS Preventiva, ao menos um serviço, a frequência e a data de início são obrigatórios.");
            }
            os.setPrioridade(Prioridade.MEDIA);
            List<TipoServico> tiposServicoList = tipoServicoRepository.findAllById(dto.getTipoServicoIds());
            if (tiposServicoList.size() != dto.getTipoServicoIds().size()) {
                throw new ResourceNotFoundException("Um ou mais Tipos de Serviço não foram encontrados.");
            }
            os.setTiposServico(new HashSet<>(tiposServicoList));
            Frequencia frequencia = frequenciaRepository.findById(dto.getFrequenciaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Frequência com ID " + dto.getFrequenciaId() + " não encontrada!"));
            os.setFrequencia(frequencia);
            String descricao = tiposServicoList.stream()
                .map(TipoServico::getNome)
                .collect(Collectors.joining(", "));
            os.setDescricaoProblema(descricao);
            os.setDataInicioPreventiva(dto.getDataInicioPreventiva().atStartOfDay());

            os.setMaquinaParada(false); 
            // os.setInicioDowntime(null); // Removido se não existir na entidade, ou mantenha se existir

        } else { // CORRETIVA
            if (dto.getPrioridade() == null) {
                throw new IllegalArgumentException("Para OS Corretiva, a prioridade é obrigatória.");
            }
            os.setPrioridade(dto.getPrioridade());
            switch (dto.getPrioridade()) {
                case ALTA: os.setDataLimite(LocalDateTime.now().with(LocalTime.MAX)); break;
                case MEDIA: os.setDataLimite(LocalDateTime.now().plusDays(4)); break;
                case BAIXA: os.setDataLimite(LocalDateTime.now().plusDays(7)); break;
            }

            os.setMaquinaParada(dto.getMaquinaParada() != null && dto.getMaquinaParada());
            // Lógica de downtime removida para evitar erros se os campos não existirem na entidade base
        }
        
        OrdemServico osSalva = osRepository.save(os);
        
        if (osSalva.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            agendarProximaPreventiva(osSalva); 
        }

        return ordemServicoMapper.converteParaDTO(osSalva);
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
        os.setStatus(StatusOrdemServico.PENDENTE);
        OrdemServico osAtualizada = osRepository.save(os);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }
    
    // ✨ ALTERAÇÃO AQUI: Método atualizado para receber o ID do executor
    @Transactional
    public OrdemServicoDTO iniciarExecucao(Long osId, Long executanteId) {
         OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        if (os.getStatus() != StatusOrdemServico.PENDENTE) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com o status 'PENDENTE' para iniciar a execução.");
        }
        
        // Busca o mecânico e vincula à OS
        Funcionario executante = funcionarioRepository.findById(executanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário com ID " + executanteId + " não encontrado!"));
        os.setExecutadoPor(executante);

        os.setStatus(StatusOrdemServico.EM_EXECUCAO);
        OrdemServico osAtualizada = osRepository.save(os);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }

    // ✨ ALTERAÇÃO AQUI: Assinatura atualizada para receber executanteId
    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, Long executanteId, ExecucaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        if (os.getStatus() != StatusOrdemServico.EM_EXECUCAO) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com status 'EM EXECUÇÃO' para ser finalizada.");
        }
        
        // Garante que o executor esteja setado (caso não tenha sido no iniciar)
        if (os.getExecutadoPor() == null) {
             Funcionario executante = funcionarioRepository.findById(executanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Executante não encontrado!"));
             os.setExecutadoPor(executante);
        }

        // Lógica de validacao de horas (se necessário)
        if (dto.getStatusFinal() == StatusOrdemServico.CONCLUIDA || dto.getStatusFinal() == StatusOrdemServico.AGUARDANDO_VERIFICACAO) {
            LocalDateTime inicioExec = dto.getInicio();
            LocalDateTime fimExec = dto.getTermino();

            if (inicioExec == null || fimExec == null) {
                throw new IllegalArgumentException("As datas de Início e Término da execução são obrigatórias para concluir a OS.");
            }
            if (fimExec.isBefore(inicioExec)) {
                 throw new IllegalArgumentException("A data de Término não pode ser anterior à data de Início da execução.");
            }
            
            // Validação de horário útil (opcional, mantida comentada se quiser reativar)
            /*
            long totalMinutosUteis = horarioUtilService.calcularMinutosUteis(inicioExec, fimExec, os.getExecutadoPor().getNome());
            // ... lógica de validação ...
            */
        }

        os.setDataExecucao(LocalDateTime.now());
        os.setAcaoRealizada(dto.getAcaoRealizada());
        os.setTrocaPecas(dto.getTrocaPecas());
        os.setInicio(dto.getInicio());
        os.setTermino(dto.getTermino());
        
        // Ajuste para downtime se houver campos na entidade
        /*
        if (os.getMaquinaParada() != null && os.getMaquinaParada()) {
            os.setFimDowntime(dto.getFimDowntime()); 
        }
        */
        
        if (Boolean.TRUE.equals(dto.getTrocaPecas())) {
            os.setMotivoTrocaPeca(dto.getMotivoTrocaPeca());
            
            if (dto.getPecasSubstituidas() != null) {
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
        } else {
            os.setMotivoTrocaPeca(null);
            if (os.getPecasSubstituidas() != null) {
                os.getPecasSubstituidas().clear();
            }
        }
        
        // Lógica de Status Final
        if ((os.getTipoManutencao() == TipoManutencao.PREVENTIVA || os.getTipoManutencao() == TipoManutencao.CORRETIVA) 
            && dto.getStatusFinal() == StatusOrdemServico.CONCLUIDA) {
            
            os.setStatus(StatusOrdemServico.AGUARDANDO_VERIFICACAO);
            os.setStatusVerificacao(StatusVerificacao.PENDENTE);
        
        } else {
            os.setStatus(dto.getStatusFinal());
            os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);
        }

        OrdemServico osAtualizada = osRepository.save(os);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
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
        
        TipoFuncionario cargo = verificador.getTipoFuncionario();
        if (cargo != TipoFuncionario.ENCARREGADO && 
            cargo != TipoFuncionario.LIDER && 
            cargo != TipoFuncionario.ANALISTA_CQ) {
            
            throw new IllegalStateException("Ação não permitida. Apenas Encarregados, Líderes ou Analistas de Qualidade podem realizar a verificação.");
        }

        osConcluida.setVerificadoPor(verificador);
        osConcluida.setDataVerificacao(LocalDateTime.now());
        osConcluida.setComentarioVerificacao(dto.getComentarioVerificacao());
        
        if (dto.getAprovado()) {
            osConcluida.setStatus(StatusOrdemServico.CONCLUIDA);
            osConcluida.setStatusVerificacao(StatusVerificacao.APROVADO);
            if (osConcluida.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
                agendarProximaPreventiva(osConcluida);
            }
        } else {
            osConcluida.setStatus(StatusOrdemServico.EM_EXECUCAO);
            osConcluida.setStatusVerificacao(StatusVerificacao.REPROVADO);
        }
        
        OrdemServico osAtualizada = osRepository.save(osConcluida);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }

    public Page<OrdemServicoDTO> buscarComFiltros(
            String keyword, StatusOrdemServico status, TipoManutencao tipoManutencao,
            Long equipamentoId, Long localId, Long mecanicoId,
            StatusVerificacao statusVerificacao, LocalDate dataInicio, LocalDate dataFim,
            Pageable pageable
    ) {
        Specification<OrdemServico> spec = OrdemServicoSpecification.comFiltros(
                keyword, status, tipoManutencao, equipamentoId, localId, mecanicoId, statusVerificacao, dataInicio, dataFim
        );
        Page<OrdemServico> paginaDeOS = osRepository.findAll(spec, pageable);
        return paginaDeOS.map(ordemServicoMapper::converteParaDTO);
    }

    public OrdemServicoDTO buscarPorId(Long id) {
        return osRepository.findById(id)
                .map(ordemServicoMapper::converteParaDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
    }

    @Transactional
    public void deletarOrdemServico(Long id) {
        OrdemServico os = osRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
        osRepository.delete(os);
    }
    
    private void agendarProximaPreventiva(OrdemServico osBase) {
        if (osBase.getTipoManutencao() != TipoManutencao.PREVENTIVA || 
            osBase.getFrequencia() == null || 
            osBase.getDataInicioPreventiva() == null) {
            return;
        }

        // Lógica simplificada de agendamento (um por vez)
        Frequencia frequencia = osBase.getFrequencia();
        LocalDateTime dataBase = osBase.getDataInicioPreventiva();
        LocalDateTime proximaDataHora = calcularProximaData(dataBase, frequencia);
        
        if (proximaDataHora == null) return;

        OrdemServico proximaOS = new OrdemServico();
        proximaOS.setEquipamento(osBase.getEquipamento());
        proximaOS.setLocal(osBase.getLocal());
        proximaOS.setTipoManutencao(TipoManutencao.PREVENTIVA);
        proximaOS.setTiposServico(new HashSet<>(osBase.getTiposServico()));
        proximaOS.setFrequencia(frequencia);
        
        String proximaDescricao = osBase.getTiposServico().stream()
                .map(TipoServico::getNome)
                .collect(Collectors.joining(", "));
        proximaOS.setDescricaoProblema(proximaDescricao);
        
        proximaOS.setSolicitante("SISTEMA (AUTO)");
        proximaOS.setPrioridade(Prioridade.MEDIA);
        proximaOS.setDataSolicitacao(LocalDateTime.now());
        proximaOS.setDataInicioPreventiva(proximaDataHora);
        proximaOS.setStatus(StatusOrdemServico.ABERTA);
        proximaOS.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);
        
        long proximoNumero = osRepository.findMaxNumeroSequencial().orElse(0L) + 1;
        proximaOS.setNumeroSequencial(proximoNumero);
        proximaOS.setCodigoOs(String.valueOf(proximoNumero));
        
        osRepository.save(proximaOS);
    }

    private LocalDateTime calcularProximaData(LocalDateTime dataBase, Frequencia frequencia) {
        LocalDateTime proximaDataHora;
        switch (frequencia.getUnidadeTempo()) {
            case HORA: proximaDataHora = dataBase.plusHours(frequencia.getIntervalo()); break;
            case DIA: proximaDataHora = dataBase.plusDays(frequencia.getIntervalo()); break;
            case SEMANA: proximaDataHora = dataBase.plusWeeks(frequencia.getIntervalo()); break;
            case MES: proximaDataHora = dataBase.plusMonths(frequencia.getIntervalo()); break;
            case ANO: proximaDataHora = dataBase.plusYears(frequencia.getIntervalo()); break;
            default: return null;
        }
        if (frequencia.getUnidadeTempo() != UnidadeTempo.HORA && proximaDataHora.getDayOfWeek() == DayOfWeek.SUNDAY) {
            proximaDataHora = proximaDataHora.plusDays(1);
        }
        return proximaDataHora;
    }
}