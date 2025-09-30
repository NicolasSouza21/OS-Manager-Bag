// Local do arquivo: src/main/java/com/bag/osmanager/OsmanagerApplication.java
package com.bag.osmanager;

import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.enums.TipoFuncionario;
import com.bag.osmanager.repository.FuncionarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder; 

@SpringBootApplication
public class OsmanagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(OsmanagerApplication.class, args);
    }

    // 👇 CÓDIGO ADICIONADO PARA CRIAR O ADMIN NA INICIALIZAÇÃO 👇
    @Bean
    public CommandLineRunner initDatabase(FuncionarioRepository funcionarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@empresa.com";
            
            // 1. Verifica se o usuário admin já existe no banco
            if (!funcionarioRepository.findByEmail(adminEmail).isPresent()) {
                
                System.out.println("**************************************************");
                System.out.println("!! USUÁRIO ADMIN NÃO ENCONTRADO, CRIANDO NOVO... !!");
                System.out.println("**************************************************");

                // 2. Se não existir, cria um novo
                Funcionario admin = new Funcionario();
                admin.setNome("Administrador Padrão");
                admin.setEmail(adminEmail);
                admin.setSenha(passwordEncoder.encode("senha_forte_123")); // Senha é codificada!
                admin.setTelefone("00000000000");
                admin.setTipoFuncionario(TipoFuncionario.ADMIN);

                // 3. Salva o novo admin no banco
                funcionarioRepository.save(admin); 
                
                System.out.println("!! USUÁRIO ADMIN CRIADO COM SUCESSO !!");
            } else {
                System.out.println("Usuário admin já existe. Nenhuma ação necessária.");
            }
 
          
        };
    }
}  