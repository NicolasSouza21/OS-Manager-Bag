package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para carregar os dados agregados do relatório de tempo por mecânico.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioTempoMecanicoDTO {

    private String nomeMecanico;
    private Long totalOsConcluidas;
    private Double totalHorasGastas; // Usaremos 'Double' para representar as horas (ex: 8.5 horas)

}