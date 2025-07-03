package com.bag.osmanager.dto;

import lombok.Data;

@Data
public class CienciaLiderDTO {
    private Long liderId;
    private String ciencia; // "SIM" ou "NAO" (adicione este campo se quiser registrar o valor da ciência)
}