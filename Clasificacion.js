function classifyCC_(descriptionLower) {
  if (descriptionLower.includes("traspaso a:carlos prieto")) return "Familia";
  if (descriptionLower.includes("traspaso a:esther aguirre")) return "Familia";
  if (descriptionLower.includes("traspaso a:gonzalo sanchez escoba")) return "Arriendo";
  if (descriptionLower.includes("traspaso a:fintual administradora")) return "Fintech";
  if (descriptionLower.includes("traspaso a:soyfocus administradora")) return "Fintech";
  if (descriptionLower.includes("traspaso a:orionx")) return "Fintech";
  if (descriptionLower.includes("traspaso a:racional")) return "Fintech";
  if (descriptionLower.includes("traspaso a")) return "Transferencia out";
  if (descriptionLower.includes("traspaso de:promotora y gestora me")) return "Sueldo";
  if (descriptionLower.includes("traspaso de")) return "Transferencia in";
  if (descriptionLower.includes("abono")) return "Transferencia in";
  if (descriptionLower.includes("giro cajero automatico")) return "Giro";
  if (descriptionLower.includes("pago:comunidad feliz")) return "Gastos Comunes";
  if (descriptionLower.includes("pago tarjeta de credito")) return "Pago TC";
  if (descriptionLower.includes("cargo por pago tc")) return "Pago TC";
  if (descriptionLower.includes("pago prestamo")) return "Pago préstamo";
  if (descriptionLower.includes("pago:")) return "Pago";
  if (descriptionLower.includes("abono por recaudacion servicios")) return "Abono servicios";
  if (descriptionLower.includes("abonos por creditos m/n")) return "Pago préstamo";
  if (descriptionLower.includes("pago de creditos m/n")) return "Pago préstamo";
  if (descriptionLower.includes("comision admin. mensual plan cuent")) return "Comisión";
  if (descriptionLower.includes("comision compras en el exterior")) return "Comisión exterior";
  if (descriptionLower.includes("intereses linea de credito")) return "Intereses LC";
  if (descriptionLower.includes("impuesto linea de credito")) return "Intereses LC";
  if (descriptionLower.includes("prima seguro desgravamen")) return "Seguro";
  if (descriptionLower.includes("transferencia desde linea de credi")) return "Pago LC in";
  if (descriptionLower.includes("pago linea de cred")) return "Pago LC out";
  if (descriptionLower.includes("pago en servipag.com")) return "Cuentas";
  if (descriptionLower.includes("regularizacion de seguro")) return "Regularización de seguro";
  if (descriptionLower.includes("saldo")) return "Saldo";
  return "Otros por revisar";
}

const CARD_CLASSIFICATION_MAP_STANDARD_ = {
  "uber": "Transporte",
  "didi": "Transporte",

  "sta isabel": "Supermercados y Tiendas de Comestibles",
  "olivo market": "Supermercados y Tiendas de Comestibles",
  "merk2 express": "Supermercados y Tiendas de Comestibles",
  "unimarc": "Supermercados y Tiendas de Comestibles",
  "tottus": "Supermercados y Tiendas de Comestibles",
  "er ferias": "Supermercados y Tiendas de Comestibles",
  "chavreys market": "Supermercados y Tiendas de Comestibles",
  "minimarket": "Supermercados y Tiendas de Comestibles",
  "botilleria": "Supermercados y Tiendas de Comestibles",

  "cafeteria": "Comida y Bebida",
  "galpon italia": "Comida y Bebida",
  "san camilo": "Comida y Bebida",
  "la cosecha": "Comida y Bebida",
  "ok market": "Comida y Bebida",
  "la pica del cronica": "Comida y Bebida",
  "krossbar": "Comida y Bebida",

  "google play": "Entretenimiento y Ocio",
  "cinepolis": "Entretenimiento y Ocio",
  "ticketmaster": "Entretenimiento y Ocio",

  "merpago": "Compras en Línea",
  "mercadopago": "Compras en Línea",
  "mercado lib": "Compras en Línea",

  "instituto psiquiat": "Salud",

  "gimnasios chile": "Gimnasios y Deporte",

  "impuesto": "Impuestos y Comisiones",
  "comision mensual": "Impuestos y Comisiones",
  "intereses rotativos": "Impuestos y Comisiones",
  "traspaso deuda": "Impuestos y Comisiones",

  "la polar": "Retail",
  "falabella": "Retail",
  "saxol mall vivo": "Retail",
  "easy internet": "Retail"
};

const CARD_CLASSIFICATION_MAP_EXTENDED_ = {
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
  "administradora": "Impuestos, Servicios y Comisiones",
  "tasa int": "Impuestos, Servicios y Comisiones",
  "intereses rotativos": "Impuestos, Servicios y Comisiones",
  "traspaso deuda": "Impuestos, Servicios y Comisiones",
  "vtr": "Impuestos, Servicios y Comisiones",
  "imp.": "Impuestos, Servicios y Comisiones",
  "impuestos": "Impuestos, Servicios y Comisiones",
  "comisión": "Impuestos, Servicios y Comisiones",
  "mantención": "Impuestos, Servicios y Comisiones"
};

function classifyCardDescription_(description, options) {
  const raw = (description || '').toString().toLowerCase();
  const useExtendedMap = options && options.extended;
  const map = useExtendedMap ? CARD_CLASSIFICATION_MAP_EXTENDED_ : CARD_CLASSIFICATION_MAP_STANDARD_;

  for (const key in map) {
    if (raw.includes(key)) return map[key];
  }

  return 'Otros por revisar';
}
