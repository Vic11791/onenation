-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "onboardingCompletado" BOOLEAN NOT NULL DEFAULT false,
    "tema" TEXT NOT NULL DEFAULT 'auto',
    "vistaDensidad" TEXT NOT NULL DEFAULT 'comoda',
    "metaMes" REAL NOT NULL DEFAULT 0,
    "comision" REAL,
    "ligaAgenda" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL,
    "eliminadoEn" DATETIME
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expira" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntentoLogin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "exitoso" BOOLEAN NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ConfigNegocio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "nombre" TEXT NOT NULL DEFAULT 'ONE NATION TAX AND DOCUMENT SERVICES LLC',
    "logo" TEXT,
    "colorMarca" TEXT NOT NULL DEFAULT '#e05a5a',
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "simboloMoneda" TEXT NOT NULL DEFAULT '$',
    "husoHorario" TEXT NOT NULL DEFAULT 'America/Phoenix',
    "horarioInicio" INTEGER NOT NULL DEFAULT 10,
    "horarioFin" INTEGER NOT NULL DEFAULT 18,
    "duracionCita" INTEGER NOT NULL DEFAULT 60,
    "metaMes" REAL NOT NULL DEFAULT 15,
    "mensajeWhatsapp" TEXT NOT NULL DEFAULT 'Hola {nombre}, gracias por tu interés. ¿Te gustaría si agendamos una llamada para platicarte cómo te puedo ayudar?',
    "comisionGlobal" REAL NOT NULL DEFAULT 0,
    "umbralEstancado" INTEGER NOT NULL DEFAULT 7,
    "googleClientId" TEXT,
    "googleClientSecret" TEXT,
    "storageProvider" TEXT NOT NULL DEFAULT 'db',
    "storageConfig" TEXT,
    "metodosPago" TEXT NOT NULL DEFAULT 'Transferencia,Tarjeta,Liga de pago,Efectivo,Depósito/anticipo',
    "motivosPerdida" TEXT NOT NULL DEFAULT 'Precio,Competencia,No contestó,No era buen momento,No calificaba,Otro',
    "fechaActualizacion" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContadorFolio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "ultimo" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "giro" TEXT,
    "rfcId" TEXT,
    "sitioWeb" TEXT,
    "direccion" TEXT,
    "tamano" TEXT,
    "notas" TEXT,
    "eliminadoEn" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Etiqueta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1'
);

