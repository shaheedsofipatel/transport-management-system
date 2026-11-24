# 🚛 Transport & Logistic Management System (TMS)

> **College & Internship Presentation Project**  
> **Course:** Capgemini Java Full-Stack Training  
> **Student:** Shaheed Sofi Patel  
> **Mentor:** Pratik Patil  
> **Tech Stack:** Java 21 LTS, Spring Boot 3, Spring Data JPA, Embedded H2 Database (MySQL compatible), Responsive Logistics Web UI

---

## 📌 1. Project Overview & Problem Statement

### **Problem**
Transport and logistics businesses struggle with disconnected manual systems: managing transport bookings, vehicle availability tracking, assigning qualified drivers, and monitoring consignment statuses in real time.

### **Solution**
A full-stack web application designed with **layered architecture** that simplifies transport operations:
1. **Customer Portal:** Allows clients/customers to register, calculate estimated fares dynamically, book transportation consignments, and live-track delivery statuses.
2. **Admin Logistics Portal:** A centralized dashboard where fleet managers track vehicle availability, manage drivers, approve bookings, assign vehicles & drivers, and maintain delivery audit history.

---

## 🏗️ 2. Architectural Design & Workflow

```
[ Customer Portal / Admin Dashboard ] (Modern Responsive HTML5 + CSS3 + Vanilla ES6 JS)
                    │
                    ▼ REST API Requests (JSON)
[ Spring Boot 3 Controllers ] (REST Endpoints: /api/bookings, /api/vehicles, /api/drivers, /api/auth)
                    │
                    ▼
[ Service & Business Layer ] (Fare calculation, Vehicle & Driver availability validation, State transitions)
                    │
                    ▼
[ Spring Data JPA Repositories ] (CRUD Operations & Custom Queries)
                    │
                    ▼
[ Embedded H2 Database / MySQL ] (In-memory zero-setup persistence with seed data)
```

---

## 🚀 3. Core Features & Capabilities

### **A. Customer Management & Portal**
- **Customer Authentication & Quick Switch:** Easily switch between pre-seeded demo accounts (Shaheed Patel, Sufiyan Ansari, Logistics Admin) or register a new customer profile.
- **Dynamic Transport Booking:**
  - Pickup & Drop-off locations
  - Pickup Date selector
  - Goods / Cargo type selector (Industrial Machinery, Automotive Parts, Electronics, Furniture, etc.)
  - Weight in Kg & Approximate Distance in Km
  - **Live Dynamic Fare Calculator:** Automatically calculates estimated rate with transparent formula (`Base ₹500 + ₹25/km + ₹2/kg`).
- **Consignment Tracking (Live Status Timeline):**
  - Enter tracking number (e.g., `TMS-1001-PUNE`) to see interactive visual progress:
    `[1. Booked & Submitted] ➔ [2. Confirmed & Assigned] ➔ [3. In Transit on Road] ➔ [4. Successfully Delivered]`
- **My Bookings History:** Stream of previous and active bookings with status badges and instant cancellation option.

### **B. Admin Logistics Portal**
- **Real-Time KPI Metric Cards:**
  - Total Bookings
  - Active Deliveries in Transit
  - Available Fleet Vehicles
  - Available Drivers
  - Total Revenue Generated
- **Bookings Management & Allocation:**
  - View all customer orders with status filter.
  - One-click **Vehicle & Driver Assignment Modal** (only shows currently *AVAILABLE* vehicles and drivers).
  - Status updates (`Confirm`, `Dispatch / In Transit`, `Mark Delivered`, `Cancel`).
- **Vehicle Fleet Management:**
  - List of fleet vehicles with plate number, type, capacity (metric tons), and status (`AVAILABLE`, `IN_TRANSIT`, `MAINTENANCE`).
  - Add new fleet vehicles or remove outdated vehicles.
  - Automatic status transitions (marking a consignment as *In Transit* automatically marks the assigned vehicle as *IN_TRANSIT*; *Delivered* or *Cancelled* automatically restores vehicle availability).
- **Driver Management:**
  - Roster of commercial drivers with license number, contact phone, experience years, and status (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`).
  - Add new drivers or remove inactive drivers.
- **Delivery Audit & History:**
  - Log of completed trips with revenue, vehicle, driver, and completion timestamps.

---

## 🗄️ 4. Data Models & Entity Relationships

- **User:** `id`, `name`, `email`, `phone`, `role` (`CUSTOMER` / `ADMIN`), `password`
- **Vehicle:** `id`, `vehicleNumber`, `vehicleType`, `capacityTons`, `status` (`AVAILABLE`, `IN_TRANSIT`, `MAINTENANCE`), `description`
- **Driver:** `id`, `name`, `licenseNumber`, `phone`, `experienceYears`, `status` (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`)
- **Booking:** `id`, `trackingNumber`, `customerName`, `customerEmail`, `customerPhone`, `pickupLocation`, `dropLocation`, `pickupDate`, `cargoType`, `cargoWeightKg`, `distanceKm`, `estimatedFare`, `status` (`PENDING`, `CONFIRMED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`), `assignedVehicle` (ManyToOne), `assignedDriver` (ManyToOne), `deliveryNotes`, `createdAt`, `updatedAt`

---

## ⚡ 5. How to Run the Application

### **Option 1: Double-Click Batch File (Windows)**
Simply double click:
```
run.bat
```

### **Option 2: Using the Maven Wrapper (Command Line)**
```powershell
.\mvnw.cmd spring-boot:run
```

Once started:
- Open your browser to: **http://localhost:8080**
- Access H2 Database Console: **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:transportdb`, User: `sa`, Password: blank)

---

## 🔑 6. Pre-Seeded Demo Accounts

The application automatically seeds realistic data on first launch:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Logistics Admin | `admin@translogistics.com` | `admin123` |
| **Customer** | Shaheed Sofi Patel | `shaheed@example.com` | `user123` |
| **Customer** | Sufiyan Ansari | `sufiyan@example.com` | `user123` |

---

## 🌐 7. REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return role profile |
| `POST` | `/api/auth/register` | Register new customer account |
| `GET` | `/api/dashboard/stats` | Retrieve KPI counters & total revenue |
| `GET` | `/api/bookings` | List all bookings (optional `?email=` filter) |
| `GET` | `/api/bookings/track/{trackingNumber}` | Track consignment by tracking code |
| `POST` | `/api/bookings` | Create new transport booking |
| `PUT` | `/api/bookings/{id}/assign` | Assign vehicle and driver to booking |
| `PUT` | `/api/bookings/{id}/status` | Update booking status (`CONFIRMED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`) |
| `DELETE` | `/api/bookings/{id}` | Cancel transport booking |
| `GET` | `/api/vehicles` | List all fleet vehicles |
| `GET` | `/api/vehicles/available` | List only available vehicles for assignment |
| `POST` | `/api/vehicles` | Add new vehicle to fleet |
| `DELETE` | `/api/vehicles/{id}` | Remove vehicle from fleet |
| `GET` | `/api/drivers` | List all registered drivers |
| `GET` | `/api/drivers/available` | List only available drivers for assignment |
| `POST` | `/api/drivers` | Register new driver |
| `DELETE` | `/api/drivers/{id}` | Remove driver record |
