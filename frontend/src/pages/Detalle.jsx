import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {crearReserva,obtenerSalida} from '../services/api';
export default function Detalle(){
 const {id}=useParams(),[s,setS]=useState(null),[err,setErr]=useState(''),[reserva,setReserva]=useState({nombre:'',dni:'',telefono:'',cantidad:1}),[confirmada,setConfirmada]=useState(null);
 async function cargar(){try{setS(await obtenerSalida(id))}catch(e){setErr(e.message)}}
 useEffect(()=>{cargar()},[id]);
 async function reservar(e){e.preventDefault();try{const r=await crearReserva(id,{...reserva,cantidad:Number(reserva.cantidad)});setConfirmada(r);setErr('');cargar()}catch(e){setErr(e.message)}}
 if(!s)return <main className="container"><p className="status">{err||'Cargando salida...'}</p></main>;
 const fecha=new Date(s.fechaHora),minutos=Math.max(0,Math.floor((fecha-Date.now())/60000));
 const compartir=`https://wa.me/?text=${encodeURIComponent(`LanchaYa: ${s.destino}, ${fecha.toLocaleDateString('es-PE')} ${fecha.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})}, ${s.puerto}. Precio S/ ${s.precio}.`)}`;
 const totalCupos=s.cupos+(s.cuposReservados||0); const porcentaje=totalCupos?((s.cuposReservados||0)/totalCupos)*100:0;
 return <main className="container admin-page"><p><Link to="/">← Volver a salidas</Link></p><article className="detail-panel"><span className={`tag tag-${s.tipo}`}>{s.tipo}</span><span className={`status-pill estado-${s.estado}`}>{s.estado}</span><h1>{s.destino}</h1><h3>{s.empresa} · {s.embarcacion}</h3>
 <div className="details detail-grid"><div><dt>Fecha y hora</dt><dd>{fecha.toLocaleString('es-PE')}</dd></div><div><dt>Puerto</dt><dd>{s.puerto}</dd></div><div><dt>Duración</dt><dd>{s.duracionHoras} horas</dd></div><div><dt>Precio</dt><dd>S/ {Number(s.precio).toFixed(2)}</dd></div><div><dt>Cupos restantes</dt><dd>{s.cupos}</dd></div><div><dt>Tiempo restante</dt><dd>{minutos>0?`${Math.floor(minutos/60)} h ${minutos%60} min`:'Hora de salida alcanzada'}</dd></div></div>
 <p><b>Disponibilidad de cupos</b></p><div className="capacity-track"><i className={porcentaje>50?'capacity-green':porcentaje>=20?'capacity-yellow':'capacity-red'} style={{width:`${Math.max(0,Math.min(100,porcentaje))}%`}}/></div>
 <a className="button secondary share-link" href={compartir} target="_blank" rel="noreferrer">Compartir por WhatsApp</a>
 {confirmada?<div className="success-panel"><h3>¡Reserva registrada!</h3><p>Tu código de reserva es:</p><strong>{confirmada.codigo}</strong><p>Guarda este código para consultar tu reserva.</p></div>:<form className="form-panel" onSubmit={reservar}><h2>Reservar pasajes</h2>{err&&<p className="error-message">{err}</p>}<div className="form-grid"><label>Nombre completo<input required value={reserva.nombre} onChange={e=>setReserva({...reserva,nombre:e.target.value})}/></label><label>DNI (8 dígitos)<input required maxLength="8" pattern="[0-9]{8}" value={reserva.dni} onChange={e=>setReserva({...reserva,dni:e.target.value})}/></label><label>Teléfono<input required value={reserva.telefono} onChange={e=>setReserva({...reserva,telefono:e.target.value})}/></label><label>Cantidad de pasajes<input required type="number" min="1" max={s.cupos} value={reserva.cantidad} onChange={e=>setReserva({...reserva,cantidad:e.target.value})}/></label></div><button className="button primary" disabled={s.cupos<1||['zarpó','cancelada'].includes(s.estado)}>Confirmar reserva</button></form>}
 </article></main>
}
