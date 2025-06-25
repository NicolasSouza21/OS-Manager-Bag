// Crie este arquivo em: src/main/java/com/bag/osmanager/service/JwtService.java
package com.bag.osmanager.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Chave secreta para assinar o token. Em um projeto real, isso viria de um arquivo de configuração.
    // Gere uma chave segura, por exemplo, no site: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
    private static final String SECRET_KEY = "MYFvr/E0KCo/Gi0sCPWbI+jSyFScMxE0QbaQxxkfT94/9jZq0kRuE/wJqCb3yVIAR0YewXa8HArskz7CKnR7ZKUvy1I8NosSzehC+GGfyAyYta/MRvIuyLN7gD8bNnF2RseM5ed/fwmloo9akrLQtwWRD3O01JVqeaYSMnGDeSGKKxUPAaETW6qxKFYBwYnMyJAqYWS/43vK66Aj5b3cotHqVyf4Gy+ke7N8a/+Y6BapWfmqFGI7elNo0ABv9D+MJEa06HbWnzedLhAHehoGFCZ9aWYpBO2vbLn5Ask9YJYFWYmN3G4E6VkfTYYnKJekDlBsDqlDFXFHi0GXwvYiz/2TUFotAol5tbDzu8WOJWk=\r\n" + //
                "";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token válido por 10 horas
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
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}