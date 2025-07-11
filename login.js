document.getElementById("login").addEventListener("click", async function (e) {
  e.preventDefault();

  const apiLogin = "https://loginprincipal.alexandre-treinamentos.workers.dev/";
  const usuarioInput = document.getElementById("usuario");
  const senhaInput = document.getElementById("password");

  const usuario = usuarioInput.value.trim();
  const senha = senhaInput.value.trim();

  let hasEmptyField = false;

  // Reset dos estilos e placeholders
  [usuarioInput, senhaInput].forEach((input) => {
    input.classList.remove("erro-input");
    input.placeholder = input.getAttribute("data-placeholder-original");
  });

  // Validação
  if (!usuario) {
    usuarioInput.classList.add("erro-input");
    usuarioInput.placeholder = "Preencha o email ou nome de usuário";
    hasEmptyField = true;
  }

  if (!senha) {
    senhaInput.classList.add("erro-input");
    senhaInput.placeholder = "Preencha a senha";
    hasEmptyField = true;
  }

  if (hasEmptyField) {
    Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Por favor, preencha todos os campos para continuar.",
    });
    return;
  }

  // Requisição de login
  try {
    const response = await fetch(apiLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, senha }),
    });

    if (response.status === 200) {
      const data = await response.json();
      sessionStorage.setItem("usuario", data.usuario);
      const user = data.usuario;
      // Armazenar novamente no sessionStorage (não necessário se já foi feito acima)
      sessionStorage.setItem("user", user);

      window.location.href = "calendario.html";
    } else {
      const texto = await response.text();
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login",
        text: texto,
      });
    }
  } catch (erro) {
    Swal.fire({
      icon: "error",
      title: "Erro ao conectar com o servidor.",
      text: erro.message,
    });
  }
});

