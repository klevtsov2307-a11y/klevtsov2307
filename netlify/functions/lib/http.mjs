// Netlify Functions v2 provides the Blobs environment automatically.
export async function respond(request,handler){
 const event={httpMethod:request.method,body:request.method==='POST'?await request.text():''};
 if(event.body.length>20000)return new Response(JSON.stringify({error:'too_large'}),{status:413,headers:{'Content-Type':'application/json'}});
 const result=await handler(event);
 return new Response(result.body,{status:result.statusCode,headers:result.headers});
}
