package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FrequenciaDTO {

    private Long id;

    @NotBlank(message = "O nome da frequência é obrigatório.")
    private String nome;

    @NotBlank(message = "A descrição da frequência é obrigatória.")
    private String descricao;
}