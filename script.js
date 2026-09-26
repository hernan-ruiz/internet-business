const names = [
  "Ana Torres", "Luis Martínez", "Valentina Rojas", "Carlos Ramírez",
  "Juliana Pérez", "Andrés Gómez", "Laura Sánchez", "Miguel Castro",
  "Daniela Moreno", "Jorge Díaz", "Mariana Herrera", "Sebastián Ruiz",
  "Camila Vargas", "Felipe Medina", "Natalia Silva", "Diego Ortiz",
  "Paola Álvarez", "Ricardo López", "Sofía Morales", "Juan Cárdenas",
  "Mónica Rodríguez", "Kevin Arias", "Angie Mendoza", "Oscar Suárez",
  "Tatiana Fuentes", "David Quintero", "Lorena Pardo", "Mateo Salazar",
  "Carolina Gil", "Esteban León", "Diana Marín", "Santiago Acosta",
  "Sandra Rincón", "Alejandro Torres", "Viviana Cruz", "Mauricio Beltrán",
  "Andrea Parra", "Cristian Vega", "Paula Navarro", "Héctor Gutiérrez",
  "Eliana Ríos", "Wilson Jiménez", "Karen Lozano", "Nicolás Buitrago",
  "Adriana León", "Manuel Ospina", "Lina Restrepo", "Brayan Cardona",
  "Yulieth Castaño", "Germán Salas"
];

const days = [
  -18, -12, -7, -3, -1, 0, 1, 2, 3, 5,
  7, 9, 11, 15, 18, 22, 28, 34, 42, 50
];

function dateFromToday(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

const sampleClients = names.map((name, index) => ({
  id: index + 1,
  name,
  phone: `3${String(10 + index).padStart(2, "0")} ${String(
    1000000 + index * 731
  ).padStart(7, "0")}`,
  address: `Barrio ${
    ["La Esperanza", "San José", "El Centro", "Los Pinos", "La Floresta"][
      index % 5
    ]
  }, Calle ${10 + index}`,
  plan: ["30 Mbps", "50 Mbps", "100 Mbps", "200 Mbps", "300 Mbps"][index % 5],
  device: index % 2 ? "ONU ZTE F660" : "ONU Huawei EG8145V5",
  serial: `${index % 2 ? "ZTE" : "HW"}-${String(
    840000 + index * 193
  )}`,
  installation: dateFromToday(-360 + index * 5),
  cutoff: dateFromToday(days[index % days.length]),
  payment: {
    status: "pending",
    amount: "",
    method: "",
    date: ""
  }
}));

let clients =
  JSON.parse(localStorage.getItem("internetClients")) || sampleClients;

const rows = document.querySelector("#clientRows");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const paymentFilter = document.querySelector("#paymentFilter");

const dialog = document.querySelector("#clientDialog");
const form = document.querySelector("#clientForm");

const paymentDialog = document.querySelector("#paymentDialog");
const paymentForm = document.querySelector("#paymentForm");

const labels = {
  current: "Vigente",
  soon: "Próximo a vencer",
  overdue: "Vencido"
};

function getStatus(cutoff) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const cutDate = new Date(cutoff + "T00:00:00");

  const difference = Math.round(
    (cutDate - today) / 86400000
  );

  if (difference < 0) return "overdue";

  if (difference <= 5) return "soon";

  return "current";
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value + "T00:00:00"));
}

