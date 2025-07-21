package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;

@Entity
@Table(name = "tipos_servico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O nome do serviço. Ex: "Limpeza Externa", "Verificar Nível do Óleo"
    @Column(nullable = false, unique = true) // O nome do serviço deve ser único
    private String nome;

    // Uma descrição opcional sobre o que envolve o serviço.
    private String descricao;

    // ✅ NOVA RELAÇÃO: Um tipo de serviço pode estar associado a muitos equipamentos.
    @ManyToMany(mappedBy = "servicosDisponiveis")
    @JsonBackReference // Evita loops infinitos ao converter para JSON
    private Set<Equipamento> equipamentos;
}