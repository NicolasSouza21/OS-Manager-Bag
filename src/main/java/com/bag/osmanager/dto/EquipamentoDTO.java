package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Set;

@Data
public class EquipamentoDTO {
    private Long id;

    @NotBlank(message = "O nome do equipamento é obrigatório.")
    private String nome;

    private String tag;

    // ✨ ALTERAÇÃO AQUI: A anotação @NotBlank foi removida.
    private String descricao;

    private Set<TipoServicoDTO> servicosDisponiveis;
}