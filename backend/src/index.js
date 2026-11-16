const fs=require('node:fs');
const path=require('node:path');
const envFile=path.join(process.cwd(),'.env');
if(fs.existsSync(envFile)){
 for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){
  const match=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if(match&&!process.env[match[1]])process.env[match[1]]=match[2].replace(/^['"]|['"]$/g,'');
 }
}
const express=require('express');
const cors=require('cors');
const rutas=require('./routes/salidas');
const {logger,errores}=require('./middleware');
const app=express();
const allowed=(process.env.CORS_ORIGIN||'').split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:allowed.length?allowed:true}));
app.use(express.json());
app.use(logger);
app.use('/api',rutas);
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.use(errores);
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`LanchaYa API en http://localhost:${port}`));
