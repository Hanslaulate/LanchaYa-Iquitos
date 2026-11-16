const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
async function request(path, options = {}) {
 let response;
 try { response=await fetch(`${API_URL}${path}`,{headers:{'Content-Type':'application/json'},...options}); }
 catch { throw new Error('No se pudo conectar con el servidor'); }
 if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.mensaje||body.error||'No se pudo completar la solicitud');}
 return response.status===204?null:response.json();
}
export function obtenerSalidas(f={}){const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v!==''&&v!==undefined&&v!==null)p.set(k,v)});return request(`/salidas${p.size?`?${p}`:''}`)}
export const obtenerDestinos=()=>request('/destinos');
export const crearSalida=s=>request('/salidas',{method:'POST',body:JSON.stringify(s)});
export const actualizarSalida=(id,s)=>request(`/salidas/${id}`,{method:'PUT',body:JSON.stringify(s)});
export const eliminarSalida=id=>request(`/salidas/${id}`,{method:'DELETE'});
export const obtenerSalida=id=>request(`/salidas/${id}`);
export const cambiarEstado=(id,estado)=>request(`/salidas/${id}/estado`,{method:'PATCH',body:JSON.stringify({estado})});
export const obtenerEmpresas=()=>request('/empresas');
export const crearEmpresa=e=>request('/empresas',{method:'POST',body:JSON.stringify(e)});
export const actualizarEmpresa=(id,e)=>request(`/empresas/${id}`,{method:'PUT',body:JSON.stringify(e)});
export const eliminarEmpresa=id=>request(`/empresas/${id}`,{method:'DELETE'});
export const crearReserva=(id,r)=>request(`/salidas/${id}/reservas`,{method:'POST',body:JSON.stringify(r)});
export const consultarReserva=codigo=>request(`/reservas/${encodeURIComponent(codigo)}`);
export const obtenerEstadisticas=()=>request('/estadisticas');
