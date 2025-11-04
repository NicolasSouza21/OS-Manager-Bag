package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * Entidade para armazenar o histórico de acompanhamentos parciais
 * (relatórios, pausas, etc.) de uma Ordem de Serviço.
 */
@Entity
@Table(name = "acompanhamentos_os")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AcompanhamentoOS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(columnDefinition = "TEXT")
    private String descricao; // O que foi feito

    @Column(columnDefinition = "TEXT")
    private String motivoPausa; // Por que parou (opcional)

    // ✨ ALTERAÇÃO AQUI: Novo campo para armazenar o tempo de pausa em minutos
    @Column
    private Integer minutosPausa; // Tempo de pausa não produtivo (em minutos)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION) // Não apagar o funcionário se o log for apagado
    private Funcionario funcionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_servico_id", nullable = false)
    @JsonBackReference // Evita loop de serialização
    private OrdemServico ordemServico;
}