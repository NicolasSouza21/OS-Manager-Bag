package com.bag.osmanager.controller;

import com.bag.osmanager.model.Local;
import com.bag.osmanager.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
public class LocalController {

    private final LocalRepository localRepository;

    @GetMapping
    public List<Local> listar() {
        return localRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Local> criar(@RequestBody Local local) {
        Local salvo = localRepository.save(local);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }
}