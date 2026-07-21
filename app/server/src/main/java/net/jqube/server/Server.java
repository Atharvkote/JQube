package net.jqube.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

@SpringBootApplication
@EnableAutoConfiguration
public class Server {
	public static void main(String[] args) {
		SpringApplication.run(Server.class, args);
	}
}
