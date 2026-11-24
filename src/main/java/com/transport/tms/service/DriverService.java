package com.transport.tms.service;

import com.transport.tms.model.Driver;
import com.transport.tms.model.DriverStatus;
import com.transport.tms.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.AVAILABLE);
    }

    public Optional<Driver> getDriverById(Long id) {
        return driverRepository.findById(id);
    }

    public Driver saveDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Long id, Driver updated) {
        return driverRepository.findById(id).map(d -> {
            d.setName(updated.getName());
            d.setLicenseNumber(updated.getLicenseNumber());
            d.setPhone(updated.getPhone());
            d.setExperienceYears(updated.getExperienceYears());
            d.setStatus(updated.getStatus());
            return driverRepository.save(d);
        }).orElseThrow(() -> new IllegalArgumentException("Driver not found with ID: " + id));
    }

    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }

    public long countAvailable() {
        return driverRepository.countByStatus(DriverStatus.AVAILABLE);
    }
}
