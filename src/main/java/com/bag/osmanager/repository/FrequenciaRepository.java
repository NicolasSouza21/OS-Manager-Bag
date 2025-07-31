package com.bag.osmanager.repository;

import com.bag.osmanager.model.Frequencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade Frequencia.
 * Fornece métodos CRUD prontos para uso.
 */
@Repository
public interface FrequenciaRepository extends JpaRepository<Frequencia, Long> {
}