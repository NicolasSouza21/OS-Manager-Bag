// Local do arquivo: src/main/java/com/bag/osmanager/dto/CriarOrdemServicoDTO.java
package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
// import com.bag.osmanager.model.enums.Turno; // ✨ ALTERAÇÃO AQUI: Import removido
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class CriarOrdemServicoDTO {

    @NotNull(message = "O ID do equipamento é obrigatório.")
    private Long equipamentoId;

    private Long localId;

    // A prioridade só é obrigatória para corretivas, a validação será feita no service.
    private Prioridade prioridade;

    // ✨ ALTERAÇÃO AQUI: O campo 'turno' e sua validação @NotNull foram completamente removidos.
    // @NotNull(message = "O turno é obrigatório.")
    // private Turno turno;

    @NotNull(message = "O tipo de manutenção é obrigatório.")
    private TipoManutencao tipoManutencao;

    private String descricaoProblema;
    private String solicitante;

    private LocalDateTime dataInicioPreventiva;
    
    private Set<Long> tipoServicoIds; 

    private Long frequenciaId;
}