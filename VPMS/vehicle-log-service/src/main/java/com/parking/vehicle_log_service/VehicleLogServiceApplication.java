package com.parking.vehicle_log_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.parking.vehicle_log_service.feign")
public class VehicleLogServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(VehicleLogServiceApplication.class, args);
	}

}
