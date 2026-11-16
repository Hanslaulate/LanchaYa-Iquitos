import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import SalidaCard from '../components/SalidaCard';
import { obtenerDestinos, obtenerSalidas } from '../services/api';

function Home() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState(() => { try { return JSON.parse(localStorage.getItem('lanchaya-filtros')) || { q:'', destino:'', fecha:'', tipo:'', precioMin:'', precioMax:'', orden:'fecha', dir:'asc', hoy:'', proximas48:'' }; } catch { return { q:'', destino:'', fecha:'', tipo:'', precioMin:'', precioMax:'', orden:'fecha', dir:'asc', hoy:'', proximas48:'' }; } });
  const [pagina,setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarSalidas = useCallback(async () => {
    setCargando(true);
    try {
      setSalidas(await obtenerSalidas(filtros));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    obtenerDestinos().then(setDestinos).catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => {
    document.body.classList.add('client-background');
    return () => document.body.classList.remove('client-background');
  }, []);
  useEffect(() => { localStorage.setItem('lanchaya-filtros', JSON.stringify(filtros)); cargarSalidas(); }, [cargarSalidas]);
  useEffect(() => { setPagina(1); }, [filtros]);

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }

  function irAListado() {
    document.getElementById('salidas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <header className="hero client-hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Iquitos · Río Amazonas</p>
          <h1>LANCHA YA!</h1>
          <p className="hero-lead">Horarios, destinos y precios de las salidas fluviales, en un solo lugar.</p>
          <button type="button" className="button primary hero-cta" onClick={irAListado}>
            Ver salidas
          </button>
        </div>
      </header>
      <main className="container client-page" id="salidas">
        <section className="listing">
          <div className="section-title">
            <h2>Salidas disponibles</h2>
            <span>{salidas.length} resultados · Página {pagina}</span>
          </div>
          <Filtros
            filtros={filtros}
            destinos={destinos}
            onChange={cambiarFiltro}
            onLimpiar={() => setFiltros({ q: '', destino: '', fecha: '', tipo: '', precioMin:'', precioMax:'', orden:'fecha', dir:'asc', hoy:'', proximas48:'' })}
          />
          {cargando && <p className="status">Cargando salidas...</p>}
          {!cargando && error && <p className="status error-message">{error}</p>}
          {!cargando && !error && salidas.length === 0 && (
            <p className="status">No hay salidas para los filtros seleccionados.</p>
          )}
          {!cargando && !error && salidas.length > 0 && (
            <>
              <div className="cards">
                {salidas.slice((pagina-1)*6,pagina*6).map((salida) => <SalidaCard key={salida.id} salida={salida} />)}
              </div>
              <nav className="pagination" aria-label="Paginación">
                <button className="button secondary" disabled={pagina===1} onClick={()=>setPagina(pagina-1)}>Anterior</button>
                <span>Página {pagina} de {Math.max(1,Math.ceil(salidas.length/6))}</span>
                <button className="button secondary" disabled={pagina>=Math.ceil(salidas.length/6)} onClick={()=>setPagina(pagina+1)}>Siguiente</button>
              </nav>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default Home;
