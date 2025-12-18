package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

// ✨ ALTERAÇÃO AQUI: Importei o FuncionarioDTO que será usado na lista
import com.bag.osmanager.dto.FuncionarioDTO;

@Data
public class OrdemServicoDTO {
    
    private Long id;
    private String codigoOs;
    private StatusOrdemServico status;
    private String solicitante;
    private LocalDateTime dataSolicitacao;
    private LocalDateTime dataLimite;
    
    // Detalhes da OS
    private Long equipamentoId;
    private Long localId;
    private String localNome;
    private String setorNome;
    private Prioridade prioridade;
    private Turno turno;
    private TipoManutencao tipoManutencao;
    private String descricaoProblema;
    private List<PecaSubstituidaDTO> pecasSubstituidas;
    
    // Dados da Ciência do Líder
    private Long liderCienciaId;
    private String liderCienciaNome;
    private LocalDateTime dataCiencia;
    
    // ✨ ALTERAÇÃO AQUI: Campos de execução unitária removidos
    // private Long executadoPorId;
    // private String executadoPorNome;

    // ✨ ALTERAÇÃO AQUI: Novo campo para a lista de executores (equipe)
    private Set<FuncionarioDTO> executores;

    private LocalDateTime dataExecucao;
    private String acaoRealizada;
    private LocalDateTime inicio;
    private LocalDateTime termino;
    private Boolean maquinaParada;
    private Boolean trocaPecas;
    
    private LocalDateTime inicioDowntime; // (Vindo da entidade)
    private LocalDateTime fimDowntime; // (Vindo da entidade)
    
    // Dados da Verificação de Qualidade
    private Long verificadoPorId;
    private String verificadoPorNome;
    private StatusVerificacao statusVerificacao;
    
    // Dados da Aprovação
    private Long aprovadoPorId;
    private String aprovadoPorNome;
    private LocalDateTime dataAprovacao;
    
    // Dados da Preventiva
    private LocalDateTime dataInicioPreventiva;
    
    private Set<TipoServicoDTO> tiposServico;
    
    private FrequenciaDTO frequencia;

    // ✨ ALTERAÇÃO AQUI: Novo campo para carregar os relatórios parciais
    /**
     * Lista de todos os relatórios parciais (acompanhamentos) salvos para esta OS.
     */
    private List<AcompanhamentoOSDTO> acompanhamentos;
}