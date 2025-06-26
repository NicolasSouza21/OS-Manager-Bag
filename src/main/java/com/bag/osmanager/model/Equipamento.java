package com.bag.osmanager.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Representa um equipamento cadastrado no sistema.
 * Esta classe será mapeada para uma tabela chamada "equipamentos" no banco de dados.
 */
@Entity
@Table(name = "equipamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O nome descritivo do equipamento. Ex: "Prensa Hidráulica 1", "Torno CNC-2"
    private String nome; 

    // Um código ou "tag" único para identificação rápida do equipamento. Ex: "PR-001", "TR-002"
    private String tag; 
}