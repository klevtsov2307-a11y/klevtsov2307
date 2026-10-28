const app = document.querySelector('#app');
window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();
app.innerHTML = `<div class="eyebrow">КОЛЛЕКЦИЯ ИДЕАЛЬНЫХ ДНЕЙ</div>
<h1>Твоя вилла.<br>Твоё море. Твой день.</h1>
<p>Большой дом на побережье, любимые вещи и удовольствие от каждого мгновения. Устройся удобно и проживи этот день в воображении.</p>
<div class="landscape" role="img" aria-label="Тёплое солнце над морским побережьем"></div>
<article class="card"><div class="meta">01 / МОЯ ВИЛЛА У МОРЯ</div>
<h2>Роскошь быть дома</h2><span class="pill">18 минут 21 секунда</span><span class="pill">Готовая озвучка</span>
<p>От первого света в просторной спальне до тихого вечера на собственной террасе. Одна цельная история.</p>
<audio id="audio" controls preload="metadata" aria-label="Моя вилла у моря"><source src="/audio/villa-sea.mp3" type="audio/mpeg"></audio>
<button id="play">▶ Слушать историю</button>
<div class="row"><button class="secondary" id="rewind">↶ 15 секунд</button><button class="secondary" id="restart">С начала</button></div>
<p id="status" class="status" role="status" aria-live="polite">Нажми «Слушать историю», когда будешь готов.</p>
<label for="speed">Скорость</label> <select id="speed" aria-label="Скорость воспроизведения"><option value="0.85">0,85×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option></select>
<p>Место остановки сохраняется на этом устройстве. Прослушивание с выключенным экраном зависит от Telegram и телефона.</p>
<a class="download" href="/audio/villa-sea.mp3" download="Моя вилла у моря.mp3">Скачать историю в MP3 ↓</a>
</article><p>Новые идеальные дни скоро появятся в коллекции.</p>`;
const audio = document.querySelector('#audio');
const button = document.querySelector('#play');
const status = document.querySelector('#status');
const key = 'plan-d-villa-position-v1';
let lastSave = 0;
function persist() { try {localStorage.setItem(key, String(audio.ended ? 0 : audio.currentTime));} catch {} }
audio.addEventListener('loadedmetadata', () => {
  try { const position = Number(localStorage.getItem(key));
    if (Number.isFinite(position) && position > 0 && position < audio.duration - 2) {
      audio.currentTime = position;
      status.textContent = 'Продолжим с места, где ты остановился.';
    }
  } catch {}
});
button.onclick = async () => {
  if (!audio.paused) {audio.pause(); return;}
  try { await audio.play(); } catch {status.textContent = 'Не удалось начать воспроизведение. Попробуй встроенную кнопку плеера или скачай MP3.';}
};
audio.addEventListener('play', () => {button.textContent = 'Ⅱ Пауза'; status.textContent = 'Твой идеальный день начинается. Приятного прослушивания.';});
audio.addEventListener('pause', () => {button.textContent = '▶ Продолжить'; persist(); if (!audio.ended) status.textContent = 'Пауза. Можно продолжить, когда захочешь.';});
audio.addEventListener('ended', () => {button.textContent = '▶ Слушать ещё раз'; status.textContent = 'Спокойной ночи. История завершена.'; persist();});
audio.addEventListener('error', () => {status.textContent = 'Аудио не загрузилось. Проверь интернет и переоткрой приложение.';});
audio.addEventListener('timeupdate', () => {if (Date.now() - lastSave > 4000) {persist(); lastSave = Date.now();}});
document.querySelector('#rewind').onclick = () => {audio.currentTime = Math.max(0, audio.currentTime - 15); persist();};
document.querySelector('#restart').onclick = () => {audio.currentTime = 0; persist(); status.textContent = 'История готова к прослушиванию с начала.';};
document.querySelector('#speed').onchange = e => {audio.playbackRate = Number(e.target.value);};
window.addEventListener('pagehide', persist);
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({title:'Моя вилла у моря',artist:'План Д · Аффирма'});
}
