export function createRouteHistory(){
 const entries=[];let current=null,restoring=false;
 const same=(a,b)=>a?.screen===b?.screen&&a?.step===b?.step;
 return {
 record(route){if(!same(current,route)){if(current&&!restoring)entries.push(current);current={...route};}restoring=false;},
 back(){const route=entries.pop();if(route)restoring=true;return route?{...route}:null;},
 get canGoBack(){return entries.length>0;}
 };
}
