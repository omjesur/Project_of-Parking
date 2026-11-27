/* =====================================================
   SMARTPARK - SMART PARKING MANAGEMENT SYSTEM
===================================================== */


/* =====================================================
   PARKING DATA
===================================================== */

const totalParkingSlots = 12;

let parkingSlots =
    JSON.parse(
        localStorage.getItem("smartpark_slots")
    ) || [

        { id: 1, occupied: false },
        { id: 2, occupied: true },
        { id: 3, occupied: false },
        { id: 4, occupied: false },
        { id: 5, occupied: true },
        { id: 6, occupied: false },
        { id: 7, occupied: false },
        { id: 8, occupied: true },
        { id: 9, occupied: false },
        { id: 10, occupied: false },
        { id: 11, occupied: true },
        { id: 12, occupied: false }

    ];


/* =====================================================
   VARIABLES
===================================================== */

let selectedSlot = null;

let bookings =
    JSON.parse(
        localStorage.getItem("smartpark_bookings")
    ) || [];

let qrScanner = null;

let currentBooking = null;


/* =====================================================
   HTML ELEMENTS
===================================================== */

const parkingGrid =
    document.getElementById("parkingGrid");

const availableSlots =
    document.getElementById("availableSlots");

const occupiedSlots =
    document.getElementById("occupiedSlots");

const totalBookings =
    document.getElementById("totalBookings");

const selectedSlotText =
    document.getElementById("selectedSlot");

const parkingPrice =
    document.getElementById("parkingPrice");

const bookingForm =
    document.getElementById("bookingForm");

const historyBody =
    document.getElementById("historyBody");

const vehicleType =
    document.getElementById("vehicleType");

const paymentAmount =
    document.getElementById("paymentAmount");

const paymentStatus =
    document.getElementById("paymentStatus");

const bookingQRCode =
    document.getElementById("bookingQRCode");

const qrBookingText =
    document.getElementById("qrBookingText");

const scanResult =
    document.getElementById("scanResult");

const locationStatus =
    document.getElementById("locationStatus");


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        "smartpark_slots",
        JSON.stringify(parkingSlots)
    );

    localStorage.setItem(
        "smartpark_bookings",
        JSON.stringify(bookings)
    );

}


/* =====================================================
   DISPLAY PARKING SLOTS
===================================================== */

function displayParkingSlots() {

    parkingGrid.innerHTML = "";

    parkingSlots.forEach(function(slot) {

        const slotElement =
            document.createElement("div");

        slotElement.classList.add("slot");

        if (slot.occupied) {

            slotElement.classList.add("occupied");

            slotElement.innerHTML = `
                <div class="slot-number">
                    P${slot.id}
                </div>

                <div class="slot-status">
                    🔴 Occupied
                </div>
            `;

        }

        else {

            slotElement.innerHTML = `
                <div class="slot-number">
                    P${slot.id}
                </div>

                <div class="slot-status">
                    🟢 Available
                </div>
            `;

            slotElement.addEventListener(
                "click",
                function() {
                    selectParkingSlot(slot.id);
                }
            );

        }

        parkingGrid.appendChild(slotElement);

    });

    updateDashboard();

}


/* =====================================================
   SELECT PARKING SLOT
===================================================== */

function selectParkingSlot(slotId) {

    const slot =
        parkingSlots.find(function(item) {
            return item.id === slotId;
        });

    if (!slot || slot.occupied) {

        alert("This parking slot is occupied.");

        return;

    }

    selectedSlot = slotId;

    selectedSlotText.textContent =
        "Parking Slot P" + slotId;

    document.querySelectorAll(".slot").forEach(
        function(element) {

            element.classList.remove("selected");

            const number =
                element.querySelector(".slot-number");

            if (
                number &&
                number.textContent.trim() === "P" + slotId
            ) {

                element.classList.add("selected");

            }

        }
    );

    document
        .getElementById("booking")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const available =
        parkingSlots.filter(function(slot) {
            return !slot.occupied;
        }).length;

    const occupied =
        parkingSlots.filter(function(slot) {
            return slot.occupied;
        }).length;

    availableSlots.textContent = available;

    occupiedSlots.textContent = occupied;

    totalBookings.textContent = bookings.length;

    document.getElementById("totalSlots").textContent =
        totalParkingSlots;

}


