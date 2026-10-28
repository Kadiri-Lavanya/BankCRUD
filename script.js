
const form = document.getElementById("bankForm");
const customerTable = document.getElementById("customerTable");
const searchInput = document.getElementById("search");
const emptyMessage = document.getElementById("emptyMessage");
const recordCount = document.getElementById("recordCount");

let customers = JSON.parse(
    localStorage.getItem("bankCustomers") || "[]"
);

let nextId = customers.reduce(
    (max, customer) => Math.max(max, customer.id), 0
) + 1;

// Save customers in browser storage
function saveData() {
    localStorage.setItem(
        "bankCustomers",
        JSON.stringify(customers)
    );
}

// Display customer records
function displayCustomers(query = "") {
    customerTable.innerHTML = "";

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.account.toLowerCase().includes(query.toLowerCase())
    );

    filteredCustomers.forEach(customer => {
        const row = document.createElement("tr");

        const values = [
            customer.id,
            customer.name,
            customer.account,
            customer.email,
            "₹" + Number(customer.balance).toFixed(2),
            customer.phone
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.type = "button";
        editButton.addEventListener("click", () => {
            editCustomer(customer.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            deleteCustomer(customer.id);
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        customerTable.appendChild(row);
    });

    emptyMessage.hidden = filteredCustomers.length !== 0;
    recordCount.textContent =
        `Total customers: ${customers.length}`;
}

// CREATE and UPDATE customer
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const editId = document.getElementById("editId").value;

    const customer = {
        name: document.getElementById("name").value.trim(),
        account: document.getElementById("account").value.trim(),
        email: document.getElementById("email").value.trim(),
        balance: document.getElementById("balance").value,
        phone: document.getElementById("phone").value.trim()
    };

    if (
        !customer.name ||
        !customer.account ||
        !customer.email ||
        !customer.phone ||
        !Number.isFinite(Number(customer.balance)) ||
        Number(customer.balance) < 0
    ) {
        alert("Please enter valid customer details.");
        return;
    }

    // Account number must be unique
    const duplicate = customers.some(item =>
        item.account.toLowerCase() === customer.account.toLowerCase() &&
        item.id !== Number(editId)
    );

    if (duplicate) {
        alert("This account number already exists!");
        return;
    }

    if (editId) {
        // UPDATE
        const index = customers.findIndex(
            item => item.id === Number(editId)
        );

        if (index !== -1) {
            customers[index] = {
                ...customers[index],
                ...customer
            };

            alert("Customer updated successfully!");
        }
    } else {
        // CREATE
        customers.push({
            id: nextId++,
            ...customer
        });

        alert("Customer added successfully!");
    }

    saveData();
    displayCustomers(searchInput.value);
    resetForm();
});

// Load customer details for editing
function editCustomer(id) {
    const customer = customers.find(item => item.id === id);

    if (!customer) return;

    document.getElementById("editId").value = customer.id;
    document.getElementById("name").value = customer.name;
    document.getElementById("account").value = customer.account;
    document.getElementById("email").value = customer.email;
    document.getElementById("balance").value = customer.balance;
    document.getElementById("phone").value = customer.phone;

    document.getElementById("formTitle").textContent =
        "Update Customer";

    document.getElementById("submitBtn").textContent =
        "Update Customer";

    document.getElementById("cancelBtn").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// DELETE customer
function deleteCustomer(id) {
    const customer = customers.find(item => item.id === id);

    if (!customer) return;

    if (confirm(
        `Delete customer "${customer.name}"?`
    )) {
        customers = customers.filter(item => item.id !== id);

        saveData();
        displayCustomers(searchInput.value);
        resetForm();

        alert("Customer deleted successfully!");
    }
}

// Reset the form
function resetForm() {
    form.reset();
    document.getElementById("editId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Customer";

    document.getElementById("submitBtn").textContent =
        "Add Customer";

    document.getElementById("cancelBtn").hidden = true;
}

// Cancel editing
document.getElementById("cancelBtn").addEventListener(
    "click", resetForm
);

// Search customers
searchInput.addEventListener("input", function() {
    displayCustomers(this.value.trim());
});

// Initial display
displayCustomers();
