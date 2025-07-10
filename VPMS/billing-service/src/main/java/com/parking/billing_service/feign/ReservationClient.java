package com.parking.billing_service.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.parking.billing_service.dto.ReservationResponseDTO;
import java.util.List;


@FeignClient(name = "reservation-service")
public interface ReservationClient {

    @GetMapping("/api/reservations/{id}")
    ReservationResponseDTO getReservationById(@PathVariable Long id);
}
    