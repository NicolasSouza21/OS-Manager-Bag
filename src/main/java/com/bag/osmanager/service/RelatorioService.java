package com.bag.osmanager.service;

// ✨ ALTERAÇÃO AQUI: Vários imports novos
import com.bag.osmanager.dto.DashboardLiderDTO;
import com.bag.osmanager.dto.RelatorioEquipamentoDTO;
// ✨ ALTERAÇÃO AQUI: Import do novo DTO de indicadores
import com.bag.osmanager.dto.RelatorioIndicadoresDTO; 
import com.bag.osmanager.dto.RelatorioTempoMecanicoDTO;
import com.bag.osmanager.dto.RelatorioTipoManutencaoDTO;
// ✨ ALTERAÇÃO AQUI: Import da entidade AcompanhamentoOS
import com.bag.osmanager.model.AcompanhamentoOS; 
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.TipoManutencao; // ✨ Import
import com.bag.osmanager.repository.OrdemServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator; // ✨ Import
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
    
    // (Não precisamos do AcompanhamentoOSRepository aqui,
    // pois a OrdemServico já carrega a lista de acompanhamentos)

    // ... (A classe Turno e o Map horariosMecanicos permanecem os mesmos) ...
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
    private List<RelatorioTempoMecanicoDTO> gerarRelatorioTempoMecanicos(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        // 1. Busca as OS concluídas no período
        List<OrdemServico> osConcluidas = ordemServicoRepository
            .findByStatusAndExecutadoPorIsNotNullAndInicioIsNotNullAndTerminoIsNotNullAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
                inicioPeriodo,
                fimPeriodo
            );

        // 2. Agrupa por mecânico
        Map<String, List<OrdemServico>> osPorMecanico = osConcluidas.stream()
            .filter(os -> os.getExecutadoPor() != null && os.getExecutadoPor().getNome() != null) 
            .collect(Collectors.groupingBy(os -> os.getExecutadoPor().getNome()));

        // 3. Calcula o tempo de cada mecânico
        return osPorMecanico.entrySet().stream().map(entry -> {
            String nomeMecanico = entry.getKey();
            List<OrdemServico> osDoMecanico = entry.getValue();
            long totalOsConcluidas = osDoMecanico.size();
            
            // ✨✅ ALTERAÇÃO AQUI: Lógica de cálculo de horas gastas foi atualizada
            double totalHorasGastas = osDoMecanico.stream()
                .mapToDouble(os -> {
                    // Se a OS não tem início/término (dados antigos), não conta
                    if (os.getInicio() == null || os.getTermino() == null) {
                        return 0.0;
                    }
                    
                    // 1. Calcula o tempo bruto (horas úteis) entre o início e o término da execução
                    double minutosUteisBrutos = calcularMinutosUteis(os.getInicio(), os.getTermino(), os.getExecutadoPor().getNome());

                    // 2. Busca e soma todas as pausas registradas para esta OS
                    //    (O @Transactional no 'getDashboardLider' permite o lazy-loading aqui)
                    double minutosDePausa = 0.0;
                    if (os.getAcompanhamentos() != null) {
                        minutosDePausa = os.getAcompanhamentos().stream()
                            .filter(acomp -> acomp.getMinutosPausa() != null && acomp.getMinutosPausa() > 0)
                            .mapToDouble(AcompanhamentoOS::getMinutosPausa)
                            .sum();
                    }

                    // 3. Subtrai as pausas do tempo bruto para obter o tempo produtivo
                    double minutosProdutivos = minutosUteisBrutos - minutosDePausa;

                    // 4. Retorna o tempo produtivo em horas (garantindo que não seja negativo)
                    return (minutosProdutivos > 0 ? minutosProdutivos : 0.0) / 60.0;
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
        
        List<OrdemServico> osComDowntime = ordemServicoRepository
            .findAllByStatusAndMaquinaParadaIsTrueAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
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
                        // ✅ CORREÇÃO AQUI: Mudança para horas corridas (elapsed time)
                        // Usar os campos de início e fim do downtime, não da execução
                        if (os.getInicioDowntime() != null && os.getFimDowntime() != null) {
                            // Calcula a duração real (corrida) entre o início e o fim da parada
                            return Duration.between(os.getInicioDowntime(), os.getFimDowntime()).toMinutes() / 60.0;
                        }
                        return 0.0; // Retorna 0 se os dados de downtime estiverem ausentes
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
        
        // 1. Busca todas as OS de corretiva que tiveram máquina parada e foram concluídas no período
        List<OrdemServico> falhas = ordemServicoRepository
            .findAllByStatusAndTipoManutencaoAndMaquinaParadaIsTrueAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
                TipoManutencao.CORRETIVA, // MTTR/MTBF geralmente se aplica a falhas (Corretivas)
                inicioPeriodo,
                fimPeriodo
            );

        if (falhas.isEmpty()) {
            // Se não houve falhas, os indicadores são 0 (ou indefinidos, mas 0 é mais seguro para o DTO)
            return new RelatorioIndicadoresDTO(0.0, 0.0);
        }

        // 2. Calcular o Total de Minutos em Downtime (TTR - Time To Repair)
        //    Usando a nova regra de horas corridas
        double totalMinutosDowntime = falhas.stream()
            .filter(os -> os.getInicioDowntime() != null && os.getFimDowntime() != null)
            .mapToDouble(os -> Duration.between(os.getInicioDowntime(), os.getFimDowntime()).toMinutes())
            .sum();

        // 3. Número de Falhas
        int numeroDeFalhas = falhas.size();

        // 4. Calcular o Total de Minutos no Período Selecionado
        long totalMinutosNoPeriodo = Duration.between(inicioPeriodo, fimPeriodo).toMinutes();

        // 5. Calcular MTTR (Tempo Médio Para Reparo)
        // (Total de tempo de reparo / Número de falhas) -> em horas
        double mttr = (totalMinutosDowntime / numeroDeFalhas) / 60.0;

        // 6. Calcular MTBF (Tempo Médio Entre Falhas)
        // ( (Tempo Total no Período - Tempo Total de Reparo) / Número de falhas ) -> em horas
        double totalMinutosOperacionais = totalMinutosNoPeriodo - totalMinutosDowntime;
        // Se o tempo de reparo for maior que o período, MTBF é 0
        if (totalMinutosOperacionais <= 0) {
            totalMinutosOperacionais = 0;
        }
        
        double mtbf = (totalMinutosOperacionais / numeroDeFalhas) / 60.0;

        // Arredonda para 2 casas decimais
        mttr = Math.round(mttr * 100.0) / 100.0;
        mtbf = Math.round(mtbf * 100.0) / 100.0;

        return new RelatorioIndicadoresDTO(mttr, mtbf);
    }


    // ... (O método calcularMinutosUteis permanece o mesmo, pois é usado pelo Gráfico 1) ...
    private long calcularMinutosUteis(LocalDateTime inicioOS, LocalDateTime fimOS, String nomeMecanico) {
        
        String nomeNormalizado = nomeMecanico.trim().toUpperCase().split(" ")[0]; 
        Map<DayOfWeek, Turno> horario = horariosMecanicos.get(nomeNormalizado);

        if (horario == null) {
            String[] nomes = nomeMecanico.trim().toUpperCase().split(" ");
            if (nomes.length > 1) {
                horario = horariosMecanicos.get(nomes[1]); 
            }
            if (horario == null) {
                // ✅ CORREÇÃO AQUI: Se não achar o mecânico, calcula horas corridas como fallback
                // ⚠️ ATENÇÃO: Se inicioOS ou fimOS forem nulos, isso pode falhar.
                if (inicioOS == null || fimOS == null) return 0;
                return Duration.between(inicioOS, fimOS).toMinutes();
            }
        }

        // ⚠️ ATENÇÃO: Adicionando verificação de nulo para as datas
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

            // Avança o cursor
            // Se o fim da OS é depois do fim do turno, pulamos para o início do próximo dia
            if (fimOS.isAfter(fimTurno)) {
                 // Define o cursor para o início do próximo dia (00:00)
                 cursor = cursor.toLocalDate().plusDays(1).atStartOfDay();
            } else {
                // A OS terminou, o loop vai parar
                cursor = fimOS;
            }
        }
        return totalMinutosUteis;
    }
}