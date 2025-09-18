package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno; // ✨ CORREÇÃO AQUI: Import re-adicionado
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate; 
import java.util.Set;

@Data
public class CriarOrdemServicoDTO {

    @NotNull(message = "O ID do equipamento é obrigatório.")
    private Long equipamentoId;

    private Long localId;

    private Prioridade prioridade;

    // ✨ CORREÇÃO AQUI: Campo 'turno' foi re-adicionado, sem a validação @NotNull.
    private Turno turno;

    @NotNull(message = "O tipo de manutenção é obrigatório.")
    private TipoManutencao tipoManutencao;

    private String descricaoProblema;
    
    // ✨ CORREÇÃO AQUI: Campo 'solicitante' foi re-adicionado, sem validação.
    private String solicitante;

    private LocalDate dataInicioPreventiva;
    
    // ✨ CORREÇÃO AQUI: A validação @NotEmpty que causava o erro foi removida.
    private Set<Long> tipoServicoIds; 

    private Long frequenciaId;
}