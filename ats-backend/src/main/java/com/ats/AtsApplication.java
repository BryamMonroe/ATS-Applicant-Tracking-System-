package com.ats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação Spring Boot.
 *
 * @SpringBootApplication é um atalho para três anotações:
 *   @Configuration      → marca como fonte de beans Spring
 *   @EnableAutoConfiguration → ativa a configuração automática (JPA, Web, etc.)
 *   @ComponentScan      → varre o pacote `com.ats` em busca de
 *                         @Service, @Repository, @Controller etc.
 */
@SpringBootApplication
public class AtsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AtsApplication.class, args);
    }
}
