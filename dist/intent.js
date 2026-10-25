/* 意图分类：一句话可以命中多个标签，由流程按当前节点取合适的那一个。 */
(function (root) {
  'use strict';
  const RULES = [
    ['care_back', /你呢|你累不累|你还好吗|你吃了吗|你今天累|欧尼呢/],
    ['ask_back', /你还想去|你想去吗|你要去吗/],
    ['going', /到了|现在去|刚到|准备去|马上到|就去|在路上了|这就去/],
    ['not_done', /还没|还在按|等一下|一会儿|正在按/],
    ['still_hurts', /还疼|还是疼|有一点疼|有点疼|痛|紧|酸/],
    ['better', /好多了|没那么|好一点|好些|轻了|松了/],
    ['avoid', /没事|还好|差不多|没什么/],
    ['unsure', /不知道|说不上|可能吧|不清楚/],
    ['postpone', /等下|回头|晚点|再说|先回去放/],
    ['hesitate', /想去|犹豫|不一定|再看|想想/],
    ['decline_late', /晚了|太晚|太迟/],
    ['decline_tired', /累|想先回去|先回去|没力气/],
    ['decline_explicit', /不去了|不想去|不参加|算了/],
    ['convenience', /便利店|饭团|随便吃|买了|吃了一点|吃了点/],
    ['ate', /吃了|吃过了|吃饱/],
    ['not_ate', /还没吃|没吃|没胃口/],
    ['defensive', /不用担心|别担心|我好着呢/],
    ['finished', /按完|结束了|刚出来|按过了|弄完了|刚回|出来了/],
    ['irrelevant', /天气|下雨|好冷|好热/]
  ];
  function classify(text) {
    const t = String(text || '');
    const tags = RULES.filter(([, re]) => re.test(t)).map(([k]) => k);
    const tone = tags.includes('care_back') ? 'concerned'
      : /ㅋㅋ|ㅎㅎ|啦|呀|～|~|嘿嘿|哈哈/.test(t) ? 'light'
      : /不|没|算了/.test(t) ? 'defensive'
      : /可能|应该|大概|吧|差不多/.test(t) ? 'hedged'
      : 'plain';
    return {
      tags,
      primary: tags[0] || 'unknown',
      tone,
      certainty: /可能|应该|大概|吧|差不多/.test(t) ? 'low' : /一定|肯定/.test(t) ? 'high' : 'medium',
      care_direction: tags.includes('care_back') ? 'toward_leader' : 'neutral',
      avoidance: tags.includes('avoid') ? 'high' : tags.includes('postpone') ? 'medium' : 'low'
    };
  }
  root.PocketIntent = { classify };
  if (typeof module !== 'undefined') module.exports = root.PocketIntent;
})(typeof window === 'undefined' ? globalThis : window);
