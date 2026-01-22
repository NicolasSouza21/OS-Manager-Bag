package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Set;

@Data
public class EquipamentoDTO {
    private Long id;

    @NotBlank(message = "O nome do equipamento é obrigatório.")
    private String nome;

    // Tag é obrigatória
    @NotBlank(message = "O número do ativo (Tag) é obrigatório.")
    private String tag;

    private String descricao;

    // Setor continua obrigatório
    @NotNull(message = "O Setor é obrigatório.")
    private Long setorId;

    // ✨ ALTERAÇÃO AQUI: Removido @NotNull para tornar o Local opcional no DTO
    private Long localId;

    // Campos auxiliares para exibição (apenas leitura)
    private String setorNome;
    private String localNome;

    private Set<TipoServicoDTO> servicosDisponiveis;
}