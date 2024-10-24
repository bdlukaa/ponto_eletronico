// DOM Elements
const diaSemana = document.getElementById("dia-semana");
const dataAtual = document.getElementById("data-atual");
const horaAtual = document.getElementById("hora-atual");
const btnRegistrarPonto = document.getElementById("btn-registrar-ponto");
const dialogPonto = document.getElementById("dialog-ponto");
const selectRegisterType = document.getElementById("register-type");
const btnDialogRegister = document.getElementById("btn-dialog-register");
const btnDialogFechar = document.getElementById("dialog-fechar");
const alertaSucesso = document.getElementById("alerta-ponto-registrado");
const pontosRegistrados = document.getElementById("lista-pontos-registrados");
//entrada de dados
const registerDateInput = document.getElementById("register-date");
const registerTimeInput = document.getElementById("register-time");

const REGISTER_KEY = "register";
const LAST_REGISTER_KEY = "lastRegister";

// Initialize Display
diaSemana.textContent = getWeekDay();
dataAtual.textContent = getCurrentDate();

// Event Listeners
btnRegistrarPonto.addEventListener("click", () => {
  setRegisterType();
  register();
});
btnDialogRegister.addEventListener("click", handleRegister);
btnDialogFechar.addEventListener("click", () => {
  console.log("Closing dialog.");
  dialogPonto.close();
});
dialogPonto.onclose = () => {
  hasChangedTime = false;
  console.log("Dialog closed.");
};

// Utility Functions
function updateContentHour() {
  horaAtual.textContent = getCurrentTime();
  // console.log(`Updated hour: ${horaAtual.textContent}`);
}

function getCurrentTime() {
  const date = new Date();
  const currentTime = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  // console.log(`Current time: ${currentTime}`);
  return currentTime;
}

function getCurrentDate() {
  const date = new Date();
  const currentDate = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
  // console.log(`Current date: ${currentDate}`);
  return currentDate;
}

function getWeekDay() {
  const daynames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const weekDay = daynames[new Date().getDay()];
  // console.log(`Week day: ${weekDay}`);
  return weekDay;
}

let hasChangedTime = false;
function setupDate() {
  const today = new Date();
  //converte data atual p/ string
  const maxDate = today.toISOString().split("T")[0]; // índice 0 indica data no formato YYYY-MM-DD
  registerDateInput.setAttribute("max", maxDate);
  registerDateInput.setAttribute("value", maxDate); // também é hoje

  registerTimeInput.setAttribute("value", getCurrentTime());
  registerTimeInput.oninput = () => {
    console.log("Time has been changed.");
    hasChangedTime = true;
  };
}

setupDate();

// Register Handling
function setRegisterType() {
  const lastType = localStorage.getItem("lastRegisterType") || "entrada";
  const nextTypeMap = {
    entrada: "intervalo",
    intervalo: "volta-intervalo",
    "volta-intervalo": "saida",
    saida: "entrada",
  };
  selectRegisterType.value = nextTypeMap[lastType];
  console.log(`Set register type to: ${selectRegisterType.value}`);
}

async function handleRegister(event) {
  event.preventDefault();

  //cria obj a partir do valor do campo selecionado
  const selectedDate = new Date(registerDateInput.value);
  const currentDate = new Date();

  if (selectedDate > currentDate) {
    alert("Não é possível registrar ponto em datas futuras!");
    return;
  }

  try {
    const register = await createRegister(
      selectRegisterType.value,
      registerDateInput.value,
      document.getElementById("register-observation").value //captura obs
    );
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

async function createRegister(registerType, registerDate, registerObservation) {
  const register = {
    registerDate: registerDate || getCurrentDate(),
    date: getCurrentDate(),
    time: getCurrentTime(),
    // location,
    id: Date.now(),
    type: registerType,
    obs: registerObservation,
  };
  console.log("Created register:", register);
  return register;
}

function register() {
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

// Display Registered Points
function displayRegisteredPoints() {
  pontosRegistrados.innerHTML = "";
  const registers = getRegisterLocalStorage(REGISTER_KEY);
  const currentDate = new Date();

  registers.forEach((register) => {
    const listItem = document.createElement("li");
    //converte p/ uma string compatível para comparação de datas
    const registerDate = new Date(
      register.registerDate.split("/").reverse().join("-")
    );
    const date = new Date(register.date.split("/").reverse().join("-"));
    if (registerDate < date) {
      listItem.classList.add("registro-passado");
    }

    if (register.observation) {
      listItem.classList.add("registro-com-observacao");
      listItem.textContent = `${register.date} | ${register.time} | ${register.type} | Obs: ${register.observation}`;
    } else {
      listItem.classList.add("pontos-registrados");
      listItem.textContent = `${register.date} | ${register.time} | ${register.type}`;
    }
    pontosRegistrados.appendChild(listItem);
    console.log("Displayed registered point:", listItem.textContent);
  });
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
  displayRegisteredPoints();
}
updateContent();
