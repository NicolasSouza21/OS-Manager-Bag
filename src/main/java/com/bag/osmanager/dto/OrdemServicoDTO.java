package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrdemServicoDTO {
    
    private Long id;
    private String codigoOs; // ✅ --- NOVO CAMPO ADICIONADO ---
    private StatusOrdemServico status;
    private String solicitante;
    private LocalDateTime dataSolicitacao;
    private LocalDateTime dataLimite;
    
    // Detalhes da OS
    private Long equipamentoId;
    private Long localId;
    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private List<PecaSubstituidaDTO> pecasSubstituidas;
    
    // Dados da Ciência do Líder
    private Long liderCienciaId;
    private String liderCienciaNome;
    private LocalDateTime dataCiencia;
    
    // Dados da Execução
    private Long executadoPorId;
    private String executadoPorNome;
    private LocalDateTime dataExecucao;
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    
    // Dados da Verificação de Qualidade
    private Long verificadoPorId;
    private String verificadoPorNome;
    private StatusVerificacao statusVerificacao;
    
    // Dados da Aprovação
    private Long aprovadoPorId;
    private String aprovadoPorNome;
    private LocalDateTime dataAprovacao;
    
    // Dados da Preventiva
    private LocalDate dataInicioPreventiva;
    private Long tipoServicoId;
    private String tipoServicoNome;
    private Frequencia frequencia;
}