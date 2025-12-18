package com.bag.osmanager.repository;

import com.bag.osmanager.model.AcompanhamentoOS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; // ✨ ALTERAÇÃO AQUI: Import adicionado
import java.util.List;

@Repository
public interface AcompanhamentoOSRepository extends JpaRepository<AcompanhamentoOS, Long> {
    
    // Podemos usar isso no futuro para listar os acompanhamentos
    List<AcompanhamentoOS> findByOrdemServicoIdOrderByDataHoraDesc(Long ordemServicoId);

    // ✨ ALTERAÇÃO AQUI: Novo método para buscar KPIs de pausa do mecânico
    /**
     * Busca todos os registros de acompanhamento de um funcionário, dentro de um período,
     * que sejam pausas (minutosPausa > 0).
     * Usado para calcular os KPIs de pausa no PainelMecanico.
     */
    List<AcompanhamentoOS> findByFuncionarioIdAndDataHoraBetweenAndMinutosPausaGreaterThan(
        Long funcionarioId, 
        LocalDateTime dataHoraStart, 
        LocalDateTime dataHoraEnd, 
        Integer minutosPausa
    );
}