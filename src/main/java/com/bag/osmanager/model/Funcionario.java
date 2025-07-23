// Local do arquivo: src/main/java/com/bag/osmanager/model/Funcionario.java
package com.bag.osmanager.model;

import com.bag.osmanager.model.enums.TipoFuncionario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

import java.util.List;

@Entity
@Table(name = "funcionarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
// 👇 FAÇA A CLASSE IMPLEMENTAR UserDetails 👇
public class Funcionario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    
    @Column(unique = true) // O email deve ser único para ser usado como login
    private String email;

    // 👇 ADICIONE O CAMPO SENHA 👇
    private String senha;
    
    private String telefone;

    @Enumerated(EnumType.STRING)
    private TipoFuncionario tipoFuncionario;

    // MÉTODOS DA INTERFACE UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // O Spring Security espera um "papel" (Role). Vamos prefixar nosso enum com "ROLE_"
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.tipoFuncionario.name()));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email; // Usaremos o email como username para login
    }

    // Para este exemplo, vamos manter as contas sempre ativas.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}