function formatMoney(value) {
  if (!value) return "—";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function saveClients() {
  localStorage.setItem(
    "internetClients",
    JSON.stringify(clients)
  );
}

function normalizeClient(client) {
  if (!client.payment) {
    client.payment = {
      status: "pending",
      amount: "",
      method: "",
      date: ""
    };
  }

  return client;
}

function renderClients() {
  clients = clients.map(normalizeClient);

  const search =
    searchInput.value.toLowerCase().trim();

  const selectedStatus =
    statusFilter.value;

  const selectedPayment =
    paymentFilter.value;

  const filtered = clients.filter(client => {
    const clientStatus =
      getStatus(client.cutoff);

    const paymentStatus =
      client.payment.status || "pending";

    const searchableText =
      `${client.name} ${client.phone} ${client.serial}`
        .toLowerCase();

    return (
      (selectedStatus === "all" ||
        selectedStatus === clientStatus) &&

      (selectedPayment === "all" ||
        selectedPayment === paymentStatus) &&

      searchableText.includes(search)
    );
  });

  rows.innerHTML = filtered.map(client => {
    const clientStatus =
      getStatus(client.cutoff);

    const payment =
      client.payment;

    const paid =
      payment.status === "paid";

    return `
      <tr class="row-${clientStatus}">

        <td>
          <span class="client-name">
            ${client.name}
          </span>

          <span class="client-address">
            ${client.phone} · ${client.address}
          </span>
        </td>

        <td>
          ${client.plan}
        </td>

        <td>
          ${client.device}
          <br>
          <code>${client.serial}</code>
        </td>

        <td>
          ${formatDate(client.installation)}
        </td>

        <td>
          ${formatDate(client.cutoff)}
        </td>

        <td>
          <span class="badge ${clientStatus}">
            ${labels[clientStatus]}
          </span>
        </td>

        <td>

          <span class="badge ${paid ? "paid" : "pending"}">
            ${paid ? "PAGADO" : "PENDIENTE"}
          </span>

          ${
            paid
              ? `
                <div class="payment-info">
                  ${formatMoney(payment.amount)}
                  · ${payment.method}
                  <br>
                  ${formatDate(payment.date)}
                </div>
              `
              : ""
          }

        </td>

        <td>

          <button
            class="action-button payment"
            data-payment="${client.id}"
          >
            ${paid ? "Editar pago" : "Registrar pago"}
          </button>

          ${
            paid
              ? `
                <button
                  class="action-button whatsapp"
                  data-whatsapp="${client.id}"
                >
                  📲 Confirmar
                </button>
              `
              : `
                <button
                  class="action-button reminder"
                  data-reminder="${client.id}"
                >
                  🔔 Recordar
                </button>
              `
          }

          <button
            class="edit"
            data-edit="${client.id}"
          >
            Editar
          </button>

        </td>

      </tr>
    `;
  }).join("");

  document.querySelector("#resultText").textContent =
    `Mostrando ${filtered.length} de ${clients.length} clientes`;

  document.querySelector("#totalCount").textContent =
    clients.length;

  ["current", "soon", "overdue"].forEach(status => {
    document.querySelector(`#${status}Count`).textContent =
      clients.filter(
        client =>
          getStatus(client.cutoff) === status
      ).length;
  });

  document.querySelector("#pendingPaymentCount").textContent =
    clients.filter(
      client =>
        client.payment.status !== "paid"
    ).length;
}

function openForm(client) {
  form.reset();

  document.querySelector("#formTitle").textContent =
    client
      ? "Editar cliente"
      : "Agregar cliente";

  document.querySelector("#editingId").value =
    client ? client.id : "";

  const fields = [
    "name",
    "phone",
    "address",
    "plan",
    "device",
    "serial",
    "installation",
    "cutoff"
  ];

  fields.forEach(field => {
    document.querySelector(`#${field}`).value =
      client ? client[field] : "";
  });

  dialog.showModal();
}

function openPaymentForm(client) {
  client = normalizeClient(client);

  document.querySelector("#paymentClientId").value =
    client.id;

  document.querySelector("#paymentClientName").textContent =
    client.name;

  document.querySelector("#paymentTitle").textContent =
    client.payment.status === "paid"
      ? "Editar pago"
      : "Registrar pago";

  document.querySelector("#paymentAmount").value =
    client.payment.amount || "";

  document.querySelector("#paymentMethod").value =
    client.payment.method || "Efectivo";

  document.querySelector("#paymentDate").value =
    client.payment.date || dateFromToday(0);

  paymentDialog.showModal();
}

document
  .querySelector("#addClient")
  .addEventListener("click", () => {
    openForm();
  });

document
  .querySelector("#closeDialog")
  .addEventListener("click", () => {
    dialog.close();
  });

document
  .querySelector("#cancelDialog")
  .addEventListener("click", () => {
    dialog.close();
  });

document
  .querySelector("#closePaymentDialog")
  .addEventListener("click", () => {
    paymentDialog.close();
  });

document
  .querySelector("#cancelPayment")
  .addEventListener("click", () => {
    paymentDialog.close();
  });

searchInput.addEventListener(
  "input",
  renderClients
);

statusFilter.addEventListener(
  "change",
  renderClients
);

paymentFilter.addEventListener(
  "change",
  renderClients
);

rows.addEventListener("click", event => {
  const editId =
    event.target.dataset.edit;

  const paymentId =
    event.target.dataset.payment;

  const whatsappId =
    event.target.dataset.whatsapp;

  const reminderId =
    event.target.dataset.reminder;

  if (editId) {
    const client =
      clients.find(
        item => item.id === Number(editId)
      );

    if (client) {
      openForm(client);
    }

    return;
  }

  if (paymentId) {
    const client =
      clients.find(
        item => item.id === Number(paymentId)
      );

    if (client) {
      openPaymentForm(client);
    }

    return;
  }

  if (whatsappId) {
    const client =
      clients.find(
        item => item.id === Number(whatsappId)
      );

    if (client) {
      sendPaymentConfirmation(client);
    }

    return;
  }

  if (reminderId) {
    const client =
      clients.find(
        item => item.id === Number(reminderId)
      );

    if (client) {
      sendPaymentReminder(client);
    }
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const editingId =
    Number(
      document.querySelector("#editingId").value
    );

  const record =
    Object.fromEntries(
      new FormData(form)
    );

  if (editingId) {
    const oldClient =
      clients.find(
        client => client.id === editingId
      );

    clients = clients.map(client =>
      client.id === editingId
        ? {
            ...record,
            id: editingId,
            payment:
              oldClient?.payment || {
                status: "pending",
                amount: "",
                method: "",
                date: ""
              }
          }
        : client
    );

  } else {

    clients.push({
      ...record,

      id: Date.now(),

      payment: {
        status: "pending",
        amount: "",
        method: "",
        date: ""
      }
    });
  }

  saveClients();

  dialog.close();

  renderClients();
});

paymentForm.addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const clientId =
      Number(
        document.querySelector("#paymentClientId").value
      );

    const amount =
      document.querySelector("#paymentAmount").value;

    const method =
      document.querySelector("#paymentMethod").value;

    const date =
      document.querySelector("#paymentDate").value;

    clients = clients.map(client => {

      if (client.id !== clientId) {
        return client;
      }

      return {
        ...client,

        payment: {
          status: "paid",
          amount,
          method,
          date
        }
      };
    });

    saveClients();

    paymentDialog.close();

    renderClients();
  }
);

