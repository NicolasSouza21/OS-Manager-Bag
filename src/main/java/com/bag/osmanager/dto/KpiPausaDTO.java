// Local: src/main/java/com/bag/osmanager/dto/KpiPausaDTO.java
package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para os KPIs (Indicadores) de pausa do mecânico.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiPausaDTO {
    
    private Double totalHorasPausa; // Total de horas em pausa no período
    private Long totalPausas; // Número total de pausas registradas
    private Double mediaMinutosPausa; // Duração média (em minutos) de cada pausa
}