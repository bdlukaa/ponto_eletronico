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
// DOM Elements p/ edição
const dialogEditarRegistro = document.getElementById("dialog-editar-registro");
const dialogEditarData = document.getElementById("dialog-editar-data");
const dialogEditarHora = document.getElementById("dialog-editar-hora");
const btnDialogEditar = document.getElementById("btn-dialog-editar");
const btnDialogFecharEditar = document.getElementById("dialog-fechar-editar");


const REGISTER_KEY = "register";
const LAST_REGISTER_KEY = "lastRegister";

// Initialize Display
diaSemana.textContent = getWeekDay();
dataAtual.textContent = getCurrentDate();
dialogData.textContent = `Data: ${getCurrentDate()}`;

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

btnDialogEditar.addEventListener("click", () => {
  const novaObservacao = document.getElementById("editar-observacao").value;
  const registers = getRegisterLocalStorage(REGISTER_KEY);
  const registerIndex = registers.findIndex(r => r.id === editingRegisterId);

  if (registerIndex !== -1) {
    registers[registerIndex].observacao = novaObservacao;
    localStorage.setItem(REGISTER_KEY, JSON.stringify(registers));
    displayRegisteredPoints(); // Atualiza a lista de registros exibidos
    dialogEditarRegistro.close();
  }
});


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

function openEditDialog(register) {
  dialogEditarData.textContent = `Data: ${register.date}`;
  dialogEditarHora.textContent = `Hora: ${register.time}`;
  document.getElementById("editar-observacao").value = register.observacao || "";
  dialogEditarRegistro.showModal();
}


async function handleRegister() {
  try {
    const dataRegistro = document.getElementById("data-registro").value;
    const dataEscolhida = new Date(dataRegistro);
    const dataAtual = new Date();

    //verifica se a data é futura
    if(dataEscolhida > dataAtual){
      alert("Não é permitido o registro em uma data futura!");
      return;
    }

    //observação no campo de texto
    const observacao = document.getElementById("observacao").value
    const register = await createRegister(selectRegisterType.value, observacao);
    saveRegisterLocalStorage(register);
    localStorage.setItem(LAST_REGISTER_KEY, JSON.stringify(register));
    console.log("Register saved to localStorage:", register);

    showSuccessAlert();
    dialogPonto.close();
  } catch (error) {
    console.error("Error during registration:", error);
  }
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

async function createRegister(registerType, observacao) {
  const location = await getUserLocation();
  const register = {
    date: getCurrentDate(),
    time: getCurrentTime(),
    location,
    id: Date.now(), // Use timestamp as unique ID
    type: registerType,
    observation: observacao, //adiciona observacao
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
    dialogUltimoRegistro.textContent = `Último Registro: ${lastRegister.date} | ${lastRegister.time} | ${lastRegister.type}`;
    console.log("Last register displayed:", lastRegister);
  } else {
    console.log("No last register found.");
  }

  dialogHora.textContent = `Hora: ${getCurrentTime()}`;
  setInterval(() => {
    dialogHora.textContent = `Hora: ${getCurrentTime()}`;
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

function displayRegisteredPoints() {
  pontosRegistrados.innerHTML = "";
  const registers = getRegisterLocalStorage(REGISTER_KEY);

  registers.forEach((register) => {
    const listItem = document.createElement("li");

    // botão de editar
    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => {
      editingRegisterId = register.id; // Salva o ID do registro que está sendo editado
      openEditDialog(register);
    });

    // verifica se o registro foi feito no passado
    const dataRegistro = new Date(register.date);
    const dataAtual = new Date();
    if (dataRegistro < dataAtual) {
      listItem.classList.add("registro-passado");
    }

    // inclui a observação
    listItem.textContent = `${register.date} | ${register.time} | ${register.type}`;
    if (register.observacao) {
      listItem.textContent += ` | Observação: ${register.observacao}`;
    }

    // adiciona o botão ao item da lista
    listItem.appendChild(editButton);
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
updateContentHour();
setInterval(updateContentHour, 1000);
displayRegisteredPoints();
