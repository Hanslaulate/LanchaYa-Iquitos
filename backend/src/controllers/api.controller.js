const crypto = require('node:crypto');
const db = require('../db');
const { validarSalida, validarEmpresa, estados } = require('../validators');
const cols = 'id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos, empresaId, estado';
const idValido = x => Number.isInteger(Number(x)) && Number(x) > 0 ? Number(x) : null;
const error = (res, status, mensaje) => res.status(status).json({ error: true, mensaje });

function listarSalidas(req,res,next) {
 try {
  const {destino,fecha,tipo,q,precioMin,precioMax,orden='fecha',dir='asc',hoy,proximas48}=req.query;
  const where=[], vals=[];
  if(destino){where.push('LOWER(destino)=LOWER(?)');vals.push(destino)}
  if(fecha){where.push('fechaHora LIKE ?');vals.push(`${fecha}%`)}
  if(tipo){where.push('tipo=?');vals.push(tipo)}
  if(q){where.push('(LOWER(empresa) LIKE ? OR LOWER(embarcacion) LIKE ?)');const s=`%${String(q).toLowerCase().trim()}%`;vals.push(s,s)}
  if(precioMin!==undefined && precioMin!==''){where.push('precio>=?');vals.push(Number(precioMin))}
  if(precioMax!==undefined && precioMax!==''){where.push('precio<=?');vals.push(Number(precioMax))}
  if(hoy==='true') where.push("date(fechaHora)=date('now','localtime')");
  if(proximas48==='true') where.push("datetime(fechaHora)>=datetime('now','localtime') AND datetime(fechaHora)<=datetime('now','localtime','+48 hours')");
  const orderMap={fecha:'fechaHora',precio:'precio',duracion:'duracionHoras'};
  const order=orderMap[orden]||'fechaHora', direction=dir==='desc'?'DESC':'ASC';
  const clause=where.length?`WHERE ${where.join(' AND ')}`:'';
  const total=db.prepare(`SELECT COUNT(*) total FROM salidas ${clause}`).get(...vals).total;
  const paginated=req.query.page!==undefined || req.query.limit!==undefined;
  const page=Math.max(1,Number(req.query.page)||1), limit=Math.min(50,Math.max(1,Number(req.query.limit)||6));
  const rows=db.prepare(`SELECT ${cols} FROM salidas ${clause} ORDER BY ${order} ${direction} ${paginated?'LIMIT ? OFFSET ?':''}`)
   .all(...(paginated?[...vals,limit,(page-1)*limit]:vals));
  return res.json(paginated?{items:rows,total,page,limit,pages:Math.max(1,Math.ceil(total/limit))}:rows);
 } catch(e){next(e)}
}
function obtenerSalida(req,res,next){
 try{const id=idValido(req.params.id);if(!id)return error(res,404,'Salida no encontrada');
 const row=db.prepare(`SELECT ${cols} FROM salidas WHERE id=?`).get(id);
 if(!row)return error(res,404,'Salida no encontrada');
 const reservas=db.prepare('SELECT id,codigo,nombre,dni,telefono,cantidad,createdAt FROM reservas WHERE salidaId=? ORDER BY id DESC').all(id);
 return res.json({...row,reservas,cuposReservados:reservas.reduce((n,r)=>n+r.cantidad,0)});
 }catch(e){next(e)}
}
function crearSalida(req,res,next){
 try{const msg=validarSalida(req.body,true);if(msg)return error(res,400,msg);
 const b=req.body;const empresa=db.prepare('SELECT * FROM empresas WHERE id=?').get(Number(b.empresaId)||-1);
 const result=db.prepare(`INSERT INTO salidas(empresa,embarcacion,tipo,destino,puerto,fechaHora,duracionHoras,precio,cupos,empresaId,estado)
 VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(b.empresa.trim(),b.embarcacion.trim(),b.tipo,b.destino.trim(),b.puerto.trim(),b.fechaHora,b.duracionHoras,b.precio,b.cupos,empresa?empresa.id:null,'programada');
 return res.status(201).json(db.prepare(`SELECT ${cols} FROM salidas WHERE id=?`).get(result.lastInsertRowid));
 }catch(e){next(e)}
}
function actualizarSalida(req,res,next){
 try{const id=idValido(req.params.id), b=req.body;const msg=validarSalida(b,false);if(!id)return error(res,404,'Salida no encontrada');if(msg)return error(res,400,msg);
 if(!db.prepare('SELECT id FROM salidas WHERE id=?').get(id))return error(res,404,'Salida no encontrada');
 db.prepare(`UPDATE salidas SET empresa=?,embarcacion=?,tipo=?,destino=?,puerto=?,fechaHora=?,duracionHoras=?,precio=?,cupos=?,empresaId=? WHERE id=?`)
 .run(b.empresa.trim(),b.embarcacion.trim(),b.tipo,b.destino.trim(),b.puerto.trim(),b.fechaHora,b.duracionHoras,b.precio,b.cupos,Number(b.empresaId)||null,id);
 return res.json(db.prepare(`SELECT ${cols} FROM salidas WHERE id=?`).get(id));
 }catch(e){next(e)}
}
function eliminarSalida(req,res,next){try{const id=idValido(req.params.id);if(!id||!db.prepare('DELETE FROM salidas WHERE id=?').run(id).changes)return error(res,404,'Salida no encontrada');return res.status(204).end()}catch(e){next(e)}}
function listarDestinos(req,res,next){try{return res.json(db.prepare('SELECT DISTINCT destino FROM salidas ORDER BY destino').all().map(x=>x.destino))}catch(e){next(e)}}

function listarEmpresas(req,res,next){try{return res.json(db.prepare('SELECT e.*,COUNT(s.id) AS totalSalidas FROM empresas e LEFT JOIN salidas s ON s.empresaId=e.id GROUP BY e.id ORDER BY e.razonSocial').all())}catch(e){next(e)}}
function crearEmpresa(req,res,next){try{const msg=validarEmpresa(req.body);if(msg)return error(res,400,msg);const b=req.body;const r=db.prepare('INSERT INTO empresas(razonSocial,ruc,telefono,puertoBase) VALUES(?,?,?,?)').run(b.razonSocial.trim(),b.ruc,b.telefono.trim(),b.puertoBase.trim());return res.status(201).json(db.prepare('SELECT * FROM empresas WHERE id=?').get(r.lastInsertRowid))}catch(e){if(String(e.message).includes('UNIQUE'))return error(res,409,'Ya existe una empresa con ese RUC');next(e)}}
function actualizarEmpresa(req,res,next){try{const id=idValido(req.params.id),msg=validarEmpresa(req.body);if(!id)return error(res,404,'Empresa no encontrada');if(msg)return error(res,400,msg);const b=req.body;const r=db.prepare('UPDATE empresas SET razonSocial=?,ruc=?,telefono=?,puertoBase=? WHERE id=?').run(b.razonSocial.trim(),b.ruc,b.telefono.trim(),b.puertoBase.trim(),id);if(!r.changes)return error(res,404,'Empresa no encontrada');return res.json(db.prepare('SELECT * FROM empresas WHERE id=?').get(id))}catch(e){if(String(e.message).includes('UNIQUE'))return error(res,409,'Ya existe una empresa con ese RUC');next(e)}}
function eliminarEmpresa(req,res,next){try{const id=idValido(req.params.id);if(!id)return error(res,404,'Empresa no encontrada');const futuras=db.prepare("SELECT COUNT(*) total FROM salidas WHERE empresaId=? AND datetime(fechaHora)>=datetime('now','localtime')").get(id).total;if(futuras)return error(res,409,'No se puede eliminar una empresa con salidas futuras');db.prepare("UPDATE salidas SET empresaId=NULL WHERE empresaId=? AND datetime(fechaHora)<datetime('now','localtime')").run(id);
 const r=db.prepare('DELETE FROM empresas WHERE id=?').run(id);if(!r.changes)return error(res,404,'Empresa no encontrada');return res.status(204).end()}catch(e){next(e)}}
function salidasEmpresa(req,res,next){try{const id=idValido(req.params.id);if(!id)return error(res,404,'Empresa no encontrada');return res.json(db.prepare(`SELECT ${cols} FROM salidas WHERE empresaId=? ORDER BY fechaHora`).all(id))}catch(e){next(e)}}

function crearReserva(req,res,next){
 try{const salidaId=idValido(req.params.id),b=req.body||{};const salida=db.prepare(`SELECT ${cols} FROM salidas WHERE id=?`).get(salidaId);
 if(!salida)return error(res,404,'Salida no encontrada');
 if(['zarpó','cancelada'].includes(salida.estado))return error(res,409,'Esta salida ya no acepta reservas');
 if(!String(b.nombre||'').trim()||!/^\d{8}$/.test(String(b.dni||''))||!String(b.telefono||'').trim()||!Number.isInteger(b.cantidad)||b.cantidad<1)return error(res,400,'Ingresa nombre, DNI de 8 dígitos, teléfono y cantidad válida');
 if(salida.cupos<b.cantidad)return error(res,409,'No hay cupos suficientes');
 const codigo=`LY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
 db.exec('BEGIN');
 try{db.prepare('UPDATE salidas SET cupos=cupos-? WHERE id=?').run(b.cantidad,salidaId);
 const r=db.prepare('INSERT INTO reservas(salidaId,codigo,nombre,dni,telefono,cantidad) VALUES(?,?,?,?,?,?)').run(salidaId,codigo,b.nombre.trim(),b.dni,b.telefono.trim(),b.cantidad);
 db.exec('COMMIT');return res.status(201).json({id:Number(r.lastInsertRowid),codigo,nombre:b.nombre.trim(),cantidad:b.cantidad,salidaId});
 }catch(e){db.exec('ROLLBACK');throw e}
 }catch(e){next(e)}
}
function listarReservas(req,res,next){try{const id=idValido(req.params.id);return res.json(db.prepare('SELECT id,codigo,nombre,dni,telefono,cantidad,createdAt FROM reservas WHERE salidaId=? ORDER BY id DESC').all(id))}catch(e){next(e)}}
function cancelarReserva(req,res,next){try{const id=idValido(req.params.id),r=db.prepare('SELECT * FROM reservas WHERE id=?').get(id);if(!r)return error(res,404,'Reserva no encontrada');db.exec('BEGIN');try{db.prepare('UPDATE salidas SET cupos=cupos+? WHERE id=?').run(r.cantidad,r.salidaId);db.prepare('DELETE FROM reservas WHERE id=?').run(id);db.exec('COMMIT');return res.status(204).end()}catch(e){db.exec('ROLLBACK');throw e}}catch(e){next(e)}}
function consultarReserva(req,res,next){try{const r=db.prepare(`SELECT r.id,r.codigo,r.nombre,r.cantidad,r.createdAt,s.destino,s.puerto,s.fechaHora,s.empresa,s.estado FROM reservas r JOIN salidas s ON s.id=r.salidaId WHERE r.codigo=?`).get(String(req.params.codigo).toUpperCase());if(!r)return error(res,404,'No se encontró una reserva con ese código');return res.json(r)}catch(e){next(e)}}
function cambiarEstado(req,res,next){try{const id=idValido(req.params.id),estado=req.body?.estado;if(!estados.includes(estado))return error(res,400,'Estado no válido');const r=db.prepare('UPDATE salidas SET estado=? WHERE id=?').run(estado,id);if(!r.changes)return error(res,404,'Salida no encontrada');return res.json(db.prepare(`SELECT ${cols} FROM salidas WHERE id=?`).get(id))}catch(e){next(e)}}
function estadisticas(req,res,next){try{
 const destinos=db.prepare('SELECT destino,COUNT(*) total FROM salidas GROUP BY destino ORDER BY total DESC').all();
 const tipos=db.prepare('SELECT tipo,COUNT(*) total FROM salidas GROUP BY tipo ORDER BY total DESC').all();
 const reservas=db.prepare('SELECT COALESCE(SUM(cantidad),0) total FROM reservas').get().total;
 const precios=db.prepare('SELECT destino,ROUND(AVG(precio),2) promedio FROM salidas GROUP BY destino ORDER BY destino').all();
 const totalSalidas=db.prepare('SELECT COUNT(*) total FROM salidas').get().total;
 const empresas=db.prepare('SELECT COUNT(*) total FROM empresas').get().total;
 return res.json({totalSalidas,totalEmpresas,totalPasajesReservados:reservas,porDestino:destinos,porTipo:tipos,precioPromedioPorDestino:precios});
 }catch(e){next(e)}}
module.exports={listarSalidas,obtenerSalida,crearSalida,actualizarSalida,eliminarSalida,listarDestinos,listarEmpresas,crearEmpresa,actualizarEmpresa,eliminarEmpresa,salidasEmpresa,crearReserva,listarReservas,cancelarReserva,consultarReserva,cambiarEstado,estadisticas};
