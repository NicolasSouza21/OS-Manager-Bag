package com.bag.osmanager.dto;

import jakarta.validation.constraints.NotBlank; // ✨ ALTERAÇÃO AQUI: Import necessário
import lombok.Data;
import java.util.Set;

@Data
public class EquipamentoDTO {
    private Long id;

    // ✨ ALTERAÇÃO AQUI: Garante que o nome não seja nulo ou vazio
    @NotBlank(message = "O nome do equipamento é obrigatório.")
    private String nome;

    // O campo 'tag' (Número do Ativo) não possui validação, tornando-o opcional.
    private String tag;

    // ✨ ALTERAÇÃO AQUI: Garante que a descrição não seja nula ou vazia
    @NotBlank(message = "A descrição do equipamento é obrigatória.")
    private String descricao;

    private Set<TipoServicoDTO> servicosDisponiveis;
}