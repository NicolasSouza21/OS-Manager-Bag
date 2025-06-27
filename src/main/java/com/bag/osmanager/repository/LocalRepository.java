package com.bag.osmanager.repository;

import com.bag.osmanager.model.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para operações com a entidade Local.
 */
@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
}