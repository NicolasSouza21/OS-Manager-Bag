package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.TipoManutencao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para o relatório de Preventiva vs. Corretiva.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioTipoManutencaoDTO {

    private TipoManutencao tipoManutencao;
    private Long totalOS;

}