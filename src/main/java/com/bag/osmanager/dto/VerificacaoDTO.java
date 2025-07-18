// Local: src/main/java/com/bag/osmanager/dto/VerificacaoDTO.java
package com.bag.osmanager.dto;

import lombok.Data;

@Data
public class VerificacaoDTO {
    
    // Este campo será 'true' se o encarregado aprovar, e 'false' se reprovar.
    private Boolean aprovado;

    // Um campo para o encarregado escrever o motivo da reprovação ou um comentário de aprovação.
    private String comentarioVerificacao;
}