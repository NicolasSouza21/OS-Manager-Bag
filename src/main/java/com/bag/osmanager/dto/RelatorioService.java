package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Super-DTO que agrupa todos os dados necessários para o dashboard de relatórios do líder.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioService {

    // 1. Gráfico de Produtividade por Mecânico
    private List<RelatorioTempoMecanicoDTO> relatorioMecanicos;
    
    // 2. Gráfico de Ranking de Equipamentos (Total de Corretivas)
    private List<RelatorioEquipamentoDTO> relatorioRankingCorretivas;
    
    // 3. Gráfico de Ranking de Downtime
    private List<RelatorioEquipamentoDTO> relatorioRankingDowntime;
    
    // 4. Gráfico de Saúde (Preventiva vs. Corretiva)
    private List<RelatorioTipoManutencaoDTO> relatorioSaudeManutencao;

}