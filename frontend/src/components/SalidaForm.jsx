import React,{useEffect,useState} from 'react';
import {obtenerEmpresas} from '../services/api';
const inicial={empresa:'',empresaId:'',embarcacion:'',tipo:'lancha',destino:'',puerto:'',fechaHora:'',duracionHoras:'',precio:'',cupos:''};
function SalidaForm({salida,onGuardar,onCancelar}){
 const [formulario,setFormulario]=useState(inicial),[error,setError]=useState(''),[empresas,setEmpresas]=useState([]);
 useEffect(()=>{obtenerEmpresas().then(setEmpresas).catch(()=>setEmpresas([]))},[]);
 useEffect(()=>{setFormulario(salida?{...salida}:inicial);setError('')},[salida]);
 function cambiar(e){setFormulario({...formulario,[e.target.name]:e.target.value})}
 function enviar(e){e.preventDefault();const datos={...formulario,duracionHoras:Number(formulario.duracionHoras),precio:Number(formulario.precio),cupos:Number(formulario.cupos),empresaId:formulario.empresaId?Number(formulario.empresaId):null};
 for(const campo of ['empresa','embarcacion','destino','puerto','fechaHora'])if(!String(datos[campo]).trim())return setError(`El campo ${campo} es obligatorio`);
 if(!['lancha','rapido','deslizador'].includes(datos.tipo))return setError('Selecciona un tipo válido');
 if(!Number.isFinite(datos.precio)||datos.precio<=0)return setError('El precio debe ser mayor que 0');
 if(!Number.isFinite(datos.duracionHoras)||datos.duracionHoras<=0)return setError('La duración debe ser mayor que 0');
 if(!Number.isInteger(datos.cupos)||datos.cupos<0)return setError('Los cupos deben ser un entero válido');
 if(!salida&&new Date(datos.fechaHora)<new Date())return setError('La fecha no puede estar en el pasado');
 setError('');onGuardar(datos)}
 return <form className="form-panel" onSubmit={enviar}><h2>{salida?'Editar salida':'Registrar salida'}</h2>{error&&<p className="error-message">{error}</p>}<div className="form-grid">
 {empresas.length>0?<label>Empresa fluvial<select name="empresaId" value={formulario.empresaId||''} onChange={e=>{const x=empresas.find(v=>String(v.id)===e.target.value);setFormulario({...formulario,empresaId:e.target.value,empresa:x?.razonSocial||''})}} required><option value="">Selecciona una empresa</option>{empresas.map(x=><option key={x.id} value={x.id}>{x.razonSocial} · {x.ruc}</option>)}</select></label>:<label>Empresa<input required name="empresa" value={formulario.empresa} onChange={cambiar}/></label>}
 {['embarcacion','destino','puerto'].map(n=><label key={n}>{n==='embarcacion'?'Embarcación':n==='destino'?'Destino':'Puerto'}<input required name={n} value={formulario[n]} onChange={cambiar}/></label>)}
 <label>Tipo<select name="tipo" value={formulario.tipo} onChange={cambiar}><option value="lancha">Lancha</option><option value="rapido">Rápido</option><option value="deslizador">Deslizador</option></select></label>
 <label>Fecha y hora<input required type="datetime-local" name="fechaHora" value={formulario.fechaHora} onChange={cambiar}/></label><label>Duración (horas)<input required type="number" min="0.5" step="0.5" name="duracionHoras" value={formulario.duracionHoras} onChange={cambiar}/></label><label>Precio (S/)<input required type="number" min="0.01" step="0.01" name="precio" value={formulario.precio} onChange={cambiar}/></label><label>Cupos<input required type="number" min="0" step="1" name="cupos" value={formulario.cupos} onChange={cambiar}/></label></div>
 <div className="form-actions"><button className="button primary">{salida?'Guardar cambios':'Registrar salida'}</button>{salida&&<button type="button" className="button secondary" onClick={onCancelar}>Cancelar</button>}</div></form>
}
export default SalidaForm;
