package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno;

import jakarta.validation.constraints.NotEmpty; // ✨ ALTERAÇÃO AQUI: Import para validar listas não vazias
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set; // ✨ ALTERAÇÃO AQUI: Import do Set

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

    private LocalDateTime dataInicioPreventiva;
    
    // ✨ ALTERAÇÃO AQUI: Trocamos o campo de ID único por um conjunto de IDs
    // Usamos @NotEmpty para garantir que, se a lista for enviada, ela não esteja vazia.
    @NotEmpty(message = "Pelo menos um tipo de serviço deve ser selecionado para preventivas.")
    private Set<Long> tipoServicoIds; 

    private Long frequenciaId;
}