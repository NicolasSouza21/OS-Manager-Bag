// Local do arquivo: src/main/java/com/bag/osmanager/dto/CriarOrdemServicoDTO.java
package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno;

// ✨ ALTERAÇÃO AQUI: Imports de validação removidos
// import jakarta.validation.constraints.NotEmpty;
// import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class CriarOrdemServicoDTO {

    // ✅ CORREÇÃO: Anotações de validação foram removidas daqui.
    private Long equipamentoId;

    private Long localId;

    private Prioridade prioridade;

    private Turno turno;

    private TipoManutencao tipoManutencao;

    private String descricaoProblema;
    private String solicitante;

    private LocalDate dataInicioPreventiva;
    
    private Set<Long> tipoServicoIds; 

    private Long frequenciaId;
}