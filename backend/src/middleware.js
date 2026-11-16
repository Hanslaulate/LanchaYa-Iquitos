function logger(req, res, next) {
 const inicio = Date.now();
 res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now()-inicio}ms`));
 next();
}
function errores(err, req, res, next) {
 if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
  return res.status(400).json({ error: true, mensaje: 'El cuerpo JSON no es válido' });
 console.error(err);
 return res.status(500).json({ error: true, mensaje: 'Error interno del servidor' });
}
module.exports = { logger, errores };
