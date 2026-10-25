/* Pocket Story Chapter 01. Isolated from free-chat and recorded-audio data. */
(function (root) {
  'use strict';

  const DATA = root.JapanStoryData;
  const KEY = 'pocket-story-same-blank-ch1-v2';
  const fresh = () => ({
    version: 2,
    episode: DATA.id,
    started: false,
    introRead: false,
    read: [],
    seen: [],
    saved: [],
    igSaved: [],
    forumReply: '',
    outsiderReply: '',
    judgment: '',
    rumorSeen: [],
    officialUnlocked: false,
    officialSeen: false,
    chapterComplete: false,
    chapter: { revision: 1, opening: false, read: [], invite: false, replied: false, step: 0, messages: [], sideMessages: {} }
  });

  function normalize(value) {
    const next = fresh();
    if (!value || value.version !== 2 || value.episode !== DATA.id) return next;
    for (const key of ['started', 'introRead', 'officialUnlocked', 'officialSeen', 'chapterComplete']) next[key] = value[key] === true;
    for (const key of ['read', 'seen', 'saved', 'igSaved']) {
      next[key] = Array.isArray(value[key]) ? [...new Set(value[key].filter((item) => typeof item === 'string'))] : [];
    }
    next.forumReply = ['uneasy', 'counter', 'wait'].includes(value.forumReply) ? value.forumReply : '';
    next.outsiderReply = ['facts', 'feeling', 'lost'].includes(value.outsiderReply) ? value.outsiderReply : '';
    next.judgment = ['changed', 'tired', 'unknown'].includes(value.judgment) ? value.judgment : '';
    next.rumorSeen = Array.isArray(value.rumorSeen) ? [...new Set(value.rumorSeen.filter((id) => ['first', 'second', 'third'].includes(id)))] : [];
    // Chapter progress must survive reloads even when replay data is missing or
    // shorter than before: keep whatever the save holds instead of resetting it.
    const events = Array.isArray(root.PocketChapterEvents) ? root.PocketChapterEvents : [];
    const storedChapter = value.chapter && typeof value.chapter === 'object' ? value.chapter : {};
    const rawRead = Array.isArray(storedChapter.read) ? storedChapter.read : [];
    for (const id of rawRead) {
      if (typeof id !== 'string' || next.chapter.read.includes(id)) continue;
      next.chapter.read.push(id);
      if (next.chapter.read.length === events.length) break;
    }
    const storedStep = Number(storedChapter.step);
    next.chapter.step = Number.isFinite(storedStep) ? Math.max(0, Math.min(4, Math.trunc(storedStep))) : 0;
    next.chapter.messages = Array.isArray(storedChapter.messages) ? storedChapter.messages
      .filter((item) => item && typeof item.text === 'string' && Number.isInteger(item.step))
      .slice(-24).map((item) => ({ step: item.step, text: item.text.trim().slice(0, 240) }))
      .filter((item) => item.text) : [];
    const allowedThreads = ['manager', 'group', 'wendy', 'japan', 'styling', 'joy'];
    next.chapter.sideMessages = {};
    for (const thread of allowedThreads) {
      const messages = storedChapter.sideMessages?.[thread];
      next.chapter.sideMessages[thread] = Array.isArray(messages)
        ? messages.filter((item) => item && typeof item.text === 'string')
          .slice(-30).map((item) => ({ text: item.text.trim().slice(0, 240) }))
          .filter((item) => item.text)
        : [];
    }
    next.chapter.opening = storedChapter.opening === true || next.chapter.step >= 1 || next.chapter.read.length > 0;
    next.chapter.invite = storedChapter.invite === true || next.chapter.opening;
    next.chapter.replied = storedChapter.replied === true || next.chapter.step >= 4;
    next.chapterComplete = value.chapterComplete === true || next.chapter.replied;
    return next;
  }

  let state;
  try { state = normalize(JSON.parse(root.localStorage.getItem(KEY))); } catch { state = fresh(); }
  let context = null;
  let route = 'ktstory';
  let postId = 'coldwar';
  let airportPhotoId = 'airport-seulgi-0914';
  let filter = '追星';
  let query = '';
  let sortMode = '热门';
  let eventIndex = 0;
  let contact = '组长老师';
  let youtubeChannel = 'feed';
  let youtubeVideo = '';
  let kktThread = 'wendy';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const notice = '<div class="nf-fiction">公开资料与虚构剧情分开标注 · 私人情节均为同人创作</div>';

  function save() {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch {
      context?.toast('剧情存档保存失败，请检查浏览器空间。');
      return false;
    }
  }

  function ready(value = state) {
    const total = Array.isArray(root.PocketChapterEvents) ? root.PocketChapterEvents.length : 0;
    return value.chapter.opening && (value.chapter.step >= 4 || (total > 0 && value.chapter.read.length === total));
  }

  function badge() { return !state.chapter.opening || (state.chapter.invite && !state.chapter.replied) ? '1' : ''; }

  function storyTime() { return '21:22'; }

  function boot(ctx) { context = ctx; }
  function go(next) { route = next; render(); }
  function wrap(html, extra = '') { return `<section class="nf-app ${['feed', 'post'].includes(route) ? 'nf-pann' : ''} ${extra}">${html}</section>`; }
  function head(title, back = 'feed', right = '') {
    return `<header class="nf-head"><button ${back === 'phonehome' ? 'data-nav' : 'data-route'}="${back}" aria-label="返回">‹</button><strong>${esc(title)}</strong>${right || '<button data-nav="phonehome" aria-label="返回手机">⌂</button>'}</header>`;
  }

  function open(next, ctx) {
    if (ctx) boot(ctx);
    if (next === 'forum') {
      route = 'feed';
      filter = '追星';
      query = '';
      state.started = true;
      save();
    } else {
      route = ['opening','storychat','couplechat','chapterend'].includes(next) ? 'currentchat' : next;
    }
    render();
  }

  function render() {
    if (!context) return;
    const views = { currentchat, sharedphotos, historychat, managerchat,
      opening, feed, post: thread, airportphoto: airportPhoto, official: officialPost,
      chapterend: chapterEnd, notebook, ktstory, storychat, instagram,
      youtube, weverse, couplechat, groupchat, sidechat
    };
    context.screen.innerHTML = (views[route] || feed)();
    const phoneScreen = context.screen.closest('.phone-screen');
    if (phoneScreen) phoneScreen.dataset.storyRoute = route;
    const statusTime = root.document?.querySelector('#status-time');
    if (statusTime) statusTime.textContent = storyTime();
    bind();
    const scroll = context.screen.querySelector('.nf-scroll');
    if (scroll) scroll.scrollTop = ['currentchat', 'managerchat', 'groupchat', 'sidechat'].includes(route) ? scroll.scrollHeight : 0;
  }

  function opening() { return currentchat(); }

  function ktstory() {
    return wrap(`<header class='nf-friends-head'><strong>好友</strong><span>⌕　♙＋　⚙</span></header><div class='nf-scroll nf-friends-list'><section class='nf-my-profile'><span class='nf-default-avatar'></span><strong>2sides</strong><button>Profile ＋</button></section><h3>Channel <span>⌃</span></h3><section class='nf-channel-row'><span class='nf-channel-icon'>Ch</span><strong>Channel</strong><b>›</b></section><h3>好友 6 <span>⌃</span></h3><button class='nf-friend-row nf-kkt-pinned' data-route='currentchat'><span class='nf-default-avatar'></span><span><strong>组长老师 <em class='nf-kkt-pin'>置顶</em></strong><small>${state.chapter.replied?'就附近，不走远':state.chapter.invite?'按完好点了吗？':'去按了吗？'}</small></span>${badge()?'<i>1</i>':''}</button><button class='nf-friend-row' data-kkt-thread='wendy'><span class='nf-kkt-avatar'>W</span><span><strong>Wendy</strong><small>到酒店以后跟我说一声</small></span></button><button class='nf-friend-row' data-route='groupchat'><span class='nf-kkt-avatar'>RV</span><span><strong>Red Velvet</strong><small>Yeri：合照发群里！</small></span></button><button class='nf-friend-row' data-route='managerchat'><span class='nf-kkt-avatar'>M</span><span><strong>manager</strong><small>明天集合提前十五分钟。</small></span></button><button class='nf-friend-row' data-kkt-thread='joy'><span class='nf-kkt-avatar'>J</span><span><strong>Joy</strong><small>不是说好要拍给我看吗ㅋㅋ</small></span></button></div><nav class='nf-kkt-tabs'><button class='active'>♟<small>好友</small></button><button>●<small>聊天</small></button><button>☎<small>通话</small></button><button>•••<small>更多</small></button></nav>`, 'nf-kkt-app nf-kkt-friends');
  }


  function judgmentMarkup() {
    const choices = {
      changed: ['她们看起来确实变了。', '我懂。我也会因为少了熟悉的东西而慌。不过“变了”到底指舞台状态还是她们之间，我们还分不清。'],
      tired: ['可能只是都太累了。', '可能。可是“只是太累”也会让担心的人没地方放情绪。楼主未必是在要一个结论，她可能就是想有人听见。'],
      unknown: ['我现在说不准。', '这个答案很难发在热帖里，但我觉得最诚实。刚才我又刷到隔壁版一条求助，看得心里有点堵。']
    };
    if (!state.judgment) return `<div class="nf-chat-choices"><button data-judgment="changed">她们看起来确实变了</button><button data-judgment="tired">可能只是都太累了</button><button data-judgment="unknown">我现在说不准</button></div>`;
    const [mine, reply] = choices[state.judgment];
    return `<div class="nf-chat-message me"><small>你 · 21:14</small><p>${mine}</p></div><div class="nf-chat-message them"><small>A</small><p>${reply}</p><p>我在恋爱版刷到一个求助标题，写着“年长的姐姐”。里面那句“她看过来，我会假装在看别处”让我停了好久。发帖人是谁我不知道，你要不要自己找来读读？</p><button class="nf-inline" data-category="恋爱解答">去恋爱版找那条帖 →</button><button class="nf-inline" data-judgment="reset">换个想法再聊 ↻</button></div>`;
  }

  function storychat() { return currentchat(); }

  function couplechat() { return currentchat(); }


  function bubbles(parts) {
    return parts.map(part=>`<div class="nf-chat-date">${esc(part.date)}</div>${part.lines.map(line=>`<div class="nf-chat-message ${line.role}"><small>${esc(line.role==='me'?'涩琪':part.who)}</small><p>${line.text==='［照片］'?'<button class="pc-attachment" data-route="sharedphotos">照片 · 原图暂缺</button>':esc(line.text)}</p></div>`).join('')}`).join('');
  }
  function sideMessageBubbles(thread) {
    return (state.chapter.sideMessages?.[thread] || []).map((item) =>
      `<div class="nf-chat-message me"><small>你 · 刚刚</small><p>${esc(item.text)}</p></div>`
    ).join('');
  }
  function sideComposer(thread, placeholder = '输入消息') {
    return `<form class="pc-composer" data-side-composer="${thread}"><button type="button" class="pc-composer-plus" aria-label="更多">＋</button><input maxlength="240" autocomplete="off" placeholder="${esc(placeholder)}" aria-label="KakaoTalk 消息" required><button aria-label="发送消息">↑</button></form>`;
  }
  function currentchat() {
    // 互动式聊天：一步步推进
    // step 0: 刚开始，只显示第一句
    // step 1: 玩家发了"嗯，刚按完回来"
    // step 2: 玩家发了"好"
    // step 3: 玩家发了"好一点了，没刚才那么紧"
    // step 4: 玩家发了"好啊"，第一章结束
    const step = state.chapter.step || 0;
    const lines = [];
    
    // 按步骤显示对话
    if(step >= 0) lines.push({role:'them',text:'去按了吗？'});
    if(step >= 1) lines.push({role:'me',text:'嗯，刚按完回来'});
    if(step >= 1) lines.push({role:'them',text:'先休息一下'});
    if(step >= 2) lines.push({role:'me',text:'好'});
    if(step >= 2) lines.push({role:'them',text:'按完好点了吗？'});
    if(step >= 3) lines.push({role:'me',text:'好一点了，没刚才那么紧'});
    if(step >= 3) lines.push({role:'them',text:'还想出去走走吗？'});
    if(step >= 3) lines.push({role:'them',text:'就附近，不走远'});
    if(step >= 4) lines.push({role:'me',text:'好啊'});
    
    const saved = new Map(state.chapter.messages.filter((item)=>item.step<=4).map((item)=>[item.step,item.text]));
    if(step >= 1) lines[1].text=saved.get(1)||lines[1].text;
    if(step >= 2) lines[3].text=saved.get(2)||lines[3].text;
    if(step >= 3) lines[5].text=saved.get(3)||lines[5].text;
    if(step >= 4) lines[8].text=saved.get(4)||lines[8].text;
    state.chapter.messages.filter((item)=>item.step>4).forEach((item)=>lines.push({role:'me',text:item.text}));
    const hints=['回复“去按了吗？”','输入消息','回复“按完好点了吗？”','回复散步邀请','输入消息'];
    const composer = `<form id="pc-story-composer" class="pc-composer"><input id="pc-story-input" maxlength="240" autocomplete="off" placeholder="${hints[step]||'输入消息'}" aria-label="KakaoTalk 消息" required><button aria-label="发送消息">↑</button></form>`;
    
    return wrap(`<header class="nf-kkt-chat-head"><button data-route="ktstory" aria-label="返回">‹</button><strong>组长老师</strong><span>⌕　☰</span></header><div class="nf-scroll nf-chat-scroll">${bubbles([{date:'9月19日 · 首场结束以后',who:'组长老师',lines}])}</div>${composer}`,'nf-story-chat kkt-conversation');
  }
  function sharedphotos() {
    if(!state.chapter.opening) return currentchat();
    return wrap(`${head('共享照片','currentchat')}<div class="nf-scroll pc-shared"><button class="pc-photo-record" data-photo-detail><span>▧</span><strong>8月2日 · 一起拍的照片</strong><small>原图暂缺</small></button><div id="pc-photo-detail" hidden><p>这条照片消息的原图尚未补齐。</p><button data-history="0">查看聊天位置 →</button></div></div>`);
  }
  function historychat() {
    if(!state.chapter.opening || eventIndex>state.chapter.read.length) return currentchat();
    const item=root.PocketChapterEvents[eventIndex];
    return wrap(`${head('组长老师','currentchat','<button data-route="sharedphotos">▧</button>')}<div class="nf-scroll nf-chat-scroll">${item.parts.some(p=>p.who==='manager')?`<section class="pc-context"><strong>manager</strong>${bubbles(item.parts.filter(p=>p.who==='manager'))}</section>`:''}${bubbles(item.parts.filter(p=>p.who==='组长老师'))}<div class="pc-history-nav"><button data-event-read="${eventIndex}">${eventIndex===6?'返回当前聊天':state.chapter.read.includes(item.id)?'继续查看后面的记录 →':'继续往后读 →'}</button></div></div><div class="pc-history-tabs">${root.PocketChapterEvents.map((e,i)=>i<=state.chapter.read.length?`<button data-history="${i}" class="${i===eventIndex?'active':''}">${esc(e.label)}</button>`:'').join('')}</div>`,'nf-story-chat kkt-conversation');
  }
  function managerchat() {
    const parts=root.PocketChapterEvents.flatMap((e,i)=>i<=state.chapter.read.length?e.parts.filter(p=>p.who==='manager'):[]);
    return wrap(`${head('manager','ktstory')}<div class="nf-scroll nf-chat-scroll">${bubbles(parts)}${sideMessageBubbles('manager')}</div>${sideComposer('manager', '发送消息给 manager')}`,'nf-story-chat kkt-conversation');
  }

  function groupchat() {
    return wrap(`${head('Red Velvet', 'ktstory')}<div class='nf-scroll nf-chat-scroll'><div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 10:28</small><p>涩琪先出发了吗？</p></div><div class='nf-chat-message me'><small>你 · 10:31</small><p>嗯，先过去排练。</p></div><div class='nf-chat-message them'><small>Yeri · 10:32</small><p>到日本帮我看便利店新品！！</p></div><div class='nf-chat-message them'><small>Joy · 10:34</small><p>她先落地再说ㅋㅋ</p></div><div class='nf-chat-date'>9月19日 · 福冈首场结束后</div><div class='nf-chat-message them'><small>Wendy · 21:12</small><p>首场顺利结束了吗？</p></div><div class='nf-chat-message them'><small>Joy · 21:13</small><p>我刚看到日本账号发预告了ㅠㅠ</p></div><div class='nf-chat-message them'><small>Yeri · 21:13</small><p>结束以后记得吃饭！！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:14</small><p>刚结束，大家辛苦了。</p></div><div class='nf-chat-message me'><small>你 · 21:14</small><p>结束了ㅎㅎ</p></div><div class='nf-chat-message them'><small>Wendy · 21:15</small><p>先休息一下，晚点再聊</p></div><div class='nf-chat-message them'><small>Joy · 21:15</small><p>让她们先喘口气吧ㅋㅋ</p></div><div class='nf-chat-message them'><small>Yeri · 21:16</small><p>合照发群里！</p></div><div class='nf-chat-message them'><small>组长老师 · 21:16</small><p>等官方发。</p></div><div class='nf-chat-message me'><small>你 · 21:17</small><p>嗯。</p></div>${sideMessageBubbles('group')}</div>${sideComposer('group', '发送消息到群聊')}`, 'nf-story-chat kkt-conversation');
  }

  function sidechat() {
    const chats = {
      wendy: { name: 'Wendy', body: `<div class='nf-chat-date'>9月14日</div><div class='nf-chat-message them'><small>Wendy · 18:06</small><p>安全到了吗？</p></div><div class='nf-chat-message me'><small>你 · 18:07</small><p>到了，在去酒店。</p></div><div class='nf-chat-message them'><small>Wendy · 18:08</small><p>吃饭了吗？</p></div><div class='nf-chat-message me'><small>你 · 18:08</small><p>飞机上吃了一点。</p></div><div class='nf-chat-message them'><small>Wendy · 18:09</small><p>这不算。到酒店以后跟我说一声。</p></div><div class='nf-chat-date'>9月19日</div><div class='nf-chat-message them'><small>Wendy · 16:40</small><p>彩排还好吗？</p></div><div class='nf-chat-message me'><small>你 · 16:47</small><p>嗯，没问题。</p></div>` },
      japan: { name: '日本运营', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>日本运营 · 12:10</small><p>福冈场后台拍摄安排已发送，请确认。</p></div><div class='nf-chat-message me'><small>你 · 12:14</small><p>确认了，谢谢。</p></div><div class='nf-chat-date'>9月19日</div><div class='nf-chat-message them'><small>日本运营 · 20:45</small><p>首场照片会在两位确认后上传。</p></div><div class='nf-chat-message them'><small>日本运营 · 20:46</small><p>如果有不使用的照片请直接标记。</p></div><div class='nf-chat-message me'><small>你 · 20:47</small><p>好。</p></div>` },
      styling: { name: '造型室', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>造型室 · 17:32</small><p>明天耳饰准备了两套，彩排后再决定。</p></div><div class='nf-chat-message me'><small>你 · 17:34</small><p>第二套轻一点吗？</p></div><div class='nf-chat-message them'><small>造型室 · 17:35</small><p>轻一点，也不会勾到衣服。</p></div><div class='nf-chat-message me'><small>你 · 17:36</small><p>那先试第二套。</p></div><div class='nf-chat-message them'><small>造型室 · 17:38</small><p>好，明天带到现场。</p></div>` },
      joy: { name: 'Joy', body: `<div class='nf-chat-date'>9月18日</div><div class='nf-chat-message them'><small>Joy · 22:01</small><p>便利店新品呢？</p></div><div class='nf-chat-message me'><small>你 · 22:05</small><p>没来得及去。</p></div><div class='nf-chat-message them'><small>Joy · 22:05</small><p>不是说好要拍给我看吗ㅋㅋ</p></div><div class='nf-chat-message me'><small>你 · 22:08</small><p>后面还有时间。</p></div><div class='nf-chat-message them'><small>Joy · 22:09</small><p>行程很长，别第一周就把自己累坏了。</p></div>` }
    };
    const chat = chats[kktThread] || chats.wendy;
    return wrap(`${head(chat.name, 'ktstory')}<div class='nf-scroll nf-chat-scroll'>${chat.body}${sideMessageBubbles(kktThread)}</div>${sideComposer(kktThread, `发送消息给 ${chat.name}`)}`, 'nf-story-chat kkt-conversation');
  }

  function isAvailable(post) {
    // 所有帖子都默认显示，先解决"没有找到帖子"的问题
    return true;
  }

  function visiblePosts() {
    return DATA.posts.filter((post) => {
      if (post.category !== filter) return false;
      if (!isAvailable(post)) return false;
      const haystack = [post.title, post.author, post.body, ...post.comments.map((comment) => `${comment.user} ${comment.text}`)].join(' ').toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    }).sort((a, b) => sortMode === '最新' ? b.time.localeCompare(a.time) : 0);
  }

  function postCard(post, index) {
    const rank = index + 1;
    return `<button class="nf-post-card" data-post="${post.id}"><span class="nf-pann-rank ${rank <= 3 ? 'top' : ''}">${String(rank).padStart(2, '0')}</span><span class="nf-pann-row"><span class="nf-row-title"><i class="nf-feed-tag">${esc(post.tag)}</i><strong>${esc(post.title)}</strong><em>(${post.comments.filter(c=>!c.after || state.chapter.read.length>=c.after).length})</em>${state.read.includes(post.id) ? '' : '<i class="nf-new-mark">N</i>'}</span><span class="nf-row-info"><span>${esc(post.author)}</span><span>${esc(post.time)}</span><span>浏览 ${esc(post.views)}</span></span></span></button>`;
  }

  function feed() {
    const officialBanner = state.officialUnlocked ? `<button class="nf-official-banner" data-route="official"><span>21:15 · RV JP</span><strong>福冈首场官方照片已发布</strong><b>查看 →</b></button>` : '';
    const timeline = filter === '追星' && !query ? `<section class="nf-forum-brief"><small>公开记录 · 09.14—09.19</small><div><button data-open-post="airport-gap"><time>14</time><strong>单人机场图</strong><span>目的地未写</span></button><button data-open-post="ins-context"><time>16</time><strong>个人 INS</strong><span>专辑与练习</span></button><button data-open-post="stage-counter"><time>19</time><strong>福冈首场</strong><span>现场说法不同</span></button></div></section>` : '';
    return wrap(`<header class="nf-pann-brand"><button class="nf-pann-menu" data-route="notebook" aria-label="打开备忘录">☰</button><div><strong>pann<span>판</span></strong><small>匿名讨论区</small></div><button class="nf-pann-search-icon" data-focus-search aria-label="搜索帖子">⌕</button><button class="nf-pann-mobile" data-nav="phonehome" aria-label="返回手机">⌂</button></header><nav class="nf-pann-topnav"><button data-filter="追星" class="${filter === '追星' ? 'active' : ''}">팬톡 <small>追星讨论</small></button><button data-filter="恋爱解答" class="${filter === '恋爱解答' ? 'active' : ''}">연애 <small>恋爱解答</small></button></nav><div class="nf-search"><span>⌕</span><form id="nf-search-form"><input id="nf-search" value="${esc(query)}" placeholder="搜索帖子或关键词" aria-label="搜索论坛"><button>搜索</button></form></div><div class="nf-pann-channel"><span>${filter === '追星' ? '팬톡 <b>福冈首场</b>' : '연애 <b>恋爱解答</b>'}</span><button data-my-posts>我的帖子 ›</button></div><div class="nf-scroll">${officialBanner}<section class="nf-pann-today"><div><h1>${filter === '追星' ? '今日热帖' : '恋爱解答'} <small>${filter === '追星' ? '오늘의 톡' : '연애 고민'}</small></h1><span>09.19 · ${storyTime()}</span></div><p>${filter === '追星' ? '正在讨论 <strong># 福冈首场的气氛</strong>' : '匿名求助 <strong># 日常相处</strong>'}</p></section><div class="nf-pann-sort"><span>${filter} · ${visiblePosts().length} 篇</span><div><button data-sort="热门" class="${sortMode === '热门' ? 'selected' : ''}">热门</button><i>│</i><button data-sort="最新" class="${sortMode === '最新' ? 'selected' : ''}">最新</button></div></div>${filter === '追星' && !query ? progressCard() : ''}<div class="nf-feed" id="nf-feed">${visiblePosts().map(postCard).join('') || '<div class="nf-empty">没有找到帖子。</div>'}</div><div class="nf-pann-footer"><strong>pann<span>판</span></strong><p>the same blank · Chapter 01</p><small>虚构同人社区 · 不连接真实平台</small></div></div><nav class="nf-bottom"><button class="selected" data-route="feed">톡<span>论坛</span></button><button data-route="notebook">▤<span>备忘录</span></button><button data-route="ktstory">◌<span>KKT${badge() ? ' · 1' : ''}</span></button><button data-nav="phonehome">▦<span>桌面</span></button></nav>`);
  }


  function forumHeader() {
    return `<header class="nf-head nf-pann-head"><button data-route="feed" aria-label="返回论坛">‹</button><strong><b>pann</b> <span>판</span> <small>톡톡</small></strong><button data-nav="phonehome" aria-label="返回手机">⌂</button></header>`;
  }

  function commentMarkup(comment, post, index) {
    const link = comment.link === 'instagram' ? `<button class="nf-inline" data-open-ig="sg-260916">${esc(comment.label)} ↗</button>` : '';
    return `<article class="nf-comment"><div class="nf-comment-meta"><strong>${esc(comment.user)}${comment.user === post.author ? '<i>楼主</i>' : ''}</strong><span>${index + 1}楼 · ${esc(comment.time)}</span></div><p>${esc(comment.text)}</p>${link}<div class="nf-pann-comment-foot"><span>回复</span><button aria-label="赞同此楼">△ ${Math.max(3, 34 - index * 3)}</button></div></article>`;
  }

  function forumReplyMarkup() {
    const choices = {
      uneasy: ['我也觉得有点不一样，但说不清是哪儿。', 'ㅇㅇ', '就是这种说不清才烦。我都怕自己把担心传给别人了。', '后排望远镜', '我理解你们担心。只求别把安可那段直接从记忆里删掉。'],
      counter: ['安可明明有靠近，标题是不是说太满了？', 'ㅇㅇ', '我正文写了不是零互动啊。你们都只看标题吗……', '路过的行李箱', '我就是被标题吓进来的，看完正文才知道你们其实在说两件事。'],
      wait: ['我先等官方图，再回来看看。', '同框收藏夹', '我也等。只是照片出来以后，可能还是解释不了现场的感觉。', '透明雨伞', '先等吧。我还在车站，手机已经快没电了。']
    };
    if (!state.forumReply) return `<section class="nf-forum-participate"><small>匿名访客 · 你会回哪一句？</small><button data-forum-reply="uneasy">我也觉得有点不一样，但说不清是哪儿</button><button data-forum-reply="counter">安可明明有靠近，标题是不是说太满了？</button><button data-forum-reply="wait">我先等官方图，再回来看看</button><p>这是本机的剧情选择，不会发布到真实论坛。</p></section>`;
    const [mine, user1, reply1, user2, reply2] = choices[state.forumReply];
    return `<section class="nf-forum-participate replied"><small>你加入了讨论 · 刚刚</small><p><b>匿名访客</b>　${mine}</p><p><b>${user1}</b>　${reply1}</p><p><b>${user2}</b>　${reply2}</p><button data-forum-reply="reset">换一种说法 ↻</button></section>`;
  }

  function outsiderReplyMarkup() {
    const choices = {
      facts: ['能确认的只有两个人今晚同台。机场图没写另一位的行程。', '噢，那张图不是“她没来”的证据。我刚差点被标题带跑，谢谢你把话说清楚。'],
      feeling: ['我们也知道没有证据。只是以前看她们很自然，今天心里突然空了一下。', '我懂了。外人想要一条证据，你们其实是在说自己为什么难过。刚才我问得太像审问了。'],
      lost: ['我也是被热榜拉进来的，看到现在脑子里有三个版本。', '笑死，终于有人跟我同桌补课。先记一条：现场不能拍，每个人看到的范围不一样。']
    };
    if (!state.outsiderReply) return `<section class="nf-forum-participate"><small>路人还在楼里 · 要怎么回答她？</small><button data-outsider-reply="facts">只告诉她今晚能确认的事</button><button data-outsider-reply="feeling">说说粉丝为什么会难过</button><button data-outsider-reply="lost">承认自己也快看晕了</button><p>本机剧情选择 · 不会发布到真实论坛。</p></section>`;
    const [mine, reply] = choices[state.outsiderReply];
    return `<section class="nf-forum-participate replied"><small>你们又聊了两句 · 刚刚</small><p><b>匿名访客</b>　${mine}</p><p><b>隔壁版误入</b>　${reply}</p><button data-outsider-reply="reset">换一种说法 ↻</button></section>`;
  }

  function rumorChainMarkup() {
    const fragments = [
      ['first', '20:07 · 最早的提问', '“我没刷到另一位的机场图。她已经过去了吗？”', '提问的人并不知道她在哪里。'],
      ['second', '20:19 · 被截掉开头的转述', '“另一位的机场图没有，应该还没飞？”', '猜测被写成了看似有方向的回答。'],
      ['third', '20:31 · 热榜里的说法', '“她还没去日本，所以两个人分开走。”', '一句没根据的推测又长出一个原因。']
    ];
    const complete = state.rumorSeen.length === 3;
    return `<section class="nf-rumor-chain"><small>论坛旧楼归档 · 虚构帖子</small><h2>一句话，传成了三句话</h2><p>逐条打开原句，看看哪一步开始多出了确定的结论。</p>${fragments.map(([id, label, quote, note]) => `<button data-rumor-fragment="${id}" class="${state.rumorSeen.includes(id) ? 'opened' : ''}"><span>${label}</span><strong>${state.rumorSeen.includes(id) ? quote : '点开查看当时写了什么 ↗'}</strong>${state.rumorSeen.includes(id) ? `<em>${note}</em>` : ''}</button>`).join('')}${complete ? '<div class="nf-rumor-reveal"><b>你找到了最初那句话。</b><p>“没刷到”经过两次转述，变成“她还没去”，又被接上“所以两人分开走”。今晚的同台推翻了传言的一部分，但并没有解释舞台上的紧张。</p><button data-route="storychat">把发现告诉 A →</button></div>' : `<p class="nf-rumor-count">已对照 ${state.rumorSeen.length}/3 条</p>`}</section>`;
  }

  function progressCard() {
    const tasks = [
      ['核对机场图能说明什么', state.read.includes('airport-gap')],
      ['听另一位观众怎么描述舞台', state.read.includes('stage-counter')],
      ['保存9月14日机场图', state.seen.includes('airport-seulgi-0914')],
      ['收藏9月16日公开 INS', state.igSaved.includes('sg-260916')]
    ];
    if (state.officialUnlocked) return `<button class="nf-progress-ready" data-route="official"><span>21:15 · 官方更新</span><strong>RV JP 发布了福冈首场照片</strong><b>查看照片 →</b></button>`;
    if (ready()) return `<div class="nf-progress-card ready"><small>21:14 · 讨论还在更新</small><h3>刚才谁都没有现场照片</h3><p>你已经看过相反的现场描述，也保存了两条公开记录。现在有人说 RV JP 更新了。</p><button class="nf-primary" data-refresh-official>刷新热帖，查看官方更新</button></div>`;
    return `<div class="nf-progress-card"><small>把讨论放在同一条时间线上</small><h3>这些说法能对得上吗？</h3><p class="nf-progress-intro">先听不同座位的观众，再回头看机场图和 INS。那句“她没去日本”又是从哪里来的？</p>${tasks.map(([label, done]) => `<p class="${done ? 'done' : ''}"><span>${done ? '✓' : '○'}</span>${label}</p>`).join('')}<div class="nf-progress-actions">${!state.read.includes('airport-gap') ? '<button data-open-post="airport-gap">核对机场说法</button>' : ''}${!state.read.includes('stage-counter') ? '<button data-open-post="stage-counter">另一种现场记忆</button>' : ''}${state.rumorSeen.length !== 3 ? '<button data-open-post="flight-rumor">追那句机场传言</button>' : ''}${!state.seen.includes('airport-seulgi-0914') ? '<button data-airport-photo="airport-seulgi-0914">查看机场原图</button>' : ''}${!state.igSaved.includes('sg-260916') ? '<button data-open-ig="sg-260916">打开16日 INS</button>' : ''}</div></div>`;
  }

  function thread() {
    const post = DATA.posts.find((item) => item.id === postId) || DATA.posts[0];
    const isMain = post.id === 'coldwar';
    const related = (post.related || []).map((id) => DATA.posts.find((item) => item.id === id)).filter((item) => item && isAvailable(item));
    const relatedMarkup = related.length ? `<section class="nf-related-threads"><small>这栋楼的人也在看</small>${related.map((item) => `<button data-open-post="${item.id}"><span>${esc(item.tag)} · ${esc(item.time)}</span><strong>${esc(item.title)}</strong><b>›</b></button>`).join('')}</section>` : '';
    const officialReturn = post.id === 'photo-reactions' ? '<button class="nf-pann-return" data-route="official">回到 RV JP 官方照片 →</button>' : '';
    if (!isAvailable(post)) return feed();
    const comments = post.comments.filter(c=>!c.after || state.chapter.read.length>=c.after).map(c=>({...c,time:c.time||'回复'}));
    const playerReplies = (isMain && state.forumReply ? 3 : 0) + (post.id === 'outsider-view' && state.outsiderReply ? 2 : 0);
    return wrap(`${forumHeader()}${notice}<div class="nf-scroll"><div class="nf-pann-breadcrumb"><button data-route="feed">pann</button><span>›</span><span>${esc(post.category)}</span></div><article class="nf-thread"><div class="nf-pann-thread-label">${post.tag === '热议' ? '<span>오늘의 톡</span> 今日热帖' : `${esc(post.tag)} · ${esc(post.category)}`}</div><h1>${esc(post.title)}</h1><div class="nf-pann-byline"><span>${esc(post.author)} (匿名)</span><span>${esc(post.time)}</span></div><div class="nf-pann-thread-stats">浏览 ${esc(post.views)}<span>回复 ${comments.length + playerReplies}</span></div><div class="nf-prose">${esc(post.body)}</div>${post.airportPhotos ? airportGallery() : ''}<div class="nf-pann-post-actions"><button class="nf-bookmark ${state.saved.includes(post.id) ? 'on' : ''}" data-save-post="${post.id}"><span>${state.saved.includes(post.id) ? '★' : '☆'}</span><strong>${state.saved.includes(post.id) ? '已收藏' : '收藏帖子'}</strong></button></div></article>${post.id === 'flight-rumor' ? rumorChainMarkup() : ''}${post.id === 'coldwar' ? forumReplyMarkup() : ''}${post.id === 'outsider-view' ? outsiderReplyMarkup() : ''}<div class="nf-comments-head"><strong>全部回复 <em>${comments.length + playerReplies}</em></strong></div>${comments.map((comment, index) => commentMarkup(comment, post, index)).join('')}${relatedMarkup}${officialReturn}<button class="nf-pann-return" data-route="feed">목록 · 返回列表</button></div><button class="nf-thread-bottom" data-route="notebook">▤ 打开备忘录</button>`);
  }

  function airportGallery() {
    return `<section class="nf-airport-gallery"><header><strong>公开机场图</strong><span>2026.09.14</span></header><div class="nf-airport-grid">${DATA.airportPhotos.map((photo) => `<figure><button data-airport-photo="${photo.id}"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1066" height="1600" loading="lazy"><span>查看并保存 ↗</span></button><figcaption>${esc(photo.caption)}<small>© ${esc(photo.credit)}</small></figcaption></figure>`).join('')}</div><p>真实公开图片仅作时间线参考；转载文字没有写目的地。</p></section>`;
  }

  function airportPhoto() {
    const photo = DATA.airportPhotos.find((item) => item.id === airportPhotoId) || DATA.airportPhotos[0];
    const saved = state.seen.includes(photo.id);
    return wrap(`${head('公开机场图', 'post')}<div class="nf-scroll nf-airport-detail"><img src="${photo.src}" alt="${esc(photo.alt)}" width="1066" height="1600"><div><small>${photo.date} · 公开资料</small><h1>${esc(photo.caption)}</h1><p>${esc(photo.note)}</p><p class="nf-source-credit">© ${esc(photo.credit)}</p><a href="${photo.source}" target="_blank" rel="noopener noreferrer">查看来源 ↗</a><button class="nf-primary" data-save-airport="${photo.id}">${saved ? '✓ 已保存到剧情相册' : '保存到剧情相册'}</button><button class="nf-text-button" data-route="post">返回热帖</button></div></div>`);
  }

  function instagram() { return root.InstagramArchive.html(state); }

  function officialPost() {
    if (!state.officialUnlocked) return thread();
    if (!state.officialSeen) { state.officialSeen = true; save(); }
    const post = DATA.officialPost;
    const aftermath = !state.read.includes('photo-reactions') ? `<div class="nf-after-photo"><small>21:18 · 论坛还在刷新</small><p>同一张合照，有人松了口气，也有人觉得问题还在。</p><button data-open-post="photo-reactions">回论坛看照片发出后的讨论 →</button></div>` : `<div class="nf-after-photo settled"><small>21:22 · 你看过了两边的说法</small><p>照片能确认两人同台与合照，不能解释台下的沉默。</p></div>`;
    return wrap(`${head('RV JP 官方更新', 'feed')}<div class="nf-scroll nf-official-post"><div class="nf-official-account"><span>RV</span><div><strong>@${esc(post.account)}</strong><small>官方日本账号</small></div><time>21:15</time></div><p class="nf-official-copy">${esc(post.text)}</p><div class="nf-official-grid">${DATA.officialPhotos.map((photo, index) => `<figure class="${index === 0 ? 'hero' : ''}"><img src="${photo.src}" alt="${esc(photo.alt)}" loading="lazy"><figcaption>${esc(photo.caption)}</figcaption></figure>`).join('')}</div><a class="nf-source-link" href="${post.source}" target="_blank" rel="noopener noreferrer">查看官方原帖 ↗</a><aside><strong>能确认的事</strong><p>福冈首场结束，两个人共同出现在官方照片里。</p><strong>仍然不能确认的事</strong><p>另一位具体抵达日本的时间，以及台下发生过什么。</p></aside>${aftermath}${judgmentMarkup()}${state.read.includes('photo-reactions') || state.chapterComplete ? `<button class="nf-primary" data-complete-chapter>${state.chapterComplete ? '✓ 第一章已完成' : '保存这条记录，结束第一章'}</button>` : ''}</div>`);
  }

  function chapterEnd() { return currentchat(); }

  function notebook() {
    return wrap(`${head('备忘录','ktstory')}<div class="nf-scroll pc-thread"><h2>日本</h2><p>想去的地方先存着，等排练结束再看。</p><p>外套、充电器。</p><button data-export>导出剧情存档</button><label>导入剧情存档<input type="file" id="nf-import" accept="application/json" hidden></label><button data-restart-chapter>重新体验第一章</button></div>`);
  }

  function youtube() {
    if(!Array.isArray(root.PocketYouTube)) return wrap(`${head('YouTube','phonehome')}<div class="nf-scroll yt-feed"><div class="nf-yt-wordmark"><i>▶</i> YouTube</div><p class="nf-source-label">公开视频资料库暂未载入；应用本身已可正常打开。</p><button class="nf-yt-card" data-nav="phonehome"><div class="nf-video-thumb"><span>POCKET STORY</span><i>▶</i></div><h3>返回手机后继续探索剧情</h3><p>资料恢复后会在这里显示公开视频。</p></button></div>`);
    const channels=Object.fromEntries(root.PocketYouTube.map(c=>[c.id,{...c,handle:c.id==='seulgi'?'@hi_sseulgi_':'@RedVelvet'}]));
    const avatar=c=>c.id==='seulgi'?'assets/avatars/seulgi.jpg':c.id==='irene'?'assets/avatars/irene.jpg':'assets/chapter1/rvjp-fukuoka-audience-full-20260919.jpg';
    const nav=`<header class="yt-top"><button data-nav="phonehome" aria-label="返回手机">‹</button><strong><i>▶</i> YouTube</strong><button data-yt-channel="subscriptions" aria-label="查看三个频道">☰</button></header>`;
    const bottom=`<nav class="yt-bottom"><button data-yt-channel="feed" class="${youtubeChannel==='feed'?'active':''}">⌂<small>首页</small></button><button data-yt-channel="shorts">▣<small>Shorts</small></button><button data-yt-channel="subscriptions">▤<small>订阅内容</small></button><button data-yt-channel="library">◉<small>我的</small></button></nav>`;
    if(youtubeVideo){const [key,n]=youtubeVideo.split(':'),c=channels[key],v=c.videos[Number(n)];return wrap(`${nav}<div class="nf-scroll yt-watch"><button class="yt-back" data-yt-back>‹ 返回</button><a class="yt-player" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer" style="--yt-cover:url('${esc(v.thumbnail)}')"><span>▶</span></a><h1>${esc(v.title)}</h1><p>${esc(c.name)} · ${esc(v.duration)}</p><div class="yt-actions"><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">在 YouTube 观看</a></div><button class="yt-channel-line" data-yt-channel="${key}"><img src="${avatar(c)}" alt=""><span><strong>${esc(c.name)}</strong><small>${esc(c.handle)}</small></span><b>已订阅</b></button></div>${bottom}`);}
    if(channels[youtubeChannel]){const c=channels[youtubeChannel];return wrap(`${nav}<div class="nf-scroll yt-channel-page"><section class="yt-channel-head"><img src="${avatar(c)}" alt="${esc(c.name)}头像"><div><h1>${esc(c.name)}</h1><p>${esc(c.handle)}</p><small>公开视频整理</small></div></section><div class="yt-tabs"><b>首页</b><span>视频</span><span>播放列表</span></div><h2>上传的视频</h2>${c.videos.map((v,i)=>`<button class="yt-video-row" data-yt-video="${c.id}:${i}"><span class="yt-thumb" style="--yt-cover:url('${esc(v.thumbnail)}')"></span><span><strong>${esc(v.title)}</strong><small>${esc(c.name)} · ${esc(v.duration)}</small></span><i>⋮</i></button>`).join('')}</div>${bottom}`);}
    const picks=[['seulgi',0],['irene',0],['redvelvet',5],['seulgi',1],['redvelvet',8]];
    return wrap(`${nav}<div class="yt-chips"><button>全部</button><button>音乐</button><button>Vlog</button><button>最近上传</button></div><div class="nf-scroll yt-feed"><section class="yt-subscriptions"><strong>订阅内容</strong><div>${Object.values(channels).map(c=>`<button data-yt-channel="${c.id}"><img src="${avatar(c)}" alt=""><small>${esc(c.name)}</small></button>`).join('')}</div></section>${picks.map(([key,i])=>{const c=channels[key],v=c.videos[i];return `<article class="yt-card"><button class="yt-card-thumb" data-yt-video="${key}:${i}" style="--yt-cover:url('${esc(v.thumbnail)}')"><span>▶</span></button><div><button data-yt-channel="${key}"><img src="${avatar(c)}" alt=""></button><p><strong>${esc(v.title)}</strong><small>${esc(c.name)} · ${esc(v.duration)}</small></p><i>⋮</i></div></article>`;}).join('')}</div>${bottom}`);
  }

  function weverse() {
    return wrap(`${head('Weverse', 'feed')}<div class="nf-scroll"><div class="nf-wv-title">W <span>Community</span></div><article class="nf-community"><small>FAN · 20:58</small><h3>首场辛苦了</h3><p>日本场不能拍，大家回去路上注意安全。等官方照片吧。</p></article>${notice}</div>`);
  }

  function albumCards() {
    const cards = [];
    if (state.seen.includes('airport-seulgi-0914')) cards.push(`<button class="gallery-item story-gallery" data-story-photo="airport-seulgi-0914"><img src="${DATA.airportPhotos[0].src}" alt="涩琪9月14日机场公开图"><span>09.14 · 机场图</span></button>`);
    if (state.officialUnlocked) cards.push(`<button class="gallery-item story-gallery" data-story-official><img src="${DATA.officialPhotos[0].src}" alt="福冈首场官方双人自拍"><span>09.19 · 福冈首场</span></button>`);
    if (!cards.length) return '';
    return `<div class="section-label story-album-label">CHAPTER 01 · 剧情相册</div><div class="gallery story-album-grid">${cards.join('')}</div>`;
  }

  function bindAlbum(screen) {
    screen.querySelectorAll('[data-story-photo]').forEach((button) => button.onclick = () => {
      airportPhotoId = button.dataset.storyPhoto;
      open('airportphoto', context);
    });
    screen.querySelectorAll('[data-story-official]').forEach((button) => button.onclick = () => open('official', context));
  }

  function bind() {
    const screen = context.screen;
    screen.querySelectorAll('[data-yt-channel]').forEach(b=>b.onclick=()=>{youtubeChannel=b.dataset.ytChannel;youtubeVideo='';render();});
    screen.querySelectorAll('[data-yt-video]').forEach(b=>b.onclick=()=>{youtubeVideo=b.dataset.ytVideo;render();});
    screen.querySelectorAll('[data-yt-back]').forEach(b=>b.onclick=()=>{youtubeVideo='';render();});
    screen.querySelectorAll('[data-kkt-thread]').forEach(b=>b.onclick=()=>{kktThread=b.dataset.kktThread;go('sidechat');});
    const composer=screen.querySelector('#pc-story-composer');
    if(composer) composer.onsubmit=(event)=>{
      event.preventDefault();
      const input=screen.querySelector('#pc-story-input'),text=input.value.trim();
      if(!text)return;
      const previous=state.chapter.step||0;
      state.chapter.step=Math.min(4,previous+1);
      state.chapter.messages.push({step:previous<4?state.chapter.step:5,text:text.slice(0,240)});
      state.chapter.messages=state.chapter.messages.slice(-24);
      // 同步原来的状态字段，保持兼容
      if(state.chapter.step >= 1) state.chapter.opening = true;
      if(state.chapter.step >= 3) state.chapter.invite = true;
      if(state.chapter.step >= 4){state.chapter.replied = true;state.chapterComplete=true;}
      save();
      render();
    };
    screen.querySelectorAll('[data-side-composer]').forEach((form) => form.onsubmit = (event) => {
      event.preventDefault();
      const input = form.querySelector('input');
      const text = input?.value.trim();
      const thread = form.dataset.sideComposer;
      if (!text || !thread) return;
      if (!state.chapter.sideMessages[thread]) state.chapter.sideMessages[thread] = [];
      state.chapter.sideMessages[thread].push({ text: text.slice(0, 240) });
      state.chapter.sideMessages[thread] = state.chapter.sideMessages[thread].slice(-30);
      save();
      render();
    });
    screen.querySelectorAll('[data-photo-detail]').forEach(b=>b.onclick=()=>{screen.querySelector('#pc-photo-detail').hidden=false;});
    screen.querySelectorAll('[data-history]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.history);if(i<=state.chapter.read.length){eventIndex=i;go('historychat');}});
    screen.querySelectorAll('[data-event-read]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.eventRead);if(i===state.chapter.read.length)state.chapter.read.push(root.PocketChapterEvents[i].id);save();if(i===6){if(!state.chapter.invite){state.chapter.invite=true;save();context.toast('组长老师：按完好点了吗？');}go('currentchat');}else{eventIndex=i+1;go('historychat');}});
    screen.querySelectorAll('[data-my-posts]').forEach(b=>b.onclick=()=>{if(state.chapter.read.length<4){context.toast('还没有帖子');return;}postId='older-sister';go('post');});
    if (route === 'instagram') {
      root.InstagramArchive.bind({
        screen,
        render,
        fiction: () => context.toast('第一章没有虚构 INS 动态。'),
        onSave: (id) => {
          state.igSaved = state.igSaved.includes(id) ? state.igSaved.filter((item) => item !== id) : [...state.igSaved, id];
          save();
          render();
          if (id === 'sg-260916' && state.igSaved.includes(id)) context.toast('已收藏9月16日公开 INS · 备忘录已更新');
        }
      });
    }
    screen.querySelectorAll('[data-route]').forEach((button) => button.onclick = () => go(button.dataset.route));
    screen.querySelectorAll('[data-nav]').forEach((button) => button.onclick = () => context.navigate(button.dataset.nav));
    screen.querySelectorAll('[data-open-post]').forEach((button) => button.onclick = () => {
      postId = button.dataset.openPost;
      if (!state.read.includes(postId)) state.read.push(postId);
      save();
      go('post');
    });
    screen.querySelectorAll('[data-post]').forEach((button) => button.onclick = () => {
      postId = button.dataset.post;
      if (!state.read.includes(postId)) state.read.push(postId);
      save();
      go('post');
    });
    screen.querySelectorAll('[data-filter]').forEach((button) => button.onclick = () => { filter = button.dataset.filter; query = ''; go('feed'); });
    screen.querySelectorAll('[data-category]').forEach((button) => button.onclick = () => { filter = button.dataset.category; query = ''; go('feed'); });
    screen.querySelectorAll('[data-sort]').forEach((button) => button.onclick = () => { sortMode = button.dataset.sort; go('feed'); });
    screen.querySelectorAll('[data-airport-photo]').forEach((button) => button.onclick = () => { airportPhotoId = button.dataset.airportPhoto; go('airportphoto'); });
    screen.querySelectorAll('[data-save-airport]').forEach((button) => button.onclick = () => {
      const id = button.dataset.saveAirport;
      if (!state.seen.includes(id)) state.seen.push(id);
      save();
      context.toast('已保存到剧情相册 · 备忘录已更新');
      render();
    });
    screen.querySelectorAll('[data-open-ig]').forEach((button) => button.onclick = () => {
      root.InstagramArchive.selectPost(button.dataset.openIg);
      go('instagram');
    });
    screen.querySelectorAll('[data-save-post]').forEach((button) => button.onclick = () => {
      const id = button.dataset.savePost;
      state.saved = state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id];
      save();
      render();
    });
    screen.querySelectorAll('[data-forum-reply]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.forumReply = button.dataset.forumReply === 'reset' ? '' : button.dataset.forumReply;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-outsider-reply]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.outsiderReply = button.dataset.outsiderReply === 'reset' ? '' : button.dataset.outsiderReply;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-rumor-fragment]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      const id = button.dataset.rumorFragment;
      if (!state.rumorSeen.includes(id)) state.rumorSeen.push(id);
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-judgment]').forEach((button) => button.onclick = () => {
      const top = screen.querySelector('.nf-scroll')?.scrollTop || 0;
      state.judgment = button.dataset.judgment === 'reset' ? '' : button.dataset.judgment;
      save();
      render();
      if (screen.querySelector('.nf-scroll')) screen.querySelector('.nf-scroll').scrollTop = top;
    });
    screen.querySelectorAll('[data-refresh-official]').forEach((button) => button.onclick = () => {
      if (!ready()) return;
      state.officialUnlocked = true;
      save();
      context.toast('21:15 · RV JP 发布了新动态');
      go('official');
    });
    screen.querySelectorAll('[data-complete-chapter]').forEach((button) => button.onclick = () => {
      state.chapterComplete = true;
      save();
      go('chapterend');
    });
    screen.querySelectorAll('[data-restart-chapter]').forEach((button) => button.onclick = () => {
      context.confirm('重新体验第一章？', '会清空这一章的帖子阅读、照片收藏和时间线记录。LYSN 聊天、你的相册照片与便签不会改变。', () => {
        state = fresh();
        postId = 'coldwar';
        filter = '追星';
        query = '';
        sortMode = '热门';
        save();
        context.navigate('lock');
        context.toast('第一章已回到 20:52');
      });
    });
    screen.querySelectorAll('[data-focus-search]').forEach((button) => button.onclick = () => screen.querySelector('#nf-search')?.focus());
    const form = screen.querySelector('#nf-search-form');
    if (form) form.onsubmit = (event) => { event.preventDefault(); query = screen.querySelector('#nf-search').value.trim(); go('feed'); };
    screen.querySelectorAll('[data-ig-open]').forEach((button) => button.onclick = () => {
      if (root.InstagramArchive.selectPost(button.dataset.igOpen)) go('instagram');
    });
    screen.querySelectorAll('[data-export]').forEach((button) => button.onclick = () => {
      const blob = new Blob([JSON.stringify({ format: 'pocket-story-ch1', state }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'the-same-blank-chapter-01-save.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    const input = screen.querySelector('#nf-import');
    if (input) input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        if (payload.format !== 'pocket-story-ch1') throw new Error();
        const next = normalize(payload.state);
        context.confirm('导入第一章存档？', '这会替换当前剧情进度，不影响 LYSN 自由聊天。', () => {
          state = next;
          save();
          render();
          context.toast('第一章存档已导入');
        });
      } catch {
        context.toast('无法读取这份第一章存档。');
      }
      input.value = '';
    };
  }

  root.JapanStory = {
    open, boot, badge, storyTime, albumCards, bindAlbum,
    started: () => state.started,
    normalize, fresh, ready,
    getState: () => JSON.parse(JSON.stringify(state)),
    searchPosts: (text = '') => DATA.posts.filter(p=>isAvailable(p) && [p.title,p.body].join(' ').includes(text)).map(p=>({id:p.id,title:p.title})),
    visiblePostsForTest: (text = '') => { query = text; return visiblePosts(); }
  };
  if (typeof module !== 'undefined') module.exports = root.JapanStory;
})(typeof window === 'undefined' ? globalThis : window);
