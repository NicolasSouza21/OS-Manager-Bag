package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FinalizacaoDTO {

    @NotNull(message = "O status final não pode ser nulo.")
    private StatusOrdemServico statusFinal;

    // Você pode adicionar outros campos aqui no futuro, como uma observação final.
    // private String observacao;
}