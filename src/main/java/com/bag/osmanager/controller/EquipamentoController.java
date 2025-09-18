package com.bag.osmanager.controller;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.service.EquipamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // 1. ✅ Importe o HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map; // 2. ✅ Importe o Map
import java.util.Set;
 
@RestController
@RequestMapping("/api/equipamentos")
@RequiredArgsConstructor
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    // --- ✅ MÉTODO EXCLUIR ATUALIZADO ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletarEquipamento(@PathVariable Long id) {
        // Chama o serviço, que agora retorna um Map com o resultado
        Map<String, Object> resultado = equipamentoService.deletar(id);
        
        boolean sucesso = (boolean) resultado.get("success");

        if (sucesso) {
            // Se a operação foi bem-sucedida, retorna 204 No Content
            return ResponseEntity.noContent().build();
        } else {
            // Se falhou, retorna 409 Conflict com o Map de resposta no corpo
            // O Map contém a chave "message" que o frontend irá ler.
            return ResponseEntity.status(HttpStatus.CONFLICT).body(resultado);
        }
    }

    // --- O RESTO DA CLASSE PERMANECE IGUAL ---

    // Listar todos
    @GetMapping
    public ResponseEntity<List<EquipamentoDTO>> listarTodosEquipamentos() {
        List<EquipamentoDTO> equipamentos = equipamentoService.listarTodos();
        return ResponseEntity.ok(equipamentos);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipamentoService.buscarPorId(id));
    }

    // Cadastrar novo
    @PostMapping
    public ResponseEntity<EquipamentoDTO> cadastrarEquipamento(@RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO salvo = equipamentoService.cadastrar(equipamentoDTO);
        return ResponseEntity.ok(salvo);
    }

    // Atualizar
    @PutMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> atualizarEquipamento(
            @PathVariable Long id,
            @RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO atualizado = equipamentoService.atualizar(id, equipamentoDTO);
        return ResponseEntity.ok(atualizado);
    }
    
    // --- Endpoints de associação de serviços (permanecem iguais) ---

    @GetMapping("/{equipamentoId}/servicos")
    public ResponseEntity<Set<TipoServicoDTO>> listarServicosPorEquipamento(@PathVariable Long equipamentoId) {
        return ResponseEntity.ok(equipamentoService.listarServicosPorEquipamento(equipamentoId));
    }

    @PostMapping("/{equipamentoId}/servicos/{servicoId}")
    public ResponseEntity<EquipamentoDTO> associarServico(
            @PathVariable Long equipamentoId,
            @PathVariable Long servicoId) {
        return ResponseEntity.ok(equipamentoService.associarServico(equipamentoId, servicoId));
    }

    @DeleteMapping("/{equipamentoId}/servicos/{servicoId}")
    public ResponseEntity<Void> desassociarServico(
            @PathVariable Long equipamentoId,
            @PathVariable Long servicoId) {
        equipamentoService.desassociarServico(equipamentoId, servicoId);
        return ResponseEntity.noContent().build();
    }
}