package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico; // ✅ IMPORT ADICIONADO
import jakarta.validation.constraints.NotNull; // ✅ IMPORT ADICIONADO
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ExecucaoDTO {
    // O mecanicoId não é mais necessário aqui, pois pegamos do usuário logado
    // private Long mecanicoId; 
    
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    private List<PecaSubstituidaDTO> pecasSubstituidas;

    // ✅ NOVO CAMPO PARA O STATUS FINAL
    @NotNull(message = "O status final da OS é obrigatório.")
    private StatusOrdemServico statusFinal; 
}