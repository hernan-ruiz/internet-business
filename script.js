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

const days = [-18, -12, -7, -3, -1, 0, 1, 2, 3, 5, 7, 9, 11, 15, 18, 22, 28, 34, 42, 50];

function dateFromToday(daysToAdd) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

const sampleClients = names.map((name, index) => ({
  id: index + 1,
  name,
  phone: `3${String(10 + index).padStart(2, "0")} ${String(1000000 + index * 731).padStart(7, "0")}`,
  address: `Barrio ${["La Esperanza", "San José", "El Centro", "Los Pinos", "La Floresta"][index % 5]}, Calle ${10 + index}`,
  plan: ["30 Mbps", "50 Mbps", "100 Mbps", "200 Mbps", "300 Mbps"][index % 5],
  device: index % 2 ? "ONU ZTE F660" : "ONU Huawei EG8145V5",
  serial: `${index % 2 ? "ZTE" : "HW"}-${String(840000 + index * 193)}`,
  installation: dateFromToday(-360 + index * 5),
  cutoff: dateFromToday(days[index % days.length])
}));

let clients = JSON.parse(localStorage.getItem("internetClients")) || sampleClients;

const rows = document.querySelector("#clientRows");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const dialog = document.querySelector("#clientDialog");
const form = document.querySelector("#clientForm");

const labels = {
  current: "Vigente",
  soon: "Próximo a vencer",
  overdue: "Vencido"
};

function getStatus(cutoff) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutDate = new Date(cutoff + "T00:00:00");
  const difference = Math.round((cutDate - today) / 86400000);

  if (difference < 0) return "overdue";
  if (difference <= 5) return "soon";
  return "current";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value + "T00:00:00"));
}

function saveClients() {
  localStorage.setItem("internetClients", JSON.stringify(clients));
}

function renderClients() {
  const search = searchInput.value.toLowerCase().trim();
  const selectedStatus = statusFilter.value;

  const filtered = clients.filter(client => {
    const clientStatus = getStatus(client.cutoff);
    const searchableText = `${client.name} ${client.phone} ${client.serial}`.toLowerCase();

    return (
      (selectedStatus === "all" || selectedStatus === clientStatus) &&
      searchableText.includes(search)
    );
  });

  rows.innerHTML = filtered.map(client => {
    const clientStatus = getStatus(client.cutoff);

    return `
      <tr class="row-${clientStatus}">
        <td>
          <span class="client-name">${client.name}</span>
          <span class="client-address">${client.phone} · ${client.address}</span>
        </td>
        <td>${client.plan}</td>
        <td>${client.device}<br><code>${client.serial}</code></td>
        <td>${formatDate(client.installation)}</td>
        <td>${formatDate(client.cutoff)}</td>
        <td><span class="badge ${clientStatus}">${labels[clientStatus]}</span></td>
        <td><button class="edit" data-edit="${client.id}">Editar</button></td>
      </tr>
    `;
  }).join("");

  document.querySelector("#resultText").textContent =
    `Mostrando ${filtered.length} de ${clients.length} clientes`;

  document.querySelector("#totalCount").textContent = clients.length;

  ["current", "soon", "overdue"].forEach(status => {
    document.querySelector(`#${status}Count`).textContent =
      clients.filter(client => getStatus(client.cutoff) === status).length;
  });
}

function openForm(client) {
  form.reset();

  document.querySelector("#formTitle").textContent =
    client ? "Editar cliente" : "Agregar cliente";

  document.querySelector("#editingId").value = client ? client.id : "";

  const fields = [
    "name", "phone", "address", "plan",
    "device", "serial", "installation", "cutoff"
  ];

  fields.forEach(field => {
    document.querySelector(`#${field}`).value = client ? client[field] : "";
  });

  dialog.showModal();
}

document.querySelector("#addClient").addEventListener("click", () => {
  openForm();
});

document.querySelector("#closeDialog").addEventListener("click", () => {
  dialog.close();
});

document.querySelector("#cancelDialog").addEventListener("click", () => {
  dialog.close();
});

searchInput.addEventListener("input", renderClients);
statusFilter.addEventListener("change", renderClients);

rows.addEventListener("click", event => {
  const id = event.target.dataset.edit;

  if (id) {
    const client = clients.find(item => item.id === Number(id));
    openForm(client);
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();

  const editingId = Number(document.querySelector("#editingId").value);
  const record = Object.fromEntries(new FormData(form));

  if (editingId) {
    clients = clients.map(client =>
      client.id === editingId ? { ...record, id: editingId } : client
    );
  } else {
    clients.push({ ...record, id: Date.now() });
  }

  saveClients();
  dialog.close();
  renderClients();
});

renderClients();