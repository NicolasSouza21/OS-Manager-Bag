package com.bag.osmanager.dto;

// import com.bag.osmanager.model.enums.Frequencia; // ✨ ALTERAÇÃO AQUI: Import do enum antigo removido
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoPreventivaDTO {

    private Long id;
    private Long equipamentoId;

    // ✨ ALTERAÇÃO AQUI: O campo 'frequencia' (enum) foi trocado por 'frequenciaId' (Long).
    private Long frequenciaId;
    
    // ✨ ALTERAÇÃO AQUI: Campo para retornar os dados completos da frequência para o frontend.
    private FrequenciaDTO frequencia; 

    private Long tipoServicoId;
    private String tipoServicoNome; 
    
    private Integer toleranciaDias;

    // ✨ ALTERAÇÃO AQUI: O campo 'dataInicio' foi removido.
    // private LocalDate dataInicio;
}