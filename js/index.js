// DOM Elements
const diaSemana = document.getElementById("dia-semana");
const dataAtual = document.getElementById("data-atual");
const horaAtual = document.getElementById("hora-atual");
const btnRegistrarPonto = document.getElementById("btn-registrar-ponto");
const dialogPonto = document.getElementById("dialog-ponto");
const dialogData = document.getElementById("dialog-data");
const dialogHora = document.getElementById("dialog-hora");
const selectRegisterType = document.getElementById("register-type");
const btnDialogRegister = document.getElementById("btn-dialog-register");
const btnDialogFechar = document.getElementById("dialog-fechar");
const alertaSucesso = document.getElementById("alerta-ponto-registrado");
const pontosRegistrados = document.getElementById("lista-pontos-registrados");

// Initialize Display
diaSemana.textContent = getWeekDay();
dataAtual.textContent = getCurrentDate();
dialogData.textContent = `Data: ${getCurrentDate()}`;

// Event Listeners
btnRegistrarPonto.addEventListener("click", register);
btnDialogRegister.addEventListener("click", handleRegister);
btnDialogFechar.addEventListener("click", () => dialogPonto.close());

// Utility Functions
function updateContentHour() {
  horaAtual.textContent = getCurrentTime();
}

function getCurrentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function getCurrentDate() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function getWeekDay() {
  const daynames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  return daynames[new Date().getDay()];
}

// Register Handling
function setRegisterType() {
  const lastType = localStorage.getItem("lastRegisterType") || "entrada";
  const nextTypeMap = {
    "entrada": "intervalo",
    "intervalo": "volta-intervalo",
    "volta-intervalo": "saida",
    "saida": "entrada"
  };
  selectRegisterType.value = nextTypeMap[lastType];
}

async function handleRegister() {
  const register = await createRegister(selectRegisterType.value);
  saveRegisterLocalStorage(register);
  localStorage.setItem("lastRegister", JSON.stringify(register));

  showSuccessAlert();
  dialogPonto.close();
}

function showSuccessAlert() {
  alertaSucesso.classList.remove("hidden");
  alertaSucesso.classList.add("show");
  setTimeout(() => {
    alertaSucesso.classList.replace("show", "hidden");
  }, 5000);
}

async function createRegister(registerType) {
  const location = await getUserLocation();
  return {
    date: getCurrentDate(),
    time: getCurrentTime(),
    location,
    id: 1,
    type: registerType,
  };
}

function register() {
  const lastRegister = JSON.parse(localStorage.getItem("lastRegister"));
  const dialogUltimoRegistro = document.getElementById("dialog-ultimo-registro");

  if (lastRegister) {
    dialogUltimoRegistro.textContent = `Último Registro: ${lastRegister.date} | ${lastRegister.time} | ${lastRegister.type}`;
  }

  dialogHora.textContent = `Hora: ${getCurrentTime()}`;
  setInterval(() => {
    dialogHora.textContent = `Hora: ${getCurrentTime()}`;
  }, 1000);

  dialogPonto.showModal();
}

// LocalStorage Handling
function saveRegisterLocalStorage(register) {
  const registers = getRegisterLocalStorage("register");
  registers.push(register);
  localStorage.setItem("register", JSON.stringify(registers));
}

function getRegisterLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Display Registered Points
function displayRegisteredPoints() {
  pontosRegistrados.innerHTML = "";
  const registers = getRegisterLocalStorage("register");

  registers.forEach((register) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${register.date} | ${register.time} | ${register.type}`;
    pontosRegistrados.appendChild(listItem);
  });
}

// Geolocation
function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => reject(`Erro ${error}`)
    );
  });
}

// Initial Updates
updateContentHour();
setInterval(updateContentHour, 1000);
displayRegisteredPoints();
