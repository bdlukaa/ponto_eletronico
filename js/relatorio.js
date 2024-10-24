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
    if (filtro === "ultima-semana") {
      return currentDate - Date.parse(register.date) <= 7 * 24 * 60 * 60 * 1000;
    } else if (filtro === "ultimo-mes") {
      return (
        currentDate - Date.parse(register.date) <= 30 * 24 * 60 * 60 * 1000
      );
    }
    return true; // Sem filtro
  });

  // Agrupando por data
  const groupedRegisters = {};
  filteredRegisters.forEach((register) => {
    const date = new Date(register.date).toLocaleDateString("pt-BR");
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
      if (registerDate < Date.parse(register.date)) {
        listItem.classList.add("registro-passado");
      }
      if (register.edited) {
        listItem.classList.add("registro-editado");
      }

      const type =
        register.type.charAt(0).toUpperCase() + register.type.slice(1);
      const date = new Date(register.date).toLocaleDateString("pt-BR");
      listItem.textContent = `${type} em ${date} às ${register.time}`;

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Editar";
      btnEdit.classList.add("editar");
      btnEdit.onclick = () => {
        onEditRegister(register);
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

          // justificativa 
      if (register.justificativa) {
        const justificativa = document.createElement("p");
        justificativa.textContent = `Justificativa: ${register.justificativa}`;
        listItem.appendChild(justificativa);
      }

      if (register.arquivo) {
        const link = document.createElement("a");
        link.href = register.arquivo; // URL do arquivo
        link.textContent = "Download do arquivo";
        link.target = "_blank"; // Abre o link em uma nova aba
        listItem.appendChild(link);
      }
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

function onEditRegister(register) {
  const date = new Date(register.date).toLocaleDateString("pt-BR");
  registerDateInput.setAttribute("value", date);
  registerTimeInput.value = register.time;
  selectRegisterType.value = register.type;
  registerObservationInput.value = register.obs;

  dialogPonto.showModal();

  btnDialogRegister.onclick = (event) => {
    const registers = getRegisterLocalStorage(REGISTER_KEY);
    const registerIndex = registers.findIndex((reg) => reg.id === register.id);
    console.log(registerIndex);

    registers[registerIndex] = {
      id: register.id,
      registerDate: register.registerDate,
      date: Date.parse(registerDateInput.value),
      time: registerTimeInput.value,
      type: selectRegisterType.value,
      obs: registerObservationInput.value,
      edited: true,
      editDate: new Date().toISOString().split("T")[0],
    };

    localStorage.setItem(REGISTER_KEY, JSON.stringify(registers));
    displayRegisteredPoints();
    dialogPonto.close();
  };
}
