package com.transport.tms;

import com.transport.tms.model.Booking;
import com.transport.tms.model.BookingStatus;
import com.transport.tms.service.BookingService;
import com.transport.tms.service.VehicleService;
import com.transport.tms.service.DriverService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransportationApplicationTests {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private DriverService driverService;

    @Test
    void contextLoads() {
        assertNotNull(bookingService);
        assertNotNull(vehicleService);
        assertNotNull(driverService);
    }

    @Test
    void testInitialDataSeeded() {
        List<Booking> bookings = bookingService.getAllBookings();
        assertFalse(bookings.isEmpty(), "Initial bookings should be seeded");

        long availableVehicles = vehicleService.countAvailable();
        assertTrue(availableVehicles > 0, "There should be available vehicles");

        long availableDrivers = driverService.countAvailable();
        assertTrue(availableDrivers > 0, "There should be available drivers");
    }

    @Test
    void testCreateBookingAndLiveFare() {
        Booking newBooking = new Booking();
        newBooking.setCustomerName("Test Customer");
        newBooking.setCustomerEmail("test@example.com");
        newBooking.setPickupLocation("Pune Station");
        newBooking.setDropLocation("Mumbai Dadar");
        newBooking.setPickupDate(LocalDate.now().plusDays(2));
        newBooking.setCargoType("Books & Stationery");
        newBooking.setCargoWeightKg(150.0);
        newBooking.setDistanceKm(160.0);

        Booking saved = bookingService.createBooking(newBooking);

        assertNotNull(saved.getId());
        assertNotNull(saved.getTrackingNumber());
        assertEquals(BookingStatus.PENDING, saved.getStatus());
        assertTrue(saved.getEstimatedFare() > 0, "Fare should be calculated automatically");
    }
}
