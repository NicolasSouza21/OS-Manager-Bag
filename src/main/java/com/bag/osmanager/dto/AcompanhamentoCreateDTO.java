package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AcompanhamentoCreateDTO {

    /**
     * RELATORIO | PAUSA | OBSERVACAO
     */
    @NotBlank(message = "Tipo do acompanhamento é obrigatório")
    private String tipo;

    // Comum
    private String descricao;

    // Pausa
    private String motivoPausa;
    private Integer minutosPausa;

    // Relatório
    private Integer minutosTrabalhados;

    // Obrigatório
    @NotNull(message = "Ordem de serviço é obrigatória")
    private Long ordemServicoId;
}
