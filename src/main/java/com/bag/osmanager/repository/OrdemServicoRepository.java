// Local: src/main/java/com/bag/osmanager/repository/OrdemServicoRepository.java
package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico; 
import com.bag.osmanager.model.enums.TipoManutencao;
import org.springframework.data.domain.Sort; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // ✨ ALTERAÇÃO AQUI: Import adicionado

import java.time.LocalDateTime;
import java.util.List; 
import java.util.Optional;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    boolean existsByEquipamentoId(Long equipamentoId);

    /**
     * Encontra todas as Ordens de Serviço para um determinado equipamento, com ordenação.
     * @param equipamentoId O ID do equipamento a ser buscado.
     * @param sort O critério de ordenação.
     * @return Uma lista de Ordens de Serviço.
     */
    List<OrdemServico> findByEquipamentoId(Long equipamentoId, Sort sort);

    /**
     * Encontra o maior valor na coluna 'numero_sequencial' para determinar o próximo número único.
     * @return um Optional contendo o maior número sequencial, ou vazio se a tabela estiver vazia.
     */
    @Query("SELECT MAX(os.numeroSequencial) FROM OrdemServico os")
    Optional<Long> findMaxNumeroSequencial();

    // --- MÉTODOS PARA RELATÓRIOS ---

    // ✨ ALTERAÇÃO AQUI: Consulta (Gráfico 1: Mecânicos)
    // Busca OSs que ESTAVAM ATIVAS (overlapping) no período, não apenas as concluídas.
    @Query("SELECT os FROM OrdemServico os WHERE " +
           "os.inicio <= :fimPeriodo AND " +
           "(os.termino >= :inicioPeriodo OR os.termino IS NULL) AND " +
           "os.status NOT IN (com.bag.osmanager.model.enums.StatusOrdemServico.ABERTA, com.bag.osmanager.model.enums.StatusOrdemServico.PENDENTE) AND " +
           "os.executores IS NOT EMPTY AND os.inicio IS NOT NULL")
    List<OrdemServico> findForRelatorioMecanicos(
        @Param("inicioPeriodo") LocalDateTime inicioPeriodo, 
        @Param("fimPeriodo") LocalDateTime fimPeriodo
    );

    /**
     * (Gráfico 2: Ranking Corretivas) Busca OSs Corretivas e Concluídas dentro do período.
     * (Esta consulta está CORRETA, pois é uma contagem de *conclusões*).
     */
    List<OrdemServico> findAllByStatusAndTipoManutencaoAndTerminoBetween(
        StatusOrdemServico status,
        TipoManutencao tipo,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );

    // ✨ ALTERAÇÃO AQUI: Consulta (Gráfico 3: Downtime)
    // Busca OSs com downtime que ESTAVAM ATIVAS (overlapping) no período.
    @Query("SELECT os FROM OrdemServico os WHERE " +
           "os.inicioDowntime <= :fimPeriodo AND " + // Parada começou antes do fim do período
           "(os.fimDowntime >= :inicioPeriodo OR os.fimDowntime IS NULL) AND " + // Parada terminou depois do início do período (ou não terminou)
           "os.status NOT IN (com.bag.osmanager.model.enums.StatusOrdemServico.ABERTA, com.bag.osmanager.model.enums.StatusOrdemServico.PENDENTE) AND " +
           "os.maquinaParada = true AND os.inicioDowntime IS NOT NULL")
    List<OrdemServico> findForRelatorioDowntime(
        @Param("inicioPeriodo") LocalDateTime inicioPeriodo,
        @Param("fimPeriodo") LocalDateTime fimPeriodo
    );
    
    /**
     * (Gráfico 4: Saúde P/C) Busca TODAS as OSs Concluídas dentro do período.
     * (Esta consulta está CORRETA, pois é uma contagem de *conclusões*).
     */
    List<OrdemServico> findAllByStatusAndTerminoBetween(
        StatusOrdemServico status,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );

    // ✨ ALTERAÇÃO AQUI: Consulta (Gráfico 5: Indicadores)
    // Busca OSs Corretivas com downtime que ESTAVAM ATIVAS (overlapping) no período.
    @Query("SELECT os FROM OrdemServico os WHERE " +
           "os.inicioDowntime <= :fimPeriodo AND " +
           "(os.fimDowntime >= :inicioPeriodo OR os.fimDowntime IS NULL) AND " +
           "os.status NOT IN (com.bag.osmanager.model.enums.StatusOrdemServico.ABERTA, com.bag.osmanager.model.enums.StatusOrdemServico.PENDENTE) AND " +
           "os.tipoManutencao = :tipo AND os.maquinaParada = true AND os.inicioDowntime IS NOT NULL")
    List<OrdemServico> findForRelatorioIndicadores(
        @Param("tipo") TipoManutencao tipo,
        @Param("inicioPeriodo") LocalDateTime inicioPeriodo,
        @Param("fimPeriodo") LocalDateTime fimPeriodo
    );


    // ✨✅ CORREÇÃO: Métodos antigos removidos.
    // long countByEquipamentoIdAndFrequenciaIdAndStatus(Long equipamentoId, Long frequenciaId, StatusOrdemServico status);
    // Optional<OrdemServico> findTopByEquipamentoIdAndFrequenciaIdOrderByDataInicioPreventivaDesc(Long equipamentoId, Long frequenciaId);

    // ✨✅ CORREÇÃO: Este é o ÚNICO método que o OrdemServicoService precisa para agendar as preventivas.
    /**
     * Busca todas as OS preventivas para um equipamento e frequência.
     * A filtragem pelo Set de serviços será feita em memória no Service.
     */
    List<OrdemServico> findByEquipamentoIdAndFrequenciaId(Long equipamentoId, Long frequenciaId);

}