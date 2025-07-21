package com.bag.osmanager.repository;

import com.bag.osmanager.model.TipoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoServicoRepository extends JpaRepository<TipoServico, Long> {
    // JpaRepository já nos fornece os métodos básicos (findAll, findById, save, delete, etc.)
}