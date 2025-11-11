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

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    
    // ... (Map de horários e classe Turno permanecem os mesmos) ...
    private static class Turno {
        final LocalTime inicio;
        final LocalTime fim;
        Turno(LocalTime inicio, LocalTime fim) { this.inicio = inicio; this.fim = fim; }
        boolean viraDia() { return inicio.isAfter(fim); }
    }

    private static final Map<String, Map<DayOfWeek, Turno>> horariosMecanicos = new HashMap<>();
    static {
        // Horários de ISRAEL
        Map<DayOfWeek, Turno> horarioIsrael = new HashMap<>();
        Turno turnoSemanaIsrael = new Turno(LocalTime.of(13, 36), LocalTime.of(22, 10));
        horarioIsrael.put(DayOfWeek.MONDAY, turnoSemanaIsrael);
        horarioIsrael.put(DayOfWeek.TUESDAY, turnoSemanaIsrael);
        horarioIsrael.put(DayOfWeek.WEDNESDAY, turnoSemanaIsrael);
        horarioIsrael.put(DayOfWeek.THURSDAY, turnoSemanaIsrael);
        horarioIsrael.put(DayOfWeek.FRIDAY, turnoSemanaIsrael);
        horarioIsrael.put(DayOfWeek.SATURDAY, new Turno(LocalTime.of(11, 15), LocalTime.of(17, 30)));
        horariosMecanicos.put("ISRAEL", horarioIsrael);

        // Horários de MAURICIO
        Map<DayOfWeek, Turno> horarioMauricio = new HashMap<>();
        Turno turnoSemanaMauricio = new Turno(LocalTime.of(5, 0), LocalTime.of(13, 36));
        horarioMauricio.put(DayOfWeek.MONDAY, turnoSemanaMauricio);
        horarioMauricio.put(DayOfWeek.TUESDAY, turnoSemanaMauricio);
        horarioMauricio.put(DayOfWeek.WEDNESDAY, turnoSemanaMauricio);
        horarioMauricio.put(DayOfWeek.THURSDAY, turnoSemanaMauricio);
        horarioMauricio.put(DayOfWeek.FRIDAY, turnoSemanaMauricio);
        horarioMauricio.put(DayOfWeek.SATURDAY, new Turno(LocalTime.of(5, 0), LocalTime.of(11, 15)));
        horariosMecanicos.put("MAURICIO", horarioMauricio);

        // Horários de ROGER
        Map<DayOfWeek, Turno> horarioRoger = new HashMap<>();
        Turno turnoSemanaRoger = new Turno(LocalTime.of(5, 0), LocalTime.of(13, 36));
        horarioRoger.put(DayOfWeek.MONDAY, turnoSemanaRoger);
        horarioRoger.put(DayOfWeek.TUESDAY, turnoSemanaRoger);
        horarioRoger.put(DayOfWeek.WEDNESDAY, turnoSemanaRoger);
        horarioRoger.put(DayOfWeek.THURSDAY, turnoSemanaRoger);
        horarioRoger.put(DayOfWeek.FRIDAY, turnoSemanaRoger);
        horarioRoger.put(DayOfWeek.SATURDAY, new Turno(LocalTime.of(5, 0), LocalTime.of(11, 15)));
        horariosMecanicos.put("ROGER", horarioRoger);

        // Horários de ANTONIO
        Map<DayOfWeek, Turno> horarioAntonio = new HashMap<>();
        Turno turnoSemanaAntonio = new Turno(LocalTime.of(8, 0), LocalTime.of(17, 0));
        horarioAntonio.put(DayOfWeek.MONDAY, turnoSemanaAntonio);
        horarioAntonio.put(DayOfWeek.TUESDAY, turnoSemanaAntonio);
        horarioAntonio.put(DayOfWeek.WEDNESDAY, turnoSemanaAntonio);
        horarioAntonio.put(DayOfWeek.THURSDAY, turnoSemanaAntonio);
        horarioAntonio.put(DayOfWeek.FRIDAY, turnoSemanaAntonio);
        horarioAntonio.put(DayOfWeek.SATURDAY, new Turno(LocalTime.of(8, 0), LocalTime.of(12, 0)));
        horariosMecanicos.put("ANTONIO", horarioAntonio);
        
        // Horários de CARLOS
        Map<DayOfWeek, Turno> horarioCarlos = new HashMap<>();
        Turno turnoSemanaCarlos = new Turno(LocalTime.of(8, 0), LocalTime.of(17, 0)); 
        horarioCarlos.put(DayOfWeek.MONDAY, turnoSemanaCarlos);
        horarioCarlos.put(DayOfWeek.TUESDAY, turnoSemanaCarlos);
        horarioCarlos.put(DayOfWeek.WEDNESDAY, turnoSemanaCarlos);
        horarioCarlos.put(DayOfWeek.THURSDAY, turnoSemanaCarlos);
        horarioCarlos.put(DayOfWeek.FRIDAY, turnoSemanaCarlos);
        horarioCarlos.put(DayOfWeek.SATURDAY, new Turno(LocalTime.of(8, 0), LocalTime.of(12, 0))); 
        horariosMecanicos.put("CARLOS", horarioCarlos); 
    }

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
    // ✨✅ ALTERAÇÃO AQUI: Lógica de cálculo HÍBRIDA (Relatórios + Fallback)
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
    // (Esta lógica está correta - ela conta OSs CONCLUÍDAS no período)
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
    // ✨✅ ALTERAÇÃO AQUI: Lógica de busca e cálculo atualizada
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
    // (Esta lógica está correta - ela conta OSs CONCLUÍDAS no período)
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
    // ✨✅ ALTERAÇÃO AQUI: Lógica de busca e cálculo atualizada
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


    // (A função calcularMinutosUteis não é mais usada para o relatório de produtividade)
    private long calcularMinutosUteis(LocalDateTime inicioOS, LocalDateTime fimOS, String nomeMecanico) {
        
        String nomeNormalizado = nomeMecanico.trim().toUpperCase().split(" ")[0]; 
        Map<DayOfWeek, Turno> horario = horariosMecanicos.get(nomeNormalizado);

        if (horario == null) {
            String[] nomes = nomeMecanico.trim().toUpperCase().split(" ");
            if (nomes.length > 1) {
                horario = horariosMecanicos.get(nomes[1]); 
            }
            if (horario == null) {
                if (inicioOS == null || fimOS == null) return 0;
                return Duration.between(inicioOS, fimOS).toMinutes();
            }
        }

        if (inicioOS == null || fimOS == null) {
            return 0;
        }

        long totalMinutosUteis = 0;
        LocalDateTime cursor = inicioOS; 

        while (cursor.isBefore(fimOS)) {
            DayOfWeek diaDaSemana = cursor.getDayOfWeek();
            Turno turnoDoDia = horario.get(diaDaSemana); 

            if (turnoDoDia == null) {
                cursor = cursor.toLocalDate().plusDays(1).atStartOfDay(); 
                continue;
            }

            LocalDateTime inicioTurno = cursor.toLocalDate().atTime(turnoDoDia.inicio);
            LocalDateTime fimTurno = cursor.toLocalDate().atTime(turnoDoDia.fim);
            
            if (turnoDoDia.viraDia()) {
                if (cursor.toLocalTime().isAfter(turnoDoDia.inicio)) {
                    fimTurno = cursor.toLocalDate().plusDays(1).atTime(turnoDoDia.fim);
                } else { 
                    inicioTurno = cursor.toLocalDate().minusDays(1).atTime(turnoDoDia.inicio);
                }
            }
            
            LocalDateTime inicioCalculo = cursor.isAfter(inicioTurno) ? cursor : inicioTurno;
            LocalDateTime fimCalculo = fimOS.isBefore(fimTurno) ? fimOS : fimTurno;

            if (inicioCalculo.isBefore(fimCalculo)) {
                totalMinutosUteis += Duration.between(inicioCalculo, fimCalculo).toMinutes();
            }

            if (fimOS.isAfter(fimTurno)) {
                 cursor = cursor.toLocalDate().plusDays(1).atStartOfDay();
            } else {
                cursor = fimOS;
            }
        }
        return totalMinutosUteis;
    }
}