package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CriarOrdemServicoDTO {
    private Long equipamentoId;
    private Long localId;
    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;
    private LocalDate dataInicioPreventiva;
    
    // ✅ --- ALTERAÇÕES APLICADAS AQUI --- ✅

    // O campo 'dataFimPreventiva' foi removido.
    
    // Novo campo para receber o ID do serviço selecionado no catálogo.
    private Long tipoServicoId; 

    // Novo campo para receber a frequência da manutenção.
    private Frequencia frequencia; 
}