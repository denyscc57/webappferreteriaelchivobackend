-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS ferreteriaelchivo;
USE ferreteriaelchivo;

-- Tabla proveedor (corregida)
CREATE TABLE proveedor (
  pr_id int(11) NOT NULL AUTO_INCREMENT,
  pr_nombres varchar(500) NOT NULL,
  pr_apellidos varchar(500) NOT NULL,
  pr_identificacion bigint(20) NOT NULL,
  pr_email varchar(500) DEFAULT NULL,
  pr_ciudad varchar(200) DEFAULT NULL,
  pr_direccion text DEFAULT NULL,
  pr_celular bigint(20) DEFAULT NULL,
  pr_tipo int(11) DEFAULT 1,
  pr_contrasena varchar(100) DEFAULT NULL,
  pr_activo tinyint(1) DEFAULT 1,
  pr_fecha_registro timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (pr_id),
  UNIQUE KEY pr_identificacion (pr_identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla cliente (corregida)
CREATE TABLE cliente (
  c_id int(11) NOT NULL AUTO_INCREMENT,
  c_nombres varchar(500) NOT NULL,
  c_apellidos varchar(500) NOT NULL,
  c_identificacion bigint(20) NOT NULL,
  c_email varchar(500) DEFAULT NULL,
  c_ciudad varchar(200) DEFAULT NULL,
  c_direccion text DEFAULT NULL,
  c_celular bigint(20) DEFAULT NULL,
  c_tipo int(11) DEFAULT 1,
  c_contrasena varchar(100) DEFAULT NULL,
  c_activo tinyint(1) DEFAULT 1,
  c_fecha_registro timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (c_id),
  UNIQUE KEY c_identificacion (c_identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla lote (corregida)
CREATE TABLE lote (
  l_id int(11) NOT NULL AUTO_INCREMENT,
  l_codigo varchar(500) NOT NULL,
  l_nombre varchar(500) NOT NULL,
  l_descripcion varchar(500) NOT NULL,
  l_fecha_registro timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (l_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla unidad medida
CREATE TABLE unidadmedida (
  m_id int(11) NOT NULL AUTO_INCREMENT,
  m_unidad varchar(500) NOT NULL,
  m_fecha_registro timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (m_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla producto (corregida con foreign keys)
CREATE TABLE producto (
  p_id int(11) NOT NULL AUTO_INCREMENT,
  p_codigo varchar(10) NOT NULL,
  p_nombre varchar(500) NOT NULL,
  p_categoria varchar(200) NOT NULL,
  p_loteFK int(11) NOT NULL,
  p_marca varchar(200) NOT NULL,
  p_precio decimal(10,2) NOT NULL,
  p_stock decimal(10,2) NOT NULL,
  p_fecha_vencimiento date NOT NULL,
  p_proveedorFK int(11) NOT NULL,
  p_unidadmedidaFK int(11) NOT NULL,
  PRIMARY KEY (p_id),
  FOREIGN KEY (p_loteFK) REFERENCES lote(l_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (p_proveedorFK) REFERENCES proveedor(pr_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (p_unidadmedidaFK) REFERENCES unidadmedida(m_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla usuario (corregida)
CREATE TABLE usuario (
  u_id int(11) NOT NULL AUTO_INCREMENT,
  u_nombres varchar(500) NOT NULL,
  u_apellidos varchar(500) NOT NULL,
  u_identificacion bigint(20) NOT NULL,
  u_email varchar(500) NOT NULL,
  u_ciudad varchar(200) DEFAULT NULL,
  u_direccion text DEFAULT NULL,
  u_celular bigint(20) DEFAULT NULL,
  u_tipo int(11) NOT NULL DEFAULT 3,
  u_contrasena varchar(100) NOT NULL,
  u_activo tinyint(1) DEFAULT 1,
  u_fecha_creacion timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (u_id),
  UNIQUE KEY u_identificacion (u_identificacion),
  UNIQUE KEY u_email (u_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla caja (nueva tabla solicitada)
CREATE TABLE caja (
  ca_id int(11) NOT NULL AUTO_INCREMENT,
  ca_fecha_apertura datetime NOT NULL,
  ca_fecha_cierre datetime DEFAULT NULL,
  ca_monto_inicial decimal(10,2) NOT NULL,
  ca_monto_final decimal(10,2) DEFAULT NULL,
  ca_estado enum('abierta','cerrada') DEFAULT 'abierta',
  ca_usuarioFK int(11) NOT NULL,
  PRIMARY KEY (ca_id),
  FOREIGN KEY (ca_usuarioFK) REFERENCES usuario(u_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla inventario (corregida)
CREATE TABLE inventario (
  i_id int(11) NOT NULL AUTO_INCREMENT,
  i_idproductofk int(11) NOT NULL,
  i_tipo_movimiento varchar(20) NOT NULL,
  i_cantidad int(11) NOT NULL,
  i_motivo varchar(20) NOT NULL,
  i_idusuariofk int(11) NOT NULL,
  i_fecha date NOT NULL,
  i_hora time NOT NULL,
  PRIMARY KEY (i_id),
  FOREIGN KEY (i_idproductofk) REFERENCES producto(p_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (i_idusuariofk) REFERENCES usuario(u_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla venta (modificada para incluir referencia a caja)
CREATE TABLE venta (
  v_id int(11) NOT NULL AUTO_INCREMENT,
  v_factura varchar(500) NOT NULL,
  v_nombre varchar(500) NOT NULL,
  v_marca varchar(500) NOT NULL,
  v_precio decimal(10,2) NOT NULL,
  v_cantidad decimal(10,2) NOT NULL,
  v_total decimal(10,2) NOT NULL,
  v_fkidcliente int(11) NOT NULL,
  v_fkidusuario int(11) NOT NULL,
  v_identificacion bigint(20) NOT NULL,
  v_nombresapellidos varchar(500) NOT NULL,
  v_ciudad varchar(300) NOT NULL,
  v_direccion varchar(500) NOT NULL,
  v_celular bigint(20) NOT NULL,
  v_fecha date NOT NULL,
  v_hora time NOT NULL,
  v_cajaFK int(11) NOT NULL,
  PRIMARY KEY (v_id),
  FOREIGN KEY (v_fkidcliente) REFERENCES cliente(c_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (v_fkidusuario) REFERENCES usuario(u_id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (v_cajaFK) REFERENCES caja(ca_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar unidades de medida para ferretería
INSERT INTO unidadmedida (m_unidad) VALUES 
('Unidad'),
('Pulgada'),
('Centímetro'),
('Metro'),
('Pulgada cuadrada'),
('Centímetro cuadrado'),
('Metro cuadrado'),
('Pulgada cúbica'),
('Centímetro cúbico'),
('Metro cúbico'),
('Galón'),
('Litro'),
('Mililitro'),
('Kilogramo'),
('Gramo'),
('Libra'),
('Onza'),
('Caja'),
('Paquete'),
('Rollo'),
('Juego'),
('Par');

-- Insertar 5 lotes
INSERT INTO lote (l_codigo, l_nombre, l_descripcion) VALUES
('LOTE-001', 'Lote Principal', 'Lote principal de productos de ferretería'),
('LOTE-002', 'Lote Herramientas', 'Lote especializado en herramientas manuales'),
('LOTE-003', 'Lote Eléctricos', 'Lote de herramientas eléctricas'),
('LOTE-004', 'Lote Pinturas', 'Lote de pinturas y accesorios'),
('LOTE-005', 'Lote Materiales', 'Lote de materiales de construcción');

-- Insertar 10 proveedores de Guatemala
INSERT INTO proveedor (pr_nombres, pr_apellidos, pr_identificacion, pr_email, pr_ciudad, pr_direccion, pr_celular) VALUES
('Carlos', 'Méndez García', 1234567890101, 'carlos@proveedor.com', 'Ciudad de Guatemala', 'Zona 1, 5a avenida 8-45', 51234567),
('María', 'López Hernández', 2345678901012, 'maria@ferreteriagt.com', 'Quetzaltenango', '12 calle 5-32, Zona 3', 52345678),
('Juan', 'Ramírez Castillo', 3456789010123, 'juan@construcciongt.com', 'Antigua Guatemala', '4a calle oriente #15', 53456789),
('Ana', 'García Morales', 4567890101234, 'ana@materialesgt.com', 'Escuintla', '8a avenida 2-45, Zona 1', 54567890),
('Pedro', 'Hernández Pérez', 5678901012345, 'pedro@herramientasgt.com', 'Chimaltenango', '3a calle 7-21, Zona 2', 55678901),
('Sofia', 'Martínez Gómez', 6789010123456, 'sofia@electricosgt.com', 'Huehuetenango', '5a avenida 4-67, Zona 4', 56789012),
('Luis', 'Díaz Rodríguez', 7890101234567, 'luis@pinturasgt.com', 'Sacatepéquez', '6a calle 3-89, Zona 1', 57890123),
('Carmen', 'Torres Vásquez', 8901012345678, 'carmen@suministrosgt.com', 'Petén', '7a avenida 8-12, Zona 2', 58901234),
('Jorge', 'Sánchez Cruz', 9010123456789, 'jorge@ferreteriapro.com', 'Izabal', '9a calle 6-34, Zona 3', 59012345),
('Rosa', 'Flores Mendoza', 1012345678901, 'rosa@materialespro.com', 'Retalhuleu', '10a avenida 7-56, Zona 1', 50123456);

-- Insertar usuarios
INSERT INTO usuario (u_nombres, u_apellidos, u_identificacion, u_email, u_ciudad, u_direccion, u_celular, u_tipo, u_contrasena) VALUES
('Dennys Yobani', 'Cuc Cosigua', 1234567890101, 'dennys@email.com', 'Ciudad de Guatemala', 'Zona 1, 5a avenida 8-45', 51234567, 1, '827ccb0eea8a706c4c34a16891f84e7b'),
('Ana', 'López Hernández', 2345678901012, 'ana@email.com', 'Quetzaltenango', '12 calle 5-32, Zona 3', 52345678, 2, '827ccb0eea8a706c4c34a16891f84e7b'),
('Miguel', 'Ramírez Castillo', 3456789010123, 'miguel.ramirez@email.com', 'Antigua Guatemala', '4a calle oriente #15', 53456789, 2, '827ccb0eea8a706c4c34a16891f84e7b'),
('Sofia', 'García Morales', 4567890101234, 'sofia@email.com', 'Escuintla', '8a avenida 2-45, Zona 1', 54567890, 3, '827ccb0eea8a706c4c34a16891f84e7b'),
('Luis', 'Hernández Pérez', 5678901012345, 'luis@email.com', 'Chimaltenango', '3a calle 7-21, Zona 2', 55678901, 3, '827ccb0eea8a706c4c34a16891f84e7b');

-- Insertar clientes
INSERT INTO cliente (c_nombres, c_apellidos, c_identificacion, c_email, c_ciudad, c_direccion, c_celular, c_tipo, c_contrasena) VALUES
('Juan', 'Pérez Martínez', 9876543210101, 'juan@email.com', 'Ciudad de Guatemala', 'Zona 10, 12 calle 4-56', 41234567, 1, '12345'),
('María', 'González Rodríguez', 8765432101012, 'maria@email.com', 'Quetzaltenango', '15 avenida 7-89, Zona 1', 42345678, 1, '12345'),
('Pedro', 'Santos Jiménez', 7654321010123, 'pedro@email.com', 'Antigua Guatemala', '5a calle poniente #23', 43456789, 1, '12345');

-- Insertar productos (corregidos con referencias a lote, proveedor y unidad de medida)
INSERT INTO producto (p_codigo, p_nombre, p_categoria, p_loteFK, p_marca, p_precio, p_stock, p_fecha_vencimiento, p_proveedorFK, p_unidadmedidaFK) VALUES
('H001', 'Martillo de 16 oz', 'Herramientas manuales', 2, 'Truper', 45.50, 25, '2025-12-31', 1, 1),
('H002', 'Destornillador plano 1/4"', 'Herramientas manuales', 2, 'Stanley', 18.75, 50, '2025-12-31', 2, 1),
('H003', 'Llave ajustable 10"', 'Herramientas manuales', 2, 'Irwin', 62.30, 15, '2025-12-31', 3, 1),
('H004', 'Alicate de corte diagonal 8"', 'Herramientas manuales', 2, 'Channellock', 38.90, 30, '2025-12-31', 4, 1),
('H005', 'Cinta métrica 5m', 'Herramientas de medición', 1, 'Tajima', 85.00, 20, '2025-12-31', 5, 4),
('H006', 'Nivel de burbuja 24"', 'Herramientas de medición', 1, 'Empire', 120.50, 12, '2025-12-31', 6, 1),
('H007', 'Taladro percutor 1/2"', 'Herramientas eléctricas', 3, 'Bosch', 450.00, 8, '2025-12-31', 7, 1),
('H008', 'Sierra circular 7-1/4"', 'Herramientas eléctricas', 3, 'DeWalt', 680.75, 5, '2025-12-31', 8, 1),
('H009', 'Pintura blanca mate 1 galón', 'Pinturas', 4, 'Comex', 185.25, 18, '2024-06-30', 9, 11),
('H010', 'Cemento gris 50 kg', 'Materiales de construcción', 5, 'Cemento Progreso', 65.00, 40, '2024-09-15', 10, 14);