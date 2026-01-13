function processAllOldInvoices() {
  const ui = SpreadsheetApp.getUi();
  
  // Mostrar un mensaje de "Cargando" al usuario utilizando el archivo HTML
  const htmlOutput = HtmlService.createHtmlOutputFromFile('Cargando')
    .setWidth(200)
    .setHeight(100);
  
  // Mostrar la ventana de "Cargando"
  ui.showModalDialog(htmlOutput, 'Por favor espere');

  try {
    // ID de la carpeta que contiene los archivos de facturación antiguos
    const folderId = '1q6xnHnAt6vngYFGo-IngB1hMx43t4cEm';
    const folder = DriveApp.getFolderById(folderId);

    // ID del archivo de Google Sheets "Finanzas 2"
    const sheetId = '1mH2RX-Tr1dohooJOsy2cxtN7BpP0AvDq0pt8jkBD0OQ';
    const sheet = SpreadsheetApp.openById(sheetId);
    const movFacturadosSheet = sheet.getSheetByName('Mov_facturados_historicos');

    // Borrar todo el contenido desde la fila 2 en adelante en la hoja "Mov_facturados_historicos"
    const lastRow = movFacturadosSheet.getLastRow();
    if (lastRow > 1) {
      movFacturadosSheet.getRange(2, 1, lastRow - 1, movFacturadosSheet.getLastColumn()).clearContent();
    }

    // Obtener todos los archivos en la carpeta
    const files = folder.getFiles();

    let allData = [];  // Array para almacenar todos los datos antes de pegarlos

    // Procesar cada archivo en la carpeta
    while (files.hasNext()) {
      const file = files.next();
      const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

      // Obtener la fecha desde la celda J15
      let billingDate = tempSheet.getRange("J15").getValue();
      let month;

      // Convertir la fecha si es una cadena de texto
      if (typeof billingDate === 'string') {
        billingDate = new Date(billingDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
      }

      if (billingDate instanceof Date && !isNaN(billingDate)) {
        month = ("0" + (billingDate.getMonth() + 1)).slice(-2); // Obtener el mes como 'mm'
      } else {
        Logger.log('La fecha en J15 no es válida.');
        continue;  // Saltar al siguiente archivo si la fecha no es válida
      }

      // Obtener los datos desde la fila 19 y columnas necesarias, manejando las combinaciones
      const dataRange = tempSheet.getRange("B19:K" + tempSheet.getLastRow()).getValues(); // Leer desde columna B hasta K

      // Expresión regular para verificar el formato de fecha "xx/xx/xxxx"
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

      for (let i = 0; i < dataRange.length; i++) {
        const categoria = dataRange[i][0];  // Categoría en columna B
        const dateValue = dataRange[i][1];  // Fecha en columna C
        const cuotas = dataRange[i][5];  // Cuotas en columna G

        // Verificar si la columna C contiene una fecha válida antes de proceder
        if (!datePattern.test(dateValue)) continue;

        // Eliminar filas con "00/xx" en "Cuotas"
        if (cuotas.startsWith("00")) continue;

        const dateParts = dateValue.split('/'); // Separar la fecha en partes
        const day = dateParts[0];
        const year = dateParts[2];  // Extraer el año

        const description = dataRange[i][2];  // Descripción (columnas D, E y F combinadas)

        // Clasificar la descripción en una categoría
        const classification = classifyDescription(description);

        // Cambiar el monto a 0 si la descripción contiene "Pago Pesos TEF"
        let monto;
        if (description.includes("Pago Pesos TEF")) {
          monto = 0;
        } else {
          // Monto en columnas H, I, J y K combinadas
          monto = dataRange[i][6] || dataRange[i][7] || dataRange[i][8] || dataRange[i][9];
          if (typeof monto === 'string') {
            monto = monto.replace(/\./g, '').replace(',', '.');  // Convertir a número si es string
            monto = parseFloat(monto);  // Convertir a número
          } else if (typeof monto !== 'number') {
            monto = 0;  // Si el monto no es un número válido, asignar 0
          }
        }

        // Determinar el tipo de pago
        let pagoType = (cuotas === "01/01") ? "simple" : "cuotas";

        const tipo = "Facturado";  // Tipo de transacción

        // Construir la fila completa para agregarla a allData, incluyendo la clasificación y el tipo de pago
        allData.push([categoria, dateValue, description, cuotas, monto, month, year, classification, pagoType]);
      }
    }

    // Pegar todos los datos en la hoja "Mov_facturados_historicos" de una sola vez
    if (allData.length > 0) {
      movFacturadosSheet.getRange(movFacturadosSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData);
    }

    Logger.log('Todos los movimientos facturados antiguos procesados correctamente.');
    
  } catch (e) {
    ui.alert('Error durante la ejecución: ' + e.message);
  } finally {
    // Cerrar el mensaje de "Cargando" al terminar
    const closeDialogScript = '<script>google.script.host.close();</script>';
    const closeDialogOutput = HtmlService.createHtmlOutput(closeDialogScript);
    SpreadsheetApp.getUi().showModalDialog(closeDialogOutput, 'Cerrando');
  }
}
function classifyDescription(description) {
  description = description.toLowerCase(); // Convertir a minúsculas
  
  const classificationMap = {
    // Transporte
    "uber": "Transporte",
    "didi": "Transporte",
    "cabify": "Transporte",
    "copec": "Transporte",
    "petrobras": "Transporte",
    "shell": "Transporte",
    "pronto copec": "Transporte",
    "central parking": "Transporte",
    "tempo rent": "Transporte",
    "recorrido": "Transporte",
    "transvip": "Transporte",
    "sky airlines": "Transporte",
    "latam.com": "Transporte",
    "aeropuerto": "Transporte",
    "travel": "Transporte",

    // Supermercados y Tiendas de Comestibles
    "sta isabel": "Supermercados y Tiendas de Comestibles",
    "unimarc": "Supermercados y Tiendas de Comestibles",
    "tottus": "Supermercados y Tiendas de Comestibles",
    "jumbo": "Supermercados y Tiendas de Comestibles",
    "lider": "Supermercados y Tiendas de Comestibles",
    "minimarket": "Supermercados y Tiendas de Comestibles",
    "mercado": "Supermercados y Tiendas de Comestibles",
    "maxik": "Supermercados y Tiendas de Comestibles",
    "botilleria": "Supermercados y Tiendas de Comestibles",
    "olivo market": "Supermercados y Tiendas de Comestibles",
    "merk2 express": "Supermercados y Tiendas de Comestibles",
    "multimart": "Supermercados y Tiendas de Comestibles",
    "caco market": "Supermercados y Tiendas de Comestibles",
    "express": "Supermercados y Tiendas de Comestibles",
    "colapez": "Supermercados y Tiendas de Comestibles",
    "masquepan": "Supermercados y Tiendas de Comestibles",
    "panaderia": "Supermercados y Tiendas de Comestibles",
    "panificadora": "Supermercados y Tiendas de Comestibles",

    // Comida y Bebida
    "cafeteria": "Comida y Bebida",
    "san camilo": "Comida y Bebida",
    "la cosecha": "Comida y Bebida",
    "ok market": "Comida y Bebida",
    "la pica del cronica": "Comida y Bebida",
    "krossbar": "Comida y Bebida",
    "mc donalds": "Comida y Bebida",
    "subway": "Comida y Bebida",
    "melt pizzas": "Comida y Bebida",
    "restobar": "Comida y Bebida",
    "comida rapida": "Comida y Bebida",
    "niu sushi": "Comida y Bebida",
    "pizzas y pastas": "Comida y Bebida",
    "el inka": "Comida y Bebida",
    "pollo barra": "Comida y Bebida",
    "restaurant": "Comida y Bebida",
    "bar": "Comida y Bebida",
    "cafe": "Comida y Bebida",
    "gelato": "Comida y Bebida",
    "heladeria": "Comida y Bebida",
    "la casa de los ques": "Comida y Bebida",
    "maria tabacos": "Comida y Bebida",
    "el sol market & liq": "Comida y Bebida",
    "belinda": "Comida y Bebida",
    "delicias": "Comida y Bebida",
    "colapez restaurant": "Comida y Bebida",
    "haulmer*veter": "Comida y Bebida",
    "panaderia el trigal": "Comida y Bebida",
    "la perla del pacifi": "Comida y Bebida",
    "la nacional": "Comida y Bebida",
    "la embajada": "Comida y Bebida",
    "express stgo": "Comida y Bebida",
    "empanada": "Comida y Bebida",
    "cafe irulla": "Comida y Bebida",
    "pizzas": "Comida y Bebida",
    "pollo": "Comida y Bebida",
    "papa john's": "Comida y Bebida",

    // Salud
    "meds": "Salud",
    "clinica": "Salud",
    "farmacia": "Salud",
    "optica": "Salud",
    "veterinaria": "Salud",
    "instituto psiquiatr": "Salud",
    "haulmer*veter": "Salud",
    "c. med. veter": "Salud",
    "optica moderna": "Salud",
    "farmacias meddica": "Salud",
    "farm.ahumada": "Salud",
    "vivero karun": "Salud",
    "registro civil": "Salud",
    "meds isabel la cato": "Salud",
    "sumup * raul andres": "Salud",

    // Entretenimiento y Ocio
    "google play": "Entretenimiento y Ocio",
    "youtube": "Entretenimiento y Ocio",
    "cinepolis": "Entretenimiento y Ocio",
    "ticketek": "Entretenimiento y Ocio",
    "club de jazz": "Entretenimiento y Ocio",
    "portaldisc": "Entretenimiento y Ocio",
    "geminis": "Entretenimiento y Ocio",
    "cine": "Entretenimiento y Ocio",
    "ticketmaster": "Entretenimiento y Ocio",
    "teatro": "Entretenimiento y Ocio",
    "playa": "Entretenimiento y Ocio",
    "restaurante tierra": "Entretenimiento y Ocio",
    "aparthotel": "Entretenimiento y Ocio",
    "flow": "Entretenimiento y Ocio",

    // Compras en Línea
    "mercadopago": "Compras en Línea",
    "merpago": "Compras en Línea",
    "sumup": "Compras en Línea",
    "home shopping": "Compras en Línea",
    "rappi": "Compras en Línea",
    "pedidosya": "Compras en Línea",
    "payu": "Compras en Línea",
    "paypal": "Compras en Línea",
    "flow": "Compras en Línea",
    "pk *payku": "Compras en Línea",
    "kushki": "Compras en Línea",

    // Retail y Comercio
    "la polar": "Retail y Comercio",
    "falabella": "Retail y Comercio",
    "saxol mall vivo": "Retail y Comercio",
    "easy": "Retail y Comercio",
    "corona": "Retail y Comercio",
    "hites": "Retail y Comercio",
    "casa ideas": "Retail y Comercio",
    "libreria": "Retail y Comercio",
    "comercial": "Retail y Comercio",
    "zara": "Retail y Comercio",
    "inversiones": "Retail y Comercio",
    "mall": "Retail y Comercio",
    "apart hotel": "Retail y Comercio",
    "emporio": "Retail y Comercio",
    "boutique": "Retail y Comercio",
    "elizabeth": "Retail y Comercio",
    "mundo": "Retail y Comercio",
    "vivero": "Retail y Comercio",

    // Impuestos, Servicios y Comisiones
    "impuesto": "Impuestos, Servicios y Comisiones",
    "comision": "Impuestos, Servicios y Comisiones",
    "intereses": "Impuestos, Servicios y Comisiones",
    "saba": "Impuestos, Servicios y Comisiones",
    "registro civil": "Impuestos, Servicios y Comisiones",
    "administradora": "Impuestos, Servicios y Comisiones",
    "tasa int": "Impuestos, Servicios y Comisiones",
    "intereses rotativos": "Impuestos, Servicios y Comisiones",
    "traspaso deuda": "Impuestos, Servicios y Comisiones",
    "vtr": "Impuestos, Servicios y Comisiones",
    "imp.": "Impuestos, Servicios y Comisiones",
    "impuestos": "Impuestos, Servicios y Comisiones",
    "comisión": "Impuestos, Servicios y Comisiones",
    "mantención": "Impuestos, Servicios y Comisiones",

    // Otros
    // Si no coincide con ninguna categoría, devolver "Otros"
  };

  for (const key in classificationMap) {
    if (description.includes(key)) {
      return classificationMap[key];
    }
  }

  return "Otros"; // Clasificación por defecto
}
