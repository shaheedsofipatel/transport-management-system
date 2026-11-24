package com.transport.tms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TransportationApplication {

    public static void main(String[] args) {
        SpringApplication.run(TransportationApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(">> Transport & Logistic Management System is running!");
        System.out.println(">> Web Application URL: http://localhost:8080");
        System.out.println(">> H2 Database Console: http://localhost:8080/h2-console");
        System.out.println("==================================================================");
    }
}
