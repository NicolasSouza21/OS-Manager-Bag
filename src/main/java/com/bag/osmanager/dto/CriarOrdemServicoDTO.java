// Local do arquivo: src/main/java/com/bag/osmanager/dto/CriarOrdemServicoDTO.java
package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.TipoManutencao;
import com.bag.osmanager.model.enums.Turno;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime; // ✨ ALTERAÇÃO AQUI: Import adicionado
import java.util.Set;

@Data
public class CriarOrdemServicoDTO {

    // ✅ CORREÇÃO: Anotações de validação foram removidas daqui.
    private Long equipamentoId;

    private Long localId;

    private Prioridade prioridade;

    private Turno turno;

    private TipoManutencao tipoManutencao;

    private String descricaoProblema;
    private String solicitante;

    // Campos de Preventiva
    private LocalDate dataInicioPreventiva;
    private Set<Long> tipoServicoIds; 
    private Long frequenciaId;

    // ✨ ALTERAÇÃO AQUI: Novos campos para Downtime na Corretiva
    private Boolean maquinaParada; // O 'Sim' ou 'Não' da pergunta
    private LocalDateTime inicioDowntime; // O campo "Desde que horas?" (opcional)
}