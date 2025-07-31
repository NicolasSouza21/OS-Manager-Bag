package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

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

    // Campos específicos para OS Preventiva
    private LocalDate dataInicioPreventiva;
    private Long tipoServicoId;

    // ✅ CORREÇÃO FINAL ESTÁ AQUI: O campo agora é 'frequenciaId' e do tipo Long.
    private Long frequenciaId;
}