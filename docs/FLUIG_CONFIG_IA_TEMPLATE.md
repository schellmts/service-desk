# Template: Configurações Agente de IA - Service Desk (Fluig)

Trecho para implementar no Fluig: colar API Key, selecionar modelo e validar se a chave é válida. Tudo em um único arquivo.

---

## Arquivo completo (HTML + script)

```html
<html>
<head>
  <link type="text/css" rel="stylesheet" href="/style-guide/css/fluig-style-guide.min.css"/>
  <script type="text/javascript" src="/portal/resources/js/jquery/jquery.js"></script>
  <script type="text/javascript" src="/portal/resources/js/jquery/jquery-ui.min.js"></script>
  <script type="text/javascript" src="/portal/resources/js/mustache/mustache-min.js"></script>
  <script type="text/javascript" src="/style-guide/js/fluig-style-guide.min.js" charset="utf-8"></script>
</head>
<body>
<div class="fluig-style-guide">
  <form name="form" role="form">
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h3 class="panel-title">Cadastro de Configurações Agente de IA Service Desk</h3>
      </div>
      <div class="panel-body">
        <div class="row">
          <div class="col-md-6 form-group">
            <label>API Key</label>
            <input type="password" name="apikey" id="apikey" class="form-control" placeholder="Cole sua chave (AIza...)">
            <small class="text-muted">Sua chave será validada ao clicar em "Validar"</small>
          </div>
          <div class="col-md-6 form-group d-flex align-items-end">
            <button type="button" id="btnValidar" class="btn btn-primary">
              <i class="fluigicon fluigicon-check"></i> Validar Chave
            </button>
          </div>
        </div>
        <div id="statusValidacao" class="row" style="display:none;">
          <div class="col-md-12">
            <div id="alertValidacao" class="alert" role="alert"></div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 form-group">
            <label>Modelo</label>
            <select name="modelo" id="modelo" class="form-control" disabled>
              <option value="">Primeiro valide a API Key</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 form-group">
            <label>Prompt IA</label>
            <textarea name="promptIA" id="promptIA" class="form-control" rows="4" placeholder="Instruções de sistema para o assistente..."></textarea>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<script>
(function() {
  var API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

  function getApiKey() {
    return $('#apikey').val() ? $('#apikey').val().trim() : '';
  }

  function showStatus(success, message) {
    var $status = $('#statusValidacao');
    var $alert = $('#alertValidacao');
    $status.show();
    $alert.removeClass('alert-success alert-danger');
    $alert.addClass(success ? 'alert-success' : 'alert-danger');
    $alert.text(message);
  }

  function hideStatus() {
    $('#statusValidacao').hide();
  }

  function popularModelos(models) {
    var $select = $('#modelo');
    $select.empty();
    $select.append('<option value="">Selecione o modelo</option>');
    models.forEach(function(m) {
      $select.append('<option value="' + m.name + '">' + (m.displayName || m.name) + '</option>');
    });
    $select.prop('disabled', false);
  }

  function validarEListarModelos() {
    var apiKey = getApiKey();
    if (!apiKey) {
      showStatus(false, 'Informe a API Key.');
      return;
    }

    $('#btnValidar').prop('disabled', true).html('<i class="fluigicon fluigicon-loading fluigicon-spin"></i> Validando...');
    hideStatus();

    var url = API_BASE + '/models?key=' + encodeURIComponent(apiKey);

    $.ajax({
      url: url,
      method: 'GET',
      dataType: 'json'
    })
    .done(function(data) {
      if (data.models) {
        var supported = data.models.filter(function(m) {
          return m.supportedGenerationMethods && m.supportedGenerationMethods.indexOf('generateContent') !== -1;
        });
        popularModelos(supported);
        showStatus(true, 'Chave válida! ' + supported.length + ' modelo(s) disponível(is).');
      } else {
        showStatus(false, 'Resposta inesperada da API.');
      }
    })
    .fail(function(xhr) {
      var msg = 'Falha ao validar.';
      if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) {
        msg = xhr.responseJSON.error.message;
      } else if (xhr.status === 403) {
        msg = 'Chave inválida ou sem permissão.';
      } else if (xhr.status === 404) {
        msg = 'Endpoint não encontrado. Verifique a URL da API.';
      }
      showStatus(false, msg);
    })
    .always(function() {
      $('#btnValidar').prop('disabled', false).html('<i class="fluigicon fluigicon-check"></i> Validar Chave');
    });
  }

  $(document).ready(function() {
    $('#btnValidar').on('click', validarEListarModelos);
  });
})();
</script>
</body>
</html>
```

---

## CORS (Importante)

Chamadas diretas do navegador para `https://generativelanguage.googleapis.com` podem falhar por **CORS**. Se ocorrer, use um Dataset no Fluig que chame a API no servidor.

## Campos para salvar (Dataset interno)

| Campo   | Tipo   | Descrição                 |
|---------|--------|---------------------------|
| apikey  | string | Chave da API Gemini       |
| modelo  | string | Nome do modelo            |
| promptIA| string | Prompt de sistema da IA   |
