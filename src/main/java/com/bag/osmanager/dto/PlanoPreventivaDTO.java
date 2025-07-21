package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Frequencia;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoPreventivaDTO {

    private Long id;
    private Long equipamentoId;
    private Frequencia frequencia;
    
    // ✅ ALTERAÇÃO APLICADA AQUI
    // Trocamos o campo 'servico' por uma referência ao 'TipoServico'
    private Long tipoServicoId;
    private String tipoServicoNome; // Para facilitar a exibição no frontend

    private Integer toleranciaDias;
}