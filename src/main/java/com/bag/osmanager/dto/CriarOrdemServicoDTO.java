package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime; // ✨ ALTERAÇÃO AQUI: Import alterado de LocalDate para LocalDateTime

@Data
public class CriarOrdemServicoDTO {

    @NotNull(message = "O ID do equipamento é obrigatório.")
    private Long equipamentoId;

    private Long localId;

    @NotNull(message = "A prioridade é obrigatória.")
    private Prioridade prioridade;

    @NotNull(message = "O turno é obrigatório.")
    private Turno turno;

    @NotNull(message = "O tipo de manutenção é obrigatório.")
    private TipoManutencao tipoManutencao;

    private String descricaoProblema;
    private String solicitante;

    // ✨ ALTERAÇÃO AQUI: O tipo do campo foi alterado para LocalDateTime
    private LocalDateTime dataInicioPreventiva;
    
    private Long tipoServicoId;
    private Long frequenciaId;
}