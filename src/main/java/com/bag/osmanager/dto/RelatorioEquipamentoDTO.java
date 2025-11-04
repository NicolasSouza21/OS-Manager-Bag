package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para o relatório de ranking de equipamentos.
 * Agrupa por equipamento e calcula o total de OS corretivas e o downtime.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioEquipamentoDTO {

    private String nomeEquipamento;
    private Long totalCorretivas;
    private Double totalHorasDowntime; // Horas úteis em que a máquina ficou parada

}