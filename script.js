document.addEventListener("DOMContentLoaded", function () {
  const user = sessionStorage.getItem("user");
  let corEvento; // variável global
 //teste
  const apiSalvarEventos = "https://inserireventos.alexandre-treinamentos.workers.dev/";
  const apiRestaurarEventos = "https://restaurareventos.alexandre-treinamentos.workers.dev/";
  const apiUpdate = "https://updateeventos.alexandre-treinamentos.workers.dev/";
  const apiDelete = "https://removerevento.alexandre-treinamentos.workers.dev/";
  let idEventoretornado = null;
  let idEventoCompleto = null;

  let titleSend = null;
  let descriptonSend = null;
  let startSend = null;
  let endSend = null;

  var initialView = window.innerWidth < 1020 ? "timeGridDay" : "timeGridWeek"; // Define a vista inicial com base na largura da tela
  var calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    console.error("Elemento #calendar não encontrado.");
    return;
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: initialView,
    navLinks: true, // Pode clicar em nomes de dia/semana para navegar nas visualizações
    editable: true,
    selectable: true,
    dayMaxEvents: true,
    locale: "pt-br", // Define o idioma para português
    slotDuration: "00:30:00", // Intervalo de 30 minutos entre as horas
    scrollTime: "09:00", // Define o tempo inicial visível
    headerToolbar: {
      // Configura a barra de ferramentas
      left: "", // Botões de navegação e "hoje"
      center: "title", // Título central
      right: "", // Visualizações: Mês, Semana, Dia
    },

    views: {
      timeGridWeek: {
        // Personalização da vista semanal Define o background somente no numero do dia
        dayHeaderContent: function (args) {
          const weekday = args.date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
          const day = args.date.getDate();
          return {
            html: `
                  <div class="fc-header-day">
                      <span class="fc-day-name" style="font-weight: bold;">${weekday}</span>
                      <span class="fc-day-number" style="
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          background-color: rgb(0, 54, 138);
                          color: white;
                          width: 30px;
                          height: 30px;
                          line-height: 30px;
                          border-radius: 50%;
                          font-weight: bold;
                      ">${day}</span>
                  </div>
              `,
          };
        },
      },
      dayGridMonth: {
        // Exibe somente o nome do dia sem o número e sem estilos adicionais NA Vista Mensal
        dayHeaderContent: function (args) {
          const weekday = args.date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
          return {
            html: `<span class="fc-day-name" style="font-weight: bold;">${weekday}</span>`,
          };
        },
      },
      timeGridDay: {
        // Exibe somente o nome do dia sem o número e sem estilos adicionais na Vista Dia
        dayHeaderContent: function (args) {
          const weekday = args.date.toLocaleDateString("pt-BR", {
            weekday: "long",
          });
          return {
            html: `<span class="fc-day-name" style="font-weight: bold;">${weekday}</span>`,
          };
        },
      },
    },

    //Formata o Titulo do Cabeçalho para o formato Semana, Mês Completo e Ano(1 - 5 de Novembro de 2024)
    titleFormat: {
      year: "numeric",
      month: "long", // Exibe o nome completo do mês
      day: "numeric",
    },

    datesSet: function () {
      updateMonthTitle(calendar); // Atualiza o título da barra vertical
    },

    dateClick: function (info) {
      // Limpa os campos do formulário no modal (caso o usuário clique em um novo dia)
      document.getElementById("eventTitle").value = ""; // Limpa o campo do título do evento
      document.getElementById("dataEvento").value = ""; // Limpa o campo da data do evento
      document.getElementById("horarioEventoInicio").value = ""; // Limpa o campo do horário de início do evento
      document.getElementById("horarioEventoFim").value = ""; // Limpa o campo do horário de fim do evento
      document.getElementById("descricaoEvento").value = ""; // Limpa o campo de descrição do evento

      //#region  ===================== Conversão do Formato da Data para Exibir no Modal ================================
      // Converte a data clicada pelo usuário (info.date) para o formato "dd/mm/yyyy" (data brasileira)
      let dataFormatada = new Date(info.date).toLocaleDateString("pt-BR", {
        day: "2-digit", // Exibe o dia com 2 dígitos
        month: "2-digit", // Exibe o mês com 2 dígitos
        year: "numeric", // Exibe o ano como um número completo
      });

      // Define o valor do campo de texto para a data formatada
      document.getElementById("dataEvento").value = dataFormatada;
      //#endregion

      // Torna visíveis os botões para salvar, enquanto esconde os de editar e remover
      document.getElementById("save").style.display = "block"; // Exibe o botão "Salvar"
      document.getElementById("editar").style.display = "none"; // Oculta o botão "Editar"
      document.getElementById("remover").style.display = "none"; // Oculta o botão "Remover"

      // Exibe o modal para o usuário preencher as informações do evento
      document.getElementById("myModal").style.display = "block"; // Abre o modal
    },

    eventClick: function (info) {
      const event = info.event;

      idEventoretornado = event.id;
      corEvento = event.backgroundColor; // ou .borderColor se você usou essa

      // Obtemos o evento diretamente do calendário
      let eventCompleto = calendar.getEventById(idEventoretornado);
      if (!eventCompleto) {
        console.error("Evento não encontrado no FullCalendar.");
        return;
      }

      idEventoCompleto = eventCompleto; // Agora temos certeza que é um evento válido
      // Obter o título do evento
      const title = event.title;

      document.getElementById("eventTitle").value = title;

      //#region ===================== Conversao do Formato da Data para exibir no Modal ================================
      // Converte a data de início do evento para o formato DD/MM/YYYY
      let dataFormatada = new Date(info.event.start).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Se quiser definir em um campo de texto (similar ao seu exemplo)
      document.getElementById("dataEvento").value = dataFormatada;
      //#endregion

      //#region ==================== de conversão das horas ===========================
      // Formatar e exibir a data e hora para eventos do FullCalendar
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      // Formata a hora para HH:mm
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Se você quiser no formato 24 horas
      };

      // Obtém a hora formatada
      const formattedStartTime = startDate.toLocaleTimeString("pt-BR", options);
      const formattedEndTime = endDate.toLocaleTimeString("pt-BR", options);

      document.getElementById("horarioEventoInicio").value = formattedStartTime;
      document.getElementById("horarioEventoFim").value = formattedEndTime;
      //#endregion

      document.getElementById("event-color").value = corEvento;

      document.getElementById("descricaoEvento").value = event.extendedProps.description || "";

      document.getElementById("editar").style.display = "block";
      document.getElementById("remover").style.display = "block";
      document.getElementById("save").style.display = "none";
      // Abre o modal
      document.getElementById("myModal").style.display = "block";
    },
  });

  //#region ========================= BOTÕES DO TODO =========================================================
  // Adicionar eventos de clique aos botões personalizados
  document.getElementById("prev-button").addEventListener("click", function () {
    calendar.prev(); // Mover para o mês anterior

    // Verificar se a vista atual é 'dayGridMonth'
    if (calendar.view.type === "dayGridMonth") {
      updateMonthTitle(calendar); // Atualizar o título apenas na vista mensal
    } else if (calendar.view.type === "timeGridWeek") {
      // Atualizar o formato do título para a vista semanal
      const titleElement = document.querySelector(".fc-toolbar-title");
      const startDate = calendar.view.activeStart; // Obtém a data de início da vista semanal

      // Ajustar para a segunda-feira (se a vista semanal começar em outro dia)
      let monday = new Date(startDate);
      monday.setDate(startDate.getDate() - startDate.getDay() + 1); // Ajusta para a segunda-feira da semana

      // Ajustar para a sexta-feira
      let friday = new Date(monday);
      friday.setDate(monday.getDate() + 4); // Adiciona 4 dias para alcançar a sexta-feira

      // Formatar o título no formato "1 - 5 de Novembro de 2024"
      const formattedTitle = `${monday.getDate()} - ${friday.getDate()} de ${monday.toLocaleString("pt-PT", {
        month: "long",
      })} de ${monday.getFullYear()}`;
      const formattednomebarra = `${monday.toLocaleString("pt-PT", {
        month: "long",
      })} ${monday.getFullYear()}`;
      // Atualizar o título na barra de ferramentas
      titleElement.textContent = formattedTitle;

      // Atualiza o elemento 'barra-vertical'
      const barraVertical = document.getElementById("barra-vertical");
      if (barraVertical) {
        barraVertical.innerText = formattednomebarra.charAt(0).toUpperCase() + formattednomebarra.slice(1).toLowerCase();
      } else {
        console.warn('Elemento com ID "barra-vertical" não encontrado.');
      }
    }
  });

  document.getElementById("next-button").addEventListener("click", function () {
    calendar.next(); // Mover para o mês seguinte

    // Verificar se a vista atual é 'dayGridMonth'
    if (calendar.view.type === "dayGridMonth") {
      updateMonthTitle(calendar); // Atualizar o título apenas na vista mensal
    }
  });

  document.getElementById("today-button").addEventListener("click", function () {
    calendar.gotoDate(new Date()); // Mover para a data atual

    // Verificar se a vista atual é 'dayGridMonth'
    if (calendar.view.type === "dayGridMonth") {
      updateMonthTitle(calendar); // Atualizar o título apenas na vista mensal
    } else if (calendar.view.type === "timeGridWeek") {
      // Atualizar o formato do título para a vista semanal
      const titleElement = document.querySelector(".fc-toolbar-title");
      const startDate = calendar.view.activeStart; // Obtém a data de início da vista semanal

      // Ajustar para a segunda-feira (se a vista semanal começar em outro dia)
      let monday = new Date(startDate);
      monday.setDate(startDate.getDate() - startDate.getDay() + 1); // Ajusta para a segunda-feira da semana

      // Ajustar para a sexta-feira
      let friday = new Date(monday);
      friday.setDate(monday.getDate() + 4); // Adiciona 4 dias para alcançar a sexta-feira

      // Formatar o título no formato "1 - 5 de Novembro de 2024"
      const formattedTitle = `${monday.getDate()} - ${friday.getDate()} de ${monday.toLocaleString("pt-PT", {
        month: "long",
      })} de ${monday.getFullYear()}`;
      const formattednomebarra = `${monday.toLocaleString("pt-PT", {
        month: "long",
      })} ${monday.getFullYear()}`;
      // Atualizar o título na barra de ferramentas
      titleElement.textContent = formattedTitle;

      // Atualiza o elemento 'barra-vertical'
      const barraVertical = document.getElementById("barra-vertical");
      if (barraVertical) {
        barraVertical.innerText = formattednomebarra.charAt(0).toUpperCase() + formattednomebarra.slice(1).toLowerCase();
      } else {
        console.warn('Elemento com ID "barra-vertical" não encontrado.');
      }
    }
  });

  //-----------------------------------------------Botão para exibir o Mês do Calendario------------------------------------------------------
  document.getElementById("mes-button").addEventListener("click", function () {
    calendar.changeView("dayGridMonth"); // Mudar para a visualização de mês
  });

  document.getElementById("semana-button").addEventListener("click", function () {
    calendar.changeView("timeGridWeek"); // Mudar para a visualização de semana

    // Atualizar o formato do título para a vista semanal
    const titleElement = document.querySelector(".fc-toolbar-title");

    // Obtém a data de início e fim da vista semanal
    const startDate = calendar.view.activeStart; // Data de início da vista (provavelmente domingo)
    const endDate = calendar.view.activeEnd; // Data de fim da vista (provavelmente sábado)

    // Ajusta o início para a segunda-feira e o fim para a sexta-feira
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + ((1 - startDate.getDay() + 7) % 7)); // Próxima segunda-feira
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // Sexta-feira da mesma semana

    // Formatar o título no formato "1 - 5 de Novembro de 2024"
    const formattedTitle = `${monday.getDate()} - ${friday.getDate()} de ${monday.toLocaleString("pt-PT", {
      month: "long",
    })} de ${monday.getFullYear()}`;

    // Atualizar o título na barra de ferramentas
    titleElement.textContent = formattedTitle;
  });

  document.getElementById("dia-button").addEventListener("click", function () {
    calendar.changeView("timeGridDay"); // Mudar para a visualização de dia
  });

  document.getElementById("lista-button").addEventListener("click", function () {
    // Mudar para a visualização de lista
    calendar.changeView("listWeek");
  });

  // document.getElementById("configuracao").addEventListener("click", function () {
  //   document.getElementById("myModalConfiguracoes").style.display = "block";
  // });

  //#endregion ==========================================================================================================================

  function updateMonthTitle(calendar) {
    // Obter a data atual da vista do calendário
    const currentDate = calendar.getDate(); // Método do FullCalendar para obter a data central
    const currentMonth = currentDate.toLocaleString("pt-PT", { month: "long" });
    const currentYear = currentDate.getFullYear();

    // Formatar o texto no formato "Nome do Mês Ano"
    const formattedNomeBarra = `${currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} ${currentYear}`;

    // Atualiza o elemento 'barra-vertical'
    const barraVertical = document.getElementById("barra-vertical");
    if (barraVertical) {
      barraVertical.innerText = formattedNomeBarra;
    } else {
      console.warn('Elemento com ID "barra-vertical" não encontrado.');
    }
  }

  window.onclick = function (event) {
    if (event.target == document.getElementById("myModal")) {
      document.getElementById("myModal").style.display = "none";
    } else if (event.target == document.getElementById("myModalConfiguracoes")) {
      document.getElementById("myModalConfiguracoes").style.display = "none";
    }
  };

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.getElementById("myModal").style.display = "none";
      document.getElementById("myModalConfiguracoes").style.display = "none";
    }
  });

  // Função para gerar um ID provisório
  function generateTempID() {
    return `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  //Salva os eventos no Backend e adiciona os eventos no FullCalendar
  document.getElementById("save").addEventListener("click", async function () {
    var title = document.getElementById("eventTitle").value;

    var data_evento = document.getElementById("dataEvento").value;

    // Converter a data para o formato desejado (YYYY-MM-DD)
    var data_evento = document.getElementById("dataEvento").value;

    // Verificar se a data tem o formato dd/mm/yyyy
    if (data_evento) {
      // Dividir a data em partes
      var partesData = data_evento.split("/"); // Exemplo de "26/10/2025"

      // Verificar se as partes estão corretas
      if (partesData.length === 3) {
        var dia = partesData[0];
        var mes = partesData[1];
        var ano = partesData[2];

        // Garantir que o dia e o mês tenham dois dígitos
        var diaFormatado = String(dia).padStart(2, "0");
        var mesFormatado = String(mes).padStart(2, "0");

        // Formatar a data no formato yyyy-mm-dd
        var dataFormatada = ano + "-" + mesFormatado + "-" + diaFormatado;
        // alert(dataFormatada); // Exemplo de saída: "2025-10-26"
      } else {
        alert("Data inválida");
      }
    } else {
      alert("Por favor, insira uma data válida");
    }
    //==================Fim da Conversão=================================================================

    var horario_eventoInicio = document.getElementById("horarioEventoInicio").value;
    var horario_eventoFim = document.getElementById("horarioEventoFim").value;
    var descricao_Evento = document.getElementById("descricaoEvento").value;
    var cor_evento = document.getElementById("event-color").value;
    if (title && dataFormatada && horario_eventoInicio) {
      var startDateTime = dataFormatada + "T" + horario_eventoInicio;
      var endDateTime = horario_eventoFim ? dataFormatada + "T" + horario_eventoFim : startDateTime;

      // Gera a ID temporária e armazena na variável
      var tempID = generateTempID();
      // Adiciona ao calendário
      calendar.addEvent({
        id: tempID, // Adiciona a ID provisória ao evento
        title: title,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: cor_evento, // Define a cor de fundo do evento
        borderColor: cor_evento, // Define a cor da borda do evento (opcional)
        extendedProps: {
          descricao: descricao_Evento,
        },
      });

      // Cria o objeto do evento para enviar ao servidor
      var eventData = {
        Evento: title,
        Data: dataFormatada,
        Inicio: horario_eventoInicio,
        Fim: horario_eventoFim || horario_eventoInicio,
        Descricao: descricao_Evento,
        Cor: cor_evento, // Defina uma cor padrão ou adicione um seletor no front-end
        ID_Temp: tempID,
        Usuario: user,
      };

      try {
        let response = await fetch(apiSalvarEventos, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        let result = await response.json();

        if (response.ok) {
          // Fechar modal e limpar campos após sucesso
          document.getElementById("myModal").style.display = "none";
          document.getElementById("eventTitle").value = "";
          document.getElementById("dataEvento").value = "";
          document.getElementById("horarioEventoInicio").value = "";
          document.getElementById("horarioEventoFim").value = "";
          document.getElementById("descricaoEvento").value = "";
        } else {
          alert("Erro ao salvar evento: " + result.error);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
      }
    } else {
      Swal.fire({
        title: "Atenção!",
        text: `Preencha o título, a data e o horário de início.`,
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  });

  document.getElementById("editar").addEventListener("click", async function () {
    // Recupera os valores dos campos no modal
    var title = document.getElementById("eventTitle").value;
    var data_evento = document.getElementById("dataEvento").value;
    var horario_eventoInicio = document.getElementById("horarioEventoInicio").value;
    var horario_eventoFim = document.getElementById("horarioEventoFim").value;
    var descricao_Evento = document.getElementById("descricaoEvento").value;
    var cor_evento = document.getElementById("event-color").value;

    // Verificar se a data está no formato correto
    if (data_evento) {
      var partesData = data_evento.split("/"); // Exemplo de "26/10/2025"

      if (partesData.length === 3) {
        var dia = partesData[0];
        var mes = partesData[1];
        var ano = partesData[2];

        var diaFormatado = String(dia).padStart(2, "0");
        var mesFormatado = String(mes).padStart(2, "0");
        var dataFormatada = ano + "-" + mesFormatado + "-" + diaFormatado;
      } else {
        alert("Data inválida");
        return;
      }
    } else {
      alert("Por favor, insira uma data válida");
      return;
    }

    // Verificar se os campos obrigatórios foram preenchidos
    if (title && dataFormatada && horario_eventoInicio) {
      var startDateTime = dataFormatada + "T" + horario_eventoInicio;
      var endDateTime = horario_eventoFim ? dataFormatada + "T" + horario_eventoFim : startDateTime;
      var endDateTimeBackEnd = horario_eventoFim;

      // **🔹 Remove o evento antigo antes de adicionar o atualizado**
      var oldEvent = calendar.getEventById(idEventoretornado);
      if (oldEvent) {
        oldEvent.remove();
      }

      calendar.addEvent({
        id: idEventoretornado, // Aqui precisa ser "id", e não "ID"
        title: title,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: cor_evento,
        borderColor: cor_evento,
        extendedProps: {
          description: descricao_Evento,
        },
      });

      // Cria o objeto de dados para enviar ao servidor
      var eventData = {
        ID: idEventoretornado,
        Evento: title,
        Data: dataFormatada,
        Inicio: horario_eventoInicio,
        Fim: endDateTimeBackEnd,
        Descricao: descricao_Evento,
        Cor: cor_evento,
        Usuario: user,
      };

      try {
        let response = await fetch(apiUpdate, {
          method: "PUT", // Use o método PUT para atualizar
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        let result = await response.json();

        if (response.ok) {
          // Fechar modal e limpar campos após sucesso
          document.getElementById("myModal").style.display = "none";
          document.getElementById("eventTitle").value = "";
          document.getElementById("dataEvento").value = "";
          document.getElementById("horarioEventoInicio").value = "";
          document.getElementById("horarioEventoFim").value = "";
          document.getElementById("descricaoEvento").value = "";
        } else {
          alert("Erro ao atualizar evento: " + result.error);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao conectar com o servidor.");
      }
    } else {
      Swal.fire({
        title: "Atenção!",
        text: "Preencha o título, a data e o horário de início.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  });

  async function deleteEvent(idEventoretornado, source = "manual") {
    try {
      // Primeiro, remova do backend
      const backendResponse = await fetch(apiDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ID: idEventoretornado,
        }), // Envia o ID do evento para o backend
      });

      if (!backendResponse.ok) {
        const error = await backendResponse.json();
        console.error("Erro ao remover evento no backend:", error.message);
        return; // Abort the operation if backend removal fails
      }

      console.log("Evento removido do backend com sucesso.");
    } catch (error) {
      console.error("Erro ao remover o evento:", error);
    }
  }

  async function deleteEventIDTemporaria(RemoverIDTemporaria, source = "manual") {
    try {
      // Primeiro, remova do backend
      const backendResponse = await fetch(apiDelete, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ID_Temp: RemoverIDTemporaria,
        }), // Envia o ID do evento para o backend
      });

      if (!backendResponse.ok) {
        const error = await backendResponse.json();
        console.error("Erro ao remover evento no backend:", error.message);
        return; // Abort the operation if backend removal fails
      }

      console.log("Evento removido do backend com sucesso.");
    } catch (error) {
      console.error("Erro ao remover o evento:", error);
    }
  }

  document.getElementById("remover").addEventListener("click", async function () {
    if (idEventoretornado) {
      Swal.fire({
        title: "Você tem certeza?",
        text: "Esta ação não pode ser desfeita!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            if (idEventoretornado.startsWith("temp-")) {
              // Remove diretamente do calendário
              let event = calendar.getEventById(idEventoretornado);
              if (event) {
                const RemoverIDTemporaria = idEventoretornado;
                event.remove();
                await deleteEventIDTemporaria(RemoverIDTemporaria);
              }
            } else {
              // Aguarda a exclusão do evento antes de continuar
              await deleteEvent(idEventoretornado);

              idEventoCompleto.remove();
            }

            // Fecha o modal
            document.getElementById("myModal").style.display = "none";
          } catch (error) {}
        }
      });
    }
  });

  function loadEvents() {
    // Aqui você coloca o ID do usuário logado dinamicamente
    const url = `${apiRestaurarEventos}?user_id=${user}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Received data:", data);

        if (!data || typeof data !== "object") {
          console.error("Resposta inválida da API:", data);
          return;
        }

        if (data.success && Array.isArray(data.events)) {
          data.events.forEach((event) => {
            const eventId = event.ID;
            const startDateTime = `${event.Data}T${event.Inicio}:00`;
            const endDateTime = `${event.Data}T${event.Fim}:00`;

            calendar.addEvent({
              id: eventId,
              title: event.Evento || "Título não disponível",
              start: startDateTime,
              end: endDateTime,
              allDay: false,
              description: event.Descricao,
              color: event.Cor,
            });
          });

          const today = new Date().setHours(0, 0, 0, 0);
          const eventsToday = calendar.getEvents().filter((event) => {
            const eventStartDate = new Date(event.start).setHours(0, 0, 0, 0);
            return eventStartDate === today;
          });

          if (eventsToday.length > 0) {
            eventsToday.forEach((event) => {
              const startTime = new Date(event.start).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              const endTime = new Date(event.end).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              titleSend = event.title;
              descriptionSend = event.extendedProps.description;
              startSend = startTime;
              endSend = endTime;

            });
          }

          calendar.gotoDate(new Date());
        } else {
          console.error("Erro ao buscar eventos:", data.message || "Resposta inesperada");
        }
      })
      .catch((error) => console.error("Erro ao carregar eventos:", error));
  }

  calendar.render();

  loadEvents();
});
