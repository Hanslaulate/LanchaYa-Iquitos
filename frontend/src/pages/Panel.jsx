import React,{useEffect,useState} from 'react';
import {obtenerEstadisticas} from '../services/api';
export default function Panel(){
 const [data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{obtenerEstadisticas().then(setData).catch(e=>setError(e.message))},[]);
 if(error)return <main className="container"><p className="status error-message">{error}</p></main>;
 if(!data)return <main className="container"><p className="status">Cargando estadísticas...</p></main>;
 const max=Math.max(1,...data.porDestino.map(x=>x.total),...data.porTipo.map(x=>x.total));
 return <main className="container admin-page"><section className="listing"><div className="section-title"><h2>Panel de estadísticas</h2><span>Resumen general</span></div>
 <div className="stats-grid">{[['Salidas registradas',data.totalSalidas],['Empresas',data.totalEmpresas],['Pasajes reservados',data.totalPasajesReservados]].map(([l,v])=><article className="stat-card" key={l}><span>{l}</span><strong>{v}</strong></article>)}</div>
 <div className="stats-columns"><article className="form-panel"><h3>Salidas por destino</h3>{data.porDestino.map(x=><div className="bar-row" key={x.destino}><span>{x.destino}</span><div className="bar-track"><i style={{width:`${x.total/max*100}%`}}/></div><b>{x.total}</b></div>)}</article>
 <article className="form-panel"><h3>Por tipo de embarcación</h3>{data.porTipo.map(x=><div className="bar-row" key={x.tipo}><span>{x.tipo}</span><div className="bar-track"><i style={{width:`${x.total/max*100}%`}}/></div><b>{x.total}</b></div>)}</article></div>
 <article className="form-panel"><h3>Precio promedio por destino</h3><div className="cards">{data.precioPromedioPorDestino.map(x=><div className="mini-stat" key={x.destino}><span>{x.destino}</span><strong>S/ {Number(x.promedio).toFixed(2)}</strong></div>)}</div></article>
 </section></main>
}
