/**
 * TransLogix Transport & Logistics Management System (TMS)
 * Core Frontend Application Logic
 */

// Global State
let currentUser = {
    name: "Shaheed Sofi Patel",
    email: "shaheed@example.com",
    role: "CUSTOMER"
};

let allAdminBookings = [];
let allVehicles = [];
let allDrivers = [];

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    // Set default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById("pickupDate");
    if (dateInput) {
        dateInput.value = tomorrow.toISOString().split("T")[0];
        dateInput.min = new Date().toISOString().split("T")[0];
    }

    // Initialize Fare
    calculateLiveFare();

    // Load initial data
    updateUserDisplay();
    loadCustomerBookings();
    loadAdminData();
});

/* ========================================================
   VIEW NAVIGATION & USER SWITCHING
   ======================================================== */

function switchView(viewName) {
    document.querySelectorAll(".portal-view").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));

    const targetTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
    if (targetTab) targetTab.classList.add("active");

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add("active");

    if (viewName === "admin") {
        loadAdminData();
    } else {
        loadCustomerBookings();
    }
}

function switchAdminTab(subtabId) {
    document.querySelectorAll(".subnav-tab").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".subtab-content").forEach(el => el.classList.remove("active"));

    const targetBtn = document.querySelector(`.subnav-tab[data-subtab="${subtabId}"]`);
    if (targetBtn) targetBtn.classList.add("active");

    const targetContent = document.getElementById(`subtab-${subtabId}`);
    if (targetContent) targetContent.classList.add("active");
}

function updateUserDisplay() {
    const nameEl = document.getElementById("current-user-name");
    const roleEl = document.getElementById("current-user-role");
    if (nameEl && roleEl) {
        nameEl.innerText = currentUser.name;
        roleEl.innerText = currentUser.role;
        roleEl.className = "user-role-badge " + (currentUser.role === "ADMIN" ? "badge-confirmed" : "");
    }
}

function quickLogin(email, password) {
    fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Authentication failed");
        return res.json();
    })
    .then(user => {
        currentUser = user;
        updateUserDisplay();
        closeModal("modal-login");
        showToast(`Signed in as ${user.name} (${user.role})`, "success");

        if (user.role === "ADMIN") {
            switchView("admin");
        } else {
            switchView("customer");
            loadCustomerBookings();
        }
    })
    .catch(err => {
        showToast(err.message || "Failed to log in", "error");
    });
}

function handleRegisterUser(event) {
    event.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-password").value;

    fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: "CUSTOMER" })
    })
    .then(res => {
        if (!res.ok) return res.json().then(j => { throw new Error(j.message || "Registration error"); });
        return res.json();
    })
    .then(user => {
        currentUser = user;
        updateUserDisplay();
        closeModal("modal-login");
        showToast(`Welcome ${user.name}! Your account has been registered.`, "success");
        loadCustomerBookings();
    })
    .catch(err => showToast(err.message, "error"));
}

/* ========================================================
   CUSTOMER: LIVE FARE CALCULATION & BOOKINGS
   ======================================================== */

function calculateLiveFare() {
    const weight = parseFloat(document.getElementById("cargoWeightKg")?.value) || 0;
    const distance = parseFloat(document.getElementById("distanceKm")?.value) || 0;

    // Formula: ₹500 (Base) + (Distance * 25) + (Weight * 2)
    const totalFare = 500 + (distance * 25) + (weight * 2);
    const formatted = "₹" + totalFare.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const displayEl = document.getElementById("live-fare-display");
    if (displayEl) {
        displayEl.innerText = formatted;
    }
    return totalFare;
}

