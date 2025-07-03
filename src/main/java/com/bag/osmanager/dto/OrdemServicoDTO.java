package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdemServicoDTO {
    private Long id;

    private Long equipamentoId;
    private Long localId;

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
    private String tagEquipamento;

private String nomeEquipamento;

private String nomeLocal;

    private StatusOrdemServico status;

    // ======= Campos para Ciência do Líder =======
    private Long liderCienciaId;
    private String cienciaLider; // "SIM" ou "NAO"
    private LocalDateTime dataCienciaLider;
}