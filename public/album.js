const items = [
 ['villa','Твоя вилла','Светлый камень, открытая терраса и море за окнами.','/villa.svg'],
 ['bedroom','Твоя спальня','Широкая кровать, свежие простыни и первое солнце.'],
 ['bathroom','Твоя ванная','Прохлада камня и тёплая вода на плечах.'],
 ['wardrobe','Твоя гардеробная','Любимые вещи, выбранные именно тобой.'],
 ['coffee','Твой утренний кофе','Голубая чашка, тёплые ладони и время для себя.'],
 ['pool','Твой бассейн','Прозрачная вода, мягкий свет и простор.'],
 ['car','Твой автомобиль','Тёмно-синий кузов и светлая кожа салона.'],
 ['dinner','Твой вечер','Свечи на террасе и море в закатном свете.']
];
const key='pd-villa-album-v1';
let custom={};try {const v=JSON.parse(localStorage.getItem(key));if(v&&typeof v==='object'&&!Array.isArray(v))custom=v;}catch{}
let index=0,notice='',busy=false,uploadingId=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function state(id){const s=custom[id];return s&&typeof s==='object'?s:{};}
function visible(){return items.filter(i=>state(i[0]).hidden!==true);}
function commit(next){try{localStorage.setItem(key,JSON.stringify(next));custom=next;return true;}catch{notice='Не удалось сохранить. Возможно, память устройства заполнена или сохранение запрещено.';return false;}}
function source(item){const img=state(item[0]).image;return typeof img==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(img)?img:(item[3]||`/images/${item[0]}.svg`);}
export function albumHTML(){const list=visible();index=Math.max(0,Math.min(index,list.length-1));const item=list[index];const hidden=items.filter(i=>state(i[0]).hidden===true);
return `<button class="back" data-screen="player">← К истории</button><p>Рассмотри детали. Потом позволь истории ожить с закрытыми глазами.</p>${item?`<section class="album-view" aria-label="Альбом образов"><figure><img id="album-image" src="${source(item)}" alt="${esc(item[1])}" draggable="false"><figcaption><span class="eyebrow">ОБРАЗ ${index+1} ИЗ ${list.length}</span><h2>${esc(item[1])}</h2><p>${esc(item[2])}</p></figcaption></figure><div class="album-arrows"><button class="secondary" data-album="prev" aria-label="Предыдущий образ" ${index===0?'disabled':''}>←</button><span aria-live="polite">${index+1} / ${list.length}</span><button class="secondary" data-album="next" aria-label="Следующий образ" ${index===list.length-1?'disabled':''}>→</button></div><div class="album-thumbs" aria-label="Выбор образа">${list.map((i,n)=>`<button data-album-index="${n}" aria-label="${esc(i[1])}" aria-pressed="${n===index}" class="${n===index?'chosen':''}"><img src="${source(i)}" alt="" loading="lazy"></button>`).join('')}</div><div class="album-tools"><button class="secondary" data-album="replace" ${busy?'disabled':''}>${busy?'Сохраняем…':'Заменить своей'}</button><button class="secondary" data-album="hide" ${busy?'disabled':''}>Скрыть</button>${state(item[0]).image?'<button class="back" data-album="original">Вернуть исходную</button>':''}</div></section>`:'<div class="empty"><h2>В альбоме пока пусто</h2><p>Верни скрытые образы ниже или сразу переходи к истории.</p></div>'}<input id="album-upload" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden><p id="album-notice" class="status" role="status">${esc(notice)}</p>${hidden.length?`<details><summary>Скрытые образы · ${hidden.length}</summary><div class="album-hidden">${hidden.map(i=>`<button class="secondary" data-album-restore="${i[0]}">${esc(i[1])} · Вернуть</button>`).join('')}</div></details>`:''}<p class="fine">Исходные образы — иллюстрации. Свои фотографии и скрытые образы сохраняются только на этом устройстве. Замена картинки не меняет текст озвучки.</p><button data-album="listen">Закрыть глаза и слушать →</button>`;
}
export function attachAlbum(root,rerender,listen){
 const upload=root.querySelector('#album-upload');
 root.querySelectorAll('[data-album]').forEach(b=>b.onclick=()=>{const action=b.dataset.album;const item=visible()[index];if(busy&&action!=='listen')return;
 if(action==='prev')index=Math.max(0,index-1);
 if(action==='next')index=Math.min(visible().length-1,index+1);
 if(action==='replace'&&item){uploadingId=item[0];upload.click();return;}
 if(action==='hide'&&item){commit({...custom,[item[0]]:{...state(item[0]),hidden:true}});}
 if(action==='original'&&item){const s={...state(item[0])};delete s.image;if(commit({...custom,[item[0]]:s}))notice='Исходный образ возвращён.';}
 if(action==='listen'){listen();return;}rerender();});
 root.querySelectorAll('[data-album-index]').forEach(b=>b.onclick=()=>{if(busy)return;index=Number(b.dataset.albumIndex);rerender();});
 root.querySelectorAll('[data-album-restore]').forEach(b=>b.onclick=()=>{if(busy)return;const id=b.dataset.albumRestore;if(commit({...custom,[id]:{...state(id),hidden:false}}))notice='Образ возвращён в альбом.';rerender();});
 upload.onchange=async()=>{const file=upload.files?.[0];const id=uploadingId;if(!file||!id)return;
 if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>12*1024*1024){notice='Выбери JPG, PNG, WebP или AVIF до 12 МБ.';rerender();return;}
 busy=true;notice='Подготавливаем фотографию…';rerender();
 try{const url=URL.createObjectURL(file);let image;try{image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});}finally{URL.revokeObjectURL(url);}
 const scale=Math.min(1,1200/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#f6f3ec';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.8);
 if(commit({...custom,[id]:{...state(id),image:data}}))notice='Твой образ сохранён на этом устройстве.';
 }catch{notice='Не удалось открыть фотографию. Попробуй другой JPG или PNG.';}finally{busy=false;if(root.querySelector('#album-upload'))rerender();}
 };
 const img=root.querySelector('#album-image');let touch=null;
 img?.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 img?.addEventListener('touchend',e=>{if(!touch||busy)return;const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){index=Math.max(0,Math.min(visible().length-1,index+(dx<0?1:-1)));rerender();}},{passive:true});
}
