package com.bag.osmanager.repository;

import com.bag.osmanager.model.AcompanhamentoOS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcompanhamentoOSRepository extends JpaRepository<AcompanhamentoOS, Long> {
    
    // Podemos usar isso no futuro para listar os acompanhamentos
    List<AcompanhamentoOS> findByOrdemServicoIdOrderByDataHoraDesc(Long ordemServicoId);
}