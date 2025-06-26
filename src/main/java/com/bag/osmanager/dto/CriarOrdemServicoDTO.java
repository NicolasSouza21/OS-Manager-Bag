package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;

/**
 * DTO atualizado para receber os dados de criação de uma nova Ordem de Serviço.
 * Agora, ele recebe os IDs do equipamento e do local, em vez de textos.
 */
@Data
public class CriarOrdemServicoDTO {
    
    // --- CAMPOS ANTIGOS REMOVIDOS ---
    // private String numeroMaquina;
    // private String tipoMaquina;
    // private Turno turno; // Removido pois não existe mais no formulário novo

    // --- NOVOS CAMPOS ADICIONADOS ---
    private Long equipamentoId; // ID do equipamento selecionado
    private Long localId;       // ID do local selecionado
    private String observacao;  // Campo de observação do novo formulário

    // --- CAMPOS MANTIDOS ---
    private Prioridade prioridade;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private String solicitante;

    private String numeroMaquina;
    
    private String tipoMaquina;
    private Turno turno;
    
}
