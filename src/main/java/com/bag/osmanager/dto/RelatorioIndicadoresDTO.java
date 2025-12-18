package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para os indicadores de MTTR e MTBF.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioIndicadoresDTO {

    private Double mttr; // Tempo Médio Para Reparo (em horas)
    private Double mtbf; // Tempo Médio Entre Falhas (em horas)

}