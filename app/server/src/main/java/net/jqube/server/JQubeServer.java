package net.jqube.server;

import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@EnableScheduling
@SpringBootApplication
@ConfigurationPropertiesScan
public class JQubeServer {
    public static void main(String[] args) {
        SpringApplication.run(JQubeServer.class, args);
    }
}