package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ordens_servico")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipamento_id", referencedColumnName = "id", nullable = false)
    private Equipamento equipamento;

    @ManyToOne
    @JoinColumn(name = "local_id", referencedColumnName = "id", nullable = false)
    private Local local;

    @Enumerated(EnumType.STRING)
    private Prioridade prioridade;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @Enumerated(EnumType.STRING)
    private TipoManutencao tipoManutencao;

    @Column(columnDefinition = "TEXT")
    private String descricaoProblema;

    private String solicitante;
    private LocalDateTime dataSolicitacao;

    @ManyToOne
    @JoinColumn(name = "mecanico_ciencia_id")
    private Funcionario mecanicoCiencia;
    private LocalDateTime dataCiencia;

    @Column(columnDefinition = "TEXT")
    private String acaoRealizada;

    private LocalDateTime inicio;
    private LocalDateTime termino;

    private Boolean maquinaParada;
    private Boolean trocaPecas;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PecaSubstituida> pecasSubstituidas;

    @ManyToOne
    @JoinColumn(name = "executado_por_id")
    private Funcionario executadoPor;
    private LocalDateTime dataExecucao;

    @ManyToOne
    @JoinColumn(name = "verificado_por_id")
    private Funcionario verificadoPor;

    @Enumerated(EnumType.STRING)
    private StatusVerificacao statusVerificacao;

    @ManyToOne
    @JoinColumn(name = "aprovado_por_id")
    private Funcionario aprovadoPor;
    private LocalDateTime dataAprovacao;

    private LocalDateTime dataLimite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOrdemServico status;

    // ===== Campos para Ciência do Líder =====
    @ManyToOne
    @JoinColumn(name = "lider_ciencia_id")
    private Funcionario liderCiencia;

    private String cienciaLider; // "SIM" ou "NAO"

    private LocalDateTime dataCienciaLider;
}