package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "planos_preventiva")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoPreventiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipamento_id", nullable = false)
    @JsonBackReference("equipamento-planos")
    private Equipamento equipamento;

    // ✨ ALTERAÇÃO AQUI: O campo 'frequencia' agora é uma relação com a nova entidade Frequencia.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frequencia_id", nullable = false)
    private Frequencia frequencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    @Column
    private Integer toleranciaDias;

    // Este campo foi removido, pois a data de início é controlada pela OS e não pelo plano.
    // @Column(nullable = false)
    // private LocalDate dataInicio;
}