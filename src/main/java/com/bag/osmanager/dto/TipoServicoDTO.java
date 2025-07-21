package com.bag.osmanager.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set; // ✅ Importe o Set

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoServicoDTO {
    private Long id;
    private String nome;
    private String descricao;

    // ✅ NOVO CAMPO: Lista de IDs dos equipamentos para associar a este serviço
    private Set<Long> equipamentoIds;
}