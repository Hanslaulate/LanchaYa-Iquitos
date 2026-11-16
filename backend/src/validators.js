const tipos = ['lancha', 'rapido', 'deslizador'];
const estados = ['programada', 'abordando', 'zarpó', 'cancelada'];
function validarSalida(b, nuevo = false) {
 if (!b || typeof b !== 'object' || Array.isArray(b)) return 'El cuerpo debe ser un objeto';
 for (const k of ['empresa','embarcacion','destino','puerto','fechaHora'])
  if (typeof b[k] !== 'string' || !b[k].trim()) return `El campo ${k} es obligatorio`;
 if (!tipos.includes(b.tipo)) return 'Tipo de embarcación no válido';
 if (!Number.isFinite(b.precio) || b.precio <= 0) return 'El precio debe ser mayor que 0';
 if (!Number.isFinite(Date.parse(b.fechaHora))) return 'La fechaHora no es válida';
 if (nuevo && new Date(b.fechaHora) < new Date()) return 'La fechaHora no puede estar en el pasado';
 if (!Number.isFinite(b.duracionHoras) || b.duracionHoras <= 0) return 'La duración debe ser mayor que 0';
 if (!Number.isInteger(b.cupos) || b.cupos < 0) return 'Los cupos deben ser un entero igual o mayor que 0';
 return null;
}
function validarEmpresa(b) {
 if (!b || !String(b.razonSocial || '').trim() || !/^\d{11}$/.test(String(b.ruc || '')) ||
     !String(b.telefono || '').trim() || !String(b.puertoBase || '').trim())
  return 'Completa razón social, RUC de 11 dígitos, teléfono y puerto base';
 return null;
}
module.exports = { validarSalida, validarEmpresa, estados };
