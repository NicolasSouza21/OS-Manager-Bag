package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Gera getters, setters, toString, etc.
@NoArgsConstructor // Gera um construtor sem argumentos (essencial para Jackson)
@AllArgsConstructor // Gera um construtor com todos os argumentos
public class StatusUpdateDTO {
    private StatusOrdemServico status;
}