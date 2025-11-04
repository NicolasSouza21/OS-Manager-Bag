// Local: src/main/java/com/bag/osmanager/repository/OrdemServicoRepository.java
package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico; 
import com.bag.osmanager.model.enums.TipoManutencao; // ✨ ALTERAÇÃO AQUI: Import adicionado
import org.springframework.data.domain.Sort; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime; // ✨ ALTERAÇÃO AQUI: Import adicionado
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

    /**
     * (Gráfico 1: Mecânicos) Busca OSs concluídas COM executores e tempos válidos, dentro do período.
     * ✨ CORREÇÃO AQUI: O nome do método foi atualizado de 'ExecutadoPorIsNotNull' para 'ExecutoresIsNotEmpty'
     */
    List<OrdemServico> findByStatusAndExecutoresIsNotEmptyAndInicioIsNotNullAndTerminoIsNotNullAndTerminoBetween(
        StatusOrdemServico status, 
        LocalDateTime inicioPeriodo, 
        LocalDateTime fimPeriodo
    );

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 2 (Ranking de Corretivas)
    /**
     * (Gráfico 2: Ranking Corretivas) Busca OSs Corretivas e Concluídas dentro do período.
     */
    List<OrdemServico> findAllByStatusAndTipoManutencaoAndTerminoBetween(
        StatusOrdemServico status,
        TipoManutencao tipo,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 3 (Downtime)
    /**
     * (Gráfico 3: Downtime) Busca OSs Concluídas onde a máquina ficou PARADA, dentro do período.
     */
    List<OrdemServico> findAllByStatusAndMaquinaParadaIsTrueAndTerminoBetween(
        StatusOrdemServico status,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );
    
    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 4 (Saúde P/C)
    /**
     * (Gráfico 4: Saúde P/C) Busca TODAS as OSs Concluídas dentro do período.
     */
    List<OrdemServico> findAllByStatusAndTerminoBetween(
        StatusOrdemServico status,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 5 (Indicadores MTTR/MTBF)
    /**
     * (Gráfico 5: Indicadores) Busca OSs Corretivas, Concluídas e com Máquina Parada, dentro do período.
     */
    List<OrdemServico> findAllByStatusAndTipoManutencaoAndMaquinaParadaIsTrueAndTerminoBetween(
        StatusOrdemServico status,
        TipoManutencao tipo,
        LocalDateTime inicioPeriodo,
        LocalDateTime fimPeriodo
    );
}