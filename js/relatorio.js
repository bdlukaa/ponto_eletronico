// Dialog
const dialogPonto = document.getElementById("dialog-ponto");
const selectRegisterType = document.getElementById("register-type");
const btnDialogRegister = document.getElementById("btn-dialog-register");
const btnDialogFechar = document.getElementById("dialog-fechar");
const registerDateInput = document.getElementById("register-date");
const registerTimeInput = document.getElementById("register-time");
const registerObservationInput = document.getElementById(
  "register-observation"
);

// Lista
const pontosRegistrados = document.getElementById("lista-pontos-registrados");
const filtroPeriodo = document.getElementById("filtro-periodo");
const btnFiltrar = document.getElementById("btn-filtrar");

const REGISTER_KEY = "register";

// Função para obter os registros do localStorage
function getRegisterLocalStorage(key) {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
}

// Exibir os pontos registrados
function displayRegisteredPoints(filtro = "todos") {
  pontosRegistrados.innerHTML = "";
  const registers = getRegisterLocalStorage(REGISTER_KEY);
  const currentDate = new Date();

  // Filtragem dos registros por período
  const filteredRegisters = registers.filter((register) => {
    const registerDate = new Date(register.date.split("/").reverse().join("-"));
    if (filtro === "ultima-semana") {
      return currentDate - registerDate <= 7 * 24 * 60 * 60 * 1000;
    } else if (filtro === "ultimo-mes") {
      return currentDate - registerDate <= 30 * 24 * 60 * 60 * 1000;
    }
    return true; // Sem filtro
  });

  // Agrupando por data
  const groupedRegisters = {};
  filteredRegisters.forEach((register) => {
    const date = register.date;
    if (!groupedRegisters[date]) {
      groupedRegisters[date] = [];
    }
    groupedRegisters[date].push(register);
  });

  // Adiciona os registros ao DOM
  for (const date in groupedRegisters) {
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = date;
    pontosRegistrados.appendChild(dateHeader);

    groupedRegisters[date].forEach((register) => {
      const listItem = document.createElement("li");
      listItem.classList.add("pontos-registrados");

      // Converte para uma string compatível para comparação de datas
      const registerDate = new Date(
        register.registerDate.split("/").reverse().join("-")
      );
      const date = new Date(register.date.split("/").reverse().join("-"));
      if (registerDate < date) {
        listItem.classList.add("registro-passado");
      }

      listItem.textContent = `${register.type} em ${register.date} às ${register.time}`;

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.classList.add("editar");
      btnEdit.onclick = () => {
        dialogPonto.showModal();
      };
      listItem.appendChild(btnEdit);

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Excluir";
      btnDelete.classList.add("excluir");
      btnDelete.onclick = () => {
        alert("Este ponto não pode ser excluído.");
      };
      listItem.appendChild(btnDelete);

      if (register.obs) {
        const obs = document.createElement("p");
        obs.textContent = `Observação: ${register.obs}`;
        listItem.appendChild(obs);
        listItem.classList.add("registro-com-observacao");
      }

      pontosRegistrados.appendChild(listItem);
    });
  }
}

// Evento do botão de filtrar
btnFiltrar.onclick = () => {
  const selectedFilter = filtroPeriodo.value;
  displayRegisteredPoints(selectedFilter);
};

// Inicializa a exibição
displayRegisteredPoints();
