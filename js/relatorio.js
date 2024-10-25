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
const filtroPeriodo = document.getElementById("filter-option");
const btnFiltrar = document.getElementById("btn-filtrar");

const REGISTER_KEY = "register";
const JUSTIFICATIVAS_KEY = "justifications";

// Função para obter os registros do localStorage
function getRegisterLocalStorage(key) {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
}

const startDateInput = document.getElementById("filter-start-date");
const endDateInput = document.getElementById("filter-end-date");
const justificativasCheckbox = document.getElementById("filter-justificativa");
const btnClearFilter = document.getElementById("btn-clear-filter");

function displayRegisteredPoints(filtro = "todos") {
  pontosRegistrados.innerHTML = "";
  const registers = [
    ...getRegisterLocalStorage(REGISTER_KEY),
    ...getRegisterLocalStorage(JUSTIFICATIVAS_KEY),
  ];

  const currentDate = new Date();
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  const filterJustificativas = justificativasCheckbox.checked;

  const filteredRegisters = registers.filter((register) => {
    const registerDate = new Date(register.date);

    if (filtro === "ultima-semana" && currentDate - registerDate > 7 * 24 * 60 * 60 * 1000) {
      return false;
    } else if (filtro === "ultimo-mes" && currentDate - registerDate > 30 * 24 * 60 * 60 * 1000) {
      return false;
    }

    if (startDateInput.value && registerDate < startDate) {
      return false;
    }
    if (endDateInput.value && registerDate > endDate) {
      return false;
    }

    if (filterJustificativas && register.type !== "justificativa") {
      return false;
    }

    return true;
  });

  if (filteredRegisters.length === 0) {
    pontosRegistrados.innerHTML = "<p>Nenhum registro encontrado para o período selecionado.</p>";
    return;
  }

  const groupedRegisters = {};
  filteredRegisters.forEach((register) => {
    const date = new Date(register.date).toLocaleDateString("pt-BR");
    if (register.type == "justificativa") {
      if (!groupedRegisters["Justificativas"]) {
        groupedRegisters["Justificativas"] = [];
      }
      groupedRegisters["Justificativas"].push(register);
    } else {
      if (!groupedRegisters[date]) {
        groupedRegisters[date] = [];
      }
      groupedRegisters[date].push(register);
    }
  });

  for (const date in groupedRegisters) {
    const dateHeader = document.createElement("h3");
    dateHeader.textContent = date;
    pontosRegistrados.appendChild(dateHeader);

    groupedRegisters[date].forEach((register) => {
      const listItem = register.type === "justificativa"
        ? createJustificationRegisterItem(register)
        : createRegisterItem(register);
      pontosRegistrados.appendChild(listItem);
    });
  }
}

startDateInput.onchange = () => {
  endDateInput.setAttribute("min", startDateInput.value);
};

btnFiltrar.onclick = () => {
  const selectedFilter = filtroPeriodo.value;
  displayRegisteredPoints(selectedFilter);
};

btnClearFilter.onclick = () => {
  filtroPeriodo.value = "todos";
  startDateInput.value = "";
  endDateInput.value = "";
  justificativasCheckbox.checked = false;
  displayRegisteredPoints();
};

function createRegisterItem(register) {
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

  const typeName = {
    "entrada": "Entrada",
    "saida": "Saída",
    "intervalo": "Intervalo",
    "volta-intervalo": "Volta do Intervalo",
    "justificativa": "Justificativa",
  };

  const date = new Date(register.date).toLocaleDateString("pt-BR");
  listItem.textContent = `${typeName[register.type]} em ${date} às ${register.time}`;

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
  }

  if (register.location) {
    // const location = document.createElement("p");
    // location.textContent = `Localização: ${register.location.latitude.toFixed(
    //   4
    // )}, ${register.location.longitude.toFixed(4)}`;
    // listItem.appendChild(location);

    // <iframe
    // id="user-map"
    // width="100%"
    // height="0"
    // style="border: 0"
    // loading="lazy"
    // ></iframe>
    const locationIframe = document.createElement("iframe");
    locationIframe.id = "user-map";
    locationIframe.width = "100%";
    locationIframe.height = "100px";
    locationIframe.style.border = "0";
    locationIframe.loading = "lazy";
    locationIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${
      register.location.longitude - 0.005
    },${register.location.latitude - 0.005},${
      register.location.longitude + 0.005
    },${register.location.latitude + 0.005}&layer=mapnik&marker=${
      register.location.latitude
    },${register.location.longitude}`;
    listItem.appendChild(locationIframe);
  }

  return listItem;
}

function createJustificationRegisterItem(register) {
  const listItem = document.createElement("li");
  listItem.classList.add("pontos-registrados");

  const date = new Date(register.date).toLocaleDateString("pt-BR");
  listItem.textContent = `Justificativa em ${date}`;

  const btnEdit = document.createElement("button");
  btnEdit.textContent = "Editar";
  btnEdit.classList.add("editar");
  btnEdit.onclick = () => {
    onEditJustification(register);
  };
  listItem.appendChild(btnEdit);

  const justificationText = document.createElement("p");
  justificationText.textContent = `${register.obs}`;
  if (register.arquivo) {
    justificationText.style.marginBottom = "10px";
  }
  listItem.appendChild(justificationText);

  if (register.arquivo) {
    const link = document.createElement("a");
    link.href = register.arquivo; // URL do arquivo
    link.textContent = "Download do arquivo";
    link.target = "_blank"; // Abre o link em uma nova aba
    link.classList.add("download");
    listItem.appendChild(link);
  }

  if (register.edited) {
    listItem.classList.add("registro-editado");
  }
  return listItem;
}

// Evento do botão de filtrar
btnFiltrar.onclick = () => {
  const selectedFilter = filtroPeriodo.value;
  displayRegisteredPoints(selectedFilter);
};

// Inicializa a exibição
displayRegisteredPoints();

function onEditRegister(register) {
  registerDateInput.setAttribute(
    "value",
    new Date(register.date).toISOString().split("T")[0]
  );
  registerDateInput.setAttribute(
    "max",
    new Date(Date.now()).toISOString().split("T")[0]
  );
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
      date: new Date(registerDateInput.value).toISOString(),
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

const justificationEditDialog = document.getElementById("dialog-edit");
const justificationEditTextArea = document.getElementById("edit-justification");
const btnJustificativaEdit = document.getElementById("btn-justification-edit");
const justificationDate = document.getElementById("justification-date");

function onEditJustification(register) {
  justificationEditTextArea.value = register.obs;
  btnJustificativaEdit.onclick = () => {
    const justifications = getRegisterLocalStorage(JUSTIFICATIVAS_KEY);
    const justificationIndex = justifications.findIndex(
      (reg) => reg.id === register.id
    );

    justifications[justificationIndex] = {
      ...register,
      obs: justificationEditTextArea.value,
      edited: true,
      editDate: new Date().toISOString().split("T")[0],
    };

    localStorage.setItem(JUSTIFICATIVAS_KEY, JSON.stringify(justifications));
    displayRegisteredPoints();
    justificationEditDialog.close();
  };

  justificationDate.setAttribute(
    "value",
    new Date(register.date).toISOString().split("T")[0]
  );
  justificationDate.setAttribute(
    "max",
    new Date(Date.now()).toISOString().split("T")[0]
  );

  justificationEditDialog.showModal();
}
