package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(
    name = "ordens_servico",
    indexes = {
        @Index(name = "idx_numero_sequencial", columnList = "numero_sequencial", unique = true)
    }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_sequencial", nullable = false, unique = true)
    private Long numeroSequencial;

    @Column(name = "codigo_os", nullable = true)
    private String codigoOs;

    @ManyToOne
    @JoinColumn(name = "equipamento_id", referencedColumnName = "id", nullable = false)
    private Equipamento equipamento;

    @ManyToOne
    @JoinColumn(name = "local_id", referencedColumnName = "id", nullable = true)
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
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Funcionario mecanicoCiencia;
    private LocalDateTime dataCiencia;

    @Column(columnDefinition = "TEXT")
    private String acaoRealizada;

    private LocalDateTime inicio;
    private LocalDateTime termino;

    private Boolean maquinaParada;
    private Boolean trocaPecas;
    
    // ✨ ALTERAÇÃO AQUI: Novos campos para as justificativas
    @Column(columnDefinition = "TEXT")
    private String motivoMaquinaParada;

    @Column(columnDefinition = "TEXT")
    private String motivoTrocaPeca;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PecaSubstituida> pecasSubstituidas;

    @ManyToOne
    @JoinColumn(name = "executado_por_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Funcionario executadoPor;
    private LocalDateTime dataExecucao;

    @ManyToOne
    @JoinColumn(name = "verificado_por_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Funcionario verificadoPor;
    
    private LocalDateTime dataVerificacao;

    @Column(columnDefinition = "TEXT")
    private String comentarioVerificacao;

    @Enumerated(EnumType.STRING)
    private StatusVerificacao statusVerificacao;

    @ManyToOne
    @JoinColumn(name = "aprovado_por_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Funcionario aprovadoPor;
    private LocalDateTime dataAprovacao;

    private LocalDateTime dataLimite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOrdemServico status;

    @Column(nullable = true)
    private LocalDateTime dataInicioPreventiva;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ordens_servico_tipos_servico",
        joinColumns = @JoinColumn(name = "ordem_servico_id"),
        inverseJoinColumns = @JoinColumn(name = "tipo_servico_id")
    )
    private Set<TipoServico> tiposServico = new HashSet<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frequencia_id", nullable = true)
    private Frequencia frequencia;
}