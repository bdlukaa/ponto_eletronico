const pontosRegistrados = document.getElementById("lista-pontos-registrados");

function getRegisterLocalStorage(key) {
  const storedData = localStorage.getItem(key);
  const registers = storedData ? JSON.parse(storedData) : [];
  console.log(`Retrieved from localStorage (${key}):`, registers);
  return registers;
}

const REGISTER_KEY = "register";

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

    listItem.classList.add("pontos-registrados");
    listItem.textContent = `${register.type} em ${register.date} às ${register.time}`;

    if (register.obs) {
      listItem.classList.add("registro-com-observacao");
      listItem.textContent = `${listItem.textContent} - ${register.obs}`;
    }
    pontosRegistrados.appendChild(listItem);
    console.log("Displayed registered point:", listItem.textContent);
  });
}

displayRegisteredPoints();
