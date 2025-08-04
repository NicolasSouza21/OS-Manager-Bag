package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para transferência de dados do Local.
 */
@Data
public class LocalDTO {

    private Long id;

    @NotBlank(message = "O nome do local é obrigatório.")
    private String nome;

    // ✨ ALTERAÇÃO AQUI: Trocamos o campo de texto por um ID para a relação.
    @NotNull(message = "O ID do setor é obrigatório.")
    private Long setorId;

    // ✨ ALTERAÇÃO AQUI: Campo adicional para retornar o nome do setor (usado na listagem).
    private String setorNome;
}