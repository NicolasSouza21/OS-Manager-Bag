package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.TipoFuncionario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "funcionarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String telefone;

    @Enumerated(EnumType.STRING)
    private TipoFuncionario tipoFuncionario;
}
