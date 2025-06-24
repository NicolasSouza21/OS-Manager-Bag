package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusVerificacao;
import lombok.Data;

@Data
public class VerificacaoCQDTO {
    private Long analistaId;
    private StatusVerificacao statusVerificacao;
}
