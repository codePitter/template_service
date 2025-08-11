Template para Servicios de Estética/Barbería

<!-- ========================= BACKEND (copiar/pegar en Google Apps Script) =========================
      1) Ir a https://script.google.com/  > Nuevo proyecto > pegar este código > Servicios: Calendar activado por defecto.
      2) Publicar > Implementar como aplicación web > "Cualquiera con el enlace" > Copiar URL y pegarla en GOOGLE_APPS_SCRIPT_URL arriba.
      3) El script corre con tu cuenta y crea eventos en tu Calendar por defecto.

      // Código Google Apps Script (Calendar)
      function doPost(e){
        try{
          var data = JSON.parse(e.postData.contents);
          var tz = data.timezone || 'America/Argentina/Cordoba';
          var startString = data.date + 'T' + data.time + ':00';
          var start = new Date(startString);
          var end = new Date(start.getTime() + (Number(data.durationMinutes)||60)*60000);
          var title = (data.service||'Turno') + ' – ' + (data.name||'Cliente');
          var desc = 'Cliente: ' + (data.name||'') + '
    Tel: ' + (data.phone||'') + '
    Comentarios: ' + (data.comments||'');
          var options = { description: desc, location: data.location||'', guests: [], sendInvites: false};
          var evt = CalendarApp.getDefaultCalendar().createEvent(title, start, end, options);
          return ContentService.createTextOutput(JSON.stringify({ok:true, eventId: evt.getId()}))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader('Access-Control-Allow-Origin','*');
        }catch(err){
          return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader('Access-Control-Allow-Origin','*');
        }
      }

      function doGet(){
        return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT).setHeader('Access-Control-Allow-Origin','*');
      }
      ================================================================================================ -->