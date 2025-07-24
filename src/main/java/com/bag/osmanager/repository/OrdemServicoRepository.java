package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {

    /**
     * Verifica de forma otimizada se existe pelo menos uma Ordem de Serviço
     * associada a um determinado ID de equipamento.
     * @param equipamentoId O ID do equipamento a ser verificado.
     * @return true se existir alguma OS para o equipamento, false caso contrário.
     */
    boolean existsByEquipamentoId(Long equipamentoId); // <-- ✅ MÉTODO ADICIONADO

}