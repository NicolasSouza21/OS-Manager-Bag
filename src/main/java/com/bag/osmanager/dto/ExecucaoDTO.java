package com.bag.osmanager.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExecucaoDTO {
    private Long mecanicoId;
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    private List<PecaSubstituidaDTO> pecasSubstituidas;
}
