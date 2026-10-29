const savedKey='pd-test-payment';
const errors={unauthorized:'Открой оплату из приложения в Telegram. Если оно давно открыто — переоткрой.',telegram_not_configured:'Токен Telegram не доступен серверу.',not_configured:'Добавь YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в Netlify (Functions / Production) и запусти новую публикацию.',test_only:'Подключение принимает только ключ тестового магазина. Реальные списания заблокированы.',provider_auth:'ЮKassa не приняла Shop ID или ключ. Проверь данные тестового магазина в Netlify.',invalid_code:'Промокод не найден. Проверь код или оставь поле пустым.',temporarily_unavailable:'Сервер временно недоступен. Повтори запрос чуть позже.'};
export async function checkout(action,code=''){
 const status=document.querySelector('#subscription-status');if(!status)return;
 const buttons=[...document.querySelectorAll('[data-action="test-pay"],[data-action="check-payment"]')];buttons.forEach(b=>b.disabled=true);
 try{
 let saved;try{saved=JSON.parse(localStorage.getItem(savedKey));}catch{}
 if(action==='create'&&(!saved||saved.code!==code.trim().toUpperCase())){saved={requestId:crypto.randomUUID(),code:code.trim().toUpperCase()};localStorage.setItem(savedKey,JSON.stringify(saved));}
 if(!saved?.requestId){status.textContent='Сначала создай тестовый платёж на этом устройстве.';return;}
 status.textContent=action==='create'?'Создаём тестовый платёж…':'Проверяем результат через API ЮKassa…';
 const r=await fetch('/.netlify/functions/test-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,requestId:saved.requestId,code:saved.code,initData:window.Telegram?.WebApp?.initData||''})});const data=await r.json();
 if(!r.ok){status.textContent=errors[data.error]||'Не удалось завершить запрос. Код: '+data.error;return;}
 if(action==='create'){status.textContent='Тестовый платёж создан: '+data.amount+' ₽. После оплаты вернись сюда и нажми «Проверить тестовый платёж».';const a=document.createElement('a');a.href=data.confirmationUrl;a.target='_blank';a.rel='noopener noreferrer';a.className='contact-button';a.textContent='Открыть тестовую оплату ЮKassa ↗';status.append(a);}
 else status.textContent=data.paid?'Тестовая оплата подтверждена ЮKassa. Реальных денег, подписки и партнёрских начислений нет.':data.status==='canceled'?'Тестовый платёж отменён.':'Платёж пока не завершён. Статус ЮKassa: '+data.status;
 }catch{status.textContent='Не удалось подключиться или сохранить платёж. Проверь интернет и доступность памяти браузера.';}finally{buttons.forEach(b=>b.disabled=false);}
}
