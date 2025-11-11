package com.bag.osmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ✨ ALTERAÇÃO AQUI: Código completo do novo DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgramacaoManutencaoDTO {

    private String servico;
    private String frequencia;
    private String ultimoManutentor;
    
    // ✨ ALTERAÇÃO AQUI: Novo campo adicionado para o Tempo Padrão
    private String tempoPadrao;

}