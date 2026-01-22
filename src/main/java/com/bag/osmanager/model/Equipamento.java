package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Representa um equipamento cadastrado no sistema.
 * Esta classe será mapeada para uma tabela chamada "equipamentos" no banco de dados.
 */
@Entity
@Table(name = "equipamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"planos", "servicosDisponiveis", "setor", "local"}) // Evita loops de referência
@ToString(exclude = {"planos", "servicosDisponiveis", "setor", "local"}) // Evita loops de referência
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    // Regra de unicidade para o número do ativo (Tag)
    @Column(unique = true, nullable = false)
    private String tag;

    private String descricao;

    // Relacionamento com Setor (Obrigatório)
    @ManyToOne
    @JoinColumn(name = "setor_id", nullable = false)
    private Setor setor;

    // ✨ ALTERAÇÃO AQUI: Relacionamento com Local alterado para OPCIONAL (nullable = true)
    // Isso permite que o Frontend envie 'null' sem causar erro 500 no banco.
    @ManyToOne
    @JoinColumn(name = "local_id", nullable = true)
    private Local local;

    // Relação: Um equipamento pode ter vários planos de preventiva.
    @OneToMany(mappedBy = "equipamento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("equipamento-planos")
    private List<PlanoPreventiva> planos;

    // Relação: Um equipamento pode ter vários tipos de serviço aplicáveis.
    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
        name = "equipamento_servicos",
        joinColumns = @JoinColumn(name = "equipamento_id"),
        inverseJoinColumns = @JoinColumn(name = "tipo_servico_id")
    )
    @JsonManagedReference("equipamento-servicos")
    private Set<TipoServico> servicosDisponiveis = new HashSet<>();
}