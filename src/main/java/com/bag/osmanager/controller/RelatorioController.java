package com.bag.osmanager.controller;

// ✨ ALTERAÇÃO AQUI: Importa o novo "Super DTO" e remove o DTO antigo
import com.bag.osmanager.dto.DashboardLiderDTO; 
import com.bag.osmanager.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat; 
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; 
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate; 
import java.time.LocalDateTime; 
import java.time.LocalTime; 
// ✨ ALTERAÇÃO AQUI: Import de List não é mais necessário no DTO de retorno
// import java.util.List; 

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    /**
     * Endpoint para buscar TODOS os dados do dashboard de relatórios do líder.
     * Protegido para ADMIN e LIDER.
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim Data de fim do período (formato YYYY-MM-DD)
     * @return Um objeto DashboardLiderDTO contendo os 4 relatórios.
     */
    // ✨ ALTERAÇÃO AQUI: Endpoint renomeado para refletir o novo DTO
    @GetMapping("/dashboard-lider") 
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER')")
    // ✨ ALTERAÇÃO AQUI: Retorna o "Super DTO"
    public ResponseEntity<DashboardLiderDTO> getDashboardLider(
            @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        
        LocalDateTime inicioPeriodo = dataInicio.atStartOfDay();
        LocalDateTime fimPeriodo = dataFim.atTime(LocalTime.MAX); // Usa 23:59:59.999...
        
        // ✨ ALTERAÇÃO AQUI: Chama o novo método do serviço que retorna o DTO completo
        DashboardLiderDTO relatorio = relatorioService.getDashboardLider(inicioPeriodo, fimPeriodo);
        
        return ResponseEntity.ok(relatorio);
    }
}