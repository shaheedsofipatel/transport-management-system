package com.transport.tms.config;

import com.transport.tms.model.*;
import com.transport.tms.repository.BookingRepository;
import com.transport.tms.repository.DriverRepository;
import com.transport.tms.repository.UserRepository;
import com.transport.tms.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;

    public DataInitializer(UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           DriverRepository driverRepository,
                           BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Seed Users
        User admin = new User("Logistics Admin", "admin@translogistics.com", "+91 90000 11111", "ADMIN", "admin123");
        User customer1 = new User("Shaheed Sofi Patel", "shaheed@example.com", "+91 98230 11223", "CUSTOMER", "user123");
        User customer2 = new User("Sufiyan Ansari", "sufiyan@example.com", "+91 98230 44556", "CUSTOMER", "user123");
        userRepository.save(admin);
        userRepository.save(customer1);
        userRepository.save(customer2);

        // 2. Seed Vehicles
        Vehicle v1 = new Vehicle("MH-12-AB-1001", "Mini Truck (1-2 Ton)", 2.0, VehicleStatus.AVAILABLE, "Tata Intra V30 - City Cargo");
        Vehicle v2 = new Vehicle("MH-14-CD-2002", "Express Cargo Van (800 Kg)", 0.8, VehicleStatus.AVAILABLE, "Force Urbania Express");
        Vehicle v3 = new Vehicle("MH-12-EF-3003", "Heavy Cargo Truck (10 Ton)", 10.0, VehicleStatus.IN_TRANSIT, "Ashok Leyland 1618 - Interstate");
        Vehicle v4 = new Vehicle("MH-04-GH-4004", "Multi-Axle Container (25 Ton)", 25.0, VehicleStatus.AVAILABLE, "BharatBenz 2823C - Heavy Haulage");
        Vehicle v5 = new Vehicle("MH-12-JK-5005", "Flatbed Trailer (15 Ton)", 15.0, VehicleStatus.MAINTENANCE, "Mahindra Blazo X - Routine Service");
        vehicleRepository.save(v1);
        vehicleRepository.save(v2);
        vehicleRepository.save(v3);
        vehicleRepository.save(v4);
        vehicleRepository.save(v5);

        // 3. Seed Drivers
        Driver d1 = new Driver("Rahul Sharma", "DL-MH-2018-00123", "+91 98765 12345", 6, DriverStatus.AVAILABLE);
        Driver d2 = new Driver("Amit Verma", "DL-MH-2016-00456", "+91 98765 23456", 8, DriverStatus.ON_TRIP);
        Driver d3 = new Driver("Deepak Mane", "DL-MH-2020-00789", "+91 98765 34567", 4, DriverStatus.AVAILABLE);
        Driver d4 = new Driver("Vikram Shinde", "DL-MH-2015-00999", "+91 98765 45678", 10, DriverStatus.OFF_DUTY);
        driverRepository.save(d1);
        driverRepository.save(d2);
        driverRepository.save(d3);
        driverRepository.save(d4);

        // 4. Seed Bookings
        Booking b1 = new Booking();
        b1.setTrackingNumber("TMS-1001-PUNE");
        b1.setCustomerName("Shaheed Sofi Patel");
        b1.setCustomerEmail("shaheed@example.com");
        b1.setCustomerPhone("+91 98230 11223");
        b1.setPickupLocation("Pune Nagar Road Warehouse");
        b1.setDropLocation("Mumbai Nhava Sheva Port");
        b1.setPickupDate(LocalDate.now());
        b1.setCargoType("Industrial Machinery Parts");
        b1.setCargoWeightKg(1200.0);
        b1.setDistanceKm(155.0);
        b1.setEstimatedFare(4975.0);
        b1.setStatus(BookingStatus.IN_TRANSIT);
        b1.setAssignedVehicle(v3);
        b1.setAssignedDriver(d2);
        b1.setDeliveryNotes("Fragile equipment, keep upright.");
        b1.setCreatedAt(LocalDateTime.now().minusHours(3));
        bookingRepository.save(b1);

        Booking b2 = new Booking();
        b2.setTrackingNumber("TMS-1002-HAD");
        b2.setCustomerName("Sufiyan Ansari");
        b2.setCustomerEmail("sufiyan@example.com");
        b2.setCustomerPhone("+91 98230 44556");
        b2.setPickupLocation("Hadapsar Industrial Estate");
        b2.setDropLocation("Chakan Auto MIDC");
        b2.setPickupDate(LocalDate.now().plusDays(1));
        b2.setCargoType("Automotive Spare Parts");
        b2.setCargoWeightKg(450.0);
        b2.setDistanceKm(48.0);
        b2.setEstimatedFare(2100.0);
        b2.setStatus(BookingStatus.CONFIRMED);
        b2.setAssignedVehicle(v1);
        b2.setAssignedDriver(d1);
        b2.setDeliveryNotes("Scheduled morning delivery by 10 AM.");
        b2.setCreatedAt(LocalDateTime.now().minusHours(12));
        bookingRepository.save(b2);

        Booking b3 = new Booking();
        b3.setTrackingNumber("TMS-1003-SWAR");
        b3.setCustomerName("Shaheed Sofi Patel");
        b3.setCustomerEmail("shaheed@example.com");
        b3.setCustomerPhone("+91 98230 11223");
        b3.setPickupLocation("Swargate Commercial Complex");
        b3.setDropLocation("Kothrud Goods Depot");
        b3.setPickupDate(LocalDate.now().minusDays(2));
        b3.setCargoType("Furniture & Appliances");
        b3.setCargoWeightKg(320.0);
        b3.setDistanceKm(14.0);
        b3.setEstimatedFare(1490.0);
        b3.setStatus(BookingStatus.DELIVERED);
        b3.setAssignedVehicle(v1);
        b3.setAssignedDriver(d3);
        b3.setDeliveryNotes("Successfully delivered and signed.");
        b3.setCreatedAt(LocalDateTime.now().minusDays(2));
        bookingRepository.save(b3);

        Booking b4 = new Booking();
        b4.setTrackingNumber("TMS-1004-BHOS");
        b4.setCustomerName("Shaheed Sofi Patel");
        b4.setCustomerEmail("shaheed@example.com");
        b4.setCustomerPhone("+91 98230 11223");
        b4.setPickupLocation("Bhosari MIDC Sector 7");
        b4.setDropLocation("Nashik Ambad Industrial Area");
        b4.setPickupDate(LocalDate.now().plusDays(2));
        b4.setCargoType("Consumer Electronics Boxes");
        b4.setCargoWeightKg(750.0);
        b4.setDistanceKm(205.0);
        b4.setEstimatedFare(6625.0);
        b4.setStatus(BookingStatus.PENDING);
        b4.setDeliveryNotes("Awaiting vehicle assignment and dispatch confirmation.");
        b4.setCreatedAt(LocalDateTime.now().minusMinutes(45));
        bookingRepository.save(b4);
    }
}
