package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;

@Data
public class CriarOrdemServicoDTO {
    private String numeroMaquina;
    private Prioridade prioridade;
    private String tipoMaquina;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;
}