function handleCreateBooking(event) {
    event.preventDefault();

    const pickupLocation = document.getElementById("pickupLocation").value.trim();
    const dropLocation = document.getElementById("dropLocation").value.trim();
    const pickupDate = document.getElementById("pickupDate").value;
    const cargoType = document.getElementById("cargoType").value;
    const cargoWeightKg = parseFloat(document.getElementById("cargoWeightKg").value);
    const distanceKm = parseFloat(document.getElementById("distanceKm").value);
    const deliveryNotes = document.getElementById("deliveryNotes").value.trim();
    const estimatedFare = calculateLiveFare();

    const bookingPayload = {
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone || "+91 98230 11223",
        pickupLocation,
        dropLocation,
        pickupDate,
        cargoType,
        cargoWeightKg,
        distanceKm,
        estimatedFare,
        deliveryNotes
    };

    fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not process booking");
        return res.json();
    })
    .then(created => {
        showToast(`Booking Successful! Tracking ID: ${created.trackingNumber}`, "success");
        document.getElementById("booking-form").reset();
        calculateLiveFare();
        loadCustomerBookings();
        // Also trigger quick track to show confirmation immediately
        trackShipment(created.trackingNumber);
    })
    .catch(err => showToast(err.message, "error"));
}

function loadCustomerBookings() {
    const container = document.getElementById("customer-bookings-list");
    if (!container) return;

    container.innerHTML = `<div class="p-4 text-center text-muted"><i class="fa-solid fa-spinner fa-spin"></i> Loading bookings...</div>`;

    fetch(`/api/bookings?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(bookings => {
            if (!bookings || bookings.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2.5rem 1rem; color: #94a3b8;">
                        <i class="fa-solid fa-box-archive" style="font-size: 2.5rem; margin-bottom: 0.8rem; opacity: 0.5;"></i>
                        <p style="font-weight: 600; color: #475569;">No transport bookings yet.</p>
                        <p style="font-size: 0.85rem;">Use the booking form on the left to schedule your first consignment.</p>
                    </div>`;
                return;
            }

            container.innerHTML = bookings.map(b => `
                <div class="booking-item-card">
                    <div class="b-card-top">
                        <span class="b-track-no"><i class="fa-solid fa-hashtag"></i> ${b.trackingNumber}</span>
                        <span class="badge badge-${b.status.toLowerCase()}">${b.status.replace("_", " ")}</span>
                    </div>
                    <div class="b-route">
                        <span>${b.pickupLocation}</span>
                        <i class="fa-solid fa-arrow-right b-route-icon"></i>
                        <span>${b.dropLocation}</span>
                    </div>
                    <div class="b-meta-grid">
                        <div><i class="fa-solid fa-box text-muted"></i> ${b.cargoType} (${b.cargoWeightKg} kg)</div>
                        <div><i class="fa-solid fa-calendar-day text-muted"></i> ${b.pickupDate}</div>
                        <div><i class="fa-solid fa-truck text-muted"></i> ${b.assignedVehicle ? b.assignedVehicle.vehicleNumber : 'Vehicle Pending'}</div>
                        <div><i class="fa-solid fa-user-tie text-muted"></i> ${b.assignedDriver ? b.assignedDriver.name : 'Driver Pending'}</div>
                    </div>
                    <div class="b-actions">
                        <div class="b-fare">₹${b.estimatedFare ? b.estimatedFare.toLocaleString("en-IN") : '0'}</div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-outline-sm" onclick="trackShipment('${b.trackingNumber}')">
                                <i class="fa-solid fa-location-crosshairs"></i> Track
                            </button>
                            ${(b.status === 'PENDING' || b.status === 'CONFIRMED') ? `
                                <button class="btn btn-outline-sm" style="color: var(--danger);" onclick="cancelBooking(${b.id})">
                                    <i class="fa-solid fa-xmark"></i> Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join("");
        })
        .catch(err => {
            container.innerHTML = `<div class="p-3 text-danger">Failed to load bookings.</div>`;
        });
}

function cancelBooking(id) {
    if (!confirm("Are you sure you want to cancel this transport booking?")) return;

    fetch(`/api/bookings/${id}`, { method: "DELETE" })
        .then(res => {
            if (!res.ok) throw new Error("Could not cancel booking");
            return res.json();
        })
        .then(() => {
            showToast("Booking cancelled successfully", "warning");
            loadCustomerBookings();
            loadAdminData();
        })
        .catch(err => showToast(err.message, "error"));
}

/* ========================================================
   CONSIGNMENT TRACKING
   ======================================================== */

