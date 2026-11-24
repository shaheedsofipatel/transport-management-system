package com.transport.tms.service;

import com.transport.tms.model.*;
import com.transport.tms.repository.BookingRepository;
import com.transport.tms.repository.DriverRepository;
import com.transport.tms.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public BookingService(BookingRepository bookingRepository,
                          VehicleRepository vehicleRepository,
                          DriverRepository driverRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getBookingsByEmail(String email) {
        return bookingRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Optional<Booking> getBookingByTrackingNumber(String trackingNumber) {
        return bookingRepository.findByTrackingNumber(trackingNumber);
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        // Generate a friendly tracking number
        int randomSuffix = 1000 + new Random().nextInt(9000);
        booking.setTrackingNumber("TMS-" + System.currentTimeMillis() % 100000 + "-" + randomSuffix);

        // Calculate estimated fare if missing
        if (booking.getEstimatedFare() == null || booking.getEstimatedFare() <= 0) {
            double distance = booking.getDistanceKm() != null ? booking.getDistanceKm() : 50.0;
            double weight = booking.getCargoWeightKg() != null ? booking.getCargoWeightKg() : 100.0;
            // Base fare: ₹500 + ₹25/km + ₹2/kg
            double calculatedFare = 500.0 + (distance * 25.0) + (weight * 2.0);
            booking.setEstimatedFare(Math.round(calculatedFare * 100.0) / 100.0);
        }

        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking assignVehicleAndDriver(Long bookingId, Long vehicleId, Long driverId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new IllegalArgumentException("Vehicle not found: " + vehicleId));
            vehicle.setStatus(VehicleStatus.IN_TRANSIT);
            vehicleRepository.save(vehicle);
            booking.setAssignedVehicle(vehicle);
        }

        if (driverId != null) {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new IllegalArgumentException("Driver not found: " + driverId));
            driver.setStatus(DriverStatus.ON_TRIP);
            driverRepository.save(driver);
            booking.setAssignedDriver(driver);
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        booking.setStatus(newStatus);
        booking.setUpdatedAt(LocalDateTime.now());

        // If completed or cancelled, free up the vehicle and driver
        if (newStatus == BookingStatus.DELIVERED || newStatus == BookingStatus.CANCELLED) {
            if (booking.getAssignedVehicle() != null) {
                Vehicle vehicle = booking.getAssignedVehicle();
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(vehicle);
            }
            if (booking.getAssignedDriver() != null) {
                Driver driver = booking.getAssignedDriver();
                driver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driver);
            }
        } else if (newStatus == BookingStatus.IN_TRANSIT) {
            if (booking.getAssignedVehicle() != null) {
                Vehicle v = booking.getAssignedVehicle();
                v.setStatus(VehicleStatus.IN_TRANSIT);
                vehicleRepository.save(v);
            }
            if (booking.getAssignedDriver() != null) {
                Driver d = booking.getAssignedDriver();
                d.setStatus(DriverStatus.ON_TRIP);
                driverRepository.save(d);
            }
        }

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        return updateStatus(bookingId, BookingStatus.CANCELLED);
    }

    public long countActiveBookings() {
        return bookingRepository.countByStatus(BookingStatus.IN_TRANSIT) +
               bookingRepository.countByStatus(BookingStatus.CONFIRMED);
    }

    public Double getTotalRevenue() {
        return bookingRepository.calculateTotalRevenue();
    }
}
