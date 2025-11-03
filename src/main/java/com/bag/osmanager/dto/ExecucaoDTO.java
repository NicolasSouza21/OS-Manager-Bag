package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExecucaoDTO {
    
    private String acaoRealizada;
    private LocalDateTime inicio; // Início da *execução*
    private LocalDateTime termino; // Fim da *execução*
    
    // ✨ ALTERAÇÃO AQUI: Novo campo para o fim do downtime
    private LocalDateTime fimDowntime; // Quando a máquina voltou a funcionar

    private Boolean trocaPecas;
    private List<PecaSubstituidaDTO> pecasSubstituidas;
    
    // ✨ ALTERAÇÃO AQUI: Novos campos para as justificativas
    // private String motivoMaquinaParada; // Removido (será capturado na criação)
    private String motivoTrocaPeca;

    // ✨ ALTERAÇÃO AQUI: Campo 'maquinaParada' removido
    // private Boolean maquinaParada; // Removido (agora é capturado na criação da OS)

    @NotNull(message = "O status final da OS é obrigatório.")
    private StatusOrdemServico statusFinal; 
}