function cleanPhone(phone) {
  let number =
    String(phone)
      .replace(/\D/g, "");

  if (
    number.length === 10 &&
    number.startsWith("3")
  ) {
    number = "57" + number;
  }

  return number;
}

function openWhatsApp(phone, message) {
  const number =
    cleanPhone(phone);

  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(
    url,
    "_blank"
  );
}

function sendPaymentConfirmation(client) {

  if (
    !client.payment ||
    client.payment.status !== "paid"
  ) {
    alert(
      "Este cliente todavía no tiene un pago registrado."
    );

    return;
  }

  const message =

`Hola ${client.name} 👋

Te confirmamos que hemos recibido tu pago del servicio de Internet.

💰 Valor: ${formatMoney(client.payment.amount)}
💳 Método de pago: ${client.payment.method}
📅 Fecha de pago: ${formatDate(client.payment.date)}
📡 Plan: ${client.plan}

¡Muchas gracias por tu pago! 😊

Internet Business`;

  openWhatsApp(
    client.phone,
    message
  );
}

function sendPaymentReminder(client) {

  const status =
    getStatus(client.cutoff);

  let message = "";

  if (status === "overdue") {

    message =

`Hola ${client.name} 👋

Te recordamos que tu pago del servicio de Internet se encuentra pendiente.

📅 Fecha de corte: ${formatDate(client.cutoff)}
📡 Plan: ${client.plan}

Agradecemos realizar el pago lo antes posible para mantener tu servicio activo.

Si ya realizaste el pago, por favor ignora este mensaje.

Internet Business`;

  } else {

    message =

`Hola ${client.name} 👋

Te recordamos que próximamente corresponde realizar el pago de tu servicio de Internet.

📅 Fecha de corte: ${formatDate(client.cutoff)}
📡 Plan: ${client.plan}

Agradecemos realizar tu pago oportunamente para mantener tu servicio activo.

¡Muchas gracias! 😊

Internet Business`;
  }

  openWhatsApp(
    client.phone,
    message
  );
}

clients = clients.map(normalizeClient);

saveClients();

renderClients();
