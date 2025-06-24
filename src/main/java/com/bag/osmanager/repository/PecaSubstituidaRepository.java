package com.bag.osmanager.repository;

import com.bag.osmanager.model.PecaSubstituida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PecaSubstituidaRepository extends JpaRepository<PecaSubstituida, Long> {
    // Se precisar, podemos fazer buscas por OrdemServico, ex:
    // List<PecaSubstituida> findByOrdemServicoId(Long osId);
}
