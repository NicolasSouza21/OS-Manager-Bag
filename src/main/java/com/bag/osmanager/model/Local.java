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
 * Representa um local físico ou setor dentro da fábrica.
 * Esta classe será mapeada para uma tabela chamada "locais" no banco de dados.
 */
@Entity
@Table(name = "locais")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O nome descritivo do local. Ex: "Setor de Prensagem", "Ala de Usinagem"
    private String nome;

    // Um agrupador maior, como o departamento. Ex: "Produção", "Manutenção"
    private String setor;
}