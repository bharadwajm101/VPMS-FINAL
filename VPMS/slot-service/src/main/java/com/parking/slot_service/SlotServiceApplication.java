package com.parking.slot_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.parking.slot_service.feign")
public class SlotServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SlotServiceApplication.class, args);
	}

}
