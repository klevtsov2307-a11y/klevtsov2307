export async function yookassa(path,{method='GET',body,idempotencyKey}={}){
 const shop=process.env.YOOKASSA_SHOP_ID,key=process.env.YOOKASSA_SECRET_KEY;
 if(!shop||!key)throw Object.assign(Error('not_configured'),{code:'not_configured'});
 // This integration intentionally accepts test credentials only.
 if(!key.startsWith('test_'))throw Object.assign(Error('test_only'),{code:'test_only'});
 const headers={Authorization:'Basic '+Buffer.from(shop+':'+key).toString('base64'),'Content-Type':'application/json'};
 if(idempotencyKey)headers['Idempotence-Key']=idempotencyKey;
 const r=await fetch('https://api.yookassa.ru/v3/'+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Object.assign(Error('provider_error'),{code:r.status===401?'provider_auth':'provider_error'});
 return r.json();
}
