package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.UnidadeTempo; // ✨ ALTERAÇÃO AQUI: Import do novo Enum
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Representa uma frequência de manutenção cadastrável no sistema.
 * Mapeada para a tabela "frequencias".
 */
@Entity
@Table(name = "frequencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Frequencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    // ✨ ALTERAÇÃO AQUI: O campo 'descricao' foi substituído por campos mais estruturados.
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnidadeTempo unidadeTempo; // Ex: HORA, DIA, SEMANA

    @Column(nullable = false)
    private Integer intervalo; // Ex: 3, 7, 15

}