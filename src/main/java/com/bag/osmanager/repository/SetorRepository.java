package com.bag.osmanager.repository;

import com.bag.osmanager.model.Setor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SetorRepository extends JpaRepository<Setor, Long> {
    // O JpaRepository já nos fornece os métodos CRUD básicos.
}