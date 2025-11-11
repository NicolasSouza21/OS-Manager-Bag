// Local: src/main/java/com/bag/osmanager/service/RelatorioService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.DashboardLiderDTO;
import com.bag.osmanager.dto.RelatorioEquipamentoDTO;
import com.bag.osmanager.dto.RelatorioIndicadoresDTO; 
import com.bag.osmanager.dto.RelatorioTempoMecanicoDTO;
import com.bag.osmanager.dto.RelatorioTipoManutencaoDTO;
import com.bag.osmanager.model.AcompanhamentoOS; 
import com.bag.osmanager.model.Funcionario; 
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.TipoManutencao; 
import com.bag.osmanager.repository.OrdemServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// ✨ ALTERAÇÃO AQUI: Imports de DayOfWeek, LocalTime, etc., foram removidos pois a lógica saiu daqui
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList; 
import java.util.Comparator; 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


/**
 * Serviço dedicado à geração de relatórios e dados de BI.
 */
@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final OrdemServicoRepository ordemServicoRepository;
    
    // ✨ ALTERAÇÃO AQUI: A classe interna 'Turno' foi removida.
    // ✨ ALTERAÇÃO AQUI: O mapa 'horariosMecanicos' foi removido.

    /**
     * Agrega todos os dados de relatório para o dashboard do líder em um período.
     */
    @Transactional(readOnly = true)
    public DashboardLiderDTO getDashboardLider(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        List<RelatorioTempoMecanicoDTO> relatorioMecanicos = gerarRelatorioTempoMecanicos(inicioPeriodo, fimPeriodo);
        List<RelatorioEquipamentoDTO> relatorioRankingCorretivas = gerarRelatorioRankingEquipamentos(inicioPeriodo, fimPeriodo);
        List<RelatorioEquipamentoDTO> relatorioRankingDowntime = gerarRelatorioDowntime(inicioPeriodo, fimPeriodo);
        List<RelatorioTipoManutencaoDTO> relatorioSaude = gerarRelatorioSaude(inicioPeriodo, fimPeriodo);
        
        RelatorioIndicadoresDTO relatorioIndicadores = gerarRelatorioIndicadores(inicioPeriodo, fimPeriodo);

        return new DashboardLiderDTO(
            relatorioMecanicos,
            relatorioRankingCorretivas,
            relatorioRankingDowntime,
            relatorioSaude,
            relatorioIndicadores
        );
    }

    // --- GRÁFICO 1: TEMPO POR MECÂNICO ---
    // (Esta lógica permanece a mesma, pois ela lê os minutos do AcompanhamentoOS)
    private List<RelatorioTempoMecanicoDTO> gerarRelatorioTempoMecanicos(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        // 1. Busca OSs que ESTAVAM ATIVAS no período
        List<OrdemServico> osAtivasNoPeriodo = ordemServicoRepository
            .findForRelatorioMecanicos(
                inicioPeriodo,
                fimPeriodo
            );

        // 2. Agrupa por mecânico (MANUALMENTE, pois é ManyToMany)
        Map<String, List<OrdemServico>> osPorMecanico = new HashMap<>();
        for (OrdemServico os : osAtivasNoPeriodo) {
            if (os.getExecutores() != null) {
                for (Funcionario executor : os.getExecutores()) {
                    if (executor != null && executor.getNome() != null) {
                        osPorMecanico
                            .computeIfAbsent(executor.getNome(), k -> new ArrayList<>())
                            .add(os);
                    }
                }
            }
        }

        // 3. Calcula o tempo de cada mecânico
        return osPorMecanico.entrySet().stream().map(entry -> {
            String nomeMecanico = entry.getKey();
            List<OrdemServico> osDoMecanico = entry.getValue();
            
            // Filtra as OSs que foram *concluídas* dentro do período para o total de OS
            long totalOsConcluidas = osDoMecanico.stream()
                .filter(os -> os.getStatus() == StatusOrdemServico.CONCLUIDA &&
                            os.getTermino() != null &&
                            !os.getTermino().isBefore(inicioPeriodo) && 
                            !os.getTermino().isAfter(fimPeriodo))
                .count();
            
            // Soma os 'minutosTrabalhados' dos Acompanhamentos que estão DENTRO do período
            double totalHorasGastas = osDoMecanico.stream()
                .mapToDouble(os -> {
                    
                    // 1. Tenta somar os minutos trabalhados registrados DENTRO do período
                    double minutosTrabalhadosRegistrados = 0.0;
                    boolean usouNovoSistema = false; // Flag para saber se encontrou algum relatório

                    if (os.getAcompanhamentos() != null && !os.getAcompanhamentos().isEmpty()) {
                        minutosTrabalhadosRegistrados = os.getAcompanhamentos().stream()
                            .filter(acomp -> acomp.getFuncionario() != null && 
                                            nomeMecanico.equals(acomp.getFuncionario().getNome()) &&
                                            acomp.getMinutosTrabalhados() != null &&
                                            !acomp.getDataHora().isBefore(inicioPeriodo) && // Não antes do início
                                            !acomp.getDataHora().isAfter(fimPeriodo))      // Não depois do fim
                            .mapToDouble(AcompanhamentoOS::getMinutosTrabalhados)
                            .sum();
                        
                        // Verifica se algum relatório (mesmo com 0 min) foi feito por este mecânico no período
                        if (minutosTrabalhadosRegistrados > 0) {
                           usouNovoSistema = true;
                        } else {
                           usouNovoSistema = os.getAcompanhamentos().stream()
                                .anyMatch(acomp -> acomp.getFuncionario() != null &&
                                                nomeMecanico.equals(acomp.getFuncionario().getNome()) &&
                                                !acomp.getDataHora().isBefore(inicioPeriodo) &&
                                                !acomp.getDataHora().isAfter(fimPeriodo));
                        }
                    }

                    // 2. Se NÃO usou o novo sistema (nenhum relatório no período)
                    //    E a OS foi CONCLUÍDA *dentro* do período (lógica de fallback para OSs antigas)
                    if (!usouNovoSistema && 
                        os.getStatus() == StatusOrdemServico.CONCLUIDA &&
                        os.getTermino() != null &&
                        !os.getTermino().isBefore(inicioPeriodo) && 
                        !os.getTermino().isAfter(fimPeriodo) &&
                        os.getInicio() != null)
                    {
                        // 3. Usa o tempo total da OS (início/término) como fallback
                        //    Calcula o tempo DENTRO do período
                        LocalDateTime inicioCalculo = os.getInicio().isBefore(inicioPeriodo) ? inicioPeriodo : os.getInicio();
                        LocalDateTime fimCalculo = os.getTermino().isAfter(fimPeriodo) ? fimPeriodo : os.getTermino();

                        long totalMinutosOS = 0;
                        if(inicioCalculo.isBefore(fimCalculo)) {
                           totalMinutosOS = Duration.between(inicioCalculo, fimCalculo).toMinutes();
                        }

                        int numExecutores = (os.getExecutores() != null && !os.getExecutores().isEmpty()) ? os.getExecutores().size() : 1;
                        
                        // Divide o tempo total da OS pelo número de executores
                        return (double) totalMinutosOS / numExecutores / 60.0; // Retorna em horas
                    }
                    
                    // 4. Se teve minutos registrados (usouNovoSistema = true), retorna eles
                    return minutosTrabalhadosRegistrados / 60.0;
                })
                .sum();
            
            totalHorasGastas = Math.round(totalHorasGastas * 100.0) / 100.0;
            return new RelatorioTempoMecanicoDTO(nomeMecanico, totalOsConcluidas, totalHorasGastas);

        }).collect(Collectors.toList());
    }

    // --- GRÁFICO 2: RANKING DE CORRETIVAS POR EQUIPAMENTO ---
    private List<RelatorioEquipamentoDTO> gerarRelatorioRankingEquipamentos(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        List<OrdemServico> osCorretivas = ordemServicoRepository
            .findAllByStatusAndTipoManutencaoAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
                TipoManutencao.CORRETIVA,
                inicioPeriodo,
                fimPeriodo
            );
        
        Map<String, Long> corretivasPorEquipamento = osCorretivas.stream()
            .filter(os -> os.getEquipamento() != null && os.getEquipamento().getNome() != null)
            .collect(Collectors.groupingBy(
                os -> os.getEquipamento().getNome(), 
                Collectors.counting() // Conta o número de OS
            ));

        return corretivasPorEquipamento.entrySet().stream()
            .map(entry -> new RelatorioEquipamentoDTO(entry.getKey(), entry.getValue(), 0.0))
            .sorted(Comparator.comparingLong(RelatorioEquipamentoDTO::getTotalCorretivas).reversed()) // Ordena
            .limit(10) // Pega o Top 10
            .collect(Collectors.toList());
    }

    // --- GRÁFICO 3: RANKING DE DOWNTIME POR EQUIPAMENTO ---
    private List<RelatorioEquipamentoDTO> gerarRelatorioDowntime(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        // 1. Busca OSs com downtime que ESTAVAM ATIVAS no período
        List<OrdemServico> osComDowntime = ordemServicoRepository
            .findForRelatorioDowntime(
                inicioPeriodo,
                fimPeriodo
            );
        
        Map<String, List<OrdemServico>> osPorEquipamento = osComDowntime.stream()
             .filter(os -> os.getEquipamento() != null && os.getEquipamento().getNome() != null)
             .collect(Collectors.groupingBy(os -> os.getEquipamento().getNome()));
        
        return osPorEquipamento.entrySet().stream()
            .map(entry -> {
                String nomeEquipamento = entry.getKey();
                double totalHorasDowntime = entry.getValue().stream()
                    .mapToDouble(os -> {
                        if (os.getInicioDowntime() == null) {
                            return 0.0;
                        }
                        
                        // 2. Define o início e o fim do downtime real da OS
                        LocalDateTime inicioRealParada = os.getInicioDowntime();
                        // Se a OS não foi concluída, o fimDowntime é o fim do período
                        LocalDateTime fimRealParada = (os.getFimDowntime() == null || os.getFimDowntime().isAfter(fimPeriodo)) 
                            ? fimPeriodo 
                            : os.getFimDowntime();

                        // 3. "Corta" o tempo para caber no período do relatório
                        LocalDateTime inicioCalculo = inicioRealParada.isBefore(inicioPeriodo) ? inicioPeriodo : inicioRealParada;
                        LocalDateTime fimCalculo = fimRealParada.isAfter(fimPeriodo) ? fimPeriodo : fimRealParada;

                        // 4. Calcula a duração apenas do período que "sobrepõe"
                        if (inicioCalculo.isBefore(fimCalculo)) {
                            return Duration.between(inicioCalculo, fimCalculo).toMinutes() / 60.0;
                        }
                        return 0.0;
                    })
                    .sum();
                totalHorasDowntime = Math.round(totalHorasDowntime * 100.0) / 100.0;
                
                return new RelatorioEquipamentoDTO(nomeEquipamento, 0L, totalHorasDowntime);
            })
            .sorted(Comparator.comparingDouble(RelatorioEquipamentoDTO::getTotalHorasDowntime).reversed()) // Ordena
            .limit(10) // Pega o Top 10
            .collect(Collectors.toList());
    }

    // --- GRÁFICO 4: SAÚDE (PREVENTIVA vs CORRETIVA) ---
    private List<RelatorioTipoManutencaoDTO> gerarRelatorioSaude(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        List<OrdemServico> osConcluidas = ordemServicoRepository
            .findAllByStatusAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
                inicioPeriodo,
                fimPeriodo
            );
            
        Map<TipoManutencao, Long> contagemPorTipo = osConcluidas.stream()
            .collect(Collectors.groupingBy(
                OrdemServico::getTipoManutencao,
                Collectors.counting()
            ));

        return contagemPorTipo.entrySet().stream()
            .map(entry -> new RelatorioTipoManutencaoDTO(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }

    // --- GRÁFICO 5: INDICADORES (MTTR / MTBF) ---
    private RelatorioIndicadoresDTO gerarRelatorioIndicadores(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        // 1. Busca todas as OSs de corretiva que tiveram máquina parada e estavam ativas no período
        List<OrdemServico> falhas = ordemServicoRepository
            .findForRelatorioIndicadores(
                TipoManutencao.CORRETIVA,
                inicioPeriodo,
                fimPeriodo
            );

        if (falhas.isEmpty()) {
            return new RelatorioIndicadoresDTO(0.0, 0.0);
        }

        // 2. Calcular o Total de Minutos em Downtime (TTR) *dentro do período*
        double totalMinutosDowntimeNoPeriodo = falhas.stream()
            .mapToDouble(os -> {
                if (os.getInicioDowntime() == null) return 0.0;
                
                LocalDateTime inicioRealParada = os.getInicioDowntime();
                LocalDateTime fimRealParada = (os.getFimDowntime() == null || os.getFimDowntime().isAfter(fimPeriodo)) 
                    ? fimPeriodo 
                    : os.getFimDowntime();

                LocalDateTime inicioCalculo = inicioRealParada.isBefore(inicioPeriodo) ? inicioPeriodo : inicioRealParada;
                LocalDateTime fimCalculo = fimRealParada.isAfter(fimPeriodo) ? fimPeriodo : fimRealParada;

                if (inicioCalculo.isBefore(fimCalculo)) {
                    return Duration.between(inicioCalculo, fimCalculo).toMinutes();
                }
                return 0.0;
            })
            .sum();

        // 3. Número de Falhas (Contamos *quantas falhas ocorreram* no período)
        // (Aqui consideramos que uma "falha" é o *início* do downtime)
        long numeroDeFalhasNoPeriodo = falhas.stream()
            .filter(os -> os.getInicioDowntime() != null &&
                         !os.getInicioDowntime().isBefore(inicioPeriodo) &&
                         !os.getInicioDowntime().isAfter(fimPeriodo))
            .count();

        if (numeroDeFalhasNoPeriodo == 0) {
            // Se nenhuma falha *começou* no período, não podemos calcular MTTR/MTBF
            return new RelatorioIndicadoresDTO(0.0, 0.0);
        }

        // 4. Calcular o Total de Minutos no Período Selecionado
        long totalMinutosNoPeriodo = Duration.between(inicioPeriodo, fimPeriodo).toMinutes();

        // 5. Calcular MTTR (Tempo Médio Para Reparo)
        // (Total de tempo de reparo / Número de falhas) -> em horas
        double mttr = (totalMinutosDowntimeNoPeriodo / numeroDeFalhasNoPeriodo) / 60.0;

        // 6. Calcular MTBF (Tempo Médio Entre Falhas)
        // ( (Tempo Total no Período - Tempo Total de Reparo) / Número de falhas ) -> em horas
        double totalMinutosOperacionais = totalMinutosNoPeriodo - totalMinutosDowntimeNoPeriodo;
        if (totalMinutosOperacionais <= 0) {
            totalMinutosOperacionais = 0;
        }
        
        double mtbf = (totalMinutosOperacionais / numeroDeFalhasNoPeriodo) / 60.0;

        // Arredonda para 2 casas decimais
        mttr = Math.round(mttr * 100.0) / 100.0;
        mtbf = Math.round(mtbf * 100.0) / 100.0;

        return new RelatorioIndicadoresDTO(mttr, mtbf);
    }

    // ✨ ALTERAÇÃO AQUI: O método 'calcularMinutosUteis' foi removido daqui.
}