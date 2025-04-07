package com.nucleusteq.ifms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.nucleusteq.ifms")
public class IfmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(IfmsApplication.class, args);
    }
}