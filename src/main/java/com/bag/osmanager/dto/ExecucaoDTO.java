package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExecucaoDTO {
    
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    private List<PecaSubstituidaDTO> pecasSubstituidas;

    // ✨ ALTERAÇÃO AQUI: Novos campos para as justificativas
    private String motivoMaquinaParada;
    private String motivoTrocaPeca;

    @NotNull(message = "O status final da OS é obrigatório.")
    private StatusOrdemServico statusFinal; 
}