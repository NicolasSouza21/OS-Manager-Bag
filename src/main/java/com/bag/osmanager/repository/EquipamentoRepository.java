package com.bag.osmanager.repository;

import com.bag.osmanager.model.Equipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // ✨ ALTERAÇÃO AQUI: Import necessário

/**
 * Interface de repositório para a entidade Equipamento.
 * Ao estender JpaRepository, o Spring Data JPA nos fornece
 * automaticamente todos os métodos básicos de CRUD (Create, Read, Update, Delete).
 */
@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {
    
    // ✨ ALTERAÇÃO AQUI: Método para buscar equipamento pela Tag
    // O Spring Data JPA cria a implementação SQL automaticamente baseado no nome do método.
    Optional<Equipamento> findByTag(String tag);
}