function handleQuickTrack(event) {
    event.preventDefault();
    const trackingNumber = document.getElementById("track-number-input").value.trim();
    if (!trackingNumber) return;
    trackShipment(trackingNumber);
}

function trackShipment(trackingNumber) {
    fetch(`/api/bookings/track/${encodeURIComponent(trackingNumber)}`)
        .then(res => {
            if (!res.ok) throw new Error("Consignment not found for tracking number: " + trackingNumber);
            return res.json();
        })
        .then(booking => {
            renderTrackingCard(booking);
        })
        .catch(err => {
            showToast(err.message, "error");
        });
}

function renderTrackingCard(b) {
    const card = document.getElementById("tracking-result-card");
    const trackIdResult = document.getElementById("track-id-result");
    const stepsContainer = document.getElementById("tracking-steps-container");
    const infoGrid = document.getElementById("tracking-info-grid");

    if (!card) return;

    trackIdResult.innerText = b.trackingNumber + ` [${b.status}]`;

    // Status mapping to progress stages
    const stages = [
        { key: "PENDING", label: "Booking Placed", sub: "Request logged" },
        { key: "CONFIRMED", label: "Confirmed", sub: "Vehicle & Driver Assigned" },
        { key: "IN_TRANSIT", label: "In Transit", sub: "Dispatched on Route" },
        { key: "DELIVERED", label: "Delivered", sub: "Successfully Delivered" }
    ];

    let currentStageIndex = 0;
    if (b.status === "CONFIRMED") currentStageIndex = 1;
    if (b.status === "IN_TRANSIT") currentStageIndex = 2;
    if (b.status === "DELIVERED") currentStageIndex = 3;
    if (b.status === "CANCELLED") currentStageIndex = -1;

    stepsContainer.innerHTML = stages.map((stage, idx) => {
        let stepClass = "";
        if (b.status === "CANCELLED") {
            stepClass = "cancelled";
        } else if (idx < currentStageIndex) {
            stepClass = "completed";
        } else if (idx === currentStageIndex) {
            stepClass = "active";
        }

        return `
            <div class="tracking-step ${stepClass}">
                <div class="step-circle">
                    ${idx < currentStageIndex ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
                </div>
                <div class="step-label">${stage.label}</div>
                <div class="step-subtext">${stage.sub}</div>
            </div>
        `;
    }).join("");

    infoGrid.innerHTML = `
        <div><strong>Origin:</strong> <div>${b.pickupLocation}</div></div>
        <div><strong>Destination:</strong> <div>${b.dropLocation}</div></div>
        <div><strong>Pickup Date:</strong> <div>${b.pickupDate}</div></div>
        <div><strong>Cargo Details:</strong> <div>${b.cargoType} (${b.cargoWeightKg} kg)</div></div>
        <div><strong>Assigned Vehicle:</strong> <div>${b.assignedVehicle ? b.assignedVehicle.vehicleNumber + ' (' + b.assignedVehicle.vehicleType + ')' : '<span class="text-muted">Awaiting Allocation</span>'}</div></div>
        <div><strong>Assigned Driver:</strong> <div>${b.assignedDriver ? b.assignedDriver.name + ' (' + b.assignedDriver.phone + ')' : '<span class="text-muted">Awaiting Allocation</span>'}</div></div>
    `;

    card.classList.remove("hidden");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeTrackingCard() {
    const card = document.getElementById("tracking-result-card");
    if (card) card.classList.add("hidden");
}

/* ========================================================
   ADMIN LOGISTICS PORTAL
   ======================================================== */

function loadAdminData() {
    // 1. Fetch Stats
    fetch("/api/dashboard/stats")
        .then(res => res.json())
        .then(stats => {
            document.getElementById("stat-total-bookings").innerText = stats.totalBookings || 0;
            document.getElementById("stat-active-deliveries").innerText = stats.activeDeliveries || 0;
            document.getElementById("stat-available-vehicles").innerText = stats.availableVehicles || 0;
            document.getElementById("stat-available-drivers").innerText = stats.availableDrivers || 0;
            const rev = stats.totalRevenue || 0;
            document.getElementById("stat-total-revenue").innerText = "₹" + rev.toLocaleString("en-IN", { maximumFractionDigits: 0 });
        })
        .catch(console.error);

    // 2. Fetch All Bookings
    fetch("/api/bookings")
        .then(res => res.json())
        .then(bookings => {
            allAdminBookings = bookings || [];
            renderAdminBookingsTable();
            renderDeliveryHistoryTable();
        })
        .catch(console.error);

    // 3. Fetch Vehicles
    fetch("/api/vehicles")
        .then(res => res.json())
        .then(vehicles => {
            allVehicles = vehicles || [];
            renderVehiclesTable();
        })
        .catch(console.error);

    // 4. Fetch Drivers
    fetch("/api/drivers")
        .then(res => res.json())
        .then(drivers => {
            allDrivers = drivers || [];
            renderDriversTable();
        })
        .catch(console.error);
}

function renderAdminBookingsTable() {
    const tbody = document.getElementById("admin-bookings-tbody");
    const filter = document.getElementById("filter-booking-status")?.value || "ALL";
    if (!tbody) return;

    let filtered = allAdminBookings;
    if (filter !== "ALL") {
        filtered = allAdminBookings.filter(b => b.status === filter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #94a3b8; padding: 2rem;">No bookings match this filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(b => `
        <tr>
            <td>
                <span class="font-bold text-primary" style="font-family: monospace;">${b.trackingNumber}</span>
                <div style="font-size: 0.72rem; color: #64748b;">${b.createdAt ? b.createdAt.substring(0, 10) : ''}</div>
            </td>
            <td>
                <div class="font-bold">${b.customerName}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${b.customerPhone || b.customerEmail}</div>
            </td>
            <td>
                <div style="font-weight: 600;">${b.pickupLocation}</div>
                <div style="font-size: 0.75rem; color: #3b82f6;">&darr; ${b.dropLocation}</div>
            </td>
            <td>
                <div>${b.cargoType}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${b.cargoWeightKg} kg &bull; ${b.distanceKm} km</div>
            </td>
            <td>
                ${b.assignedVehicle ? `
                    <span class="font-bold">${b.assignedVehicle.vehicleNumber}</span>
                    <div style="font-size: 0.72rem; color: #64748b;">${b.assignedVehicle.vehicleType}</div>
                ` : `<span style="color: #94a3b8; font-style: italic;">Not Assigned</span>`}
            </td>
            <td>
                ${b.assignedDriver ? `
                    <span class="font-bold">${b.assignedDriver.name}</span>
                    <div style="font-size: 0.72rem; color: #64748b;">${b.assignedDriver.phone}</div>
                ` : `<span style="color: #94a3b8; font-style: italic;">Not Assigned</span>`}
            </td>
            <td>
                <span class="font-bold">₹${b.estimatedFare ? b.estimatedFare.toLocaleString("en-IN") : '0'}</span>
            </td>
            <td>
                <span class="badge badge-${b.status.toLowerCase()}">${b.status.replace("_", " ")}</span>
            </td>
            <td>
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    <button class="btn btn-outline-sm" title="Assign Vehicle & Driver" onclick="openAssignModal(${b.id}, '${b.trackingNumber}')">
                        <i class="fa-solid fa-truck-ramp-box"></i> Assign
                    </button>
                    ${b.status === 'CONFIRMED' ? `
                        <button class="btn btn-outline-sm" title="Dispatch / Start Transit" onclick="updateBookingStatus(${b.id}, 'IN_TRANSIT')">
                            <i class="fa-solid fa-truck-fast text-primary"></i> Dispatch
                        </button>
                    ` : ''}
                    ${b.status === 'IN_TRANSIT' ? `
                        <button class="btn btn-outline-sm" title="Mark Delivered" onclick="updateBookingStatus(${b.id}, 'DELIVERED')">
                            <i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Deliver
                        </button>
                    ` : ''}
                    ${(b.status !== 'DELIVERED' && b.status !== 'CANCELLED') ? `
                        <button class="btn btn-outline-sm" title="Cancel Booking" onclick="updateBookingStatus(${b.id}, 'CANCELLED')">
                            <i class="fa-solid fa-ban text-danger"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join("");
}

function renderVehiclesTable() {
    const tbody = document.getElementById("admin-vehicles-tbody");
    if (!tbody) return;

    if (allVehicles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">No vehicles registered in fleet.</td></tr>`;
        return;
    }

    tbody.innerHTML = allVehicles.map(v => `
        <tr>
            <td><strong style="font-family: monospace;">${v.vehicleNumber}</strong></td>
            <td>${v.vehicleType}</td>
            <td>${v.capacityTons} Metric Tons</td>
            <td><span class="badge badge-${v.status.toLowerCase()}">${v.status.replace("_", " ")}</span></td>
            <td><span style="color: #64748b; font-size: 0.85rem;">${v.description || 'N/A'}</span></td>
            <td>
                <button class="btn btn-outline-sm text-danger" onclick="deleteVehicle(${v.id})">
                    <i class="fa-solid fa-trash-can"></i> Remove
                </button>
            </td>
        </tr>
    `).join("");
}

function renderDriversTable() {
    const tbody = document.getElementById("admin-drivers-tbody");
    if (!tbody) return;

    if (allDrivers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">No drivers registered.</td></tr>`;
        return;
    }

    tbody.innerHTML = allDrivers.map(d => `
        <tr>
            <td><strong>${d.name}</strong></td>
            <td><span style="font-family: monospace;">${d.licenseNumber}</span></td>
            <td>${d.phone}</td>
            <td>${d.experienceYears || 0} Years</td>
            <td><span class="badge badge-${d.status.toLowerCase()}">${d.status.replace("_", " ")}</span></td>
            <td>
                <button class="btn btn-outline-sm text-danger" onclick="deleteDriver(${d.id})">
                    <i class="fa-solid fa-trash-can"></i> Remove
                </button>
            </td>
        </tr>
    `).join("");
}

function renderDeliveryHistoryTable() {
    const tbody = document.getElementById("admin-history-tbody");
    if (!tbody) return;

    const completed = allAdminBookings.filter(b => b.status === 'DELIVERED' || b.status === 'CANCELLED');
    if (completed.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center p-3 text-muted">No closed delivery records yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = completed.map(b => `
        <tr>
            <td><strong class="font-bold text-primary" style="font-family: monospace;">${b.trackingNumber}</strong></td>
            <td>${b.customerName}</td>
            <td>${b.pickupLocation} &rarr; ${b.dropLocation}</td>
            <td>${b.assignedVehicle ? b.assignedVehicle.vehicleNumber : 'N/A'}</td>
            <td>${b.assignedDriver ? b.assignedDriver.name : 'N/A'}</td>
            <td><strong>₹${b.estimatedFare ? b.estimatedFare.toLocaleString("en-IN") : '0'}</strong></td>
            <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
            <td>${b.updatedAt ? b.updatedAt.substring(0, 10) : (b.pickupDate || 'Completed')}</td>
        </tr>
    `).join("");
}

/* ========================================================
   ADMIN MODALS & ACTIONS
   ======================================================== */

function openAssignModal(bookingId, trackingNumber) {
    document.getElementById("assign-booking-id").value = bookingId;
    document.getElementById("assign-tracking-label").innerText = trackingNumber;

    // Load available vehicles
    const vehSelect = document.getElementById("assign-vehicle-select");
    vehSelect.innerHTML = `<option value="">-- Choose Available Vehicle --</option>`;
    fetch("/api/vehicles/available")
        .then(res => res.json())
        .then(vehicles => {
            if (vehicles.length === 0) {
                vehSelect.innerHTML += `<option disabled>No vehicles currently available</option>`;
            } else {
                vehicles.forEach(v => {
                    vehSelect.innerHTML += `<option value="${v.id}">${v.vehicleNumber} - ${v.vehicleType} (${v.capacityTons} Ton)</option>`;
                });
            }
        });

    // Load available drivers
    const drvSelect = document.getElementById("assign-driver-select");
    drvSelect.innerHTML = `<option value="">-- Choose Available Driver --</option>`;
    fetch("/api/drivers/available")
        .then(res => res.json())
        .then(drivers => {
            if (drivers.length === 0) {
                drvSelect.innerHTML += `<option disabled>No drivers currently available</option>`;
            } else {
                drivers.forEach(d => {
                    drvSelect.innerHTML += `<option value="${d.id}">${d.name} (${d.phone}) - ${d.experienceYears}y exp</option>`;
                });
            }
        });

    openModal("modal-assign");
}

function submitAssignment() {
    const bookingId = document.getElementById("assign-booking-id").value;
    const vehicleId = document.getElementById("assign-vehicle-select").value;
    const driverId = document.getElementById("assign-driver-select").value;

    if (!vehicleId || !driverId) {
        showToast("Please select both a vehicle and a driver", "warning");
        return;
    }

    fetch(`/api/bookings/${bookingId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: Number(vehicleId), driverId: Number(driverId) })
    })
    .then(res => {
        if (!res.ok) throw new Error("Assignment failed");
        return res.json();
    })
    .then(() => {
        closeModal("modal-assign");
        showToast("Vehicle and Driver assigned successfully!", "success");
        loadAdminData();
    })
    .catch(err => showToast(err.message, "error"));
}

function updateBookingStatus(bookingId, status) {
    fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    })
    .then(res => {
        if (!res.ok) throw new Error("Status update failed");
        return res.json();
    })
    .then(() => {
        showToast(`Consignment updated to ${status.replace("_", " ")}`, "success");
        loadAdminData();
        loadCustomerBookings();
    })
    .catch(err => showToast(err.message, "error"));
}

