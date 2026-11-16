import React from 'react';

function Filtros({ filtros, destinos, onChange, onLimpiar }) {
  return (
    <section className="filters">
      <label className="filter-search">
        Buscar
        <input
          type="search"
          name="q"
          value={filtros.q}
          onChange={onChange}
          placeholder="Empresa o embarcación"
        />
      </label>
      <label>
        Destino
        <select name="destino" value={filtros.destino} onChange={onChange}>
          <option value="">Todos los destinos</option>
          {destinos.map((destino) => (
            <option key={destino} value={destino}>{destino}</option>
          ))}
        </select>
      </label>
      <label>
        Fecha
        <input type="date" name="fecha" value={filtros.fecha} onChange={onChange} />
      </label>
      <label>
        Tipo
        <select name="tipo" value={filtros.tipo} onChange={onChange}>
          <option value="">Todos los tipos</option>
          <option value="lancha">Lancha</option>
          <option value="rapido">Rápido</option>
          <option value="deslizador">Deslizador</option>
        </select>
      </label>
      <label>Precio mínimo (S/)<input type="number" min="0" name="precioMin" value={filtros.precioMin || ''} onChange={onChange}/></label>
      <label>Precio máximo (S/)<input type="number" min="0" name="precioMax" value={filtros.precioMax || ''} onChange={onChange}/></label>
      <label>Ordenar por<select name="orden" value={filtros.orden || 'fecha'} onChange={onChange}><option value="fecha">Fecha</option><option value="precio">Precio</option><option value="duracion">Duración</option></select></label>
      <label>Dirección<select name="dir" value={filtros.dir || 'asc'} onChange={onChange}><option value="asc">Ascendente</option><option value="desc">Descendente</option></select></label>
      <label className="check-filter"><input type="checkbox" checked={filtros.hoy === 'true'} onChange={e=>onChange({target:{name:'hoy',value:e.target.checked?'true':''}})}/> Solo salidas de hoy</label>
      <label className="check-filter"><input type="checkbox" checked={filtros.proximas48 === 'true'} onChange={e=>onChange({target:{name:'proximas48',value:e.target.checked?'true':''}})}/> Próximas 48 horas</label>
      <button type="button" className="button secondary clear-button" onClick={onLimpiar}>
        Limpiar filtros
      </button>
    </section>
  );
}

export default Filtros;
