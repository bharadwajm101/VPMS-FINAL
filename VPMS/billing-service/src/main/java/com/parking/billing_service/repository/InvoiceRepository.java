package com.parking.billing_service.repository;
 
import com.parking.billing_service.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.List;
 
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    List<Invoice> findByUserId(Long userId);
    
    List<Invoice> findByReservationId(Long reservationId);
}
 