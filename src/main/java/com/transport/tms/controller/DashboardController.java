package com.transport.tms.controller;

import com.transport.tms.service.BookingService;
import com.transport.tms.service.DriverService;
import com.transport.tms.service.VehicleService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final BookingService bookingService;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    public DashboardController(BookingService bookingService,
                               VehicleService vehicleService,
                               DriverService driverService) {
        this.bookingService = bookingService;
        this.vehicleService = vehicleService;
        this.driverService = driverService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", bookingService.getAllBookings().size());
        stats.put("activeDeliveries", bookingService.countActiveBookings());
        stats.put("availableVehicles", vehicleService.countAvailable());
        stats.put("totalVehicles", vehicleService.getAllVehicles().size());
        stats.put("availableDrivers", driverService.countAvailable());
        stats.put("totalDrivers", driverService.getAllDrivers().size());
        stats.put("totalRevenue", bookingService.getTotalRevenue());
        return stats;
    }
}
