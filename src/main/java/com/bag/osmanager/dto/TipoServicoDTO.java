package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank; // ✨ ALTERAÇÃO: Import para validação
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set; 

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoServicoDTO {
    private Long id;

    // ✨ ALTERAÇÃO AQUI: Garante que o nome não seja nulo nem vazio
    @NotBlank(message = "O nome do serviço é obrigatório.")
    private String nome;

    private String descricao;

    // ✅ NOVO CAMPO: Lista de IDs dos equipamentos para associar a este serviço
    private Set<Long> equipamentoIds;
}