/* =====================================================
   PRICE CALCULATION
===================================================== */

function calculatePrice() {

    const type = vehicleType.value;

    let price = 0;

    if (type === "Bike") {
        price = 20;
    }

    else if (type === "Car") {
        price = 40;
    }

    else if (type === "SUV") {
        price = 60;
    }

    parkingPrice.textContent = price;

    paymentAmount.textContent = price;

    return price;

}


/* =====================================================
   VEHICLE TYPE CHANGE
===================================================== */

vehicleType.addEventListener(
    "change",
    function() {

        calculatePrice();

    }
);


/* =====================================================
   BOOKING FORM
===================================================== */

bookingForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        if (selectedSlot === null) {

            alert(
                "Please select an available parking slot first."
            );

            return;

        }

        const vehicleNumber =
            document
                .getElementById("vehicleNumber")
                .value
                .trim()
                .toUpperCase();

        const type = vehicleType.value;

        const date =
            document.getElementById("bookingDate").value;

        const time =
            document.getElementById("bookingTime").value;


        /* VALIDATION */

        if (
            vehicleNumber === "" ||
            type === "" ||
            date === "" ||
            time === ""
        ) {

            alert("Please fill all the details.");

            return;

        }


        /* VEHICLE NUMBER VALIDATION */

        const vehiclePattern =
            /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{3,4}$/;

        if (!vehiclePattern.test(vehicleNumber)) {

            alert(
                "Please enter a valid vehicle number.\nExample: GJ01AB1234"
            );

            return;

        }


        /* CALCULATE PRICE */

        const price = calculatePrice();

        if (price === 0) {

            alert("Please select vehicle type.");

            return;

        }


        /* CHECK SLOT AGAIN */

        const slot =
            parkingSlots.find(function(item) {
                return item.id === selectedSlot;
            });

        if (!slot || slot.occupied) {

            alert(
                "Sorry! This slot is no longer available."
            );

            displayParkingSlots();

            return;

        }


        /* CREATE BOOKING ID */

        const bookingId =
            "SP" + Date.now();


        /* CREATE BOOKING */

        const booking = {

            id: bookingId,

            vehicle: vehicleNumber,

            type: type,

            slot: "P" + selectedSlot,

            date: date,

            time: time,

            price: price,

            status: "Pending Payment",

            createdAt: new Date().toISOString()

        };


        /* SAVE BOOKING */

        bookings.push(booking);


        /* OCCUPY SLOT */

        slot.occupied = true;


        /* SAVE DATA */

        saveData();


        /* CURRENT BOOKING */

        currentBooking = booking;


        /* GENERATE QR */

        generateBookingQR(booking);


        /* UPDATE PAYMENT */

        paymentAmount.textContent = price;

        paymentStatus.textContent =
            "⚠️ Payment pending";


        /* SUCCESS MESSAGE */

        alert(

            "Parking booked successfully!\n\n" +

            "Booking ID: " + bookingId +

            "\nVehicle: " + vehicleNumber +

            "\nSlot: P" + selectedSlot +

            "\nFee: ₹" + price +

            "\n\nPlease complete payment."

        );


        /* RESET SELECTION */

        selectedSlot = null;

        selectedSlotText.textContent =
            "No slot selected";

        bookingForm.reset();

        parkingPrice.textContent = "0";


        /* UPDATE SCREEN */

        displayParkingSlots();

        displayHistory();


        /* SCROLL TO PAYMENT */

        setTimeout(function() {

            document
                .getElementById("payment")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }, 500);

    }
);


/* =====================================================
   BOOKING HISTORY + SEARCH
===================================================== */

