package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.UnidadeTempo; // ✨ ALTERAÇÃO AQUI: Import do novo Enum
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; // ✨ ALTERAÇÃO AQUI: Import para validação
import jakarta.validation.constraints.Positive; // ✨ ALTERAÇÃO AQUI: Import para validação
import lombok.Data;

@Data
public class FrequenciaDTO {

    private Long id;

    @NotBlank(message = "O nome da frequência é obrigatório.")
    private String nome;

    // ✨ ALTERAÇÃO AQUI: O campo 'descricao' foi substituído pelos campos abaixo

    @NotNull(message = "A unidade de tempo é obrigatória.")
    private UnidadeTempo unidadeTempo;

    @NotNull(message = "O intervalo é obrigatório.")
    @Positive(message = "O intervalo deve ser um número positivo.")
    private Integer intervalo;
}