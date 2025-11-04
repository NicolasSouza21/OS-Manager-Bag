package com.bag.osmanager.service;

// ✨ ALTERAÇÃO AQUI: Vários imports novos
import com.bag.osmanager.dto.DashboardLiderDTO;
import com.bag.osmanager.dto.RelatorioEquipamentoDTO;
import com.bag.osmanager.dto.RelatorioTempoMecanicoDTO;
import com.bag.osmanager.dto.RelatorioTipoManutencaoDTO;
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

    // ✨ ALTERAÇÃO AQUI: Novo método principal que retorna o "Super DTO"
    /**
     * Agrega todos os dados de relatório para o dashboard do líder em um período.
     */
    @Transactional(readOnly = true)
    public DashboardLiderDTO getDashboardLider(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        List<RelatorioTempoMecanicoDTO> relatorioMecanicos = gerarRelatorioTempoMecanicos(inicioPeriodo, fimPeriodo);
        List<RelatorioEquipamentoDTO> relatorioRankingCorretivas = gerarRelatorioRankingEquipamentos(inicioPeriodo, fimPeriodo);
        List<RelatorioEquipamentoDTO> relatorioRankingDowntime = gerarRelatorioDowntime(inicioPeriodo, fimPeriodo);
        List<RelatorioTipoManutencaoDTO> relatorioSaude = gerarRelatorioSaude(inicioPeriodo, fimPeriodo);

        return new DashboardLiderDTO(
            relatorioMecanicos,
            relatorioRankingCorretivas,
            relatorioRankingDowntime,
            relatorioSaude
        );
    }

    // --- GRÁFICO 1: TEMPO POR MECÂNICO ---
    private List<RelatorioTempoMecanicoDTO> gerarRelatorioTempoMecanicos(LocalDateTime inicioPeriodo, LocalDateTime fimPeriodo) {
        
        List<OrdemServico> osConcluidas = ordemServicoRepository
            .findByStatusAndExecutadoPorIsNotNullAndInicioIsNotNullAndTerminoIsNotNullAndTerminoBetween(
                StatusOrdemServico.CONCLUIDA,
                inicioPeriodo,
                fimPeriodo
            );

        Map<String, List<OrdemServico>> osPorMecanico = osConcluidas.stream()
            .filter(os -> os.getExecutadoPor() != null && os.getExecutadoPor().getNome() != null) 
            .collect(Collectors.groupingBy(os -> os.getExecutadoPor().getNome()));

        return osPorMecanico.entrySet().stream().map(entry -> {
            String nomeMecanico = entry.getKey();
            List<OrdemServico> osDoMecanico = entry.getValue();
            long totalOsConcluidas = osDoMecanico.size();
            
            double totalHorasGastas = osDoMecanico.stream()
                .mapToDouble(os -> calcularMinutosUteis(os.getInicio(), os.getTermino(), os.getExecutadoPor().getNome()) / 60.0)
                .sum();
            
            totalHorasGastas = Math.round(totalHorasGastas * 100.0) / 100.0;
            return new RelatorioTempoMecanicoDTO(nomeMecanico, totalOsConcluidas, totalHorasGastas);

        }).collect(Collectors.toList());
    }

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 2
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

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 3
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
                        // Usamos o cálculo de horas úteis, pois a máquina só está "parada" durante o expediente
                        return calcularMinutosUteis(os.getInicio(), os.getTermino(), "ANTONIO") / 60.0; // Usa um turno padrão para downtime
                    })
                    .sum();
                totalHorasDowntime = Math.round(totalHorasDowntime * 100.0) / 100.0;
                
                return new RelatorioEquipamentoDTO(nomeEquipamento, 0L, totalHorasDowntime);
            })
            .sorted(Comparator.comparingDouble(RelatorioEquipamentoDTO::getTotalHorasDowntime).reversed()) // Ordena
            .limit(10) // Pega o Top 10
            .collect(Collectors.toList());
    }

    // ✨ ALTERAÇÃO AQUI: Novo método para o Gráfico 4
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


    // ... (O método calcularMinutosUteis permanece o mesmo) ...
    private long calcularMinutosUteis(LocalDateTime inicioOS, LocalDateTime fimOS, String nomeMecanico) {
        
        String nomeNormalizado = nomeMecanico.trim().toUpperCase().split(" ")[0]; 
        Map<DayOfWeek, Turno> horario = horariosMecanicos.get(nomeNormalizado);

        if (horario == null) {
            String[] nomes = nomeMecanico.trim().toUpperCase().split(" ");
            if (nomes.length > 1) {
                horario = horariosMecanicos.get(nomes[1]); 
            }
            if (horario == null) {
                return Duration.between(inicioOS, fimOS).toMinutes();
            }
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