package com.bag.osmanager.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para criar e exibir Acompanhamentos da OS.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcompanhamentoOSDTO {
    
    private Long id;
    private LocalDateTime dataHora;
    private String descricao;
    private String motivoPausa;
    
    // ✨ ALTERAÇÃO AQUI: Novo campo para o tempo de pausa em minutos
    private Integer minutosPausa;

    // Usado para exibir quem criou
    private Long funcionarioId;
    private String funcionarioNome;

    // Usado para criar
    private Long ordemServicoId;
}