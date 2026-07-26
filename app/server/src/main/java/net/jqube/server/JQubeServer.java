package net.jqube.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@EnableAutoConfiguration
@ConfigurationPropertiesScan
public class JQubeServer {
	public static void main(String[] args) {
		SpringApplication.run(JQubeServer.class, args);
	}
}
