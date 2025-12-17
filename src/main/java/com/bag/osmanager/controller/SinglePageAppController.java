package com.bag.osmanager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SinglePageAppController {

    // Este método captura qualquer rota que NÃO tenha um ponto final (como .js, .css, .png)
    // e redireciona para o index.html. Isso permite que o React assuma o controle.
    // Ex: /login, /dashboard, /os/123 -> Todos vão para o index.html
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}