-- CreateTable
CREATE TABLE "ClienteEtiqueta" (
    "clienteId" TEXT NOT NULL,
    "etiquetaId" TEXT NOT NULL,

    PRIMARY KEY ("clienteId", "etiquetaId"),
    CONSTRAINT "ClienteEtiqueta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClienteEtiqueta_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "Etiqueta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "telefonoIntl" TEXT,
    "email" TEXT,
    "origen" TEXT,
    "utmSource" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'Nuevo',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "temperatura" TEXT NOT NULL DEFAULT 'TIBIO',
    "objecion" TEXT,
    "notas" TEXT,
    "proximaAccion" TEXT,
    "proximaAccionFecha" DATETIME,
    "valorEstimado" REAL NOT NULL DEFAULT 0,
    "vendedorId" TEXT,
    "empresaId" TEXT,
    "puestoEmpresa" TEXT,
    "ultimoContacto" DATETIME,
    "fechaGanado" DATETIME,
    "fechaPerdido" DATETIME,
    "motivoPerdida" TEXT,
    "fechaArchivado" DATETIME,
    "estadoPrevioArchivado" TEXT,
    "etapaPreviaArchivado" TEXT,
    "eliminadoEn" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" DATETIME NOT NULL,
    CONSTRAINT "Cliente_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interaccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEditable" DATETIME,
    "meta" TEXT,
    CONSTRAINT "Interaccion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "contenido" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminadoEn" DATETIME,
    CONSTRAINT "Nota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "titulo" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "googleEventId" TEXT,
    "googleMeetLink" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "eliminadoEn" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cita_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "monto" REAL NOT NULL,
    "metodo" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'pendiente',
    "concepto" TEXT,
    "fechaPago" DATETIME,
    "fechaVencimiento" DATETIME,
    "folio" INTEGER,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "eliminadoEn" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pago_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "pospuesto" BOOLEAN NOT NULL DEFAULT false,
    "eliminadoEn" DATETIME,
    CONSTRAINT "Recordatorio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Recordatorio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL DEFAULT 'Otro',
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "datos" TEXT,
    "url" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'db',
    "eliminadoEn" DATETIME,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Archivo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Archivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plantilla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'whatsapp',
    "etapa" TEXT,
    "objecion" TEXT,
    "esFavorita" BOOLEAN NOT NULL DEFAULT false,
    "esGlobal" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "ip" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" TEXT,
    CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VistaGuardada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "filtros" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    CONSTRAINT "VistaGuardada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadPendiente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'Landing',
    "utmSource" TEXT,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_ligaAgenda_key" ON "Usuario"("ligaAgenda");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_eliminadoEn_idx" ON "Usuario"("eliminadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_token_key" ON "Sesion"("token");

-- CreateIndex
CREATE INDEX "Sesion_token_idx" ON "Sesion"("token");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE INDEX "IntentoLogin_email_idx" ON "IntentoLogin"("email");

-- CreateIndex
CREATE INDEX "IntentoLogin_ip_idx" ON "IntentoLogin"("ip");

-- CreateIndex
CREATE INDEX "Empresa_nombre_idx" ON "Empresa"("nombre");

-- CreateIndex
CREATE INDEX "Empresa_eliminadoEn_idx" ON "Empresa"("eliminadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "Etiqueta_nombre_key" ON "Etiqueta"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE INDEX "Cliente_telefonoIntl_idx" ON "Cliente"("telefonoIntl");

-- CreateIndex
CREATE INDEX "Cliente_email_idx" ON "Cliente"("email");

-- CreateIndex
CREATE INDEX "Cliente_etapa_idx" ON "Cliente"("etapa");

-- CreateIndex
CREATE INDEX "Cliente_estado_idx" ON "Cliente"("estado");

-- CreateIndex
CREATE INDEX "Cliente_vendedorId_idx" ON "Cliente"("vendedorId");

-- CreateIndex
CREATE INDEX "Cliente_eliminadoEn_idx" ON "Cliente"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Cliente_origen_idx" ON "Cliente"("origen");

-- CreateIndex
CREATE INDEX "Cliente_temperatura_idx" ON "Cliente"("temperatura");

-- CreateIndex
CREATE INDEX "Interaccion_clienteId_idx" ON "Interaccion"("clienteId");

-- CreateIndex
CREATE INDEX "Interaccion_fecha_idx" ON "Interaccion"("fecha");

-- CreateIndex
CREATE INDEX "Nota_clienteId_idx" ON "Nota"("clienteId");

-- CreateIndex
CREATE INDEX "Nota_eliminadoEn_idx" ON "Nota"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Cita_clienteId_idx" ON "Cita"("clienteId");

-- CreateIndex
CREATE INDEX "Cita_vendedorId_idx" ON "Cita"("vendedorId");

-- CreateIndex
CREATE INDEX "Cita_inicio_idx" ON "Cita"("inicio");

-- CreateIndex
CREATE INDEX "Cita_eliminadoEn_idx" ON "Cita"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Pago_clienteId_idx" ON "Pago"("clienteId");

-- CreateIndex
CREATE INDEX "Pago_estatus_idx" ON "Pago"("estatus");

-- CreateIndex
CREATE INDEX "Pago_eliminadoEn_idx" ON "Pago"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Pago_fechaPago_idx" ON "Pago"("fechaPago");

-- CreateIndex
CREATE INDEX "Recordatorio_usuarioId_idx" ON "Recordatorio"("usuarioId");

-- CreateIndex
CREATE INDEX "Recordatorio_fecha_idx" ON "Recordatorio"("fecha");

-- CreateIndex
CREATE INDEX "Recordatorio_eliminadoEn_idx" ON "Recordatorio"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Archivo_clienteId_idx" ON "Archivo"("clienteId");

-- CreateIndex
CREATE INDEX "Archivo_eliminadoEn_idx" ON "Archivo"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Plantilla_usuarioId_idx" ON "Plantilla"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_usuarioId_idx" ON "RegistroAuditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_fecha_idx" ON "RegistroAuditoria"("fecha");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_entidad_idx" ON "RegistroAuditoria"("entidad");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_clienteId_key" ON "Favorito"("usuarioId", "clienteId");

-- CreateIndex
CREATE INDEX "VistaGuardada_usuarioId_idx" ON "VistaGuardada"("usuarioId");
