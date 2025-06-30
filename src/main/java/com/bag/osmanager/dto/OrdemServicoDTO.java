package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdemServicoDTO {
    private Long id;

    private Long equipamentoId; // id do Equipamento relacionado
    private Long localId;       // id do Local relacionado

    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;
    private LocalDateTime dataSolicitacao;

    private Long mecanicoCienciaId;
    private LocalDateTime dataCiencia;
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    private List<PecaSubstituidaDTO> pecasSubstituidas;

    private Long executadoPorId;
    private LocalDateTime dataExecucao;

    private Long verificadoPorId;
    private StatusVerificacao statusVerificacao;

    private Long aprovadoPorId;
    private LocalDateTime dataAprovacao;

    private LocalDateTime dataLimite;
}