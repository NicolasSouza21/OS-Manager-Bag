package com.bag.osmanager.repository;

import com.bag.osmanager.model.Funcionario;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByEmail(String email);
}
