package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.*;
import com.fasterxml.jackson.annotation.JsonManagedReference; // ✨ ALTERAÇÃO AQUI: Import adicionado
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList; // ✨ ALTERAÇÃO AQUI: Import adicionado
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

    private LocalDateTime inicio; // Início da *execução*
    private LocalDateTime termino; // Término da *execução*

    private Boolean maquinaParada; // Este é o campo antigo, vamos mantê-lo por enquanto
    private Boolean trocaPecas;
    
    // ✨ ALTERAÇÃO AQUI: Novos campos para as justificativas
    @Column(columnDefinition = "TEXT")
    private String motivoMaquinaParada;

    @Column(columnDefinition = "TEXT")
    private String motivoTrocaPeca;

    // ✨ ALTERAÇÃO AQUI: Novos campos para DOWNTIME
    @Column(nullable = true) // Será nulo se a máquina não parou
    private LocalDateTime inicioDowntime; // A hora que a máquina parou (informado na ABERTURA)

    @Column(nullable = true) // Será nulo até a OS ser fechada
    private LocalDateTime fimDowntime; // A hora que a máquina voltou (informado na EXECUÇÃO)
    // --- Fim das novas alterações ---

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PecaSubstituida> pecasSubstituidas;

    // ✨ ALTERAÇÃO AQUI: Adiciona a Relação com os Acompanhamentos (Relatórios Parciais)
    @OneToMany(
        mappedBy = "ordemServico", 
        cascade = CascadeType.ALL, 
        orphanRemoval = true, 
        fetch = FetchType.LAZY
    )
    @JsonManagedReference // Lado "Pai" da relação, para evitar loops
    private List<AcompanhamentoOS> acompanhamentos = new ArrayList<>();
    // --- Fim da nova Relação ---

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