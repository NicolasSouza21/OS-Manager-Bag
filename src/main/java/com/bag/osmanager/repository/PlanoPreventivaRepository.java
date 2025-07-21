package com.bag.osmanager.repository;

import com.bag.osmanager.model.PlanoPreventiva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanoPreventivaRepository extends JpaRepository<PlanoPreventiva, Long> {
    // Esta função nos permitirá buscar todos os planos de um equipamento específico.
    List<PlanoPreventiva> findByEquipamentoId(Long equipamentoId);
}