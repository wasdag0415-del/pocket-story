/* Pocket Star: browser-local, explicitly simulated character conversations. */
const STORAGE_KEY='pocket-star-v1';
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const initialState=()=>({version:1,groups:[],voiceReplies:false,voiceLanguage:'zh-CN',theme:'sage',sound:false,nickname:'你',active:'starlight',profiles:[{id:'starlight',name:'星光',style:'gentle',bio:'温柔、认真，会关心日常，也会分享一点小小的心情。',avatar:'',greeting:'嗨，终于等到你打开这个小世界了。今天过得怎么样？'}],messages:{starlight:[{id:uid(),role:'assistant',text:'嗨，终于等到你打开这个小世界了。今天过得怎么样？',at:Date.now()}]},favorites:[],photos:[],notes:[{id:uid(),title:'想和你说的话',body:'今天有一件很小、但很开心的事。\n等下次聊天，一定要告诉你。',at:Date.now()}]});
const STYLE_NAMES={gentle:'温柔陪伴',playful:'俏皮朋友',quiet:'清冷慢热',bright:'元气开朗'};
function simulatedReply(text,p,history,nickname){
 const t=text.toLowerCase(),name=nickname&&nickname!=='你'?nickname+'，':'';
 const pools={
 tired:['今天辛苦了。先把肩膀放松一点，喝口水。是事情太多，还是心里一直绷着？','听起来今天消耗了不少力气。可以先休息一下，哪一件事最让你累？','今天就别急着把所有事都做完了。想和我说说，还是只想安静地待一会儿？'],
 sad:['不开心的时候，没必要立刻把自己哄好。发生了什么？我听你说。','这件事让你有点难过，对吗？你可以慢慢讲，不用组织得很完整。','先别急着责怪自己。愿意告诉我，刚才发生了什么吗？'],
 hello:['嗨，'+name+'今天有什么想和我分享的吗？','你来了。刚好想听听你的近况，今天过得怎么样？','收到你的消息了。今天是忙碌的一天，还是难得轻松的一天？'],
 food:['吃饭这件事要认真对待。你今天吃了什么？','现在最想吃的一道菜是什么？我投一票给热乎乎、能慢慢吃的东西。','听起来是个适合聊美食的话题。咸口还是甜口，你更喜欢哪一个？'],
 sleep:['晚安。把今天暂时放下，剩下的事明天再慢慢来。','准备睡觉了吗？把屏幕调暗一点，让自己舒服地躺下来。','希望你今晚睡得安稳。明天醒来，再告诉我做了什么有趣的梦。'],
 like:['谢谢你愿意把这份喜欢放在这里。在这个虚构的小世界里，我会认真接住你的话。','能让你在这里感到开心，是一件很好的事。你最喜欢什么样的聊天时刻？','那就把这一句好好收藏吧。也希望你今天能遇到让你开心的人和事。'],
 work:['最近在忙什么？是新计划，还是一直没做完的任务？','如果今天只能推进一小步，你最想先完成哪件事？','听起来你很认真地在做这件事。遇到的是时间问题，还是不知道从哪里开始？'],
 music:['我们聊聊歌吧。最近哪一首是你单曲循环最多的？','有没有一首歌，一听就会想到某个画面？我想听你说说那个画面。','你听歌时更在意旋律，还是歌词里某一句刚好说中了心事？'],
 identity:['这里的我是你设置的虚拟角色，用本地规则生成模拟回复，不是真实明星本人。你可以在人物设置里替我换名字、头像和说话风格。'],
 remember:['目前我会保存这个浏览器里的聊天记录，但本地模拟还不能像 AI 一样理解长期记忆。重要的事可以写进便签，喜欢的消息可以点小星星收藏。'],
 generic:['你说「'+text.slice(0,45)+'」。想再和我说说这件事里，你最在意的部分吗？','我听到了。对你来说，这是开心的事，还是有点烦恼的事？','如果用一个词形容你现在的心情，你会选哪个？','可以再讲一点吗？比如，当时让你印象最深的那个瞬间。']};
 let intent=/你是谁|真人|本人|真的是|是真|ai|机器人|模拟/.test(t)?'identity':/记得|记住|记忆/.test(t)?'remember':/晚安|睡觉|睡了|失眠/.test(t)?'sleep':/难过|伤心|哭|分手|孤独|委屈|不开心/.test(t)?'sad':/累|疲惫|辛苦|崩溃|压力|烦/.test(t)?'tired':/吃|饭|饿|奶茶|咖啡|美食/.test(t)?'food':/歌|音乐|舞台|唱|演唱会/.test(t)?'music':/工作|上班|学习|考试|作业|项目|策划/.test(t)?'work':/喜欢你|爱你|想你/.test(t)?'like':/^(你好|嗨|hi|hello|早安|早上好|在吗|哈喽)[！!。.?？\s]*$/.test(t)?'hello':'generic';
 const pool=pools[intent],last=history.filter(m=>m.role==='assistant').slice(-3).map(m=>m.text);let i=history.filter(m=>m.role==='user').length%pool.length;
 for(let k=0;k<pool.length;k++){if(!last.some(s=>s.includes(pool[i]))){break;}i=(i+1)%pool.length;}
 let reply=pool[i];if(!['identity','remember','like'].includes(intent)){
 if(p.style==='playful')reply=({tired:'今天的电量是不是快见底了？先暂停一下。',hello:'叮！你的聊天搭子出现了。',food:'美食话题，我可就不困了。',music:'来吧，交换一首循环歌。',sad:'今天心情有点阴天啊。'}[intent]||'好，话题接住了。')+'\n'+reply;
 if(p.style==='quiet')reply=reply.replace('嗨，','').replace('你来了。','来了。');
 if(p.style==='bright')reply=({hello:'今天也很高兴见到你！',work:'我们先把这件事拆小一点吧！',tired:'辛苦啦，先给自己一点休息时间。',music:'今天的歌单交换开始！'}[intent]||'我在听呢。')+'\n'+reply;
 }return {text:reply,intent};
}
if(typeof module!=='undefined')module.exports={initialState,simulatedReply,STYLE_NAMES};
if(typeof document!=='undefined'){
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state;try{state=JSON.parse(localStorage.getItem(STORAGE_KEY));if(!state||state.version!==1||!Array.isArray(state.profiles)||!state.profiles.length||!state.messages)state=initialState();}catch{state=initialState();}
state.groups??=[];state.voiceReplies??=false;state.voiceLanguage??='zh-CN';
state.smsReplies??=[];
state.ios??={likes:{},clues:{},following:true};
let view='lock',customApp=false,pending=new Set(),kktThread='current',pannPost=0,toastTimer,notificationTimer,sessionEpoch=0,browserQuery='',passcodeInput='',passcodeError='',phoneCallFilter='all';const screen=$('#screen');
const profile=()=>state.groups.find(g=>g.id===state.active)||state.profiles.find(p=>p.id===state.active)||state.profiles[0];
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{toast('浏览器存储空间不足，请删除部分相册图片后再试。');return false;}}
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function time(t){return new Date(t).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}
function avatar(p,extra=''){if(p.isGroup&&!p.avatar)return `<span class="avatar group-avatar ${extra}">${membersOf(p).slice(0,4).map(member=>`<span>${member.avatar?`<img src="${esc(member.avatar)}" alt="">`:esc(member.name.slice(0,1))}</span>`).join('')}</span>`;return `<span class="avatar ${extra}">${p.avatar?`<img src="${esc(p.avatar)}" alt="${esc(p.name)}的头像">`:'<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><circle cx="16" cy="11" r="6"/><path d="M5 29v-4a11 11 0 0 1 22 0v4Z"/></svg>'}</span>`;}
const paths={chat:'<path d="M20 6H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h2l-1 4 6-4h6a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3Z"/><path d="M9 12h9m-9 5h6"/>',contacts:'<rect x="6" y="4" width="17" height="23" rx="3"/><path d="M3 9h4m-4 6h4m-4 6h4"/><circle cx="14.5" cy="12" r="3"/><path d="M10 22v-2a4.5 4.5 0 0 1 9 0v2"/>',album:'<rect x="4" y="5" width="23" height="22" rx="4"/><circle cx="12" cy="12" r="2"/><path d="m5 23 7-6 4 4 4-7 6 9"/>',notes:'<rect x="6" y="4" width="21" height="24" rx="3"/><path d="M10 11h12m-12 5h12m-12 5h8M4 8h4m-4 5h4m-4 5h4m-4 5h4"/>',favorites:'<path d="m16 4 3.6 7.5 8.2 1.2-5.9 5.8 1.4 8.2-7.3-3.9-7.3 3.9 1.4-8.2-5.9-5.8 8.2-1.2Z"/>',settings:'<circle cx="16" cy="16" r="5"/><path d="m13 4-1 4-4 2-4-1-2 5 3 3 1 4-2 3 4 4 4-2 4 1 3 3 5-2-1-4 2-4 4-1-1-6-4-1-3-3 1-4-5-2-3 3Z" transform="translate(2 -1) scale(.88)"/>',clock:'<circle cx="16" cy="16" r="11"/><path d="M16 8v9l6 3"/>',profile:'<circle cx="16" cy="11" r="5"/><path d="M6 28v-3a10 10 0 0 1 20 0v3"/>'};
const icon=(name)=>`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
function scene(type='land'){if(type==='flowers')return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#829677"/><path d="M100 200Q85 120 123 65M60 200Q81 143 54 114M145 200Q133 156 157 121" fill="none" stroke="#c3ccac" stroke-width="2"/><g fill="#f0eee0"><circle cx="123" cy="57" r="11"/><circle cx="112" cy="65" r="11"/><circle cx="133" cy="68" r="11"/><circle cx="120" cy="77" r="11"/><circle cx="51" cy="105" r="8"/><circle cx="43" cy="115" r="8"/><circle cx="61" cy="114" r="8"/><circle cx="53" cy="124" r="8"/><circle cx="156" cy="115" r="8"/><circle cx="147" cy="123" r="8"/><circle cx="165" cy="123" r="8"/></g><g fill="#c5b783"><circle cx="122" cy="66" r="6"/><circle cx="53" cy="115" r="4"/><circle cx="156" cy="124" r="4"/></g><path d="M100 140Q75 116 77 146Q93 151 100 140M115 109Q145 90 139 116Q124 121 115 109" fill="#b0bea0"/></svg>`;
if(type==='moon')return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#7d8c9d"/><circle cx="134" cy="58" r="25" fill="#eee8cd"/><path d="M0 146Q50 116 112 149T210 131V200H0" fill="#687d80"/><path d="M0 174Q72 139 133 168T200 156V200H0" fill="#516c6e"/><g fill="#d0d3c7"><circle cx="32" cy="32" r="1.4"/><circle cx="81" cy="73" r="1"/><circle cx="175" cy="25" r="1.4"/><circle cx="51" cy="96" r="1"/></g></svg>`;
return `<svg viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="var(--wall,#e8eddd)"/><stop offset="1" stop-color="#d3ddc4"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".045"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter></defs><g filter="url(#grain)"><rect width="360" height="700" fill="url(#sky)"/><circle cx="286" cy="406" r="49" fill="#f8f4d9" opacity=".8"/><path d="M0 545Q53 489 127 520T259 477T360 484V700H0" fill="var(--scene,#9daf88)" opacity=".48"/><path d="M0 602Q115 524 193 565T360 550V700H0" fill="var(--scene,#9daf88)" opacity=".6"/><path d="M0 647Q102 577 174 620T360 604V700H0" fill="#7d9772" opacity=".25"/><path d="M-10 649Q70 610 171 700" fill="none" stroke="#b0bc95" stroke-width="1"/></g></svg>`;}
function head(title,sub='',right=''){return `<header class="page-head"><button class="back" data-view="home" aria-label="返回桌面">‹</button><div><h2>${esc(title)}</h2>${sub?`<small>${esc(sub)}</small>`:''}</div><div class="head-right">${right}</div></header>`;}
function app(name,label,color,badge=false){return `<button class="app" data-view="${name}" aria-label="打开${label}"><span class="app-icon ${color}">${icon(name)}</span><span>${label}</span>${badge?'<span class="app-badge">1</span>':''}</button>`;}
function render(next=view){if(next!==view)PocketVoice.stop();if(next==='phonehome')customApp=false;if(next==='lysn')customApp=true;view=next;$('.phone-screen').dataset.theme=state.theme;$('.phone-screen').dataset.view=view;$('.phone-screen').dataset.product=customApp?'lysn':'';$('#notification').hidden=true;
if(view==='lock')renderLockScreen();
else if(view==='passcode')renderPasscode();
else if(view==='phonehome')renderPhoneHome();
else if(view==='forum')renderMainPann();
else if(view==='pann-post')renderPannPost();
else if(view==='notebook')renderMainMemos();
else if(['opening','forum','notebook','ktstory','couplechat','storychat','official','chapterend'].includes(view))JapanStory.open(view,storyContext());
else if(view==='youtube')renderYouTube();
else if(view==='instagram')renderInstagram();
else if(view==='lysn')renderLysn();
else if(view==='kkt')renderMainKkt();
else if(view==='kkt-chat')renderKktChat();
else if(view==='map')renderMap();
else if(view==='weather')renderWeather();
else if(view==='music')renderMusic();
else if(view==='calendar')renderCalendar();
else if(view==='timeline')renderTimeline();
else if(view==='browser')renderBrowser();
else if(view==='phone')renderPhone();
else if(view==='sms')renderSms();
else if(view==='sms-chat')renderSmsChat();
else if(view==='home')renderChatList();
else if(view==='chat')renderChat();
else if(view==='contacts')renderFriends();
else if(view==='more')renderMore();
else if(view==='profile')renderProfile();
else if(view==='settings')renderSettings();
else if(view==='notes')renderNotes();
else if(view==='favorites'){screen.innerHTML=`<div class="page">${head('心动收藏','想留住的那些话')}<div class="page-body"><div class="section-label">LITTLE MOMENTS, KEPT FOREVER</div>${state.favorites.length?state.favorites.map(f=>`<div class="favorite-card">${esc(f.text)}<small>✦ ${esc(f.name)} · ${new Date(f.at).toLocaleDateString('zh-CN')} <button class="save-message saved" data-unfavorite="${f.id}" aria-label="取消收藏">取消收藏</button></small></div>`).join(''):'<div class="empty-note"><span class="empty-icon">☆</span>有些话，值得留下来。<br>在聊天里点击消息下方的小星星，<br>就能在这里找到它。</div>'}</div></div>`;}
else if(view==='album')renderAlbum();
else if(view==='clock'){screen.innerHTML=`<div class="page">${head('时钟','和你共享的此刻')}<div class="clock-page"><div><div class="music-decoration">☼</div><div class="giant-clock" id="home-clock">${time(Date.now())}</div><p>${new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</p><div class="notice">此刻，就慢一点吧。</div></div></div></div>`;}
if(['home','contacts','favorites','more'].includes(view))screen.insertAdjacentHTML('beforeend',bottomNav());bindShared();}
function contactCards(q=''){return state.profiles.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).map(p=>`<button class="chat-card" data-contact="${p.id}">${avatar(p)}<span class="card-info"><strong>${esc(p.name)}</strong><p>${esc(p.bio||STYLE_NAMES[p.style])}</p></span><span style="color:#acb59e">›</span></button>`).join('')||'<div class="empty-note">没有找到这个名字。</div>';}
function bindShared(){screen.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));screen.querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>{state.active=b.dataset.contact;persist();render('chat');});screen.querySelectorAll('[data-unfavorite]').forEach(b=>b.onclick=()=>{state.favorites=state.favorites.filter(f=>f.id!==b.dataset.unfavorite);persist();render();});}
function storyProgress(){return Object.values(state.ios.clues).filter(Boolean).length;}
function discover(id){if(window.PocketMainline){window.PocketMainline.note(id);window.PocketMainline.advance();}}
const EVIDENCE_APP={'cal:tour':'calendar','cal:fukuoka':'calendar','sms:staff':'sms','photos:backstage':'album','photos:together':'album','photos:fukuoka':'album','photos:hyogo-water':'album','kkt:members':'kkt','kkt:aug-daily':'kkt','kkt:sept-gap':'kkt','kkt:fukuoka':'kkt','kkt:hyogo-rain':'kkt','ig:profile':'instagram','call:missed-0910':'phone','call:missed-0912':'phone','call:replay-B':'phone','memo:unsent-0912':'notebook','pann:fukuoka':'forum','map:hyogo-osaka':'map','pub:aug-interaction':'youtube'};
function iosBack(title,actions=''){return `<header class="ios-app-header"><button data-view="phonehome" class="ios-back" aria-label="返回主屏幕">‹</button><h2>${esc(title)}</h2><div class="ios-head-actions">${actions}</div></header>`;}
function iosApp(view,label,kind,mark,badge=''){return `<button class="ios-app-button" data-view="${view}" aria-label="打开${esc(label)}"><span class="ios-app-icon ${kind}">${mark}</span><span>${esc(label)}</span>${badge?`<i>${esc(badge)}</i>`:''}</button>`;}
function storyContext(){return {screen,toast,navigate:render,confirm:confirmDialog};}
function renderLockScreen(){const L=window.MainlineData.lock;const owner=(window.PocketMainline&&window.PocketMainline.progress().ownerConfirmed);const note=(n)=>`<div class="ios-lock-note ios-system-note"><span class="mini-app ${n.app==='KakaoTalk'?'kakao':'messages'}">${n.app==='KakaoTalk'?'K':'✉'}</span><span><strong>${esc(n.from)}</strong><small>${esc(n.app)} · ${esc(n.ago)}</small><b>${esc(n.text)}</b></span><time>${esc(L.time)}</time></div>`;screen.innerHTML=`<div class="ios-lock ios-lost-lock"><div class="ios-lock-depth"></div><div class="ios-lock-content"><div class="ios-lock-date">${esc(L.date)}</div><div class="ios-lock-time" id="home-clock">${esc(L.time)}</div><div class="ios-lock-owner">遗失模式</div><div class="ios-lost-card"><span class="ios-lost-icon">⌖</span><div><small>遗失模式</small><strong>${owner?'涩琪的备用 iPhone':esc(L.lostCard[0])}</strong><p>${esc(L.lostCard[1])}<br>${esc(L.lostCard[2])}</p></div></div><div class="ios-lock-notifications">${note(L.notif1)}${note(L.notif2)}</div><div class="ios-slide-hint">上滑解锁</div></div><div class="ios-lock-tools"><button aria-label="紧急呼叫">SOS</button><button aria-label="相机">◎</button></div></div>`;bindShared();initSlideUnlock();}
function renderPasscode(){const dots=Array.from({length:6},(_,index)=>`<i class="${index<passcodeInput.length?'filled':''}"></i>`).join('');screen.innerHTML=`<div class="ios-passcode"><div class="ios-lock-depth"></div><div class="ios-passcode-panel"><button class="ios-passcode-cancel" data-view="lock">取消</button><div class="ios-passcode-lock">⌑</div><h2>Enter Passcode</h2><p>seulgi的 iPhone</p><div class="ios-passcode-dots" aria-label="已输入 ${passcodeInput.length} 位密码">${dots}</div><div class="ios-passcode-error">${passcodeError||'请输入 6 位密码'}</div><div class="ios-keypad">${['1','2','3','4','5','6','7','8','9','','0','delete'].map(key=>key==='delete'?'<button data-passcode-delete aria-label="删除">⌫</button>':key?`<button data-passcode-digit="${key}"><b>${key}</b><small>${{2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'}[key]||''}</small></button>`:'<span></span>').join('')}</div><small class="ios-passcode-disclaimer">本密码仅用于虚构剧情，不读取设备数据。</small></div></div>`;bindShared();screen.querySelectorAll('[data-passcode-digit]').forEach(button=>button.onclick=()=>{if(passcodeInput.length>=6)return;passcodeInput+=button.dataset.passcodeDigit;passcodeError='';if(passcodeInput.length===6){if(passcodeInput==='910329'){passcodeInput='';window.PocketMainline&&window.PocketMainline.unlock();render('phonehome');}else{passcodeInput='';passcodeError='密码不正确，请重新输入';renderPasscode();}}else renderPasscode();});screen.querySelector('[data-passcode-delete]').onclick=()=>{passcodeInput=passcodeInput.slice(0,-1);passcodeError='';renderPasscode();};}
function renderPhoneHome(){
 // ChatGPT版本的红点逻辑：刚进来KakaoTalk有红点，看完聊天红点消失
 const kktBadge = JapanStory.badge() || '';
 
 screen.innerHTML=`<div class="ios-home"><div class="ios-wallpaper"></div><div class="ios-home-content"><div class="ios-home-top"><button class="ios-date-widget" data-view="calendar"><small>FUKUOKA · 09.19</small><strong>首场结束以后</strong><span>点按日历回放已发现的剧情</span></button><button class="ios-weather-widget" data-view="weather"><small>福冈 · 23°</small><strong>⛅ 多云</strong><span>体感 21° · 湿度 68%</span></button></div><div class="ios-app-grid">${iosApp('forum','Pann','forum','판')}${iosApp('ktstory','KakaoTalk','kakao','<span class="kt-bubble">TALK</span>',kktBadge)}${iosApp('instagram','Instagram','instagram','<span class="ig-camera"></span>')}${iosApp('youtube','YouTube','youtube','<span class="yt-play">▶</span>')}${iosApp('map','地图','map','<span>🗺</span>')}${iosApp('weather','天气','weather','<span class="ios-weather-mark">☀️</span>')}${iosApp('calendar','日历','calendar','<span class="ios-calendar-mark"><small>9月</small><b>19</b></span>')}${iosApp('timeline','时间线','timeline','<span class="ios-timeline-mark"><i></i><i></i><i></i></span>')}${iosApp('album','照片','photos','<span class="photo-flower">✿</span>')}${iosApp('notebook','备忘录','notebook','<span class="ios-book-mark">▤</span>')}${iosApp('settings','设置','ios-settings','<span class="ios-gear-mark">⚙</span>')}</div><div class="ios-page-dots" aria-hidden="true"><i></i><i></i></div><div class="ios-dock">${iosApp('phone','电话','phone','<svg class="ios-phone-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 4c-2 1-3 3-2 6 3 9 9 15 18 18 3 1 5 0 6-2l-4-5c-1-1-2-1-3 0l-2 2c-4-2-7-5-10-10l2-2c1-1 1-2 0-3Z" fill="currentColor"/></svg>')}${iosApp('browser','Safari','safari','<span class="ios-safari-mark"><i></i></span>')}${iosApp('sms','信息','messages','<span class="ios-message-mark"></span>')}${iosApp('music','音乐','music','<span class="ios-music-mark">♫</span>')}</div></div></div>`;bindShared();
}
let chapterAudio;
function musicAudio(){if(!chapterAudio){chapterAudio=new Audio('assets/chapter1/after-first-show.wav');chapterAudio.loop=true;chapterAudio.volume=.48;chapterAudio.addEventListener('play',updateMusic);chapterAudio.addEventListener('pause',updateMusic);}return chapterAudio;}

function initSlideUnlock(){
  const lockScreen=screen.querySelector('.ios-lock');
  const lockContent=screen.querySelector('.ios-lock-content');
  if(!lockScreen||!lockContent)return;
  let startY=0,currentY=0,isDragging=false;
  const maxY=lockScreen.offsetHeight*0.6;
  lockScreen.addEventListener('touchstart',(e)=>{
    isDragging=true;
    startY=e.touches[0].clientY;
    lockScreen.classList.add('dragging');
  });
  lockScreen.addEventListener('touchmove',(e)=>{
    if(!isDragging)return;
    currentY=e.touches[0].clientY-startY;
    if(currentY<0){
      currentY=Math.max(currentY,-maxY);
      lockContent.style.transform=`translateY(${currentY}px)`;
    }
  });
  lockScreen.addEventListener('touchend',()=>{
    isDragging=false;
    lockScreen.classList.remove('dragging');
    if(-currentY>maxY*0.5){
      lockContent.style.transform=`translateY(${-maxY}px)`;
      setTimeout(()=>render('passcode'),200);
    }else{
      lockContent.style.transform='translateY(0)';
    }
  });
  // 鼠标支持
  lockScreen.addEventListener('mousedown',(e)=>{
    isDragging=true;
    startY=e.clientY;
    lockScreen.classList.add('dragging');
    e.preventDefault();
  });
  document.addEventListener('mousemove',(e)=>{
    if(!isDragging)return;
    currentY=e.clientY-startY;
    if(currentY<0){
      currentY=Math.max(currentY,-maxY);
      lockContent.style.transform=`translateY(${currentY}px)`;
    }
  });
  document.addEventListener('mouseup',()=>{
    if(!isDragging)return;
    isDragging=false;
    lockScreen.classList.remove('dragging');
    if(-currentY>maxY*0.5){
      lockContent.style.transform=`translateY(${-maxY}px)`;
      setTimeout(()=>render('passcode'),200);
    }else{
      lockContent.style.transform='translateY(0)';
    }
  });
}
function updateMusic(){const button=screen.querySelector('[data-music-toggle]');if(button){button.textContent=chapterAudio&&!chapterAudio.paused?'Ⅱ 暂停':'▶ 播放';button.setAttribute('aria-label',chapterAudio&&!chapterAudio.paused?'暂停音乐':'播放音乐');}}
function renderMusic(){
  const songs = [
    {title: 'Your Dog Loves Me', artist: 'Aseul', cover: 'https://aka.doubaocdn.com/s/667eea', duration: '3:24'},
    {title: 'Nobody', artist: 'Mitski', cover: 'https://aka.doubaocdn.com/s/f093fb', duration: '3:14'},
    {title: 'Automatic', artist: 'Red Velvet', cover: 'https://aka.doubaocdn.com/s/4facfe', duration: '3:31'},
    {title: 'Bad Boy', artist: 'Red Velvet', cover: 'https://aka.doubaocdn.com/s/ayOuZUj5Qm', duration: '3:31'},
    {title: 'Psycho', artist: 'Red Velvet', cover: 'https://aka.doubaocdn.com/s/JzvbazjHVC', duration: '3:30'},
    {title: 'Cool World', artist: 'Aseul', cover: 'https://aka.doubaocdn.com/s/30cfd0', duration: '4:02'},
    {title: 'Star Shopping', artist: 'Lil Peep', cover: 'https://aka.doubaocdn.com/s/a8edea', duration: '2:24'},
    {title: 'Sweater Weather', artist: 'The Neighbourhood', cover: 'https://aka.doubaocdn.com/s/ff9a9e', duration: '3:55'}
  ];
  screen.innerHTML=`<div class="ios-music-app">
    <header class="ios-music-head">
      <button data-view="phonehome" aria-label="返回桌面">‹</button>
      <strong>资料库</strong>
      <span>🔍</span>
    </header>
    <div class="ios-music-body">
      <div class="ios-music-now">
        <div class="ios-music-cover">🎧</div>
        <div class="ios-music-info">
          <strong>Your Dog Loves Me</strong>
          <small>Aseul</small>
        </div>
        <button class="ios-music-play">▶</button>
      </div>
      <div class="ios-music-section">
        <h3>播放列表</h3>
        <div class="ios-music-list">
          ${songs.map((song, i) => `
            <div class="ios-music-item">
              <span class="ios-music-item-cover"><img src="${song.cover}" alt="${song.title}"></span>
              <div class="ios-music-item-info">
                <strong>${song.title}</strong>
                <small>${song.artist}</small>
              </div>
              <small class="ios-music-item-time">${song.duration}</small>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <nav class="ios-music-tabs">
      <button class="active"><span>🏠</span><small>资料库</small></button>
      <button><span>▶️</span><small>现在播放</small></button>
      <button><span>🌐</span><small>浏览</small></button>
      <button><span>📻</span><small>广播</small></button>
      <button><span>🔍</span><small>搜索</small></button>
    </nav>
  </div>`;
  bindShared();
}
function renderCalendar(){const progress=JapanStory.getState(),done=progress.chapterComplete;screen.innerHTML=`<div class="ios-native-app ios-calendar-app">${iosBack('日历')}<div class="ios-app-scroll"><div class="ios-calendar-title"><span>2026年</span><strong>9月</strong><button data-view="opening">回放本章</button></div><div class="ios-weekdays">${['日','一','二','三','四','五','六'].map(day=>`<span>${day}</span>`).join('')}</div><div class="ios-month-grid">${Array.from({length:30},(_,index)=>{const day=index+1,marked=[14,16,19].includes(day);return `<button class="${day===19?'today ':''}${marked?'marked':''}" ${marked?`data-calendar-day="${day}"`:''}><span>${day}</span>${marked?'<i></i>':''}</button>`;}).join('')}</div><section class="ios-day-events"><small>9月19日 · 星期六</small><h3>福冈首场结束以后</h3><button data-view="forum"><time>20:43</time><span><strong>Pann 热帖</strong><small>有人觉得舞台上的气氛变了</small></span><b>›</b></button><button data-view="ktstory"><time>20:52</time><span><strong>KakaoTalk</strong><small>同担发来了讨论链接</small></span><b>›</b></button><button data-view="${done?'chapterend':'notebook'}"><time>21:22</time><span><strong>${done?'章节记录':'尚未完成'}</strong><small>${done?'回看第一章的结论':'继续寻找关键节点'}</small></span><b>›</b></button></section></div></div>`;bindShared();screen.querySelectorAll('[data-calendar-day]').forEach(button=>button.onclick=()=>{const day=button.dataset.calendarDay;if(day==='14')render('forum');else if(day==='16')render('instagram');else screen.querySelector('.ios-day-events')?.scrollIntoView({behavior:'smooth'});});}
function renderTimeline(){const progress=JapanStory.getState(),items=[['09.14','机场公开图','只能确认涩琪独自出现在照片中',progress.seen.includes('airport-seulgi-0914'),'forum'],['09.16','Instagram 更新','公开内容围绕专辑与练习',progress.igSaved.includes('sg-260916'),'instagram'],['09.19 · 20:43','论坛出现疑问','不同座位的人留下相反的现场感受',progress.read.includes('coldwar'),'forum'],['09.19 · 21:15','官方照片发布','照片确认同台，无法解释台下沉默',progress.officialUnlocked,'official'],['09.19 · 21:22','第一章记录','已知事实和无法确认的部分被分开保存',progress.chapterComplete,'chapterend']];screen.innerHTML=`<div class="ios-native-app ios-timeline-app">${iosBack('关键时间线')}<div class="ios-app-scroll"><header><small>POCKET STORY · EVIDENCE LOG</small><h2>时间不会替任何人解释，<br>但它会留下顺序。</h2><p>只有玩家已经看过的节点会完整显示。</p></header><div class="ios-timeline-list">${items.map(([date,title,copy,open,route],index)=>`<button class="${open?'unlocked':'locked'}" ${open?`data-view="${route}"`:''}><span class="ios-timeline-dot">${open?'✓':index+1}</span><time>${date}</time><strong>${open?title:'尚未发现'}</strong><small>${open?copy:'继续探索其他应用来解锁'}</small></button>`).join('')}</div></div></div>`;bindShared();}
function renderBrowser(){const S=window.MainlineData.safari;const matches=browserQuery?S.results.filter(r=>r.title.includes(browserQuery)||r.kw.includes(browserQuery)):[];screen.innerHTML=`<div class="ios-native-app ios-safari-app"><div class="ios-safari-toolbar"><form id="ios-search-form"><i>⌕</i><input id="ios-search-input" value="${esc(browserQuery)}" placeholder="搜索网页或输入关键词"><button aria-label="搜索">前往</button></form><button data-view="phonehome" aria-label="返回主屏幕">完成</button></div><div class="ios-app-scroll">${browserQuery?`<section class="ios-search-results"><h2>${matches.length} 个相关结果</h2>${matches.map(r=>`<button><strong>${esc(r.title)}</strong><small>${esc(r.source)}</small></button>`).join('')||'<p>没有找到相关记录。</p>'}</section>`:`<section class="ios-browser-start"><h2>最近搜索</h2><div class="ios-browser-history">${S.recent.map(r=>`<button data-search="${esc(r.q)}"><span>◷</span><strong>${esc(r.q)}</strong><time>${esc(r.date)}</time></button>`).join('')}</div></section>`}</div><p class="ios-local-label">${esc(S.foot)}</p></div>`;bindShared();const form=screen.querySelector('#ios-search-form');if(form)form.onsubmit=e=>{e.preventDefault();browserQuery=screen.querySelector('#ios-search-input').value.trim();renderBrowser();};screen.querySelectorAll('[data-search]').forEach(b=>b.onclick=()=>{browserQuery=b.dataset.search;renderBrowser();});}

function renderPhone(){
const recent=[
{name:'组长老师',type:'未接来电',date:'今天',at:'20:31',kind:'missed',detail:'未接听'},
{name:'Manager',type:'呼入电话',date:'今天',at:'20:02',kind:'incoming',detail:'通话 2分11秒'},
{name:'日本运营',type:'呼出电话',date:'今天',at:'17:26',kind:'outgoing',detail:'通话 48秒'},
{name:'组长老师',type:'呼出电话',date:'9月18日',at:'23:48',kind:'outgoing',detail:'通话 12秒'},
{name:'Wendy',type:'呼入电话',date:'9月18日',at:'19:06',kind:'incoming',detail:'通话 6分34秒'},
{name:'组长老师',type:'未接来电',date:'9月14日',at:'08:41',kind:'missed',detail:'未接听'},
{name:'Manager',type:'呼入电话',date:'9月14日',at:'07:12',kind:'incoming',detail:'通话 1分52秒'},
{name:'组长老师',type:'呼出电话',date:'9月12日',at:'01:18',kind:'outgoing',detail:'通话 38分46秒'}
];
const older=(window.PreludeData?.calls||[]).map(([date,name,type,at,kind,detail])=>({date,name,type,at,kind,detail}));
const calls=[...recent,...older],visible=phoneCallFilter==='missed'?calls.filter(item=>item.kind==='missed'):calls;
let lastDate='';
const rows=visible.map(item=>{const index=calls.indexOf(item),heading=item.date!==lastDate?`<div class="ios-call-date">${esc(item.date)}</div>`:'';lastDate=item.date;const direction=item.kind==='outgoing'?'↗':item.kind==='missed'?'':'↙';return `${heading}<button data-call-index='${index}' class='${item.kind}'><span class='ios-call-avatar tone-${Math.abs(item.name.length)%4}'>${esc(item.name.slice(0,1))}</span><span><strong>${esc(item.name)}</strong><small>${direction} ${esc(item.type)}</small></span><time>${esc(item.at)}</time><b aria-hidden="true">ⓘ</b></button>`}).join('');
screen.innerHTML=`<div class='ios-native-app ios-phone-app'>${iosBack('电话')}<header class="ios-phone-title"><h1>最近通话</h1><span>编辑</span></header><div class='ios-phone-tabs'><button data-call-filter='all' class='${phoneCallFilter==='all'?'active':''}'>全部</button><button data-call-filter='missed' class='${phoneCallFilter==='missed'?'active':''}'>未接来电</button></div><div class='ios-app-scroll'><div class='ios-call-list'>${rows||'<p class="ios-phone-empty">没有未接来电</p>'}</div><p class="ios-phone-note">通话记录属于平行世界同人剧情，不会拨打真实号码。</p></div><nav class='ios-phone-bottom'><span>★<small>个人收藏</small></span><span class='active'>◷<small>最近通话</small></span><span>♙<small>通讯录</small></span><span>⌨<small>拨号键盘</small></span></nav></div>`;
bindShared();
screen.querySelectorAll('[data-call-filter]').forEach(button=>button.onclick=()=>{phoneCallFilter=button.dataset.callFilter;renderPhone();});
screen.querySelectorAll('[data-call-index]').forEach(button=>button.onclick=()=>renderPhoneDetail(calls[Number(button.dataset.callIndex)]));
}
function renderPhoneDetail(item){
const status=item.kind==='missed'?'未接来电':item.kind==='outgoing'?'呼出电话':'呼入电话';
screen.innerHTML=`<div class="ios-native-app ios-phone-app ios-phone-detail"><header><button id="phone-detail-back">‹ 最近通话</button><span>编辑</span></header><div class="ios-phone-person"><span class="ios-call-avatar">${esc(item.name.slice(0,1))}</span><h2>${esc(item.name)}</h2><small>${item.name==='组长老师'?'手机':'联系人'}</small><div><button data-view="ktstory"><i>💬</i><small>信息</small></button><button disabled><i>☎</i><small>呼叫</small></button><button disabled><i>▣</i><small>视频</small></button></div></div><section class="ios-phone-detail-card"><small>${esc(item.date)}</small><div><span><strong>${esc(status)}</strong><small>${esc(item.detail)}</small></span><time>${esc(item.at)}</time></div></section><p class="ios-phone-note">仅展示剧情记录，不会连接或拨打真实号码。</p></div>`;
bindShared();
screen.querySelector('#phone-detail-back').onclick=renderPhone;
}
function renderSms(){
const threads=[
{id:'roaming',avatar:'JP',name:'Japan eSIM',preview:'本日已使用 1.8GB 高速流量。',time:'20:18'},
{id:'hotel',avatar:'H',name:'酒店前台',preview:'已按要求将热水与冰袋送至房间。',time:'19:42'},
{id:'car',avatar:'車',name:'福冈车辆',preview:'车辆已抵达 B1，请准备后联系司机。',time:'18:55'},
{id:'air',avatar:'✈',name:'航空公司',preview:'您的航班已于14:36抵达。',time:'9月14日'}
];
screen.innerHTML=`<div class='ios-native-app nf-extra'><header class='nf-extra-head'><button data-view='phonehome' aria-label='返回桌面'>‹</button><strong>信息</strong><span>＋</span></header><div class='nf-extra-scroll'>${threads.map(item=>`<button class='nf-sms-row' data-sms-thread='${item.id}'><span class='nf-sms-avatar ${item.id==='roaming'?'':'muted'}'>${item.avatar}</span><span><strong>${item.name}</strong><small>${item.preview}</small></span><time>${item.time}</time></button>`).join('')}</div></div>`;
bindShared();
screen.querySelectorAll('[data-sms-thread]').forEach(b=>b.onclick=()=>{smsThread=b.dataset.smsThread;render('sms-chat');});
}
let smsThread='roaming';
function renderSmsChat(){
const threads={
roaming:{name:'Japan eSIM',body:`<div class='nf-sms-date'>9月14日 · 14:41</div><div class='nf-sms-bubble'>欢迎抵达日本。您的数据套餐已自动启用，有效期至10月3日 23:59。</div><div class='nf-sms-date'>9月19日 · 20:18</div><div class='nf-sms-bubble'>本日已使用 1.8GB 高速流量。剩余流量 8.2GB。</div>`},
hotel:{name:'酒店前台',body:`<div class='nf-sms-date'>9月19日 · 19:36</div><div class='nf-sms-bubble mine'>您好，可以送一壶热水和一个冰袋到房间吗？</div><div class='nf-sms-bubble'>好的，请问冰袋是受伤使用吗？</div><div class='nf-sms-bubble mine'>不是很严重，舞台结束以后用。麻烦一起送来。</div><div class='nf-sms-bubble'>已按要求将热水与冰袋送至房间门口。</div>`},
car:{name:'福冈车辆',body:`<div class='nf-sms-date'>9月19日 · 18:55</div><div class='nf-sms-bubble'>车辆已抵达 B1，车牌尾号 0415。请准备后联系司机。</div><div class='nf-sms-bubble mine'>演出结束后两个人一起过去，可能会晚十分钟。</div><div class='nf-sms-bubble'>收到，我会在原位等候。</div>`},
air:{name:'航空公司',body:`<div class='nf-sms-date'>9月13日 · 18:02</div><div class='nf-sms-bubble'>值机提醒：您明日飞往福冈的航班已开放线上值机。</div><div class='nf-sms-date'>9月14日 · 14:39</div><div class='nf-sms-bubble'>您的航班已于14:36抵达。感谢您的乘坐。</div>`}
};
const thread=threads[smsThread]||threads.roaming;
screen.innerHTML=`<div class='ios-native-app nf-extra'><header class='nf-extra-head'><button data-view='sms' aria-label='返回信息列表'>‹</button><strong>${thread.name}</strong><span>···</span></header><div class='nf-extra-scroll nf-sms-conversation'>${thread.body}</div></div>`;
bindShared();
}
function renderYouTube(){discover('pub:aug-interaction');const Y=window.MainlineData.youtube;screen.innerHTML=`<div class="ios-native-app ios-yt-app">${iosBack('YouTube')}<div class="ios-app-scroll">${Y.map(v=>v.empty?`<p class="yt-empty">${esc(v.empty)}</p>`:`<section class="yt-item"><strong>${esc(v.title)}</strong><small>${esc(v.sub)}</small><p>${esc(v.note)}</p></section>`).join('')}</div></div>`;bindShared();}
function renderInstagram(){discover('ig:profile');const I=window.MainlineData.instagram;screen.innerHTML=`<div class="ios-native-app ios-ig-app">${iosBack('Instagram')}<div class="ios-app-scroll">${I.map(p=>`<section class="ig-post"><div class="ig-post-head"><span class="kkt-avatar">S</span><span><strong>hi_sseulgi</strong><small>${esc(p.date)} · ${esc(p.kind)}${p.status?` · ${esc(p.status)}`:''}</small></span></div><p>${esc(p.caption)||'<i>（无配文）</i>'}</p>${(p.comments||[]).map(c=>`<small class="ig-comment">${esc(c)}</small>`).join('')}</section>`).join('')}<p class="ios-local-label">公开生活碎片与草稿 · 仅证明涩琪仍在记录自己</p></div></div>`;bindShared();}
function renderLysn(){customApp=true;view='lysn-login';renderLysnLogin();}
function renderLysnLogin(){
 screen.innerHTML=`<div class="page lysn-login-page">
  <div class="lysn-login-logo">
   <h1>lysn</h1>
   <p>Your favorite artist, just for you.</p>
  </div>
  <div class="lysn-login-form">
   <input type="email" placeholder="이메일" aria-label="이메일">
   <input type="password" placeholder="비밀번호" aria-label="비밀번호">
   <button class="lysn-login-btn" data-lysn-login>로그인</button>
  </div>
  <div class="lysn-login-footer">
   <button>회원가입</button>
   <button>비밀번호 찾기</button>
  </div>
 </div>`;
 screen.querySelector('[data-lysn-login]').onclick=()=>renderLysnHome();
}
function renderLysnHome(){
 screen.innerHTML=`<div class="page lysn-main">
  <header class="lysn-header">
   <div class="lysn-profile">
    <span class="lysn-avatar">나</span>
    <div><strong>나의 세계</strong><small>보유 이용권 1개</small></div>
   </div>
   <button class="icon-button">⚙</button>
  </header>
  <div class="lysn-body">
   <h2 class="lysn-greeting">안녕하세요!<br>오늘은 무슨 하루였나요?</h2>
   <div class="lysn-subscriptions">
    <button data-lysn-sub="seulgi" class="lysn-card">
     <div class="lysn-card-avatar" style="background:linear-gradient(135deg,#667eea,#764ba2)">S</div>
     <div class="lysn-card-info">
      <strong>슬기 (SEULGI)</strong>
      <small>방금 전 · bubble</small>
      <p>오늘 무대 끝나고 너 생각났어</p>
     </div>
     <span class="lysn-badge">1</span>
    </button>
    <button data-lysn-sub="irene" class="lysn-card">
     <div class="lysn-card-avatar" style="background:linear-gradient(135deg,#f093fb,#f5576c)">I</div>
     <div class="lysn-card-info">
      <strong>아이린 (IRENE)</strong>
      <small>3분 전 · bubble</small>
      <p>사진 올렸으니까 봐줘</p>
     </div>
     <span class="lysn-badge">2</span>
    </button>
   </div>
   <div class="lysn-section">
    <div class="lysn-section-title"><strong>최근 소식</strong><button>전체보기</button></div>
    <div class="lysn-news-list">
     <div class="lysn-news-item"><span class="dot"></span><p>슬기님이 새 버블을 보냈어요</p><small>10분 전</small></div>
     <div class="lysn-news-item"><span class="dot"></span><p>아이린님이 새 버블을 보냈어요</p><small>30분 전</small></div>
    </div>
   </div>
  </div>
  <nav class="lysn-tabs">
   <button class="active"><span>🏠</span><small>홈</small></button>
   <button data-view="lysn-chats"><span>💬</span><small>채팅</small></button>
   <button><span>🔔</span><small>새소식</small></button>
   <button><span>⋯</span><small>더보기</small></button>
  </nav>
 </div>`;
 bindShared();
 screen.querySelectorAll('[data-lysn-sub]').forEach(b=>b.onclick=()=>{
  const who=b.dataset.lysnSub;
  renderLysnBubbleChat(who);
 });
 screen.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));
}
function renderLysnChats(){customApp=true;view='home';renderChatList();}
function renderLysnBubbleChat(who){
  const isSeulgi = who === 'seulgi';
  const name = isSeulgi ? '깡스루기 🐻' : '주현이 🐰';
  const avatar = isSeulgi ? 'https://aka.doubaocdn.com/s/zTBEkeViQi' : 'https://aka.doubaocdn.com/s/n7l4i6wdmw';
  const messages = isSeulgi ? [
    {type: 'artist', korean: '오늘 하루 어땠어?', translation: '今天过得怎么样？', time: '오후 09:09'}
  ] : [
    {type: 'artist', korean: '사진 찍었어!', translation: '拍了照片！', time: '오후 04:40'}
  ];
  screen.innerHTML=`<div class="bubble-chat">
    <header class="bubble-header">
      <button data-view="lysn" aria-label="返回">‹</button>
      <strong>${name}</strong>
      <div>
        <button>🔍</button>
        <button>⋯</button>
      </div>
    </header>
    <div class="bubble-sub">bubble 💜 + 400</div>
    <div class="bubble-messages">
      ${messages.map(msg => msg.type === 'artist' ? `
        <div class="bubble-msg artist">
          <div class="bubble-avatar">
            <img src="${avatar}" alt="">
            <span class="bubble-artist-tag">ARTIST</span>
          </div>
          <div class="bubble-bubble-wrap">
            <div class="bubble-bubble artist-bubble">
              <p class="bubble-korean">${msg.korean}</p>
              <p class="bubble-translation">${msg.translation}</p>
            </div>
            <small class="bubble-time">${msg.time}</small>
          </div>
        </div>
      ` : `
        <div class="bubble-msg user">
          <div class="bubble-bubble user-bubble">
            <p>${msg.text}</p>
          </div>
          <small class="bubble-time">${msg.time}</small>
        </div>
      `).join('')}
    </div>
    <div class="bubble-input">
      <input type="text" placeholder="메시지를 입력하세요">
      <button>😊</button>
      <button>➤</button>
    </div>
  </div>`;
  bindShared();
  screen.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));
}
function renderMainPann(){const P=window.MainlineData.pann;const list=P.map((p,i)=>`<button class="pann-row" data-pann="${i}"><span><strong>${esc(p.title)}</strong><small>${esc(p.date)} · ${p.comments.length} 条回复</small></span><b>›</b></button>`).join('');screen.innerHTML=`<div class="ios-native-app pann-app">${iosBack('Pann')}<div class="ios-app-scroll"><div class="pann-brand"><strong>pann<span>판</span></strong><small>匿名讨论区 · 同人虚构</small></div>${list}<p class="ios-local-label">Pann 只提供外界疑问与错误解释，不揭示真相。</p></div></div>`;bindShared();screen.querySelectorAll('[data-pann]').forEach(b=>b.onclick=()=>{pannPost=Number(b.dataset.pann);render('pann-post');});}
function renderPannPost(){if(pannPost===1)discover('pann:fukuoka');const p=window.MainlineData.pann[pannPost]||window.MainlineData.pann[0];const comments=p.comments.map((c,i)=>`<article class="pann-comment"><strong>${esc(c.u)}${i===0?'<i>楼主</i>':''}</strong><p>${esc(c.t)}</p></article>`).join('');screen.innerHTML=`<div class="ios-native-app pann-app">${iosBack(p.date)}<div class="ios-app-scroll"><h2>${esc(p.title)}</h2><small>${esc(p.date)} · 匿名</small><p class="pann-body">${esc(p.body)}</p><div class="pann-comments">${comments}</div><p class="ios-local-label">粉丝视角 · 无法得出私人矛盾的确定答案</p></div></div>`;bindShared();}
function renderMainMemos(){discover('memo:unsent-0912');const M=window.MainlineData.memos;const list=M.map(m=>`<section class="memo"><h3>${esc(m.title)}${m.date?`<small>${esc(m.date)}</small>`:''}</h3>${(m.body||[]).map(l=>`<p>${esc(l)}</p>`).join('')}</section>`).join('');screen.innerHTML=`<div class="ios-native-app memo-app">${iosBack('备忘录')}<div class="ios-app-scroll">${list}<p class="ios-local-label">备忘录只留下没有整理完的文字，不解释全部真相。</p></div></div>`;bindShared();}
function renderMainKkt(){discover('kkt:members');const C=window.MainlineData.contacts,M=window.PocketMainline,prog=M?M.progress():{ended:false,node:'N0'};const rank={N0:0,N1:1,N2:2,N3:3,N4:4,N5:5};const r=rank[prog.node]??0;const preview=prog.ended?'明天结束以后，有时间吗？':'回酒店了吗？';const row=(id,name,pv,badge)=>`<button class="kkt-row" data-kkt="${id}"><span class="kkt-avatar">${esc(name.slice(0,1))}</span><span><strong>${esc(name)}</strong><small>${esc(pv)}</small></span>${badge?`<i>${badge}</i>`:''}</button>`;const hist=[['augA','8月2日 · 合照',1],['augB','8月20日 · 一起吃饭',1],['augC','8月26日 · 陶艺',1],['septIntimate','9月8—9日 · 陶杯',1],['septGap','9月10—12日 · 断层',2],['depart','9月13日 · 出发前',3],['jpAhead','9月14—15日 · 日本先行',3],['arrival','9月16日 · 柱现抵达',3],['fukuoka','9月17—19日 · 福冈',3],['hyogo','9月20—22日 · 兵库',4]].filter(h=>h[2]<=r);screen.innerHTML=`<div class="ios-native-app kkt-app">${iosBack('KakaoTalk')}<div class="ios-app-scroll kkt-list"><small class="ios-call-section">聊天</small>${row('current','组长老师',preview,'1')}${row('group',C.group.name,'大阪结束以后要吃好吃的！！')}${row('manager',C.manager.name,'明天大阪集合时间改为 11:40。')}${row('wendy',C.wendy.name,'嗓子和肩膀都要注意')}${row('joy',C.joy.name,'日本便利店新品呢？')}${hist.length?`<small class="ios-call-section">历史回放</small>`:''}${hist.map(h=>`<button class="kkt-row hist" data-kkt="${h[0]}"><span class="kkt-avatar">◷</span><span><strong>${esc(h[1])}</strong><small>剧情回放</small></span></button>`).join('')}</div></div>`;bindShared();screen.querySelectorAll('[data-kkt]').forEach(b=>b.onclick=()=>{kktThread=b.dataset.kkt;render('kkt-chat');});}

function renderKktChat(){const K=window.MainlineData.kkt,C=window.MainlineData.contacts,M=window.PocketMainline,prog=M?M.progress():{ended:false};let name,msgs;if(kktThread==='current'){name='组长老师';const stage1=M?M.isFound('sms:staff'):false,stage2=prog.ended;const out=[];for(const m of K.current.messages){if(m.stage==='afterManager'){if(stage1)continue;break;}if(m.stage==='n5'){if(stage2)continue;break;}if(m.pause||m.w==='day')continue;out.push(m);}msgs=out.map(m=>({side:m.w==='s'?'me':'them',t:m.t}));}else if(K[kktThread]){const th=K[kktThread];name=th.title;msgs=th.messages.filter(m=>m.w!=='day'&&!m.pause).map(m=>({side:m.w==='s'?'me':'them',t:m.t}));const ev={augA:'kkt:aug-daily',augB:'kkt:aug-daily',augC:'kkt:aug-daily',septIntimate:'kkt:aug-daily',septGap:'kkt:sept-gap',fukuoka:'kkt:fukuoka',hyogo:'kkt:hyogo-rain'}[kktThread];if(ev)discover(ev);}else{const c=C[kktThread];name=c?c.name:kktThread;msgs=(c?c.messages:[]).map(m=>({side:m.w==='s'?'me':'them',t:m.t}));}const bubbles=msgs.map(m=>`<div class="kkt-bubble ${m.side}"><p>${esc(m.t)}</p></div>`).join('');screen.innerHTML=`<div class="ios-native-app kkt-app">${iosBack(name)}<div class="ios-app-scroll kkt-chat">${bubbles}</div>${kktThread==='current'?'<div class="kkt-composer"><input id="kkt-input" placeholder="输入彩蛋消息 · 不改变剧情"><button id="kkt-send">发送</button></div>':''}<small class="ios-local-label">本机剧情回放 · 私人对话均为同人虚构</small></div>`;bindShared();const input=screen.querySelector('#kkt-input'),send=screen.querySelector('#kkt-send');if(input&&send){const push=()=>{const v=input.value.trim();if(!v)return;const sc=screen.querySelector('.kkt-chat');sc.insertAdjacentHTML('beforeend',`<div class="kkt-bubble me"><p>${esc(v)}</p></div>`);input.value='';};send.onclick=push;input.onkeydown=(e)=>{if(e.key==='Enter')push();};}}

function renderMap(){discover('map:hyogo-osaka');const P=window.MainlineData.map;const favs=P.favorites.map(f=>`<li><strong>${esc(f.name)}</strong><small>${esc(f.note)}</small></li>`).join('');const routes=P.routes.map(r=>`<p class="map-route"><time>${esc(r.date)}</time><span>${esc(r.route)}</span></p>`).join('');screen.innerHTML=`<div class="ios-native-app ios-map-app">${iosBack('地图')}<div class="ios-app-scroll"><h3>日本想去的地方 · 7个地点</h3><ul class="map-favs">${favs}</ul><h3>最近路线</h3>${routes}<p class="ios-calendar-hint">地图只能证明工作移动高度重合，不能证明私下同行。</p><section class="map-locked"><strong>${esc(P.locked.label)}</strong><p>${esc(P.locked.note)}</p><small>${esc(P.locked.sub)}</small></section></div></div>`;bindShared();}
function renderWeather(){const W=window.MainlineData.weather;const card=(w)=>{const bits=[];if(w.temp)bits.push(`<div class="ios-weather-temp">${esc(w.temp)}</div>`);bits.push(`<p>${esc(w.cond)}</p>`);if(w.hi)bits.push(`<p>${esc(w.hi)} · ${esc(w.lo)}</p>`);if(w.sunset)bits.push(`<p>日落 ${esc(w.sunset)}</p>`);if(w.note)bits.push(`<p>${esc(w.note)}</p>`);if(w.locked)bits.push(`<small>海边风力数据尚未载入</small>`);return `<section class="ios-weather-card"><h3>${esc(w.city)}${w.date?`<span> · ${esc(w.date)}</span>`:''}</h3>${bits.join('')}</section>`;};screen.innerHTML=`<div class="ios-native-app ios-weather-app">${iosBack('天气')}<div class="ios-weather-content">${card(W.current)}<h4>历史</h4>${card(W.fukuoka)}${card(W.hyogo)}<h4>预报</h4>${card(W.osaka)}</div></div>`;bindShared();}

function appHeader(title,subtitle,buttons=''){return `<header class="kt-header"><div><h2>${esc(title)}</h2><small>${esc(subtitle)}</small></div><div class="head-right">${buttons}</div></header>`;}
function searchButton(){return `<button class="icon-button" id="toggle-search" aria-label="搜索">${uiIcon('search')}</button>`;}
function uiIcon(n){const svg={search:'<circle cx="13" cy="13" r="7"/><path d="m18 18 6 6"/>',add:'<path d="M16 4v24M4 16h24"/>',more:'<circle cx="6" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/><circle cx="26" cy="16" r="1.6"/>',smile:'<circle cx="16" cy="16" r="12"/><path d="M11 12h.1M21 12h.1M10 19q6 7 12 0"/>',contacts:paths.profile,home:'<path d="M25 5H7a4 4 0 0 0-4 4v11a4 4 0 0 0 4 4h3l-1 5 7-5h9a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4Z"/>',favorites:paths.favorites};return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg[n]||svg.more}</svg>`;}
function bottomNav(){return `<nav class="kt-tabs" aria-label="聊天软件导航">${[['contacts','好友'],['home','聊天'],['favorites','收藏'],['more','更多']].map(([id,name])=>`<button data-view="${id}" class="kt-tab ${view===id?'active':''}" ${view===id?'aria-current="page"':''}>${uiIcon(id)}<span>${name}</span></button>`).join('')}</nav>`;}
function renderChatList(){const sorted=[...state.profiles,...state.groups].sort((a,b)=>(state.messages[b.id]?.at(-1)?.at||0)-(state.messages[a.id]?.at(-1)?.at||0));screen.innerHTML=`<div class="page kt-main">${appHeader(customApp?'LYSN':'聊天',customApp?'自定义角色聊天':'Chats',searchButton()+`<button class="icon-button" id="new-chat" aria-label="发起聊天或群聊">${uiIcon('add')}</button>`)}<div class="page-body"><input class="search kt-search" id="chat-search" placeholder="搜索聊天对象或消息" aria-label="搜索聊天" hidden><div class="kt-notice"><span class="kt-notice-mark">${customApp?'L':'T'}</span><span>${customApp?'已订阅涩琪和 Irene，她们的留言会出现在这里。':'和喜欢的人，说说今天。'}<small>虚拟角色 · 本地模拟回复</small></span><span class="kt-notice-spark">✦</span></div><div id="lysn-subscriptions" style="display:flex;gap:12px;padding:0 0 12px;overflow-x:auto">
<button data-lysn-sub="seulgi" style="flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:10px 14px;background:#1c1c1e;border-radius:16px;border:1px solid #3a3a3c">
<span style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">S</span>
<span style="text-align:left"><strong style="display:block;color:#fff;font-size:14px">涩琪</strong><small style="color:#98989d;font-size:12px">방금 · bubble</small></span>
</button>
<button data-lysn-sub="irene" style="flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:10px 14px;background:#1c1c1e;border-radius:16px;border:1px solid #3a3a3c">
<span style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f093fb,#f5576c);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">I</span>
<span style="text-align:left"><strong style="display:block;color:#fff;font-size:14px">Irene</strong><small style="color:#98989d;font-size:12px">3분 전 · bubble</small></span>
</button>
</div><div id="chat-list">${chatCards(sorted)}</div><div class="kt-list-foot">每一句日常，都值得被听见。<span>오늘도 좋은 하루</span></div></div></div>`;$('#toggle-search').onclick=()=>{const el=$('#chat-search');el.hidden=!el.hidden;if(!el.hidden)el.focus();};$('#new-chat').onclick=()=>{showModal('<h3>开始聊天</h3><button class="subtle" id="new-direct">选择好友聊天</button><button class="primary wide" id="new-group" style="margin-top:10px">发起群聊</button>');$('#new-direct').onclick=()=>{$('#modal').close();render('contacts');};$('#new-group').onclick=()=>{$('#modal').close();createGroupDialog();};};$('#chat-search').oninput=e=>{$('#chat-list').innerHTML=chatCards(sorted,e.target.value);bindShared();};
screen.querySelectorAll('[data-lysn-sub]').forEach(b=>b.onclick=()=>{
  const who=b.dataset.lysnSub;
  const name=who==='seulgi'?'涩琪':'Irene';
  const msgs=who==='seulgi'?[
    ['them','20:14','오늘 무대 끝나고 너 생각났어'],
    ['them','20:15','사진 올렸으니까 봐줘'],
    ['me','20:16','봤어! 오늘 예뻐'],
    ['them','20:17','ㅋㅋㅋ고마워 내일 봐']
  ]:[
    ['them','20:11','벌써 호텔이야?'],
    ['me','20:12','아니 아직 차 안이야'],
    ['them','20:12','배고프면 뭐라도 먹어'],
    ['them','20:13','오늘 수고했어']
  ];
  screen.innerHTML=`<div class="page chat"><header class="page-head"><button class="back" data-view="home" aria-label="返回">‹</button><div class="avatar" style="width:36px;height:36px;border-radius:50%;background:${who==='seulgi'?'linear-gradient(135deg,#667eea,#764ba2)':'linear-gradient(135deg,#f093fb,#f5576c)'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">${who==='seulgi'?'S':'I'}</div><div class="chat-title"><h2>${name}</h2><small>bubble · 구독 중</small></div></header><div class="chat-messages">${msgs.map(([who,t,text])=>`<div class="nf-chat-date">9月19日 · ${t}</div><div class="nf-chat-message ${who==='me'?'me':'them'}"><p>${text}</p></div>`).join('')}</div><form class="composer" style="padding:10px"><input placeholder="메시지 보내기…" style="flex:1;border:none;background:#2c2c2e;border-radius:18px;padding:10px 16px;color:#fff"><button class="send" type="submit">↑</button></form></div>`;
  screen.querySelector('.back').onclick=()=>render('home');
  screen.querySelector('.composer').onsubmit=e=>{e.preventDefault();toast('bubble 메시지는 아직 보낼 수 없어요');};
});}
function chatCards(profiles,q=''){q=q.toLowerCase();return profiles.filter(p=>p.name.toLowerCase().includes(q)||(state.messages[p.id]||[]).some(m=>m.text.toLowerCase().includes(q))).map(p=>{const m=state.messages[p.id]?.at(-1);return `<button class="chat-card kt-chat-row" data-contact="${p.id}">${avatar(p)}<span class="card-info"><strong>${esc(p.name)}${p.isGroup?` <em class="group-count">${p.memberIds.length+1}</em>`:''}</strong><p>${esc((m?.senderName?p.isGroup?m.senderName+': ':'':'')+(m?.text||p.greeting||'群聊已创建'))}</p></span><span class="kt-row-meta"><time>${m?time(m.at):''}</time><span class="kt-sim-tag">模拟</span></span></button>`;}).join('')||'<div class="empty-note">没有找到相关聊天。</div>';}
function renderFriends(){screen.innerHTML=`<div class="page kt-main">${appHeader('好友','Friends',searchButton()+`<button class="icon-button" id="add-profile" aria-label="添加虚拟好友">${uiIcon('add')}</button>`)}<div class="page-body"><input class="search kt-search" id="contact-search" placeholder="搜索好友" aria-label="搜索好友" hidden><button class="kt-my-profile" data-view="settings"><span class="avatar kt-self">${esc((state.nickname==='你'?'我':state.nickname).slice(0,1))}</span><span><strong>${esc(state.nickname==='你'?'我的主页':state.nickname)}</strong><small>今天也要好好生活 :)</small></span><span class="kt-edit-label">编辑</span></button><div class="kt-friend-heading">好友 <span>${state.profiles.length}</span></div><div id="contact-list">${contactCards()}</div><button class="kt-add-friend" id="add-friend-bottom">＋ 添加喜欢的人</button></div></div>`;$('#toggle-search').onclick=()=>{const el=$('#contact-search');el.hidden=!el.hidden;if(!el.hidden)el.focus();};$('#contact-search').oninput=e=>{$('#contact-list').innerHTML=contactCards(e.target.value);bindShared();};$('#add-profile').onclick=addProfile;$('#add-friend-bottom').onclick=addProfile;}
function renderMore(){screen.innerHTML=`<div class="page kt-main">${appHeader('更多','More',`<button class="icon-button" data-view="settings" aria-label="设置">${icon('settings')}</button>`)}<div class="page-body"><button class="kt-my-profile" data-view="profile">${avatar(profile())}<span><strong>${esc(profile().name)}</strong><small>编辑虚拟角色的名字、头像与风格</small></span><span>›</span></button><div class="kt-more-grid">${app('profile','人物设定','app-ivory')}${app('album','相册','app-blue')}${app('notes','便签','app-yellow')}${app('favorites','收藏','app-pink')}${app('settings','设置','app-grey')}${app('clock','时钟','app-purple')}</div><div class="kt-yellow-card"><span class="talk-mark">talk</span><h3>从「在干嘛」开始。</h3><p>不必每一句都很特别，<br>分享日常就已经很好。</p><button data-view="chat">去聊一会儿 →</button></div><div class="notice">KTalk 风格的非官方模拟体验。当前为本地规则回复，聊天保存在此浏览器中。</div></div></div>`;}
function renderChat(){const p=profile(),msgs=state.messages[p.id]||[];screen.innerHTML=`<div class="page chat"><header class="page-head"><button class="back" data-view="home" aria-label="返回聊天列表">‹</button>${avatar(p)}<div class="chat-title"><h2>${esc(p.name)}${p.isGroup?` (${p.memberIds.length+1})`:''}</h2><small>${pending.has(p.id)?'正在整理回复…':'虚拟角色 · 本地模拟回复'}</small></div><div class="head-right"><button class="icon-button" id="chat-find" aria-label="搜索当前聊天">${uiIcon('search')}</button><button class="icon-button" data-view="profile" aria-label="聊天设置">${uiIcon('more')}</button></div></header><div class="chat-messages" id="messages">${datedMessages(msgs,p)}${pending.has(p.id)?`<div class="msg">${avatar(p)}<div class="bubble typing-bubble" aria-label="正在整理模拟回复"><i></i><i></i><i></i></div></div>`:''}</div><div class="suggestions">${['今天有点累','最近在听什么歌','想和你说晚安'].map(t=>`<button data-say="${t}" ${pending.has(p.id)?'disabled':''}>${t}</button>`).join('')}</div><form class="composer" id="composer"><button type="button" class="composer-plus" id="chat-tools" aria-label="聊天工具">＋</button><textarea id="message-input" rows="1" maxlength="1200" placeholder="把想说的话，写在这里…" aria-label="消息内容" ${pending.has(p.id)?'disabled':''}></textarea><button type="button" class="voice-toggle" id="open-voice" aria-label="发送语音"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3m-3 0h6"/></svg></button><button class="send" type="submit" aria-label="发送消息" ${pending.has(p.id)?'disabled':''}>↑</button></form><div class="composer-note">虚构互动 · 对话仅保存在当前浏览器</div></div>`;scrollChat();$('#chat-find').onclick=findChat;$('#chat-tools').onclick=chatTools;$('#open-voice').onclick=voiceDialog;bindMessageActions();$('#composer').onsubmit=e=>{e.preventDefault();send($('#message-input').value);};$('#message-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(e.target.value);}};screen.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>send(b.dataset.say));screen.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>toggleFavorite(b.dataset.save));}
function datedMessages(msgs,p){let previous='';return msgs.map(m=>{const date=new Date(m.at).toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'}),label=date!==previous?`<div class="chat-date">${esc(date)}</div>`:'';previous=date;return label+messageMarkup(m,p);}).join('');}
function messageMarkup(m,p){const mine=m.role==='user',saved=state.favorites.some(f=>f.id===m.id),sender=m.senderId?state.profiles.find(x=>x.id===m.senderId)||{name:m.senderName||'群成员'}:p;return `<div class="msg ${mine?'mine':''}">${mine?'':avatar(sender)}<div class="msg-content">${mine?'':`<div class="message-author">${esc(sender.name)}</div>`}<div class="bubble ${m.type==='transfer'?'transfer-bubble':''}">${m.type==='transfer'?transferMarkup(m):m.type==='voice'?voiceMarkup(m):esc(m.text)}</div><div class="message-foot"><span>${time(m.at)}</span>${mine?'已读':`<button class="save-message ${saved?'saved':''}" data-save="${m.id}" aria-label="${saved?'取消收藏':'收藏消息'}">${saved?'★':'☆'}</button>`}</div></div></div>`;}
function findChat(){showModal(`<h3>搜索聊天</h3><input class="search" id="find-chat" placeholder="输入关键词" aria-label="聊天关键词"><div id="find-results" class="find-results"></div>`);const search=()=>{const q=$('#find-chat').value.trim().toLowerCase();$('#find-results').innerHTML=q?(state.messages[state.active]||[]).filter(m=>m.text.toLowerCase().includes(q)).map(m=>`<div class="favorite-card">${esc(m.text)}<small>${m.role==='user'?'我':esc(profile().name)} · ${time(m.at)}</small></div>`).join('')||'<p>没有找到匹配的消息。</p>':'<p>搜索当前对话中的消息。</p>';};$('#find-chat').oninput=search;search();$('#find-chat').focus();}
function chatTools(){showModal(`<h3>聊天工具</h3><div class="kt-tool-grid">${[['profile','人物设定'],['favorites','消息收藏'],['notes','写便签'],['album','相册']].map(([id,label])=>`<button class="subtle" data-tool="${id}">${icon(id)}${label}</button>`).join('')}</div><button class="subtle" id="tool-voice">♩ 发送语音</button><button class="subtle" id="tool-transfer">↗ 模拟转账</button><button class="subtle" id="tool-group">＋ 发起群聊</button>`);$('#tool-voice').onclick=()=>voiceDialog();$('#tool-transfer').onclick=()=>{$('#modal').close();transferDialog();};$('#tool-group').onclick=()=>{$('#modal').close();createGroupDialog();};$('#modal-content').querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{$('#modal').close();render(b.dataset.tool);});}
function scrollChat(){const el=$('#messages');if(el)el.scrollTop=el.scrollHeight;}
function send(raw,extra={}){if(isGroup()&&!membersOf(profile()).length){toast('群里还没有可回复的角色，请先编辑群成员。');return false;}const text=raw.trim();if(!text||pending.has(state.active))return false;const id=state.active;state.messages[id]??=[];const m={id:uid(),role:'user',text:text.slice(0,1200),at:Date.now(),...extra};state.messages[id].push(m);if(!persist()){state.messages[id].pop();return false;}queueReplies(id,text,!!extra.recording);return true;}
function toggleFavorite(id){const m=(state.messages[state.active]||[]).find(m=>m.id===id);if(!m)return;const saved=state.favorites.some(f=>f.id===id);state.favorites=saved?state.favorites.filter(f=>f.id!==id):[...state.favorites,{...m,name:m.senderName||profile().name}];persist();render('chat');toast(saved?'已取消收藏':'已放进心动收藏');}
function notify(p,m){const n=$('#notification');n.innerHTML=`<small>模拟消息 · 刚刚</small><strong>${esc(p.name)}</strong>${esc(m.text.slice(0,50))}`;n.hidden=false;n.onclick=()=>{state.active=p.id;persist();render('chat');};clearTimeout(notificationTimer);notificationTimer=setTimeout(()=>n.hidden=true,6500);}
function ping(){try{const audio=new(window.AudioContext||window.webkitAudioContext)(),o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=660;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.22);o.start();o.stop(audio.currentTime+.23);o.onended=()=>audio.close();}catch{}}
function renderProfile(){if(isGroup())return renderGroupSettings();const p=profile();screen.innerHTML=`<div class="page">${head('人物设定','创建你的虚拟聊天对象')}<div class="page-body"><div class="profile-header"><button id="change-avatar" style="background:transparent;padding:0" aria-label="更换头像">${avatar(p,'avatar-large')}</button><p>点击更换头像</p><span class="pill">虚构人物设定</span></div><form id="profile-form"><label class="field"><span>喜欢的名字</span><input name="name" maxlength="30" required value="${esc(p.name)}" placeholder="填写你喜欢的明星名字"></label><label class="field"><span>希望 TA 怎么聊天</span><select name="style">${Object.entries(STYLE_NAMES).map(([k,v])=>`<option value="${k}" ${p.style===k?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>人物介绍 / 你的设定</span><textarea name="bio" maxlength="500">${esc(p.bio)}</textarea><small>作为人物卡展示。当前模拟回复依据上方说话风格生成，不会理解这段自由描述。</small></label><label class="field"><span>初次见面的消息</span><textarea name="greeting" maxlength="500">${esc(p.greeting)}</textarea><small>用于新角色的第一条消息；保存不会覆盖已有对话。</small></label><button class="primary wide" type="submit">保存人物设定 ✦</button></form><button class="subtle" id="profile-chat">和 ${esc(p.name)} 聊聊天</button>${state.profiles.length>1?'<button class="danger" id="delete-profile">删除这个角色与其聊天记录</button>':''}</div></div>`;$('#profile-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target),name=String(data.get('name')).trim();if(!name){toast('先为这个角色起个名字吧。');return;}Object.assign(p,{name,style:data.get('style'),bio:String(data.get('bio')).trim(),greeting:String(data.get('greeting')).trim()});persist();toast('人物设定已保存');render('profile');};$('#change-avatar').onclick=()=>$('#avatar-upload').click();$('#profile-chat').onclick=()=>render('chat');if($('#delete-profile'))$('#delete-profile').onclick=()=>confirmDialog('删除这个角色？','这个角色的聊天记录会一并删除，心动收藏会保留。',()=>{state.profiles=state.profiles.filter(x=>x.id!==p.id);removeConversationAudio(p.id);delete state.messages[p.id];for(const g of state.groups)g.memberIds=g.memberIds.filter(id=>id!==p.id);pending.delete(p.id);state.active=state.profiles[0].id;persist();render('contacts');});}
function addProfile(){if(state.profiles.length>=20){toast('最多可以创建 20 位虚拟角色。');return;}const id=uid();state.profiles.push({id,name:'喜欢的明星',style:'gentle',bio:'在这里，写下你心中的人物设定。',avatar:'',greeting:'嗨，很高兴在这个小世界里遇见你。今天想聊点什么？'});state.messages[id]=[{id:uid(),role:'assistant',text:state.profiles.at(-1).greeting,at:Date.now()}];state.active=id;persist();render('profile');}
function renderSettings(){
  const settings = [
    {icon: '✈️', label: '飞行模式', value: '未开启', color: '#ff9500'},
    {icon: '📶', label: 'Wi-Fi', value: 'pocket-story', color: '#007aff'},
    {icon: '🔵', label: '蓝牙', value: '开启', color: '#007aff'},
    {icon: '📱', label: '蜂窝网络', value: '', color: '#4cd964'},
    {icon: '🔔', label: '通知', value: '', color: '#ff3b30'},
    {icon: '🔊', label: '声音与触感', value: '', color: '#ff3b30'},
    {icon: '🌙', label: '专注模式', value: '', color: '#5856d6'},
    {icon: '⏱️', label: '屏幕使用时间', value: '', color: '#5856d6'},
    {icon: '⚙️', label: '通用', value: '', color: '#8e8e93'},
    {icon: '🎨', label: '墙纸', value: '', color: '#64d2ff'},
    {icon: '🔋', label: '电池', value: '', color: '#4cd964'},
    {icon: '🔒', label: '隐私与安全性', value: '', color: '#8e8e93'}
  ];
  screen.innerHTML=`<div class="ios-settings-app">
    <header class="ios-settings-head">
      <button data-view="phonehome" aria-label="返回桌面">‹</button>
      <strong>设置</strong>
    </header>
    <div class="ios-settings-body">
      <div class="ios-settings-profile">
        <div class="ios-settings-avatar">S</div>
        <div class="ios-settings-profile-info">
          <strong>seulgi</strong>
          <small>Apple 服务、已订阅项目和购买项目</small>
        </div>
        <span>›</span>
      </div>
      <div class="ios-settings-group">
        ${settings.slice(0, 5).map(item => `
          <div class="ios-settings-item">
            <span class="ios-settings-icon" style="background:${item.color}">${item.icon}</span>
            <span class="ios-settings-label">${item.label}</span>
            ${item.value ? `<small class="ios-settings-value">${item.value}</small>` : ''}
            <span class="ios-settings-arrow">›</span>
          </div>
        `).join('')}
      </div>
      <div class="ios-settings-group">
        ${settings.slice(5, 8).map(item => `
          <div class="ios-settings-item">
            <span class="ios-settings-icon" style="background:${item.color}">${item.icon}</span>
            <span class="ios-settings-label">${item.label}</span>
            <span class="ios-settings-arrow">›</span>
          </div>
        `).join('')}
      </div>
      <div class="ios-settings-group">
        ${settings.slice(8).map(item => `
          <div class="ios-settings-item">
            <span class="ios-settings-icon" style="background:${item.color}">${item.icon}</span>
            <span class="ios-settings-label">${item.label}</span>
            <span class="ios-settings-arrow">›</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
  bindShared();
}
function renderNotes(){screen.innerHTML=`<div class="page">${head('便签','存下那些还没来得及说的话',`<button class="icon-button" id="add-note" aria-label="新建便签">＋</button>`)}<div class="page-body"><div class="section-label">THINGS I WANT TO TELL YOU</div>${state.notes.length?state.notes.map(n=>`<button class="note-card" data-note="${n.id}"><h3>${esc(n.title)}</h3><p>${esc(n.body.slice(0,120))}</p><small>${new Date(n.at).toLocaleDateString('zh-CN')} · 点击编辑</small></button>`).join(''):'<div class="empty-note"><span class="empty-icon">✎</span>先记下来，等你想说的时候再说。</div>'}</div></div>`;$('#add-note').onclick=()=>editNote();screen.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>editNote(b.dataset.note));}
function editNote(id){const n=state.notes.find(n=>n.id===id);showModal(`<h3>${n?'编辑便签':'新建便签'}</h3><form id="note-form"><label class="field"><span>标题</span><input name="title" maxlength="60" value="${esc(n?.title||'')}" required placeholder="今天想记下什么"></label><label class="field"><span>内容</span><textarea name="body" maxlength="4000" rows="7" placeholder="慢慢写，不用急。">${esc(n?.body||'')}</textarea></label><button class="primary wide">保存便签</button></form>${n?'<button class="danger" id="delete-note">删除这条便签</button>':''}`);$('#note-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),title=String(f.get('title')).trim();if(!title)return;const item={id:id||uid(),title,body:String(f.get('body')).trim(),at:Date.now()};state.notes=n?state.notes.map(x=>x.id===id?item:x):[item,...state.notes];persist();$('#modal').close();render('notes');toast('已保存便签');};if(n)$('#delete-note').onclick=()=>{state.notes=state.notes.filter(x=>x.id!==id);persist();$('#modal').close();render('notes');};}
function renderAlbum(){discover('photos:backstage');const P=window.MainlineData.photos;const groups={};for(const p of P)(groups[p.album]??=[]).push(p);const body=Object.entries(groups).map(([album,list])=>`<div class="section-label">${esc(album)}</div><div class="gallery">${list.map(p=>`<button class="gallery-item" data-photo="${p.id}"><span class="photo-placeholder">${esc(album.slice(0,1))}</span><span>${esc(p.date)} · ${esc(p.caption)}</span></button>`).join('')}</div>`).join('');screen.innerHTML=`<div class="ios-native-app ios-photos-app">${iosBack('照片')}<div class="ios-app-scroll">${body}<p class="ios-local-label">所有照片只标拍摄时间与是否公开，不标注拍摄者。</p></div></div>`;bindShared();const evMap={'aug-0802':'photos:together','aug-0820':'photos:together','aug-0826':'photos:together','aug-0908':'photos:together','jp-0919a':'photos:fukuoka','jp-0919b':'photos:fukuoka','jp-0922':'photos:hyogo-water'};screen.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{const id=b.dataset.photo;if(evMap[id])discover(evMap[id]);const p=P.find(x=>x.id===id);if(p)showModal(`<h3>${esc(p.date)}</h3><p>${esc(p.caption)}</p><small>同人虚构 · 不标注拍摄者</small>`);});}

function isGroup(p=profile()){return !!p.isGroup;}
function membersOf(p){return (p.memberIds||[]).map(id=>state.profiles.find(x=>x.id===id)).filter(Boolean);}
function renderGroupSettings(){const g=profile();screen.innerHTML=`<div class="page">${head('群聊设置','群成员均为虚拟角色')}<div class="page-body"><form id="group-edit"><label class="field"><span>群聊名称</span><input name="name" maxlength="30" value="${esc(g.name)}" required></label><div class="section-label">群成员</div>${memberCheckboxes(g.memberIds)}<p class="count-label">选择至少两位虚拟角色。每轮最多由两位成员回复。</p><button class="primary wide">保存群聊设置</button></form><button class="subtle" data-view="chat">回到群聊</button><button class="danger" id="delete-group">删除群聊与聊天记录</button></div></div>`;$('#group-edit').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),ids=f.getAll('members'),name=String(f.get('name')).trim();if(ids.length<2||!name){toast('请填写群名，并选择至少两位成员。');return;}g.name=name;g.memberIds=ids;persist();toast('群聊已更新');render('profile');};$('#delete-group').onclick=()=>confirmDialog('删除这个群聊？','群里的聊天记录会被删除，联系人会保留。',()=>{removeConversationAudio(g.id);delete state.messages[g.id];state.groups=state.groups.filter(x=>x.id!==g.id);state.active=state.profiles[0].id;persist();render('home');});}
function memberCheckboxes(selected=[]){return state.profiles.map(p=>`<label class="group-member">${avatar(p)}<span>${esc(p.name)}</span><input type="checkbox" name="members" value="${p.id}" ${selected.includes(p.id)?'checked':''}></label>`).join('');}
function createGroupDialog(){if(state.profiles.length<2){showModal('<h3>先加几位好友吧</h3><p>群聊需要至少两位虚拟角色。你可以先添加喜欢的人，再创建群聊。</p><button class="primary wide" id="group-add-friend">添加虚拟好友</button>');$('#group-add-friend').onclick=()=>{$('#modal').close();addProfile();};return;}showModal(`<h3>发起群聊</h3><form id="group-form"><label class="field"><span>群聊名称</span><input name="name" required maxlength="30" placeholder="比如：今天也要见面"></label><div class="group-members">${memberCheckboxes()}</div><p>选择至少两位虚拟角色，和你一起聊天。</p><button class="primary wide">创建群聊</button></form>`);$('#group-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),ids=f.getAll('members'),name=String(f.get('name')).trim();if(ids.length<2||!name){toast('填写群名，并选择至少两位好友。');return;}const id='group_'+uid();state.groups.push({id,name,isGroup:true,memberIds:ids,avatar:'',bio:'虚拟群聊',greeting:'[群聊已创建]'});state.messages[id]=[];state.active=id;persist();$('#modal').close();render('chat');toast('群聊已创建');};}
function transferDialog(){const target=profile(),members=isGroup(target)?membersOf(target):[target];if(!members.length){toast('请先在群设置中添加成员。');return;}showModal(`<h3>模拟转账</h3><form id="transfer-form"><label class="field"><span>方向</span><select name="direction"><option value="outgoing">我转给对方</option><option value="incoming">模拟对方转给我</option></select></label>${members.length>1?`<label class="field"><span>选择群成员</span><select name="member">${members.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>`:''}<label class="field"><span>金额（人民币）</span><input name="amount" inputmode="decimal" placeholder="0.00" maxlength="9" required autocomplete="off"></label><label class="field"><span>转账备注</span><input name="note" placeholder="比如：请你喝咖啡" maxlength="60"></label><p class="transfer-disclaimer">仅生成聊天卡片，不涉及真实资金、银行卡或支付账户。</p><button class="primary wide">发送模拟转账</button></form>`);$('#transfer-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),raw=String(f.get('amount')).trim(),cents=parseAmount(raw);if(cents===null){toast('请输入 0.01～99999.99 的金额，最多两位小数。');return;}if(pending.has(target.id)){toast('请等本轮模拟回复结束后再发转账。');return;}const person=members.find(p=>p.id===f.get('member'))||members[0],incoming=f.get('direction')==='incoming',m={id:uid(),role:incoming?'assistant':'user',type:'transfer',amount:cents,note:String(f.get('note')).trim(),status:'pending',personId:person.id,personName:person.name,text:`[模拟转账] ¥${formatAmount(cents)} ${String(f.get('note')).trim()}`,at:Date.now(),...(incoming?{senderId:person.id,senderName:person.name}:{})};state.messages[target.id]??=[];state.messages[target.id].push(m);if(!persist()){state.messages[target.id].pop();return;}$('#modal').close();render('chat');};}
function parseAmount(raw){if(!/^\d{1,5}(\.\d{1,2})?$/.test(raw))return null;const [whole,fraction='']=raw.split('.'),amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));return amount>=1&&amount<=9999999?amount:null;}
function formatAmount(cents){return (cents/100).toFixed(2);}
function transferMarkup(m){return `<div class="transfer-card ${m.status==='received'?'received':''}"><div class="transfer-top"><span class="transfer-symbol">↗</span><div><strong>¥ ${formatAmount(m.amount)}</strong><p>${esc(m.note||'模拟转账')}</p></div></div><div class="transfer-party">${m.role==='user'?'转给':'来自'} ${esc(m.personName)}</div>${m.status==='received'?'<div class="transfer-received">✓ 已模拟收款</div>':`<button data-receive="${m.id}" class="transfer-receive">${m.role==='user'?'模拟对方收款':'确认收款（模拟）'}</button>`}<small>模拟转账 · 无真实资金</small></div>`;}
function receiveTransfer(id){const m=(state.messages[state.active]||[]).find(m=>m.id===id&&m.type==='transfer');if(!m||m.status==='received')return;confirmDialog('确认模拟收款？','只更新此聊天卡片的展示状态，不会发生资金变动。',()=>{m.status='received';m.receivedAt=Date.now();persist();render('chat');toast('已更新为模拟收款');});}
function durationFor(text){return Math.max(1,Math.ceil([...text].length/4));}
function voiceMarkup(m){return `<div class="voice-message"><button class="voice-play" data-play="${m.id}" aria-label="播放${m.audioId?'录音':'系统合成语音'}" aria-pressed="false"><span class="voice-speaker">◖</span><span class="voice-wave" aria-hidden="true">${[7,14,10,20,12,17,8,14].map(h=>`<i style="height:${h}px"></i>`).join('')}</span><span class="voice-duration">${m.audioId?'':'约'}${m.duration||durationFor(m.text)}″</span></button><div class="voice-label">${m.audioId?'本地录音':`系统合成语音 <button data-transcript="${m.id}" aria-expanded="false">文字</button>`}</div>${m.audioId?'':`<div class="voice-transcript" id="transcript-${m.id}" hidden>${esc(m.text)}</div>`}</div>`;}
function bindMessageActions(){screen.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const m=(state.messages[state.active]||[]).find(m=>m.id===b.dataset.play);if(m)PocketVoice.play(m,b,state.voiceLanguage,toast);});screen.querySelectorAll('[data-transcript]').forEach(b=>b.onclick=()=>{const text=$('#transcript-'+b.dataset.transcript);text.hidden=!text.hidden;b.setAttribute('aria-expanded',String(!text.hidden));});screen.querySelectorAll('[data-receive]').forEach(b=>b.onclick=()=>receiveTransfer(b.dataset.receive));}
function voiceDialog(){if(pending.has(state.active)){toast('等本轮模拟回复结束，就可以发送语音。');return;}showModal(`<h3>发送语音</h3><div class="voice-mode-tabs"><button class="selected" data-voice-mode="record">麦克风录音</button><button data-voice-mode="text">文字转语音</button></div><div id="voice-mode-body"></div><label class="settings-row voice-reply-option"><span>对方也用语音回复<small>使用浏览器的系统声音</small></span><input type="checkbox" id="voice-reply-option" class="switch" ${state.voiceReplies?'checked':''}></label>`);let recorder=null,blob=null,duration=0,previewUrl=null,closed=false,mode='record',recording=false,recordStarting=false;const conversationId=state.active;
 const cleanup=()=>{if($('#modal').open)return;closed=true;$('#record-preview audio')?.pause();recorder?.cancel();if(previewUrl)URL.revokeObjectURL(previewUrl);$('#modal').removeEventListener('close',cleanup);};$('#modal').addEventListener('close',cleanup);
 const renderMode=()=>{recorder?.cancel();recorder=null;blob=null;recording=false;recordStarting=false;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}$('#voice-mode-body').innerHTML=mode==='record'?`<div class="recorder-panel"><div class="recorder-time" id="record-time">00:00</div><button class="record-button" id="record-button" aria-label="开始录音">●</button><p id="record-status" role="status">点击开始录音，最长 60 秒</p><div id="record-preview"></div></div><p>录音保存在此浏览器，可回听；目前不会识别录音内容。</p><button class="primary wide" id="send-recording" disabled>发送语音</button>`:`<label class="field"><span>想说的话</span><textarea id="voice-text" maxlength="500" rows="5" placeholder="输入文字，发送为可播放的语音气泡。"></textarea></label><p>使用浏览器系统语音，播放时合成声音。</p><button class="primary wide" id="send-tts">发送语音</button>`;
 if(mode==='text'){$('#send-tts').onclick=()=>{const text=$('#voice-text').value.trim();if(!text){toast('先写下想说的话。');return;}state.voiceReplies=$('#voice-reply-option').checked;$('#modal').close();send(text,{type:'voice',duration:durationFor(text)});};return;}
 $('#record-button').onclick=async()=>{if(recordStarting)return;if(recording){$('#record-button').disabled=true;recorder.stop();return;}blob=null;$('#send-recording').disabled=true;$('#record-preview').innerHTML='';$('#record-status').textContent='正在请求麦克风权限…';recordStarting=true;$('#record-button').disabled=true;recorder=PocketVoice.createRecorder({onTime:seconds=>{if(closed)return;recordStarting=false;recording=true;$('#record-button').disabled=false;$('#record-button').classList.add('recording');$('#record-button').textContent='■';$('#record-time').textContent='00:'+String(seconds).padStart(2,'0');$('#record-status').textContent='正在录音 · 点击方块结束';},onReady:(audio,seconds)=>{if(closed)return;blob=audio;duration=seconds;recording=false;$('#record-button').disabled=false;$('#record-button').classList.remove('recording');$('#record-button').textContent='↻';$('#record-status').textContent='录好了，可以试听或重新录制';if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(blob);$('#record-preview').innerHTML=`<audio controls src="${previewUrl}" aria-label="录音试听"></audio>`;$('#send-recording').disabled=false;},onError:message=>{if(closed)return;recordStarting=false;recording=false;$('#record-button').disabled=false;$('#record-button').classList.remove('recording');$('#record-button').textContent='●';$('#record-status').textContent=message;}});await recorder.start();};
 $('#send-recording').onclick=async()=>{if(!blob)return;const button=$('#send-recording');button.disabled=true;const audioId=uid(),epoch=sessionEpoch;try{await PocketVoice.put(audioId,blob);if(closed||epoch!==sessionEpoch||state.active!==conversationId){await PocketVoice.remove(audioId);return;}state.voiceReplies=$('#voice-reply-option').checked;const sent=send('[语音消息]',{type:'voice',audioId,duration,recording:true});if(!sent){await PocketVoice.remove(audioId);button.disabled=false;return;}$('#modal').close();}catch(e){if(!closed){button.disabled=false;toast(e.message||'录音保存失败');}}};};
 $('#modal-content').querySelectorAll('[data-voice-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.voiceMode;$('#modal-content').querySelectorAll('[data-voice-mode]').forEach(x=>x.classList.toggle('selected',x===b));renderMode();});renderMode();}
function removeConversationAudio(id){for(const m of state.messages[id]||[]){if(m.audioId&&!state.favorites.some(f=>f.audioId===m.audioId))PocketVoice.remove(m.audioId).catch(()=>{});}}
function queueReplies(id,text,recording=false){const target=state.groups.find(g=>g.id===id)||state.profiles.find(p=>p.id===id);if(!target)return;const epoch=sessionEpoch;pending.add(id);if(view==='chat'&&state.active===id)render('chat');setTimeout(()=>{if(epoch!==sessionEpoch)return;const current=state.groups.find(g=>g.id===id)||state.profiles.find(p=>p.id===id);if(!current){pending.delete(id);return;}let actors=isGroup(current)?membersOf(current):[current];if(isGroup(current)){const offset=(state.messages[id]||[]).filter(m=>m.role==='user').length%Math.max(actors.length,1);actors=[...actors.slice(offset),...actors.slice(0,offset)].slice(0,2);}for(let i=0;i<actors.length;i++){const actor=actors[i],reply=recording?(i===0?'收到这段语音了。这里暂时还不能识别录音内容，可以把想聊的内容打成文字，我再接着回复。':'你也可以用文字转语音发消息，这样我就能根据文字接着聊。'):simulatedReply(text,actor,(state.messages[id]||[]).filter(m=>m.role==='user'||m.senderId===actor.id||!isGroup(current)),state.nickname).text;const m={id:uid(),role:'assistant',text:reply,at:Date.now()+i,...(isGroup(current)?{senderId:actor.id,senderName:actor.name}:{}),...(state.voiceReplies?{type:'voice',duration:durationFor(reply)}:{})};state.messages[id].push(m);}pending.delete(id);persist();if(state.sound)ping();if(view==='chat'&&state.active===id)render('chat');else if(actors.length)notify(current,state.messages[id].at(-1));},950+Math.random()*700);}

/* Chapter-one phone traces. These are explicitly fictional local records, not claims about real people. */
function renderPhone(){discover('call:missed-0910');discover('call:missed-0912');const calls=window.MainlineData.calls;const kind=(t)=>t==='未接来电'?'missed':t==='呼出电话'?'outgoing':'incoming';const arr=(k)=>k==='outgoing'?'↗':'↙';screen.innerHTML=`<div class="ios-native-app ios-phone-app">${iosBack('电话')}<div class="ios-phone-tabs"><button class="active">全部</button><button>未接来电</button></div><div class="ios-app-scroll"><small class="ios-call-section">最近通话 · 8月—9月22日</small><div class="ios-call-list">${calls.map((item,index)=>`<button data-call-index="${index}" class="${kind(item.type)}"><span class="ios-call-avatar">${esc(item.name.slice(0,1))}</span><span><strong>${esc(item.name)}</strong><small>${arr(kind(item.type))} ${esc(item.type)}</small></span><time>${esc(item.time)}</time><b>ⓘ</b></button>`).join('')}</div><p class="ios-phone-note">大多数通话没有保存内容。能够回放的两段属于互动剧情音轨，不代表真实私人录音。</p><small class="ios-local-label">同人虚构 · 不连接真实通讯录</small></div><nav class="ios-phone-bottom"><span>★<small>个人收藏</small></span><span class="active">◷<small>最近通话</small></span><span>♙<small>通讯录</small></span><span>⌨<small>拨号键盘</small></span></nav></div>`;bindShared();screen.querySelectorAll('[data-call-index]').forEach(button=>button.onclick=()=>{const item=calls[Number(button.dataset.callIndex)];if(item.replay){const rp=window.MainlineData.callReplays[item.replay];if(item.replay==='B')discover('call:replay-B');const lines=rp.lines.map(l=>l.pause?'<p class="call-pause">…</p>':`<p class="call-line ${l.who==='s'?'me':'them'}"><b>${l.who==='s'?'涩琪':'柱现'}</b> ${esc(l.t)}</p>`).join('');showModal(`<h3>${esc(rp.title)}</h3><p class="call-replay-tag">剧情回放 · 互动剧情音轨</p>${lines}<small>${esc(rp.note)}</small>`);}else{showModal(`<h3>${esc(item.name)}</h3><p>${esc(item.type)} · ${esc(item.date)} ${esc(item.time)}</p><p>${esc(item.note)}</p><small>同人虚构剧情记录 · 不会拨打真实电话</small>`);}});}
const SMS_THREADS={
 tour:{name:'巡演事务',avatar:'巡',time:'19:06',preview:'明天集合提前十五分钟，新的 call sheet 已发邮箱。',service:true,messages:[['9月19日 · 12:18','今天彩排 15:30，服装确认改到侧台。'],['9月19日 · 19:06','明天集合提前十五分钟，新的 call sheet 已发邮箱。']]},
 hotel:{name:'酒店前台',avatar:'H',time:'20:18',preview:'两份热敷贴已由前台代收。',service:true,messages:[['9月19日 · 16:44','您询问的物品已送至房门口。如需其他帮助，请拨打前台。'],['9月19日 · 20:18','两份热敷贴已由前台代收，可随时领取。']]},
 jp:{name:'日本运营',avatar:'JP',time:'14:03',preview:'车辆 14:40 从 B1 出发，请确认随身证件。',service:true,messages:[['9月19日 · 08:12','早餐供应至 10:00。'],['9月19日 · 14:03','车辆 14:40 从 B1 出发，请确认随身证件。']]},
 parcel:{name:'包裹提醒',avatar:'✦',time:'16:20',preview:'你的包裹已放入自提柜。',service:true,messages:[['9月19日 · 16:20','你的包裹已放入自提柜，取件时间请见通知。']]}
};
function renderSms(){const D=window.MainlineData.sms;const meta={manager:{name:'manager',avatar:'M',time:'9月22日'},jpops:{name:'日本运营',avatar:'JP',time:'9月22日'},hotel:{name:'酒店前台',avatar:'H',time:'9月22日'}};const rows=Object.keys(meta).map(id=>{const m=meta[id],list=D[id]||[],preview=list.length?list[list.length-1].text:'';return `<button class="nf-sms-row" data-sms-thread="${id}"><span class="nf-sms-avatar muted">${esc(m.avatar)}</span><span><strong>${esc(m.name)}</strong><small>${esc(preview)}</small></span><time>${esc(m.time)}</time></button>`;}).join('');screen.innerHTML=`<div class="ios-native-app nf-extra"><header class="nf-extra-head"><button data-view="phonehome" aria-label="返回桌面">‹</button><strong>信息</strong><span>✎</span></header><div class="nf-extra-scroll"><div class="ios-sms-search">⌕ 搜索</div><small class="nf-extra-kicker">9月13日 — 9月22日 · 收件箱</small>${rows}<p class="nf-extra-hint">巡演、酒店与出行的事务通知。均为同人虚构，不连接真实号码。</p></div></div>`;bindShared();screen.querySelectorAll('[data-sms-thread]').forEach(button=>button.onclick=()=>{smsThread=button.dataset.smsThread;render('sms-chat');});}
function renderSmsChat(){if(smsThread==='manager'&&window.PocketMainline)window.PocketMainline.note('sms:staff');const D=window.MainlineData.sms;const name={manager:'manager',jpops:'日本运营',hotel:'酒店前台'}[smsThread]||'manager';const list=D[smsThread]||D.manager;const messages=list.map(x=>`<div class="nf-sms-date">${esc(x.date)}</div><div class="nf-sms-bubble">${esc(x.text)}</div>`).join('');screen.innerHTML=`<div class="ios-native-app nf-extra"><header class="nf-extra-head"><button data-view="sms" aria-label="返回短信列表">‹</button><strong>${esc(name)}</strong><span>···</span></header><div class="nf-extra-scroll nf-sms-conversation">${messages}</div><div class="nf-sms-service-note">服务通知 · 无法回复 · 同人虚构</div></div>`;bindShared();}

/* Home and Calendar are intentionally redefined here so the story timeline lives in one native-feeling app. */
function renderPhoneHome(){const D=window.MainlineData.desktop,B=D.badges;const cw=D.calendarWidget,ww=D.weatherWidget;screen.innerHTML=`<div class="ios-home"><div class="ios-wallpaper"></div><div class="ios-home-content ios-home-real"><div class="ios-home-widget-row"><button class="ios-widget-calendar" data-view="calendar"><span><small>${esc(cw.head)}</small><b>22</b></span><div><strong>日历</strong><p>${esc(cw.lines[0])}</p><em>${esc(cw.lines[1])}</em></div></button><button class="ios-widget-pann" data-view="weather"><header><i>☀</i><strong>天气</strong><small>神户</small></header><p>${esc(ww.sub)}</p><span>${esc(ww.head)}</span></button></div><div class="ios-app-grid ios-app-grid-merged">${iosApp('forum','Pann','forum','판','')}${iosApp('kkt','KakaoTalk','kakao','<span class="kt-bubble">TALK</span>',B.kkt)}${iosApp('instagram','Instagram','instagram','<span class="ig-camera"></span>')}${iosApp('youtube','YouTube','youtube','<span class="yt-play">▶</span>')}${iosApp('map','地图','map','<span>🗺</span>')}${iosApp('weather','天气','weather','<span class="ios-weather-mark"><i></i></span>')}${iosApp('calendar','日历','calendar','<span class="ios-calendar-mark"><small>9月</small><b>22</b></span>',B.calendar)}${iosApp('album','照片','photos','<span class="photo-flower">✿</span>')}${iosApp('notebook','备忘录','notebook','<span class="ios-book-mark">▤</span>')}${iosApp('settings','设置','ios-settings','<span class="ios-gear-mark">⚙</span>')}</div><div class="ios-page-dots" aria-hidden="true"><i></i><i></i></div><div class="ios-dock">${iosApp('phone','电话','phone','<svg class="ios-phone-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 4c-2 1-3 3-2 6 3 9 9 15 18 18 3 1 5 0 6-2l-4-5c-1-1-2-1-3 0l-2 2c-4-2-7-5-10-10l2-2c1-1 1-2 0-3Z" fill="currentColor"/></svg>',B.phone)}${iosApp('browser','Safari','safari','<span class="ios-safari-mark"><i></i></span>')}${iosApp('sms','信息','messages','<span class="ios-message-mark"></span>',B.sms)}${iosApp('music','音乐','music','<span class="ios-music-mark">♫</span>')}</div><p class="ios-sim-caption">一部遗失的备用手机 · 同人虚构</p></div></div>`;bindShared();const hint=window.PocketMainline&&window.PocketMainline.hint();if(hint&&EVIDENCE_APP[hint.missing]){const el=screen.querySelector('[data-view=\"' + EVIDENCE_APP[hint.missing] + '\"]');if(el)el.insertAdjacentHTML('beforeend','<i style=\"width:7px;height:7px;border-radius:50%;background:#d8345f;display:inline-block;margin-left:5px\"></i>');}}
function renderCalendar(){discover('cal:tour');const M=window.PocketMainline,prog=M?M.progress():{node:'N0',ended:false};const E=window.MainlineData.ending;const rank={N0:0,N1:1,N2:2,N3:3,N4:4,N5:5};const need={main:0,owner:1,august:2,gap:3,fukuoka:3,fukuokaDone:4,hyogo:4,locked:6};const open=(u)=>u==='locked'?false:(need[u]??0)<=(rank[prog.node]??0);const events=window.MainlineData.calendar;const rows=events.map(e=>{const isLocked=e.unlock==='locked',o=open(e.unlock);const title=isLocked?esc(e.title):(o?esc(e.title):'尚未开放');const sub=isLocked?(prog.ended?esc(E.lockedText):'找到更多线索后开放'):(o?esc(e.sub):'找到更多线索后开放');return `<button class="${(isLocked||!o)?'locked':''}" data-date="${esc(e.date)}" data-unlock="${esc(e.unlock)}"><time>${esc(e.date)}</time><strong>${title}</strong><small>${sub}</small></button>`;}).join('');screen.innerHTML=`<div class="ios-native-app ios-calendar-app">${iosBack('日历')}<div class="ios-app-scroll"><div class="ios-calendar-title"><span>2026年</span><strong>8月—9月</strong></div><p class="ios-calendar-hint">当前：${esc(prog.timeCursor)}。点日期把手机切到那一天。</p>${rows}</div></div>`;bindShared();screen.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{const ev=events.find(e=>e.date===b.dataset.date);if(ev&&ev.unlock==='locked'){screen.querySelector('.ios-calendar-hint').textContent=E.lockedText;return;}const o=ev&&open(ev.unlock);if(!o){screen.querySelector('.ios-calendar-hint').textContent='找到更多线索后开放';return;}if(b.dataset.date==='9月19日')discover('cal:fukuoka');M&&M.setTimeCursor(b.dataset.date);screen.querySelector('.ios-calendar-hint').textContent='当前：'+b.dataset.date;const btns=[...screen.querySelectorAll('[data-date]')];btns.forEach(x=>x.classList.toggle('today',x.dataset.date===b.dataset.date));});}

function renderTimeline(){render('calendar');}

/* The Phone app renders the full August–September history as one native list. */


function showModal(html){$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function confirmDialog(title,copy,fn){showModal(`<h3>${esc(title)}</h3><p>${esc(copy)}</p><div class="dialog-buttons"><button class="subtle" id="cancel-action">取消</button><button class="primary wide" id="confirm-action">确认</button></div>`);$('#cancel-action').onclick=()=>$('#modal').close();$('#confirm-action').onclick=()=>{$('#modal').close();fn();};}
function compressImage(file,max=800){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(new Error('请选择图片文件。'));if(file.size>15*1024*1024)return reject(new Error('请选择小于 15 MB 的图片。'));const reader=new FileReader();reader.onerror=()=>reject(new Error('图片读取失败。'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('这张图片无法读取，请换成 JPG、PNG 或 WebP。'));img.onload=()=>{const ratio=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f5ee';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.82));};img.src=reader.result;};reader.readAsDataURL(file);});}
$('#avatar-upload').onchange=async e=>{const file=e.target.files[0],p=profile();if(!file)return;try{const old=p.avatar;p.avatar=await compressImage(file,300);if(persist()){toast('头像已更新');render('profile');}else p.avatar=old;}catch(err){toast(err.message);}e.target.value='';};
$('#photo-upload').onchange=async e=>{const files=[...e.target.files];for(const f of files){if(state.photos.length>=20){toast('相册最多保存 20 张图片。');break;}try{const src=await compressImage(f,800);state.photos.push({id:uid(),name:f.name,src});if(!persist()){state.photos.pop();break;}}catch(err){toast(err.message);}}e.target.value='';render('album');};
$('#home').onclick=()=>render('phonehome');$('#enter-chat').onclick=()=>render('lock');$('#customize').onclick=()=>{customApp=true;render('profile');};$('.wordmark').onclick=e=>{e.preventDefault();render('phonehome');};$('#about').onclick=()=>showModal('<h3>Pocket Story · the same blank</h3><p>第一章从福冈首场结束后的同担消息开始。玩家通过论坛、公开 INS、机场图和官方更新整理时间线，从一部被捡到的手机读取涩琪留下的线索。</p><p>真实公开素材会标注来源；论坛内容、聊天与私人关系推测属于同人虚构。第一章不会开放主人公私聊，第二章和十月过渡内容也暂未开放。</p><p>LYSN 自由聊天、相册上传、便签等原有功能保留；进度和聊天只保存在当前浏览器，不连接真实账号。</p>');$('#close-modal').onclick=()=>$('#modal').close();$('#modal').onclick=e=>{if(e.target===$('#modal'))$('#modal').close();};
function tick(){const now=JapanStory.storyTime();$('#status-time').textContent=now;const clock=$('#home-clock');if(clock)clock.textContent=now;}render('lock');tick();setInterval(tick,15000);
}
