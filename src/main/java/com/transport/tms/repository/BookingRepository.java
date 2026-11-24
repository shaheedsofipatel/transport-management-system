package com.transport.tms.repository;

import com.transport.tms.model.Booking;
import com.transport.tms.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByTrackingNumber(String trackingNumber);
    List<Booking> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.estimatedFare), 0.0) FROM Booking b WHERE b.status <> 'CANCELLED'")
    Double calculateTotalRevenue();
}