function displayHistory(searchText = "") {

    historyBody.innerHTML = "";

    const query =
        String(searchText).trim().toLowerCase();

    const filteredBookings =
        bookings
            .slice()
            .reverse()
            .filter(function(booking) {

                const searchable = [

                    booking.id,
                    booking.vehicle,
                    booking.type,
                    booking.slot,
                    booking.date,
                    booking.time,
                    booking.status

                ].join(" ").toLowerCase();

                return searchable.includes(query);

            });


    /* EMPTY HISTORY */

    if (filteredBookings.length === 0) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 8;

        cell.className = "empty-history";

        cell.textContent =
            bookings.length === 0
                ? "No bookings yet."
                : "No matching bookings found.";

        row.appendChild(cell);

        historyBody.appendChild(row);

        return;

    }


    /* DISPLAY BOOKINGS */

    filteredBookings.forEach(function(booking) {

        const row =
            document.createElement("tr");

        const values = [

            booking.vehicle,
            booking.type,
            booking.slot,
            booking.date,
            booking.time,
            "₹" + booking.price,
            booking.status

        ];

        values.forEach(function(value, index) {

            const cell =
                document.createElement("td");

            cell.textContent = String(value ?? "");

            if (index === 2) {

                const strong =
                    document.createElement("strong");

                strong.textContent =
                    String(value ?? "");

                cell.textContent = "";

                cell.appendChild(strong);

            }

            row.appendChild(cell);

        });


        /* DELETE BUTTON */

        const actionCell =
            document.createElement("td");

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "delete-history-btn";

        deleteButton.textContent = "Delete";

        deleteButton.setAttribute(
            "aria-label",
            "Delete booking " + String(booking.id)
        );

        deleteButton.addEventListener(
            "click",
            function() {

                deleteBooking(booking.id);

            }
        );

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        historyBody.appendChild(row);

    });

}


/* =====================================================
   DELETE ONE HISTORY RECORD
===================================================== */

function deleteBooking(bookingId) {

    const confirmed =
        confirm("Delete this booking from history?");

    if (!confirmed) {
        return;
    }

    bookings =
        bookings.filter(function(booking) {

            return String(booking.id) !==
                String(bookingId);

        });


    if (
        currentBooking &&
        String(currentBooking.id) === String(bookingId)
    ) {

        currentBooking =
            bookings.length
                ? bookings[bookings.length - 1]
                : null;

    }


    saveData();

    displayHistory(
        document.getElementById("historySearch").value
    );

    updateDashboard();

    restoreLatestBooking();


    if (!currentBooking) {

        bookingQRCode.innerHTML =
            "<p>No active booking</p>";

        qrBookingText.textContent =
            "No active booking";

        paymentAmount.textContent = "0";

        paymentStatus.textContent =
            "Payment not started";

    }

}


/* =====================================================
   CLEAR ALL HISTORY
===================================================== */

