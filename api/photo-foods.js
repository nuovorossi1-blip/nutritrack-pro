import { aiConfig, verifyUser } from '../server/aiParse.mjs';
import { photoFoods } from '../server/photoFoods.mjs';

export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).json({errore:'Solo POST'});
  const user=await verifyUser(req.headers.authorization,process.env);
  if(!user || user==='senza-login') return res.status(401).json({errore:'Accedi per riconoscere una foto'});
  const out=await photoFoods(req.body?.image,{...aiConfig(process.env),ip:user});
  res.setHeader('Cache-Control','no-store');
  return res.status(out.status).json(out.body);
}
