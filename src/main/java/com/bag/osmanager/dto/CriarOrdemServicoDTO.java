package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;
import java.time.LocalDate; // ✅ IMPORT ADICIONADO

@Data
public class CriarOrdemServicoDTO {
    private Long equipamentoId;
    private Long localId;
    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;
    
    // =========================================================
    //         👇👇 CAMPOS FALTANTES ADICIONADOS AQUI 👇👇
    // =========================================================
    private LocalDate dataInicioPreventiva;
    private LocalDate dataFimPreventiva;
}