package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.TipoFuncionario;
import lombok.Data;

@Data
public class FuncionarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private TipoFuncionario tipoFuncionario;
}