function openAddVehicleModal() {
    document.getElementById("add-vehicle-form").reset();
    openModal("modal-add-vehicle");
}

function submitNewVehicle(event) {
    event.preventDefault();
    const vehicleNumber = document.getElementById("veh-plate").value.trim().toUpperCase();
    const vehicleType = document.getElementById("veh-type").value;
    const capacityTons = parseFloat(document.getElementById("veh-capacity").value);
    const description = document.getElementById("veh-desc").value.trim();

    fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, vehicleType, capacityTons, description, status: "AVAILABLE" })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not add vehicle");
        return res.json();
    })
    .then(() => {
        closeModal("modal-add-vehicle");
        showToast("Vehicle added to fleet successfully", "success");
        loadAdminData();
    })
    .catch(err => showToast(err.message, "error"));
}

function deleteVehicle(id) {
    if (!confirm("Are you sure you want to remove this vehicle from fleet?")) return;
    fetch(`/api/vehicles/${id}`, { method: "DELETE" })
        .then(() => {
            showToast("Vehicle removed from fleet", "info");
            loadAdminData();
        })
        .catch(err => showToast(err.message, "error"));
}

function openAddDriverModal() {
    document.getElementById("add-driver-form").reset();
    openModal("modal-add-driver");
}

function submitNewDriver(event) {
    event.preventDefault();
    const name = document.getElementById("drv-name").value.trim();
    const licenseNumber = document.getElementById("drv-license").value.trim().toUpperCase();
    const phone = document.getElementById("drv-phone").value.trim();
    const experienceYears = parseInt(document.getElementById("drv-exp").value) || 0;

    fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, licenseNumber, phone, experienceYears, status: "AVAILABLE" })
    })
    .then(res => {
        if (!res.ok) throw new Error("Could not add driver");
        return res.json();
    })
    .then(() => {
        closeModal("modal-add-driver");
        showToast("Driver added successfully", "success");
        loadAdminData();
    })
    .catch(err => showToast(err.message, "error"));
}

function deleteDriver(id) {
    if (!confirm("Are you sure you want to remove this driver?")) return;
    fetch(`/api/drivers/${id}`, { method: "DELETE" })
        .then(() => {
            showToast("Driver removed", "info");
            loadAdminData();
        })
        .catch(err => showToast(err.message, "error"));
}

/* ========================================================
   MODAL UTILITIES
   ======================================================== */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
}

function openLoginModal() {
    openModal("modal-login");
}

// Close modal when clicking outside dialog
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
    }
});

/* ========================================================
   TOAST NOTIFICATION SYSTEM
   ======================================================== */

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
