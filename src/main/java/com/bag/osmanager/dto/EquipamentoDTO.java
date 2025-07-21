package com.bag.osmanager.dto;

import lombok.Data;
import java.util.Set;

@Data
public class EquipamentoDTO {
    private Long id;
    private String nome;
    private String tag;
    private String descricao; // ✅ Campo adicionado para consistência

    // ✅ Nova lista para carregar os serviços disponíveis para este equipamento
    // Usamos um Set para garantir que não haja serviços duplicados.
    private Set<TipoServicoDTO> servicosDisponiveis;
}