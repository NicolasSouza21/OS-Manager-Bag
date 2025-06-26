package com.bag.osmanager.dto;

import lombok.Data;

/**
 * DTO para transferir dados da entidade Equipamento.
 * Contém apenas os campos que queremos que o frontend veja.
 */
@Data
public class EquipamentoDTO {

    private Long id;
    private String nome;
    private String tag;

}