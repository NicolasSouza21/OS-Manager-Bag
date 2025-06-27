package com.bag.osmanager.dto;

import lombok.Data;

@Data
public class EquipamentoDTO {
    private Long id;
    private String nome;
    private String tag;
    private Long localId; // id do local associado ao equipamento
}