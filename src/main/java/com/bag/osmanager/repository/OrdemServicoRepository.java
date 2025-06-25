// Local do arquivo: src/main/java/com/bag/osmanager/repository/OrdemServicoRepository.java
package com.bag.osmanager.repository;

import com.bag.osmanager.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // 👈 IMPORT ADICIONADO

// 👇 FAÇA O REPOSITÓRIO ESTENDER JpaSpecificationExecutor 👇
public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long>, JpaSpecificationExecutor<OrdemServico> {
    // Exemplo futuro: List<OrdemServico> findByPrioridade(Prioridade prioridade);
}