function clearHistory() {

    if (bookings.length === 0) {

        alert("There is no booking history to clear.");

        return;

    }

    const confirmed =
        confirm(
            "Clear all booking history? This cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    bookings = [];

    currentBooking = null;

    saveData();

    displayHistory();

    updateDashboard();

    bookingQRCode.innerHTML =
        "<p>QR will appear after booking.</p>";

    qrBookingText.textContent =
        "No active booking";

    paymentAmount.textContent = "0";

    paymentStatus.textContent =
        "Payment not started";

    document.getElementById("historySearch").value = "";

}


/* =====================================================
   EXPORT HISTORY AS CSV
===================================================== */

function exportHistory() {

    if (bookings.length === 0) {

        alert("No booking history available to export.");

        return;

    }

    const headers = [

        "Booking ID",
        "Vehicle",
        "Type",
        "Slot",
        "Date",
        "Time",
        "Fee",
        "Status"

    ];

    const rows =
        bookings.map(function(booking) {

            return [

                booking.id,
                booking.vehicle,
                booking.type,
                booking.slot,
                booking.date,
                booking.time,
                booking.price,
                booking.status

            ];

        });


    function escapeCSV(value) {

        return '"' +
            String(value ?? "").replace(/"/g, '""') +
            '"';

    }


    const csv =
        [headers, ...rows]
            .map(function(row) {

                return row.map(escapeCSV).join(",");

            })
            .join("\r\n");


    const blob =
        new Blob(
            ["\uFEFF" + csv],
            { type: "text/csv;charset=utf-8;" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "SmartPark-Booking-History.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}


/* =====================================================
   DARK / LIGHT THEME
===================================================== */

function toggleTheme() {

    const isDark =
        document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "smartpark_theme",
        isDark ? "dark" : "light"
    );

    updateThemeButton();

}


function updateThemeButton() {

    const button =
        document.getElementById("themeToggle");

    if (!button) {
        return;
    }

    const isDark =
        document.body.classList.contains("dark-mode");

    button.textContent =
        isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

}


function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem("smartpark_theme");

    document.body.classList.toggle(
        "dark-mode",
        savedTheme === "dark"
    );

    updateThemeButton();

}


/* =====================================================
   HISTORY SEARCH EVENT
===================================================== */

document
    .getElementById("historySearch")
    .addEventListener(
        "input",
        function(event) {

            displayHistory(event.target.value);

        }
    );


/* =====================================================
   GOOGLE MAPS
===================================================== */

function openLocation(place) {

    const googleMapsURL =

        "https://www.google.com/maps/search/?api=1&query=" +

        encodeURIComponent(place);

    window.open(
        googleMapsURL,
        "_blank"
    );

}


/* =====================================================
   CURRENT LOCATION
===================================================== */

function getCurrentLocation() {

    if (!navigator.geolocation) {

        locationStatus.textContent =
            "Geolocation is not supported by this browser.";

        return;

    }

    locationStatus.textContent =
        "Detecting your location...";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            locationStatus.textContent =
                "Location detected successfully!";

            const mapsURL =
                "https://www.google.com/maps?q=" +
                latitude + "," + longitude;

            window.open(
                mapsURL,
                "_blank"
            );

        },

        function(error) {

            locationStatus.textContent =
                "Unable to detect location. Please allow location permission.";

        }

    );

}


/* =====================================================
   PHONEPE / UPI PAYMENT
===================================================== */

function startPhonePePayment() {

    const amount =
        Number(paymentAmount.textContent);

    if (amount <= 0) {

        alert("Please make a parking booking first.");

        return;

    }


    if (!currentBooking) {

        if (bookings.length > 0) {

            currentBooking =
                bookings[bookings.length - 1];

        }

        else {

            alert(
                "Please make a parking booking first."
            );

            return;

        }

    }


    paymentStatus.textContent =
        "⏳ Creating UPI payment request...";


    /*
        DEMO UPI DETAILS

        Replace this demo UPI ID only
        with an authorized merchant UPI ID
        after proper payment gateway setup.
    */

    const merchantUPI =
        "yourmerchant@upi";

    const merchantName =
        "SmartPark";

    const transactionNote =
        "SmartPark Parking " +
        currentBooking.slot;


    const upiURL =

        "upi://pay?" +

        "pa=" +
        encodeURIComponent(merchantUPI) +

        "&pn=" +
        encodeURIComponent(merchantName) +

        "&am=" +
        encodeURIComponent(amount) +

        "&tn=" +
        encodeURIComponent(transactionNote) +

        "&cu=INR";


    paymentStatus.textContent =
        "📱 Opening UPI / PhonePe...";

    window.location.href = upiURL;


    /*
        IMPORTANT:

        This is only a UPI launch demo.
        It does not verify real payment.
    */

    setTimeout(function() {

        paymentStatus.textContent =
            "ℹ️ Payment opened. Verify payment through your real payment gateway.";

    }, 3000);

}


/* =====================================================
   QR SCANNER
===================================================== */

function startQRScanner() {

    if (typeof Html5Qrcode === "undefined") {

        scanResult.textContent =
            "❌ QR scanner library could not load. Check your internet connection.";

        return;

    }


    if (qrScanner !== null) {

        scanResult.textContent =
            "⚠️ Scanner is already running.";

        return;

    }


    scanResult.textContent =
        "📷 Starting camera...";


    qrScanner =
        new Html5Qrcode("qr-reader");


    qrScanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            }
        },


        function(decodedText) {


            /* QR FOUND */

            scanResult.textContent =
                "✅ QR Scanned Successfully!";


            /* SMARTPARK BOOKING QR */

            if (decodedText.includes("SMARTPARK")) {

                alert(
                    "SmartPark QR detected!\n\n" +
                    decodedText
                );

            }


            /* WEBSITE QR */

            else if (

                decodedText.startsWith("http://") ||

                decodedText.startsWith("https://")

            ) {

                window.open(
                    decodedText,
                    "_blank"
                );

            }


            stopQRScanner();

        },


        function(errorMessage) {

            /* Scanner continues */

        }

    )

    .catch(function(error) {

        scanResult.textContent =
            "❌ Camera could not start. Please allow camera permission.";

        qrScanner = null;

    });

}


