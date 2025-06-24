package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {
    // Exemplo futuro: List<OrdemServico> findByPrioridade(Prioridade prioridade);
}
