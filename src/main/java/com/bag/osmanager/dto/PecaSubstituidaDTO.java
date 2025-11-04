package com.bag.osmanager.dto;

import lombok.Data;

@Data
public class PecaSubstituidaDTO {
    private Long id;
    // ✨ CORREÇÃO AQUI: Renomeado de 'nomePeca' para 'nome'
    private String nome; 
    private Integer quantidade;
    // outros campos conforme model
}