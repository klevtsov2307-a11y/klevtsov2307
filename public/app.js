const app = document.querySelector('#app');
const tg = window.Telegram?.WebApp;
tg?.ready(); tg?.expand();
try {tg?.setHeaderColor?.("#faf8f4"); tg?.setBackgroundColor?.("#faf8f4"); tg?.setBottomBarColor?.("#ffffff");} catch {}
const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}};
let storageAvailable = true;
const write = (key, value) => {try {localStorage.setItem(key, JSON.stringify(value));} catch {storageAvailable = false;}};
let profile = read('pd-profile', null);
if (!profile || typeof profile.name !== 'string') profile = null;
let settings = read('pd-settings', {});
if (!settings || typeof settings !== 'object') settings = {};
let favorite = read('pd-favorite', false) === true;
let screen = 'home', category = 'all', timer = null, timerEnd = 0;
let message = '';
const audio = new Audio('/audio/villa-sea.mp3');
audio.preload = 'metadata';
audio.playbackRate = [0.85, 1, 1.15].includes(settings.speed) ? settings.speed : 1;
audio.volume = typeof settings.volume === 'number' ? Math.min(1, Math.max(0, settings.volume)) : 0.8;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const pos = () => {const v = Number(read('plan-d-villa-position-v1', 0)); return Number.isFinite(v) && v > 0 ? v : 0;};
function persist() {write('plan-d-villa-position-v1', audio.ended ? 0 : audio.currentTime);}
function saveSettings() {settings = {speed:audio.playbackRate, volume:audio.volume};write('pd-settings', settings);}
function storyCard() {return `<article class="story-card"><div class="cover villa"><span class="cover-label">ДОМ · МОРЕ · РОСКОШЬ</span><span class="cover-title">Моя вилла<br>у моря</span><span class="cover-length">18:21 · Аудиоистория</span></div><div class="card-body"><div class="row"><span class="eyebrow">ТВОЙ ИДЕАЛЬНЫЙ ДЕНЬ</span><button class="heart" data-action="favorite" aria-label="${favorite?'Убрать из избранного':'В избранное'}" aria-pressed="${favorite}">${favorite?'♥':'♡'}</button></div><p>Проснуться с видом на море. Почувствовать прохладу мрамора. Провести день в своём ритме.</p><button data-action="player">${pos()>0?'Продолжить историю':'Открыть историю'} <span>↗</span></button></div></article>`;}
const icons = {
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 library:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h8M8 15h5"/>',
 favorites:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
};
function nav() {return `<nav class="bottom-nav" aria-label="Основное меню">${[['home','Главная'],['library','Истории'],['favorites','Избранное'],['settings','Настройки'],['profile','Профиль']].map(([id,label])=>`<button data-screen="${id}" class="${screen===id?'active':''}" ${screen===id?'aria-current="page"':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg><span>${label}</span></button>`).join('')}</nav>`;}
function onboarding() {app.innerHTML = `<div class="eyebrow">ДОБРО ПОЖАЛОВАТЬ В ПЛАН Д</div><h1>Сначала представь.<br>Потом — почувствуй.</h1><div class="cover villa welcome"><span class="cover-title">Твой красивый<br>вечерний ритуал</span></div><p>Истории о жизни, которую приятно воображать. Дорогие вещи, красивые места и время для себя.</p><form id="join"><label for="name">Как тебя называть?</label><input id="name" name="name" maxlength="40" placeholder="Твоё имя" autocomplete="given-name" value="${escape(tg?.initDataUnsafe?.user?.first_name || '')}"><button type="submit">${tg?.initDataUnsafe?.user?'Продолжить с профилем Telegram':'Создать локальный профиль'} →</button></form><button class="secondary" data-action="guest">Попробовать без профиля</button><p class="fine">Пароль не нужен. Пока это профиль на этом устройстве: история прослушивания и настройки не синхронизируются между телефонами.</p>`;document.querySelector('#join').onsubmit=e=>{e.preventDefault();profile={name:document.querySelector('#name').value.trim()||'Гость'};write('pd-profile',profile);render();};}
function render() {
 if (!profile) return onboarding();
 const headings={home:['ТВОЁ ПРОСТРАНСТВО','Хороший вечер<br>начинается здесь.'],library:['КОЛЛЕКЦИЯ ПЛАН Д','Выбери свой<br>идеальный день.'],favorites:['СОХРАНЁННОЕ','Хочется<br>вернуться.'],profile:['ЛИЧНОЕ ПРОСТРАНСТВО',escape(profile.name)],settings:['НАСТРОЙКИ','В твоём ритме.'],player:['СЕЙЧАС СЛУШАЕШЬ','Моя вилла у моря']};
 const h=headings[screen]||headings.home;
 let body='';
 if(screen==='home') body=`<p>Рад видеть тебя, ${escape(profile.name)}. Оставь суету за дверью — этот момент для тебя.</p><div class="section-title"><h2>История вечера</h2><span class="meta">01 / КОЛЛЕКЦИЯ</span></div>${storyCard()}<div class="ritual"><span>☾</span><div><h3>Маленький ритуал</h3><p>Приглуши свет, устройся удобно и включи историю. Никуда не нужно спешить.</p></div></div>`;
 if(screen==='library') body=`<p>Цельные истории от пробуждения до сна. Выбирай настроение, остальное мы уже подготовили.</p><div class="chips">${[['all','Все истории'],['home','Мой дом'],['travel','Путешествия']].map(([id,label])=>`<button data-category="${id}" class="${category===id?'selected':''}">${label}</button>`).join('')}</div>${category==='travel'?'<div class="empty"><span>✧</span><h2>Впереди целый мир</h2><p>Истории о путешествиях готовятся. Пока проведи день на вилле у моря.</p><button data-category="all">Все доступные истории</button></div>':storyCard()}<p class="fine">Сейчас доступна 1 озвученная история. Коллекция будет расти.</p>`;
 if(screen==='favorites') body=favorite?storyCard():`<div class="empty"><span>♡</span><h2>Сохрани любимое</h2><p>Нажми на сердечко у истории, чтобы она появилась здесь.</p><button data-screen="library">Выбрать историю</button></div>`;
 if(screen==='profile') body=`<div class="profile-card"><div class="avatar">${escape(profile.name.slice(0,1).toUpperCase())}</div><div><h2>${escape(profile.name)}</h2><p>Твоё пространство для красивых вечеров</p></div></div><form id="rename"><label for="name">Имя в приложении</label><input id="name" maxlength="40" value="${escape(profile.name)}" required><button class="secondary" type="submit">Сохранить имя</button></form><div class="menu-list"><button data-screen="favorites">Избранные истории <span>${favorite?'1':'0'} →</span></button><button data-screen="settings">Настройки прослушивания <span>→</span></button></div><p class="fine">Профиль хранится на этом устройстве. Вход с проверкой Telegram и синхронизацию добавим отдельно.</p><button class="secondary" data-action="logout">Выйти из профиля</button>`;
 if(screen==='settings') body=`<div class="card"><h2>Звучание</h2>${soundSettings()}<p class="fine">Настройки сохраняются на этом устройстве.</p></div><div class="card"><h2>Таймер сна</h2><p>Остановит запись через выбранное время.</p>${timerControl()}</div><div class="card"><h2>Фоновая атмосфера</h2><p>Пока звучит только голос. Фон добавим после выбора и проверки записи.</p></div>`;
 if(screen==='player') body=`<button class="back" data-screen="library">← К историям</button><div class="cover villa player-cover"><span class="cover-title">Моя вилла<br>у моря</span><span class="cover-length">ПЛАН Д · АФФИРМА</span></div><p>Просторная спальня, свой бассейн, дорога вдоль моря и тёплый вечер на террасе.</p><div class="player-controls"><label for="seek" class="sr-only">Позиция прослушивания</label><input id="seek" type="range" min="0" max="${Number.isFinite(audio.duration)?audio.duration:1101.427}" step="1" value="${audio.currentTime}"><div class="time-row"><span id="elapsed">${clock(audio.currentTime)}</span><span>18:21</span></div><div class="transport"><button class="secondary" data-action="rewind" aria-label="Назад 15 секунд">↶ 15</button><button id="play" data-action="play">${audio.paused?'▶ Слушать':'Ⅱ Пауза'}</button><button class="secondary" data-action="forward" aria-label="Вперёд 15 секунд">15 ↷</button></div><p class="status" id="status" aria-live="polite">${escape(message||'Устройся удобно. Эта история — для тебя.')}</p></div><div class="card">${soundSettings()}${timerControl()}<button class="secondary" data-action="favorite">${favorite?'♥ В избранном':'♡ Сохранить в избранное'}</button><button class="back" data-action="restart">Начать сначала</button></div><a class="download" href="/audio/villa-sea.mp3" download="Моя вилла у моря.mp3">Скачать MP3 ↓</a><p class="fine">При блокировке экрана воспроизведение зависит от Telegram и телефона. Для прослушивания вне приложения можно скачать MP3.</p>`;
 app.innerHTML=`<div class="page-heading"><span class="eyebrow">${h[0]}</span><h1>${h[1]}</h1></div>${!storageAvailable?'<p role="status">Сохранение на устройстве недоступно в этом режиме.</p>':''}${body}${screen!=='player'&&!audio.paused?'<button class="mini-player" data-screen="player">♫ Моя вилла у моря <span>Открыть →</span></button>':''}${nav()}`;
 const form=document.querySelector('#rename');if(form)form.onsubmit=e=>{e.preventDefault();profile.name=document.querySelector('#name').value.trim()||'Гость';write('pd-profile',profile);render();};
 document.querySelector('#seek')?.addEventListener('input',e=>{audio.currentTime=Number(e.target.value);persist();updateTime();});
 document.querySelector('#speed')?.addEventListener('change',e=>{audio.playbackRate=Number(e.target.value);saveSettings();});
 document.querySelector('#volume')?.addEventListener('input',e=>{audio.volume=Number(e.target.value);saveSettings();});
 document.querySelector('#timer')?.addEventListener('change',e=>setTimer(Number(e.target.value)));
}
function soundSettings(){return `<label for="speed">Скорость голоса</label><select id="speed">${[0.85,1,1.15].map(v=>`<option value="${v}" ${audio.playbackRate===v?'selected':''}>${v}×</option>`).join('')}</select><label class="control-label" for="volume">Громкость</label><input id="volume" type="range" min="0" max="1" step="0.05" value="${audio.volume}">`;}
function timerControl(){return `<label class="control-label" for="timer">Остановить через</label><select id="timer"><option value="0">Без таймера</option>${[5,10,15,20,30].map(v=>`<option value="${v}">${v} минут</option>`).join('')}</select><p class="fine" id="timer-state">${timerEnd?'Таймер включён: до '+new Date(timerEnd).toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}):'Таймер выключен'}</p>`;}
function setTimer(minutes){clearTimeout(timer);timerEnd=minutes?Date.now()+minutes*60000:0;if(minutes)timer=setTimeout(()=>{audio.pause();timerEnd=0;message='Таймер сна остановил историю.';render();},minutes*60000);document.querySelector('#timer-state').textContent=minutes?'Таймер включён на '+minutes+' минут.':'Таймер выключен';}
function updateTime(){const seek=document.querySelector('#seek');if(seek)seek.value=audio.currentTime;const elapsed=document.querySelector('#elapsed');if(elapsed)elapsed.textContent=clock(audio.currentTime);}
app.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.screen){screen=b.dataset.screen;render();window.scrollTo(0,0);return;}
 if(b.dataset.category){category=b.dataset.category;render();return;}
 switch(b.dataset.action){
 case 'guest':profile={name:'Гость'};write('pd-profile',profile);render();break;
 case 'player':screen='player';render();window.scrollTo(0,0);break;
 case 'favorite':favorite=!favorite;write('pd-favorite',favorite);render();break;
 case 'play':if(audio.paused){try{await audio.play();message='Приятного прослушивания.';}catch{message='Не удалось загрузить аудио. Проверь интернет и попробуй ещё раз.';}}else{audio.pause();message='Пауза. Можно продолжить позже.';}render();break;
 case 'rewind':audio.currentTime=Math.max(0,audio.currentTime-15);persist();updateTime();break;
 case 'forward':audio.currentTime=Math.min(Number.isFinite(audio.duration)?audio.duration:1101.427,audio.currentTime+15);persist();updateTime();break;
 case 'restart':audio.currentTime=0;persist();updateTime();break;
 case 'logout':audio.pause();persist();clearTimeout(timer);timerEnd=0;profile=null;write('pd-profile',null);screen='home';render();break;
 }
});
audio.addEventListener('loadedmetadata',()=>{if(pos()<audio.duration-2)audio.currentTime=pos();updateTime();});
let lastSave=0;audio.addEventListener('timeupdate',()=>{if(timerEnd&&Date.now()>=timerEnd){audio.pause();clearTimeout(timer);timerEnd=0;}updateTime();if(Date.now()-lastSave>4000){persist();lastSave=Date.now();}});
audio.addEventListener('pause',()=>{persist();const b=document.querySelector('#play');if(b)b.textContent='▶ Продолжить';});
audio.addEventListener('ended',()=>{write('plan-d-villa-position-v1',0);message='Спокойной ночи. История завершена.';render();});
audio.addEventListener('error',()=>{message='Аудио не загрузилось. Проверь интернет и попробуй ещё раз.';const s=document.querySelector('#status');if(s)s.textContent=message;});
window.addEventListener('pagehide',persist);
if('mediaSession'in navigator&&'MediaMetadata'in window)navigator.mediaSession.metadata=new MediaMetadata({title:'Моя вилла у моря',artist:'План Д · Аффирма'});
render();
