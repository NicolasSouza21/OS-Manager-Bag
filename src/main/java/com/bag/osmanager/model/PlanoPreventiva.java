package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.Frequencia;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "planos_preventiva")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoPreventiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associa este plano a um equipamento específico.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipamento_id", nullable = false)
    private Equipamento equipamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequencia frequencia;

    // ✅ ALTERAÇÃO APLICADA AQUI
    // O campo 'servico' agora é uma relação com a entidade TipoServico.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    @Column
    private Integer toleranciaDias; // A tolerância em dias
}