package com.bag.osmanager.repository;

import com.bag.osmanager.model.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Interface de repositório para a entidade Local.
 * Ao estender JpaRepository, o Spring Data JPA nos fornece
 * automaticamente todos os métodos básicos de CRUD (Create, Read, Update, Delete).
 */
@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
    // Não precisamos escrever nenhum método aqui.
    // O JpaRepository já nos dá tudo o que precisamos para começar.
}
