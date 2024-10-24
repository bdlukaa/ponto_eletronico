// DOM Elements
const diaSemana = document.getElementById("dia-semana");
const dataAtual = document.getElementById("data-atual");
const horaAtual = document.getElementById("hora-atual");
const btnRegistrarPonto = document.getElementById("btn-registrar-ponto");
const alertaSucesso = document.getElementById("alerta-ponto-registrado");
const dialogPonto = document.getElementById("dialog-ponto");
const selectRegisterType = document.getElementById("register-type");
const btnDialogRegister = document.getElementById("btn-dialog-register");
const btnDialogFechar = document.getElementById("dialog-fechar");
const registerDateInput = document.getElementById("register-date");
const registerTimeInput = document.getElementById("register-time");
const registerObservationInput = document.getElementById(
  "register-observation"
);
const userLocationElement = document.getElementById("user-location");
const userMapElement = document.getElementById("user-map");

const REGISTER_KEY = "register";
const LAST_REGISTER_KEY = "lastRegister";

let hasChangedTime = false;

function initializeDisplay() {
  diaSemana.textContent = getWeekDay();
  dataAtual.textContent = getCurrentDate();
}
initializeDisplay();

// Event Listeners
btnRegistrarPonto.addEventListener("click", () => {
  setRegisterType();
  register();
});
btnDialogRegister.addEventListener("click", handleRegister);
dialogPonto.onclose = () => {
  hasChangedTime = false;
  console.log("Dialog closed.");
};

// Utility Functions
function updateContentHour() {
  horaAtual.textContent = getCurrentTime();
}

function getCurrentTime() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function getCurrentDate() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function getWeekDay() {
  const dayNames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return dayNames[new Date().getDay()];
}

// Setup Date Inputs
function setupDate() {
  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];
  registerDateInput.setAttribute("max", maxDate);
  registerDateInput.setAttribute("value", maxDate);
  registerTimeInput.setAttribute("value", getCurrentTime());

  registerTimeInput.oninput = () => {
    hasChangedTime = true;
  };
}
setupDate();

// Register Handling
function setRegisterType() {
  const lastType = () => {
    try {
      return JSON.parse(localStorage.getItem(LAST_REGISTER_KEY)).type;
    } catch (error) {
      return "saida";
    }
  };
  console.log(lastType());
  const nextTypeMap = {
    entrada: "intervalo",
    intervalo: "volta-intervalo",
    "volta-intervalo": "saida",
    saida: "entrada",
  };
  selectRegisterType.value = nextTypeMap[lastType()];
  console.log(`Set register type to: ${selectRegisterType.value}`);
}

async function handleRegister(event) {
  event.preventDefault();
  const selectedDate = new Date(registerDateInput.value);
  const currentDate = new Date();

  if (selectedDate > currentDate) {
    alert("Não é possível registrar ponto em datas futuras!");
    return;
  }

  try {
    const register = await createRegister();
    saveRegisterLocalStorage(register);
    localStorage.setItem(LAST_REGISTER_KEY, JSON.stringify(register));
    console.log("Register saved to localStorage:", register);
    showSuccessAlert();
    dialogPonto.close();
  } catch (error) {
    console.error("Error during registration:", error);
  }

  updateContent();
}

function showSuccessAlert() {
  alertaSucesso.classList.remove("hidden");
  alertaSucesso.classList.add("show");
  console.log("Success alert shown.");
  setTimeout(() => {
    alertaSucesso.classList.replace("show", "hidden");
    console.log("Success alert hidden.");
  }, 5000);
}

async function createRegister() {
  const register = {
    id: Date.now(),
    registerDate: getCurrentDate(),
    date: new Date(Date.parse(registerDateInput.value)).toISOString(),
    time: registerTimeInput.value,
    type: selectRegisterType.value,
    obs: registerObservationInput.value,
  };
  console.log("Created register:", register);
  return register;
}

async function register() {
  const lastRegister = JSON.parse(localStorage.getItem(LAST_REGISTER_KEY));
  const dialogUltimoRegistro = document.getElementById(
    "dialog-ultimo-registro"
  );

  if (lastRegister) {
    dialogUltimoRegistro.textContent = `Último Registro: ${lastRegister.date} às ${lastRegister.time} - ${lastRegister.type}`;
    console.log("Last register displayed:", lastRegister);
  } else {
    console.log("No last register found.");
  }

  setInterval(() => {
    if (!hasChangedTime) {
      registerTimeInput.value = getCurrentTime();
    }
  }, 1000);

  dialogPonto.showModal();
  console.log("Dialog for registering points shown.");

  userLocationElement.textContent = "Carregando localização...";
  try {
    const location = await getUserLocation();
    userLocationElement.textContent = `Localização: ${location.latitude.toFixed(
      4
    )}, ${location.longitude.toFixed(4)}`;

    userMapElement.style.height = "200px";
    userMapElement.src = `https://www.openstreetmap.org/export/embed.html?bbox=${
      location.longitude - 0.005
    },${location.latitude - 0.005},${location.longitude + 0.005},${
      location.latitude + 0.005
    }&layer=mapnik&marker=${location.latitude},${location.longitude}`;
  } catch (error) {
    userLocationElement.textContent = "Localização não disponível.";
    userMapElement.src = "";
    userMapElement.style.height = "0px";
  }
}

// LocalStorage Handling
function saveRegisterLocalStorage(register) {
  const registers = getRegisterLocalStorage(REGISTER_KEY);
  registers.push(register);
  localStorage.setItem(REGISTER_KEY, JSON.stringify(registers));
  console.log("Updated localStorage with new register:", registers);
}

function getRegisterLocalStorage(key) {
  const storedData = localStorage.getItem(key);
  const registers = storedData ? JSON.parse(storedData) : [];
  console.log(`Retrieved from localStorage (${key}):`, registers);
  return registers;
}

// Geolocation
function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log("User location:", userLocation);
        resolve(userLocation);
      },
      (error) => {
        console.error("Error getting location:", error);
        reject(`Erro ${error}`);
      }
    );
  });
}

// Initial Updates
function updateContent() {
  updateContentHour();
  setInterval(updateContentHour, 1000);
}
updateContent();
