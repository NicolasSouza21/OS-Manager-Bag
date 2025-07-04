package com.bag.osmanager.service;

import com.bag.osmanager.model.Funcionario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    // 🔒 Lembre-se de externalizar essa chave para um arquivo de configuração em produção!
    private static final String SECRET_KEY = "SuaChaveSuperSecretaDe256BitsDeveSerColocadaAquiSemEspacosOuQuebrasDeLinha";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // --- 👇 PONTO DE ENTRADA PRINCIPAL PARA GERAR O TOKEN 👇 ---
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // 1. Adiciona os cargos (roles)
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        claims.put("roles", roles);

        // 2. Adiciona o nome completo e o ID do usuário
        if (userDetails instanceof Funcionario) {
            Funcionario funcionario = (Funcionario) userDetails;
            claims.put("fullName", funcionario.getNome());
            claims.put("userId", funcionario.getId()); // ✅ Adiciona o ID do usuário aqui
        }

        // 3. Chama o outro método para construir o token com os claims
        return generateToken(claims, userDetails);
    }

    // --- 👇 ESTE MÉTODO APENAS CONSTRÓI O TOKEN COM OS DADOS FORNECIDOS 👇 ---
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        // ❌ O CÓDIGO DUPLICADO FOI REMOVIDO DAQUI
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 horas de validade
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        // O import io.jsonwebtoken.io.Decoders não é necessário se você fizer assim
        byte[] keyBytes = SECRET_KEY.getBytes(); 
        return Keys.hmacShaKeyFor(keyBytes);
    }
}