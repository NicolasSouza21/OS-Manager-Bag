package com.bag.osmanager.repository;

import com.bag.osmanager.model.Equipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Interface de repositório para a entidade Equipamento.
 * Ao estender JpaRepository, o Spring Data JPA nos fornece
 * automaticamente todos os métodos básicos de CRUD (Create, Read, Update, Delete).
 */
@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {
    // Não precisamos escrever nenhum método aqui por enquanto.
    // O JpaRepository já nos dá métodos como:
    // - findAll() para buscar todos os equipamentos
    // - findById(Long id) para buscar um por ID
    // - save(Equipamento equipamento) para salvar um novo ou atualizar um existente
    // - deleteById(Long id) para apagar um equipamento
}