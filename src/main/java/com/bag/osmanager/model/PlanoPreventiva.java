// Local: src/main/java/com/bag/osmanager/model/PlanoPreventiva.java
package com.bag.osmanager.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// import java.time.LocalDate; // (Removido pois não é usado)

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frequencia_id", nullable = false)
    private Frequencia frequencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_servico_id", nullable = false)
    private TipoServico tipoServico;

    @Column
    private Integer toleranciaDias;

    @Column(nullable = true)
    private String tempoPadrao; // Armazena como "HH:mm:ss" ou "00:20:00"

    // ✨✅ CORREÇÃO AQUI: Este campo estava faltando
    @Column(nullable = true)
    private String manutentor; // Armazena "Manutenção mecânica", "Manutenção elétrica", etc.


    // Este campo foi removido, pois a data de início é controlada pela OS e não pelo plano.
    // @Column(nullable = false)
    // private LocalDate dataInicio;
}