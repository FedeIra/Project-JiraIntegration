// Reemplaza 'URL_JIRA' con la URL de tu instancia de Jira
const JIRA_URL = '';

// Reemplaza 'USUARIO' y 'CONTRASEÑA' con tus credenciales de Jira
const JIRA_USERNAME = '';
const JIRA_PASSWORD = '';

// Función que se ejecuta al enviar el formulario de Google
function onSubmitForm(e) {
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();

  // Obtén los datos del formulario
  const formData = {};
  itemResponses.forEach(function (itemResponse) {
    formData[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  });

  // Crea la tarea en Jira
  createJiraTask(formData);
}

// Función para crear una tarea en Jira
function createJiraTask(formData) {
  const jiraEndpoint = JIRA_URL + '/rest/api/2/issue/';

  const headers = {
    Authorization:
      'Basic ' + Utilities.base64Encode(JIRA_USERNAME + ':' + JIRA_PASSWORD),
    'Content-Type': 'application/json',
  };

  const payload = {
    fields: {
      project: {
        key: replaceProyecto(formData['Proyecto']),
      },
      summary: formData['Título de la solicitud'],
      description: formData['Descripción'],
      issuetype: {
        name: formData['Tipo de Incidencia'],
      },
      priority: {
        name: formData['Prioridad'],
      },
      components: [
        {
          name: formData['Bandera Cencosud'][0],
        },
      ],
      fixVersions: [
        {
          name: replaceSitio(formData['Sitio']),
        },
      ],
      customfield_10014: replaceArea(formData['Área']),
    },
  };

  const options = {
    method: 'post',
    headers: headers,
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(jiraEndpoint, options);

  const ticketId = JSON.parse(response).id;

  // Agrega los archivos adjuntos a la tarea
  const files = formData['Agregar adjunto'];

  if (files) {
    files.forEach(function (file) {
      addAttachmentToJiraTicket(ticketId, file);
    });
  }
}

function replaceArea(area) {
  if (area === 'Diseño') {
    return 'CENCOSUD-1';
  } else if (area === 'Comercial') {
    return 'CENCOSUD-2';
  } else if (area === 'Marketing') {
    return 'CENCOSUD-3';
  } else if (area === 'Catálogo') {
    return 'CENCOSUD-4';
  } else if (area === 'Servicio al cliente') {
    return 'CENCOSUD-5';
  } else if (area === 'Tecnología') {
    return 'CENCOSUD-12';
  }
}

function replaceSitio(sitio) {
  if (sitio === 'App') {
    return 'APP';
  } else if (area === 'Web') {
    return 'WEB';
  }
}

function replaceProyecto(proyecto) {
  if (proyecto === 'CO - Cencosud Colombia - Soporte WEB + APP') {
    return 'CENCOSUD';
  } else {
    return proyecto;
  }
}

function addAttachmentToJiraTicket(ticketId, attachmentKey) {
  const jiraEndpoint = JIRA_URL + `/rest/api/3/issue/${ticketId}/attachments/`;

  const headers = {
    Authorization:
      'Basic ' + Utilities.base64Encode(JIRA_USERNAME + ':' + JIRA_PASSWORD),
    contentType: false,
    'X-Atlassian-Token': 'nocheck',
  };

  const options = {
    method: 'post',
    headers: headers,
    payload: {
      file: DriveApp.getFileById(attachmentKey).getBlob(),
    },
  };

  UrlFetchApp.fetch(jiraEndpoint, options);
}
