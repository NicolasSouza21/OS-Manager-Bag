// ✨ NOVO ARQUIVO: src/main/java/com/bag/osmanager/service/HorarioUtilService.java
package com.bag.osmanager.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Serviço utilitário para centralizar a lógica de cálculo de horas/minutos úteis
 * com base nos turnos dos mecânicos.
 */
@Service
public class HorarioUtilService {

    // Definição da classe interna de Turno
    private static class Turno {
        final LocalTime inicio;
        final LocalTime fim;
        Turno(LocalTime inicio, LocalTime fim) { this.inicio = inicio; this.fim = fim; }
        boolean viraDia() { return inicio.isAfter(fim); }
    }

    // Mapa de horários (movido do RelatorioService)
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
     * Calcula os minutos úteis (dentro do turno) entre duas datas para um mecânico.
     * @param inicioOS Data/hora de início do período.
     * @param fimOS Data/hora de fim do período.
     * @param nomeMecanico O nome do mecânico (para buscar o turno).
     * @return Total de minutos úteis.
     */
    public long calcularMinutosUteis(LocalDateTime inicioOS, LocalDateTime fimOS, String nomeMecanico) {
        
        String nomeNormalizado = nomeMecanico.trim().toUpperCase().split(" ")[0]; 
        Map<DayOfWeek, Turno> horario = horariosMecanicos.get(nomeNormalizado);

        if (horario == null) {
            String[] nomes = nomeMecanico.trim().toUpperCase().split(" ");
            if (nomes.length > 1) {
                horario = horariosMecanicos.get(nomes[1]); 
            }
            if (horario == null) {
                // Se não achar o mecânico, calcula horas corridas como fallback
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