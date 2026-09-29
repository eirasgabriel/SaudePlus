package br.com.saudeplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SaudePlusApplication {

	public static void main(String[] args) {
		SpringApplication.run(SaudePlusApplication.class, args);
	}

}
