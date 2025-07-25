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
import java.util.List;

@Entity
@Table(name = "ordens_servico", indexes = {
    // Adding indexes to the new columns for faster lookups
    @Index(name = "idx_numero_corretiva", columnList = "numero_corretiva"),
    @Index(name = "idx_numero_preventiva", columnList = "numero_preventiva")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This field remains as the final, user-facing unique code
    @Column(name = "codigo_os", unique = true, nullable = true)
    private String codigoOs;

    // ✅ --- NEW COLUMNS FOR SEPARATE SEQUENCES ---
    @Column(name = "numero_corretiva", unique = true, nullable = true)
    private Long numeroCorretiva;

    @Column(name = "numero_preventiva", unique = true, nullable = true)
    private Long numeroPreventiva;
    // --- END OF NEW COLUMNS ---

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
    @OnDelete(action = OnDeleteAction.SET_NULL)
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
    private LocalDate dataInicioPreventiva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_servico_id")
    private TipoServico tipoServico;

    @Enumerated(EnumType.STRING)
    private Frequencia frequencia;
}