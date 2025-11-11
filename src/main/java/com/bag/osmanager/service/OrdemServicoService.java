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
import java.util.Objects; // ✨✅ CORREÇÃO: Import necessário
import java.util.Optional; // ✨✅ CORREÇÃO: Import necessário
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
    // ✨ ALTERAÇÃO AQUI: Injeta o Mapper para quebrar a dependência circular
    private final OrdemServicoMapper ordemServicoMapper;

    // ... (método getHistoricoPorEquipamento inalterado) ...
    public List<OrdemServicoDTO> getHistoricoPorEquipamento(Long equipamentoId) {
        return historicoService.getHistoricoPorEquipamento(equipamentoId);
    }
    
    // ... (método criarOS inalterado até o final) ...
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
            os.setInicioDowntime(null);

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
            if (os.getMaquinaParada()) {
                os.setInicioDowntime(dto.getInicioDowntime()); 
            } else {
                os.setInicioDowntime(null);
            }
        }
        
        OrdemServico osSalva = osRepository.save(os);
        
        // ✨✅ CORREÇÃO: Lógica mantida da versão anterior
        if (osSalva.getTipoManutencao() == TipoManutencao.PREVENTIVA) {
            agendarProximaPreventiva(osSalva); 
        }

        return ordemServicoMapper.converteParaDTO(osSalva);
    }

    // ... (registrarCiencia e iniciarExecucao permanecem inalterados) ...
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
    
    @Transactional
    public OrdemServicoDTO iniciarExecucao(Long osId) {
         OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        if (os.getStatus() != StatusOrdemServico.PENDENTE) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com o status 'PENDENTE' para iniciar a execução.");
        }
        os.setStatus(StatusOrdemServico.EM_EXECUCAO);
        OrdemServico osAtualizada = osRepository.save(os);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }

    // ✨✅ ALTERAÇÃO AQUI: Lógica de `registrarExecucao` modificada
    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, ExecucaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        if (os.getStatus() != StatusOrdemServico.EM_EXECUCAO) {
            throw new IllegalStateException("Ação não permitida: a OS precisa estar com status 'EM EXECUÇÃO' para ser finalizada.");
        }
        
        // ✨✅ CORREÇÃO: Lógica de executores automática
        // 1. Busca todos os funcionários que registraram um acompanhamento.
        Set<Funcionario> executoresSet = os.getAcompanhamentos().stream()
            .map(AcompanhamentoOS::getFuncionario) // Pega o funcionário de cada relatório
            .filter(Objects::nonNull) // Garante que não há relatórios com funcionário nulo
            .collect(Collectors.toSet()); // Coleta em um Set para garantir valores únicos

        // 2. Fallback: Se NENHUM relatório foi registrado,
        //    assume que o mecânico que deu "Ciência" foi o executor.
        if (executoresSet.isEmpty() && os.getMecanicoCiencia() != null) {
            executoresSet.add(os.getMecanicoCiencia());
        }

        // 3. Validação final: Se não há relatórios E não há mecânico de ciência,
        //    não podemos saber quem executou o serviço.
        if (executoresSet.isEmpty()) {
            throw new IllegalStateException("Não foi possível determinar o executor. " +
                "Nenhum relatório parcial foi registrado e a OS não possui um 'Mecânico de Ciência' associado.");
        }
        
        // 4. Associa os executores encontrados à OS.
        os.setExecutores(executoresSet);
        
        // --- Fim da alteração da lógica de executores ---
        
        os.setDataExecucao(LocalDateTime.now());
        os.setAcaoRealizada(dto.getAcaoRealizada());
        os.setTrocaPecas(dto.getTrocaPecas());
        os.setInicio(dto.getInicio()); // Início da execução
        os.setTermino(dto.getTermino()); // Fim da execução
        
        if (os.getMaquinaParada() != null && os.getMaquinaParada()) {
            os.setFimDowntime(dto.getFimDowntime()); 
        }
        
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
        
        if (os.getTipoManutencao() == TipoManutencao.PREVENTIVA && dto.getStatusFinal() == StatusOrdemServico.CONCLUIDA) {
            os.setStatus(StatusOrdemServico.AGUARDANDO_VERIFICACAO);
            os.setStatusVerificacao(StatusVerificacao.PENDENTE);
        } else {
            os.setStatus(dto.getStatusFinal());
            os.setStatusVerificacao(StatusVerificacao.NAO_APLICAVEL);
        }

        OrdemServico osAtualizada = osRepository.save(os);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }

    // ... (verificarOS permanece inalterado) ...
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
            agendarProximaPreventiva(osConcluida);
        } else {
            osConcluida.setStatus(StatusOrdemServico.EM_EXECUCAO);
            osConcluida.setStatusVerificacao(StatusVerificacao.REPROVADO);
        }
        
        OrdemServico osAtualizada = osRepository.save(osConcluida);
        return ordemServicoMapper.converteParaDTO(osAtualizada);
    }

    // ... (buscarComFiltros e buscarPorId permanecem inalterados) ...
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

    // ... (deletarOrdemServico permanece inalterado) ...
    @Transactional
    public void deletarOrdemServico(Long id) {
        OrdemServico os = osRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
        osRepository.delete(os);
    }
    
    // ... (agendarProximaPreventiva e calcularProximaData permanecem inalterados) ...
    private void agendarProximaPreventiva(OrdemServico osBase) {
        if (osBase.getTipoManutencao() != TipoManutencao.PREVENTIVA || 
            osBase.getFrequencia() == null || 
            osBase.getEquipamento() == null ||
            osBase.getTiposServico() == null || // Valida se os serviços existem
            osBase.getTiposServico().isEmpty()) {
            return;
        }

        final int TOTAL_PREVISTAS_DESEJADAS = 3;
        Frequencia frequencia = osBase.getFrequencia();
        Equipamento equipamento = osBase.getEquipamento();
        Set<Long> idsServicosDoPlano = osBase.getTiposServico().stream()
                                                .map(TipoServico::getId)
                                                .collect(Collectors.toSet());

        List<OrdemServico> todasAsOSsDoPlano = osRepository.findByEquipamentoIdAndFrequenciaId(
            equipamento.getId(),
            frequencia.getId()
        );

        List<OrdemServico> osDoPlanoEspecifico = todasAsOSsDoPlano.stream()
            .filter(os -> {
                if (os.getTiposServico() == null) return false;
                Set<Long> idsServicosAtuais = os.getTiposServico().stream()
                                                .map(TipoServico::getId)
                                                .collect(Collectors.toSet());
                return idsServicosAtuais.equals(idsServicosDoPlano);
            })
            .collect(Collectors.toList());

        long osAbertasAtuais = osDoPlanoEspecifico.stream()
            .filter(os -> os.getStatus() == StatusOrdemServico.ABERTA)
            .count();

        int osParaCriar = TOTAL_PREVISTAS_DESEJADAS - (int) osAbertasAtuais;
        
        if (osParaCriar <= 0) {
            return;
        }

        LocalDateTime dataBase = osDoPlanoEspecifico.stream()
            .map(OrdemServico::getDataInicioPreventiva)
            .filter(Objects::nonNull) // Remove datas nulas
            .max(LocalDateTime::compareTo) // Encontra a data mais recente
            .orElse(osBase.getDataInicioPreventiva()); // Se não achar, usa a OS base

        if (dataBase == null) {
            dataBase = LocalDateTime.now();
        }

        LocalDateTime proximaDataHora = dataBase;
        long ultimoNumeroSequencial = osRepository.findMaxNumeroSequencial().orElse(0L);

        for (int i = 0; i < osParaCriar; i++) {
            proximaDataHora = calcularProximaData(proximaDataHora, frequencia);
            if (proximaDataHora == null) continue; // Se o cálculo falhar

            ultimoNumeroSequencial++; 
            
            OrdemServico proximaOS = new OrdemServico();
            proximaOS.setEquipamento(equipamento);
            proximaOS.setLocal(osBase.getLocal());
            proximaOS.setTipoManutencao(TipoManutencao.PREVENTIVA);
            proximaOS.setTiposServico(new HashSet<>(osBase.getTiposServico())); // Reutiliza o Set de serviços
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
            proximaOS.setNumeroSequencial(ultimoNumeroSequencial);
            proximaOS.setCodigoOs(String.valueOf(ultimoNumeroSequencial));
            
            osRepository.save(proximaOS);
        }
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