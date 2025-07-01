package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;

@Data
public class CriarOrdemServicoDTO {
    private Long equipamentoId;
    private Long localId;
    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;
    // status, datas e outros campos são definidos pelo backend no momento da criação
}