/* =====================================================
   STOP QR SCANNER
===================================================== */

function stopQRScanner() {

    if (qrScanner === null) {
        return;
    }

    qrScanner
        .stop()
        .then(function() {

            qrScanner.clear();

            qrScanner = null;

        })
        .catch(function() {

            qrScanner = null;

        });

}


/* =====================================================
   GENERATE BOOKING QR
===================================================== */

function generateBookingQR(booking) {

    bookingQRCode.innerHTML = "";


    const bookingData =

        "SMARTPARK\n" +

        "Booking ID: " +
        booking.id +

        "\nVehicle: " +
        booking.vehicle +

        "\nType: " +
        booking.type +

        "\nSlot: " +
        booking.slot +

        "\nDate: " +
        booking.date +

        "\nTime: " +
        booking.time +

        "\nFee: ₹" +
        booking.price;


    new QRCode(

        bookingQRCode,

        {

            text: bookingData,

            width: 200,

            height: 200,

            correctLevel: QRCode.CorrectLevel.H

        }

    );


    qrBookingText.textContent =

        "🎫 " +

        booking.slot +

        " • " +

        booking.vehicle;

}


/* =====================================================
   DOWNLOAD BOOKING QR
===================================================== */

function downloadBookingQR() {

    const qrImage =
        bookingQRCode.querySelector("img");


    if (!qrImage) {

        alert(
            "Please complete a booking first."
        );

        return;

    }


    const link =
        document.createElement("a");

    link.href = qrImage.src;

    link.download =
        "SmartPark-Booking-QR.png";

    link.click();

}


/* =====================================================
   DATE SETUP
===================================================== */

const dateInput =
    document.getElementById("bookingDate");

const today =
    new Date().toISOString().split("T")[0];

dateInput.min = today;

dateInput.value = today;


/* =====================================================
   TIME SETUP
===================================================== */

const timeInput =
    document.getElementById("bookingTime");

const now = new Date();

let hours =
    String(now.getHours()).padStart(2, "0");

let minutes =
    String(now.getMinutes()).padStart(2, "0");

timeInput.value =
    hours + ":" + minutes;


/* =====================================================
   RESTORE LATEST BOOKING
===================================================== */

function restoreLatestBooking() {

    if (bookings.length === 0) {

        currentBooking = null;

        return;

    }

    currentBooking =
        bookings[bookings.length - 1];


    /* RESTORE QR */

    generateBookingQR(currentBooking);


    /* RESTORE PAYMENT AMOUNT */

    paymentAmount.textContent =
        currentBooking.price;


    /* RESTORE PAYMENT STATUS */

    if (currentBooking.status === "Paid") {

        paymentStatus.textContent =
            "✅ Payment completed";

    }

    else {

        paymentStatus.textContent =
            "⚠️ Payment pending";

    }

}


/* =====================================================
   RESET ALL DEMO DATA
===================================================== */

function resetSmartParkData() {

    const confirmReset =
        confirm(
            "Are you sure you want to reset all SmartPark demo data?"
        );

    if (!confirmReset) {
        return;
    }

    localStorage.removeItem("smartpark_slots");

    localStorage.removeItem("smartpark_bookings");

    localStorage.removeItem("smartpark_theme");

    location.reload();

}


/* =====================================================
   INITIALIZE
===================================================== */

loadSavedTheme();

displayParkingSlots();

displayHistory();

calculatePrice();

restoreLatestBooking();


/* =====================================================
   CONSOLE
===================================================== */

console.log(
    "SmartPark - Smart Parking Solution"
);

console.log(
    "Smart Parking System initialized successfully."
);
