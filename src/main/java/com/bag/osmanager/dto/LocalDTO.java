package com.bag.osmanager.dto;

import lombok.Data;

/**
 * DTO para transferência de dados do Local.
 */
@Data
public class LocalDTO {
    private Long id;
    private String nome;
    private String setor;
}