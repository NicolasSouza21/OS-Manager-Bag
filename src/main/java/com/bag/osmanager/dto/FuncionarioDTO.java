package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.TipoFuncionario;
import lombok.Data;

@Data
public class FuncionarioDTO {
    private Long id;
    private String nome;
    private String senha; // 👈 Adicione este campo
    private String email;
    private TipoFuncionario tipoFuncionario;
}
