function extraerCuotasFuturasVisa() {
  extraerCuotasFuturasDesdeHoja('Mov_facturados_Visa', 'Cuotas_futuras_Visa');
}

function extraerCuotasFuturasMastercard() {
  extraerCuotasFuturasDesdeHoja('Mov_facturados_Mastercard', 'Cuotas_futuras_Mastercard');
}

function extraerCuotasFuturasDesdeHoja(nombreHojaOrigen, nombreHojaDestino) {
  const sheetId = '1mH2RX-Tr1dohooJOsy2cxtN7BpP0AvDq0pt8jkBD0OQ';
  const ss = SpreadsheetApp.openById(sheetId);
  const hojaOrigen = ss.getSheetByName(nombreHojaOrigen);
  const sheetCuotas = ss.getSheetByName(nombreHojaDestino);

  if (!hojaOrigen || !sheetCuotas) {
    Logger.log(`⚠️ No se encontró una de las hojas: ${nombreHojaOrigen} o ${nombreHojaDestino}`);
    return;
  }

  const data = hojaOrigen.getRange(2, 1, hojaOrigen.getLastRow() - 1, hojaOrigen.getLastColumn()).getValues();
  const hoy = new Date();
  const cuotasFuturas = [];

  Logger.log(`📄 Procesando ${data.length} filas de la hoja ${nombreHojaOrigen}`);

  data.forEach((fila, i) => {
    const fechaCompra = fila[1]; // Columna B
    const cuotasStr = fila[3];   // Columna D
    const montoCuota = fila[4];  // Columna E
    const descripcion = fila[2]; // Columna C

    if (!fechaCompra || !cuotasStr || typeof cuotasStr !== 'string' || !cuotasStr.includes('/')) {
      return;
    }

    const [cuotaActualStr, cuotaTotalStr] = cuotasStr.split('/');
    const cuotaPagada = parseInt(cuotaActualStr, 10);
    const totalCuotas = parseInt(cuotaTotalStr, 10);

    if (isNaN(cuotaPagada) || isNaN(totalCuotas) || totalCuotas <= 1 || cuotaPagada >= totalCuotas) {
      return;
    }

    // 🧠 Calcular fecha base (inicio de la primera cuota) considerando el día 22 como corte
    const fechaBase = new Date(fechaCompra);
    if (fechaBase.getDate() > 22) {
      fechaBase.setMonth(fechaBase.getMonth() + 1);
    }
    fechaBase.setDate(22);

    for (let n = cuotaPagada + 1; n <= totalCuotas; n++) {
      const fechaCuota = new Date(fechaBase.getTime());
      fechaCuota.setMonth(fechaBase.getMonth() + (n - 1));

      if (fechaCuota > hoy) {
        const mes = fechaCuota.getMonth() + 1; // Enero=1, ... Diciembre=12
        const anio = fechaCuota.getFullYear();

        cuotasFuturas.push([
          fechaCuota,                      // Col A
          `${n}/${totalCuotas}`,           // Col B
          montoCuota,                      // Col C
          descripcion,                     // Col D
          nombreHojaOrigen.includes("Visa") ? "Visa" : "Mastercard", // Col E
          mes,                             // Col F (Mes numérico)
          anio                             // Col G (Año)
        ]);
      }
    }
  });

  // Limpiar hoja destino
  if (sheetCuotas.getLastRow() > 1) {
    sheetCuotas.getRange(2, 1, sheetCuotas.getLastRow() - 1, sheetCuotas.getLastColumn()).clearContent();
  }

  if (cuotasFuturas.length > 0) {
    sheetCuotas.getRange(2, 1, cuotasFuturas.length, 7).setValues(cuotasFuturas);
    Logger.log(`✅ Se registraron ${cuotasFuturas.length} cuotas futuras en ${nombreHojaDestino}.`);
  } else {
    Logger.log("⚠️ No se encontraron cuotas válidas para procesar.");
  }
}
