import React,{useEffect,useState} from 'react';
import {actualizarEmpresa,crearEmpresa,eliminarEmpresa,obtenerEmpresas} from '../services/api';
const vacio={razonSocial:'',ruc:'',telefono:'',puertoBase:''};
export default function Empresas(){
 const [items,setItems]=useState([]),[form,setForm]=useState(vacio),[edit,setEdit]=useState(null),[error,setError]=useState(''),[ok,setOk]=useState('');
 async function cargar(){try{setItems(await obtenerEmpresas());setError('')}catch(e){setError(e.message)}}
 useEffect(()=>{cargar()},[]);
 function change(e){setForm({...form,[e.target.name]:e.target.value})}
 async function guardar(e){e.preventDefault();try{if(edit)await actualizarEmpresa(edit,form);else await crearEmpresa(form);setForm(vacio);setEdit(null);setOk('Empresa guardada correctamente');cargar()}catch(e){setError(e.message)}}
 async function borrar(id){if(!confirm('¿Eliminar esta empresa?'))return;try{await eliminarEmpresa(id);cargar();setOk('Empresa eliminada')}catch(e){setError(e.message)}}
 function editar(x){setEdit(x.id);setForm({razonSocial:x.razonSocial,ruc:x.ruc,telefono:x.telefono,puertoBase:x.puertoBase})}
 return <main className="container admin-page"><section className="listing"><div className="section-title"><h2>Empresas fluviales</h2><span>{items.length} empresas</span></div>
 <form className="form-panel" onSubmit={guardar}><h3>{edit?'Editar empresa':'Registrar empresa'}</h3><div className="form-grid">
 {Object.entries({razonSocial:'Razón social',ruc:'RUC (11 dígitos)',telefono:'Teléfono',puertoBase:'Puerto base'}).map(([name,label])=><label key={name}>{label}<input required name={name} value={form[name]} onChange={change} maxLength={name==='ruc'?11:undefined}/></label>)}</div>
 <div className="form-actions"><button className="button primary">{edit?'Guardar cambios':'Registrar empresa'}</button>{edit&&<button type="button" className="button secondary" onClick={()=>{setEdit(null);setForm(vacio)}}>Cancelar</button>}</div></form>
 {error&&<p className="status error-message">{error}</p>}{ok&&<p className="status">{ok}</p>}
 <div className="cards">{items.map(x=><article className="card" key={x.id}><h3>{x.razonSocial}</h3><p>RUC: {x.ruc}</p><p>Teléfono: {x.telefono}</p><p>Puerto base: {x.puertoBase}</p><p>{x.totalSalidas} salidas registradas</p><div className="card-actions"><button className="button secondary" onClick={()=>editar(x)}>Editar</button><button className="button danger" onClick={()=>borrar(x.id)}>Eliminar</button></div></article>)}</div>
 {!items.length&&!error&&<p className="status">Aún no hay empresas registradas.</p>}</section></main>
}
