let button = document.getElementById("ok")
const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

button.onclick = () => {
    let nomeInput = document.getElementById("nome-input")
    console.log(nomeInput.value)

    let idadeInput = document.getElementById("idade-input")
    console.log(idadeInput.value)

    let emailInput = document.getElementById("email-input")
    if (!validateEmail(emailInput.value)) {
        alert("Email is not valid")
    }
    console.log(emailInput.value)
}

