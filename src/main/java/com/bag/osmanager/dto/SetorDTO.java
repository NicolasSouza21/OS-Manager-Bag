package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SetorDTO {

    private Long id;

    @NotBlank(message = "O nome do setor é obrigatório.")
    private String nome;
}