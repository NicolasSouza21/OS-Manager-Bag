package com.bag.osmanager.repository;

import com.bag.osmanager.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    // Podemos adicionar métodos de busca customizados depois (ex: por tipo de funcionário)
}
