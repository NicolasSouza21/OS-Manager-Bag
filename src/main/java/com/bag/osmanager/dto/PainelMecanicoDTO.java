// Local: src/main/java/com/bag/osmanager/dto/PainelMecanicoDTO.java
package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO principal para o painel Kanban do mecânico.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PainelMecanicoDTO {
    
    // Coluna 1: OSs com status ABERTA
    private List<OrdemServicoDTO> osAbertas;
    
    // Coluna 2: OSs com status PENDENTE (associadas a ele)
    private List<OrdemServicoDTO> osPendentes;
    
    // Coluna 3: OSs com status EM_EXECUCAO (associadas a ele)
    private List<OrdemServicoDTO> osEmExecucao;

    // Os indicadores de pausa
    private KpiPausaDTO kpisPausa;
}