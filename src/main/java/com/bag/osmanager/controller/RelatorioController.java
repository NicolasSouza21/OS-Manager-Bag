package com.bag.osmanager.controller;

// ✨ ALTERAÇÃO AQUI: Importa os novos DTOs e classes de autenticação
import com.bag.osmanager.dto.DashboardLiderDTO;
import com.bag.osmanager.dto.PainelMecanicoDTO;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat; 
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
// ✨ ALTERAÇÃO AQUI: Import do Authentication
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; 
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate; 
import java.time.LocalDateTime; 
import java.time.LocalTime; 

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
    @GetMapping("/dashboard-lider") 
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER')")
    public ResponseEntity<DashboardLiderDTO> getDashboardLider(
            @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        
        LocalDateTime inicioPeriodo = dataInicio.atStartOfDay();
        LocalDateTime fimPeriodo = dataFim.atTime(LocalTime.MAX); // Usa 23:59:59.999...
        
        DashboardLiderDTO relatorio = relatorioService.getDashboardLider(inicioPeriodo, fimPeriodo);
        
        return ResponseEntity.ok(relatorio);
    }

    // ✨ ALTERAÇÃO AQUI: Novo endpoint para o Painel do Mecânico
    /**
     * Endpoint para buscar os dados do painel Kanban do mecânico.
     * Protegido para MECANICO, LIDER e ADMIN.
     * @param dataInicio Data de início para o cálculo dos KPIs de pausa.
     * @param dataFim Data de fim para o cálculo dos KPIs de pausa.
     * @param authentication Fornecido pelo Spring Security, contém o usuário logado.
     * @return Um objeto PainelMecanicoDTO contendo as listas do Kanban e os KPIs.
     */
    @GetMapping("/painel-mecanico")
    @PreAuthorize("hasAnyRole('MECANICO', 'LIDER', 'ADMIN')")
    public ResponseEntity<PainelMecanicoDTO> getPainelMecanico(
            @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            Authentication authentication
    ) {
        // 1. Pega o funcionário logado a partir do token
        Funcionario funcionarioLogado = (Funcionario) authentication.getPrincipal();
        Long mecanicoId = funcionarioLogado.getId();

        // 2. Define o período de busca para os KPIs
        LocalDateTime inicioPeriodo = dataInicio.atStartOfDay();
        LocalDateTime fimPeriodo = dataFim.atTime(LocalTime.MAX);

        // 3. Chama o serviço com o ID do mecânico logado
        PainelMecanicoDTO painel = relatorioService.getPainelMecanico(mecanicoId, inicioPeriodo, fimPeriodo);
        
        return ResponseEntity.ok(painel);
    }
}