package com.transport.tms.service;

import com.transport.tms.model.Vehicle;
import com.transport.tms.model.VehicleStatus;
import com.transport.tms.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public List<Vehicle> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE);
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updated) {
        return vehicleRepository.findById(id).map(v -> {
            v.setVehicleNumber(updated.getVehicleNumber());
            v.setVehicleType(updated.getVehicleType());
            v.setCapacityTons(updated.getCapacityTons());
            v.setStatus(updated.getStatus());
            v.setDescription(updated.getDescription());
            return vehicleRepository.save(v);
        }).orElseThrow(() -> new IllegalArgumentException("Vehicle not found with ID: " + id));
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public long countAvailable() {
        return vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
    }
}
