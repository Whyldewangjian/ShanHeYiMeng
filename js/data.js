// ============================================================
//  武侠文字游戏 · 数据文件（data.js）
//  五行 / 天赋树 / 门派 / 功法 / 武器 / 敌人 / 地图 / 事件 / 情侣 / 物品
// ============================================================

// ---------- 五行相克：金克木，木克土，土克水，水克火，火克金 ----------
const ELEMENTS = {
  jin:  { name: '金', color: '#d8d8e0', beats: 'mu' },
  mu:   { name: '木', color: '#5fd97a', beats: 'tu' },
  tu:   { name: '土', color: '#d8b26a', beats: 'shui' },
  shui: { name: '水', color: '#5fb8ff', beats: 'huo' },
  huo:  { name: '火', color: '#ff7a5f', beats: 'jin' }
};
function elementName(id) { return (ELEMENTS[id] && ELEMENTS[id].name) || '无'; }
function elementColor(id) { return (ELEMENTS[id] && ELEMENTS[id].color) || '#aaa'; }

// ---------- 性格四维（-100 ~ +100）与善恶/声望 ----------
const PERSONALITY_DIMS = [
  { id: 'xia', name: '侠', low: '戾气深重', high: '侠肝义胆', desc: '侠义 ↔ 戾气' },
  { id: 'gang', name: '刚', low: '至柔如水', high: '至刚至猛', desc: '刚猛 ↔ 柔韧' },
  { id: 'ming', name: '明', low: '沉溺大梦', high: '明心见性', desc: '求真 ↔ 沉溺' },
  { id: 'qing', name: '情', low: '铁石心肠', high: '情深义重', desc: '深情 ↔ 冷情' }
];
function personalityLabel(id, v) {
  v = Math.round(v || 0);
  let labels;
  if (id === 'xia') labels = ['戾气深重', '睚眦必报', '恩怨分明', '急公好义', '侠肝义胆'];
  else if (id === 'gang') labels = ['至柔如水', '柔和内敛', '刚柔并济', '刚毅果决', '至刚至猛'];
  else if (id === 'ming') labels = ['沉溺大梦', '随波逐流', '半信半疑', '洞察真伪', '明心见性'];
  else if (id === 'qing') labels = ['铁石心肠', '淡然自若', '外冷内热', '重情重义', '情深义重'];
  else return '无';
  return labels[v >= 50 ? 4 : v >= 15 ? 3 : v > -15 ? 2 : v > -50 ? 1 : 0];
}
function moralityForm(v) { v = Math.round(v || 0); return v >= 20 ? '善' : v <= -20 ? '恶' : '中立'; }
function reputationTier(rep) {
  rep = Math.round(rep || 0);
  if (rep >= 1200) return '天下共仰';
  if (rep >= 700) return '侠名远播';
  if (rep >= 400) return '名动一方';
  if (rep >= 200) return '声名鹊起';
  if (rep >= 80) return '小有名气';
  if (rep >= 20) return '初出茅庐';
  if (rep > -20) return '默默无闻';
  if (rep > -80) return '声名狼藉';
  if (rep > -200) return '恶名昭著';
  if (rep > -400) return '千夫所指';
  if (rep > -700) return '魔焰滔天';
  if (rep > -1200) return '天下共惧';
  return '一代魔头';
}
// 正面声望称号按等级封顶（防止低级刷声望过早称雄）；负面称号不受等级限制
const POS_REP_TIERS = ['初出茅庐', '小有名气', '声名鹊起', '名动一方', '侠名远播', '天下共仰'];
function reputationTierCapped(rep, level) {
  rep = Math.round(rep || 0);
  level = Math.round(level || 1);
  if (rep < 20) return reputationTier(rep);
  const actualIdx = rep >= 1200 ? 5 : rep >= 700 ? 4 : rep >= 400 ? 3 : rep >= 200 ? 2 : rep >= 80 ? 1 : 0;
  const capIdx = level < 10 ? 0 : level < 30 ? 1 : level < 50 ? 2 : level < 80 ? 3 : level < 100 ? 4 : 5;
  return POS_REP_TIERS[Math.min(actualIdx, capIdx)];
}
// 声望氛围分桶（正 5 档 / 负 3 档 / 中性 0，用于"同地点同档只显示一次"）
function repBucket(rep) {
  rep = Math.round(rep || 0);
  if (rep >= 700) return 5;
  if (rep >= 400) return 4;
  if (rep >= 200) return 3;
  if (rep >= 80) return 2;
  if (rep >= 20) return 1;
  if (rep <= -700) return -3;
  if (rep <= -200) return -2;
  if (rep <= -20) return -1;
  return 0;
}
// 进图氛围文案（按声望档位 + 场景：村镇/城市才念百姓，荒郊/坟地念山野，门派秘境不念）
function repAmbient(rep, scene) {
  rep = Math.round(rep || 0);
  const civ = scene === 'village' || scene === 'town';
  if (rep >= 700) return civ ? '百姓见你，纷纷拱手，有店家主动递上热茶。' : '飞鸟惊起，走兽远遁，你的名号连山林都知晓了。';
  if (rep >= 400) return civ ? '一路有人抱拳问好，说书人正拿你的故事换赏钱。' : '山野间有人认出你的名号，遥遥行了个礼。';
  if (rep >= 200) return civ ? '酒肆茶馆里，已有人低声谈论你的名号。' : '山道上偶有人认出你，侧目低语。';
  if (rep >= 80) return civ ? '街坊见你，笑着点头，有人低声议论你的名号。' : '';
  if (rep >= 20) return civ ? '街坊只当你是寻常过客，偶尔多看一眼。' : '';
  if (rep <= -700) return civ ? '整条街霎时一静，商户哐当关了门板。' : '阴风骤起，虫豸噤声，你的凶名令山林变色。';
  if (rep <= -200) return civ ? '孩童见你便哭，妇人忙把娃往屋里拽。' : '走兽伏地，飞禽不鸣，山林噤若寒蝉。';
  if (rep <= -20) return civ ? '行人见你，纷纷低头绕道。' : '';
  return '';
}

// ---------- 天赋树：6 大分支，每支 8 个节点（按顺序点亮） ----------
// per = 每级加成（百分比）
const TALENT_BRANCHES = [
  {
    id: 'li', name: '力道', icon: '⚔', color: '#ff7a5f', desc: '一力降十会',
    nodes: [
      { id: 'li1', name: '蛮力', max: 5, per: { atk: 0.03 }, desc: '每级攻击 +3%' },
      { id: 'li2', name: '破军', max: 5, per: { atk: 0.04, pierce: 0.03 }, desc: '攻击 +4%，无视防御 +3%' },
      { id: 'li3', name: '开山', max: 5, per: { atk: 0.05 }, desc: '攻击 +5%' },
      { id: 'li4', name: '裂石', max: 5, per: { atk: 0.05, critDmg: 0.06 }, desc: '攻击 +5%，暴击伤害 +6%' },
      { id: 'li5', name: '战神降世', max: 3, per: { atk: 0.08 }, desc: '攻击 +8%' },
      { id: 'li6', name: '气吞山河', max: 3, per: { atk: 0.10, hp: 0.05 }, desc: '攻击 +10%，气血 +5%' },
      { id: 'li7', name: '百战之躯', max: 3, per: { atk: 0.10, lifeSteal: 0.01 }, desc: '攻击 +10%，吸血 +1%' },
      { id: 'li8', name: '一力破万法', max: 1, per: { atk: 0.25 }, desc: '攻击 +25%（终极）' }
    ]
  },
  {
    id: 'ti', name: '铁骨', icon: '🛡', color: '#5fd97a', desc: '铜皮铁骨',
    nodes: [
      { id: 'ti1', name: '强身', max: 5, per: { hp: 0.05 }, desc: '气血 +5%' },
      { id: 'ti2', name: '铁布衫', max: 5, per: { def: 0.05 }, desc: '防御 +5%' },
      { id: 'ti3', name: '金钟罩', max: 5, per: { def: 0.05, thorn: 0.02 }, desc: '防御 +5%，反伤 +2%' },
      { id: 'ti4', name: '血海', max: 5, per: { hp: 0.07 }, desc: '气血 +7%' },
      { id: 'ti5', name: '不坏之身', max: 3, per: { def: 0.08, hp: 0.04 }, desc: '防御 +8%，气血 +4%' },
      { id: 'ti6', name: '磐石', max: 3, per: { def: 0.10 }, desc: '防御 +10%' },
      { id: 'ti7', name: '生生不息', max: 3, per: { hp: 0.08, hpRegen: 0.03 }, desc: '气血 +8%，回复 +3%' },
      { id: 'ti8', name: '金刚不坏', max: 1, per: { def: 0.20, hp: 0.15 }, desc: '防御 +20%，气血 +15%（终极）' }
    ]
  },
  {
    id: 'shen', name: '轻功', icon: '💨', color: '#5fb8ff', desc: '来去如风',
    nodes: [
      { id: 'shen1', name: '腿脚麻利', max: 5, per: { spd: 0.05 }, desc: '身法 +5%' },
      { id: 'shen2', name: '移形换影', max: 5, per: { dodge: 0.03 }, desc: '闪避 +3%' },
      { id: 'shen3', name: '踏雪无痕', max: 5, per: { spd: 0.06 }, desc: '身法 +6%' },
      { id: 'shen4', name: '灵蛇身', max: 5, per: { dodge: 0.04, spd: 0.03 }, desc: '闪避 +4%，身法 +3%' },
      { id: 'shen5', name: '鬼魅身法', max: 3, per: { spd: 0.08, dodge: 0.03 }, desc: '身法 +8%，闪避 +3%' },
      { id: 'shen6', name: '凌波微步', max: 3, per: { dodge: 0.06 }, desc: '闪避 +6%' },
      { id: 'shen7', name: '先手制人', max: 3, per: { spd: 0.10, crit: 0.02 }, desc: '身法 +10%，暴击 +2%' },
      { id: 'shen8', name: '踏天而行', max: 1, per: { spd: 0.20, dodge: 0.10 }, desc: '身法 +20%，闪避 +10%（终极）' }
    ]
  },
  {
    id: 'nei', name: '内息', icon: '🌀', color: '#d8b26a', desc: '内功深厚',
    nodes: [
      { id: 'nei1', name: '吐纳', max: 5, per: { mp: 0.06 }, desc: '内力 +6%' },
      { id: 'nei2', name: '调息', max: 5, per: { mpRegen: 0.05 }, desc: '内力回复 +5%' },
      { id: 'nei3', name: '气沉丹田', max: 5, per: { mp: 0.07 }, desc: '内力 +7%' },
      { id: 'nei4', name: '周天运转', max: 5, per: { mp: 0.06, mpRegen: 0.05 }, desc: '内力 +6%，回复 +5%' },
      { id: 'nei5', name: '一气呵成', max: 3, per: { mp: 0.09 }, desc: '内力 +9%' },
      { id: 'nei6', name: '返璞归真', max: 3, per: { mpRegen: 0.08 }, desc: '内力回复 +8%' },
      { id: 'nei7', name: '生生不息', max: 3, per: { mp: 0.10, hpRegen: 0.03 }, desc: '内力 +10%，气血回复 +3%' },
      { id: 'nei8', name: '天人合一', max: 1, per: { mp: 0.25 }, desc: '内力 +25%（终极）' }
    ]
  },
  {
    id: 'wu', name: '悟性', icon: '🌟', color: '#d18cff', desc: '举一反三',
    nodes: [
      { id: 'wu1', name: '耳聪目明', max: 5, per: { expBonus: 0.05 }, desc: '经验获取 +5%' },
      { id: 'wu2', name: '过目不忘', max: 5, per: { expBonus: 0.06 }, desc: '经验获取 +6%' },
      { id: 'wu3', name: '福至心灵', max: 5, per: { crit: 0.03 }, desc: '暴击 +3%' },
      { id: 'wu4', name: '慧眼', max: 5, per: { critDmg: 0.07 }, desc: '暴击伤害 +7%' },
      { id: 'wu5', name: '天道酬勤', max: 3, per: { expBonus: 0.10 }, desc: '经验获取 +10%' },
      { id: 'wu6', name: '顿悟', max: 3, per: { crit: 0.04, critDmg: 0.06 }, desc: '暴击 +4%，暴伤 +6%' },
      { id: 'wu7', name: '一朝开窍', max: 3, per: { expBonus: 0.12 }, desc: '经验获取 +12%' },
      { id: 'wu8', name: '通天彻地', max: 1, per: { expBonus: 0.30 }, desc: '经验获取 +30%（终极）' }
    ]
  },
  {
    id: 'fu', name: '福缘', icon: '🍀', color: '#5fd9c8', desc: '时来运转',
    nodes: [
      { id: 'fu1', name: '招财', max: 5, per: { goldBonus: 0.06 }, desc: '金钱获取 +6%' },
      { id: 'fu2', name: '鸿运', max: 5, per: { dropBonus: 0.06 }, desc: '掉落几率 +6%' },
      { id: 'fu3', name: '聚宝', max: 5, per: { goldBonus: 0.08 }, desc: '金钱获取 +8%' },
      { id: 'fu4', name: '天眷', max: 5, per: { dropBonus: 0.08, expBonus: 0.03 }, desc: '掉落 +8%，经验 +3%' },
      { id: 'fu5', name: '贵人相助', max: 3, per: { goldBonus: 0.10 }, desc: '金钱获取 +10%' },
      { id: 'fu6', name: '天降横财', max: 3, per: { goldBonus: 0.10, dropBonus: 0.06 }, desc: '金钱 +10%，掉落 +6%' },
      { id: 'fu7', name: '奇遇连连', max: 3, per: { dropBonus: 0.12 }, desc: '掉落几率 +12%' },
      { id: 'fu8', name: '天命之子', max: 1, per: { goldBonus: 0.25, dropBonus: 0.20 }, desc: '金钱 +25%，掉落 +20%（终极）' }
    ]
  }
];

// ---------- 门派（师门加成系统） ----------
// bonus = 入派即得的被动百分比加成；startTech = 入门功法；ranks = 职位晋升
const SECTS = [
  { id: 'shaolin', name: '少林派', element: 'tu', color: '#e8c86a',
    desc: '天下武功出少林，刚猛无俦，防御惊人。入门即练铁布衫。',
    bonus: { hp: 0.12, def: 0.12 }, startTech: 'luohan',
    ranks: ['俗家弟子', '入门弟子', '内门弟子', '核心弟子', '首座', '方丈'],
    rankBonus: { atk: 0.02, def: 0.02, hp: 0.02 },
    joke: '据说少林大师们这辈子只打两件事：木人桩和贪吃的小和尚。'
  },
  { id: 'wudang', name: '武当派', element: 'shui', color: '#5fb8ff',
    desc: '以柔克刚，内力绵长，是修身养性的好去处。',
    bonus: { mp: 0.15, mpRegen: 0.10 }, startTech: 'taiji',
    ranks: ['记名弟子', '入门弟子', '内门弟子', '真传弟子', '长老', '掌门'],
    rankBonus: { mp: 0.03, def: 0.01, spd: 0.01 },
    joke: '武当弟子最爱说："先别打，让我缓缓……再缓缓……"'
  },
  { id: 'emei', name: '峨眉派', element: 'mu', color: '#5fd97a',
    desc: '身法飘逸，剑走轻灵，据说门内全是女侠（和几位想混进去的男弟子）。',
    bonus: { spd: 0.15, dodge: 0.08 }, startTech: 'emei_jiuyang',
    ranks: ['外门弟子', '内门弟子', '亲传弟子', '护法', '长老', '掌门'],
    rankBonus: { spd: 0.03, crit: 0.02 },
    joke: '想进峨眉的男弟子，通常会先被问一句："你会绣花吗？"'
  },
  { id: 'gaibang', name: '丐帮', element: 'tu', color: '#d8b26a',
    desc: '天下第一大帮，消息最灵通，打狗棒法名震江湖。',
    bonus: { crit: 0.08, critDmg: 0.15 }, startTech: 'dagou',
    ranks: ['一袋弟子', '三袋弟子', '五袋弟子', '七袋弟子', '九袋长老', '帮主'],
    rankBonus: { atk: 0.02, crit: 0.02, goldBonus: 0.03 },
    joke: '丐帮的规矩：讨饭不积极，思想有问题。'
  },
  { id: 'tangmen', name: '唐门', element: 'jin', color: '#d8d8e0',
    desc: '暗器世家，例不虚发，据说连他们家的狗都会用暗器。',
    bonus: { crit: 0.06, critDmg: 0.25, atk: 0.05 }, startTech: 'qianji',
    ranks: ['外门弟子', '内门弟子', '核心弟子', '长老', '副门主', '门主'],
    rankBonus: { atk: 0.02, critDmg: 0.06 },
    joke: '唐门弟子出门，身上没带八种暗器，都不好意思跟人打招呼。'
  },
  { id: 'yihua', name: '移花宫', element: 'shui', color: '#7f9fff',
    desc: '神秘莫测，移花接玉，能夺人内力为己用。',
    bonus: { mp: 0.10, lifeSteal: 0.02, def: 0.05 }, startTech: 'yihua',
    ranks: ['外门侍者', '内门弟子', '亲传弟子', '宫主近侍', '副宫主', '宫主'],
    rankBonus: { lifeSteal: 0.005, def: 0.02 },
    joke: '移花宫不收男人。据说曾经有个男弟子混进去，被发现了，结局……很"移花"。'
  },
  { id: 'mojiao', name: '魔教', element: 'huo', color: '#ff5f8f',
    desc: '行事乖张，血魔功凶悍霸道，江湖正派闻之色变。',
    bonus: { atk: 0.18, lifeSteal: 0.03 }, startTech: 'xuemo',
    ranks: ['教众', '香主', '堂主', '护法', '长老', '教主'],
    rankBonus: { atk: 0.03, lifeSteal: 0.005 },
    joke: '魔教的口号是："你不入魔，怎么知道我魔教的好？"'
  },
  { id: 'huashan', name: '华山派', element: 'jin', color: '#ffd75f',
    desc: '剑法天下无双，剑意凛然，门下弟子个个要强。',
    bonus: { atk: 0.12, spd: 0.08 }, startTech: 'huashan_jian',
    ranks: ['外门弟子', '内门弟子', '亲传弟子', '首席弟子', '长老', '掌门'],
    rankBonus: { atk: 0.03, spd: 0.02 },
    joke: '华山派：我们只比剑，不比谁更卷。……其实是卷的。'
  },
  { id: 'kunlun', name: '昆仑派', element: 'tu', color: '#d0b060',
    desc: '万山之祖，仙家正统，守正出奇，正气凛然。',
    bonus: { def: 0.10, mp: 0.12 }, startTech: 'kunlun_xuan',
    ranks: ['外门弟子', '内门弟子', '真传弟子', '长老', '掌教', '真人'],
    rankBonus: { def: 0.02, mp: 0.02 },
    joke: '昆仑弟子见面先问："道友，今天你悟了没？"'
  },
  { id: 'xuedaomen', name: '血刀门', element: 'huo', color: '#e06060',
    desc: '以血炼刀，凶名赫赫，刀出必见血。',
    bonus: { atk: 0.15, lifeSteal: 0.03 }, startTech: 'xuedao_jing',
    ranks: ['刀奴', '血刀弟子', '血刀卫', '护法', '长老', '门主'],
    rankBonus: { atk: 0.03, lifeSteal: 0.005 },
    joke: '血刀门拜师仪式：先割一刀，见血才算入门。'
  },
  { id: 'xueshanpai', name: '雪山派', element: 'shui', color: '#cfe8ff',
    desc: '雪山之巅，剑法清冷如霜，出剑不留情。',
    bonus: { spd: 0.10, crit: 0.08 }, startTech: 'xueshan_jian',
    ranks: ['外门弟子', '内门弟子', '真传弟子', '首席弟子', '长老', '掌门'],
    rankBonus: { spd: 0.02, crit: 0.02 },
    joke: '雪山派的人说话都带寒气："师……兄……"'
  },
  { id: 'xingsu', name: '星宿派', element: 'mu', color: '#a0d080',
    desc: '用毒阴损，星宿老仙，法力无边（自封的）。',
    bonus: { dodge: 0.10, atk: 0.08 }, startTech: 'xingsu_du',
    ranks: ['药童', '星宿弟子', '星宿使者', '护法', '长老', '星主'],
    rankBonus: { dodge: 0.02, atk: 0.02 },
    joke: '星宿派口号："打不过就下毒，下毒不行就跑。"'
  },
  { id: 'wanshou', name: '万兽山庄', element: 'tu', color: '#c8b080',
    desc: '驯养猛兽，以兽为兵，庄中人个个皮糙肉厚。',
    bonus: { hp: 0.15, def: 0.10 }, startTech: 'wanshou_xinfa',
    ranks: ['驯兽童子', '庄丁', '驯兽师', '护庄', '长老', '庄主'],
    rankBonus: { hp: 0.03, def: 0.02 },
    joke: '万兽山庄的规矩：你咬我的狗，我就放我的虎。'
  },
  { id: 'wudu', name: '五毒教', element: 'mu', color: '#80d0a0',
    desc: '苗疆蛊术，五毒俱全，恩怨分明。',
    bonus: { thorn: 0.08, lifeSteal: 0.02 }, startTech: 'wudu_gong',
    ranks: ['蛊童', '五毒弟子', '蛊师', '长老', '护法', '教主'],
    rankBonus: { thorn: 0.02, atk: 0.02 },
    joke: '五毒教教规：人不犯我，我不放蛊。'
  },
  { id: 'mingjiao', name: '明教', element: 'huo', color: '#ff9040',
    desc: '光明圣火，正邪随心，江湖闻之色变。',
    bonus: { atk: 0.12, crit: 0.08 }, startTech: 'shenghuo_gong',
    ranks: ['教众', '五行旗', '掌旗使', '护法', '长老', '教主'],
    rankBonus: { atk: 0.02, crit: 0.02 },
    joke: '明教集会必喊："焚我残躯，熊熊圣火！"（然后分烤串）'
  },
  { id: 'duanshi', name: '大理段氏', element: 'jin', color: '#e0d0a0',
    desc: '大理皇族，一阳指冠绝天下，指力通神。',
    bonus: { mp: 0.12, atk: 0.08 }, startTech: 'yiyangzhi',
    ranks: ['家仆', '段氏子弟', '侍卫', '长老', '供奉', '家主'],
    rankBonus: { mp: 0.02, atk: 0.02 },
    joke: '段氏子弟最烦别人问："你会不会六脉神剑？"'
  }
];

// 各职位的等级门槛（索引 = sectRank）：核心弟子≈中前期，长老≈中期
const SECT_RANK_LEVELS = [1, 12, 24, 40, 58, 85];

// ---------- 散修（无门无派，天地为家） ----------
// 散修称号：随大境界进阶，称号越高机缘/身法加成越强（经验 / 金钱 / 身法 / 闪避 / 暴击）
const ROGUE_TITLES = [
  { name: '江湖散人', bonus: { expBonus: 0.10, goldBonus: 0.10, spd: 0.08 } },
  { name: '闲云野鹤', bonus: { expBonus: 0.12, goldBonus: 0.12, spd: 0.09, dodge: 0.04 } },
  { name: '逍遥浪子', bonus: { expBonus: 0.15, goldBonus: 0.15, spd: 0.10, dodge: 0.06 } },
  { name: '天地孤鸿', bonus: { expBonus: 0.18, goldBonus: 0.18, spd: 0.12, dodge: 0.08, crit: 0.05 } },
  { name: '破妄散人', bonus: { expBonus: 0.22, goldBonus: 0.22, spd: 0.14, dodge: 0.10, crit: 0.08 } }
];

// ---------- 江湖排行榜（比武台挑战，从第 10 名打到第 1 名） ----------
const RANKINGS = [
  { rank: 10, name: '铁掌帮·刘三刀', arch: 'qian_shou', level: 96, reward: { gold: 300, exp: 200 } },
  { rank: 9, name: '青城剑·卓不凡', arch: 'jian_si', level: 98, reward: { gold: 350, exp: 240 } },
  { rank: 8, name: '丐帮长老·鲁有脚', arch: 'gaibang_zhang', level: 100, reward: { gold: 400, exp: 280 } },
  { rank: 7, name: '峨眉剑·纪晓芙', arch: 'emei_di', level: 101, reward: { gold: 450, exp: 320 } },
  { rank: 6, name: '武当真人·殷六侠', arch: 'wudang_zhenren', level: 103, reward: { gold: 500, exp: 360 } },
  { rank: 5, name: '魔教护法·血手', arch: 'mojiao_hufa', level: 104, reward: { gold: 550, exp: 400 } },
  { rank: 4, name: '唐门·唐无影', arch: 'tangmen_zhu', level: 106, reward: { gold: 600, exp: 440 } },
  { rank: 3, name: '少林武僧·了尘', arch: 'shaolin_seng', level: 107, reward: { gold: 700, exp: 480 } },
  { rank: 2, name: '江湖榜魁·衍天机', arch: 'jiang_hu_bang', level: 109, reward: { gold: 800, exp: 520 } },
  { rank: 1, name: '天下第一·无名', arch: 'tian_xia_di_yi', level: 110, reward: { gold: 1000, exp: 600, rep: 50 } }
];

// ---------- 师门任务（type: kill=击杀 / boss=讨伐 / travel=前往；minRank=可接职位门槛） ----------
const SECT_TASKS = [
  { id: 'st1', name: '清理村中野狗', type: 'kill', target: 'yedog', count: 4, minRank: 0, contrib: 15, reward: { gold: 20, exp: 30 }, desc: '野狗扰民，去教训教训它们。' },
  { id: 'st2', name: '剿灭山贼喽啰', type: 'kill', target: 'shanzei', count: 5, minRank: 0, contrib: 20, reward: { gold: 30, exp: 40 }, desc: '青石山的山贼为祸一方。' },
  { id: 'st3', name: '前往青石山', type: 'travel', target: 'shan', count: 1, minRank: 0, contrib: 10, reward: { gold: 15, exp: 20 }, desc: '去青石山打探消息。' },
  { id: 'st4', name: '收集后厨食材', type: 'kill', target: 'chicken', count: 5, minRank: 0, contrib: 12, reward: { gold: 15, exp: 25 }, desc: '后厨缺食材，抓几只鸡回来。' },
  { id: 'st5', name: '猎杀野猪', type: 'kill', target: 'yezhu', count: 4, minRank: 1, contrib: 35, reward: { gold: 60, exp: 80 }, desc: '野猪下山祸害庄稼。' },
  { id: 'st6', name: '缉拿偷鸡贼', type: 'kill', target: 'toujizei', count: 5, minRank: 1, contrib: 30, reward: { gold: 50, exp: 70 }, desc: '偷鸡贼偷到师门头上了。' },
  { id: 'st7', name: '前往临江镇', type: 'travel', target: 'zhen', count: 1, minRank: 1, contrib: 25, reward: { gold: 40, exp: 60 }, desc: '去临江镇送一封信。' },
  { id: 'st8', name: '讨伐山贼王', type: 'boss', target: 'shanzei_wang', count: 1, minRank: 1, contrib: 50, reward: { gold: 100, exp: 150 }, desc: '山贼王为祸青石山，替天行道。' },
  { id: 'st9', name: '剿灭血魔教徒', type: 'kill', target: 'xuemo_itu', count: 5, minRank: 2, contrib: 60, reward: { gold: 120, exp: 150 }, desc: '魔教势力蠢蠢欲动。' },
  { id: 'st10', name: '猎杀妖狼', type: 'kill', target: 'yaolang', count: 4, minRank: 2, contrib: 70, reward: { gold: 140, exp: 170 }, desc: '妖狼成群，为祸乡里。' },
  { id: 'st11', name: '讨伐邪修', type: 'kill', target: 'xiexiu', count: 3, minRank: 2, contrib: 75, reward: { gold: 150, exp: 180 }, desc: '邪修为祸，人人得而诛之。' },
  { id: 'st12', name: '前往江湖官道', type: 'travel', target: 'jianghu', count: 1, minRank: 2, contrib: 50, reward: { gold: 80, exp: 100 }, desc: '去江湖官道护送要员。' },
  { id: 'st13', name: '前往魔教总坛', type: 'travel', target: 'mojiao_zongtan', count: 1, minRank: 3, contrib: 90, reward: { gold: 150, exp: 200 }, desc: '刺探魔教总坛虚实。' },
  { id: 'st14', name: '讨伐魔教长老', type: 'boss', target: 'mojiao_zhanglao', count: 1, minRank: 3, contrib: 130, reward: { gold: 300, exp: 400 }, desc: '魔教长老作恶多端，务必除之。' },
  { id: 'st15', name: '讨伐妖王', type: 'boss', target: 'yaowang', count: 1, minRank: 3, contrib: 120, reward: { gold: 250, exp: 350 }, desc: '妖王肆虐，师门命你除妖。' },
  { id: 'st16', name: '前往华山', type: 'travel', target: 'huashan', count: 1, minRank: 3, contrib: 80, reward: { gold: 120, exp: 160 }, desc: '去华山参加论剑之约。' }
];

// ---------- 区域场景分类（用于偶发事件的场景过滤） ----------
const REGION_SCENES = {
  cun: 'village', taohuawu: 'village',
  zhen: 'town', jilelou: 'town',
  shan: 'wild', heifeng: 'wild', jianghu: 'wild', pomiao: 'wild', wanshou: 'wild',
  zhuhai: 'forest', miaoling: 'forest', yaowanggu: 'forest', qingqiu: 'forest', baihuagu: 'forest',
  yunmeng: 'water', donghai: 'water', xingsuhai: 'water', tianchi: 'water', guixu: 'water',
  xiyu: 'desert',
  luansanggang: 'graveyard', yizhuang: 'graveyard', huangquan: 'graveyard', xiuluochang: 'graveyard',
  shaolinsi: 'sect', wudangshan: 'sect', tangjiawu: 'sect', cangjian: 'sect', xuedaomen: 'sect', xueshanpai: 'sect', mojiao_zongtan: 'sect', emei: 'sect', wuxiangsi: 'sect',
  kunlun: 'mystic', huashan: 'mystic', jianzhong: 'mystic', yaoyu: 'mystic', jianshengju: 'mystic', tianji: 'mystic', guanxingtai: 'mystic', mocheng: 'mystic', posuixukong: 'mystic', tianmen: 'mystic',
  yaoguang: 'town', kaiyang: 'town', tianquan: 'town', tianjicheng: 'town', tianxuan: 'town', yuheng: 'town', tianshu: 'town', ziwei: 'town',
  liuxi: 'village', daoxiang: 'village', luweidu: 'village', qingxi: 'village', sangtian: 'village', shiqiao: 'village', xinglin: 'village', zaomu: 'village',
  yueya: 'village', tuoling: 'village', zhuxi: 'village', shannan: 'village', shuofeng: 'village', baicaopo: 'village', shilipu: 'village', liuying: 'village',
  huangling: 'graveyard', tianlao: 'wild'
};

// ---------- 区域背景志（进图首次展示，可随时重读；每区 2~3 句风物/背景） ----------
const REGION_LORE = {
  cun: ['青山环抱，一水绕村，青石小径通到各家门前。', '村人日出而作、日落而息，日子淡得像一碗白水。', '只是近来村口总有生人窥探，平静之下暗流渐起。'],
  taohuawu: ['十里桃林，花谢花开，落英铺成一条香雪小径。', '坞中人多隐居避世，不问江湖恩怨。', '可每到花落时节，总有人一去不返。'],
  shan: ['村后荒山，乱石嶙峋，野兽夜夜长嚎。', '山贼盘踞多年，官府剿了几次，反倒越剿越多。', '山深处传说埋着前人宝藏，引得亡命之徒前赴后继。'],
  yunmeng: ['烟波浩渺，雾锁千泽，舟行其间如入迷梦。', '水中有旧楚沉船的残骸，也有水鬼夜哭的传闻。', '渔人只说：雾起时，别回头。'],
  luansanggang: ['乱坟遍地，白骨露野，野狗比人还多。', '义庄不收的、官府不问的，都扔在了这里。', '夜半磷火幽幽，据说是在等人收尸。'],
  zhen: ['水陆要冲，三教九流，码头的船帆遮天蔽日。', '鱼龙混杂之地，最不缺的就是骗子和买卖。', '酒肆茶楼里，一桩桩见不得光的生意正在成交。'],
  zhuhai: ['万竿修竹，碧浪连天，风过处如万顷波涛。', '竹径幽深，稍一失神便分不清来路。', '隐士高人爱在此结庐，剑客也爱在此试剑。'],
  heifeng: ['黑风岭上，寨墙高筑，刀枪林立。', '落草为寇的悍匪盘踞于此，劫商道、抢官银。', '寨主凶残之名，江湖上人人色变。'],
  yizhuang: ['一门破宅，常年停着无人认领的棺材。', '守庄的是个瘸腿老头，只在天黑后开门。', '据说有些尸体，夜里会自己坐起来。'],
  jianghu: ['尘土飞扬的官道，南来北往，车马不绝。', '江湖人行走其间，一言不合便是刀光剑影。', '路边的茶棚酒肆，是消息最灵通，也最要命的地方。'],
  pomiao: ['断壁残垣，蛛网结满神像，香火早已断绝。', '行脚僧、流浪汉、逃犯，都在此借宿。', '夜雨破庙，最易生出事端。'],
  guandao2: ['古时驿道，如今荒草没膝，只余残破的驿亭。', '送信的驿卒早绝了踪迹，倒是走镖的还常借道。', '老人说，这条道上，常有前朝鬼兵夜行军。'],
  emei: ['云海翻涌，金顶佛光，钟声悠远如隔世。', '峨眉剑派清修于此，门下多为女子。', '山色虽美，却藏着外人不知的剑阵机关。'],
  shaolinsi: ['千年古刹，晨钟暮鼓，香火鼎盛。', '殿前扫地老僧，扫了三十年落叶，无人知其深浅。', '藏经阁中武学如海，却非人人有缘得见。'],
  wudangshan: ['七十二峰，云雾缭绕，宛如仙境。', '真武殿前紫气东来，道士们舞剑如游龙。', '山不在高，有仙则名；武当之名，剑上见真章。'],
  cangjian: ['山庄深藏山腹，铸剑炉火百年不熄。', '天下名剑，十之三四出自此庄。', '庄主立誓：剑成之日，必以血开锋。'],
  tangjiawu: ['堡内机关密布，暗器藏于砖瓦之间。', '唐门弟子行走无声，出手必中。', '外人入堡，步步惊心，稍错一步便是万箭穿心。'],
  yaowanggu: ['谷中药草繁茂，四季常青，百鸟不惊。', '药王传人世代隐居，救人不问善恶。', '只是谷中也有毒草，药与毒，本在一念之间。'],
  miaoling: ['十万大山，瘴气弥漫，古木参天。', '苗家寨子隐于林间，蛊师巫医名震一方。', '外人误入，十去九不回。'],
  xuedaomen: ['血刀门立派于极恶之地，门规只有一条：强者为尊。', '门中刀法狠辣，出刀见血。', '正派视其为魔道，却无人敢轻易上门。'],
  xiyu: ['黄沙漫天，驼铃悠悠，绿洲如海市蜃楼。', '商队络绎，僧侣西来，异域武学与中原迥异。', '沙暴之下，埋着无数古国与尸骨。'],
  jilelou: ['销金窟里，红灯高挂，丝竹之声日夜不绝。', '楼中美人如云，美酒如河，千金散尽只在一夜。', '可这温柔乡，也是江湖最深的泥沼。'],
  qingqiu: ['青丘之山，四季花开，狐影绰绰。', '狐妖聚此，或魅惑，或报恩。', '月圆之夜，群狐拜月，天地为之色变。'],
  xueshanpai: ['雪山之巅，终年积雪，寒风如刀。', '雪山派弟子以寒功闻名，出手如冰。', '传闻峰顶雪莲，可起死回生。'],
  wanshou: ['庄中驯养猛兽，虎啸猿啼，日夜不绝。', '庄主通晓兽语，驭兽如兵。', '外人入庄，先过百兽这一关。'],
  mojiao_zongtan: ['血旗招展，白骨铺路，阴风阵阵。', '魔教总坛，正派禁地，入者九死一生。', '坛中高手如云，皆是一等一的狠人。'],
  jianzhong: ['荒山剑冢，插满断剑残锋，剑意冲霄。', '历代剑客埋剑于此，也埋下了未竟的剑意。', '有缘人至此，或能悟得一二剑道真谛。'],
  kunlun: ['昆仑之上，万山之祖，天光云影共徘徊。', '仙家洞府，道门圣地，凡人难以企及。', '墟中遗留着上古仙人的踪迹，真假难辨。'],
  huashan: ['五岳最险，一夫当关，万夫莫开。', '剑客云集，论剑台上，生死一瞬。', '华山之巅，云海翻腾，剑意纵横。'],
  xingsuhai: ['高原湖泊星罗棋布，如星宿散落人间。', '星宿派盘踞于此，行事诡秘，善恶难分。', '夜观星象，可知天机，亦可知人心。'],
  tianchi: ['高山天池，碧水如镜，倒映雪山。', '传说池中有异兽，见者或得福，或遭祸。', '池畔灵气逼人，是修行者梦寐之地。'],
  baihuagu: ['谷中百花终年不败，彩蝶纷飞，香雾缭绕。', '看似人间仙境，却暗藏致命花毒。', '越美的东西，往往越危险。'],
  yaoyu: ['妖族禁地，妖气冲天，凡人望而却步。', '大妖盘踞，小妖横行，处处杀机。', '有人说，这里曾是上古妖族的王庭。'],
  xiuluochang: ['古战场的残迹，怨气不散，杀意凝而不化。', '踏入此地的武者，极易被勾起心魔。', '传闻在修罗场活过三夜者，武功必有大成。'],
  jianshengju: ['茅屋数间，竹篱半掩，剑圣隐居于此。', '门前立着"剑"字巨石，一笔一划皆是剑意。', '求剑者络绎不绝，能入门者寥寥无几。'],
  donghai: ['东海之下，水晶宫阙，珊瑚成林。', '传说龙王与龙子龙孙居于此，镇守四海。', '凡人入海，非死即化，或成仙，或成鬼。'],
  guixu: ['大海之极，众水所归，深不可测。', '归墟之中，藏着天地间最古老的秘密。', '传闻有仙人下坠于此，亦有魔物自其中爬出。'],
  tianji: ['天机阁高居云端，能窥天机、算人命。', '阁中典籍浩如烟海，记载着江湖的过去与未来。', '可天机不可尽泄，泄者必遭天谴。'],
  guanxingtai: ['高台凌云，夜观天象，星斗仿佛触手可及。', '历代观星者在此推演天下大势。', '星象有变，江湖必有大事发生。'],
  huangquan: ['黄泉路上，阴风怒号，鬼哭不绝。', '生人勿近，入者难回。', '奈何桥、忘川河，皆在此处，只待有缘人。'],
  wuxiangsi: ['无相寺中，佛相庄严，禅意深深。', '寺中高僧修"无相功"，不着相、不动心。', '传闻寺中藏有化解天下武学的秘密。'],
  mocheng: ['魔域深渊，黑气翻涌，魔物嘶吼。', '魔教圣地，亦是封印上古魔头之处。', '深渊之下，镇压着不可名状的存在。'],
  posuixukong: ['时空破碎之地，天地法则混乱，景象光怪陆离。', '武者至此，或悟破境之法，或魂飞魄散。', '破碎虚空的尽头，据说是武道的极致。'],
  tianmen: ['天门立于九霄之上，云雾之中，若隐若现。', '传说推开天门，便可白日飞升，破碎虚空。', '千年来，无数强者叩门，无一成功。']
};

// ---------- 区域定场诗（章回体，每区一联；展示于背景志） ----------
const REGION_POEM = {
  cun: '青山抱古村，一水绕柴门。',
  taohuawu: '十里桃花坞，千株不记年。',
  shan: '乱石藏虎豹，荒山隐强梁。',
  yunmeng: '雾锁千顷泽，舟入不知归。',
  luansanggang: '白骨无人问，磷火夜自明。',
  zhen: '千帆临江泊，百味一镇收。',
  zhuhai: '万竿摇碧浪，一径入清幽。',
  heifeng: '黑风卷寨墙，刀光映月凉。',
  yizhuang: '棺停荒宅冷，鬼火照孤门。',
  jianghu: '车马踏尘起，江湖客路长。',
  pomiao: '残垣栖野鬼，破庙宿离人。',
  guandao2: '驿道没荒草，前朝鬼夜行。',
  emei: '金顶浮云海，钟声越翠微。',
  shaolinsi: '古刹闻钟鼓，禅心扫地僧。',
  wudangshan: '七十二峰秀，紫气绕真武。',
  cangjian: '炉火百年炽，藏锋待血开。',
  tangjiawu: '机关藏暗雨，一步一惊魂。',
  yaowanggu: '百草医天下，一念判死生。',
  miaoling: '十万山连瘴，蛊师隐雾林。',
  xuedaomen: '血刀出见血，门规强者尊。',
  xiyu: '黄沙埋古国，驼铃入暮云。',
  jilelou: '红绡销金窟，一梦误平生。',
  qingqiu: '狐影拜明月，花开四时春。',
  xueshanpai: '千峰披素雪，寒功镇雪门。',
  wanshou: '百兽听号令，庄门啸虎猿。',
  mojiao_zongtan: '血旗招白骨，阴风绕总坛。',
  jianzhong: '断剑埋荒冢，剑意尚冲霄。',
  kunlun: '万山之祖地，仙迹渺难寻。',
  huashan: '五岳最奇险，剑气压云台。',
  xingsuhai: '星落高原海，天机夜可观。',
  tianchi: '天池浮雪影，异兽隐深波。',
  baihuagu: '百花终不败，毒雾暗香藏。',
  yaoyu: '妖气冲霄汉，禁地绝人烟。',
  xiuluochang: '古战埋冤骨，杀意锁修罗。',
  jianshengju: '竹篱藏剑圣，巨石刻剑心。',
  donghai: '水晶宫阙里，龙子镇沧波。',
  guixu: '众水归墟处，天地古秘藏。',
  tianji: '高阁窥天机，典籍藏古今。',
  guanxingtai: '凌云观星斗，一象定乾坤。',
  huangquan: '阴风号鬼路，忘川待归人。',
  wuxiangsi: '佛相本无相，禅心不着尘。',
  mocheng: '黑气翻魔域，深渊镇古魔。',
  posuixukong: '时空乱法则，武道极尽头。',
  tianmen: '天门悬九霄，千载无人开。'
};

// ---------- 开场钩子（B型：个人小钩子，主线线索散在地图慢慢拼） ----------
const OPENING_HOOK = [
  {
    title: '青石村 · 破庙',
    lines: [
      '你自幼被村口破庙的老乞丐收养，无名无姓，只学了些粗浅拳脚。',
      '村里人都唤你「小乞儿」，唯有那老乞丐，总轻声叫你一声「娃」。'
    ]
  },
  {
    title: '半块玉佩',
    lines: [
      '他从不提你的身世。问得急了，也只摇头：时候未到。',
      '昨夜，他留书出走。枕边只余半块刻着云纹的玉佩，和一句交代。'
    ]
  },
  {
    title: '去寻另半块',
    lines: [
      '「去寻齐另半块玉佩，自会明白你从何而来。」',
      '天还没亮，你揣起玉佩、背好包袱，头也不回地踏出了青石村。'
    ]
  }
];

// ---------- 主线线索（完成地图任务获得；碎片拼出身世与「山河一梦」的真相） ----------
const MAIN_CLUES = [
  { id: 'c1', text: '玉佩上的云纹，与传说中「山河印」底部的纹路如出一辙。' },
  { id: 'c2', text: '你并非弃儿——当年拼死护你出逃的，是山河印最后一位守印人。' },
  { id: 'c3', text: '收养你的老乞丐，年轻时是江湖上赫赫有名的剑客，人称「云中客」。' },
  { id: 'c4', text: '山河印失窃那夜，青石村还少了一个襁褓中的婴儿——正是你。' },
  { id: 'c5', text: '「山河一梦」四字，刻在你那半块玉佩的云纹之下。' },
  { id: 'c6', text: '有人在暗中寻找另半块玉佩，来者不善，且与山河印失窃有关。' },
  { id: 'c7', text: '你的父亲，是守印世家最后一代传人，早已下落不明。' },
  { id: 'c8', text: '山河印不只是一件至宝——它维系着这方天地的存续。' },
  { id: 'c9', text: '魔教、天机阁、唐门……都在暗中追查这半块玉佩的下落。' },
  { id: 'c10', text: '灰袍人无尘曾说：你身上的半块玉佩，是这场「梦」的钥匙之一。' },
  { id: 'c11', text: '你的母亲，是守印世家外嫁的女儿，失窃那夜后便再无音讯。' },
  { id: 'c12', text: '有传言：两块玉佩合璧，既可重塑山河印，也能彻底毁掉这场大梦。' }
];

// ---------- 主线线索来源（绑地点「查探」获得；c1/c6 走秘密，c5/c10 走主线触发） ----------
const CLUE_SOURCES = {
  c2: { region: 'cun', loc: 'keting', flag: 'a1_2', desc: '客栈掌柜见你面善，压低声音，说起一桩陈年旧事。' },
  c3: { region: 'pomiao', loc: 'zhengdian', desc: '神像后压着一柄锈剑与半块旧布，隐隐透着剑意。' },
  c4: { region: 'zhen', loc: 'jiuguan', desc: '说书人醒木一拍，正讲起二十年前山河印失窃那夜。' },
  c7: { region: 'jianzhong', loc: 'zhongxin', desc: '冢心立着一块无字残碑，碑文被人刻意抹去。' },
  c8: { region: 'tianji', loc: 'cangshu', desc: '书架深处，一卷古籍记载着山河印的由来。' },
  c9: { region: 'kaiyang', loc: 'ky_qinglou', desc: '极乐楼雅室珠帘后，几个黑衣人正低声商议着什么。' },
  c11: { region: 'donghai', loc: 'shuijing', desc: '水晶宫深处，供着一支守印世家的旧信物。' },
  c12: { region: 'wuxiangsi', loc: 'shuijing2', desc: '水镜池中，映出两块玉佩合璧的幻象。' }
};
// 主线节点触发的线索（完成指定节点后自动获得）
const CLUE_STORY = { c5: 'a1_6', c10: 'a2_8' };

// ---------- 固定秘密（藏在特定地点，一次性发现；含一次性剧情装备与线索碎片） ----------
const SECRETS = [
  { id: 's_shan_didian', region: 'shan', loc: 'didian', name: '前人宝藏', desc: '拨开藤蔓，一口锈迹斑斑的铁箱赫然在目。', reward: { gold: 200, exp: 120 } },
  { id: 's_shan_zhai', region: 'shan', loc: 'zhai', name: '山贼王的宝刀', desc: '寨中暗室，供着一口寒气森森的宝刀。', reward: { weapon: 'shanbao' } },
  { id: 's_cun_jingshi', region: 'cun', loc: 'jingshi', name: '石碑密刻', desc: '石碑背面，隐隐刻着两行极小的字。', reward: { clue: 'c1' } },
  { id: 's_shaolin_yizhang', region: 'shaolinsi', loc: 'yizhang', name: '扫地僧的指点', desc: '扫地僧头也不抬，只道了一句口诀。', reward: { tech: 'yijinjing' } },
  { id: 's_wudang_zhenwu', region: 'wudangshan', loc: 'zhenwu', name: '真武传承', desc: '真武殿内，一缕纯阳真气若有若无。', reward: { tech: 'chunyang' } },
  { id: 's_huashan_lunjian', region: 'huashan', loc: 'lunjiantai', name: '失传剑意', desc: '论剑台的石板上，刻着半式剑招。', reward: { tech: 'huashan_jian' } },
  { id: 's_zhen_dufang', region: 'zhen', loc: 'dufang', name: '赌坊暗格', desc: '赌桌之下，暗格中藏着庄家的私房钱。', reward: { gold: 300 } },
  { id: 's_jianghu_shizi', region: 'jianghu', loc: 'shizi', name: '十字坡旧事', desc: '十字坡的土地庙里，供着一块无名木牌。', reward: { clue: 'c6' } },
  { id: 's_mojiao_xuechi', region: 'mojiao_zongtan', loc: 'xuechi', name: '血池淬体', desc: '血池翻涌，一缕凶煞之气直冲泥丸宫。', reward: { exp: 300, per: { gang: 5 } } },
  { id: 's_qingqiu_mingyue', region: 'qingqiu', loc: 'mingyue', name: '狐月赐福', desc: '明月台上，狐影拜月，月华洒落。', reward: { per: { qing: 6 }, gold: 150 } },
  { id: 's_tianji_mishi', region: 'tianji', loc: 'mishi', name: '天机残卷', desc: '密室书架上，一卷残页记载着失传心法。', reward: { tech: 'jh_jiuzhuan' } },
  { id: 's_tangjiawu_anshi', region: 'tangjiawu', loc: 'anshi', name: '唐门机关术', desc: '暗室之中，机关图纸与一柄铁扇并排而放。', reward: { weapon: 'lingxi' } },
  { id: 's_jianzhong_zhongxin', region: 'jianzhong', loc: 'zhongxin', name: '祖传神剑', desc: '冢心深处，一柄神剑镇压万剑，似在等你。', reward: { weapon: 'shouyin_jian' }, cond: (p) => p.flags.seekSword && p.flags.slainGuardian },
  { id: 's_huangling_digong', region: 'huangling', loc: 'hl_digong', name: '前朝帝陵宝藏', desc: '地宫石椁之后，藏着一口贴满封条的樟木箱，箱中宝光隐隐。', reward: { gold: 1500, exp: 600, item: 'random' } },
  { id: 's_tianlao_laofang', region: 'tianlao', loc: 'tl_laofang', name: '死囚越狱密道', desc: '牢房角落的草席下，竟有一条凿穿石墙的窄道，尽头散落着狱卒私藏的财货。', reward: { gold: 900, exp: 400 } }
];

// ---------- 江湖传闻（被动听闻，收录入手札；指向隐藏内容/主线） ----------
const RUMORS = [
  '临江镇的赌坊，据说夜里总有人一夜暴富。',
  '青石山密林深处，传藏有前人埋下的宝藏。',
  '华山论剑台，据传藏着一式失传剑法。',
  '天机阁的密室，据说收着绝世功法。',
  '东海龙宫有龙王镇守，凡人入海难回。',
  '剑冢断剑插地，剑意千年不散。',
  '极乐楼是销金窟，也是江湖最深的泥沼。',
  '归墟深处，藏着天地间最古老的秘密。',
  '魔教总坛血旗招展，正派禁地，入者九死一生。',
  '百花谷花开不败，却暗藏致命花毒。',
  '破碎虚空的尽头，据说是武道的极致。',
  '天门千年未开，无人能白日飞升。',
  '有人说，两块玉佩合璧，可重塑山河印。',
  '江湖上最近有人在暗中追查半块云纹玉佩。',
  '老剑客云中客，二十年前突然销声匿迹。',
  '守印世家一夜覆灭，只余一个婴儿下落不明。'
];

// ---------- 疑点（收集主线线索逐步解开；越重要的疑点需要越多线索） ----------
const MYSTERIES = [
  { id: 'm1', name: '云纹之谜', question: '玉佩上的云纹，究竟是何来历？', knowReq: 0, solveReq: 1, answer: '云纹与山河印底部的纹路如出一辙——这玉佩与山河印，本是一对。', reward: { exp: 40, gold: 50 } },
  { id: 'm2', name: '云中客之谜', question: '收养你的老乞丐，为何隐姓埋名、藏身破庙？', knowReq: 1, solveReq: 2, answer: '他正是当年剑客「云中客」，为护你出逃，才放下长剑，隐于市井。', reward: { exp: 80, gold: 100 } },
  { id: 'm3', name: '失窃之谜', question: '山河印失窃那夜，究竟发生了什么？', knowReq: 2, solveReq: 4, answer: '守印人拼死护印，却连你一起被追杀；印被夺走，你被云中客救下，藏于青石村。', reward: { exp: 150, gold: 200, per: { ming: 5 } } },
  { id: 'm4', name: '大梦之问', question: '无尘所说的「梦」，究竟是真是假？', knowReq: 4, solveReq: 6, answer: '这方天地是众生心念织成的梦，山河印是梦之锚；梦醒之后，是真是假，无人知晓。', reward: { exp: 300, gold: 300 } }
];

// ---------- 主线线索集齐后的真相揭晓（一次性剧情，纯叙事无奖励） ----------
const CLUE_FINALE = {
  poem: '山河一梦二十载，玉佩合璧见真身。',
  lines: [
    '二十年前，守印世家世代镇守「山河印」，维系这方天地的存续。',
    '那一夜魔教来袭，山河印被夺，守印世家满门尽墨。',
    '你尚在襁褓，守印人拼死将你交予剑客云中客，护你杀出重围。',
    '云中客带你藏身青石村，隐姓埋名，以老乞丐之身将你养大。',
    '如今玉佩云纹与山河印如出一辙——你，便是守印世家最后的后人。'
  ]
};

// ---------- 天气（tint=遮罩配色类；weight=出现权重；血月为稀有异常天象） ----------
const WEATHER = [
  { id: 'clear', name: '晴', icon: '☀️', tint: 'w-clear', weight: 20, desc: '天朗气清，万物安稳。' },
  { id: 'overcast', name: '阴', icon: '☁️', tint: 'w-overcast', weight: 18, desc: '云层低压，似有山雨欲来。' },
  { id: 'rain', name: '雨', icon: '🌧', tint: 'w-rain', weight: 16, desc: '细雨迷蒙，寒意料峭。' },
  { id: 'snow', name: '雪', icon: '❄️', tint: 'w-snow', weight: 12, desc: '大雪纷飞，天地寂寥。' },
  { id: 'fog', name: '雾', icon: '🌫', tint: 'w-fog', weight: 12, desc: '浓雾锁江，难辨东西。' },
  { id: 'moon', name: '月夜', icon: '🌙', tint: 'w-moon', weight: 14, desc: '月华如水，暗藏鬼魅。' },
  { id: 'blood', name: '血月', icon: '🩸', tint: 'w-blood', weight: 3, desc: '血月当空，妖邪躁动，凶险加倍！' }
];

// ---------- 十二时辰（period：night/dawn/day/dusk；随探索推进） ----------
const SHICHEN = [
  { id: 'zi', name: '子时', icon: '🌌', period: 'night', desc: '夜半更深，万籁俱寂。' },
  { id: 'chou', name: '丑时', icon: '🌌', period: 'night', desc: '鸡鸣未起，阴气最盛。' },
  { id: 'yin', name: '寅时', icon: '🌅', period: 'dawn', desc: '东方既白，天色将明。' },
  { id: 'mao', name: '卯时', icon: '🌅', period: 'dawn', desc: '日出而作，炊烟渐起。' },
  { id: 'chen', name: '辰时', icon: '☀️', period: 'day', desc: '晨光正好，宜出门闯荡。' },
  { id: 'si', name: '巳时', icon: '☀️', period: 'day', desc: '日上三竿，暑气渐盛。' },
  { id: 'wu', name: '午时', icon: '☀️', period: 'day', desc: '烈日当空，正是用武之时。' },
  { id: 'wei', name: '未时', icon: '☀️', period: 'day', desc: '日昳西斜，暑气未消。' },
  { id: 'shen', name: '申时', icon: '🌤', period: 'day', desc: '晡时将至，天色转柔。' },
  { id: 'you', name: '酉时', icon: '🌇', period: 'dusk', desc: '日落西山，归鸟投林。' },
  { id: 'xu', name: '戌时', icon: '🌆', period: 'dusk', desc: '暮色四合，华灯初上。' },
  { id: 'hai', name: '亥时', icon: '🌙', period: 'night', desc: '人定时分，宜歇宜防。' }
];

// ---------- 功法（每门含被动 + 主动招式） ----------
const TECHS = [
  // 少林
  { id: 'luohan', name: '罗汉伏魔功', element: 'tu', sect: 'shaolin', type: '内功',
    passive: { hp: 0.10, def: 0.08 },
    skills: [
      { id: 'luohan_quan', name: '罗汉拳', mp: 5, mult: 1.25, element: 'tu', desc: '中正平和的拳法，出手稳当。' },
      { id: 'jin' + 'gang_zhang', name: '大力金刚掌', mp: 13, mult: 1.95, element: 'tu', desc: '一掌拍出，砖石俱碎，专治各种不服。' }
    ],
    desc: '少林根基，气血与防御并重。'
  },
  { id: 'yijinjing', name: '易筋经', element: 'tu', sect: 'shaolin', type: '内功', rankReq: 4,
    passive: { hp: 0.15, def: 0.10, mp: 0.08 },
    skills: [
      { id: 'yijin_quan', name: '易筋神拳', mp: 18, mult: 2.4, element: 'tu', desc: '刚柔并济的巅峰拳法。' }
    ],
    desc: '少林无上内功，肉身几近不坏。'
  },
  // 武当
  { id: 'taiji', name: '太极玄功', element: 'shui', sect: 'wudang', type: '内功',
    passive: { mp: 0.12, def: 0.06, mpRegen: 0.05 },
    skills: [
      { id: 'taiji_quan', name: '太极拳', mp: 6, mult: 1.3, element: 'shui', desc: '四两拨千斤，借力打力。' },
      { id: 'taiji_jian', name: '太极剑法', mp: 14, mult: 2.0, element: 'shui', desc: '剑如游丝，绵里藏针。' }
    ],
    desc: '以柔克刚，后发制人。'
  },
  { id: 'chunyang', name: '纯阳无极功', element: 'huo', sect: 'wudang', type: '内功', rankReq: 4,
    passive: { mp: 0.18, atk: 0.08 },
    skills: [
      { id: 'chunyang_zhang', name: '纯阳掌', mp: 20, mult: 2.5, element: 'huo', desc: '至阳至刚的一掌，炙热逼人。' }
    ],
    desc: '武当镇派绝学，纯阳至刚。'
  },
  // 峨眉
  { id: 'emei_jiuyang', name: '峨眉九阳功', element: 'mu', sect: 'emei', type: '内功',
    passive: { hp: 0.08, atk: 0.08, spd: 0.05 },
    skills: [
      { id: 'jiuyang_jian', name: '九阳剑诀', mp: 8, mult: 1.5, element: 'mu', desc: '剑光如阳，正气凛然。' }
    ],
    desc: '峨眉根基，剑意与气血兼修。'
  },
  { id: 'piaoxue', name: '飘雪穿云掌', element: 'shui', sect: 'emei', type: '掌法', rankReq: 4,
    passive: { spd: 0.10, dodge: 0.06 },
    skills: [
      { id: 'piaoxue_zhang', name: '飘雪穿云', mp: 12, mult: 1.9, element: 'shui', desc: '掌影如雪花纷飞，防不胜防。' }
    ],
    desc: '峨眉绝学，轻灵迅捷。'
  },
  // 丐帮
  { id: 'dagou', name: '打狗棒法', element: 'tu', sect: 'gaibang', type: '棒法',
    passive: { atk: 0.10, crit: 0.05 },
    skills: [
      { id: 'bang_da', name: '棒打狗头', mp: 6, mult: 1.35, element: 'tu', desc: '专敲各种"狗头"。' },
      { id: 'bang_za', name: '天下无狗', mp: 16, mult: 2.1, element: 'tu', desc: '一棒横扫，群狗皆惊。' }
    ],
    desc: '丐帮镇帮绝学，名头唬人，实则很猛。'
  },
  { id: 'xianglong', name: '降龙十八掌', element: 'huo', sect: 'gaibang', type: '掌法', rankReq: 4,
    passive: { atk: 0.15, hp: 0.08 },
    skills: [
      { id: 'xianglong', name: '亢龙有悔', mp: 22, mult: 2.6, element: 'huo', desc: '天下第一刚猛掌法，龙吟震天。' }
    ],
    desc: '丐帮无上绝学，刚猛无俦。'
  },
  // 唐门
  { id: 'qianji', name: '千机百变', element: 'jin', sect: 'tangmen', type: '暗器',
    passive: { crit: 0.08, critDmg: 0.20 },
    skills: [
      { id: 'feidao', name: '飞刀绝技', mp: 7, mult: 1.5, element: 'jin', desc: '小李飞刀，例不虚发（山寨版）。' },
      { id: 'bao_yu', name: '暴雨梨花针', mp: 15, mult: 2.2, element: 'jin', desc: '漫天针雨，令人头皮发麻。' }
    ],
    desc: '唐门暗器，快、准、狠。'
  },
  // 移花宫
  { id: 'yihua', name: '移花接玉', element: 'shui', sect: 'yihua', type: '内功',
    passive: { mp: 0.12, lifeSteal: 0.03 },
    skills: [
      { id: 'yihua_zhang', name: '移花掌', mp: 10, mult: 1.7, element: 'shui', desc: '掌中带吸，打人还回血。' }
    ],
    desc: '夺人内力为己用，越打越精神。'
  },
  // 魔教
  { id: 'xuemo', name: '血魔功', element: 'huo', sect: 'mojiao', type: '内功',
    passive: { atk: 0.12, lifeSteal: 0.04 },
    skills: [
      { id: 'xue_zhang', name: '血手印', mp: 9, mult: 1.7, element: 'huo', desc: '一掌血红，夺魂摄魄。' }
    ],
    desc: '凶悍霸道，杀伐无双。'
  },
  { id: 'tianmo', name: '天魔解体大法', element: 'huo', sect: 'mojiao', type: '内功', rankReq: 4,
    passive: { atk: 0.22, critDmg: 0.15 },
    skills: [
      { id: 'tianmo_zhang', name: '天魔灭世', mp: 25, mult: 3.0, element: 'huo', desc: '燃烧气血的一击，毁天灭地。' }
    ],
    desc: '魔教禁忌之法，威力与代价同样惊人。'
  },
  // 华山
  { id: 'huashan_jian', name: '华山剑法', element: 'jin', sect: 'huashan', type: '剑法',
    passive: { atk: 0.10, spd: 0.05 },
    skills: [
      { id: 'huashan_ci', name: '华山刺', mp: 6, mult: 1.4, element: 'jin', desc: '一剑直刺，快如惊鸿。' },
      { id: 'dugu', name: '独孤九剑', mp: 18, mult: 2.3, element: 'jin', desc: '无招胜有招，破尽天下武功。' }
    ],
    desc: '华山剑法，凌厉无匹。'
  },
  // 昆仑
  { id: 'kunlun_xuan', name: '昆仑玄功', element: 'tu', sect: 'kunlun', type: '内功',
    passive: { def: 0.08, mp: 0.10 },
    skills: [
      { id: 'kunlun_mianzhang', name: '昆仑绵掌', mp: 7, mult: 1.45, element: 'tu', desc: '掌力绵厚，后劲无穷。' },
      { id: 'kunlun_yijian', name: '昆仑一剑', mp: 14, mult: 2.0, element: 'tu', desc: '一剑东来，气贯长虹。' }
    ],
    desc: '昆仑正统，守中带攻，内力深厚。'
  },
  // 血刀门
  { id: 'xuedao_jing', name: '血刀经', element: 'huo', sect: 'xuedaomen', type: '刀法',
    passive: { atk: 0.12, lifeSteal: 0.02 },
    skills: [
      { id: 'xuedao_zhan', name: '血刀斩', mp: 11, mult: 1.9, element: 'huo', desc: '刀光如血，见血更狂。' }
    ],
    desc: '以血炼刀，越战越凶。'
  },
  // 雪山派
  { id: 'xueshan_jian', name: '雪山剑法', element: 'shui', sect: 'xueshanpai', type: '剑法',
    passive: { spd: 0.08, crit: 0.06 },
    skills: [
      { id: 'xueshan_ci', name: '寒冰一剑', mp: 9, mult: 1.6, element: 'shui', desc: '剑出如霜，寒气刺骨。' }
    ],
    desc: '清冷剑法，迅捷凌厉。'
  },
  // 星宿派
  { id: 'xingsu_du', name: '星宿毒功', element: 'mu', sect: 'xingsu', type: '内功',
    passive: { atk: 0.06, dodge: 0.06 },
    skills: [
      { id: 'xingsu_sha', name: '毒砂掌', mp: 10, mult: 1.75, element: 'mu', desc: '掌中带毒，阴损至极。' }
    ],
    desc: '星宿邪功，毒损兼备。'
  },
  // 万兽山庄
  { id: 'wanshou_xinfa', name: '万兽心法', element: 'tu', sect: 'wanshou', type: '内功',
    passive: { hp: 0.12, def: 0.06 },
    skills: [
      { id: 'wanshou_quan', name: '兽王拳', mp: 8, mult: 1.55, element: 'tu', desc: '拳如兽扑，势大力沉。' }
    ],
    desc: '万兽之体，皮糙肉厚。'
  },
  // 五毒教
  { id: 'wudu_gong', name: '五毒神功', element: 'mu', sect: 'wudu', type: '内功',
    passive: { thorn: 0.06, atk: 0.04 },
    skills: [
      { id: 'wudu_zhang', name: '五毒掌', mp: 9, mult: 1.7, element: 'mu', desc: '五毒俱全，沾之即伤。' }
    ],
    desc: '蛊毒反噬，伤敌八百。'
  },
  // 明教
  { id: 'shenghuo_gong', name: '圣火神功', element: 'huo', sect: 'mingjiao', type: '内功',
    passive: { atk: 0.10, crit: 0.06 },
    skills: [
      { id: 'shenghuo_zhang', name: '圣火掌', mp: 11, mult: 1.85, element: 'huo', desc: '圣火熊熊，焚尽万物。' }
    ],
    desc: '光明圣火，正邪随心。'
  },
  // 大理段氏
  { id: 'yiyangzhi', name: '一阳指', element: 'jin', sect: 'duanshi', type: '指法',
    passive: { mp: 0.08, atk: 0.06 },
    skills: [
      { id: 'yiyang_dian', name: '一阳指点穴', mp: 10, mult: 1.8, element: 'jin', desc: '一指点出，隔空封穴。' }
    ],
    desc: '大理段氏绝学，指力冠绝天下。'
  },
  // —— 各派镇派绝学（职位达「长老」方可修习）——
  { id: 'kongqueling', name: '孔雀翎', element: 'jin', sect: 'tangmen', type: '暗器', rankReq: 4,
    passive: { atk: 0.16, critDmg: 0.25 },
    skills: [{ id: 'kongque_kai', name: '孔雀开屏', mp: 22, mult: 2.6, element: 'jin', desc: '天下第一暗器，出手即见血。' }],
    desc: '唐门镇派暗器，一出无回。' },
  { id: 'mingyu', name: '明玉功', element: 'shui', sect: 'yihua', type: '内功', rankReq: 4,
    passive: { def: 0.12, hp: 0.10, lifeSteal: 0.05 },
    skills: [{ id: 'mingyu_zhang', name: '明玉神掌', mp: 20, mult: 2.4, element: 'shui', desc: '掌若寒玉，凝而不散。' }],
    desc: '移花宫无上心法，冰肌玉骨。' },
  { id: 'zixia', name: '紫霞神功', element: 'jin', sect: 'huashan', type: '内功', rankReq: 4,
    passive: { atk: 0.15, mp: 0.10 },
    skills: [{ id: 'zixia_qi', name: '紫霞剑气', mp: 20, mult: 2.5, element: 'jin', desc: '剑气如霞，铺天盖地。' }],
    desc: '华山镇派神功，紫气东来。' },
  { id: 'liangyi', name: '两仪神功', element: 'tu', sect: 'kunlun', type: '内功', rankReq: 4,
    passive: { def: 0.15, hp: 0.12 },
    skills: [{ id: 'liangyi_jian', name: '两仪剑', mp: 20, mult: 2.4, element: 'tu', desc: '阴阳相济，攻守一体。' }],
    desc: '昆仑镇派玄功，两仪相生。' },
  { id: 'xiuluo_dao', name: '血海修罗刀', element: 'huo', sect: 'xuedaomen', type: '刀法', rankReq: 4,
    passive: { atk: 0.18, lifeSteal: 0.06 },
    skills: [{ id: 'xiuluo_zhan', name: '修罗血斩', mp: 22, mult: 2.6, element: 'huo', desc: '刀出如修罗降世，血浪滔天。' }],
    desc: '血刀门禁刀，见血方归。' },
  { id: 'xuepiao', name: '雪飘人间', element: 'shui', sect: 'xueshanpai', type: '剑法', rankReq: 4,
    passive: { spd: 0.15, crit: 0.10 },
    skills: [{ id: 'xuepiao_jian', name: '雪飘一剑', mp: 18, mult: 2.4, element: 'shui', desc: '剑落如雪，无声无息。' }],
    desc: '雪山派镇派剑法，飘忽难测。' },
  { id: 'huagong', name: '化功大法', element: 'mu', sect: 'xingsu', type: '内功', rankReq: 4,
    passive: { atk: 0.15, lifeSteal: 0.05, dodge: 0.08 },
    skills: [{ id: 'huagong_zhang', name: '化功散魂掌', mp: 20, mult: 2.4, element: 'mu', desc: '掌中剧毒，化人功力。' }],
    desc: '星宿镇派邪功，化功蚀骨。' },
  { id: 'wanshou_zong', name: '万兽朝宗', element: 'tu', sect: 'wanshou', type: '内功', rankReq: 4,
    passive: { hp: 0.18, def: 0.10 },
    skills: [{ id: 'shouwang_quan', name: '兽王降世', mp: 20, mult: 2.5, element: 'tu', desc: '万兽之力，一拳开山。' }],
    desc: '万兽山庄镇庄绝学，力贯千钧。' },
  { id: 'wangu', name: '万蛊蚀心', element: 'mu', sect: 'wudu', type: '内功', rankReq: 4,
    passive: { atk: 0.15, thorn: 0.10 },
    skills: [{ id: 'wangu_zhang', name: '万蛊噬心掌', mp: 20, mult: 2.5, element: 'mu', desc: '万蛊齐出，蚀心蚀骨。' }],
    desc: '五毒教镇教禁术，蛊毒齐发。' },
  { id: 'qiankun', name: '乾坤大挪移', element: 'huo', sect: 'mingjiao', type: '内功', rankReq: 4,
    passive: { atk: 0.18, dodge: 0.08 },
    skills: [{ id: 'qiankun_zhang', name: '乾坤一掌', mp: 24, mult: 2.7, element: 'huo', desc: '移星换斗，一掌乾坤。' }],
    desc: '明教镇教神功，乾坤挪移。' },
  { id: 'liumai', name: '六脉神剑', element: 'jin', sect: 'duanshi', type: '指法', rankReq: 4,
    passive: { atk: 0.18, crit: 0.08 },
    skills: [{ id: 'liumai_jian', name: '六脉神剑·少商剑', mp: 24, mult: 2.7, element: 'jin', desc: '无形剑气，隔空取命。' }],
    desc: '大理段氏绝学，六脉无形。' },
  // 通用散修功法（无门派也能学）
  { id: 'tuji', name: '吐纳基础', element: null, sect: null, type: '内功',
    passive: { hp: 0.05, mp: 0.05 },
    skills: [
      { id: 'tuji_da', name: '普通攻击', mp: 0, mult: 1.0, element: null, desc: '没什么花哨，就是打。' }
    ],
    desc: '最基础的吐纳之法，人人可学。'
  },
  // ---------- 江湖流传功法（散修可学，可被赠予 / 探索发现 / 大事件Boss掉落） ----------
  { id: 'jh_wuhu', name: '五虎断门刀', element: 'jin', sect: null, type: '刀法',
    passive: { atk: 0.12, crit: 0.04 },
    skills: [{ id: 'jh_wuhu_dao', name: '断门斩', mp: 10, mult: 1.8, element: 'jin', desc: '刀势如虎，直取门面。' }],
    desc: '流传于绿林的好刀法，凶悍实用。' },
  { id: 'jh_tiesha', name: '铁砂掌', element: 'tu', sect: null, type: '掌法',
    passive: { atk: 0.10, def: 0.06 },
    skills: [{ id: 'jh_tiesha_zhang', name: '铁砂开碑', mp: 8, mult: 1.6, element: 'tu', desc: '双掌如铁，开碑裂石。' }],
    desc: '外家硬功，练成后双掌坚逾铁石。' },
  { id: 'jh_taxue', name: '踏雪无痕', element: 'shui', sect: null, type: '身法',
    passive: { spd: 0.15, dodge: 0.06 },
    skills: [{ id: 'jh_taxue_bu', name: '无痕突袭', mp: 6, mult: 1.2, element: 'shui', desc: '身如飘雪，踏雪无痕。' }],
    desc: '上乘轻身功法，来去无声。' },
  { id: 'jh_hunyuan', name: '混元功', element: 'tu', sect: null, type: '内功',
    passive: { hp: 0.12, def: 0.08, mp: 0.06 },
    skills: [{ id: 'jh_hunyuan_zhang', name: '混元掌', mp: 12, mult: 1.8, element: 'tu', desc: '混元一气，绵厚刚正。' }],
    desc: '内外兼修的浑厚内功。' },
  { id: 'jh_yizi', name: '一字电剑', element: 'jin', sect: null, type: '剑法',
    passive: { atk: 0.10, spd: 0.06 },
    skills: [{ id: 'jh_yizi_jian', name: '电光一闪', mp: 8, mult: 1.6, element: 'jin', desc: '一剑如电，迅捷无匹。' }],
    desc: '以快取胜的剑法，寒光如电。' },
  { id: 'jh_kuangfeng', name: '狂风刀法', element: 'mu', sect: null, type: '刀法',
    passive: { spd: 0.08, crit: 0.06 },
    skills: [{ id: 'jh_kuangfeng_dao', name: '狂风骤起', mp: 9, mult: 1.7, element: 'mu', desc: '刀如狂风，连绵不绝。' }],
    desc: '刀势连绵，越打越快。' },
  { id: 'jh_wuxing', name: '五行拳', element: 'tu', sect: null, type: '拳法',
    passive: { atk: 0.08, hp: 0.08 },
    skills: [{ id: 'jh_wuxing_quan', name: '五行连环', mp: 8, mult: 1.6, element: 'tu', desc: '五招连环，攻守兼备。' }],
    desc: '按五行生克编排的拳路。' },
  { id: 'jh_jinqian', name: '金钱镖', element: 'jin', sect: null, type: '暗器',
    passive: { crit: 0.06, critDmg: 0.15 },
    skills: [{ id: 'jh_jinqian_biao', name: '撒手金钱', mp: 7, mult: 1.5, element: 'jin', desc: '铜钱如雨，防不胜防。' }],
    desc: '铜钱当暗器，既体面又实用。' },
  { id: 'jh_yangjia', name: '杨家枪法', element: 'jin', sect: null, type: '枪法',
    passive: { atk: 0.11, pierce: 0.08 },
    skills: [{ id: 'jh_yangjia_qiang', name: '回马枪', mp: 10, mult: 1.8, element: 'jin', desc: '佯退诱敌，回身一枪。' }],
    desc: '沙场枪法，招招致命。' },
  { id: 'jh_fengmo', name: '疯魔棍法', element: 'tu', sect: null, type: '棍法',
    passive: { atk: 0.12, hp: 0.06 },
    skills: [{ id: 'jh_fengmo_gun', name: '疯魔乱舞', mp: 11, mult: 1.9, element: 'tu', desc: '棍影翻飞，状若疯魔。' }],
    desc: '看似乱打，实则章法森严。' },
  { id: 'jh_ruanbian', name: '软鞭十三式', element: 'mu', sect: null, type: '鞭法',
    passive: { spd: 0.10, dodge: 0.05 },
    skills: [{ id: 'jh_ruanbian_bian', name: '灵蛇缠', mp: 9, mult: 1.7, element: 'mu', desc: '鞭如灵蛇，缠敌制胜。' }],
    desc: '软鞭如蛇，可缠可扫。' },
  { id: 'jh_tieshan', name: '铁扇功', element: 'jin', sect: null, type: '扇法',
    passive: { def: 0.08, dodge: 0.05 },
    skills: [{ id: 'jh_tieshan_shan', name: '铁扇开屏', mp: 8, mult: 1.6, element: 'jin', desc: '折扇一开，如屏如盾。' }],
    desc: '文雅外表下藏着杀机。' },
  { id: 'jh_lianzhu', name: '连珠箭法', element: 'jin', sect: null, type: '弓术',
    passive: { crit: 0.08, atk: 0.06 },
    skills: [{ id: 'jh_lianzhu_jian', name: '三连珠', mp: 10, mult: 1.9, element: 'jin', desc: '三箭连珠，例不虚发。' }],
    desc: '箭出连环，百步穿杨。' },
  { id: 'jh_guiyuan', name: '归元功', element: 'shui', sect: null, type: '内功',
    passive: { mp: 0.15, mpRegen: 0.06 },
    skills: [{ id: 'jh_guiyuan_zhang', name: '归元掌', mp: 10, mult: 1.7, element: 'shui', desc: '内力归元，绵绵不绝。' }],
    desc: '养气归元，内力绵长。' },
  { id: 'jh_jiuzhuan', name: '九转玄功', element: 'tu', sect: null, type: '内功',
    passive: { hp: 0.15, def: 0.10 },
    skills: [{ id: 'jh_jiuzhuan_zhang', name: '九转护体', mp: 12, mult: 1.6, element: 'tu', desc: '九转护体，刀枪难伤。' }],
    desc: '九转功成，金刚不坏。' },
  { id: 'jh_fuguang', name: '浮光掠影', element: 'shui', sect: null, type: '身法',
    passive: { spd: 0.18, dodge: 0.08 },
    skills: [{ id: 'jh_fuguang_bu', name: '掠影突袭', mp: 7, mult: 1.4, element: 'shui', desc: '如光如影，一击即退。' }],
    desc: '来去如风，踪迹难寻。' },
  { id: 'jh_zhuifeng', name: '追风剑法', element: 'shui', sect: null, type: '剑法',
    passive: { spd: 0.10, atk: 0.08 },
    skills: [{ id: 'jh_zhuifeng_jian', name: '追风一剑', mp: 8, mult: 1.7, element: 'shui', desc: '剑追疾风，快不可挡。' }],
    desc: '剑走轻灵，追风逐电。' },
  { id: 'jh_youlong', name: '游龙剑法', element: 'shui', sect: null, type: '剑法',
    passive: { atk: 0.12, spd: 0.06 },
    skills: [{ id: 'jh_youlong_jian', name: '游龙出鞘', mp: 12, mult: 2.0, element: 'shui', desc: '剑出如龙，翻江倒海。' }],
    desc: '剑势如游龙，变化莫测。' },
  { id: 'jh_polang', name: '破浪刀法', element: 'shui', sect: null, type: '刀法',
    passive: { atk: 0.13, crit: 0.04 },
    skills: [{ id: 'jh_polang_dao', name: '破浪斩', mp: 11, mult: 1.9, element: 'shui', desc: '一刀劈出，破浪裂涛。' }],
    desc: '刀势如潮，一往无前。' },
  { id: 'jh_cuixin', name: '摧心掌', element: 'huo', sect: null, type: '掌法',
    passive: { atk: 0.14, critDmg: 0.10 },
    skills: [{ id: 'jh_cuixin_zhang', name: '摧心一击', mp: 12, mult: 2.0, element: 'huo', desc: '掌力透体，直摧心脉。' }],
    desc: '阴毒掌法，中者心脉俱裂。' },
  { id: 'jh_paiyun', name: '排云掌', element: 'shui', sect: null, type: '掌法',
    passive: { atk: 0.12, hp: 0.06 },
    skills: [{ id: 'jh_paiyun_zhang', name: '排云裂空', mp: 11, mult: 1.9, element: 'shui', desc: '掌风如涛，排云裂空。' }],
    desc: '掌势磅礴，如云如涛。' },
  { id: 'jh_bengquan', name: '崩拳', element: 'tu', sect: null, type: '拳法',
    passive: { atk: 0.13, pierce: 0.06 },
    skills: [{ id: 'jh_bengquan_quan', name: '崩山一击', mp: 10, mult: 1.9, element: 'tu', desc: '一拳崩出，山石俱裂。' }],
    desc: '刚猛爆烈的短打拳法。' },
  { id: 'jh_liehuo', name: '烈焰枪法', element: 'huo', sect: null, type: '枪法',
    passive: { atk: 0.12, critDmg: 0.12 },
    skills: [{ id: 'jh_liehuo_qiang', name: '烈焰回马', mp: 11, mult: 2.0, element: 'huo', desc: '枪出如火，回马一刺。' }],
    desc: '枪势如火，炽烈难当。' },
  { id: 'jh_dahu', name: '打虎棍法', element: 'tu', sect: null, type: '棍法',
    passive: { atk: 0.11, def: 0.06 },
    skills: [{ id: 'jh_dahu_gun', name: '打虎一棍', mp: 10, mult: 1.8, element: 'tu', desc: '当头一棍，猛虎难敌。' }],
    desc: '力大势沉，专打猛兽。' },
  { id: 'jh_guixi', name: '龟息功', element: 'shui', sect: null, type: '内功',
    passive: { hp: 0.10, hpRegen: 0.04 },
    skills: [{ id: 'jh_guixi_zhang', name: '龟息一击', mp: 8, mult: 1.5, element: 'shui', desc: '敛息蓄力，一击而发。' }],
    desc: '气息绵长，耐力惊人。' },
  { id: 'jh_taixi', name: '胎息功', element: 'shui', sect: null, type: '内功',
    passive: { mp: 0.10, hp: 0.08 },
    skills: [{ id: 'jh_taixi_jue', name: '胎息诀', mp: 9, mult: 1.6, element: 'shui', desc: '如婴在胎，气息不绝。' }],
    desc: '返本归元的内息之法。' },
  { id: 'jh_zhuihun', name: '追魂剑法', element: 'jin', sect: null, type: '剑法',
    passive: { atk: 0.14, crit: 0.05 },
    skills: [{ id: 'jh_zhuihun_jian', name: '追魂夺命', mp: 13, mult: 2.1, element: 'jin', desc: '剑出追魂，避无可避。' }],
    desc: '狠辣剑法，直取要害。' },
  { id: 'jh_xiujian', name: '袖箭术', element: 'jin', sect: null, type: '暗器',
    passive: { crit: 0.07, critDmg: 0.18 },
    skills: [{ id: 'jh_xiujian_jian', name: '袖中箭', mp: 9, mult: 1.7, element: 'jin', desc: '袖中藏箭，出其不意。' }],
    desc: '袖中暗藏机关，冷箭难防。' },
  { id: 'jh_hanbing', name: '寒冰掌', element: 'shui', sect: null, type: '掌法',
    passive: { atk: 0.12, crit: 0.05 },
    skills: [{ id: 'jh_hanbing_zhang', name: '寒冰入骨', mp: 11, mult: 1.9, element: 'shui', desc: '掌中寒劲，入骨彻髓。' }],
    desc: '寒劲透骨，中者僵立。' },
  { id: 'jh_wuying', name: '无影脚', element: 'mu', sect: null, type: '腿法',
    passive: { spd: 0.12, atk: 0.08 },
    skills: [{ id: 'jh_wuying_tui', name: '无影连环', mp: 10, mult: 1.8, element: 'mu', desc: '腿影连环，快如无影。' }],
    desc: '腿法奇快，难辨其踪。' }
];

// ---------- 武器：类型 + 品质 + 词条 ----------
const WEAPON_TYPES = [
  { id: 'sword', name: '剑',   baseAtk: 10, flat: { spd: 0.04, crit: 0.02 }, desc: '百兵之君，轻灵凌厉。' },
  { id: 'dao', name: '刀',     baseAtk: 13, flat: { critDmg: 0.15 }, desc: '刀走刚猛，一往无前。' },
  { id: 'qiang', name: '枪',   baseAtk: 14, flat: { spd: 0.02 }, reach: true, desc: '一寸长一寸强。' },
  { id: 'gun', name: '棍',     baseAtk: 12, flat: { def: 0.06 }, desc: '棍扫一大片。' },
  { id: 'dagger', name: '双匕', baseAtk: 9, flat: { spd: 0.12, crit: 0.06 }, desc: '快如闪电，短兵相接。' },
  { id: 'hidden', name: '暗器', baseAtk: 11, flat: { crit: 0.05, critDmg: 0.2 }, reach: true, desc: '例不虚发，阴险无比。' },
  { id: 'fist', name: '拳套', baseAtk: 8, flat: { hp: 0.08, atk: 0.02 }, desc: '赤手空拳，拳拳到肉。' },
  { id: 'whip', name: '长鞭', baseAtk: 10, flat: { spd: 0.08, dodge: 0.03 }, desc: '软中带刚，缠人于无形。' },
  { id: 'fan', name: '铁扇', baseAtk: 9, flat: { def: 0.04, dodge: 0.04 }, desc: '风度翩翩，攻守兼备。' },
  { id: 'bow', name: '弓弩', baseAtk: 12, flat: { crit: 0.04, critDmg: 0.1 }, reach: true, desc: '百步穿杨，先发制人。' }
];
const QUALITIES = [
  { id: 'hui', name: '粗糙', mult: 1.0, affixes: 0, color: '#8b9299', emoji: '⚫', tier: 0 },
  { id: 'bai', name: '普通', mult: 1.2, affixes: 1, color: '#e8e8e8', emoji: '⚪', tier: 1 },
  { id: 'lv', name: '优良', mult: 1.45, affixes: 1, color: '#6fbf6a', emoji: '🟢', tier: 2 },
  { id: 'lan', name: '精良', mult: 1.75, affixes: 2, color: '#4a9fe0', emoji: '🔵', tier: 3 },
  { id: 'zi', name: '史诗', mult: 2.2, affixes: 2, color: '#b06fd8', emoji: '🟣', tier: 4 },
  { id: 'cheng', name: '传说', mult: 2.9, affixes: 3, color: '#ff9f43', emoji: '🟠', tier: 5 },
  { id: 'hong', name: '神器', mult: 4.0, affixes: 4, color: '#ff5f6f', emoji: '🔴', tier: 6 }
];
// 随机掉落/生成的武器最高只到「传说(橙)」；「神器(红)」只能来自神器或特定 Boss/事件
const RANDOM_QUALITY_MAX = 'cheng';
const AFFIXES = [
  { id: 'sharp', name: '锋锐', adj: '锋利', per: { atk: 0.06 } },
  { id: 'heavy', name: '厚重', adj: '厚重', per: { def: 0.06 } },
  { id: 'swift', name: '迅捷', adj: '迅捷', per: { spd: 0.06 } },
  { id: 'inner', name: '内蕴', adj: '蕴灵', per: { mp: 0.08 } },
  { id: 'crit', name: '通灵', adj: '通灵', per: { crit: 0.03 } },
  { id: 'blood', name: '嗜血', adj: '嗜血', per: { lifeSteal: 0.015 } },
  { id: 'pierce', name: '破甲', adj: '破甲', per: { pierce: 0.10 } },
  { id: 'thorn', name: '荆棘', adj: '荆棘', per: { thorn: 0.10 } },
  { id: 'dodge', name: '轻灵', adj: '轻灵', per: { dodge: 0.04 } },
  { id: 'regen', name: '回气', adj: '回元', per: { mpRegen: 0.05 } },
  { id: 'combo', name: '连击', adj: '连环', per: { combo: 0.10 } },
  { id: 'leech', name: '会心', adj: '会心', per: { critDmg: 0.10 } },
  { id: 'ejin', name: '附·金', element: 'jin' },
  { id: 'emu', name: '附·木', element: 'mu' },
  { id: 'etu', name: '附·土', element: 'tu' },
  { id: 'eshui', name: '附·水', element: 'shui' },
  { id: 'ehuo', name: '附·火', element: 'huo' }
];
// 特殊词缀：仅紫(史诗)及以上品质出现
const SPECIAL_AFFIXES = [
  { id: 'pojun', name: '破军', adj: '破军', per: { atk: 0.08, pierce: 0.12 }, special: true },
  { id: 'wushuang', name: '无双', adj: '无双', per: { crit: 0.05, critDmg: 0.15 }, special: true },
  { id: 'huichun', name: '回春', adj: '回春', per: { hpRegen: 0.05 }, special: true },
  { id: 'shihun', name: '噬魂', adj: '噬魂', per: { lifeSteal: 0.03 }, special: true },
  { id: 'shenxing', name: '神行', adj: '神行', per: { spd: 0.10, dodge: 0.05 }, special: true },
  { id: 'lianzhu', name: '连珠', adj: '连珠', per: { combo: 0.15 }, special: true },
  { id: 'tianming', name: '天命', adj: '天命', per: { atk: 0.04, def: 0.04, hp: 0.04, spd: 0.04 }, special: true }
];
const WEAPON_NAME_PREFIX = ['破','断','斩','碎','诛','御','绝','玄','青','紫','赤','寒','烈','飞','惊','狂','怒','天','地','风'];
const WEAPON_NAME_MID = ['锋','牙','鳞','云','月','星','雷','霜','霞','虹','霄','渊','刹','魂','魄','影'];

// ---------- 敌人（archetype：基础属性 + 成长） ----------
// scale：随等级成长的倍率（每级 +x%）
const ENEMY_ARCHETYPES = [
  // 新手区（1-10 级）
  { id: 'chicken', name: '隔壁王婶的鸡', tier: 'normal', element: 'mu',
    base: { hp: 18, atk: 5, def: 2, spd: 7 }, scale: 0.06, gold: [1, 4], exp: 8,
    desc: '听说啄人特别疼，尤其是啄脚脖子。', drop: ['jijirou'] },
  { id: 'erdog', name: '村口二傻子', tier: 'normal', element: null,
    base: { hp: 30, atk: 7, def: 3, spd: 4 }, scale: 0.08, gold: [2, 5], exp: 10,
    desc: '他其实不傻，就是喜欢追着人喊"大侠"。', drop: [] },
  { id: 'yedog', name: '野狗', tier: 'normal', element: null,
    base: { hp: 24, atk: 8, def: 3, spd: 6 }, scale: 0.07, gold: [0, 2], exp: 9,
    desc: '见人就吠，专欺负小孩。', drop: [] },
  { id: 'zuihan', name: '醉汉', tier: 'normal', element: null,
    base: { hp: 35, atk: 9, def: 4, spd: 3 }, scale: 0.07, gold: [3, 8], exp: 12,
    desc: '喝多了就爱找茬："你瞅啥？"', drop: ['jiudai'] },
  { id: 'toujizei', name: '偷鸡贼', tier: 'normal', element: null,
    base: { hp: 40, atk: 10, def: 4, spd: 8 }, scale: 0.08, gold: [8, 20], exp: 18,
    desc: '专偷老王家鸡，终于被王婶追杀。', drop: [] },
  { id: 'shanzei', name: '山贼喽啰', tier: 'normal', element: null,
    base: { hp: 55, atk: 12, def: 5, spd: 6 }, scale: 0.09, gold: [5, 15], exp: 20,
    desc: '"此山是我开……" 台词背得比刀还熟。', drop: [] },
  { id: 'sheshe', name: '毒蛇', tier: 'normal', element: 'mu',
    base: { hp: 40, atk: 11, def: 3, spd: 9 }, scale: 0.08, gold: [1, 3], exp: 14,
    desc: '会咬人，还会吓人。', drop: ['sheye'] },
  { id: 'yezhu', name: '野猪', tier: 'elite', element: 'tu',
    base: { hp: 90, atk: 15, def: 8, spd: 4 }, scale: 0.09, gold: [10, 25], exp: 30,
    desc: '皮糙肉厚，横冲直撞。', drop: ['zhupi'] },
  { id: 'lang', name: '野狼', tier: 'normal', element: null,
    base: { hp: 50, atk: 13, def: 4, spd: 8 }, scale: 0.08, gold: [3, 8], exp: 18,
    desc: '成群结队，专挑落单的下手。', drop: [] },
  // 江湖（10-30）
  { id: 'shanzeitou', name: '山贼头目', tier: 'elite', element: 'jin',
    base: { hp: 140, atk: 22, def: 10, spd: 7 }, scale: 0.1, gold: [30, 80], exp: 55,
    desc: '"此路是我开"的正版，收费更贵。', drop: ['shanling'] },
  { id: 'pianzi', name: '江湖骗子', tier: 'normal', element: null,
    base: { hp: 70, atk: 16, def: 6, spd: 9 }, scale: 0.09, gold: [20, 60], exp: 30,
    desc: '"我这儿有失传的武林秘籍，童叟无欺！"', drop: [] },
  { id: 'maijiaoyao', name: '卖假药的', tier: 'normal', element: null,
    base: { hp: 75, atk: 17, def: 6, spd: 7 }, scale: 0.09, gold: [15, 50], exp: 32,
    desc: '"包治百病，不灵你回来打我。"', drop: ['jiayao'] },
  { id: 'sanliu', name: '三流剑客', tier: 'normal', element: 'jin',
    base: { hp: 90, atk: 20, def: 8, spd: 8 }, scale: 0.09, gold: [10, 30], exp: 40,
    desc: '自称"剑术无双"，其实只会三招。', drop: [] },
  { id: 'tangshou', name: '镖局趟子手', tier: 'normal', element: null,
    base: { hp: 110, atk: 21, def: 9, spd: 6 }, scale: 0.09, gold: [10, 25], exp: 42,
    desc: '"镖在人在！" 其实镖丢了人也在。', drop: [] },
  { id: 'caihuazei', name: '采花贼', tier: 'normal', element: null,
    base: { hp: 85, atk: 19, def: 6, spd: 12 }, scale: 0.09, gold: [15, 40], exp: 45,
    desc: '人人得而诛之，赏金还高。', drop: [] },
  { id: 'xuemo_itu', name: '血魔教徒', tier: 'normal', element: 'huo',
    base: { hp: 130, atk: 26, def: 10, spd: 8 }, scale: 0.1, gold: [15, 45], exp: 55,
    desc: '"血魔大法好！" 魔教狂热粉。', drop: [] },
  { id: 'xiexiu', name: '邪修', tier: 'elite', element: 'shui',
    base: { hp: 160, atk: 28, def: 12, spd: 9 }, scale: 0.1, gold: [30, 80], exp: 70,
    desc: '走火入魔的边缘，见谁都想吸一口。', drop: ['xiexing'] },
  { id: 'yaolang', name: '妖狼', tier: 'elite', element: 'mu',
    base: { hp: 150, atk: 27, def: 11, spd: 11 }, scale: 0.1, gold: [20, 50], exp: 65,
    desc: '成精的狼，眼神里带着鄙视。', drop: ['langya'] },
  { id: 'tiebeixiong', name: '铁背熊', tier: 'elite', element: 'tu',
    base: { hp: 220, atk: 30, def: 18, spd: 5 }, scale: 0.1, gold: [25, 60], exp: 80,
    desc: '背部硬如铁，拍人像拍蚊子。', drop: ['xiongpi'] },
  // 高手（30-60）
  { id: 'shaolin_di', name: '少林弟子', tier: 'elite', element: 'tu',
    base: { hp: 300, atk: 40, def: 26, spd: 10 }, scale: 0.11, gold: [30, 70], exp: 110,
    desc: '"阿弥陀佛……"（拳头可没念佛）', drop: [] },
  { id: 'wudang_di', name: '武当弟子', tier: 'elite', element: 'shui',
    base: { hp: 280, atk: 38, def: 22, spd: 12 }, scale: 0.11, gold: [30, 70], exp: 110,
    desc: '"别急，先让我算一卦……"', drop: [] },
  { id: 'tangmen_di', name: '唐门弟子', tier: 'elite', element: 'jin',
    base: { hp: 240, atk: 42, def: 18, spd: 14 }, scale: 0.11, gold: [35, 80], exp: 120,
    desc: '你还没看见他，暗器已经到脸上了。', drop: [] },
  { id: 'gushi', name: '蛊师', tier: 'elite', element: 'mu',
    base: { hp: 260, atk: 36, def: 16, spd: 11 }, scale: 0.11, gold: [30, 75], exp: 115,
    desc: '浑身是虫，看久了头皮发麻。', drop: ['gudan'] },
  { id: 'sheyao', name: '蛇妖', tier: 'elite', element: 'mu',
    base: { hp: 340, atk: 44, def: 20, spd: 13 }, scale: 0.12, gold: [40, 90], exp: 140,
    desc: '人身蛇尾，吐着信子喊"公子"。', drop: ['sheyao_nei'] },
  { id: 'huyao', name: '狐妖', tier: 'elite', element: 'huo',
    base: { hp: 300, atk: 46, def: 18, spd: 16 }, scale: 0.12, gold: [45, 100], exp: 145,
    desc: '媚眼如丝，实则会放狐火。', drop: ['huyao_wei'] },
  { id: 'shashou', name: '冷血杀手', tier: 'elite', element: 'jin',
    base: { hp: 280, atk: 48, def: 20, spd: 15 }, scale: 0.12, gold: [50, 120], exp: 150,
    desc: '收钱办事，从不问为什么。', drop: [] },
  { id: 'lvlin', name: '绿林好汉', tier: 'elite', element: null,
    base: { hp: 360, atk: 45, def: 24, spd: 9 }, scale: 0.12, gold: [40, 100], exp: 135,
    desc: '"劫富济贫！"（济的是自己）', drop: [] },
  { id: 'mojiao_hufa', name: '魔教护法', tier: 'elite', element: 'huo',
    base: { hp: 400, atk: 52, def: 26, spd: 12 }, scale: 0.12, gold: [60, 140], exp: 170,
    desc: '凶神恶煞，见人就喊"纳命来"。', drop: [] },
  // 顶级高手（60-100）
  { id: 'jianke', name: '江湖剑客', tier: 'elite', element: 'jin',
    base: { hp: 600, atk: 70, def: 35, spd: 18 }, scale: 0.13, gold: [80, 200], exp: 260,
    desc: '剑出如龙，剑气纵横。', drop: [] },
  { id: 'daoke', name: '刀中豪客', tier: 'elite', element: 'jin',
    base: { hp: 680, atk: 76, def: 40, spd: 14 }, scale: 0.13, gold: [80, 200], exp: 270,
    desc: '"刀在手，天下我有！"', drop: [] },
  { id: 'qiangxian', name: '枪术大师', tier: 'elite', element: 'jin',
    base: { hp: 640, atk: 74, def: 36, spd: 15 }, scale: 0.13, gold: [80, 200], exp: 265,
    desc: '一杆枪，舞出花来。', drop: [] },
  { id: 'yaowang', name: '妖王', tier: 'boss', element: 'huo',
    base: { hp: 1200, atk: 90, def: 55, spd: 18 }, scale: 0.14, gold: [200, 500], exp: 500,
    desc: '妖气滔天，方圆十里寸草不生。', drop: ['yaowang_dan'] },
  // Boss（各区域 / 最终）
  { id: 'shanzei_wang', name: '山贼王·王大山', tier: 'boss', element: 'jin',
    base: { hp: 300, atk: 32, def: 14, spd: 8 }, scale: 0.12, gold: [150, 300], exp: 150,
    desc: '青石山扛把子，胸口纹了只"下山虎"（其实是只猫）。', drop: ['shanbao'] },
  { id: 'mojiao_zhanglao', name: '魔教长老·血手人屠', tier: 'boss', element: 'huo',
    base: { hp: 900, atk: 85, def: 50, spd: 14 }, scale: 0.13, gold: [300, 700], exp: 450,
    desc: '血手一出，寸草不生。曾一掌打哭过三个正派掌门。', drop: ['xueshou'] },
  { id: 'jian_sheng', name: '剑圣·西门吹雪', tier: 'boss', element: 'jin',
    base: { hp: 1600, atk: 110, def: 60, spd: 24 }, scale: 0.14, gold: [400, 900], exp: 700,
    desc: '他吹的不是雪，是血。', drop: ['jianyi'] },
  { id: 'yaohou', name: '妖皇', tier: 'boss', element: 'huo',
    base: { hp: 2500, atk: 130, def: 75, spd: 20 }, scale: 0.15, gold: [600, 1500], exp: 1000,
    desc: '万妖之主，正在寻找"妖界最靓的崽"。', drop: ['yaohou_xin'] },
  { id: 'final_boss', name: '魔尊·万世劫', tier: 'boss', element: 'huo',
    base: { hp: 6000, atk: 180, def: 100, spd: 22 }, scale: 0.16, gold: [2000, 5000], exp: 5000,
    desc: '天下第一魔头，通关它的那一刻，你将名垂青史。', drop: ['moshen_dan'] },
  { id: 'shouling_jiangjun', name: '守陵将军·玄甲卫', tier: 'boss', element: 'tu',
    base: { hp: 2600, atk: 135, def: 82, spd: 14 }, scale: 0.15, gold: [500, 1200], exp: 850,
    desc: '前朝帝陵的镇守者，玄甲不腐，斧钺未锈，誓守皇陵千载。', drop: [] },
  { id: 'dianyuguan', name: '典狱官·铁面阎罗', tier: 'boss', element: 'jin',
    base: { hp: 2800, atk: 140, def: 88, spd: 16 }, scale: 0.15, gold: [550, 1300], exp: 900,
    desc: '天牢之主，铁链缠身，锁尽天下豪杰，断尽冤魂生路。', drop: [] },
  // ---------- 飞禽走兽·精怪 ----------
  { id: 'goose', name: '大鹅', tier: 'normal', element: 'mu', icon: '🦢', base: { hp: 28, atk: 7, def: 3, spd: 8 }, scale: 0.07, gold: [1, 4], exp: 9, desc: '村中一霸，追人比狗还凶。', drop: [] },
  { id: 'niu', name: '老黄牛', tier: 'normal', element: 'tu', icon: '🐂', base: { hp: 45, atk: 9, def: 5, spd: 3 }, scale: 0.07, gold: [1, 5], exp: 10, desc: '老实巴交，但你敢拽它尾巴试试。', drop: [] },
  { id: 'laoshu', name: '老鼠精', tier: 'normal', element: null, icon: '🐀', base: { hp: 22, atk: 6, def: 2, spd: 9 }, scale: 0.07, gold: [1, 3], exp: 8, desc: '偷粮界的扛把子。', drop: [] },
  { id: 'feng', name: '野蜂', tier: 'normal', element: 'jin', icon: '🐝', base: { hp: 20, atk: 8, def: 2, spd: 10 }, scale: 0.07, gold: [1, 3], exp: 10, desc: '你捅了马蜂窝。', drop: [] },
  { id: 'yemaomiao', name: '野猫', tier: 'normal', element: 'mu', icon: '🐈', base: { hp: 24, atk: 7, def: 2, spd: 10 }, scale: 0.07, gold: [1, 3], exp: 9, desc: '会挠人，尤其爱挠脸。', drop: [] },
  { id: 'yeji', name: '野鸡', tier: 'normal', element: 'mu', icon: '🐓', base: { hp: 18, atk: 5, def: 2, spd: 7 }, scale: 0.07, gold: [1, 4], exp: 8, desc: '羽毛鲜亮，见人就啄。', drop: [] },
  { id: 'yeya', name: '野鸭', tier: 'normal', element: 'shui', icon: '🦆', base: { hp: 22, atk: 6, def: 2, spd: 7 }, scale: 0.07, gold: [1, 3], exp: 9, desc: '嘎嘎嘎，飞不高。', drop: [] },
  { id: 'pangxie', name: '大闸蟹', tier: 'normal', element: 'shui', icon: '🦀', base: { hp: 30, atk: 8, def: 6, spd: 5 }, scale: 0.07, gold: [2, 6], exp: 11, desc: '横着走，还不讲理。', drop: [] },
  { id: 'niqiu', name: '泥鳅', tier: 'normal', element: 'shui', icon: '🐍', base: { hp: 20, atk: 6, def: 2, spd: 9 }, scale: 0.07, gold: [1, 3], exp: 9, desc: '滑不溜手，抓不住。', drop: [] },
  { id: 'shuizhe', name: '水蛇', tier: 'normal', element: 'shui', icon: '🐍', base: { hp: 34, atk: 10, def: 3, spd: 9 }, scale: 0.08, gold: [1, 4], exp: 12, desc: '水里的阴人。', drop: [] },
  { id: 'heyu', name: '河鱼怪', tier: 'normal', element: 'shui', icon: '🐟', base: { hp: 40, atk: 12, def: 5, spd: 7 }, scale: 0.08, gold: [2, 6], exp: 15, desc: '会喷水的怪鱼。', drop: [] },
  { id: 'qingwa', name: '毒蛙', tier: 'normal', element: 'mu', icon: '🐸', base: { hp: 32, atk: 10, def: 3, spd: 8 }, scale: 0.08, gold: [1, 4], exp: 14, desc: '呱，一舌头都是毒。', drop: [] },
  { id: 'wugong', name: '蜈蚣', tier: 'normal', element: 'mu', icon: '🐛', base: { hp: 36, atk: 11, def: 4, spd: 9 }, scale: 0.08, gold: [1, 5], exp: 15, desc: '百足之虫，看着瘆人。', drop: [] },
  { id: 'luzhi', name: '芦苇精', tier: 'normal', element: 'mu', icon: '🌾', base: { hp: 30, atk: 9, def: 4, spd: 8 }, scale: 0.08, gold: [1, 4], exp: 13, desc: '会缠人的芦苇。', drop: [] },
  { id: 'shuigui', name: '水鬼', tier: 'elite', element: 'shui', icon: '👻', base: { hp: 150, atk: 26, def: 11, spd: 11 }, scale: 0.1, gold: [20, 50], exp: 60, desc: '拖人下水，见死不救。', drop: [] },
  { id: 'hema', name: '河马精', tier: 'normal', element: 'tu', icon: '🦛', base: { hp: 60, atk: 13, def: 9, spd: 4 }, scale: 0.09, gold: [3, 8], exp: 20, desc: '嘴大如盆，脾气不小。', drop: [] },
  { id: 'yuanhou', name: '猿猴', tier: 'normal', element: 'mu', icon: '🐒', base: { hp: 50, atk: 14, def: 5, spd: 11 }, scale: 0.09, gold: [2, 7], exp: 22, desc: '会抢你包袱的猴子。', drop: [] },
  { id: 'laohu', name: '猛虎', tier: 'elite', element: 'jin', icon: '🐅', base: { hp: 180, atk: 30, def: 13, spd: 12 }, scale: 0.1, gold: [30, 80], exp: 70, desc: '百兽之王，见血更凶。', drop: [] },
  { id: 'baozi', name: '豹子', tier: 'elite', element: 'jin', icon: '🐆', base: { hp: 150, atk: 28, def: 10, spd: 14 }, scale: 0.1, gold: [25, 70], exp: 65, desc: '快如闪电的猎手。', drop: [] },
  { id: 'xiongying', name: '雄鹰', tier: 'normal', element: 'jin', icon: '🦅', base: { hp: 55, atk: 16, def: 6, spd: 13 }, scale: 0.09, gold: [3, 8], exp: 24, desc: '俯冲抓人，防不胜防。', drop: [] },
  { id: 'shizi_jing', name: '狮子精', tier: 'elite', element: 'tu', icon: '🦁', base: { hp: 240, atk: 36, def: 20, spd: 9 }, scale: 0.11, gold: [35, 90], exp: 110, desc: '鬃毛如铁，吼声震天。', drop: [] },
  { id: 'xi_niu', name: '犀牛精', tier: 'elite', element: 'tu', icon: '🦏', base: { hp: 300, atk: 38, def: 26, spd: 7 }, scale: 0.11, gold: [40, 100], exp: 130, desc: '皮糙肉厚，横冲直撞。', drop: [] },
  { id: 'xiang', name: '大象精', tier: 'elite', element: 'tu', icon: '🐘', base: { hp: 360, atk: 40, def: 28, spd: 6 }, scale: 0.11, gold: [45, 110], exp: 140, desc: '一脚下去，地动山摇。', drop: [] },
  { id: 'zhi_zhu', name: '蜘蛛精', tier: 'normal', element: 'mu', icon: '🕷', base: { hp: 70, atk: 20, def: 8, spd: 12 }, scale: 0.09, gold: [5, 15], exp: 30, desc: '会结网的暗算者。', drop: [] },
  { id: 'xiezi', name: '蝎子', tier: 'normal', element: 'mu', icon: '🦂', base: { hp: 65, atk: 19, def: 8, spd: 11 }, scale: 0.09, gold: [4, 12], exp: 28, desc: '尾巴有毒，别惹。', drop: [] },
  { id: 'wangshe', name: '王蛇', tier: 'elite', element: 'mu', icon: '🐍', base: { hp: 200, atk: 32, def: 14, spd: 13 }, scale: 0.1, gold: [30, 80], exp: 75, desc: '蛇中之王，吞象不眨眼。', drop: [] },
  { id: 'xueyuan', name: '雪猿', tier: 'elite', element: 'shui', icon: '🦍', base: { hp: 260, atk: 38, def: 22, spd: 13 }, scale: 0.11, gold: [40, 100], exp: 120, desc: '雪山上的人形猛兽。', drop: [] },
  { id: 'sha_diao', name: '沙雕(巨雕)', tier: 'normal', element: 'tu', icon: '🦅', base: { hp: 80, atk: 22, def: 9, spd: 12 }, scale: 0.09, gold: [5, 15], exp: 32, desc: '沙漠上空的死神。', drop: [] },
  { id: 'ju_xie', name: '巨蝎', tier: 'elite', element: 'tu', icon: '🦂', base: { hp: 220, atk: 34, def: 20, spd: 10 }, scale: 0.11, gold: [35, 90], exp: 105, desc: '沙漠里的王者猎手。', drop: [] },
  { id: 'huo_yu', name: '火蜥蜴', tier: 'normal', element: 'huo', icon: '🦎', base: { hp: 90, atk: 24, def: 10, spd: 13 }, scale: 0.09, gold: [6, 18], exp: 34, desc: '会喷火的小家伙。', drop: [] },
  // ---------- 三教九流·江湖人 ----------
  { id: 'xiaohunhun', name: '小混混', tier: 'normal', element: null, icon: '👊', base: { hp: 40, atk: 11, def: 4, spd: 7 }, scale: 0.08, gold: [2, 6], exp: 16, desc: '收保护费，专挑软柿子。', drop: [] },
  { id: 'liulangjian', name: '流浪剑客', tier: 'elite', element: 'jin', icon: '🗡', base: { hp: 150, atk: 28, def: 12, spd: 13 }, scale: 0.1, gold: [25, 70], exp: 65, desc: '剑法野路子，专治不服。', drop: [] },
  { id: 'caiyaoren', name: '采药人', tier: 'normal', element: 'mu', icon: '🧺', base: { hp: 55, atk: 13, def: 5, spd: 8 }, scale: 0.08, gold: [3, 8], exp: 20, desc: '别抢我药！', drop: [] },
  { id: 'kuanggong', name: '挖矿的', tier: 'normal', element: 'tu', icon: '⛏', base: { hp: 70, atk: 15, def: 8, spd: 5 }, scale: 0.08, gold: [4, 10], exp: 22, desc: '一镐头下去，矿和你二选一。', drop: [] },
  { id: 'tanzi', name: '强盗探子', tier: 'normal', element: null, icon: '🕵', base: { hp: 60, atk: 14, def: 6, spd: 10 }, scale: 0.09, gold: [3, 9], exp: 24, desc: '踩点的，眼贼尖。', drop: [] },
  { id: 'baohu', name: '镖局镖头', tier: 'elite', element: 'jin', icon: '🚩', base: { hp: 180, atk: 32, def: 16, spd: 11 }, scale: 0.1, gold: [35, 90], exp: 75, desc: '镖在人在，镖失人跑。', drop: [] },
  { id: 'xiangshen', name: '江湖相士', tier: 'normal', element: 'shui', icon: '🔮', base: { hp: 70, atk: 16, def: 7, spd: 10 }, scale: 0.09, gold: [5, 15], exp: 28, desc: '算你命中有此一劫……', drop: [] },
  { id: 'maiyi', name: '江湖艺人', tier: 'normal', element: null, icon: '🎪', base: { hp: 65, atk: 15, def: 6, spd: 11 }, scale: 0.09, gold: [4, 12], exp: 26, desc: '走江湖卖艺，拳脚也有几分真功夫。', drop: [] },
  { id: 'tuixiazi', name: '屠户', tier: 'normal', element: 'jin', icon: '🔪', base: { hp: 85, atk: 18, def: 9, spd: 7 }, scale: 0.09, gold: [6, 16], exp: 30, desc: '杀猪的，刀法出奇地快。', drop: [] },
  { id: 'liehu', name: '猎户', tier: 'normal', element: 'mu', icon: '🏹', base: { hp: 80, atk: 19, def: 8, spd: 11 }, scale: 0.09, gold: [5, 15], exp: 32, desc: '山里人，会下套。', drop: [] },
  { id: 'yuzhe', name: '江边渔霸', tier: 'normal', element: 'shui', icon: '🎣', base: { hp: 60, atk: 14, def: 5, spd: 9 }, scale: 0.08, gold: [3, 8], exp: 22, desc: '欺行霸市的渔霸，强收过路钱。', drop: [] },
  { id: 'qiaofu', name: '拦路樵夫', tier: 'normal', element: 'mu', icon: '🪓', base: { hp: 75, atk: 17, def: 8, spd: 8 }, scale: 0.09, gold: [4, 12], exp: 27, desc: '明为砍柴，暗里劫道。', drop: [] },
  { id: 'kugu', name: '苦工', tier: 'normal', element: 'tu', icon: '🧱', base: { hp: 90, atk: 16, def: 10, spd: 6 }, scale: 0.09, gold: [5, 14], exp: 28, desc: '力大，气也大。', drop: [] },
  { id: 'xiaotou', name: '小偷', tier: 'normal', element: null, icon: '🥷', base: { hp: 55, atk: 13, def: 5, spd: 12 }, scale: 0.09, gold: [4, 12], exp: 26, desc: '顺手牵羊，防不胜防。', drop: [] },
  { id: 'feizei', name: '飞贼', tier: 'elite', element: 'jin', icon: '🦅', base: { hp: 140, atk: 30, def: 11, spd: 16 }, scale: 0.1, gold: [30, 80], exp: 68, desc: '飞檐走壁，来去无踪。', drop: [] },
  { id: 'sha_ke', name: '沙客', tier: 'normal', element: 'tu', icon: '🐫', base: { hp: 95, atk: 21, def: 12, spd: 9 }, scale: 0.09, gold: [6, 16], exp: 34, desc: '沙漠里讨生活，狠角色。', drop: [] },
  { id: 'chake', name: '黑心货郎', tier: 'normal', element: null, icon: '🍵', base: { hp: 60, atk: 13, def: 5, spd: 8 }, scale: 0.08, gold: [3, 8], exp: 20, desc: '行走江湖的货郎，卖的东西来路不明。', drop: [] },
  { id: 'yanyan', name: '盐帮', tier: 'normal', element: 'shui', icon: '⚖', base: { hp: 100, atk: 22, def: 12, spd: 9 }, scale: 0.09, gold: [8, 20], exp: 36, desc: '贩私盐的，拳头硬。', drop: [] },
  { id: 'shuifei', name: '水匪', tier: 'elite', element: 'shui', icon: '🏴', base: { hp: 170, atk: 31, def: 13, spd: 12 }, scale: 0.1, gold: [30, 80], exp: 72, desc: '水上打家劫舍。', drop: [] },
  { id: 'haidao', name: '海盗', tier: 'elite', element: 'shui', icon: '🏴', base: { hp: 190, atk: 33, def: 14, spd: 13 }, scale: 0.1, gold: [35, 90], exp: 78, desc: '抢船不眨眼，还爱喊口号。', drop: [] },
  { id: 'madao', name: '马贼', tier: 'elite', element: 'jin', icon: '🐎', base: { hp: 200, atk: 35, def: 15, spd: 15 }, scale: 0.11, gold: [40, 100], exp: 90, desc: '骑马劫道，来去如风。', drop: [] },
  { id: 'jiang_hu_ke', name: '江湖客', tier: 'normal', element: null, icon: '🥋', base: { hp: 110, atk: 23, def: 13, spd: 10 }, scale: 0.09, gold: [8, 20], exp: 38, desc: '一言不合就拔刀。', drop: [] },
  { id: 'qigai', name: '丐帮弟子', tier: 'normal', element: null, icon: '🥣', base: { hp: 85, atk: 19, def: 9, spd: 10 }, scale: 0.09, gold: [5, 14], exp: 32, desc: '打狗棒法，专打赖皮狗。', drop: [] },
  { id: 'nishi', name: '尼姑', tier: 'normal', element: null, icon: '🧘', base: { hp: 75, atk: 17, def: 10, spd: 10 }, scale: 0.09, gold: [5, 14], exp: 30, desc: '阿弥陀佛，施主请让路。', drop: [] },
  { id: 'daoshi', name: '游方道士', tier: 'normal', element: 'shui', icon: '☯', base: { hp: 95, atk: 21, def: 11, spd: 11 }, scale: 0.09, gold: [6, 16], exp: 36, desc: '降妖除魔（收费的）。', drop: [] },
  { id: 'heshang', name: '云游僧人', tier: 'normal', element: 'tu', icon: '🙏', base: { hp: 105, atk: 20, def: 14, spd: 9 }, scale: 0.09, gold: [5, 15], exp: 34, desc: '贫僧不打诳语（打人除外）。', drop: [] },
  { id: 'yishi', name: '江湖游医', tier: 'normal', element: 'mu', icon: '💊', base: { hp: 70, atk: 15, def: 7, spd: 10 }, scale: 0.09, gold: [4, 12], exp: 28, desc: '云游四方，医术与毒术难分。', drop: [] },
  { id: 'nongmin', name: '起义农民', tier: 'normal', element: 'huo', icon: '🔥', base: { hp: 120, atk: 24, def: 12, spd: 9 }, scale: 0.09, gold: [8, 20], exp: 40, desc: '官逼民反，民不得不反。', drop: [] },
  { id: 'tufei', name: '土匪', tier: 'normal', element: 'jin', icon: '🪓', base: { hp: 130, atk: 26, def: 13, spd: 11 }, scale: 0.09, gold: [10, 25], exp: 45, desc: '落草为寇，抢了再说。', drop: [] },
  { id: 'huafei', name: '花和尚', tier: 'normal', element: 'tu', icon: '🍺', base: { hp: 140, atk: 27, def: 15, spd: 10 }, scale: 0.09, gold: [10, 25], exp: 48, desc: '酒肉穿肠过，拳头不留情。', drop: [] },
  // ---------- 门派高手·江湖名宿 ----------
  { id: 'jian_si', name: '剑师', tier: 'elite', element: 'jin', icon: '🗡', base: { hp: 260, atk: 40, def: 20, spd: 16 }, scale: 0.11, gold: [50, 130], exp: 130, desc: '以剑入道，剑随心动。', drop: [] },
  { id: 'dao_ke_2', name: '刀客', tier: 'elite', element: 'jin', icon: '🔪', base: { hp: 300, atk: 44, def: 24, spd: 13 }, scale: 0.11, gold: [55, 140], exp: 140, desc: '一刀断水，霸气侧漏。', drop: [] },
  { id: 'yao_shi', name: '药师', tier: 'normal', element: 'mu', icon: '💊', base: { hp: 160, atk: 28, def: 16, spd: 11 }, scale: 0.1, gold: [20, 50], exp: 70, desc: '毒药解药，傻傻分不清。', drop: [] },
  { id: 'du_shi', name: '毒师', tier: 'elite', element: 'mu', icon: '🧪', base: { hp: 240, atk: 38, def: 18, spd: 15 }, scale: 0.11, gold: [50, 130], exp: 120, desc: '浑身是毒，碰都碰不得。', drop: [] },
  { id: 'qian_shou', name: '拳手', tier: 'normal', element: 'tu', icon: '🥊', base: { hp: 200, atk: 34, def: 22, spd: 11 }, scale: 0.1, gold: [25, 60], exp: 80, desc: '铁拳无敌，一拳一个。', drop: [] },
  { id: 'tui_shou', name: '推手', tier: 'elite', element: 'shui', icon: '☯', base: { hp: 280, atk: 40, def: 24, spd: 14 }, scale: 0.11, gold: [50, 130], exp: 125, desc: '以柔克刚，四两拨千斤。', drop: [] },
  { id: 'an_qi_shi', name: '暗器师', tier: 'elite', element: 'jin', icon: '🎯', base: { hp: 250, atk: 42, def: 18, spd: 18 }, scale: 0.11, gold: [55, 140], exp: 135, desc: '暗器如雨，例不虚发。', drop: [] },
  { id: 'gong_nu', name: '弓弩手', tier: 'normal', element: 'jin', icon: '🏹', base: { hp: 180, atk: 36, def: 15, spd: 14 }, scale: 0.1, gold: [25, 60], exp: 85, desc: '百步穿杨，先发制人。', drop: [] },
  { id: 'qi_bing', name: '骑兵', tier: 'elite', element: 'jin', icon: '🐎', base: { hp: 320, atk: 46, def: 28, spd: 16 }, scale: 0.11, gold: [60, 150], exp: 150, desc: '铁骑冲阵，势不可挡。', drop: [] },
  { id: 'dun_bing', name: '盾兵', tier: 'normal', element: 'tu', icon: '🛡', base: { hp: 240, atk: 30, def: 30, spd: 8 }, scale: 0.1, gold: [30, 70], exp: 95, desc: '盾牌一立，刀枪不入。', drop: [] },
  { id: 'emei_di', name: '峨眉弟子', tier: 'elite', element: 'shui', icon: '🗡', base: { hp: 300, atk: 44, def: 26, spd: 16 }, scale: 0.11, gold: [55, 140], exp: 145, desc: '剑舞轻灵，巾帼不让须眉。', drop: [] },
  { id: 'kunlun_di', name: '昆仑弟子', tier: 'elite', element: 'tu', icon: '☯', base: { hp: 320, atk: 46, def: 30, spd: 13 }, scale: 0.11, gold: [60, 150], exp: 150, desc: '昆仑功法，正大光明。', drop: [] },
  { id: 'huashan_di', name: '华山弟子', tier: 'elite', element: 'jin', icon: '⚔', base: { hp: 310, atk: 48, def: 25, spd: 17 }, scale: 0.11, gold: [60, 150], exp: 148, desc: '华山论剑，剑意冲霄。', drop: [] },
  { id: 'qingcheng_di', name: '青城弟子', tier: 'elite', element: 'mu', icon: '🗡', base: { hp: 290, atk: 44, def: 24, spd: 16 }, scale: 0.11, gold: [55, 140], exp: 142, desc: '青城剑法，绵里藏针。', drop: [] },
  { id: 'kongtong_di', name: '崆峒弟子', tier: 'elite', element: 'tu', icon: '🥊', base: { hp: 340, atk: 46, def: 32, spd: 12 }, scale: 0.11, gold: [60, 150], exp: 152, desc: '崆峒拳，刚猛无俦。', drop: [] },
  { id: 'diancang_di', name: '点苍弟子', tier: 'elite', element: 'jin', icon: '⚔', base: { hp: 300, atk: 46, def: 24, spd: 16 }, scale: 0.11, gold: [55, 140], exp: 145, desc: '点苍剑，快若流星。', drop: [] },
  { id: 'hengshan_di', name: '衡山弟子', tier: 'elite', element: 'mu', icon: '🗡', base: { hp: 280, atk: 43, def: 25, spd: 15 }, scale: 0.11, gold: [55, 140], exp: 140, desc: '衡山剑，云淡风轻。', drop: [] },
  { id: 'gaibang_zhang', name: '丐帮长老', tier: 'elite', element: 'tu', icon: '🥣', base: { hp: 400, atk: 50, def: 34, spd: 14 }, scale: 0.12, gold: [70, 180], exp: 180, desc: '打狗棒法，天下无双。', drop: [] },
  { id: 'emei_shitai', name: '峨眉师太', tier: 'elite', element: 'shui', icon: '🗡', base: { hp: 360, atk: 48, def: 30, spd: 15 }, scale: 0.12, gold: [65, 160], exp: 170, desc: '剑心通明，冷面如霜。', drop: [] },
  { id: 'shaolin_seng', name: '少林武僧', tier: 'elite', element: 'tu', icon: '🙏', base: { hp: 420, atk: 52, def: 38, spd: 12 }, scale: 0.12, gold: [70, 180], exp: 185, desc: '金钟罩铁布衫，刀枪不入。', drop: [] },
  { id: 'wudang_zhenren', name: '武当真人', tier: 'elite', element: 'shui', icon: '☯', base: { hp: 380, atk: 50, def: 32, spd: 16 }, scale: 0.12, gold: [70, 180], exp: 175, desc: '太极两仪，以静制动。', drop: [] },
  { id: 'tangmen_zhu', name: '唐门高手', tier: 'elite', element: 'jin', icon: '🎯', base: { hp: 340, atk: 54, def: 24, spd: 20 }, scale: 0.12, gold: [70, 180], exp: 180, desc: '暗器机关，防不胜防。', drop: [] },
  { id: 'miao_jiang_wu', name: '苗疆巫师', tier: 'elite', element: 'mu', icon: '🦂', base: { hp: 360, atk: 48, def: 26, spd: 17 }, scale: 0.12, gold: [65, 160], exp: 172, desc: '下蛊下咒，神鬼莫测。', drop: [] },
  { id: 'xi_yu_sheng', name: '西域圣僧', tier: 'elite', element: 'tu', icon: '🕉', base: { hp: 400, atk: 50, def: 36, spd: 14 }, scale: 0.12, gold: [70, 180], exp: 178, desc: '番僧武艺，另辟蹊径。', drop: [] },
  { id: 'dong_ying_ren', name: '东瀛武士', tier: 'elite', element: 'jin', icon: '⚔', base: { hp: 330, atk: 50, def: 24, spd: 18 }, scale: 0.12, gold: [65, 160], exp: 168, desc: '居合斩，一刀定生死。', drop: [] },
  { id: 'mogu_shishi', name: '蒙古勇士', tier: 'elite', element: 'jin', icon: '🐎', base: { hp: 360, atk: 54, def: 30, spd: 16 }, scale: 0.12, gold: [70, 180], exp: 180, desc: '草原铁骑，弯刀饮血。', drop: [] },
  { id: 'ti_shi', name: '提刑官', tier: 'normal', element: 'tu', icon: '⚖', base: { hp: 260, atk: 38, def: 28, spd: 12 }, scale: 0.1, gold: [40, 100], exp: 110, desc: '查案的，眼神能看穿你。', drop: [] },
  { id: 'jiang_hu_bang', name: '江湖榜高手', tier: 'elite', element: 'jin', icon: '🏆', base: { hp: 460, atk: 60, def: 38, spd: 19 }, scale: 0.12, gold: [90, 240], exp: 240, desc: '江湖排行榜上有名。', drop: [] },
  { id: 'tian_xia_di_yi', name: '天下第一(假)', tier: 'elite', element: 'jin', icon: '👑', base: { hp: 520, atk: 66, def: 42, spd: 20 }, scale: 0.13, gold: [100, 260], exp: 280, desc: '自称天下第一，其实前十开外。', drop: [] },
  // ---------- 妖魔精怪·阴司 ----------
  { id: 'gui_yi', name: '游魂', tier: 'normal', element: null, icon: '👻', base: { hp: 90, atk: 22, def: 10, spd: 13 }, scale: 0.09, gold: [5, 15], exp: 40, desc: '飘来飘去，不干正事。', drop: [] },
  { id: 'li_gui', name: '厉鬼', tier: 'elite', element: 'huo', icon: '👹', base: { hp: 280, atk: 42, def: 20, spd: 17 }, scale: 0.11, gold: [55, 140], exp: 150, desc: '怨气冲天，见人就扑。', drop: [] },
  { id: 'jiangshi', name: '僵尸', tier: 'normal', element: 'tu', icon: '🧟', base: { hp: 180, atk: 32, def: 20, spd: 7 }, scale: 0.1, gold: [20, 50], exp: 80, desc: '一蹦一蹦，专咬脖子。', drop: [] },
  { id: 'hu_shi', name: '狐尸', tier: 'normal', element: 'mu', icon: '🦊', base: { hp: 160, atk: 30, def: 16, spd: 12 }, scale: 0.1, gold: [20, 50], exp: 75, desc: '狐妖变的尸体，怪吓人。', drop: [] },
  { id: 'shan_gui', name: '山鬼', tier: 'normal', element: 'mu', icon: '👹', base: { hp: 200, atk: 36, def: 22, spd: 13 }, scale: 0.1, gold: [25, 60], exp: 90, desc: '山林里的鬼影。', drop: [] },
  { id: 'shui_shen', name: '河神(假)', tier: 'elite', element: 'shui', icon: '🐉', base: { hp: 340, atk: 48, def: 28, spd: 16 }, scale: 0.11, gold: [60, 150], exp: 160, desc: '装神弄鬼骗香火。', drop: [] },
  { id: 'tu_shen', name: '土地(假)', tier: 'elite', element: 'tu', icon: '🧙', base: { hp: 380, atk: 46, def: 32, spd: 12 }, scale: 0.11, gold: [60, 150], exp: 155, desc: '假土地，真骗子。', drop: [] },
  { id: 'hu_xian', name: '狐仙(伪)', tier: 'elite', element: 'huo', icon: '🦊', base: { hp: 320, atk: 50, def: 24, spd: 19 }, scale: 0.11, gold: [60, 150], exp: 165, desc: '狐火惑人，假扮神仙。', drop: [] },
  { id: 'yao_mei', name: '妖魅', tier: 'normal', element: 'huo', icon: '👁', base: { hp: 210, atk: 38, def: 20, spd: 17 }, scale: 0.1, gold: [30, 70], exp: 95, desc: '魅惑人心，吸人精气。', drop: [] },
  { id: 'bianfu', name: '蝙蝠精', tier: 'normal', element: 'huo', icon: '🦇', base: { hp: 170, atk: 32, def: 16, spd: 16 }, scale: 0.1, gold: [20, 50], exp: 85, desc: '倒挂夜行，吸血为生。', drop: [] },
  { id: 'mao_shen', name: '猫妖', tier: 'normal', element: 'shui', icon: '🐈', base: { hp: 190, atk: 34, def: 18, spd: 18 }, scale: 0.1, gold: [25, 60], exp: 90, desc: '九条命，惹不起。', drop: [] },
  { id: 'gui_cha', name: '鬼差', tier: 'normal', element: 'huo', icon: '⚫', base: { hp: 220, atk: 36, def: 22, spd: 14 }, scale: 0.1, gold: [30, 70], exp: 100, desc: '索命的，铁面无私。', drop: [] },
  { id: 'pan_guan', name: '判官(假)', tier: 'elite', element: 'huo', icon: '⚖', base: { hp: 400, atk: 52, def: 32, spd: 18 }, scale: 0.12, gold: [70, 180], exp: 190, desc: '假扮判官，判人生死。', drop: [] },
  { id: 'niu_tou', name: '牛头', tier: 'normal', element: 'tu', icon: '🐂', base: { hp: 260, atk: 40, def: 26, spd: 10 }, scale: 0.1, gold: [30, 80], exp: 105, desc: '牛头马面，勾魂索命。', drop: [] },
  { id: 'ma_mian', name: '马面', tier: 'normal', element: 'tu', icon: '🐎', base: { hp: 250, atk: 38, def: 24, spd: 12 }, scale: 0.1, gold: [30, 80], exp: 105, desc: '马面牛头，一个不少。', drop: [] },
  { id: 'bai_wuchang', name: '白无常', tier: 'normal', element: 'shui', icon: '⚪', base: { hp: 240, atk: 42, def: 22, spd: 16 }, scale: 0.1, gold: [30, 80], exp: 110, desc: '白袍无常，一笑索命。', drop: [] },
  { id: 'hei_wuchang', name: '黑无常', tier: 'normal', element: 'shui', icon: '⚫', base: { hp: 260, atk: 44, def: 24, spd: 15 }, scale: 0.1, gold: [30, 80], exp: 115, desc: '黑袍无常，一哭送终。', drop: [] },
  { id: 'meng_po', name: '孟婆(假)', tier: 'normal', element: 'shui', icon: '🍵', base: { hp: 220, atk: 34, def: 20, spd: 13 }, scale: 0.1, gold: [25, 60], exp: 95, desc: '一碗汤，忘了前尘（假的）。', drop: [] },
  { id: 'shi_shi', name: '石狮', tier: 'elite', element: 'tu', icon: '🦁', base: { hp: 440, atk: 50, def: 40, spd: 8 }, scale: 0.12, gold: [70, 180], exp: 185, desc: '石狮子成精，镇宅又镇人。', drop: [] },
  { id: 'tong_xiang', name: '铜像', tier: 'elite', element: 'tu', icon: '🗿', base: { hp: 480, atk: 48, def: 44, spd: 7 }, scale: 0.12, gold: [70, 180], exp: 190, desc: '铜浇铁铸，金刚不坏。', drop: [] },
  { id: 'yao_seng', name: '妖僧', tier: 'elite', element: 'huo', icon: '🧟', base: { hp: 420, atk: 54, def: 30, spd: 18 }, scale: 0.12, gold: [70, 180], exp: 195, desc: '披着袈裟的魔。', drop: [] },
  { id: 'gui_jiang', name: '鬼将', tier: 'elite', element: 'huo', icon: '⚔', base: { hp: 460, atk: 58, def: 36, spd: 17 }, scale: 0.12, gold: [80, 200], exp: 210, desc: '阴兵之首，杀气凛然。', drop: [] },
  { id: 'yao_dao', name: '妖道', tier: 'elite', element: 'huo', icon: '☯', base: { hp: 400, atk: 52, def: 30, spd: 18 }, scale: 0.12, gold: [70, 180], exp: 185, desc: '邪门歪道，害人不浅。', drop: [] },
  { id: 'xie_jian', name: '邪剑灵', tier: 'elite', element: 'jin', icon: '🗡', base: { hp: 380, atk: 56, def: 28, spd: 20 }, scale: 0.12, gold: [70, 180], exp: 190, desc: '一柄嗜血的邪剑。', drop: [] },
  // ---------- 新增 Boss ----------
  { id: 'heifeng_zhai', name: '黑风寨主·黑旋风', tier: 'boss', element: 'jin', icon: '🪓',
    base: { hp: 520, atk: 60, def: 30, spd: 14 }, scale: 0.13, gold: [150, 400], exp: 320,
    desc: '黑风寨扛把子，三板斧唬遍十里八乡。', drop: ['heifeng_dao'] },
  { id: 'yunmeng_shui', name: '云梦水怪·老蛟', tier: 'boss', element: 'shui', icon: '🐉',
    base: { hp: 900, atk: 80, def: 50, spd: 16 }, scale: 0.13, gold: [250, 600], exp: 480,
    desc: '潜伏云梦泽底的老蛟，专拖过河人下水。', drop: ['laojiao_dan'] },
  { id: 'xiyu_da', name: '西域大盗·沙里飞', tier: 'boss', element: 'jin', icon: '🐫',
    base: { hp: 800, atk: 75, def: 45, spd: 19 }, scale: 0.13, gold: [250, 600], exp: 460,
    desc: '来去如风的沙漠悍匪，抢过朝廷的盐队。', drop: ['shali_jian'] },
  { id: 'kunlun_xian', name: '昆仑散仙', tier: 'boss', element: 'shui', icon: '☯',
    base: { hp: 1000, atk: 88, def: 55, spd: 20 }, scale: 0.14, gold: [300, 700], exp: 550,
    desc: '自称散仙，其实是个脾气古怪的老头。', drop: ['kunlun_fa'] },
  { id: 'donghai_long', name: '东海龙王(伪)', tier: 'boss', element: 'shui', icon: '🐲',
    base: { hp: 1600, atk: 105, def: 65, spd: 21 }, scale: 0.14, gold: [400, 900], exp: 700,
    desc: '占龙宫称王的妖怪，最喜欢让人喊他"陛下"。', drop: ['longzhu'] },
  { id: 'huangquan_wang', name: '黄泉鬼王', tier: 'boss', element: 'huo', icon: '👹',
    base: { hp: 1800, atk: 115, def: 70, spd: 22 }, scale: 0.15, gold: [450, 1000], exp: 800,
    desc: '黄泉路上的万鬼之主，一呼百应。', drop: ['guiwang_ling'] },
  { id: 'tianmen_shou', name: '天门守将', tier: 'boss', element: 'jin', icon: '⚔',
    base: { hp: 2200, atk: 130, def: 80, spd: 24 }, scale: 0.15, gold: [500, 1200], exp: 1000,
    desc: '守护天门的最后一道关，剑出则山河变色。', drop: ['tianmen_jian'] },
  // ---------- 江湖大事件专属 Boss ----------
  { id: 'we_boss1', name: '魔教先锋·血手校尉', tier: 'boss', element: 'huo',
    base: { hp: 420, atk: 52, def: 24, spd: 15 }, scale: 0.13, gold: [80, 200], exp: 260,
    desc: '魔教入侵的前锋大将，一双血手之下亡魂无数。', drop: [] },
  { id: 'we_boss2', name: '护宝异兽·吞金兽', tier: 'boss', element: 'jin',
    base: { hp: 500, atk: 48, def: 30, spd: 12 }, scale: 0.13, gold: [60, 180], exp: 240,
    desc: '天生地养的护宝凶兽，皮坚如铁，见宝即吞。', drop: [] },
  { id: 'we_boss3', name: '血洗门派的凶徒·断魂刀', tier: 'boss', element: 'jin',
    base: { hp: 380, atk: 56, def: 22, spd: 17 }, scale: 0.13, gold: [80, 200], exp: 270,
    desc: '围攻门派的贼首，刀法狠辣，专取人性命。', drop: [] },
  { id: 'we_boss4', name: '武林大会魁首·铁掌横江', tier: 'boss', element: 'tu',
    base: { hp: 460, atk: 50, def: 28, spd: 13 }, scale: 0.13, gold: [90, 220], exp: 280,
    desc: '连任三届的武林魁首，一双铁掌打遍群雄。', drop: [] },
  { id: 'we_boss5', name: '妖祸之主·三尾妖狐', tier: 'boss', element: 'mu',
    base: { hp: 400, atk: 54, def: 24, spd: 19 }, scale: 0.13, gold: [80, 200], exp: 270,
    desc: '兴风作浪的狐妖，幻术与利爪同样致命。', drop: [] },
  { id: 'we_boss6', name: '夺宝悍匪·金算盘', tier: 'boss', element: 'jin',
    base: { hp: 360, atk: 53, def: 22, spd: 16 }, scale: 0.13, gold: [100, 240], exp: 250,
    desc: '闻风而来的悍匪头子，算盘珠子也能当暗器。', drop: [] },
  { id: 'we_boss7', name: '邪功传人·血煞郎君', tier: 'boss', element: 'shui',
    base: { hp: 440, atk: 55, def: 26, spd: 18 }, scale: 0.13, gold: [80, 200], exp: 280,
    desc: '练成邪功的疯子，走火入魔，见人就杀。', drop: [] },
  { id: 'we_boss8', name: '掳人者·无面鬼', tier: 'boss', element: 'shui',
    base: { hp: 420, atk: 54, def: 25, spd: 18 }, scale: 0.13, gold: [80, 200], exp: 280,
    desc: '神出鬼没的神秘高手，无人见过其真容。', drop: [] }
];

// ---------- 敌人头像（唯一权威来源：人类=人像，兽妖鬼魔=对应形象） ----------
const ENEMY_ICONS = {
  chicken: '🐔', erdog: '👤', yedog: '🐕', zuihan: '🧔', toujizei: '🥷', shanzei: '🥷', sheshe: '🐍', yezhu: '🐗', lang: '🐺',
  shanzeitou: '🥷', pianzi: '🧔', maijiaoyao: '🧔', sanliu: '🥋', tangshou: '👤', caihuazei: '🥷', xuemo_itu: '👤', xiexiu: '🧙',
  yaolang: '🐺', tiebeixiong: '🐻', shaolin_di: '🙏', wudang_di: '🥋', tangmen_di: '🥷', gushi: '🧙', sheyao: '🐍', huyao: '🦊',
  shashou: '🥷', lvlin: '🥷', mojiao_hufa: '🥷', jianke: '🥋', daoke: '🥋', qiangxian: '🥋', yaowang: '🐉',
  shanzei_wang: '🥷', mojiao_zhanglao: '🥷', jian_sheng: '🥋', yaohou: '👹', final_boss: '👹',
  shouling_jiangjun: '🗿', dianyuguan: '⛓',
  goose: '🦢', niu: '🐂', laoshu: '🐀', feng: '🐝', yemaomiao: '🐈', yeji: '🐓', yeya: '🦆', pangxie: '🦀', niqiu: '🐍',
  shuizhe: '🐍', heyu: '🐟', qingwa: '🐸', wugong: '🐛', luzhi: '🌾', shuigui: '👻', hema: '🦛', yuanhou: '🐒', laohu: '🐅',
  baozi: '🐆', xiongying: '🦅', shizi_jing: '🦁', xi_niu: '🦏', xiang: '🐘', zhi_zhu: '🕷', xiezi: '🦂', wangshe: '🐍',
  xueyuan: '🦍', sha_diao: '🦅', ju_xie: '🦂', huo_yu: '🦎',
  xiaohunhun: '👤', liulangjian: '🥋', caiyaoren: '👤', kuanggong: '👤', tanzi: '🕵', baohu: '👤', xiangshen: '🧔',
  maiyi: '🤹', tuixiazi: '🧔', liehu: '👤', yuzhe: '🧔', qiaofu: '👤', kugu: '👤', xiaotou: '🥷', feizei: '🥷',
  sha_ke: '🧔', chake: '🧔', yanyan: '👤', shuifei: '🥷', haidao: '🥷', madao: '🥷', jiang_hu_ke: '🥋', qigai: '👤',
  nishi: '🙏', daoshi: '🧙', heshang: '🙏', yishi: '🧔', nongmin: '👤', tufei: '🥷', huafei: '🙏',
  jian_si: '🥋', dao_ke_2: '🥋', yao_shi: '🧔', du_shi: '🧙', qian_shou: '🥋', tui_shou: '🥋', an_qi_shi: '🥷',
  gong_nu: '👤', qi_bing: '👤', dun_bing: '👤', emei_di: '🥋', kunlun_di: '🥋', huashan_di: '🥋', qingcheng_di: '🥋',
  kongtong_di: '🥋', diancang_di: '🥋', hengshan_di: '🥋', gaibang_zhang: '👤', emei_shitai: '🙏', shaolin_seng: '🙏',
  wudang_zhenren: '🧙', tangmen_zhu: '🥷', miao_jiang_wu: '🧙', xi_yu_sheng: '🙏', dong_ying_ren: '🥋', mogu_shishi: '🥋',
  ti_shi: '👤', jiang_hu_bang: '🥋', tian_xia_di_yi: '🥋',
  gui_yi: '👻', li_gui: '👹', jiangshi: '🧟', hu_shi: '🦊', shan_gui: '👹', shui_shen: '🐉', tu_shen: '👴', hu_xian: '🦊',
  yao_mei: '👻', bianfu: '🦇', mao_shen: '🐈', gui_cha: '👻', pan_guan: '👹', niu_tou: '🐂', ma_mian: '🐎',
  bai_wuchang: '👻', hei_wuchang: '👻', meng_po: '👵', shi_shi: '🦁', tong_xiang: '🗿', yao_seng: '👹', gui_jiang: '👹',
  yao_dao: '🧙', xie_jian: '🗡',
  heifeng_zhai: '🥷', yunmeng_shui: '🐉', xiyu_da: '🥷', kunlun_xian: '🧙', donghai_long: '🐲', huangquan_wang: '👹', tianmen_shou: '🥋',
  we_boss1: '🥷', we_boss2: '🦁', we_boss3: '🥷', we_boss4: '🥋', we_boss5: '🦊', we_boss6: '🥷', we_boss7: '👹', we_boss8: '👻'
};

// ---------- 像素头像系统（墨底金线，16×16，逐像素手绘） ----------
// 调色板：. 透明 / W 纸白 / L 亮金 / G 金 / M 暗金(阴影) / K 墨(瞳孔/轮廓)
const PIX_PALETTE = { W: '#f2e6c8', L: '#d8b26a', G: '#c9a05a', M: '#8a6a3a', K: '#2a2012', A: '#e8c878' };

// 每张图 16 行 × 16 列；分类底图 + 独立 BOSS 头像
const PIXEL_SPRITES = {
  // —— 人物 ——
  human: [
    '................',
    '................',
    '.......LL.......',
    '.....GGGGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GWMMWG.....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGMMGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
  ],
  sword: [
    '................',
    '.......MM.......',
    '.......MM.......',
    '.....GGGGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GWMMWG.....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..MMMMMMMMMMMM..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
  ],
  blade: [
    '................',
    '....MMMMMMMM....',
    '..MMMMMMMMMMMM..',
    '.....GGGGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GWMMWG.....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGMMGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
  ],
  monk: [
    '................',
    '................',
    '................',
    '.....GGGGGG.....',
    '.....GGKGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GWMMWG.....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..MMGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
  ],
  bandit: [
    '................',
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '...MMMMMMMMMM...',
    '...MMGGGGGGMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  // —— 兽禽 ——
  fowl: [
    '................',
    '................',
    '......L.L.......',
    '.....LLLLL......',
    '.....GGGGG......',
    '.....GWKGG......',
    '.....GGGGGMM....',
    '.....GGGGGMM....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '....GG....GG....',
    '................',
  ],
  dog: [
    '................',
    '...MM......MM...',
    '...GMM....MMG...',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  wolf: [
    '................',
    '...M........M...',
    '...MM......MM...',
    '..MMM......MMM..',
    '..GGGGGGGGGGGG..',
    '..GWWWWWWWWWWG..',
    '..GWKKWWWWKKWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGWWWWGGGG..',
    '...GGGGMMGGGG...',
    '....GGGMMGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  snake: [
    '................',
    '................',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '....GWWWWWWG....',
    '....GWKKKKWG....',
    '....GWWWWWWG....',
    '....GGGGGGGG....',
    '....GGGMMGGG....',
    '.....GMMMMG.....',
    '......M..M......',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  boar: [
    '................',
    '...MM......MM...',
    '...GMM....MMG...',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '...GGGGMMGGGG...',
    '...GWWMMMMWWG...',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  // —— 鬼怪 ——
  ghost: [
    '................',
    '................',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWKWWWWKWW...',
    '...WWWWWWWWWW...',
    '...WWWWMMWWWW...',
    '...WWWWWWWWWW...',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '.....WWWWWW.....',
  ],
  demon: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '...MMMM..MMMM...',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGMMGGGG...',
    '...GGGMMMMGGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  // —— 独立 BOSS ——
  boss_shanzei: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMKKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '...MMKMMMMMMM...',
    '...MMMMMMMMMM...',
    '...MMGGGGGGMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..MMMMMMMMMMMM..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
  ],
  // —— 宿敌（独立） ——
  rival: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMKKKKKKKKMM..',
    '..MMKKWKKWKKMM..',
    '..MMKKKKKKKKMM..',
    '...MMMMMMMMMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  // —— 红颜（独立，A = 角色专属色） ——
  lover_generic: [
    '................',
    '................',
    '....GGGGGGGG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_xiaoyu: [
    '................',
    '.....AA....AA...',
    '....GGGGGGGG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_lingyue: [
    '................',
    '.......AA.......',
    '.......GG.......',
    '......GGGG......',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
  ],
  lover_yaoyao: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_shenqingci: [
    '................',
    '...MMMMMMMMMM...',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_guqingcheng: [
    '.......AA.......',
    '.......GG.......',
    '......GGGG......',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_liuruyan: [
    '................',
    '....GGGGGGGG....',
    '....GAWWWWAG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_murongxue: [
    '................',
    '.....AA..AA.....',
    '....GGGGGGGG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_chuyunyan: [
    '..AA......AA....',
    '..GG......GG....',
    '..GG......GG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_luoshennv: [
    '..MM........MM..',
    '..MMM......MMM..',
    '..GGGGGGGGGGGG..',
    '..GGWWWWWWWWGG..',
    '..GGWKKWWKKWGG..',
    '..GGWWWWWWWWGG..',
    '..GGWWMMWWWWGG..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  lover_huaqianying: [
    '......AA........',
    '......GG........',
    '......GG........',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_wenruyue: [
    '................',
    '.......AA.......',
    '......GGGG......',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_yunbin: [
    '................',
    '....GGGGGGGG....',
    '....GAWAWAG.....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_sumuqiu: [
    '................',
    '................',
    '....GGGGGGGG....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_lanfenghuang: [
    '..L..M....M..L..',
    '..L.MMMMMMMM.L..',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_luxueqi: [
    '................',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  lover_fengming: [
    '.......AA.......',
    '......GGGG......',
    '......GGGG......',
    '...GGGGGGGGGG...',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_qinkeqing: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKKWWKKWMM..',
    '..MMWWWWWWWWMM..',
    '..MMWWMMWWWWMM..',
    '..MMMMMMMMMMMM..',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  lover_jiangwanyin: [
    '..GG......GG....',
    '..GG......GG....',
    '..AA......AA....',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  lover_bairuoxue: [
    '................',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWKWWWWKWW...',
    '...WWWWWWWWWW...',
    '...WWWWMMWWWW...',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '...GGGGGGGGGG...',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  lover_qingli: [
    '................',
    '...MM......MM...',
    '..MMMM....MMMM..',
    '...GGWWWWWWGG...',
    '...GGWKKWWKGG...',
    '...GGWWWWWWGG...',
    '...GGWWMMWWGG...',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GAGGGGGGGGAG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  // —— 人物补充 ——
  beggar: [
    '................',
    '...L.L..L.L.....',
    '...GGGGGGGG.....',
    '...GWWWWWWG.....',
    '...GWKKWWKG.....',
    '...GWWWWWWG.....',
    '...GWWMMWWG.....',
    '...GGGGGGGG.....',
    '...GGGGGGGG.....',
    '..GGGGGGGGGG....',
    '..GMGGGGGGMG....',
    '..GGGGGGGGGG....',
    '.GGGGGGGGGGGG...',
    '.GG.GGGGGGGG....',
    '................',
    '................',
  ],
  taoist: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '...GGGGGGGG.....',
    '...GWWWWWWG.....',
    '...GWKKWWKG.....',
    '...GWWWWWWG.....',
    '...GWMMWWWG.....',
    '...GGGGGGGG.....',
    '...GGGGGGGG.....',
    '..GGGGGGGGGG....',
    '..GGGGGGGGGG....',
    '..GGGGGGGGGG....',
    '.GGGGGGGGGGGG...',
    '.GGGGGGGGGGGG...',
    '................',
  ],
  soldier: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  fist: [
    '................',
    '....MMMMMMMM....',
    '...GGGGGGGG.....',
    '...GWWWWWWG.....',
    '...GWKKWWKG.....',
    '...GWWWWWWG.....',
    '...GWWMMWWG.....',
    '...GGGGGGGG.....',
    '...GGGGGGGG.....',
    '..GGGGGGGGGG....',
    '.GGGGGGGGGGGG...',
    '.GGGGGGGGGGGG...',
    '................',
    '................',
    '................',
    '................',
  ],
  // —— 兽禽 ——
  bear: [
    '................',
    '....MM....MM....',
    '....GMM..MMG....',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  tiger: [
    '................',
    '....MM....MM....',
    '....GMM..MMG....',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '...GWWKWWWWKG...',
    '...GWWWWWWWWG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  leopard: [
    '................',
    '....MM....MM....',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '...GWWKWWWWKG...',
    '...GWWWWWWWWG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  lion: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MGGGGGGGGGGM..',
    '..MGWWWWWWWWGM..',
    '..MGWKWWWWKWGM..',
    '..MGWWWWWWWWGM..',
    '..MGGGMMMMGGGM..',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  ox: [
    '................',
    '..MM......MM....',
    '..MM......MM....',
    '..GGGGGGGGGGG...',
    '..GWWWWWWWWWG...',
    '..GWKKWWKKWWG...',
    '..GWWWWWWWWWG...',
    '..GGWWMMMMWWG...',
    '...GGGMMMMGGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  horse: [
    '................',
    '....MM....MM....',
    '....GMM..MMG....',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  monkey: [
    '................',
    '...MM......MM...',
    '..GGGGGGGGGGGG..',
    '..GGWWWWWWWWGG..',
    '..GGWKKWWKKWGG..',
    '..GGWWWWWWWWGG..',
    '..GGGGWWWWGGGG..',
    '..GGGGMMMMGGGG..',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  fox: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '..GGGGGGGGGGGG..',
    '..GWWWWWWWWWWG..',
    '..GWKKWWWWKKWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGWWWWGGGG..',
    '...GGGGMMGGGG...',
    '....GGGMMGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  rat: [
    '................',
    '....MM....MM....',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '....GGMMMMGG....',
    '....GMMMMMMG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  cat: [
    '................',
    '...MM......MM...',
    '...GMM....MMG...',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '....GGMMMMGG....',
    '....GGMMMMGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  bird: [
    '................',
    '................',
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GWKGG......',
    '.....GGGGGMM....',
    '.....GGGGGGMM...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '....GG....GG....',
    '................',
    '................',
  ],
  fish: [
    '................',
    '................',
    '................',
    '......GGGG......',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGWGGGGGGWGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.....GG..GG.....',
    '................',
    '................',
    '................',
    '................',
  ],
  frog: [
    '................',
    '....GG....GG....',
    '....GWK..KWG....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWWKKWWWWG...',
    '...GGWWWWWWGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  crab: [
    '................',
    '...MM......MM...',
    '..GMMM....MMMG..',
    '..GGGGGGGGGGGG..',
    '...GWWWWWWWWG...',
    '...GWKWWWWKWG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '..GG..GGGG..GG..',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  scorpion: [
    '................',
    '......MMMM......',
    '.....GGGGGG.....',
    '...MMGGGGGGMM...',
    '..GMMMGGGGMMMG..',
    '..GGGGGGGGGGGG..',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '..GG........GG..',
    '................',
    '................',
    '................',
    '................',
  ],
  spider: [
    '................',
    '..GG........GG..',
    '...GG......GG...',
    '....GG....GG....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGWWWWWWGG...',
    '...GGWKWWKWGG...',
    '...GGWWWWWWGG...',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '....GG....GG....',
    '...GG......GG...',
    '..GG........GG..',
    '................',
    '................',
  ],
  centipede: [
    '................',
    '..G..G..G..G..G.',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.G..G..G..G..G..',
    '..GGGGGGGGGGGG..',
    '..G..G..G..G..G.',
    '..GGGGGGGGGGGG..',
    '.G..G..G..G..G..',
    '..GGGGGGGGGGGG..',
    '..G..G..G..G..G.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  bee: [
    '................',
    '......W....W....',
    '.....WW....WW...',
    '......W....W....',
    '.....GGGGGG.....',
    '....GGMMMMGG....',
    '...GGGGGGGGGG...',
    '...GGMMMMMMGG...',
    '...GGGGGGGGGG...',
    '...GGMMMMMMGG...',
    '....GGGGGGGG....',
    '.....GG..GG.....',
    '................',
    '................',
    '................',
    '................',
  ],
  bat: [
    '................',
    '..MM........MM..',
    '..MMM......MMM..',
    '..GGGG....GGGG..',
    '..GGGGG..GGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '....GWWWWWWG....',
    '....GWKWWKWG....',
    '....GWWWWWWG....',
    '.....GGGGGG.....',
    '.....GG..GG.....',
    '................',
    '................',
    '................',
    '................',
  ],
  elephant: [
    '................',
    '..MM........MM..',
    '..GMM......MMG..',
    '..GGGGGGGGGGGG..',
    '..GWWWWWWWWWWG..',
    '..GWKKWWWWKKWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.....GGGGGG.....',
    '......GMMG......',
    '................',
    '................',
    '................',
    '................',
  ],
  rhino: [
    '................',
    '....MM....MM....',
    '...GGGGGGGGGG...',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '...GGGGMMGGGG...',
    '...GGGMMMMGGG...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  hippo: [
    '................',
    '....MM....MM....',
    '...GGGGGGGGGG...',
    '...GWWWWWWWWG...',
    '...GWKKWWKKWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '...GGWWMMMMWG...',
    '...GGGGMMMMGG...',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  lizard: [
    '................',
    '................',
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GWKGG......',
    '.....GGGGGGMM...',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...',
    '....GGGGGGGG....',
    '.....GG....GG...',
    '................',
    '................',
    '................',
  ],
  dragon: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..GGGMMMMMMGGG..',
    '..GGGGGGGGGGGG..',
    '..G..GGGGGG..G..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  plant: [
    '................',
    '.....GG.GG......',
    '....GGGGGGG.....',
    '...GGGGGGGG.....',
    '..GGGGGGGGG.....',
    '...GGGGGGG......',
    '....GGGGG.......',
    '.....GGG........',
    '.....GGG........',
    '......GG........',
    '......GG........',
    '.....GGGG.......',
    '................',
    '................',
    '................',
    '................',
  ],
  // —— 鬼怪补充 ——
  zombie: [
    '................',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '....GWKWWKWG....',
    '....GWWWWWWG....',
    '....GWMMMMWG....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '...GG....GG.....',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '................',
    '................',
    '................',
    '................',
  ],
  statue: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMKMMMMMMKMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '..MMMMMMMMMMMM..',
    '................',
    '................',
    '................',
    '................',
  ],
  // —— 独立 BOSS（21） ——
  boss_yaowang: [
    '................',
    '..MM........MM..',
    '..MMM......MMM..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..GGGMMMMMMGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  boss_yaohou: [
    '................',
    '..MM........MM..',
    '..MMM......MMM..',
    '.LLMMMMMMMMMMLL.',
    '..MMMMMMMMMMMM..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..GGGMMMMMMGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  boss_final_boss: [
    '................',
    '.MM..........MM.',
    '.MMM........MMM.',
    '.MMMMM....MMMMM.',
    '.LMMMMMMMMMMMML.',
    '..MMMMMMMMMMMM..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..GGGMMMMMMGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '..GGGGGGGGGGGG..',
    '................',
    '................',
  ],
  boss_mojiao_zhanglao: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMGGGGGGGGMM..',
    '..MMGWWWWWWGMM..',
    '..MMGWKKWWKGMM..',
    '..MMGWWWWWWGMM..',
    '..MMGGGMMGGGMM..',
    '..MMMMWWWWMMMM..',
    '...MMWWWWWWMM...',
    '..GGWWWWWWWWGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  boss_jian_sheng: [
    '................',
    '.......MM.......',
    '.......MM.......',
    '.....GGGGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..LGGGGGGGGGGL..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
  ],
  boss_heifeng_zhai: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '...MMMMMMMMMM...',
    '...MMWWWWWWMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GMGGGGGGGGMG..',
    '.GGGGGGGGGGGGGG.',
    '..GMMG....GMMG..',
    '................',
    '................',
  ],
  boss_yunmeng_shui: [
    '................',
    '................',
    '.....GGGGGG.....',
    '....GGGGGGGG....',
    '...GGGGGGGGGG...',
    '...GWWKWWKWWG...',
    '...GWWWWWWWWG...',
    '...GGGGGGGGGG...',
    '...GGMMMMMMGG...',
    '..GGGMMMMMMGGG..',
    '..G.GGGGGGGG.G..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  boss_xiyu_da: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '...MMMLMMLMMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  boss_kunlun_xian: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '...GGGGGGGG.....',
    '...GWWWWWWG.....',
    '...GWKKWWKG.....',
    '...GWWWWWWG.....',
    '...GWMMWWWG.....',
    '...GGGGGGGG.....',
    '...GGWWWWWWGG...',
    '..GGWWWWWWWWGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  boss_donghai_long: [
    '................',
    '..MM........MM..',
    '..MMM......MMM..',
    '.LLMMMMMMMMMMLL.',
    '..MMMMMMMMMMMM..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..G.GMMMMMMG.G..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  boss_huangquan_wang: [
    '................',
    '..LL........LL..',
    '.LMML......LMML.',
    '..MMMMMMMMMMMM..',
    '..WWWWWWWWWWWW..',
    '..WWKWWWWWWKWW..',
    '..WWWWWWWWWWWW..',
    '..WWWMMMMMMWWW..',
    '..WWWMWWMWWWWW..',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '................',
    '................',
    '................',
  ],
  boss_tianmen_shou: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMGGGGGGGGMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
  ],
  boss_we_boss1: [
    '................',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMGGGGGGGGMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMWWWWWWWWMM..',
    '..GGGGGGGGGGGG..',
    '..GMGGGGGGGGMG..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  boss_we_boss2: [
    '................',
    '..MM........MM..',
    '..MMM......MMM..',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGWWWWWWGGG..',
    '..GGGMMMMMMGGG..',
    '..GLLGGGGGGLLG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  boss_we_boss3: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '..MMMMMMMMMMMM..',
    '..MMWWWWWWWWMM..',
    '..MMWKWWWWKWMM..',
    '..MMKWWWWWWKMM..',
    '...MMMMMMMMMM...',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '..GMMM....MMMG..',
    '................',
    '................',
    '................',
  ],
  boss_we_boss4: [
    '................',
    '................',
    '.....GGGGGG.....',
    '.....GWWWWG.....',
    '.....GWKKWG.....',
    '.....GWWWWG.....',
    '.....GWMMWG.....',
    '.....GGGGGG.....',
    '....GGWWWWGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
  ],
  boss_we_boss5: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '..GGGGGGGGGGGG..',
    '..GWWWWWWWWWWG..',
    '..GWKKWWWWKKWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGWWWWGGGG..',
    '...GGGGMMGGGG...',
    '....GGGMMGGG....',
    '...GGGGGGGGGG...',
    '..GGGGGGGGGGGG..',
    '..G.G.G.G.G.G...',
    '................',
    '................',
    '................',
  ],
  boss_we_boss6: [
    '................',
    '....MMMMMMMM....',
    '...MMMMMMMMMM...',
    '...GGGGGGGG.....',
    '...GWWWWWWG.....',
    '...GWKKWWKG.....',
    '...GWWWWWWG.....',
    '...GWMMWWWG.....',
    '...GGGGGGGG.....',
    '...GLLLLLLG.....',
    '..GGGGGGGGGG....',
    '..GGGGGGGGGG....',
    '.GGGGGGGGGGGG...',
    '................',
    '................',
    '................',
  ],
  boss_we_boss7: [
    '................',
    '...MM......MM...',
    '...MMM....MMM...',
    '..GGGGGGGGGGGG..',
    '..GGGGGGGGGGGG..',
    '..GWWKWWWWKWWG..',
    '..GWWWWWWWWWWG..',
    '..GGGGMMMMGGGG..',
    '..GGGMMMMMMGGG..',
    '..GMMGGGGGGMMG..',
    '..GGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGG.',
    '................',
    '................',
    '................',
    '................',
  ],
  boss_we_boss8: [
    '................',
    '................',
    '.....WWWWWW.....',
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWWWWWWWWW...',
    '...WWWWMMWWWW...',
    '...WWWWWWWWWW...',
    '..WWWWWWWWWWWW..',
    '..WWWWWWWWWWWW..',
    '...WWWWWWWWWW...',
    '....WWWWWWWW....',
    '.....WWWWWW.....',
    '................',
  ],
};

// 生成像素头像 SVG（横向同色合并成单条 rect，输出紧凑；A 色可由 accent 覆盖）
function pixelSprite(key, size, accent) {
  const rows = PIXEL_SPRITES[key];
  if (!rows) return '';
  const s = size || 40;
  let out = '';
  let W = 0;
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y] || '';
    if (row.length > W) W = row.length;
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let col = PIX_PALETTE[c];
      if (c === 'A') col = accent || col;
      if (!col) { x++; continue; }
      let w = 1;
      while (x + w < row.length && row[x + w] === c) w++;
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="' + col + '"/>';
      x += w;
    }
  }
  return '<svg class="pixel-sprite" viewBox="0 0 ' + W + ' ' + rows.length + '" width="' + s + '" height="' + s + '" shape-rendering="crispEdges" aria-hidden="true">' + out + '</svg>';
}

// 红颜肖像：按 id 取独立头像，未绘制者回退通用底图；A 色用角色专属色
function loverPortrait(l, size) {
  const key = 'lover_' + l.id;
  return pixelSprite(PIXEL_SPRITES[key] ? key : 'lover_generic', size, l.color);
}

// ---------- UI 图标（金墨像素 glyph，替换按钮/HUD/弹窗里的 emoji） ----------
const UI_ICO = {
  sword: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="1" width="2" height="9" fill="#d8b26a"/><rect x="3" y="10" width="10" height="2" fill="#c9a05a"/><rect x="7" y="12" width="2" height="3" fill="#8a6a3a"/></svg>',
  map: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="4" width="12" height="8" fill="#8a6a3a"/><rect x="2" y="4" width="12" height="2" fill="#c9a05a"/><rect x="5" y="8" width="6" height="1" fill="#c9a05a"/><rect x="8" y="6" width="2" height="2" fill="#d8b26a"/></svg>',
  scroll: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="2" width="8" height="12" fill="#c9a05a"/><rect x="4" y="2" width="8" height="2" fill="#8a6a3a"/><rect x="4" y="12" width="8" height="2" fill="#8a6a3a"/><rect x="6" y="7" width="4" height="1" fill="#8a6a3a"/></svg>',
  star: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="2" width="2" height="12" fill="#d8b26a"/><rect x="2" y="7" width="12" height="2" fill="#d8b26a"/><rect x="7" y="7" width="2" height="2" fill="#c9a05a"/></svg>',
  realm: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10" fill="#c9a05a"/><rect x="5" y="5" width="6" height="6" fill="#8a6a3a"/><rect x="7" y="7" width="2" height="2" fill="#d8b26a"/></svg>',
  book: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="6" height="11" fill="#c9a05a"/><rect x="8" y="3" width="6" height="11" fill="#8a6a3a"/><rect x="7" y="3" width="2" height="11" fill="#d8b26a"/></svg>',
  handbook: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="2" width="8" height="12" fill="#c9a05a"/><rect x="3" y="4" width="2" height="2" fill="#8a6a3a"/><rect x="3" y="8" width="2" height="2" fill="#8a6a3a"/><rect x="3" y="12" width="2" height="2" fill="#8a6a3a"/></svg>',
  clue: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill="#c9a05a"/><rect x="5" y="5" width="4" height="4" fill="#8a6a3a"/><rect x="9" y="9" width="2" height="6" fill="#d8b26a"/></svg>',
  trophy: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="6" fill="#d8b26a"/><rect x="3" y="4" width="2" height="3" fill="#c9a05a"/><rect x="11" y="4" width="2" height="3" fill="#c9a05a"/><rect x="5" y="9" width="6" height="2" fill="#c9a05a"/><rect x="6" y="11" width="4" height="2" fill="#8a6a3a"/></svg>',
  gear: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="2" width="2" height="3" fill="#d8b26a"/><rect x="7" y="11" width="2" height="3" fill="#d8b26a"/><rect x="2" y="7" width="3" height="2" fill="#d8b26a"/><rect x="11" y="7" width="3" height="2" fill="#d8b26a"/><rect x="5" y="5" width="6" height="6" fill="#c9a05a"/><rect x="7" y="7" width="2" height="2" fill="#8a6a3a"/></svg>',
  coin: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="3" width="6" height="10" fill="#d8b26a"/><rect x="3" y="5" width="10" height="6" fill="#d8b26a"/><rect x="6" y="6" width="4" height="4" fill="#8a6a3a"/></svg>',
  shield: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="10" height="4" fill="#c9a05a"/><rect x="5" y="6" width="6" height="8" fill="#c9a05a"/><rect x="6" y="13" width="4" height="2" fill="#8a6a3a"/></svg>',
  spd: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="5" width="7" height="2" fill="#d8b26a"/><rect x="4" y="9" width="5" height="2" fill="#c9a05a"/><rect x="6" y="13" width="3" height="2" fill="#8a6a3a"/></svg>',
  gift: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="5" width="10" height="9" fill="#c9a05a"/><rect x="3" y="5" width="10" height="2" fill="#d8b26a"/><rect x="7" y="2" width="2" height="12" fill="#d8b26a"/></svg>',
  heart: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="4" width="3" height="3" fill="#d8b26a"/><rect x="9" y="4" width="3" height="3" fill="#d8b26a"/><rect x="4" y="7" width="8" height="4" fill="#d8b26a"/><rect x="6" y="11" width="4" height="2" fill="#c9a05a"/></svg>',
  moon: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="2" width="8" height="12" fill="#d8b26a"/><rect x="8" y="2" width="6" height="12" fill="#c9a05a"/></svg>',
  sun: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="2" width="2" height="4" fill="#d8b26a"/><rect x="7" y="10" width="2" height="4" fill="#d8b26a"/><rect x="2" y="7" width="4" height="2" fill="#d8b26a"/><rect x="10" y="7" width="4" height="2" fill="#d8b26a"/><rect x="6" y="6" width="4" height="4" fill="#c9a05a"/></svg>',
  cloud: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="4" fill="#c9a05a"/><rect x="5" y="5" width="4" height="3" fill="#d8b26a"/><rect x="8" y="4" width="4" height="3" fill="#d8b26a"/></svg>',
  rain: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="4" width="10" height="4" fill="#c9a05a"/><rect x="5" y="2" width="4" height="3" fill="#d8b26a"/><rect x="5" y="10" width="2" height="4" fill="#8a6a3a"/><rect x="9" y="10" width="2" height="4" fill="#8a6a3a"/></svg>',
  snow: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="2" width="2" height="12" fill="#d8b26a"/><rect x="2" y="7" width="12" height="2" fill="#d8b26a"/><rect x="5" y="5" width="6" height="6" fill="#c9a05a"/></svg>',
  fog: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="5" width="12" height="2" fill="#c9a05a"/><rect x="4" y="9" width="8" height="2" fill="#8a6a3a"/><rect x="2" y="13" width="10" height="2" fill="#c9a05a"/></svg>',
  blood: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="6" y="2" width="4" height="4" fill="#d8b26a"/><rect x="5" y="6" width="6" height="6" fill="#d8b26a"/><rect x="7" y="11" width="2" height="4" fill="#c9a05a"/></svg>',
  night: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="6" height="6" fill="#d8b26a"/><rect x="7" y="3" width="5" height="6" fill="#c9a05a"/><rect x="3" y="10" width="2" height="2" fill="#d8b26a"/><rect x="11" y="9" width="2" height="2" fill="#d8b26a"/></svg>',
  dawn: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="12" width="12" height="2" fill="#c9a05a"/><rect x="6" y="7" width="4" height="4" fill="#d8b26a"/><rect x="3" y="9" width="2" height="2" fill="#d8b26a"/><rect x="11" y="9" width="2" height="2" fill="#d8b26a"/></svg>',
  day: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="7" y="3" width="2" height="2" fill="#d8b26a"/><rect x="5" y="6" width="6" height="2" fill="#d8b26a"/><rect x="3" y="7" width="10" height="3" fill="#c9a05a"/></svg>',
  dusk: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="11" width="12" height="2" fill="#c9a05a"/><rect x="6" y="6" width="4" height="4" fill="#d8b26a"/><rect x="3" y="8" width="2" height="2" fill="#8a6a3a"/><rect x="11" y="8" width="2" height="2" fill="#8a6a3a"/></svg>',
  explore: '<svg class="nav-ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="5" height="4" fill="#c9a05a"/><rect x="5" y="7" width="2" height="4" fill="#c9a05a"/><rect x="7" y="9" width="4" height="2" fill="#c9a05a"/></svg>'
};

// emoji → UI 图标 key（前缀匹配，自动兼容 FE0F 变体）
const UI_ICON = {
  '🗡': 'sword', '⚔': 'sword', '🗺': 'map', '📜': 'scroll', '🌟': 'star', '⭐': 'star',
  '🌀': 'realm', '📖': 'book', '📓': 'handbook', '🔍': 'clue', '🏆': 'trophy', '⚙': 'gear',
  '💰': 'coin', '🛡': 'shield', '💨': 'spd', '🎁': 'gift', '🌙': 'moon', '❤': 'heart',
  '☀': 'sun', '☁': 'cloud', '🌧': 'rain', '❄': 'snow', '🌫': 'fog', '🩸': 'blood',
  '🌌': 'night', '🌅': 'dawn', '🌤': 'day', '🌇': 'dusk', '🌆': 'dusk', '🌍': 'explore',
  '✨': 'star', '🌸': 'heart'
};

function uiIcon(em) {
  if (!em) return '';
  const key = UI_ICON[em] || UI_ICON[String(em).replace(/\uFE0F/g, '')];
  return UI_ICO[key] || em;
}
// 拆分标签开头 emoji：返回 {icon, text}（icon 为空则无匹配）
function pixLabel(label) {
  if (typeof label !== 'string') return { icon: '', text: label };
  for (const em in UI_ICON) {
    if (label.indexOf(em) === 0) {
      let len = em.length;
      if (label.charCodeAt(len) === 0xFE0F) len++;
      return { icon: uiIcon(em), text: label.slice(len).replace(/^\s+/, '') };
    }
  }
  return { icon: '', text: label };
}

// 敌人 → 像素头像 key（覆盖全部普通/精英敌人；BOSS 用独立 key，未画完前暂保留 emoji）
const ENEMY_SPRITE = {
  // —— 人物 ——
  // 平民 / 商贩 / 杂役
  erdog: 'human', zuihan: 'human', pianzi: 'human', maijiaoyao: 'human', tangshou: 'human',
  xiaohunhun: 'human', caiyaoren: 'human', kuanggong: 'human', baohu: 'human', xiangshen: 'human',
  maiyi: 'human', tuixiazi: 'human', liehu: 'human', yuzhe: 'human', qiaofu: 'human', kugu: 'human',
  sha_ke: 'human', chake: 'human', yanyan: 'human', yishi: 'human', nongmin: 'human',
  ti_shi: 'human', yao_shi: 'human', meng_po: 'human',
  // 剑客 / 侠客
  sanliu: 'sword', liulangjian: 'sword', jianke: 'sword', jian_si: 'sword', qiangxian: 'sword',
  emei_di: 'sword', huashan_di: 'sword', qingcheng_di: 'sword', diancang_di: 'sword', hengshan_di: 'sword',
  jiang_hu_ke: 'sword', tian_xia_di_yi: 'sword', jiang_hu_bang: 'sword', dong_ying_ren: 'sword', xie_jian: 'sword',
  // 刀客
  daoke: 'blade', dao_ke_2: 'blade',
  // 僧尼
  shaolin_di: 'monk', nishi: 'monk', heshang: 'monk', huafei: 'monk', emei_shitai: 'monk', shaolin_seng: 'monk', xi_yu_sheng: 'monk',
  // 道 / 术 / 巫 / 邪修
  daoshi: 'taoist', xiexiu: 'taoist', gushi: 'taoist', wudang_zhenren: 'taoist', du_shi: 'taoist',
  miao_jiang_wu: 'taoist', yao_dao: 'taoist', tu_shen: 'taoist', wudang_di: 'taoist', kunlun_di: 'taoist',
  // 匪 / 贼 / 杀手 / 暗器
  toujizei: 'bandit', shanzei: 'bandit', shanzeitou: 'bandit', caihuazei: 'bandit', shashou: 'bandit',
  lvlin: 'bandit', xiaotou: 'bandit', feizei: 'bandit', shuifei: 'bandit', haidao: 'bandit',
  madao: 'bandit', tufei: 'bandit', mojiao_hufa: 'bandit', tangmen_di: 'bandit', tangmen_zhu: 'bandit',
  an_qi_shi: 'bandit', xuemo_itu: 'bandit', tanzi: 'bandit',
  // 丐帮
  qigai: 'beggar', gaibang_zhang: 'beggar',
  // 官兵 / 军士
  gong_nu: 'soldier', qi_bing: 'soldier', dun_bing: 'soldier', mogu_shishi: 'soldier',
  // 拳脚
  qian_shou: 'fist', tui_shou: 'fist', kongtong_di: 'fist',
  // —— 禽兽 ——
  chicken: 'fowl', goose: 'fowl', yeya: 'fowl', yeji: 'fowl',
  yedog: 'dog', lang: 'wolf', yaolang: 'wolf',
  sheshe: 'snake', niqiu: 'snake', shuizhe: 'snake', wangshe: 'snake', sheyao: 'snake',
  yezhu: 'boar', tiebeixiong: 'bear', laohu: 'tiger', baozi: 'leopard', shizi_jing: 'lion', shi_shi: 'lion',
  niu: 'ox', niu_tou: 'ox', ma_mian: 'horse', yuanhou: 'monkey', xueyuan: 'monkey',
  huyao: 'fox', hu_shi: 'fox', hu_xian: 'fox', laoshu: 'rat', yemaomiao: 'cat', mao_shen: 'cat',
  xiongying: 'bird', sha_diao: 'bird', heyu: 'fish', qingwa: 'frog', pangxie: 'crab',
  xiezi: 'scorpion', ju_xie: 'scorpion', zhi_zhu: 'spider', wugong: 'centipede', feng: 'bee', bianfu: 'bat',
  xiang: 'elephant', xi_niu: 'rhino', hema: 'hippo', huo_yu: 'lizard', shui_shen: 'dragon', luzhi: 'plant',
  // —— 鬼怪 ——
  shuigui: 'ghost', gui_yi: 'ghost', bai_wuchang: 'ghost', hei_wuchang: 'ghost', gui_cha: 'ghost', yao_mei: 'ghost',
  li_gui: 'demon', shan_gui: 'demon', pan_guan: 'demon', yao_seng: 'demon', gui_jiang: 'demon',
  jiangshi: 'zombie', tong_xiang: 'statue',
  // —— 重要角色（独立） ——
  rival: 'rival', shanzei_wang: 'boss_shanzei',
  // BOSS（独立）
  yaowang: 'boss_yaowang', mojiao_zhanglao: 'boss_mojiao_zhanglao', jian_sheng: 'boss_jian_sheng',
  yaohou: 'boss_yaohou', final_boss: 'boss_final_boss', heifeng_zhai: 'boss_heifeng_zhai',
  yunmeng_shui: 'boss_yunmeng_shui', xiyu_da: 'boss_xiyu_da', kunlun_xian: 'boss_kunlun_xian',
  donghai_long: 'boss_donghai_long', huangquan_wang: 'boss_huangquan_wang', tianmen_shou: 'boss_tianmen_shou',
  we_boss1: 'boss_we_boss1', we_boss2: 'boss_we_boss2', we_boss3: 'boss_we_boss3', we_boss4: 'boss_we_boss4',
  we_boss5: 'boss_we_boss5', we_boss6: 'boss_we_boss6', we_boss7: 'boss_we_boss7', we_boss8: 'boss_we_boss8',
};

// ---------- 地图（区域 + 地点） ----------
// 每个区域：名称/推荐等级/地点/敌人池/boss/解锁条件
const REGIONS = [
  { id: 'cun', name: '青石村', level: 1, unlock: true,
    desc: '山坳小村，鸡犬相闻，民风淳朴。',
    locs: [
      { id: 'cunkou', name: '村口', type: 'explore', desc: '村口老槐，王婶正张望寻鸡。' },
      { id: 'yaopu', name: '回春堂', type: 'shop', desc: '张大夫坐堂，一只花猫伏案打盹。' },
      { id: 'keting', name: '悦来客栈', type: 'rest', desc: '客栈雅间，可歇脚安眠。' },
      { id: 'jingshi', name: '村口石碑', type: 'landmark', desc: '石碑铭"青石村"三字，字迹古朴。' }
    ],
    enemies: ['chicken', 'erdog', 'yedog', 'zuihan', 'toujizei'],
    boss: null
  },
  { id: 'shan', name: '青石山', level: 5, unlock: true,
    desc: '乱石荒山，山贼盘踞，野兽夜嚎。',
    locs: [
      { id: 'shanlu', name: '山道', type: 'explore', desc: '荒草没径，偶见兽骨。' },
      { id: 'zhai', name: '山贼寨', type: 'explore', desc: '山贼老巢，寨门高筑，刀枪林立。' },
      { id: 'shangu', name: '山谷', type: 'explore', desc: '雾气缭绕，时有野兽低吼。' },
      { id: 'didian', name: '密林深处', type: 'landmark', desc: '密林深处，传藏前人宝藏。' }
    ],
    enemies: ['shanzei', 'sheshe', 'yezhu', 'lang', 'shanzeitou'],
    boss: 'shanzei_wang'
  },
  { id: 'zhen', name: '临江镇', level: 14, unlock: true,
    desc: '水陆要冲，三教九流，鱼龙混杂。',
    locs: [
      { id: 'matou', name: '码头', type: 'explore', desc: '船来船往，人声鼎沸。' },
      { id: 'shiji', name: '集市', type: 'shop', desc: '市集喧嚷，货杂真假难辨。' },
      { id: 'jiuguan', name: '醉仙楼', type: 'rest', desc: '酒香四溢，堂前有人正说书。' },
      { id: 'dufang', name: '赌坊', type: 'special', desc: '赌坊之内，呼卢喝雉，昼夜不绝。' }
    ],
    enemies: ['pianzi', 'maijiaoyao', 'sanliu', 'tangshou', 'caihuazei', 'shashou', 'feizei'],
    boss: null
  },
  { id: 'jianghu', name: '江湖官道', level: 35, unlock: true,
    desc: '南来北往皆江湖客，一言不合便拔刀。',
    locs: [
      { id: 'guandao', name: '官道', type: 'explore', desc: '尘土飞扬，车马如龙。' },
      { id: 'yizhan', name: '驿站', type: 'rest', desc: '驿站茶亭，可换马歇脚。' },
      { id: 'chaoting', name: '茶棚', type: 'shop', desc: '两文钱一碗凉茶。' },
      { id: 'shizi', name: '十字坡', type: 'landmark', desc: '十字坡前，传有人肉包子，真假难辨。' }
    ],
    enemies: ['xuemo_itu', 'xiexiu', 'yaolang', 'tiebeixiong'],
    boss: null
  },
  { id: 'shaolinsi', name: '少林寺', level: 28, unlock: true,
    desc: '千年古刹，晨钟暮鼓，扫地僧深不可测。',
    locs: [
      { id: 'shanmen', name: '山门', type: 'explore', desc: '两尊石狮怒目而视。' },
      { id: 'daxiong', name: '大雄宝殿', type: 'landmark', desc: '宝殿庄严，香火鼎盛。' },
      { id: 'yizhang', name: '藏经阁', type: 'special', desc: '藏经阁前，扫地老僧正自打盹。' },
      { id: 'wutai', name: '演武场', type: 'explore', desc: '演武场上，小沙弥正练拳。' }
    ],
    enemies: ['shaolin_di'],
    boss: null
  },
  { id: 'wudangshan', name: '武当山', level: 32, unlock: true,
    desc: '云雾缭绕，仙气缥缈，宛如仙境。',
    locs: [
      { id: 'shanlu2', name: '山道', type: 'explore', desc: '石阶千级，直上云霄。' },
      { id: 'jinding', name: '金顶', type: 'landmark', desc: '日出云海，美不胜收。' },
      { id: 'zhenwu', name: '真武殿', type: 'special', desc: '真武殿中，供奉真武大帝。' },
      { id: 'qingyun', name: '青云观', type: 'rest', desc: '观中清幽，是清修之所。' }
    ],
    enemies: ['wudang_di'],
    boss: null
  },
  { id: 'tangjiawu', name: '唐家堡', level: 36, unlock: true,
    desc: '机关密布，暗器藏于砖瓦之间。',
    locs: [
      { id: 'zhaiqian', name: '堡前', type: 'explore', desc: '机关暗藏，步步惊心。' },
      { id: 'anshi', name: '暗室', type: 'special', desc: '工坊内暗器罗列，寒光点点。' },
      { id: 'xunlian', name: '演武场', type: 'explore', desc: '演武场中，飞刀如雨。' },
      { id: 'zongtang', name: '宗堂', type: 'landmark', desc: '宗堂内供奉历代门主。' }
    ],
    enemies: ['tangmen_di'],
    boss: null
  },
  { id: 'miaoling', name: '苗疆十万大山', level: 42, unlock: true,
    desc: '蛊虫遍地，瘴气弥漫，外人十去九不回。',
    locs: [
      { id: 'lindao', name: '林道', type: 'explore', desc: '藤蔓缠绕，虫鸣阵阵。' },
      { id: 'zhaizi', name: '苗寨', type: 'special', desc: '苗寨之中，蛊师巫医云集。' },
      { id: 'zhangqi', name: '瘴气谷', type: 'explore', desc: '瘴气谷中，毒雾遮天。' },
      { id: 'guci', name: '蛊池', type: 'landmark', desc: '蛊池之内，蛊虫翻滚。' }
    ],
    enemies: ['gushi', 'sheyao'],
    boss: null
  },
  { id: 'qingqiu', name: '青丘', level: 50, unlock: true,
    desc: '狐妖聚居之地，月下魅影绰绰。',
    locs: [
      { id: 'hushan', name: '狐山', type: 'explore', desc: '山间时有魅影。' },
      { id: 'dongfu', name: '狐穴', type: 'special', desc: '狐穴幽深，是狐妖老巢。' },
      { id: 'huayuan', name: '花林', type: 'explore', desc: '四季花开不败。' },
      { id: 'mingyue', name: '明月台', type: 'landmark', desc: '明月台上，群狐拜月。' }
    ],
    enemies: ['huyao'],
    boss: null
  },
  { id: 'mojiao_zongtan', name: '魔教总坛', level: 58, unlock: true,
    desc: '血旗招展，白骨铺路，正派禁地。',
    locs: [
      { id: 'shandao', name: '血路', type: 'explore', desc: '路旁白骨累累。' },
      { id: 'zongtan', name: '总坛大殿', type: 'special', desc: '总坛大殿，魔教议事之所。' },
      { id: 'dixia', name: '地牢', type: 'explore', desc: '地牢内关押着各派俘虏。' },
      { id: 'xuechi', name: '血池', type: 'landmark', desc: '血水翻涌，腥气扑鼻。' }
    ],
    enemies: ['mojiao_hufa'],
    boss: 'mojiao_zhanglao'
  },
  { id: 'huashan', name: '华山', level: 66, unlock: true,
    desc: '五岳最险，剑客云集，论剑争锋。',
    locs: [
      { id: 'qiandao', name: '千尺幢', type: 'explore', desc: '千尺幢一线天险，仅容一人。' },
      { id: 'lunjiantai', name: '论剑台', type: 'special', desc: '论剑台上，天下剑客以剑会友。' },
      { id: 'canglong', name: '苍龙岭', type: 'explore', desc: '苍龙岭如龙脊，陡峭凌空。' },
      { id: 'ding', name: '华山之巅', type: 'landmark', desc: '云海翻腾，剑意冲天。' }
    ],
    enemies: ['jianke', 'daoke', 'qiangxian'],
    boss: 'jian_sheng'
  },
  { id: 'yaoyu', name: '妖族禁地', level: 76, unlock: true,
    desc: '妖气冲天，万妖聚集，凡人望而却步。',
    locs: [
      { id: 'rukou', name: '禁地入口', type: 'explore', desc: '禁地入口，妖气森森。' },
      { id: 'gulin', name: '枯骨林', type: 'explore', desc: '枯骨林中，白骨遍地。' },
      { id: 'yaodian', name: '妖殿', type: 'special', desc: '妖殿巍峨，是妖皇行宫。' },
      { id: 'yue', name: '妖月台', type: 'landmark', desc: '妖月台上，妖皇观月。' }
    ],
    enemies: ['yaowang'],
    boss: 'yaohou'
  },
  { id: 'tianji', name: '天机阁', level: 88, unlock: true,
    desc: '藏书如海，机关重重，能窥天机。',
    locs: [
      { id: 'menqian', name: '阁前', type: 'explore', desc: '阁前铜门紧闭，庄严森然。' },
      { id: 'cangshu', name: '藏书楼', type: 'special', desc: '藏书楼中，秘籍浩如烟海。' },
      { id: 'guan', name: '观星台', type: 'landmark', desc: '观星台上，可观天机。' },
      { id: 'mishi', name: '密室', type: 'explore', desc: '密室传闻藏有绝世功法。' }
    ],
    enemies: ['jianke', 'qiangxian', 'daoke'],
    boss: null
  },
  { id: 'mocheng', name: '魔域深渊', level: 100, unlock: true,
    desc: '魔尊盘踞之地，黑气翻涌，大劫将至。',
    locs: [
      { id: 'shenyuan', name: '深渊', type: 'explore', desc: '深渊之下，深不见底。' },
      { id: 'mogong', name: '魔宫', type: 'special', desc: '魔宫巍然，是魔尊宫殿。' },
      { id: 'jieti', name: '劫台', type: 'landmark', desc: '劫台之上，万世之劫将至。' }
    ],
    enemies: ['yaowang', 'mojiao_hufa'],
    boss: 'final_boss'
  },
  { id: 'yunmeng', name: '云梦泽', level: 8, unlock: true,
    desc: '烟波浩渺，雾锁千泽，精怪出没。',
    locs: [
      { id: 'zewai', name: '泽畔', type: 'explore', desc: '芦苇荡一望无际。' },
      { id: 'luchuan', name: '芦船坞', type: 'rest', desc: '芦船坞中，渔家小屋可歇脚。' },
      { id: 'shuizhai', name: '水寨', type: 'special', desc: '水寨之中，水匪盘踞。' },
      { id: 'jiaotan', name: '老蛟潭', type: 'landmark', desc: '潭深不见底，传闻有蛟。' }
    ],
    enemies: ['goose', 'niu', 'laoshu', 'feng', 'yemaomiao', 'yeji', 'yeya', 'pangxie', 'niqiu', 'shuizhe', 'heyu', 'qingwa', 'wugong', 'luzhi', 'shuigui', 'hema'],
    boss: 'yunmeng_shui'
  },
  { id: 'heifeng', name: '黑风寨', level: 34, unlock: true,
    desc: '聚啸山林，劫商道、抢官银。',
    locs: [
      { id: 'zhaimen', name: '寨门', type: 'explore', desc: '寨门之下，两个喽啰正打盹。' },
      { id: 'juyiting', name: '聚义厅', type: 'special', desc: '寨主议事之所，供着把破交椅。' },
      { id: 'laofang', name: '牢房', type: 'explore', desc: '牢房之中，关着几个行客。' },
      { id: 'fengkou', name: '黑风口', type: 'landmark', desc: '黑风口风急，几欲吹人下山。' }
    ],
    enemies: ['tufei', 'jiang_hu_ke', 'sanliu', 'xiaotou', 'shashou', 'lvlin', 'feizei', 'madao'],
    boss: 'heifeng_zhai'
  },
  { id: 'emei', name: '峨眉山', level: 26, unlock: true,
    desc: '云海佛光，剑派清修，门下多为女侠。',
    locs: [
      { id: 'shimen', name: '山门', type: 'explore', desc: '青石台阶直上云霄。' },
      { id: 'jinding2', name: '金顶', type: 'landmark', desc: '佛光普照，剑意隐现。' },
      { id: 'qingyin', name: '清音阁', type: 'special', desc: '清音阁中，剑法代代相传。' },
      { id: 'shiyuan', name: '师太庵', type: 'rest', desc: '师太庵中，可借宿一宵。' }
    ],
    enemies: ['emei_di', 'emei_shitai', 'nishi', 'daoshi', 'heshang', 'yishi', 'xiangshen', 'qigai', 'liulangjian', 'baohu', 'huafei', 'nongmin'],
    boss: null
  },
  { id: 'xiyu', name: '西域大漠', level: 59, unlock: true,
    desc: '黄沙漫天，驼铃悠悠，悍匪横行。',
    locs: [
      { id: 'shamo', name: '大漠', type: 'explore', desc: '一望无际的黄沙。' },
      { id: 'luzhou', name: '绿洲', type: 'rest', desc: '沙漠中的明珠。' },
      { id: 'jishi', name: '胡市', type: 'shop', desc: '西域商贩云集。' },
      { id: 'shacheng', name: '沙城遗址', type: 'landmark', desc: '被风沙掩埋的古城。' }
    ],
    enemies: ['sha_diao', 'sha_ke', 'madao', 'shizi_jing', 'xi_niu', 'ju_xie', 'xiezi', 'laohu', 'baozi', 'xiongying', 'yuanhou', 'zhi_zhu', 'shashou', 'lvlin'],
    boss: 'xiyu_da'
  },
  { id: 'kunlun', name: '昆仑墟', level: 62, unlock: true,
    desc: '万山之祖，仙气缥缈，隐世高人居所。',
    locs: [
      { id: 'xushan', name: '墟山道', type: 'explore', desc: '白雪皑皑，寒气逼人。' },
      { id: 'yuxu', name: '玉虚宫', type: 'special', desc: '昆仑一脉的圣地。' },
      { id: 'xuefeng', name: '雪峰之巅', type: 'landmark', desc: '可俯瞰万里山河。' },
      { id: 'dianshi', name: '石室', type: 'rest', desc: '石室之内，可避风雪。' }
    ],
    enemies: ['xueyuan', 'kunlun_di', 'jian_si', 'dao_ke_2', 'qian_shou', 'tui_shou', 'an_qi_shi', 'gong_nu', 'qi_bing', 'dun_bing', 'wangshe', 'huo_yu', 'yao_shi', 'du_shi'],
    boss: 'kunlun_xian'
  },
  { id: 'donghai', name: '东海龙宫', level: 84, unlock: true,
    desc: '碧波万顷，龙宫深处，水族称王。',
    locs: [
      { id: 'haian', name: '海岸', type: 'explore', desc: '惊涛拍岸。' },
      { id: 'haizhen', name: '海市', type: 'shop', desc: '海上商贾往来。' },
      { id: 'longgong', name: '龙宫大殿', type: 'special', desc: '珠光宝气，暗藏杀机。' },
      { id: 'shuijing', name: '水晶宫', type: 'landmark', desc: '水晶宫中，传藏龙王宝藏。' }
    ],
    enemies: ['heyu', 'pangxie', 'shui_shen', 'haidao', 'mao_shen', 'xiezi', 'hu_xian', 'yao_mei', 'bianfu', 'xiang'],
    boss: 'donghai_long'
  },
  { id: 'huangquan', name: '黄泉鬼域', level: 92, unlock: true,
    desc: '阴风怒号，鬼哭不绝，生人勿近。',
    locs: [
      { id: 'guidao', name: '黄泉路', type: 'explore', desc: '黄泉路旁，彼岸花开得妖艳。' },
      { id: 'wangxiang', name: '望乡台', type: 'landmark', desc: '回望人间，再无归路。' },
      { id: 'naile', name: '奈何桥', type: 'special', desc: '奈何桥下，忘川水滚滚。' },
      { id: 'guiying', name: '鬼营', type: 'rest', desc: '鬼营之中，阴兵歇脚。' }
    ],
    enemies: ['gui_yi', 'li_gui', 'jiangshi', 'hu_shi', 'shan_gui', 'gui_cha', 'pan_guan', 'niu_tou', 'ma_mian', 'bai_wuchang', 'hei_wuchang', 'meng_po', 'tu_shen'],
    boss: 'huangquan_wang'
  },
  { id: 'tianmen', name: '天门', level: 108, unlock: true,
    desc: '登天之门，群雄毕至，破门者或窥真相。',
    locs: [
      { id: 'yunti', name: '云梯', type: 'explore', desc: '直达天际的阶梯。' },
      { id: 'tianjie', name: '天街', type: 'shop', desc: '仙家集市，真假难辨。' },
      { id: 'tiangong', name: '天宫', type: 'special', desc: '天门之内，别有洞天。' },
      { id: 'zhutian', name: '诸天之门', type: 'landmark', desc: '一道青铜巨门，似有真相隐藏其后。' }
    ],
    enemies: ['tian_xia_di_yi', 'jiang_hu_bang', 'gui_jiang', 'yao_dao', 'xie_jian', 'yao_seng', 'shi_shi', 'tong_xiang', 'ti_shi', 'shaolin_seng', 'wudang_zhenren', 'tangmen_zhu', 'miao_jiang_wu', 'xi_yu_sheng', 'dong_ying_ren', 'mogu_shishi', 'huashan_di', 'qingcheng_di', 'kongtong_di', 'diancang_di', 'hengshan_di', 'gaibang_zhang'],
    boss: 'tianmen_shou'
  },
  { id: 'taohuawu', name: '桃花坞', level: 3, unlock: true,
    desc: '十里桃花，落英缤纷，暗藏江湖。',
    locs: [
      { id: 'hualin', name: '桃花林', type: 'explore', desc: '花瓣纷飞，香远益清。' },
      { id: 'chating', name: '花间茶亭', type: 'rest', desc: '花间茶亭，可歇脚品茗。' },
      { id: 'jiufang', name: '酒坊', type: 'shop', desc: '桃花酿远近闻名。' },
      { id: 'shanghua', name: '赏花台', type: 'landmark', desc: '登台远眺，花海如云。' }
    ],
    enemies: ['goose', 'yemaomiao', 'feng', 'yeji', 'xiaohunhun'],
    boss: null
  },
  { id: 'luansanggang', name: '乱葬岗', level: 10, unlock: true,
    desc: '荒坟累累，磷火幽幽，夜半鬼哭。',
    locs: [
      { id: 'huangfen', name: '荒坟', type: 'explore', desc: '坟头野草疯长。' },
      { id: 'poguan', name: '破棺地', type: 'special', desc: '破棺横陈，腐气扑鼻。' },
      { id: 'tugang', name: '土岗', type: 'explore', desc: '黄土岗上，鸦声阵阵。' },
      { id: 'shibei', name: '残碑', type: 'landmark', desc: '半截石碑，字迹难辨。' }
    ],
    enemies: ['gui_yi', 'jiangshi', 'hu_shi', 'shan_gui', 'li_gui', 'pan_guan'],
    boss: null
  },
  { id: 'zhuhai', name: '竹海', level: 14, unlock: true,
    desc: '万竿翠竹，遮天蔽日，风过如涛。',
    locs: [
      { id: 'zhulin', name: '竹林', type: 'explore', desc: '竹影摇曳，沙沙作响。' },
      { id: 'zhuting', name: '竹亭', type: 'rest', desc: '林中一座竹亭，清幽宜人。' },
      { id: 'sunkuang', name: '笋矿', type: 'special', desc: '采笋人的小营。' },
      { id: 'zhuhai_ding', name: '竹海之巅', type: 'landmark', desc: '登高望竹，绿浪翻涌。' }
    ],
    enemies: ['yuanhou', 'zhi_zhu', 'wugong', 'luzhi', 'qingwa', 'laohu', 'baozi'],
    boss: null
  },
  { id: 'yizhuang', name: '义庄', level: 18, unlock: true,
    desc: '停棺之所，阴气森森，生人勿近。',
    locs: [
      { id: 'menting', name: '门厅', type: 'explore', desc: '门厅之中，一口薄棺停放。' },
      { id: 'lingtang', name: '灵堂', type: 'special', desc: '白幡招展，香烛明灭。' },
      { id: 'houyuan', name: '后院', type: 'explore', desc: '杂草丛生，荒凉破败。' },
      { id: 'guding', name: '古井', type: 'landmark', desc: '井水幽深，望之生寒。' }
    ],
    enemies: ['jiangshi', 'gui_yi', 'bai_wuchang', 'hei_wuchang', 'meng_po', 'li_gui', 'pan_guan'],
    boss: null
  },
  { id: 'pomiao', name: '破庙', level: 22, unlock: true,
    desc: '断壁残垣，香火断绝，乞丐亡命者栖身。',
    locs: [
      { id: 'dianqian', name: '殿前', type: 'explore', desc: '石阶碎裂，野草过膝。' },
      { id: 'zhengdian', name: '正殿', type: 'special', desc: '佛像蒙尘，蛛网密布。' },
      { id: 'xiangfang', name: '厢房', type: 'rest', desc: '厢房虽破，可避风雨。' },
      { id: 'zhonglou', name: '钟楼', type: 'landmark', desc: '铜钟落地，锈迹斑斑。' }
    ],
    enemies: ['qigai', 'daoshi', 'xiexiu', 'gui_yi'],
    boss: null
  },
  { id: 'guandao2', name: '驿站古道', level: 36, unlock: true,
    desc: '咽喉要道，南来北往，车马如流。',
    locs: [
      { id: 'gudao', name: '古道', type: 'explore', desc: '尘土飞扬，蹄声不断。' },
      { id: 'yizhan2', name: '驿站', type: 'rest', desc: '驿站之中，可换马歇脚。' },
      { id: 'jianguan', name: '剑馆', type: 'shop', desc: '剑馆之中，售卖刀剑兵刃。' },
      { id: 'jieshi', name: '界石', type: 'landmark', desc: '刻着地名与里程的界石。' }
    ],
    enemies: ['tangshou', 'baohu', 'madao', 'feizei', 'jiang_hu_ke'],
    boss: null
  },
  { id: 'cangjian', name: '藏剑山庄', level: 34, unlock: true,
    desc: '铸剑闻名，庄内剑意森然。',
    locs: [
      { id: 'zhuangmen', name: '庄门', type: 'explore', desc: '两柄巨剑分列左右。' },
      { id: 'jianlu', name: '剑炉', type: 'special', desc: '炉火熊熊，铁花四溅。' },
      { id: 'jianchi', name: '剑池', type: 'landmark', desc: '池中插满历代名剑。' },
      { id: 'kefang', name: '客房', type: 'rest', desc: '客房之内，供访客歇息。' }
    ],
    enemies: ['jianke', 'sanliu', 'liulangjian', 'jian_si'],
    boss: null
  },
  { id: 'yaowanggu', name: '药王谷', level: 38, unlock: true,
    desc: '药香四溢，医毒同源。',
    locs: [
      { id: 'yaotian', name: '药田', type: 'explore', desc: '灵药成畦，长势喜人。' },
      { id: 'danlu', name: '丹炉房', type: 'special', desc: '丹香氤氲。' },
      { id: 'yaopu2', name: '药铺', type: 'shop', desc: '药铺之中，售卖丹药补品。' },
      { id: 'yaoquan', name: '药泉', type: 'landmark', desc: '泉水清冽，药香隐隐。' }
    ],
    enemies: ['yao_shi', 'du_shi', 'caiyaoren', 'yishi', 'gushi'],
    boss: null
  },
  { id: 'xuedaomen', name: '血刀门', level: 44, unlock: true,
    desc: '以血炼刀，凶名赫赫。',
    locs: [
      { id: 'daochang', name: '刀场', type: 'explore', desc: '刀光如血，杀气腾腾。' },
      { id: 'xuechi2', name: '血池', type: 'special', desc: '血水翻涌，腥气刺鼻。' },
      { id: 'dianmen', name: '血刀大殿', type: 'landmark', desc: '血刀大殿，供着一柄血刀。' },
      { id: 'liaoshi', name: '疗室', type: 'rest', desc: '疗室之中，邪派疗伤之地。' }
    ],
    enemies: ['dao_ke_2', 'mojiao_hufa', 'xuemo_itu', 'shashou'],
    boss: null
  },
  { id: 'xueshanpai', name: '雪山派', level: 52, unlock: true,
    desc: '雪山之巅，剑法清冷如霜。',
    locs: [
      { id: 'xuedao', name: '雪道', type: 'explore', desc: '冰天雪地，寒风如刀。' },
      { id: 'binggong', name: '冰宫', type: 'special', desc: '冰雕玉砌的殿宇。' },
      { id: 'xuefeng2', name: '雪峰', type: 'landmark', desc: '万仞雪峰，直插云霄。' },
      { id: 'nuanlu', name: '暖庐', type: 'rest', desc: '暖庐之中，可避寒取暖。' }
    ],
    enemies: ['xueyuan', 'baozi', 'shashou', 'qiangxian'],
    boss: null
  },
  { id: 'wanshou', name: '万兽山庄', level: 54, unlock: true,
    desc: '驯养猛兽，以兽为兵。',
    locs: [
      { id: 'shouquan', name: '兽圈', type: 'explore', desc: '猛兽低吼，此起彼伏。' },
      { id: 'xunshou', name: '驯兽台', type: 'special', desc: '驯兽师挥鞭呵斥。' },
      { id: 'shoumen', name: '兽王门', type: 'landmark', desc: '门上兽首狰狞。' },
      { id: 'caoliao', name: '草料房', type: 'rest', desc: '草料房中，堆放兽粮草料。' }
    ],
    enemies: ['laohu', 'baozi', 'shizi_jing', 'xi_niu', 'xiang', 'tiebeixiong'],
    boss: null
  },
  { id: 'jianzhong', name: '剑冢', level: 60, unlock: true,
    desc: '历代名剑埋骨之地，剑气冲霄。',
    locs: [
      { id: 'zhongqian', name: '冢前', type: 'explore', desc: '断剑残刃，插满荒丘。' },
      { id: 'jianling', name: '剑灵洞', type: 'special', desc: '剑灵洞中，传有剑灵出没。' },
      { id: 'zhongxin', name: '冢心', type: 'landmark', desc: '万剑朝宗，杀气凛然。' },
      { id: 'shidun', name: '石墩', type: 'rest', desc: '石墩之上，磨剑人歇脚。' }
    ],
    enemies: ['xie_jian', 'jian_si', 'jianke', 'sanliu'],
    boss: null
  },
  { id: 'xingsuhai', name: '星宿海', level: 68, unlock: true,
    desc: '高原湖泊星罗棋布，星宿门下盘踞。',
    locs: [
      { id: 'haibian', name: '海边', type: 'explore', desc: '湖水如镜，倒映星河。' },
      { id: 'xingguan', name: '星观', type: 'special', desc: '星观之中，星宿门议事。' },
      { id: 'yeying', name: '夜营', type: 'rest', desc: '夜营之中，旅人夜宿。' },
      { id: 'xingtan', name: '星坛', type: 'landmark', desc: '观星祭天的高坛。' }
    ],
    enemies: ['xiexiu', 'daoshi', 'kunlun_di', 'yao_dao'],
    boss: null
  },
  { id: 'tianchi', name: '天池', level: 70, unlock: true,
    desc: '高山灵池，碧水如镜，精怪盘踞。',
    locs: [
      { id: 'chibian', name: '池畔', type: 'explore', desc: '池水澄澈，深不见底。' },
      { id: 'shuifu', name: '水府', type: 'special', desc: '水府之下，别有洞天。' },
      { id: 'diaoji', name: '钓矶', type: 'rest', desc: '钓矶之上，可垂钓观景。' },
      { id: 'tianchi_ding', name: '天池之眼', type: 'landmark', desc: '池心漩涡，灵气汇聚。' }
    ],
    enemies: ['shui_shen', 'heyu', 'pangxie', 'mao_shen', 'shuizhe'],
    boss: null
  },
  { id: 'baihuagu', name: '百花谷', level: 72, unlock: true,
    desc: '百花终年不败，香雾缭绕，暗藏花毒。',
    locs: [
      { id: 'huhai', name: '花海', type: 'explore', desc: '万紫千红，香气袭人。' },
      { id: 'huaxin', name: '花心亭', type: 'special', desc: '花心亭中，百花环抱。' },
      { id: 'miyuan', name: '蜜园', type: 'shop', desc: '蜜园之中，采蜜人的小园。' },
      { id: 'huashen', name: '花神庙', type: 'landmark', desc: '花神庙内，供奉花神。' }
    ],
    enemies: ['huyao', 'hu_xian', 'yao_mei', 'bianfu', 'zhi_zhu'],
    boss: null
  },
  { id: 'xiuluochang', name: '修罗场', level: 78, unlock: true,
    desc: '古战场尸山血海，怨气凝而不散。',
    locs: [
      { id: 'zhanchang', name: '战场', type: 'explore', desc: '断戟残旗，白骨遍地。' },
      { id: 'shaqi', name: '杀气渊', type: 'special', desc: '杀气冲天，摄人心魄。' },
      { id: 'guiying2', name: '鬼营', type: 'rest', desc: '鬼营之中，阴兵盘踞。' },
      { id: 'leigu', name: '垒鼓台', type: 'landmark', desc: '残破的战鼓高台。' }
    ],
    enemies: ['gui_jiang', 'shashou', 'li_gui', 'pan_guan'],
    boss: null
  },
  { id: 'jianshengju', name: '剑圣居', level: 80, unlock: true,
    desc: '剑圣隐居之所，竹篱茅舍，剑气如霜。',
    locs: [
      { id: 'jumen', name: '剑居门', type: 'explore', desc: '竹扉半掩，剑意逼人。' },
      { id: 'wujian', name: '悟剑堂', type: 'special', desc: '悟剑堂中，四壁刻满剑痕。' },
      { id: 'xueyuan2', name: '雪园', type: 'landmark', desc: '园中梅花与雪共舞。' },
      { id: 'caolu', name: '草庐', type: 'rest', desc: '草庐简朴，是剑圣居所。' }
    ],
    enemies: ['jianke', 'jian_si', 'daoke', 'qiangxian', 'jiang_hu_bang'],
    boss: null
  },
  { id: 'guixu', name: '归墟', level: 86, unlock: true,
    desc: '海水归流之处，深不可测，水妖横行。',
    locs: [
      { id: 'xuankou', name: '墟口', type: 'explore', desc: '海水奔涌，深不见底。' },
      { id: 'shuigong', name: '水宫', type: 'special', desc: '水宫之中，水妖宫殿。' },
      { id: 'anchao', name: '暗潮滩', type: 'rest', desc: '潮起潮落的浅滩。' },
      { id: 'guiyan', name: '归眼', type: 'landmark', desc: '海中漩涡，吞没万物。' }
    ],
    enemies: ['shui_shen', 'heyu', 'shuigui', 'haidao', 'hu_xian'],
    boss: null
  },
  { id: 'guanxingtai', name: '观星台', level: 90, unlock: true,
    desc: '高台凌云，观星演算，高可摘星。',
    locs: [
      { id: 'taijie', name: '台阶', type: 'explore', desc: '石阶千级，直达台顶。' },
      { id: 'xingpan', name: '星盘', type: 'special', desc: '巨大的星盘缓缓转动。' },
      { id: 'wangyuan', name: '望远楼', type: 'landmark', desc: '望远楼上，可望尽山河。' },
      { id: 'jingshe', name: '静舍', type: 'rest', desc: '静舍之中，演算者歇息。' }
    ],
    enemies: ['ti_shi', 'daoshi', 'kunlun_di', 'wudang_zhenren', 'yao_dao'],
    boss: null
  },
  { id: 'wuxiangsi', name: '无相寺', level: 96, unlock: true,
    desc: '无名古寺，殿中无佛无相，只一泓清水。',
    locs: [
      { id: 'simen', name: '寺门', type: 'explore', desc: '铜门斑驳，似已荒废。' },
      { id: 'wudian', name: '无佛殿', type: 'special', desc: '无佛殿中，空空如也。' },
      { id: 'shuijing2', name: '水镜池', type: 'landmark', desc: '一泓清水，映出天光。' },
      { id: 'chanshi', name: '禅室', type: 'rest', desc: '禅室之内，静坐参禅。' }
    ],
    enemies: ['yao_seng', 'shaolin_seng', 'heshang', 'gui_yi', 'shi_shi'],
    boss: null
  },
  { id: 'posuixukong', name: '破碎虚空', level: 104, unlock: true,
    desc: '天地尽头，虚空破碎，高手决战之地。',
    locs: [
      { id: 'xukong', name: '虚空', type: 'explore', desc: '天穹裂开，罡风呼啸。' },
      { id: 'suipian', name: '碎片之地', type: 'special', desc: '碎片之地，世界碎片悬浮。' },
      { id: 'jietai', name: '劫台', type: 'landmark', desc: '劫台之上，虚空破碎的中心。' },
      { id: 'guangu', name: '观古台', type: 'rest', desc: '观古台上，俯瞰虚空。' }
    ],
    enemies: ['tian_xia_di_yi', 'jiang_hu_bang', 'gui_jiang', 'yao_dao', 'xie_jian', 'tong_xiang'],
    boss: null
  },
  // ============================================================
  //  八大城（hub：城内设施为地点；城郊/荒野见 CITY_LINKS）
  // ============================================================
  { id: 'yaoguang', name: '摇光城', level: 1, unlock: true, hub: true,
    desc: '东南小城，烟雨朦胧，是初入江湖者歇脚的第一站。',
    locs: [
      { id: 'yq_kezhan', name: '悦来客栈', type: 'rest', desc: '门前酒旗半卷，店小二殷勤迎客。' },
      { id: 'yq_shangpu', name: '东市商铺', type: 'shop', desc: '东市货摊鳞次栉比，吆喝声不绝。' },
      { id: 'yq_guanfu', name: '摇光府衙', type: 'guanfu', desc: '衙门口两尊石狮，衙役百无聊赖地打瞌睡。' },
      { id: 'yq_qinglou', name: '云袖楼', type: 'qinglou', desc: '红灯高挂，丝竹声隐隐传出。' }
    ],
    enemies: [], boss: null },
  { id: 'kaiyang', name: '开阳城', level: 14, unlock: true, hub: true,
    desc: '江南大城，水巷纵横，商贾云集。',
    locs: [
      { id: 'ky_kezhan', name: '状元楼', type: 'rest', desc: '名震江南的酒楼，往来皆豪客。' },
      { id: 'ky_jishi', name: '南市', type: 'shop', desc: '南市百物俱全，真假难辨。' },
      { id: 'ky_guanfu', name: '开阳府衙', type: 'guanfu', desc: '府衙森严，门前鸣冤鼓积了灰。' },
      { id: 'ky_qinglou', name: '极乐楼', type: 'qinglou', desc: '销金窟里笙歌不断，暗藏黑市。' }
    ],
    enemies: [], boss: null },
  { id: 'tianquan', name: '天权城', level: 30, unlock: true, hub: true,
    desc: '中原雄城，四通八达，鱼龙混杂。',
    locs: [
      { id: 'tq_kezhan', name: '同福客栈', type: 'rest', desc: '江湖客歇脚的老字号。' },
      { id: 'tq_jishi', name: '西市', type: 'shop', desc: '西市人声鼎沸，货比三家。' },
      { id: 'tq_guanfu', name: '天权府衙', type: 'guanfu', desc: '衙役按刀巡街，眼神凌厉。' },
      { id: 'tq_qinglou', name: '倚翠楼', type: 'qinglou', desc: '楼中歌舞升平，暗流涌动。' }
    ],
    enemies: [], boss: null },
  { id: 'tianjicheng', name: '天玑城', level: 44, unlock: true, hub: true,
    desc: '中原腹地之城，文人墨客与镖师武夫同路。',
    locs: [
      { id: 'tj_kezhan', name: '客来居', type: 'rest', desc: '朴素客栈，胜在干净。' },
      { id: 'tj_shangpu', name: '北街商铺', type: 'shop', desc: '北街商铺林立，掌柜精于算计。' },
      { id: 'tj_guanfu', name: '天玑府衙', type: 'guanfu', desc: '府衙冷清，偶有讼棍出入。' }
    ],
    enemies: [], boss: null },
  { id: 'tianxuan', name: '天璇城', level: 56, unlock: true, hub: true,
    desc: '西陲重镇，黄沙与驼铃，胡商与刀客。',
    locs: [
      { id: 'tx_kezhan', name: '沙驼客栈', type: 'rest', desc: '往来行商歇脚，烤羊香气四溢。' },
      { id: 'tx_jishi', name: '胡市', type: 'shop', desc: '胡商云集，奇货可居。' },
      { id: 'tx_guanfu', name: '天璇府衙', type: 'guanfu', desc: '边关府衙，兵丁剽悍。' },
      { id: 'tx_qinglou', name: '胡姬楼', type: 'qinglou', desc: '异域舞姬，别样风情。' }
    ],
    enemies: [], boss: null },
  { id: 'yuheng', name: '玉衡城', level: 68, unlock: true, hub: true,
    desc: '西南山城，依山而建，湿雾缭绕。',
    locs: [
      { id: 'yh_kezhan', name: '云栈客栈', type: 'rest', desc: '山腰客栈，推窗即是云海。' },
      { id: 'yh_shangpu', name: '山货铺', type: 'shop', desc: '山货药材，琳瑯满目。' },
      { id: 'yh_guanfu', name: '玉衡府衙', type: 'guanfu', desc: '府衙建于高台，俯瞰全城。' }
    ],
    enemies: [], boss: null },
  { id: 'tianshu', name: '天枢城', level: 82, unlock: true, hub: true,
    desc: '北境雄关，风雪常驻，民风剽悍。',
    locs: [
      { id: 'ts_kezhan', name: '朔北客栈', type: 'rest', desc: '炉火熊熊，烈酒驱寒。' },
      { id: 'ts_shangpu', name: '皮货行', type: 'shop', desc: '皮货马具，北地特产。' },
      { id: 'ts_guanfu', name: '天枢府衙', type: 'guanfu', desc: '边镇府衙，军令如山。' },
      { id: 'ts_dufang', name: '大胜赌坊', type: 'dufang', desc: '赌徒昼夜不散，呼卢喝雉。' }
    ],
    enemies: [], boss: null },
  { id: 'ziwei', name: '紫微城', level: 96, unlock: true, hub: true,
    desc: '帝都天都，紫气东来，是天下武林的中枢。',
    locs: [
      { id: 'zw_kezhan', name: '天字第一楼', type: 'rest', desc: '帝都第一客栈，一宿千金。' },
      { id: 'zw_jishi', name: '皇城大市', type: 'shop', desc: '天下奇珍，尽集于此。' },
      { id: 'zw_guanfu', name: '大理寺', type: 'guanfu', desc: '掌刑狱，缉拿要犯。' },
      { id: 'zw_qinglou', name: '教坊司', type: 'qinglou', desc: '官办教坊，雅俗共赏。' },
      { id: 'zw_dufang', name: '金满堂', type: 'dufang', desc: '天下最大的销金窟。' },
      { id: 'zw_bitai', name: '紫微比武台', type: 'bitai', desc: '天下高手争名之处。' }
    ],
    enemies: [], boss: null },
  // ============================================================
  //  城郊村镇（16 新增）与帝都荒野（皇陵/天牢）
  // ============================================================
  { id: 'liuxi', name: '柳溪村', level: 2, unlock: true,
    desc: '柳树成荫的小村，溪水绕村而过。',
    locs: [
      { id: 'lx_cunkou', name: '村口', type: 'explore', desc: '村口柳树下，几个孩子嬉闹。' },
      { id: 'lx_kecan', name: '村头茶棚', type: 'rest', desc: '两文钱一碗粗茶。' }
    ],
    enemies: ['chicken', 'yedog', 'xiaohunhun', 'yemaomiao'], boss: null },
  { id: 'daoxiang', name: '稻香村', level: 15, unlock: true,
    desc: '稻田千顷，蛙鸣阵阵，民风淳朴。',
    locs: [
      { id: 'dx_cunkou', name: '村口', type: 'explore', desc: '村口谷场堆满新收的稻谷。' },
      { id: 'dx_xiaozhen', name: '稻香小镇', type: 'shop', desc: '小镇上杂货铺、米行一应俱全。' }
    ],
    enemies: ['pianzi', 'sanliu', 'caihuazei', 'xiaotou', 'feizei', 'shashou'], boss: null },
  { id: 'luweidu', name: '芦苇渡', level: 16, unlock: true,
    desc: '芦苇荡边的渡口，撑船人往来如织。',
    locs: [
      { id: 'lw_dukou', name: '渡口', type: 'explore', desc: '小船在芦苇间穿梭。' },
      { id: 'lw_yuwu', name: '渔家小屋', type: 'rest', desc: '渔家小屋，可歇脚躲雨。' }
    ],
    enemies: ['shuifei', 'yuzhe', 'heyu', 'qingwa'], boss: null },
  { id: 'qingxi', name: '清溪村', level: 31, unlock: true,
    desc: '溪水清可见底，村中多织户。',
    locs: [
      { id: 'qx_cunkou', name: '村口', type: 'explore', desc: '溪边妇人捣衣声声。' },
      { id: 'qx_kecan', name: '清溪茶亭', type: 'rest', desc: '茶亭临溪，清风徐来。' }
    ],
    enemies: ['jiang_hu_ke', 'xiaotou', 'feizei', 'liulangjian'], boss: null },
  { id: 'sangtian', name: '桑田村', level: 32, unlock: true,
    desc: '桑麻遍野，养蚕织绸的小村。',
    locs: [
      { id: 'st_cunkou', name: '村口', type: 'explore', desc: '桑林间蚕娘忙碌。' },
      { id: 'st_jishi', name: '村集', type: 'shop', desc: '村集上卖些桑麻布匹。' }
    ],
    enemies: ['tufei', 'madao', 'pianzi', 'tangshou'], boss: null },
  { id: 'shiqiao', name: '石桥镇', level: 33, unlock: true,
    desc: '石桥横跨大河，南北商旅必经。',
    locs: [
      { id: 'sq_zhenkou', name: '镇口石桥', type: 'explore', desc: '石桥上车马如流。' },
      { id: 'sq_kezhan', name: '石桥客栈', type: 'rest', desc: '南来北往的客商在此投宿。' }
    ],
    enemies: ['liulangjian', 'sanliu', 'jianke', 'daoke'], boss: null },
  { id: 'xinglin', name: '杏林村', level: 45, unlock: true,
    desc: '杏树成林，村中多行医采药之人。',
    locs: [
      { id: 'xl_cunkou', name: '村口', type: 'explore', desc: '杏花如雪，药香扑鼻。' },
      { id: 'xl_yaopu', name: '杏林药铺', type: 'shop', desc: '药铺里坐堂大夫号脉开方。' }
    ],
    enemies: ['daoshi', 'xiexiu', 'yishi', 'du_shi'], boss: null },
  { id: 'zaomu', name: '枣木村', level: 46, unlock: true,
    desc: '枣树遍野，秋来枣红似火。',
    locs: [
      { id: 'zm_cunkou', name: '村口', type: 'explore', desc: '枣林深处，犬吠隐隐。' },
      { id: 'zm_kecan', name: '枣棚茶摊', type: 'rest', desc: '枣棚下歇脚，尝一口甜枣。' }
    ],
    enemies: ['du_shi', 'yao_shi', 'gushi', 'nongmin'], boss: null },
  { id: 'yueya', name: '月牙村', level: 57, unlock: true,
    desc: '月牙泉边的绿洲小村，胡杨环绕。',
    locs: [
      { id: 'yy_cunkou', name: '村口', type: 'explore', desc: '月牙泉水清冽，驼队饮水歇息。' },
      { id: 'yy_jishi', name: '绿洲小市', type: 'shop', desc: '绿洲小市上胡商交易皮毛香料。' }
    ],
    enemies: ['sha_ke', 'madao', 'shashou', 'lvlin'], boss: null },
  { id: 'tuoling', name: '驼铃镇', level: 58, unlock: true,
    desc: '丝路重镇，驼铃声日夜不绝。',
    locs: [
      { id: 'tl_zhenkou', name: '镇口', type: 'explore', desc: '商队驼铃叮当，尘土飞扬。' },
      { id: 'tl_kezhan', name: '驼铃客栈', type: 'rest', desc: '客栈里胡汉杂处，烤羊飘香。' }
    ],
    enemies: ['sha_ke', 'shashou', 'lvlin', 'qian_shou'], boss: null },
  { id: 'zhuxi', name: '竹溪村', level: 69, unlock: true,
    desc: '竹林环抱，溪水潺潺的山村。',
    locs: [
      { id: 'zx_cunkou', name: '村口', type: 'explore', desc: '竹海深处，雾霭氤氲。' },
      { id: 'zx_kecan', name: '竹寮茶屋', type: 'rest', desc: '竹寮里煮茶，清香沁脾。' }
    ],
    enemies: ['xueyuan', 'baozi', 'laohu', 'yuanhou'], boss: null },
  { id: 'shannan', name: '山南村', level: 70, unlock: true,
    desc: '山南向阳的村落，梯田层层。',
    locs: [
      { id: 'sn_cunkou', name: '村口', type: 'explore', desc: '梯田如镜，农人耕作。' },
      { id: 'sn_jishi', name: '山货集市', type: 'shop', desc: '集市上卖山货药材。' }
    ],
    enemies: ['xueyuan', 'jian_si', 'dao_ke_2', 'qiangxian'], boss: null },
  { id: 'shuofeng', name: '朔风镇', level: 83, unlock: true,
    desc: '北境边镇，风雪中的皮货马市。',
    locs: [
      { id: 'sf_zhenkou', name: '镇口', type: 'explore', desc: '朔风卷地，行人裹紧皮裘。' },
      { id: 'sf_kezhan', name: '朔风客栈', type: 'rest', desc: '客栈炉火正旺，烈酒飘香。' }
    ],
    enemies: ['xueyuan', 'jiang_hu_bang', 'jian_si', 'qiangxian'], boss: null },
  { id: 'baicaopo', name: '白草坡', level: 84, unlock: true,
    desc: '关外白草连天，马贼出没之地。',
    locs: [
      { id: 'bc_po', name: '白草坡', type: 'explore', desc: '风吹草低，远处似有马队。' },
      { id: 'bc_mawu', name: '牧人毡房', type: 'rest', desc: '牧人热情，煮奶待客。' }
    ],
    enemies: ['jiang_hu_bang', 'jian_si', 'daoke', 'qian_shou'], boss: null },
  { id: 'shilipu', name: '京郊·十里铺', level: 97, unlock: true,
    desc: '帝都郊外的驿站村，贩夫走卒歇脚。',
    locs: [
      { id: 'sp_pu', name: '十里铺', type: 'explore', desc: '官道旁店铺林立，车马不绝。' },
      { id: 'sp_yizhan', name: '官驿', type: 'rest', desc: '官驿里差役换马，行客投宿。' }
    ],
    enemies: ['ti_shi', 'jiang_hu_bang', 'tian_xia_di_yi', 'shaolin_seng'], boss: null },
  { id: 'liuying', name: '皇庄·柳营', level: 98, unlock: true,
    desc: '皇家庄园，柳林如墙，庄丁巡哨。',
    locs: [
      { id: 'ly_zhuang', name: '柳营庄', type: 'explore', desc: '庄门紧闭，庄丁持械巡逻。' },
      { id: 'ly_jishi', name: '皇庄集市', type: 'shop', desc: '皇庄集市，供皇亲采买。' }
    ],
    enemies: ['ti_shi', 'shaolin_seng', 'wudang_zhenren', 'dun_bing'], boss: null },
  { id: 'huangling', name: '皇陵', level: 99, unlock: true,
    desc: '前朝帝陵，机关重重，阴气森森。',
    locs: [
      { id: 'hl_shendao', name: '神道', type: 'explore', desc: '石像生列道，苔痕斑驳。' },
      { id: 'hl_digong', name: '地宫入口', type: 'landmark', desc: '地宫石门半掩，内里幽深。' }
    ],
    enemies: ['jiangshi', 'tong_xiang', 'shi_shi', 'pan_guan'], boss: 'shouling_jiangjun' },
  { id: 'tianlao', name: '天牢', level: 100, unlock: true,
    desc: '帝都天牢，关押重犯，守卫森严。',
    locs: [
      { id: 'tl_damen', name: '天牢大门', type: 'explore', desc: '铁门紧闭，狱卒持戟而立。' },
      { id: 'tl_laofang', name: '牢房区', type: 'landmark', desc: '牢房深处，镣铐声隐隐。' }
    ],
    enemies: ['ti_shi', 'shashou', 'sha_ke', 'dun_bing'], boss: 'dianyuguan' }
];

// ---------- 城郊/荒野归属（城 id → 下属地区 id） ----------
const CITY_LINKS = {
  yaoguang: { suburbs: ['cun', 'taohuawu', 'liuxi'], wilds: ['shan', 'yunmeng', 'luansanggang'] },
  kaiyang: { suburbs: ['zhen', 'daoxiang', 'luweidu'], wilds: ['zhuhai', 'yizhuang', 'pomiao'] },
  tianquan: { suburbs: ['qingxi', 'sangtian', 'shiqiao'], wilds: ['heifeng', 'jianghu', 'guandao2'] },
  tianjicheng: { suburbs: ['xinglin', 'zaomu'], wilds: [] },
  tianxuan: { suburbs: ['yueya', 'tuoling'], wilds: ['xiyu'] },
  yuheng: { suburbs: ['zhuxi', 'shannan'], wilds: ['xiuluochang'] },
  tianshu: { suburbs: ['shuofeng', 'baicaopo'], wilds: [] },
  ziwei: { suburbs: ['shilipu', 'liuying'], wilds: ['huangling', 'tianlao'] }
};
// 是否属于某城的城郊/荒野（用于「江湖」列表排除）
const CITY_LINKED = (() => { const s = {}; for (const cid in CITY_LINKS) { for (const rid of CITY_LINKS[cid].suburbs) s[rid] = cid; for (const rid of CITY_LINKS[cid].wilds) s[rid] = cid; } return s; })();

// ---------- 随机事件 ----------
// choice.effect: { gold, exp, hp, mp, item, tech, buff, debuff, affection, sectContribution }
const EVENTS = [
  { id: 'e1', name: '路遇卖艺的', weight: 3,
    desc: '一个壮汉在胸口碎大石，围观者喝彩连连。你却察觉，那"大石"落地时声响轻得异样。',
    choices: [
      { text: '打赏两文钱', effect: { gold: -2 }, result: '壮汉拱手谢赏。你心知这是假把式，可满街的人，都当它是真的。' },
      { text: '上前试试身手', effect: { exp: 15, per: { ming: 3 } }, result: '你上去比划两下，顺手掂了掂"大石"——轻若无物。你忽然想：这江湖里，还有多少这样的"石头"？' },
      { text: '当众揭穿', effect: { per: { ming: 5 }, rep: 2 }, result: '你高声点破，围观者却嘘声一片："莫要搅了热闹！"他们宁愿信那石头是真的。' }
    ] },
  { id: 'e2', name: '捡到一本书', weight: 2,
    desc: '路边躺着一本破书，封皮写着《武林秘籍》四个字。',
    choices: [
      { text: '翻开看看', effect: { exp: 20 }, result: '里面写着："练武先练胆，打不过便走为上。"你掩卷，似有所悟。' },
      { text: '带回去卖钱', effect: { gold: 10 }, result: '谁料这是骗子兜售的假书，你转手又卖予一个冤大头。' },
      { text: '踹进沟里', effect: {}, result: '书掉沟里了，你莫名觉得畅快。' }
    ] },
  { id: 'e3', name: '乞丐讨饭', weight: 3, scenes: ['village', 'town'],
    desc: '一个老乞丐拦住你："少侠，赏口饭吃吧。"',
    choices: [
      { text: '询问他为何流落至此', sub: {
        desc: '老乞丐叹了口气："年轻时也曾是江湖客，后来遭人陷害，落得这般田地。"',
        choices: [
          { text: '给他几两银子', effect: { gold: -5, luck: 2, moral: 5, rep: 3, per: { xia: 5 } }, result: '老乞丐连连作揖，你走后他原地消失，只留下一句"福缘深厚"。' },
          { text: '教他一句口诀', effect: { exp: 10, per: { qing: 3 } }, result: '"三十六计走为上"——老乞丐如获至宝。' },
          { text: '心生怜悯，多给些', effect: { gold: -10, moral: 8, rep: 4, per: { xia: 8, qing: 5 } }, result: '你多给了他几两，老乞丐眼眶一红，朝你深深一揖。' }
        ] } },
      { text: '给他几两银子', effect: { gold: -5, luck: 2, moral: 5, rep: 3, per: { xia: 5 } }, result: '老乞丐连连作揖，你走后他原地消失，只留下一句"福缘深厚"。' },
      { text: '教他一句口诀', effect: { exp: 10, per: { qing: 3 } }, result: '"三十六计走为上"——老乞丐如获至宝。' },
      { text: '没钱，快走', effect: { moral: -3, per: { xia: -5 } }, result: '老乞丐冷哼一声，不再言语。' }
    ] },
  { id: 'e4', name: '山崖上的高人', weight: 2,
    desc: '一位白胡子老者盘坐山崖，闭目打坐。',
    choices: [
      { text: '轻声试探', sub: {
        desc: '你上前一步，刚想开口，老者先道："来者是客，何必试探？坐下说话。"',
        choices: [
          { text: '虚心请教', effect: { exp: 50, per: { ming: 8 } }, result: '老者捋须："年轻人，路还长着呢。"你似有所悟，获益良多。' },
          { text: '偷袭他', effect: { moral: -8, per: { xia: -8 } }, result: '老者眼皮都未抬，你一掌拍空，跌了个跟头。' },
          { text: '在旁边坐下', effect: { hp: 30, per: { qing: 8, gang: -3 } }, result: '你依言坐下，打坐片刻，神清气爽。' }
        ] } },
      { text: '虚心请教', effect: { exp: 40, per: { ming: 5 } }, result: '老者捋须："年轻人，路还长着呢。" 你似有所悟。' },
      { text: '偷袭他', effect: { moral: -8, per: { xia: -8 } }, result: '老者眼皮都未抬，你一掌拍空，跌了个跟头。' },
      { text: '在旁边坐下', effect: { hp: 20, per: { qing: 5, gang: -3 } }, result: '打坐片刻，神清气爽。' }
    ] },
  { id: 'e5', name: '黑店', weight: 2,
    desc: '一家小饭馆，掌柜的眼里闪着绿光。',
    choices: [
      { text: '仔细观察', sub: {
        desc: '你定睛一看：菜单上的"招牌菜"没写价，后厨里似有磨刀声，墙上还挂着一排"贵客"留下的空钱袋。',
        choices: [
          { text: '进去吃饭（多加提防）', effect: { gold: -15, hp: 30, per: { ming: 5 } }, result: '你处处提防，倒也未遭坑害，饭菜竟意外可口。' },
          { text: '撒腿就跑', effect: {}, result: '你跑得飞快，身后传来掌柜的怒骂。' },
          { text: '掀了桌子', effect: { exp: 15 }, result: '你掀桌而去，掌柜追出三条街。' }
        ] } },
      { text: '进去吃饭', effect: { gold: -15, hp: 30 }, result: '饭菜竟意外可口，只是掌柜的眼睛一直盯着你的钱袋。' },
      { text: '撒腿就跑', effect: {}, result: '你跑得飞快，身后传来掌柜的怒骂。' },
      { text: '掀了桌子', effect: { exp: 15 }, result: '你掀桌而去，掌柜追出三条街。' }
    ] },
  { id: 'e6', name: '比武招亲', weight: 2,
    desc: '镇上设下比武擂台，道是胜者娶亲，败者亦然。',
    choices: [
      { text: '上台比试', effect: { exp: 30, gold: 20 }, result: '你三招制敌，台下掌声雷动，怎料那女方……不提也罢。' },
      { text: '看热闹', effect: {}, result: '你嗑着瓜子看了半日，到底一无所获。' },
      { text: '帮女方逃走', effect: { luck: 1 }, result: '你被女方家人追出数条街，心头却觉暖意。' }
    ] },
  { id: 'e7', name: '灵泉', weight: 2,
    desc: '山间一汪清泉，灵气逼人。你俯身看去，水中的倒影似乎比你慢了半拍。',
    choices: [
      { text: '喝一口', effect: { hp: 40, mp: 30, per: { ming: 3 } }, result: '甘甜清冽，浑身舒泰。只是那"慢半拍"的倒影，让你心里隐隐不安。' },
      { text: '凝视水面', effect: { per: { ming: 8 } }, result: '你盯着倒影看了许久，倒影才不情不愿地，跟上了你的动作。' },
      { text: '装一瓶带走', effect: { item: 'lingquan' }, result: '你装了一瓶"灵泉水"，瓶底的水，轻轻荡了荡。' }
    ] },
  { id: 'e8', name: '拦路抢劫', weight: 3,
    desc: '两个蒙面人跳出来："此路是我开！"',
    choices: [
      { text: '反手就是一套', effect: { exp: 25, gold: 20, rep: 2, per: { xia: 5, gang: 5 } }, result: '你把两个毛贼打得抱头鼠窜，取了他们的盘缠。' },
      { text: '交出过路费', effect: { gold: -20, per: { gang: -5 } }, result: '"算你识相！"你忍痛掏出银两。' },
      { text: '佯装练过葵花宝典', effect: { luck: 1 }, result: '你摆了个兰花指，毛贼吓得落荒而逃。' }
    ] },
  { id: 'e9', name: '迷路的富商', weight: 2, scenes: ['village', 'town'],
    desc: '一个胖富商在路口转圈，急得满头汗。',
    choices: [
      { text: '上前询问', sub: {
        desc: '富商擦着汗："我要去临江镇交货，结果转迷了路，这些伙计也都不见了。"',
        choices: [
          { text: '好心指路', effect: { gold: 50, moral: 5, rep: 2, per: { xia: 5 } }, result: '富商千恩万谢，塞给你一锭银子。' },
          { text: '领他去"黑店"', effect: { gold: 30, luck: -1, moral: -8, per: { ming: -5 } }, result: '你领他进了家黑店，末了良心发现，又把他送了出来。' },
          { text: '护送一程', effect: { gold: 80, moral: 8, rep: 4, per: { xia: 8, qing: 5 } }, result: '你亲自护送，富商感激涕零，多给了你一锭大银。' }
        ] } },
      { text: '指路', effect: { gold: 50, moral: 5, rep: 2, per: { xia: 5 } }, result: '富商千恩万谢，塞给你一锭银子。' },
      { text: '领他去黑店', effect: { gold: 30, luck: -1, moral: -8, per: { ming: -5 } }, result: '你终究良心发现，又将他送了出来。' },
      { text: '不管', effect: { per: { qing: -5 } }, result: '富商继续转圈。' }
    ] },
  { id: 'e10', name: '遗落的剑', weight: 2,
    desc: '一柄断剑插在地上，剑柄缠着褪色的红缨。',
    choices: [
      { text: '拔出来', effect: { weapon: 'broken_sword' }, result: '你拔出一柄断剑，虽残破却寒气逼人。' },
      { text: '拜一拜', effect: { luck: 1 }, result: '你恭敬一拜，耳边似有剑鸣。' },
      { text: '视而不见', effect: {}, result: '剑还是那把剑，你还是那个你。' }
    ] },
  { id: 'e11', name: '说书人', weight: 2, scenes: ['village', 'town'],
    desc: '茶楼里说书人讲得口若悬河，忽然压低声音："诸位可知，这江湖话本，为何都一个套路？"',
    choices: [
      { text: '听下去', effect: { exp: 15, per: { ming: 3 } }, result: '"因为写话本的，从来只有一个人。"他意味深长地看了你一眼，惊堂木"啪"地一响。' },
      { text: '打赏追问', effect: { gold: -5, per: { ming: 5 } }, result: '他收了赏钱，只低声道："戏中人，莫问戏外事。"' },
      { text: '抢过惊堂木', effect: { per: { gang: 3 } }, result: '你被轰了出来，身后惊堂木响得震天。' }
    ] },
  { id: 'e12', name: '夜市小摊', weight: 2, scenes: ['village', 'town'],
    desc: '灯火通明，各种小摊叫卖。',
    choices: [
      { text: '吃喝一番', effect: { gold: -10, hp: 20 }, result: '你吃得尽兴，扶墙而出。' },
      { text: '淘一件物什', effect: { gold: -15, item: 'random' }, result: '你淘得一件"宝贝"，摊主笑得合不拢嘴。' },
      { text: '只看不买', effect: {}, result: '你闲逛一圈，什么也没买。' }
    ] },
  { id: 'e13', name: '崖底有光', weight: 1,
    desc: '悬崖下隐约有宝光闪烁。',
    choices: [
      { text: '冒险下崖', effect: { gold: 100, hp: -20 }, result: '你摔得鼻青脸肿，但捡到一箱金银。' },
      { text: '用绳子慢慢下', effect: { gold: 80 }, result: '稳稳落地，收获颇丰。' },
      { text: '算了', effect: {}, result: '你惜命，不去冒这险。' }
    ] },
  { id: 'e14', name: '隐世高人收徒', weight: 1,
    desc: '一位白发老妪打量着你："骨骼清奇，是个练武奇才。"',
    choices: [
      { text: '拜师', effect: { exp: 50, luck: 2 }, result: '老妪教了你半日，飘然而去。' },
      { text: '"我不信"', effect: {}, result: '老妪淡淡道："信与不信，随你。"' },
      { text: '问她要收多少银两', effect: { luck: -1 }, result: '"谈银两伤情分，不谈又伤身。"她说罢，飘然而去。' }
    ] },
  { id: 'e15', name: '暴雨将至', weight: 2,
    desc: '天色骤暗，雷声滚滚。',
    choices: [
      { text: '找山洞避雨', effect: { hp: 10 }, result: '你躲进山洞，躲过一劫。' },
      { text: '雨中练剑', effect: { exp: 20, hp: -10, per: { gang: 5 } }, result: '你在雨中挥剑，颇有几分剑意。' },
      { text: '继续赶路', effect: { hp: -15 }, result: '你被淋得浑身湿透。' }
    ] },
  { id: 'e16', name: '镜中倒影', weight: 2,
    desc: '路过一汪清泉，你瞥见水中倒影，它竟对你咧嘴笑了笑。',
    choices: [
      { text: '走近细看', sub: {
        desc: '你凑近水面，那倒影也凑近你，嘴角的笑容和你一模一样，却又慢了一拍。',
        choices: [
          { text: '凝神分辨', effect: { exp: 20, per: { ming: 12 } }, result: '你凝神细看，倒影恢复如常。你揉了揉眼，心中却警醒了几分。' },
          { text: '一剑搅碎', effect: { per: { gang: 8, ming: -3 } }, result: '你拔剑搅碎水面，倒影碎裂成千万片，每一片似乎都在笑。' },
          { text: '与它对视', effect: { per: { ming: 15, qing: -5 } }, result: '你与倒影对视良久，恍惚间，分不清谁在水里、谁在岸上。' }
        ] } },
      { text: '凝神分辨', effect: { exp: 15, per: { ming: 10 } }, result: '你凝神细看，倒影恢复如常。你揉了揉眼，心中却警醒了几分。' },
      { text: '一剑搅碎', effect: { per: { gang: 8, ming: -3 } }, result: '你拔剑搅碎水面，倒影碎裂成千万片，每一片似乎都在笑。' },
      { text: '转身就走', effect: { per: { qing: -3 } }, result: '你假装没看见，脚步却快了几分。' }
    ] },
  { id: 'e17', name: '楚门之说', weight: 2, scenes: ['village', 'town'],
    desc: '茶楼里，说书人压低声音讲起"活于话本中之人"的故事，台下鸦雀无声。',
    choices: [
      { text: '追问详情', sub: {
        desc: '你问："那话本中的人，后来知道真相了吗？"说书人慢悠悠道："知道又如何？他连\u2018话本\u2019都未必是真的。"',
        choices: [
          { text: '听完', effect: { exp: 25, per: { ming: 12 } }, result: '故事讲完，你脊背发凉——为何那"话本中人"的处境，竟似曾相识？' },
          { text: '打赏追问', effect: { gold: -10, per: { ming: 8, qing: 5 } }, result: '你打赏再问，说书人却笑而不语，只道："庄周梦蝶，孰真孰假？"' },
          { text: '嗤之以鼻', effect: { per: { ming: -5, gang: 5 } }, result: '"不过是编来唬人的。"你嘴上不屑，夜里却做了个怪梦。' }
        ] } },
      { text: '听完', effect: { exp: 20, per: { ming: 10 } }, result: '故事讲完，你脊背发凉——为何那"话本中人"的处境，竟似曾相识？' },
      { text: '嗤之以鼻', effect: { per: { ming: -5, gang: 5 } }, result: '"不过是编来唬人的。" 你嘴上不屑，夜里却做了个怪梦。' },
      { text: '打赏追问', effect: { gold: -10, per: { ming: 5, qing: 5 } }, result: '你打赏追问，说书人却笑而不语，只道："庄周梦蝶，孰真孰假？"' }
    ] },
  { id: 'e18', name: '真假自问', weight: 1, scenes: ['village', 'town'],
    desc: '一位老乞丐塞给你一个破旧锦囊，附耳道："危急时打开。"',
    choices: [
      { text: '郑重收下', effect: { moral: 5, per: { qing: 8, xia: 5 } }, result: '你郑重收好锦囊，老乞丐笑了笑，转身消失在人群。' },
      { text: '当面打开', effect: { per: { ming: 10 } }, result: '里面只写着四个字："真假自问。" 老乞丐已不见踪影。' },
      { text: '随手扔掉', effect: { moral: -3, per: { qing: -8, xia: -3 } }, result: '你随手一扔，锦囊落地，竟化作一只蝴蝶飞走了。' }
    ] },
  { id: 'e19', name: '卖身葬父', weight: 2, scenes: ['village', 'town'], giver: '书生',
    desc: '一书生跪在街头，插草标"卖身葬父"，泣不成声。',
    choices: [
      { text: '上前询问', sub: {
        desc: '书生抬起泪眼："客官，家父病故，无钱下葬……只能卖身换口薄棺。"',
        choices: [
          { text: '细问详情', sub: {
            desc: '你追问细节，书生支支吾吾，眼神躲闪："家父……昨夜病故的。"可你分明瞧见"尸体"的手指轻轻动了一下。',
            choices: [
              { text: '识破骗局', effect: { moral: 3, rep: 3, per: { ming: 10 } }, result: '你冷笑一声，掀开"尸体"——果然是个装死的同伙！骗子落荒而逃。' },
              { text: '将计就计，留银', effect: { gold: -20, moral: 8, rep: 3, per: { qing: 5 } }, result: '你明知是局，仍放下银子："若有难处，这钱便救急；若是骗局，望你回头。"书生呆立当场。' },
              { text: '踹开草标', effect: { moral: -10, per: { xia: -10, gang: 5 } }, result: '"莫要在此讹人！"你一脚踹开草标，扬长而去。' }
            ] } },
          { text: '直接给钱', effect: { gold: -20, moral: 10, rep: 5, per: { xia: 10, qing: 5 } }, result: '你倾囊相助，书生磕头如捣蒜，围观众人齐声喝彩。' },
          { text: '转身就走', effect: {}, result: '你无意多管，转身离开。' }
        ] } },
      { text: '慷慨解囊', effect: { gold: -20, moral: 10, rep: 5, per: { xia: 10, qing: 5 } }, result: '你倾囊相助，书生磕头如捣蒜，围观众人齐声喝彩。' },
      { text: '识破骗局', effect: { moral: 3, rep: 3, per: { ming: 10 } }, result: '你冷笑一声，掀开"尸体"——果然是个装死的同伙。骗子落荒而逃。' }
    ] },
  { id: 'e20', name: '劫富济贫', weight: 3,
    desc: '一伙"好汉"拦路："此树是我栽，要从此路过，留下买路财！"',
    choices: [
      { text: '出手教训', effect: { exp: 25, rep: 5, per: { xia: 10, gang: 5 } }, result: '你三招两式收拾了他们，为民除害，路人纷纷叫好。' },
      { text: '分他们点', effect: { gold: -15, moral: 5, per: { qing: 5 } }, result: '你解囊相赠（心头滴血），好汉们感激涕零，争着要拜你为兄。' },
      { text: '反抢他们', effect: { gold: 25, moral: -5, per: { xia: -5, gang: 8 } }, result: '你反手抢了他们的盘缠，"好汉"们抱头痛哭。' }
    ] },
  { id: 'e21', name: '酒馆传闻·斩妄', weight: 1, scenes: ['village', 'town'],
    desc: '酒馆里，说书人压低声音讲起神剑「斩妄」的传说——剑锋所指，真假自现。',
    choices: [
      { text: '记在心里', effect: { per: { ming: 3 } }, result: '你暗自记下，心想：若真有此剑，世间虚妄岂非都能斩断？' },
      { text: '打听细节', effect: { gold: -5, per: { ming: 5 } }, result: '你花了几两银子挖出更多传闻，越听越觉得蹊跷。' },
      { text: '一笑而过', effect: {}, result: '你只当是话本野史，一笑而过。' }
    ] },
  { id: 'e22', name: '高手对决·无相', weight: 1,
    desc: '你偶遇两位绝顶高手对决，其中一人戴着一张无相面具，身影忽隐忽现，胜负难分。',
    choices: [
      { text: '凝神观战', effect: { exp: 30, per: { ming: 5 } }, result: '你屏息观战，隐隐觉得那面具下的人，似乎也在看着你。' },
      { text: '偷学一招', effect: { exp: 40, per: { gang: 5 } }, result: '你偷偷记下一招半式，获益良多。' },
      { text: '速速离开', effect: {}, result: '神仙斗法，凡人遭殃，你速速避开。' }
    ] },
  { id: 'e23', name: '大梦袈裟·梦中之梦', weight: 1,
    desc: '你在一处破庙小憩，梦见另一个自己披着袈裟，对你说：「醒来。」',
    choices: [
      { text: '追问', effect: { per: { ming: 10 } }, result: '你在梦中追问："你是谁？"那人微微一笑，化作一滩月光。' },
      { text: '惊醒', effect: { per: { qing: -3 } }, result: '你猛地惊醒，冷汗涔涔，那两个字却挥之不去。' },
      { text: '继续沉睡', effect: { exp: 20, per: { ming: -5 } }, result: '你沉沉睡去，却再没梦见什么。' }
    ] },
  { id: 'e24', name: '斩妄剑冢', weight: 1, levelReq: 60, region: 'huashan', once: 'got_zhanwang',
    desc: '华山之巅，你寻到一处无名剑冢，一柄古剑斜插石中，剑气冲霄。',
    choices: [
      { text: '拔剑', effect: { artifact: 'zhanwang' }, result: '你握住剑柄，剑身嗡鸣，似有万缕虚妄被一剑斩断。' },
      { text: '参悟剑意', effect: { exp: 80, per: { ming: 8 } }, result: '你盘坐冢前参悟剑意，剑气入体，似有所得。' },
      { text: '拜别', effect: {}, result: '你朝剑冢深深一拜，转身离去。' }
    ] },
  { id: 'e25', name: '无相面具·无色无相', weight: 1, levelReq: 100, region: 'tianmen', once: 'got_wuxiang',
    desc: '天门之内，一方石台上静静躺着一张无相面具，看着它，你竟想不起自己是谁。',
    choices: [
      { text: '戴上', effect: { artifact: 'wuxiang' }, result: '你缓缓戴上面具，世界瞬间安静下来——从此，世人再难见你。' },
      { text: '凝神观察', effect: { per: { ming: 10 } }, result: '你凝神细看，只觉面具上似有千面流转，真假难辨。' },
      { text: '不敢碰', effect: {}, result: '你心生寒意，不敢触碰，转身离开。' }
    ] },
  { id: 'e26', name: '大梦袈裟·梦中袈裟', weight: 1, levelReq: 62, region: 'kunlun', once: 'got_dameng',
    desc: '昆仑墟深处，一件袈裟悬于雪峰之巅，无风自动。',
    choices: [
      { text: '披上', effect: { artifact: 'dameng' }, result: '你披上袈裟，刹那间似在梦中看见了另一个自己。' },
      { text: '参禅', effect: { exp: 60, per: { ming: 8 } }, result: '你于雪峰之巅参禅，心有所悟。' },
      { text: '离去', effect: {}, result: '你不再打扰，悄然离去。' }
    ] },
  { id: 'e27', name: '山河印·失窃至宝', weight: 1, levelReq: 88, region: 'tianji', once: 'got_shanhe',
    desc: '天机阁密室，你发现一块残破的古印，正是传闻中失窃的「山河印」残片。',
    choices: [
      { text: '取走', effect: { artifact: 'shanhe' }, result: '你收好残片，指尖仿佛触到了山河的重量。' },
      { text: '记录拓印', effect: { per: { ming: 8 } }, result: '你拓下印文，只觉其中暗藏天机。' },
      { text: '放回原处', effect: {}, result: '你犹豫再三，放回原处，转身离去。' }
    ] },
  { id: 'e28', name: '轮回刀·彼岸之刀', weight: 1, levelReq: 92, region: 'huangquan', once: 'got_lunhui',
    desc: '黄泉路上，一柄长刀插在彼岸花丛中，刀身刻满轮回之纹。',
    choices: [
      { text: '拔刀', effect: { artifact: 'lunhui' }, result: '你拔刀而出，耳边似有万千因果，一一斩断。' },
      { text: '参悟轮回', effect: { exp: 70, per: { ming: 10 } }, result: '你凝望刀纹，似懂非懂，心中却多了几分明悟。' },
      { text: '不碰因果', effect: {}, result: '你不敢碰这柄刀，快步离开。' }
    ] },
  { id: 'e29', name: '石壁剑谱', weight: 2, levelReq: 15,
    desc: '一处悬崖石壁上，刻满密密麻麻的剑招，虽经风雨，仍剑气逼人。',
    choices: [
      { text: '参悟剑意', effect: { exp: 90, per: { ming: 5, gang: 5 } }, result: '你于壁前参悟三日，剑法大有精进。' },
      { text: '临摹下来', effect: { gold: 60 }, result: '你拓下剑谱，转手卖了个好价钱。' },
      { text: '随手毁去', effect: { per: { gang: 5 } }, result: '你一剑削平石壁，免得后人误入歧途。' }
    ] },
  { id: 'e30', name: '隐世高人赠药', weight: 1, levelReq: 20,
    desc: '一位鹤发童颜的老者拦路："小友，看你骨骼清奇，送你一瓶好药。"',
    choices: [
      { text: '收下', effect: { item: 'dahuan', exp: 40 }, result: '你接过一看，竟是千金难求的大还丹！' },
      { text: '婉拒', effect: { per: { qing: 3 } }, result: '老者哈哈一笑："倒是有骨气。"' },
      { text: '追问来历', effect: { per: { ming: 5 } }, result: '老者捋须不语，飘然而去。' }
    ] },
  { id: 'e31', name: '灵泉沐浴', weight: 2,
    desc: '山间一汪灵泉，热气氤氲，灵气逼人。',
    choices: [
      { text: '跳进去泡个澡', effect: { hp: 9999, mp: 9999 }, result: '你泡得浑身舒泰，状态尽复。' },
      { text: '喝几口', effect: { hp: 60, mp: 40 }, result: '甘甜清冽，神清气爽。' },
      { text: '装几瓶带走', effect: { item: 'lingquan' }, result: '你装了一瓶灵泉水。' }
    ] },
  { id: 'e32', name: '藏宝图', weight: 2,
    desc: '你在旧书摊淘到一张泛黄的藏宝图，落款是某位江洋大盗。',
    choices: [
      { text: '按图索骥', effect: { gold: 220, exp: 40 }, result: '你掘地三尺，果然挖出一箱金银！' },
      { text: '卖了换钱', effect: { gold: 50 }, result: '你把藏宝图转手，小赚一笔。' },
      { text: '仔细辨伪', effect: { per: { ming: 5 } }, result: '你发现是假的，幸好没白跑一趟。' }
    ] },
  { id: 'e33', name: '剑冢余晖', weight: 1, levelReq: 40,
    desc: '你误入一处荒废剑冢，一柄古剑斜插石中，龙吟隐隐。',
    choices: [
      { text: '拔剑', effect: { weapon: 'longyuan' }, result: '你拔出古剑，剑身刻着「龙渊」二字，寒光夺目！' },
      { text: '拜一拜', effect: { exp: 60 }, result: '你恭敬一拜，似有剑意入体。' },
      { text: '不取', effect: { per: { qing: 3 } }, result: '你转身离去，留古剑在此长眠。' }
    ] },
  { id: 'e34', name: '高人传功', weight: 1, levelReq: 30,
    desc: '一位灰衣老者见你天资不错，愿传你一手绝学。',
    choices: [
      { text: '拜谢受教', effect: { tech: 'taiji' }, result: '你习得太极玄功，内力绵长，生生不息。' },
      { text: '只求指点', effect: { exp: 120 }, result: '老者稍加点拨，你便茅塞顿开。' },
      { text: '谢绝', effect: { per: { gang: 5 } }, result: '"路，终究要自己走。"你婉言谢绝。' }
    ] },
  { id: 'e35', name: '千年雪莲', weight: 1, levelReq: 45,
    desc: '雪峰之巅，一朵千年雪莲在寒风中绽放。',
    choices: [
      { text: '采摘服下', effect: { hp: 9999, talent: 3 }, result: '你服下雪莲，只觉气血翻涌，天赋大增！' },
      { text: '留着卖钱', effect: { gold: 300 }, result: '雪莲被识货的富商高价收走。' },
      { text: '不采', effect: { per: { qing: 5 } }, result: '你心生敬意，悄然退去。' }
    ] },
  { id: 'e36', name: '江湖秘籍残页', weight: 2,
    desc: '路边一册残页，字迹模糊，似是高深武学。',
    choices: [
      { text: '苦心钻研', effect: { exp: 100, talent: 2 }, result: '你苦研半日，竟悟出几分门道。' },
      { text: '转卖', effect: { gold: 40 }, result: '残页被个老学究买走。' },
      { text: '撕了', effect: { per: { gang: 3 } }, result: '你撕碎残页，图个清静。' }
    ] },
  { id: 'e37', name: '灵兽认主', weight: 1,
    desc: '一只通体雪白的小兽缠着你不走，眼巴巴地望着你。',
    choices: [
      { text: '收留它', effect: { exp: 60, per: { qing: 8 } }, result: '小兽欢快地绕着你转，从此伴你闯荡。' },
      { text: '喂它点吃的', effect: { item: 'jijirou', gold: -5 }, result: '它吃得香甜，蹭了蹭你的手。' },
      { text: '赶走', effect: { per: { qing: -5 } }, result: '小兽委屈地跑开了。' }
    ] },
  { id: 'e38', name: '前人洞府', weight: 2, levelReq: 25,
    desc: '你发现一处前人修炼的洞府，石门半掩。',
    choices: [
      { text: '进去探索', effect: { gold: 180, item: 'xiaohuan', exp: 60 }, result: '洞府内丹药金银散落，收获颇丰。' },
      { text: '先叩门', effect: { per: { qing: 5 } }, result: '你叩门三声，无人应答，才推门而入。' },
      { text: '绕道', effect: {}, result: '你不想打扰先人遗府，绕道而行。' }
    ] },
  { id: 'e39', name: '灵药圃', weight: 2,
    desc: '一片无人看管的药圃，灵药长势喜人。',
    choices: [
      { text: '采几株', effect: { item: 'xiaohuan' }, result: '你采了几株上好的小还丹材料。' },
      { text: '采光', effect: { item: 'dahuan' }, result: '你顺手牵走最肥的一株，够炼大还丹了。' },
      { text: '不采', effect: { per: { qing: 3 } }, result: '你不想糟蹋人家心血。' }
    ] },
  { id: 'e40', name: '高人收徒', weight: 1, levelReq: 40,
    desc: '一位白袍老者打量你半晌："可愿拜我为师？"',
    choices: [
      { text: '磕头拜师', effect: { tech: 'xianglong', talent: 3 }, result: '老者传授你降龙十八掌，刚猛无俦！' },
      { text: '先试他深浅', effect: { exp: 80 }, result: '你与他过招三合，获益良多。' },
      { text: '婉拒', effect: { per: { gang: 5 } }, result: '"我这一生，只信自己。"你转身离去。' }
    ] },
  { id: 'e41', name: '大还丹机缘', weight: 1, levelReq: 35,
    desc: '一位丹师炼丹失败，气急败坏，把炉中残丹尽数倾倒。',
    choices: [
      { text: '捡漏', effect: { item: 'dahuan' }, result: '你在残丹里竟扒出两枚成色尚可的大还丹。' },
      { text: '指点他', effect: { per: { ming: 5 }, exp: 50 }, result: '你随口一句，丹师恍然大悟，送你一瓶丹药。' },
      { text: '走开', effect: {}, result: '你不愿沾这身药味。' }
    ] },
  { id: 'e42', name: '金矿脉', weight: 1,
    desc: '你无意间发现一条裸露的金矿脉，金光闪闪。',
    choices: [
      { text: '挖个痛快', effect: { gold: 500 }, result: '你挖出一大袋金砂，赚得盆满钵满。' },
      { text: '上报官府', effect: { gold: 150, rep: 5 }, result: '官府赏了你些银两，还记了你一功。' },
      { text: '记下位置', effect: { per: { ming: 3 } }, result: '你默默记下位置，留作后用。' }
    ] },
  { id: 'e43', name: '悟道石', weight: 1, levelReq: 30,
    desc: '一方奇石，石纹天然成太极之形，坐于其前，心神澄明。',
    choices: [
      { text: '静坐参悟', effect: { exp: 200, talent: 3 }, result: '你入定三日，醒来只觉脱胎换骨。' },
      { text: '拂拭石面', effect: { per: { ming: 5 }, exp: 60 }, result: '你拂去尘埃，石纹愈发清晰。' },
      { text: '搬走', effect: { gold: 100 }, result: '你把石头卖给了个附庸风雅的富商。' }
    ] },
  { id: 'e44', name: '门派遗址·武学', weight: 1, levelReq: 50,
    desc: '一片被大火焚毁的派门遗址，残垣断壁间似有秘籍未毁。',
    choices: [
      { text: '搜寻秘籍', effect: { tech: 'luohan' }, result: '你在废墟中找到一册完好的《罗汉伏魔功》！' },
      { text: '凭吊亡魂', effect: { per: { qing: 5 } }, result: '你焚香一炷，默默凭吊。' },
      { text: '翻找财物', effect: { gold: 150 }, result: '你在废墟中寻得些未烧尽的银两。' }
    ] },
  { id: 'e45', name: '龙鳞草', weight: 1,
    desc: '一株形如龙鳞的奇草，据说能强筋健骨。',
    choices: [
      { text: '服下', effect: { hp: 300, talent: 2 }, result: '你服下龙鳞草，气血翻涌，筋骨也结实了几分。' },
      { text: '卖掉', effect: { gold: 200 }, result: '奇草被药商抢购一空。' },
      { text: '留着', effect: {}, result: '你将其收好，日后或有大用。' }
    ] },
  { id: 'e46', name: '奇遇·高人指点', weight: 2,
    desc: '一位其貌不扬的老者，一眼看穿你武功的破绽。',
    choices: [
      { text: '虚心求教', effect: { exp: 150, per: { ming: 5 } }, result: '老者三言两语，点破你多年苦思不得的关窍。' },
      { text: '不信', effect: {}, result: '"年轻人，信与不信，随你。"老者摇头离去。' },
      { text: '反问他', effect: { per: { ming: 8 } }, result: '你反唇相讥，老者却哈哈大笑，似有所指。' }
    ] },
  { id: 'e47', name: '失传绝学·残卷', weight: 1, levelReq: 50,
    desc: '你在旧书摊翻到半部残卷，竟是一门失传绝学的口诀。',
    choices: [
      { text: '倾囊买下', effect: { gold: -200, tech: 'yijinjing' }, result: '你苦修残卷，竟练成了易筋经的入门功！' },
      { text: '偷偷背下', effect: { exp: 80, moral: -3 }, result: '你默记口诀，没花一文钱。' },
      { text: '不买', effect: {}, result: '残卷被个和尚高价请走。' }
    ] },
  { id: 'e48', name: '天降横财', weight: 1,
    desc: '一辆运银车翻在山沟里，车夫早已不见踪影。',
    choices: [
      { text: '取走银子', effect: { gold: 300 }, result: '你取走几锭官银，够用一阵子。' },
      { text: '等失主', effect: { moral: 5, rep: 3 }, result: '你守了半日，失主寻来，千恩万谢。' },
      { text: '视而不见', effect: {}, result: '你不想沾这趟浑水。' }
    ] },
  { id: 'e49', name: '落难镖队', weight: 2,
    desc: '一队镖车遭劫，镖师死伤惨重，余者苦战不支。',
    choices: [
      { text: '出手相助', effect: { exp: 60, gold: 120, rep: 8, per: { xia: 8 } }, result: '你力挽狂澜，镖局上下感激涕零。' },
      { text: '趁火打劫', effect: { gold: 200, moral: -10, per: { xia: -8 } }, result: '你抢了镖货扬长而去，留下骂名。' },
      { text: '绕道', effect: {}, result: '你不想趟这浑水。' }
    ] },
  { id: 'e50', name: '被追杀的逃犯', weight: 2,
    desc: '一个浑身是血的人拦住你："救我！我是被冤枉的！"',
    choices: [
      { text: '藏起他', effect: { moral: 5, rep: 3, per: { xia: 5 } }, result: '你设法救下他，追兵扑了个空。' },
      { text: '交给追兵', effect: { gold: 80, moral: -5, rep: 2 }, result: '追兵赏了你些银两。' },
      { text: '先问清缘由', effect: { per: { ming: 5 } }, result: '他道出冤情，原来确是官场倾轧。' }
    ] },
  { id: 'e51', name: '饥荒灾民', weight: 2,
    desc: '一群面黄肌瘦的灾民围上来，眼巴巴地讨口吃食。',
    choices: [
      { text: '施粥散粮', effect: { gold: -40, moral: 8, rep: 5, per: { xia: 8 } }, result: '你散尽干粮，灾民跪地磕头。' },
      { text: '驱散', effect: { moral: -8, per: { xia: -8 } }, result: '你呵斥一声，灾民四散，心中却不是滋味。' },
      { text: '不管', effect: { per: { qing: -5 } }, result: '你扭头离开，耳边尽是哀嚎。' }
    ] },
  { id: 'e52', name: '恶霸欺民', weight: 3,
    desc: '一个恶霸当街强抢民女，围观者敢怒不敢言。',
    choices: [
      { text: '出手教训', effect: { exp: 50, rep: 8, moral: 5, per: { xia: 8, gang: 5 } }, result: '你三拳两脚收拾了恶霸，百姓拍手称快。' },
      { text: '收钱走人', effect: { gold: 60, moral: -10, per: { xia: -8 } }, result: '恶霸塞钱求你莫管闲事，你收了。' },
      { text: '视而不见', effect: { per: { qing: -5 } }, result: '你装作没看见，心头却像堵了块石头。' }
    ] },
  { id: 'e53', name: '偷儿还银', weight: 2,
    desc: '一个小偷刚得手，就被失主发现，慌不择路撞进你怀里。',
    choices: [
      { text: '抓住他', effect: { rep: 5, moral: 3 }, result: '你拎住小偷，失主千恩万谢。' },
      { text: '放他一马', effect: { moral: 5, per: { qing: 5 } }, result: '你见他可怜，低声道："下次别偷了。"' },
      { text: '分赃', effect: { gold: 30, moral: -8, per: { xia: -5 } }, result: '你和小偷相视一笑，各取一半。' }
    ] },
  { id: 'e54', name: '忠仆寻主', weight: 2,
    desc: '一个老仆拄着拐杖，逢人便问："可曾见过我家少爷？"',
    choices: [
      { text: '帮他寻找', effect: { moral: 5, per: { qing: 5 }, exp: 40 }, result: '你陪他寻了半日，终于找到失散的少爷。' },
      { text: '给点盘缠', effect: { gold: -10, moral: 5 }, result: '老仆连连作揖，浑浊的眼里有了光。' },
      { text: '不管', effect: {}, result: '你行色匆匆，无暇多问。' }
    ] },
  { id: 'e55', name: '灾民卖女', weight: 2,
    desc: '一个衣衫褴褛的父亲插草卖女，小姑娘哭着抱紧父亲的腿。',
    choices: [
      { text: '买下并放她回家', effect: { gold: -30, moral: 10, per: { xia: 8, qing: 8 } }, result: '你买下小女孩，又把她送回父亲身边。' },
      { text: '只给钱不留人', effect: { gold: -20, moral: 8, per: { qing: 5 } }, result: '你留下银两，转身离去。' },
      { text: '走开', effect: { per: { qing: -5 } }, result: '你不敢多看，快步离开。' }
    ] },
  { id: 'e56', name: '江湖义士募捐', weight: 2,
    desc: '几个"义士"摆摊募捐，说是要修桥铺路。',
    choices: [
      { text: '慷慨解囊', effect: { gold: -30, moral: 5, rep: 3 }, result: '你捐了银子，义士们高呼"好汉"。' },
      { text: '拆穿骗局', effect: { per: { ming: 8 }, rep: 3 }, result: '你当场揭穿他们中饱私囊，围观者哗然。' },
      { text: '不捐', effect: {}, result: '你径自走开。' }
    ] },
  { id: 'e57', name: '冤案申冤', weight: 1,
    desc: '一位妇人跪在衙门外，高举状纸，哭喊"冤枉"。',
    choices: [
      { text: '帮她递状', effect: { rep: 5, moral: 5, per: { xia: 5 } }, result: '你替她把状纸递进衙门，惊动了青天大老爷。' },
      { text: '问清冤情', effect: { per: { ming: 5 } }, result: '你听罢冤情，义愤填膺。' },
      { text: '走开', effect: {}, result: '你不想惹上官司。' }
    ] },
  { id: 'e58', name: '决斗邀约', weight: 2,
    desc: '一位剑客当街拦住你："久闻大名，可敢与我切磋一场？"',
    choices: [
      { text: '应战', effect: { exp: 80, rep: 5, per: { gang: 5 } }, result: '你们大战三十回合，胜负难分，惺惺相惜。' },
      { text: '婉拒', effect: { per: { gang: -3 } }, result: '"改日再战。"你拱手离开。' },
      { text: '偷袭', effect: { moral: -8, per: { xia: -8 } }, result: '你趁其不备出手，赢了却不光彩。' }
    ] },
  { id: 'e59', name: '神棍算命', weight: 2,
    desc: '一个自称"半仙"的算命先生拉住你："施主印堂发黑，恐有大劫啊！"',
    choices: [
      { text: '算一卦', effect: { gold: -10, per: { ming: 5 } }, result: '他掐指半晌，脸色骤变："你……你不是此界中人！"言罢，竟不收钱，落荒而逃。' },
      { text: '反将一军', effect: { per: { ming: 5 }, gold: 15 }, result: '你反手给他算了一卦，神棍被唬得一愣，末了却低声道："你近日，会照见一泓水面。"' },
      { text: '不理', effect: {}, result: '"哎，不听老人言……"他在身后直跺脚，那话却在你耳边绕了许久。' }
    ] },
  { id: 'e60', name: '卖神药的', weight: 2, scenes: ['village', 'town'],
    desc: '一个小贩扯着嗓子："包治百病，一粒见效，不灵你砸我招牌！"',
    choices: [
      { text: '买一粒试试', effect: { gold: -15, item: 'jiayao' }, result: '你买了瓶"神药"，回家才发现是面粉搓的。' },
      { text: '当场揭穿', effect: { per: { ming: 5 }, rep: 3 }, result: '你当众拆台，小贩灰溜溜跑了。' },
      { text: '围观起哄', effect: {}, result: '你跟着人群起哄，图个乐子。' }
    ] },
  { id: 'e61', name: '会说话的鹦鹉', weight: 1,
    desc: '一只绿毛鹦鹉站在架上，见你就喊："大侠饶命！大侠饶命！"',
    choices: [
      { text: '买下它', effect: { gold: -30, per: { qing: 5 } }, result: '你买下鹦鹉，它天天变着花样夸你。' },
      { text: '逗它玩', effect: { per: { qing: 3 } }, result: '你逗得它学你说话，像模像样。' },
      { text: '走开', effect: {}, result: '鹦鹉在你身后叫道："吝啬鬼！吝啬鬼！"' }
    ] },
  { id: 'e62', name: '钓鱼翁', weight: 2,
    desc: '一位老翁在河边钓鱼，鱼钩是直的，鱼线也浮在水面。',
    choices: [
      { text: '问他钓什么', effect: { per: { ming: 5 }, exp: 20 }, result: '"钓鱼。"他答，"也不全是钓。"言罢，鱼线忽地一沉。' },
      { text: '陪他坐坐', effect: { per: { qing: 5 } }, result: '你们对坐半日，他忽然道："你也在等什么吧？"你竟答不上来。' },
      { text: '走开', effect: {}, result: '你轻手轻脚离开，身后传来一声极轻的叹息。' }
    ] },
  { id: 'e63', name: '醉拳老汉', weight: 2,
    desc: '一个醉醺醺的老汉在巷子里东倒西歪，拳法却暗合章法。',
    choices: [
      { text: '学两招', effect: { exp: 50, per: { gang: 3 } }, result: '你跟着比划，竟学了几分醉拳神髓。' },
      { text: '请他喝酒', effect: { gold: -10, per: { qing: 5 } }, result: '老汉喝得尽兴，拍着你的肩称兄道弟。' },
      { text: '看热闹', effect: {}, result: '你围观了半日。' }
    ] },
  { id: 'e64', name: '讲价狂魔', weight: 2,
    desc: '你在摊前看中一件物什，摊主狮子大开口。',
    choices: [
      { text: '疯狂砍价', effect: { gold: 20, per: { ming: 3 } }, result: '你舌战群儒，硬是把价格砍到三成。' },
      { text: '爽快买下', effect: { gold: -30 }, result: '你不愿多费口舌，爽快付了银钱。' },
      { text: '不买', effect: {}, result: '摊主在你身后小声嘀咕。' }
    ] },
  { id: 'e65', name: '街头艺人挑战', weight: 2,
    desc: '一个卖艺人摆下擂台："谁能接我三招，赏银十两！"',
    choices: [
      { text: '上台比试', effect: { exp: 40, gold: 10 }, result: '你轻松接下三招，赢得赏银。' },
      { text: '打赏', effect: { gold: -5, per: { qing: 3 } }, result: '你扔下几文赏钱。' },
      { text: '看热闹', effect: {}, result: '你混在人群里起哄。' }
    ] },
  { id: 'e66', name: '迷路的小孩', weight: 2,
    desc: '一个小娃娃蹲在路边哭："我要找娘亲……"',
    choices: [
      { text: '送他回家', effect: { moral: 5, per: { qing: 5 }, exp: 20 }, result: '你费了番功夫把他送回家，其母感激不尽。' },
      { text: '给颗糖', effect: { gold: -3, per: { qing: 3 } }, result: '娃娃破涕为笑。' },
      { text: '走开', effect: {}, result: '你行色匆匆。' }
    ] },
  { id: 'e67', name: '会算数的猴子', weight: 1,
    desc: '一只猴子敲锣打鼓，竟会做简单的算术。',
    choices: [
      { text: '看表演', effect: { per: { qing: 3 } }, result: '你看得津津有味。' },
      { text: '打赏', effect: { gold: -5, per: { qing: 3 } }, result: '猴子接过赏钱，朝你作揖。' },
      { text: '想拐走它', effect: { moral: -5 }, result: '你刚伸手，就被猴主人瞪了回去。' }
    ] },
  { id: 'e68', name: '猪肉铺的猫', weight: 2,
    desc: '一只大橘猫蹲在猪肉铺前，眼巴巴地望着案上的肉。',
    choices: [
      { text: '买肉喂它', effect: { gold: -8, per: { qing: 5 } }, result: '橘猫吃得肚皮溜圆，蹭了蹭你。' },
      { text: '逗它', effect: { per: { qing: 3 } }, result: '你逗得它翻肚皮。' },
      { text: '走开', effect: {}, result: '橘猫"喵"了一声，似在挽留。' }
    ] },
  { id: 'e69', name: '铁匠的怪脾气', weight: 1, levelReq: 20,
    desc: '一位老铁匠的炉火日夜不熄，他说炉里藏着一件"雪魄刀"的坯子。',
    choices: [
      { text: '请他打造', effect: { weapon: 'xueshan' }, result: '老铁匠见你识货，竟将雪魄刀赠予了你！' },
      { text: '帮忙拉风箱', effect: { exp: 60 }, result: '你帮他拉了半日风箱，学会不少锻造门道。' },
      { text: '走开', effect: {}, result: '老铁匠头也不抬，叮叮当当敲个不停。' }
    ] },
  { id: 'e70', name: '说书人忘词', weight: 2, scenes: ['village', 'town'],
    desc: '说书人讲到精彩处，突然卡壳，急得满头大汗。',
    choices: [
      { text: '小声提醒', effect: { per: { qing: 3 }, exp: 20 }, result: '你提醒了一句，说书人感激地朝你拱手。' },
      { text: '接下去讲', effect: { exp: 30, per: { ming: 3 } }, result: '你接过惊堂木，讲得比他还精彩。' },
      { text: '起哄', effect: { per: { gang: 3 } }, result: '你跟着起哄，气得说书人吹胡子瞪眼。' }
    ] },
  { id: 'e71', name: '厨神挑战', weight: 2,
    desc: '一位大厨摆下擂台，比谁做的菜好吃。',
    choices: [
      { text: '露一手', effect: { gold: 30, per: { qing: 3 } }, result: '你做了道拿手菜，赢得满堂彩。' },
      { text: '吃白食', effect: { hp: 50 }, result: '你混在评委席上，白吃了一顿。' },
      { text: '看热闹', effect: {}, result: '你闻着香味咽口水。' }
    ] },
  { id: 'e72', name: '钓鱼执法', weight: 2,
    desc: '一个"路人"故意把钱包掉在地上，眼睛却偷瞄着你。',
    choices: [
      { text: '捡起归还', effect: { moral: 5, rep: 3 }, result: '你捡起钱包奉还，那人讪讪道谢。' },
      { text: '识破陷阱', effect: { per: { ming: 8 } }, result: '你冷笑一声，绕道而行。' },
      { text: '顺手牵羊', effect: { gold: 40, moral: -8 }, result: '你捡起钱包就跑，身后传来"抓贼"声。' }
    ] },
  { id: 'e73', name: '会动的稻草人', weight: 1,
    desc: '田里的稻草人似乎朝你眨了眨眼。',
    choices: [
      { text: '走近查看', effect: { per: { ming: 5 } }, result: '你走近一看，原来稻草人头顶落了只乌鸦。' },
      { text: '拜一拜', effect: { per: { qing: 3 } }, result: '你恭敬一拜，图个心安。' },
      { text: '转身就跑', effect: {}, result: '你撒腿就跑，好不狼狈。' }
    ] },
  { id: 'e74', name: '摔跤表演', weight: 2,
    desc: '两个壮汉在擂台上角力，台下喝彩声震天。',
    choices: [
      { text: '押注', effect: { gold: 50 }, result: '你押中了胜者，小赚一笔。' },
      { text: '上台挑战', effect: { exp: 40, rep: 3 }, result: '你上台一试身手，博得满堂彩。' },
      { text: '看热闹', effect: {}, result: '你嗑着瓜子看完了全场。' }
    ] },
  { id: 'e75', name: '卖艺的熊', weight: 2,
    desc: '一头大黑熊会耍把式，还会作揖讨赏。',
    choices: [
      { text: '打赏', effect: { gold: -5, per: { qing: 3 } }, result: '黑熊朝你作揖，憨态可掬。' },
      { text: '逗它', effect: { per: { qing: 3 } }, result: '你和黑熊玩得不亦乐乎。' },
      { text: '走开', effect: {}, result: '你怕被熊拍上一掌，连忙退开。' }
    ] },
  { id: 'e76', name: '河边的笑声', weight: 1,
    desc: '夜深人静，河边传来一阵若有若无的笑声。',
    choices: [
      { text: '循声查看', effect: { per: { ming: 5 } }, result: '原来是一群人在夜钓，谈笑风生。' },
      { text: '充耳不闻', effect: { per: { gang: 3 } }, result: '你稳住心神，快步离开。' },
      { text: '大声喝问', effect: { per: { gang: 5 } }, result: '"谁？！"你一声断喝，笑声戛然而止。' }
    ] },
  { id: 'e77', name: '深夜更夫', weight: 2,
    desc: '三更半夜，打更的老更夫与你擦肩而过，递来一句："天干物燥，小心火烛。"',
    choices: [
      { text: '同行一段', effect: { per: { qing: 5 } }, result: '你陪老更夫走了一程，听他讲起半生的见闻。' },
      { text: '道声辛苦', effect: { moral: 3 }, result: '老更夫咧开缺牙的嘴笑了。' },
      { text: '走开', effect: {}, result: '更声渐远。' }
    ] },
  { id: 'e78', name: '卖糖人的老汉', weight: 2,
    desc: '一位老汉捏糖人，捏得惟妙惟肖。你走近一看，其中一个糖人，竟和你长得一模一样。',
    choices: [
      { text: '买下那个"你"', effect: { gold: -3, per: { ming: 5 } }, result: '"客官好眼力。"老汉笑着把糖人递来，"这世间，本就有另一个你。"' },
      { text: '问他何时捏的', effect: { per: { ming: 8 } }, result: '老汉头也不抬："老朽从没见过你，只是照着心里想的捏。"' },
      { text: '走开', effect: { per: { qing: -3 } }, result: '糖香飘来，你却觉得后颈发凉。' }
    ] },
  { id: 'e79', name: '无面之人', weight: 1,
    desc: '巷口站着一人，背对着你。待他转过身，你竟看不清他的脸。',
    choices: [
      { text: '上前追问', effect: { per: { ming: 8 } }, result: '那人低声道："无相者，无我相、无人相……"话音未落，人已不见。' },
      { text: '拔剑戒备', effect: { per: { gang: 5 } }, result: '你剑未出鞘，那人已消失得无影无踪。' },
      { text: '快步离开', effect: {}, result: '你后背发凉，不敢回头。' }
    ] },
  { id: 'e80', name: '梦回前世', weight: 1,
    desc: '你打了个盹，梦见自己成了另一个人，在另一片江湖里快意恩仇。',
    choices: [
      { text: '沉浸其中', effect: { per: { ming: -3 }, exp: 40 }, result: '梦醒后，你恍惚分不清今夕何夕。' },
      { text: '试图醒来', effect: { per: { ming: 8 } }, result: '你猛地睁眼，冷汗涔涔。' },
      { text: '记下梦境', effect: { per: { ming: 5 } }, result: '你提笔记下梦境，字字似曾相识。' }
    ] },
  { id: 'e81', name: '会说话的猫', weight: 1,
    desc: '一只黑猫蹲在墙头，竟口吐人言："你终于来了。"',
    choices: [
      { text: '追问', effect: { per: { ming: 8 } }, result: '黑猫歪头："你以为你是醒着的吗？"随即跳墙而去。' },
      { text: '轻抚它', effect: { per: { qing: 5 } }, result: '黑猫享受地眯起眼，再没说话。' },
      { text: '走开', effect: {}, result: '你只当自己听错了。' }
    ] },
  { id: 'e82', name: '重复的一天', weight: 1,
    desc: '你总觉得今日的种种，昨日早已发生过一遍。',
    choices: [
      { text: '仔细辨别', effect: { per: { ming: 10 } }, result: '你记下细节，果然处处吻合——这世界，似乎在重演。' },
      { text: '照旧生活', effect: { per: { ming: -3 } }, result: '你只当自己太累，没往心里去。' },
      { text: '打破循环', effect: { per: { gang: 8 } }, result: '你故意做了件"不该做"的事，心头竟莫名一松。' }
    ] },
  { id: 'e83', name: '镜中人', weight: 1,
    desc: '你在一面古铜镜前驻足，镜中的你，动作竟慢了半拍。',
    choices: [
      { text: '与镜对视', effect: { per: { ming: 10 } }, result: '你与镜中人对视良久，分不清谁在镜里、谁在镜外。' },
      { text: '打碎铜镜', effect: { per: { gang: 8, ming: -3 } }, result: '铜镜碎裂，你心跳如鼓，如释重负。' },
      { text: '转身离开', effect: {}, result: '你不敢再看。' }
    ] },
  { id: 'e84', name: '天裂', weight: 1, levelReq: 30,
    desc: '抬头望去，天边竟裂开一道细缝，缝后是深不见底的空无。',
    choices: [
      { text: '凝神观望', effect: { per: { ming: 10 } }, result: '你凝望良久，那道裂缝又缓缓合拢，仿佛从未存在。' },
      { text: '四处打听', effect: { per: { ming: 5 }, exp: 30 }, result: '你问遍路人，却无人看见那道天裂。' },
      { text: '权当眼花', effect: { per: { ming: -5 } }, result: '你揉了揉眼，不再多想。' }
    ] },
  { id: 'e85', name: '无名墓碑', weight: 2,
    desc: '荒草丛中，立着一块无字墓碑，风雨侵蚀，年月难考。',
    choices: [
      { text: '祭拜', effect: { per: { qing: 5 }, moral: 3 }, result: '你恭敬一拜，摆上野花。' },
      { text: '刻上自己的名字', effect: { per: { gang: 5, ming: 3 } }, result: '你刻下名字，恍惚间似在为自己送葬。' },
      { text: '绕道', effect: {}, result: '你不愿惊扰亡魂。' }
    ] },
  { id: 'e86', name: '桃花源', weight: 1,
    desc: '你误入一片桃花林，落英缤纷，恍如世外。',
    choices: [
      { text: '深入其中', effect: { hp: 100, per: { qing: 5 } }, result: '你在桃源中盘桓半日，心旷神怡。' },
      { text: '记下路径', effect: { per: { ming: 5 } }, result: '你默记路径，以备后用。' },
      { text: '退出来路', effect: {}, result: '你怕迷路，退了回来。' }
    ] },
  { id: 'e87', name: '白胡子仙人', weight: 1, levelReq: 35,
    desc: '一位白胡子老者端坐云头，朝你招手。',
    choices: [
      { text: '上前请教', effect: { exp: 150, per: { ming: 8 } }, result: '老者点你一句，你如醍醐灌顶。' },
      { text: '磕头拜师', effect: { exp: 80, talent: 2 }, result: '老者笑而不纳，只赠你半卷心得。' },
      { text: '不信', effect: {}, result: '"缘分未到。"老者拂袖而去。' }
    ] },
  { id: 'e88', name: '空中的钟声', weight: 1,
    desc: '四下无人，却有一声悠远的钟鸣自天边传来。',
    choices: [
      { text: '静心聆听', effect: { per: { ming: 8 } }, result: '钟声涤荡心神，你似有所悟。' },
      { text: '寻钟而去', effect: { per: { ming: 5 } }, result: '你循声而寻，却什么也没找到。' },
      { text: '捂住耳朵', effect: { per: { gang: 3 } }, result: '钟声却直抵心底，挥之不去。' }
    ] },
  { id: 'e89', name: '苗疆蛊市', weight: 1, levelReq: 42, region: 'miaoling',
    desc: '苗疆暗市里，蛊师们摆出千奇百怪的蛊虫，明码标价。',
    choices: [
      { text: '买只灵蛊', effect: { gold: -50, exp: 60 }, result: '你买下一只温养的灵蛊，据说能护主。' },
      { text: '看看热闹', effect: { per: { ming: 3 } }, result: '你大开眼界。' },
      { text: '离开', effect: {}, result: '你怕染上蛊毒，连忙离开。' }
    ] },
  { id: 'e90', name: '青丘狐影', weight: 1, levelReq: 50, region: 'qingqiu',
    desc: '青丘花林间，一道白影一闪而过，似狐似人。',
    choices: [
      { text: '追上去', effect: { per: { gang: 5 }, exp: 40 }, result: '你追至花林深处，却只拾到一缕狐香。' },
      { text: '作揖致意', effect: { per: { qing: 5 } }, result: '你朝林间一揖，似有轻笑声回应。' },
      { text: '不打扰', effect: {}, result: '你悄然退去。' }
    ] },
  { id: 'e91', name: '西域驼队', weight: 1, levelReq: 46, region: 'xiyu',
    desc: '一支西域商队正招募护卫，酬劳丰厚。',
    choices: [
      { text: '应聘护卫', effect: { gold: 150, exp: 60 }, result: '你一路护送商队平安抵达，赚得钵满盆满。' },
      { text: '同行搭伙', effect: { per: { qing: 5 } }, result: '你与商队结伴，听了一路西域奇闻。' },
      { text: '打劫商队', effect: { gold: 200, moral: -10 }, result: '你洗劫了商队，扬长而去。' }
    ] },
  { id: 'e92', name: '昆仑雪崩', weight: 1, levelReq: 62, region: 'kunlun',
    desc: '昆仑山巅，积雪轰然崩落，一队采药人被困雪中。',
    choices: [
      { text: '冒险救人', effect: { moral: 10, rep: 8, per: { xia: 8 } }, result: '你救出数人，自己险些葬身雪崩。' },
      { text: '自保为上', effect: { per: { gang: 5 } }, result: '你退到安全处，默默看雪崩吞没一切。' },
      { text: '记下雪崩规律', effect: { per: { ming: 5 } }, result: '你观察雪崩走势，心有所得。' }
    ] },
  { id: 'e93', name: '东海龙涎', weight: 1, levelReq: 84, region: 'donghai',
    desc: '东海之滨，一块"龙涎香"随浪漂来，异香扑鼻。',
    choices: [
      { text: '捡走', effect: { gold: 300 }, result: '你捡走龙涎香，被富商高价收购。' },
      { text: '献给龙王庙', effect: { moral: 5, per: { qing: 3 } }, result: '你供奉于龙王庙，求得心安。' },
      { text: '不取', effect: {}, result: '你看着它随浪漂远。' }
    ] },
  { id: 'e94', name: '黄泉摆渡', weight: 1, levelReq: 92, region: 'huangquan',
    desc: '忘川河上，一叶孤舟缓缓驶来，艄公无面无口，只伸出一只枯手。',
    choices: [
      { text: '上船', effect: { per: { ming: 8 }, exp: 60 }, result: '你登舟渡河，见到对岸的彼岸花开得妖艳。' },
      { text: '问价钱', effect: { per: { ming: 5 } }, result: '艄公不语，只指了指你的影子。' },
      { text: '退开', effect: {}, result: '你不敢上船，退到岸上。' }
    ] },
  { id: 'e95', name: '天门问路', weight: 1, levelReq: 108, region: 'tianmen',
    desc: '天门之外，一道青铜巨门紧闭，门环上刻满符文。',
    choices: [
      { text: '叩门', effect: { per: { ming: 5 } }, result: '你轻叩门环，门后似有回音，又似无声。' },
      { text: '研读符文', effect: { per: { ming: 10 }, exp: 80 }, result: '你研读符文，若有所悟。' },
      { text: '长拜', effect: { per: { qing: 5 } }, result: '你长身一拜，转身离去。' }
    ] },
  { id: 'e96', name: '华山论剑观礼', weight: 1, levelReq: 66, region: 'huashan',
    desc: '华山之巅，群雄齐聚，论剑大会正酣。',
    choices: [
      { text: '登台论剑', effect: { exp: 100, rep: 8, per: { gang: 5 } }, result: '你登台一试，剑法惊艳四座。' },
      { text: '台下观战', effect: { exp: 60, per: { ming: 3 } }, result: '你观战半日，获益良多。' },
      { text: '离开', effect: {}, result: '人声鼎沸，你悄然退去。' }
    ] },
  { id: 'e97', name: '云梦泽雾舟', weight: 1, levelReq: 8, region: 'yunmeng',
    desc: '云梦泽上雾气弥漫，一叶小舟若隐若现。',
    choices: [
      { text: '登舟泛湖', effect: { per: { qing: 5 }, exp: 30 }, result: '你泛舟湖上，如入仙境。' },
      { text: '观察雾气', effect: { per: { ming: 5 } }, result: '你凝望雾气，似有异兽潜行。' },
      { text: '离开', effect: {}, result: '雾气渐浓，你快步离开。' }
    ] },
  { id: 'e98', name: '黑风寨招安', weight: 1, levelReq: 16, region: 'heifeng',
    desc: '官府张榜招安黑风寨，赏银百两。',
    choices: [
      { text: '上山劝降', effect: { gold: 100, rep: 8, moral: 5 }, result: '你舌灿莲花，竟真劝降了一众山贼。' },
      { text: '入伙山寨', effect: { gold: 80, moral: -8 }, result: '你反其道而行，落草为寇。' },
      { text: '置身事外', effect: {}, result: '你绕道而行。' }
    ] },
  { id: 'e99', name: '峨眉素斋', weight: 1, levelReq: 26, region: 'emei',
    desc: '峨眉山上一间素斋馆，斋菜清香扑鼻。',
    choices: [
      { text: '吃顿斋饭', effect: { hp: 60, per: { qing: 3 } }, result: '你吃了顿斋饭，神清气爽。' },
      { text: '布施香火', effect: { gold: -20, moral: 5 }, result: '你布施香火，求得心安。' },
      { text: '离开', effect: {}, result: '你急着赶路。' }
    ] },
  { id: 'e100', name: '江湖百晓生', weight: 2,
    desc: '一位自称"百晓生"的怪人凑上来："天下事，无有不知，只换你几两碎银。"',
    choices: [
      { text: '买条情报', effect: { gold: -30, per: { ming: 8 } }, result: '你买得一条隐秘情报，心中豁然。' },
      { text: '卖他情报', effect: { gold: 30, per: { ming: 3 } }, result: '你反手卖他一条"独家"，赚了笔小钱。' },
      { text: '闲聊', effect: { per: { qing: 3 } }, result: '你与他天南海北聊了半日。' }
    ] },
  { id: 'e101', name: '白纸黑字', weight: 1,
    desc: '你在旧书摊买到一本空白的书，每一页都雪白无字。',
    choices: [
      { text: '对着光看', effect: { per: { ming: 10 } }, result: '你把书页对着光，隐隐现出四个字：「你已入局」。' },
      { text: '蘸水显字', effect: { per: { ming: 5 } }, result: '你蘸水一涂，字迹浮现又淡去，只来得及看清一个「无」字。' },
      { text: '烧了它', effect: { per: { gang: 5 } }, result: '书页烧成灰，灰烬里却爬出几行字，又随风散了。' }
    ] },

  // ============================================================
  //  多层偶发事件（层数越多，奖励越好）
  //  二层：一层子对话；三层：两层子对话（极小概率获功法/装备）；四层：三层子对话（概率更高）
  // ============================================================

  // ---------- 两层事件 ----------
  { id: 'e201', name: '落魄书生卖画', weight: 2, scenes: ['village', 'town'],
    desc: '一个落魄书生摆摊卖画，画上却只有一片留白。',
    choices: [
      { text: '买下这幅画', effect: { gold: -15, per: { qing: 3 } }, result: '书生感激涕零，你买下一幅「无字画」。' },
      { text: '问他为何只画留白', sub: {
        desc: '书生苦笑：「满纸烟云，不如一片留白。公子可知，人生何处不是留白？」',
        choices: [
          { text: '点拨他一句', effect: { exp: 15, per: { ming: 4 } }, result: '书生若有所思，向你深鞠一躬。' },
          { text: '请他讲讲往事', effect: { per: { qing: 4 } }, result: '书生说起家道中落，你听他讲完，赠他几句宽慰。' }
        ] } }
    ] },
  { id: 'e202', name: '樵夫指路', weight: 2,
    desc: '山道上，一个樵夫挑着柴，哼着小调。',
    choices: [
      { text: '问路', effect: { exp: 10 }, result: '樵夫热心地给你指了条近路。' },
      { text: '帮他挑一程', sub: {
        desc: '樵夫摆摆手：「不敢劳烦少侠。」又打量你一番。',
        choices: [
          { text: '坚持帮忙', effect: { per: { xia: 3 }, moral: 2 }, result: '你帮他把柴挑到村口，他硬塞给你几个野果。' },
          { text: '结伴同行', effect: { per: { qing: 3 } }, result: '一路闲聊，你得知了不少山里的传闻。' }
        ] } }
    ] },
  { id: 'e203', name: '迷路的老妪', weight: 2,
    desc: '一个老妪在岔路口张望，面露难色。',
    choices: [
      { text: '送她回家', effect: { moral: 3, rep: 2 }, result: '老妪连声道谢，硬塞给你一枚铜钱。' },
      { text: '问她去哪', sub: {
        desc: '老妪说要去山那边的寺庙还愿，却记不清路。',
        choices: [
          { text: '指路', effect: { per: { xia: 3 } }, result: '你指了方向，老妪蹒跚而去。' },
          { text: '亲自送她', effect: { moral: 5, rep: 3, per: { xia: 5 } }, result: '你一路护送，老妪在寺门前化作一缕青烟，只留一句「福缘深厚」。' }
        ] } }
    ] },
  { id: 'e204', name: '卖唱的孤女', weight: 2,
    desc: '街角，一个孤女抱着琵琶卖唱，曲声凄婉。',
    choices: [
      { text: '打赏', effect: { gold: -10, moral: 2 }, result: '孤女向你欠身，眼中含泪。' },
      { text: '点一首曲子', sub: {
        desc: '孤女问你想听什么。',
        choices: [
          { text: '听《望归》', effect: { per: { qing: 4 } }, result: '一曲终了，你心头一酸。' },
          { text: '问她为何流落', effect: { per: { qing: 5 } }, result: '孤女诉起身世，你听完沉默良久。' }
        ] } }
    ] },
  { id: 'e205', name: '镖局镖师', weight: 2, scenes: ['village', 'town'],
    desc: '一个镖师在路边包扎伤口，镖车翻在沟里。',
    choices: [
      { text: '帮忙扶车', effect: { per: { xia: 3 }, rep: 2 }, result: '镖师抱拳致谢。' },
      { text: '询问经过', sub: {
        desc: '镖师叹了口气：「遇到山匪了，折了两个兄弟。」',
        choices: [
          { text: '追查山匪', effect: { exp: 30, gold: 20 }, result: '你循迹追去，夺回了部分镖银，镖师感激不尽。' },
          { text: '劝他保重', effect: { per: { qing: 3 } }, result: '镖师点头，说江湖险恶，各自珍重。' }
        ] } }
    ] },
  { id: 'e206', name: '采药人', weight: 2,
    desc: '悬崖边，一个采药人正攀着藤蔓采药。',
    choices: [
      { text: '提醒他危险', effect: { per: { xia: 2 } }, result: '采药人冲你一笑，说无妨。' },
      { text: '帮他采药', sub: {
        desc: '采药人说崖上有一株灵芝，他够不着。',
        choices: [
          { text: '帮他摘', effect: { exp: 25, hp: 20 }, result: '你帮他采下灵芝，他分你一半，还说这草能提神。' },
          { text: '观望', effect: {}, result: '你看了会儿，继续赶路。' }
        ] } }
    ] },
  { id: 'e207', name: '夜宿荒村', weight: 2,
    desc: '天色已晚，你投宿一处荒村，村口挂着白灯笼。',
    choices: [
      { text: '找户人家借宿', effect: { hp: 30 }, result: '你借宿一晚，睡了个安稳觉。' },
      { text: '一探究竟', sub: {
        desc: '你循着微光走进村中，只见一座祠堂。',
        choices: [
          { text: '推门而入', effect: { exp: 30, per: { ming: 4 } }, result: '祠堂里供着无名牌位，你上了炷香，心有所感。' },
          { text: '退出来', effect: {}, result: '你越想越瘆人，连夜离开了。' }
        ] } }
    ] },
  { id: 'e208', name: '江湖郎中义诊', weight: 2,
    desc: '一个郎中在路边义诊，排队的人不少。',
    choices: [
      { text: '排队问诊', effect: { hp: 40 }, result: '郎中给你把了脉，说气血两虚，赠你两副药。' },
      { text: '帮忙维持秩序', sub: {
        desc: '郎中忙得满头大汗，见你伸手相助，连声道谢。',
        choices: [
          { text: '打下手', effect: { moral: 3, rep: 2 }, result: '你帮了一下午，乡民对你交口称赞。' },
          { text: '请教医术', effect: { exp: 25, per: { ming: 3 } }, result: '郎中指点了你几手急救的法子。' }
        ] } }
    ] },

  // ---------- 三层事件（极小概率获功法/装备） ----------
  { id: 'e301', name: '山中隐士', weight: 2, giver: '隐士',
    desc: '云雾深处，一个白衣隐士在松下抚琴。',
    choices: [
      { text: '驻足聆听', effect: { exp: 30, per: { qing: 4 } }, result: '琴声清越，你心绪宁静。' },
      { text: '上前请教', sub: {
        desc: '隐士未睁眼，只道：「来者是客，所问何事？」',
        choices: [
          { text: '问武学', sub: {
            desc: '隐士按弦道：「武学之道，在精不在多。」',
            choices: [
              { text: '虚心求教', effect: { exp: 60, per: { ming: 6 } }, result: '隐士为你解惑，你茅塞顿开。' },
              { text: '求他一招', effect: { exp: 40, per: { gang: 4 } }, result: '隐士随手比划一招，你如获至宝。' }
            ] } },
          { text: '问人生', sub: {
            desc: '隐士叹道：「人生如梦，何必较真。」',
            choices: [
              { text: '请他开解', effect: { per: { ming: 6, qing: 3 } }, result: '一席话让你看淡了许多事。' },
              { text: '与他论道', effect: { per: { ming: 5 } }, result: '你与他论了半日，各有收获。' }
            ] } }
        ] } }
    ] },
  { id: 'e302', name: '破庙老僧', weight: 2, giver: '老僧',
    desc: '破庙里，一个老僧在漏雨的佛像前打坐。',
    choices: [
      { text: '捐些香火', effect: { moral: 3 }, result: '老僧合十道谢。' },
      { text: '上前问禅', sub: {
        desc: '老僧睁眼，眼中无悲无喜。',
        choices: [
          { text: '问心中所执', sub: {
            desc: '老僧道：「执着是苦，放下即空。」',
            choices: [
              { text: '参悟', effect: { per: { ming: 8 } }, result: '你似懂非懂，心头却轻了三分。' },
              { text: '追问', effect: { per: { ming: 5, gang: 3 } }, result: '老僧摇头，说你火候未到。' }
            ] } },
          { text: '请他讲经', sub: {
            desc: '老僧念起一段经文。',
            choices: [
              { text: '静心聆听', effect: { mp: 30, per: { qing: 4 } }, result: '经文入耳，你神清气爽。' },
              { text: '与他辩法', effect: { per: { ming: 6 } }, result: '你与老僧辩了几句，各有领悟。' }
            ] } }
        ] } }
    ] },
  { id: 'e303', name: '剑冢守墓人', weight: 2, giver: '守墓人',
    desc: '剑冢前，一个佝偻的守墓人扫着落叶。',
    choices: [
      { text: '凭吊一番', effect: { per: { qing: 3 } }, result: '你在冢前默立，感怀前贤。' },
      { text: '询问剑冢来历', sub: {
        desc: '守墓人停下扫帚，目光悠远。',
        choices: [
          { text: '问埋剑之人', sub: {
            desc: '守墓人道：「这里埋的，都是断了剑心的剑客。」',
            choices: [
              { text: '静听往事', effect: { per: { qing: 6 } }, result: '守墓人讲起一段段悲壮往事。' },
              { text: '问剑心为何', effect: { per: { ming: 5 } }, result: '守墓人道：「剑心者，执念也。」' }
            ] } },
          { text: '求一柄剑', sub: {
            desc: '守墓人看了你一眼：「剑冢之剑，不轻易许人。」',
            choices: [
              { text: '表明诚意', effect: { exp: 50 }, result: '守墓人点头，说看你心性尚可。' },
              { text: '以武会友', effect: { exp: 40, per: { gang: 5 } }, result: '你与守墓人切磋几招，他赞你底子不错。' }
            ] } }
        ] } }
    ] },
  { id: 'e304', name: '药庐女医', weight: 2, giver: '女医',
    desc: '深山药庐外，一个女医正在晒药。',
    choices: [
      { text: '求一味药', effect: { hp: 40 }, result: '女医包了一副药给你。' },
      { text: '帮忙整理药材', sub: {
        desc: '女医见你手脚麻利，让你搭把手。',
        choices: [
          { text: '学习药理', sub: {
            desc: '女医指着几味药，一一讲解。',
            choices: [
              { text: '认真听讲', effect: { exp: 50, per: { ming: 5 } }, result: '你记下了不少药理。' },
              { text: '亲口尝药', effect: { exp: 30, hp: 20, per: { ming: 3 } }, result: '你尝了几味，苦得直皱眉。' }
            ] } },
          { text: '问疑难杂症', sub: {
            desc: '女医沉吟道：「你问的，倒有些门道。」',
            choices: [
              { text: '请教调理之法', effect: { hp: 50, exp: 20 }, result: '女医教了你一套调息之法。' },
              { text: '请她出山', effect: { rep: 3 }, result: '女医摇头，说医者自在山林。' }
            ] } }
        ] } }
    ] },
  { id: 'e305', name: '茶棚老人', weight: 2, giver: '老人',
    desc: '茶棚里，一个老人慢悠悠地煮茶。',
    choices: [
      { text: '讨碗茶喝', effect: { hp: 20 }, result: '老人给你倒了碗粗茶。' },
      { text: '与他对坐', sub: {
        desc: '老人笑呵呵道：「小友，坐下来聊聊？」',
        choices: [
          { text: '聊江湖事', sub: {
            desc: '老人抚须：「这江湖啊，水可深着呢。」',
            choices: [
              { text: '听他讲古', effect: { exp: 45, per: { ming: 5 } }, result: '老人讲起旧年秘闻，你听得入神。' },
              { text: '请教处世之道', effect: { per: { ming: 6, qing: 2 } }, result: '老人说了八个字：外圆内方。' }
            ] } },
          { text: '问他为何在此', sub: {
            desc: '老人道：「等一个有缘人，喝最后一碗茶。」',
            choices: [
              { text: '说「我来了」', effect: { exp: 40, per: { qing: 4 } }, result: '老人大笑，说缘分到了。' },
              { text: '默默品茶', effect: { per: { qing: 5 } }, result: '一碗茶下肚，百般滋味。' }
            ] } }
        ] } }
    ] },
  { id: 'e306', name: '说书先生', weight: 2, giver: '说书先生',
    desc: '茶馆里，说书先生醒木一拍，满堂喝彩。',
    choices: [
      { text: '听一段书', effect: { per: { qing: 3 } }, result: '你听了一段快意恩仇。' },
      { text: '散场后请教', sub: {
        desc: '说书先生收拾行头，见你还没走。',
        choices: [
          { text: '问书中真伪', sub: {
            desc: '说书先生狡黠一笑：「三分真，七分编。」',
            choices: [
              { text: '追根问底', effect: { per: { ming: 6 } }, result: '他透露了几个「真」的关节。' },
              { text: '一笑置之', effect: { per: { qing: 4 } }, result: '你付之一笑，真假何必较真。' }
            ] } },
          { text: '问他可会武', sub: {
            desc: '说书先生折扇一合：「会一点防身。」',
            choices: [
              { text: '讨教两招', effect: { exp: 45, per: { gang: 4 } }, result: '他教了你几手扇功。' },
              { text: '邀他比试', effect: { exp: 35 }, result: '你与他点到即止，各退一步。' }
            ] } }
        ] } }
    ] },
  { id: 'e307', name: '猎户', weight: 2, giver: '猎户',
    desc: '山坳里，一个猎户正在收拾猎物。',
    choices: [
      { text: '买些野味', effect: { gold: -15, hp: 25 }, result: '你买了点野味，烤熟吃了。' },
      { text: '打听山中情况', sub: {
        desc: '猎户抹了把汗：「山里最近不太平。」',
        choices: [
          { text: '问有何异动', sub: {
            desc: '猎户压低声音：「有只吊睛白额大虫，吃了不少人。」',
            choices: [
              { text: '自告奋勇除害', effect: { exp: 60, rep: 5, per: { xia: 6 } }, result: '你进山除虎，猎户对你敬佩不已。' },
              { text: '提醒他小心', effect: { per: { xia: 3 } }, result: '猎户点头，说会加倍提防。' }
            ] } },
          { text: '问他打猎诀窍', sub: {
            desc: '猎户笑道：「打猎靠的是眼力和耐心。」',
            choices: [
              { text: '虚心请教', effect: { exp: 40, per: { ming: 4 } }, result: '你学了些追踪辨迹的法子。' },
              { text: '跟他进山', effect: { exp: 50 }, result: '你随他进山，收获不少。' }
            ] } }
        ] } }
    ] },
  { id: 'e308', name: '云游道人', weight: 2, giver: '道人',
    desc: '道旁，一个云游道人摆摊算卦。',
    choices: [
      { text: '算一卦', effect: { gold: -10, per: { ming: 3 } }, result: '道人算出你近日有「小劫」。' },
      { text: '与他论道', sub: {
        desc: '道人捋须：「施主眉宇间有煞气，也有道缘。」',
        choices: [
          { text: '问前程', sub: {
            desc: '道人掐指一算：「险中求，破而后立。」',
            choices: [
              { text: '请他详解', effect: { per: { ming: 6 } }, result: '道人点破几句，你似有所悟。' },
              { text: '半信半疑', effect: {}, result: '你未置可否，道人也不恼。' }
            ] } },
          { text: '问修行法门', sub: {
            desc: '道人道：「道法自然，不必强求。」',
            choices: [
              { text: '静心请教', effect: { exp: 50, mp: 25 }, result: '道人授你一套吐纳之法。' },
              { text: '与他辩道', effect: { per: { ming: 5, gang: 3 } }, result: '你与他辩了几句，各有心得。' }
            ] } }
        ] } }
    ] },
  { id: 'e309', name: '丐帮长老', weight: 2, giver: '长老',
    desc: '破庙外，一个衣衫褴褛却气度不凡的老丐席地而坐。',
    choices: [
      { text: '施舍些银钱', effect: { moral: 3 }, result: '老丐冲你点点头。' },
      { text: '攀谈', sub: {
        desc: '老丐笑道：「小友，看你也是江湖人。」',
        choices: [
          { text: '问丐帮近况', sub: {
            desc: '老丐叹道：「帮中内斗，一言难尽。」',
            choices: [
              { text: '打听内幕', effect: { exp: 40, per: { ming: 5 } }, result: '你听到不少帮中秘辛。' },
              { text: '劝他宽心', effect: { per: { qing: 4 } }, result: '老丐笑说：「你倒会宽慰人。」' }
            ] } },
          { text: '请他指点武功', sub: {
            desc: '老丐上下打量你：「看你根基不错。」',
            choices: [
              { text: '虚心求教', effect: { exp: 55, per: { gang: 4 } }, result: '老丐指点了你几处拳脚关窍。' },
              { text: '以武会友', effect: { exp: 45, per: { gang: 5 } }, result: '你与老丐过了几招，受益良多。' }
            ] } }
        ] } }
    ] },
  { id: 'e310', name: '苗疆少女', weight: 2, giver: '少女',
    desc: '苗寨外，一个戴着银饰的少女正在采花。',
    choices: [
      { text: '问路', effect: { exp: 10 }, result: '少女给你指了路。' },
      { text: '攀谈', sub: {
        desc: '少女眨眨眼：「外乡人，你来苗疆做什么？」',
        choices: [
          { text: '说寻访故人', sub: {
            desc: '少女来了兴致：「故人？说来听听。」',
            choices: [
              { text: '如实相告', effect: { per: { qing: 5 } }, result: '少女听完，说可以帮你打听。' },
              { text: '含糊其辞', effect: {}, result: '少女撇撇嘴，不再多问。' }
            ] } },
          { text: '请教蛊术', sub: {
            desc: '少女狡黠一笑：「你想学蛊？可没那么容易。」',
            choices: [
              { text: '表明诚意', effect: { exp: 45, per: { ming: 5 } }, result: '少女教了你几手防蛊的偏方。' },
              { text: '用礼物交换', effect: { gold: -20, exp: 35 }, result: '你送她些小玩意，她教了你一招。' }
            ] } }
        ] } }
    ] },
  { id: 'e311', name: '铸剑师', weight: 2, giver: '铸剑师',
    desc: '铁匠铺里，一个铸剑师正挥锤如雨。',
    choices: [
      { text: '观摩打铁', effect: { per: { gang: 3 } }, result: '你看得热血沸腾。' },
      { text: '请教铸剑', sub: {
        desc: '铸剑师擦擦汗：「想学？先吃得了苦。」',
        choices: [
          { text: '帮忙拉风箱', sub: {
            desc: '你帮了半天忙，铸剑师神色缓和。',
            choices: [
              { text: '继续求教', effect: { exp: 55, per: { gang: 5 } }, result: '铸剑师教你辨铁识材的法子。' },
              { text: '讨一柄剑', effect: { gold: -50, item: 'random' }, result: '铸剑师卖你一柄刚出炉的好兵器。' }
            ] } },
          { text: '问名剑下落', sub: {
            desc: '铸剑师眼中精光一闪：「名剑，都是有主的。」',
            choices: [
              { text: '追问', effect: { exp: 40, per: { ming: 4 } }, result: '他透露了某柄名剑的去向。' },
              { text: '作罢', effect: {}, result: '你不再追问，转身离开。' }
            ] } }
        ] } }
    ] },
  { id: 'e312', name: '商队掌柜', weight: 2, scenes: ['village', 'town'], giver: '掌柜',
    desc: '商队歇脚，一个胖掌柜正在清点货物。',
    choices: [
      { text: '打听行情', effect: { per: { ming: 3 } }, result: '你了解到不少行情。' },
      { text: '套近乎', sub: {
        desc: '掌柜笑呵呵地请你喝茶。',
        choices: [
          { text: '谈合作', sub: {
            desc: '掌柜眼睛一亮：「少侠若肯护镖，价钱好说。」',
            choices: [
              { text: '接下这单', effect: { gold: 60, rep: 3 }, result: '你护送商队一程，赚了笔辛苦钱。' },
              { text: '婉拒', effect: {}, result: '你婉言谢绝。' }
            ] } },
          { text: '问西域见闻', sub: {
            desc: '掌柜眉飞色舞地讲起西域风情。',
            choices: [
              { text: '听个新鲜', effect: { exp: 40, per: { qing: 4 } }, result: '你听得津津有味。' },
              { text: '追问商机', effect: { exp: 30, per: { ming: 4 } }, result: '掌柜透露了几条生财门路。' }
            ] } }
        ] } }
    ] },

  // ---------- 四层事件（获功法/装备概率更高） ----------
  { id: 'e401', name: '剑圣残魂', weight: 2, giver: '剑圣残魂',
    desc: '华山之巅，剑意凝而不散，似有残魂低语。',
    choices: [
      { text: '凝神细听', effect: { per: { ming: 6 } }, result: '你仿佛听见一声剑鸣。' },
      { text: '循剑意而去', sub: {
        desc: '你循剑意而行，只见一柄断剑插于石上。',
        choices: [
          { text: '拔剑', sub: {
            desc: '断剑嗡鸣，一道身影浮现。',
            choices: [
              { text: '问他是谁', sub: {
                desc: '身影道：「一缕残魂，剑圣之名，早已随风。」',
                choices: [
                  { text: '请教剑道', effect: { exp: 90, per: { ming: 8, gang: 4 } }, result: '残魂为你演练一剑，你如醍醐灌顶。' },
                  { text: '执礼以谢', effect: { per: { qing: 5 } }, result: '你深鞠一躬，残魂颔首而散。' }
                ] } },
              { text: '挥剑一试', effect: { exp: 70, per: { gang: 6 } }, result: '你借断剑挥出一剑，剑意森然。' }
            ] } },
          { text: '静坐感悟', effect: { exp: 50, per: { ming: 6 } }, result: '你在石前静坐，剑意入心。' }
        ] } }
    ] },
  { id: 'e402', name: '扫地僧', weight: 2, giver: '扫地僧',
    desc: '藏经阁前，一个扫地僧扫得极慢，落叶却不沾衣。',
    choices: [
      { text: '帮他扫地', effect: { per: { qing: 4 } }, result: '扫地僧道了声谢。' },
      { text: '问藏经阁可否入内', sub: {
        desc: '扫地僧抬头：「经书在阁，佛在心。」',
        choices: [
          { text: '论禅', sub: {
            desc: '扫地僧道：「扫的是地，净的是心。」',
            choices: [
              { text: '求他点化', sub: {
                desc: '扫地僧叹道：「你心中执念太深。」',
                choices: [
                  { text: '追问何解', effect: { per: { ming: 10 } }, result: '扫地僧只道「放下」二字，你却如遭雷击。' },
                  { text: '默然受教', effect: { per: { qing: 6, ming: 4 } }, result: '你垂手而立，心渐沉静。' }
                ] } },
              { text: '问武功', sub: {
                desc: '扫地僧道：「武功是末技。」',
                choices: [
                  { text: '仍想请教', effect: { exp: 80, per: { gang: 5 } }, result: '扫地僧随手一掌，落叶成圈，你叹为观止。' },
                  { text: '作罢', effect: {}, result: '你不再多问。' }
                ] } }
            ] } },
          { text: '求阅经书', effect: { exp: 60, per: { ming: 6 } }, result: '扫地僧让开身，你入阁阅经半日。' }
        ] } }
    ] },
  { id: 'e403', name: '狐仙', weight: 2, giver: '狐仙',
    desc: '青丘月下，一个白衣女子回眸一笑，媚态天成。',
    choices: [
      { text: '移开目光', effect: { per: { ming: 5 } }, result: '你稳住心神，不为所动。' },
      { text: '上前搭话', sub: {
        desc: '女子轻笑：「公子深夜到此，可是寻奴家？」',
        choices: [
          { text: '问她是人是妖', sub: {
            desc: '女子不答，只问：「是人如何，是妖又如何？」',
            choices: [
              { text: '说众生平等', sub: {
                desc: '女子眸光微动：「你倒与众不同。」',
                choices: [
                  { text: '听她讲故事', effect: { per: { qing: 8 } }, result: '女子讲起青丘旧事，如泣如诉。' },
                  { text: '讨一份缘', effect: { exp: 70, per: { qing: 6 } }, result: '女子赠你一枚狐毛，说有缘再会。' }
                ] } },
              { text: '直言不讳', effect: { per: { gang: 5, ming: 4 } }, result: '女子被你的直率逗笑。' }
            ] } },
          { text: '问她为何在此', effect: { exp: 40, per: { qing: 5 } }, result: '女子笑而不答，化风而去。' }
        ] } }
    ] },
  { id: 'e404', name: '隐世高人', weight: 2, giver: '高人',
    desc: '深谷幽潭边，一个蓑衣人独坐垂钓。',
    choices: [
      { text: '远远观望', effect: { per: { ming: 4 } }, result: '你观他垂钓，若有所感。' },
      { text: '上前攀谈', sub: {
        desc: '蓑衣人头也不回：「鱼儿不上钩，客人却来了。」',
        choices: [
          { text: '问所钓为何', sub: {
            desc: '蓑衣人道：「钓的是缘，不是鱼。」',
            choices: [
              { text: '深问下去', sub: {
                desc: '蓑衣人淡淡道：「缘来则聚，缘去则散。」',
                choices: [
                  { text: '求指一条明路', effect: { exp: 90, per: { ming: 10 } }, result: '蓑衣人点你一句，你豁然开朗。' },
                  { text: '静坐同钓', effect: { per: { qing: 8 } }, result: '你与他同钓半日，心境澄明。' }
                ] } },
              { text: '求教武学', effect: { exp: 80, per: { gang: 5 } }, result: '蓑衣人露了一手，你叹为观止。' }
            ] } },
          { text: '问江湖大势', effect: { exp: 60, per: { ming: 6 } }, result: '蓑衣人寥寥数语，道破天机。' }
        ] } }
    ] },
  { id: 'e405', name: '黄泉摆渡人', weight: 2, giver: '摆渡人',
    desc: '忘川河畔，一叶孤舟，摆渡人蓑笠遮面。',
    choices: [
      { text: '乘船渡河', effect: { per: { qing: 4 } }, result: '摆渡人默默摇橹。' },
      { text: '问彼岸之事', sub: {
        desc: '摆渡人声音沙哑：「生人莫问，问了便难回头。」',
        choices: [
          { text: '执意要问', sub: {
            desc: '摆渡人叹道：「既如此，便说与你听。」',
            choices: [
              { text: '问生死', sub: {
                desc: '摆渡人道：「死是生的倒影。」',
                choices: [
                  { text: '继续深问', effect: { per: { ming: 8 } }, result: '摆渡人只道「回头是岸」，你心头一震。' },
                  { text: '谢过登岸', effect: { per: { qing: 4 } }, result: '你登岸而去，恍如隔世。' }
                ] } },
              { text: '问前尘', effect: { per: { qing: 6 } }, result: '摆渡人讲起忘川旧事，你心头一凛。' }
            ] } },
          { text: '请他渡有缘人', sub: {
            desc: '摆渡人道：「渡人易，渡己难。」',
            choices: [
              { text: '求他点拨', effect: { exp: 75, per: { ming: 8 } }, result: '摆渡人一句「回头是岸」，你如受当头棒喝。' },
              { text: '默然离去', effect: {}, result: '你转身离去，身后水声潺潺。' }
            ] } }
        ] } }
    ] },
  { id: 'e406', name: '天机老人', weight: 2, giver: '天机老人',
    desc: '观星台上，一个白发老人夜观天象。',
    choices: [
      { text: '静静旁观', effect: { per: { ming: 5 } }, result: '你随他仰望星河。' },
      { text: '上前请教', sub: {
        desc: '老人道：「天机不可轻泄，但可一问。」',
        choices: [
          { text: '问天机', sub: {
            desc: '老人指着一颗星：「那便是你的命星。」',
            choices: [
              { text: '请他说破', sub: {
                desc: '老人叹道：「命由己造，何须问我。」',
                choices: [
                  { text: '追问如何改命', effect: { exp: 80, per: { ming: 8 } }, result: '老人教你「积善改运」四字。' },
                  { text: '默然受教', effect: { per: { qing: 5 } }, result: '你仰观星河，若有所思。' }
                ] } },
              { text: '问天下大势', effect: { exp: 70, per: { ming: 6 } }, result: '老人透露只言片语，你暗自心惊。' }
            ] } },
          { text: '谢过离去', effect: {}, result: '你谢过老人，心情沉重。' }
        ] } }
    ] },
  { id: 'e407', name: '剑冢剑灵', weight: 2, giver: '剑灵',
    desc: '剑冢深处，万千断剑共鸣，一柄古剑腾空而起。',
    choices: [
      { text: '伸手接剑', effect: { per: { gang: 5 } }, result: '古剑绕你三匝，似有灵性。' },
      { text: '与剑对话', sub: {
        desc: '古剑中传来一个清冷的声音：「凡人，为何扰我安眠？」',
        choices: [
          { text: '说明来意', sub: {
            desc: '剑灵道：「想得我认主，先答我一问。」',
            choices: [
              { text: '听它发问', sub: {
                desc: '剑灵问：「剑为何物？」',
                choices: [
                  { text: '答「护道之器」', effect: { exp: 90, per: { gang: 6 } }, result: '剑灵认可了你，剑意加身。' },
                  { text: '答「杀伐之器」', effect: { exp: 60, per: { xia: -5 } }, result: '剑灵冷哼，说你杀气太重。' }
                ] } },
              { text: '问它过往', effect: { per: { qing: 6 } }, result: '剑灵讲起旧主，语带萧索。' }
            ] } },
          { text: '直接拔剑', effect: { exp: 70, per: { gang: 8 } }, result: '你强行拔剑，剑气凌厉。' }
        ] } }
    ] },
  { id: 'e408', name: '山神', weight: 2, giver: '山神',
    desc: '山巅古庙，一尊石像忽睁双目，竟似活了过来。',
    choices: [
      { text: '虔诚跪拜', effect: { moral: 5 }, result: '石像目光柔和了几分。' },
      { text: '与山神对话', sub: {
        desc: '石像嗡声：「凡人，何所求？」',
        choices: [
          { text: '求护一方平安', sub: {
            desc: '石像道：「心诚则灵。」',
            choices: [
              { text: '立誓行善', sub: {
                desc: '石像道：「誓言如金，切莫违背。」',
                choices: [
                  { text: '郑重起誓', effect: { moral: 8, rep: 5 }, result: '你立下誓言，石像颔首。' },
                  { text: '请教山泽之道', effect: { exp: 75, per: { ming: 8 } }, result: '山神授你观山辨势之法。' }
                ] } },
              { text: '求一个机缘', effect: { exp: 70, per: { ming: 6 } }, result: '山神道「机缘在你脚下」，你低头一瞬，若有所悟。' }
            ] } },
          { text: '追问', effect: { exp: 60 }, result: '石像不再言语，重归寂静。' }
        ] } }
    ] },

  // ============================================================
  //  场景化偶发事件（scenes=可出现的场景；levelReq=等级门槛；越高越光怪陆离）
  // ============================================================
  { id: 'n1', name: '算命先生', weight: 2, scenes: ['village', 'town'],
    desc: '一个算命先生摆摊，见你便道：「少侠印堂发亮，近日有奇遇。」',
    choices: [
      { text: '算一卦', effect: { gold: -5, per: { ming: 3 } }, result: '他掐指一算，说了句「逢凶化吉」。' },
      { text: '笑而不语', effect: {}, result: '你转身便走，他在身后喊「卦金未付」。' },
      { text: '拆他招牌', effect: { per: { gang: 4 } }, result: '他急得跳脚，围观众人哈哈大笑。' }
    ] },
  { id: 'n2', name: '追鸡的孩子', weight: 2, scenes: ['village'],
    desc: '一个稚童追着一只鸡满村跑，鸡飞狗跳。',
    choices: [
      { text: '帮忙抓鸡', effect: { exp: 8, per: { xia: 2 } }, result: '你一把逮住，小孩冲你咧嘴一笑。' },
      { text: '看热闹', effect: {}, result: '鸡跳上了房，孩子哇哇大哭。' },
      { text: '买下那只鸡', effect: { gold: -10, hp: 15 }, result: '你拎着鸡走，孩子破涕为笑。' }
    ] },
  { id: 'n3', name: '卖糖人的老汉', weight: 2, scenes: ['village', 'town'],
    desc: '一个老汉挑着糖人担子，捏的孙悟空惟妙惟肖。',
    choices: [
      { text: '买一个', effect: { gold: -3, per: { qing: 2 } }, result: '糖人甜得你眯起眼。' },
      { text: '夸他手艺', effect: { per: { qing: 3 } }, result: '老汉一乐，多送了你一个小糖人。' },
      { text: '问手艺来源', effect: { per: { ming: 3 } }, result: '老汉说这是祖传三代的营生。' }
    ] },
  { id: 'n4', name: '河边洗衣妇', weight: 2, scenes: ['village', 'water'],
    desc: '河边几个妇人边洗衣边闲聊，笑声不断。',
    choices: [
      { text: '讨碗水喝', effect: { hp: 10 }, result: '妇人递来一碗清水，清凉解渴。' },
      { text: '听她们闲聊', effect: { per: { qing: 3, ming: 2 } }, result: '你听到不少村里的家长里短。' },
      { text: '绕开', effect: {}, result: '你怕打扰，绕路而行。' }
    ] },
  { id: 'n5', name: '更夫报时', weight: 2, scenes: ['town'],
    desc: '深夜，更夫敲着梆子喊「天干物燥，小心火烛」。',
    choices: [
      { text: '问他还平安否', effect: { per: { qing: 3 } }, result: '更夫苦笑：「这年头，能平安就是福。」' },
      { text: '讨个提醒', effect: { exp: 10, per: { ming: 3 } }, result: '他告诉你最近城里来了几个生面孔。' },
      { text: '默默走过', effect: {}, result: '梆子声渐行渐远。' }
    ] },
  { id: 'n6', name: '当铺掌柜', weight: 2, scenes: ['town'],
    desc: '当铺掌柜拨着算盘，见你进门，抬了抬眼皮。',
    choices: [
      { text: '问问行情', effect: { per: { ming: 4 } }, result: '他报了几个价，滴水不漏。' },
      { text: '卖个旧物', effect: { gold: 15 }, result: '你卖掉一件旧物，小赚一笔。' },
      { text: '打探消息', effect: { gold: -5, per: { ming: 5 } }, result: '他压低声音，透露了条地头蛇的消息。' }
    ] },
  { id: 'n7', name: '耍猴艺人', weight: 2, scenes: ['town'],
    desc: '街头一个耍猴艺人，猴子冲你作揖讨赏。',
    choices: [
      { text: '赏几文钱', effect: { gold: -3, per: { qing: 3 } }, result: '猴子接过铜钱，还冲你鞠了个躬。' },
      { text: '看它耍把式', effect: { per: { qing: 3 } }, result: '猴子翻着跟头，逗得满场大笑。' },
      { text: '问艺人来历', effect: { per: { ming: 3 } }, result: '艺人说走南闯北，靠这猴儿讨生活。' }
    ] },
  { id: 'n8', name: '客栈闹贼', weight: 2, scenes: ['town'],
    desc: '客栈里一阵骚动，原来是有小贼摸走了客人的钱袋。',
    choices: [
      { text: '出手擒贼', effect: { exp: 20, rep: 3, per: { xia: 4 } }, result: '你三两步追上，把钱袋夺了回来。' },
      { text: '提醒众人', effect: { per: { xia: 3 } }, result: '众人惊醒，小贼趁乱跑了。' },
      { text: '看好自己的钱', effect: {}, result: '你摸了摸腰间，还在。' }
    ] },
  { id: 'n9', name: '狼群拦路', weight: 2, scenes: ['wild'],
    desc: '山道上，几双绿幽幽的眼睛在暗处盯着你。',
    choices: [
      { text: '举火驱狼', effect: { exp: 15, per: { gang: 3 } }, result: '狼群忌惮火光，缓缓退去。' },
      { text: '绕道而行', effect: { per: { ming: 3 } }, result: '你多绕了十里山路。' },
      { text: '主动出击', effect: { exp: 25, gold: 10 }, result: '你驱散狼群，捡到几块狼皮。' }
    ] },
  { id: 'n10', name: '悬崖灵芝', weight: 2, scenes: ['wild'],
    desc: '悬崖峭壁上，一株灵芝在风中摇曳，药香隐隐。',
    choices: [
      { text: '冒险去采', effect: { exp: 25, hp: 30 }, result: '你攀上峭壁，摘得灵芝，险象环生。' },
      { text: '量力而行', effect: {}, result: '你看了一会儿，终究没敢上去。' },
      { text: '记下位置', effect: { per: { ming: 3 } }, result: '你记下方位，想着日后再来。' }
    ] },
  { id: 'n11', name: '迷路的商旅', weight: 2, scenes: ['wild', 'desert'],
    desc: '几个行商在岔路口急得团团转，车上货物不少。',
    choices: [
      { text: '指路', effect: { per: { xia: 3 }, rep: 2 }, result: '你指了方向，行商千恩万谢。' },
      { text: '护送一程', effect: { gold: 40, exp: 20 }, result: '你护送他们到镇上，得了笔谢礼。' },
      { text: '不理会', effect: {}, result: '你径自走了。' }
    ] },
  { id: 'n12', name: '山贼内讧', weight: 2, scenes: ['wild'],
    desc: '一伙山贼为分赃起了争执，刀都拔出来了。',
    choices: [
      { text: '渔翁得利', effect: { gold: 30, moral: -3 }, result: '你趁乱捡了漏，扬长而去。' },
      { text: '上前劝架', effect: { exp: 20, per: { xia: 3 } }, result: '山贼骂骂咧咧，倒也收了刀。' },
      { text: '躲远点', effect: {}, result: '你躲在暗处，等他们散了你才走。' }
    ] },
  { id: 'n13', name: '会说话的老树', weight: 2, levelReq: 15, scenes: ['forest'],
    desc: '一棵老树垂下气根，竟开口说话：「年轻人，来，陪老朽说说话。」',
    choices: [
      { text: '与它对谈', effect: { per: { ming: 6 }, exp: 30 }, result: '老树讲了千年的见闻，你听得入神。' },
      { text: '问它年岁', effect: { per: { ming: 4 } }, result: '老树道：「记不清了，约莫……一千年？」' },
      { text: '拔腿就跑', effect: {}, result: '你头也不回地跑了。' }
    ] },
  { id: 'n14', name: '狐火引路', weight: 2, levelReq: 20, scenes: ['forest'],
    desc: '林间几点幽蓝狐火忽明忽灭，似在为你引路。',
    choices: [
      { text: '跟着狐火', effect: { per: { ming: 5 }, exp: 35 }, result: '你循火而行，竟找到一处隐蔽的山洞。' },
      { text: '视而不见', effect: {}, result: '狐火飘远，林间重归寂静。' },
      { text: '祭拜一番', effect: { per: { qing: 4 } }, result: '你恭敬一拜，狐火轻轻绕你一圈才散。' }
    ] },
  { id: 'n15', name: '藤蔓缠人', weight: 2, levelReq: 18, scenes: ['forest'],
    desc: '林间藤蔓似有灵性，悄悄缠上了你的脚踝。',
    choices: [
      { text: '挥刀斩断', effect: { exp: 20, per: { gang: 4 } }, result: '藤蔓断裂，渗出殷红的汁液。' },
      { text: '轻声安抚', effect: { per: { qing: 5 } }, result: '藤蔓竟缓缓松开，似听懂了你。' },
      { text: '拼命挣扎', effect: { hp: -10 }, result: '你越挣越紧，好半天才脱身。' }
    ] },
  { id: 'n16', name: '林中小木屋', weight: 2, levelReq: 15, scenes: ['forest'],
    desc: '密林深处，一座小木屋炊烟袅袅，门却虚掩着。',
    choices: [
      { text: '敲门问路', effect: { hp: 20, per: { qing: 3 } }, result: '屋里是个采药老人，请你喝了碗热汤。' },
      { text: '推门而入', effect: { gold: 20 }, result: '屋内空无一人，桌上留着一锭银子。' },
      { text: '绕道避开', effect: {}, result: '你不愿打扰，悄然离去。' }
    ] },
  { id: 'n17', name: '江心渔火', weight: 2, levelReq: 10, scenes: ['water'],
    desc: '夜色中，江心一点渔火摇曳，似有若无。',
    choices: [
      { text: '渡船去看', effect: { exp: 15, per: { qing: 4 } }, result: '那是个老渔翁，正悠闲地煮鱼汤。' },
      { text: '远远观望', effect: { per: { ming: 3 } }, result: '你看了会儿，渔火渐渐隐入雾中。' },
      { text: '喊话问路', effect: { per: { ming: 3 } }, result: '渔翁遥遥回了句「顺流而下便是」。' }
    ] },
  { id: 'n18', name: '河神传说', weight: 2, levelReq: 15, scenes: ['water'],
    desc: '河边村民正往河里投祭品，说是祭河神求平安。',
    choices: [
      { text: '随俗祭拜', effect: { moral: 2, per: { qing: 3 } }, result: '你献上祭品，村民们朝你友善一笑。' },
      { text: '问河神来历', effect: { per: { ming: 4 } }, result: '老人讲起河神显灵的旧事，半信半疑。' },
      { text: '笑他们愚昧', effect: { moral: -3 }, result: '村民们脸色不善，你识趣地走了。' }
    ] },
  { id: 'n19', name: '沉船残骸', weight: 2, levelReq: 25, scenes: ['water'],
    desc: '江边搁浅着一艘破船，船身爬满青苔，似有多年。',
    choices: [
      { text: '上船搜寻', effect: { gold: 50, exp: 25 }, result: '你在舱底摸到一箱遗落的财货。' },
      { text: '查看来历', effect: { per: { ming: 5 } }, result: '你从船名判断，这是多年前失踪的商船。' },
      { text: '绕开', effect: {}, result: '你总觉得这船透着股邪气。' }
    ] },
  { id: 'n20', name: '鲛人落泪', weight: 2, levelReq: 40, scenes: ['water'],
    desc: '月下海面，一个似人似鱼的身影在礁石上低泣，泪落成珠。',
    choices: [
      { text: '上前询问', effect: { per: { qing: 6 }, exp: 60 }, result: '鲛人回眸，赠你一颗泪珠，纵身入海。' },
      { text: '捡泪珠', effect: { gold: 80 }, result: '你捡起几颗，入手温润，价值不菲。' },
      { text: '远远观望', effect: { per: { ming: 4 } }, result: '那身影似有所觉，沉入海中。' }
    ] },
  { id: 'n21', name: '海市蜃楼', weight: 2, levelReq: 20, scenes: ['desert'],
    desc: '黄沙尽头，竟浮现出一座繁华城池，行人车马历历在目。',
    choices: [
      { text: '追过去', effect: { exp: 20 }, result: '你追出十里，城池却如泡影般散了。' },
      { text: '就地观察', effect: { per: { ming: 5 } }, result: '你看出那是蜃景，却也惊叹其逼真。' },
      { text: '当没看见', effect: {}, result: '你舔了舔干裂的嘴唇，继续赶路。' }
    ] },
  { id: 'n22', name: '沙暴中的驼铃', weight: 2, levelReq: 25, scenes: ['desert'],
    desc: '沙暴将至，风中传来一阵驼铃，忽远忽近。',
    choices: [
      { text: '循声找去', effect: { exp: 30, gold: 30 }, result: '你救下几个被风沙困住的客商，得了谢礼。' },
      { text: '找处避风', effect: { hp: 20 }, result: '你躲进沙丘背风处，熬过了风沙。' },
      { text: '硬着头皮赶路', effect: { hp: -20 }, result: '你被风沙灌了满嘴，狼狈不堪。' }
    ] },
  { id: 'n23', name: '绿洲歌声', weight: 2, levelReq: 30, scenes: ['desert'],
    desc: '绿洲畔，有女子的歌声飘来，婉转却带着几分诡异。',
    choices: [
      { text: '循声而去', effect: { per: { ming: 5 }, exp: 40 }, result: '你发现歌声来自一株会唱歌的奇花。' },
      { text: '捂耳不闻', effect: {}, result: '你强忍着好奇，匆匆离去。' },
      { text: '应声合唱', effect: { per: { qing: 5 } }, result: '你唱了几句，那歌声竟与你相和。' }
    ] },
  { id: 'n24', name: '乱葬岗鬼火', weight: 2, levelReq: 10, scenes: ['graveyard'],
    desc: '乱葬岗上鬼火点点，阴风阵阵，似有哭声。',
    choices: [
      { text: '壮胆上前', effect: { per: { gang: 5 }, exp: 20 }, result: '你走近才发现，是几块磷石在发光。' },
      { text: '烧纸祭拜', effect: { moral: 3, per: { qing: 3 } }, result: '你烧了把纸钱，阴风似小了些。' },
      { text: '绕道', effect: {}, result: '你宁愿多走几里，也不从这过。' }
    ] },
  { id: 'n25', name: '义庄守夜人', weight: 2, levelReq: 15, scenes: ['graveyard'],
    desc: '义庄门口，一个驼背老人点着灯，木然地望着你。',
    choices: [
      { text: '借宿一晚', effect: { hp: 30, per: { gang: 4 } }, result: '你在义庄将就一夜，倒也平安。' },
      { text: '问义庄由来', effect: { per: { ming: 5 } }, result: '老人沙哑道：「收尸的地方，有什么好问的。」' },
      { text: '作揖离开', effect: {}, result: '老人缓缓转身，关上了门。' }
    ] },
  { id: 'n26', name: '无头将军', weight: 2, levelReq: 25, scenes: ['graveyard'],
    desc: '坟场深处，一个无头身影骑着高头大马，持枪而立。',
    choices: [
      { text: '拔剑应战', effect: { exp: 60, per: { gang: 8 } }, result: '你与其战了一场，那身影化作青烟散去。' },
      { text: '诵经超度', effect: { moral: 5, per: { qing: 5 } }, result: '你念了段往生咒，无头将军勒马离去。' },
      { text: '悄悄退走', effect: {}, result: '你屏息凝神，一点点退出了坟场。' }
    ] },
  { id: 'n27', name: '纸扎童男童女', weight: 2, levelReq: 30, scenes: ['graveyard'],
    desc: '路边摆着纸扎的童男童女，那纸人似乎……冲你眨了眨眼。',
    choices: [
      { text: '一把火烧了', effect: { per: { gang: 5 } }, result: '纸人遇火，发出尖细的惨叫，化灰而散。' },
      { text: '念咒镇之', effect: { per: { ming: 6 }, exp: 40 }, result: '你念了段清心咒，纸人恢复了死寂。' },
      { text: '拔腿就跑', effect: {}, result: '你头也不回，跑出老远。' }
    ] },
  { id: 'n28', name: '忘川河畔', weight: 2, levelReq: 50, scenes: ['graveyard'],
    desc: '忘川河边，彼岸花开得妖艳，桥上有老妇端着一碗汤。',
    choices: [
      { text: '讨碗汤喝', effect: { per: { ming: 10 }, exp: 80 }, result: '孟婆道「喝了便忘」，你放下碗，若有所悟。' },
      { text: '问她何人', effect: { per: { ming: 8 } }, result: '她只道「一个摆渡汤水的人」。' },
      { text: '过桥看看', effect: { per: { gang: 6 }, exp: 60 }, result: '你走过奈何桥，又折了回来。' }
    ] },
  { id: 'n29', name: '藏经阁扫地人', weight: 2, levelReq: 20, scenes: ['sect'],
    desc: '藏经阁前，一个灰衣人扫得极慢，落叶却不沾衣。',
    choices: [
      { text: '帮他扫地', effect: { per: { qing: 4 } }, result: '他道了声谢，眼神古井无波。' },
      { text: '问藏经阁可入', effect: { exp: 40, per: { ming: 5 } }, result: '他侧身让开，说「经书在阁，佛在心」。' },
      { text: '静静观他扫地', effect: { per: { ming: 6 } }, result: '你观他扫叶，心竟渐渐静了下来。' }
    ] },
  { id: 'n30', name: '演武场观武', weight: 2, levelReq: 15, scenes: ['sect'],
    desc: '演武场上，众弟子练功，拳风霍霍。',
    choices: [
      { text: '观拳偷师', effect: { exp: 25, per: { ming: 4 } }, result: '你看得入神，略有所悟。' },
      { text: '下场切磋', effect: { exp: 35, per: { gang: 5 } }, result: '你与几人过了招，点到即止。' },
      { text: '远远看看', effect: {}, result: '你看了一会儿，转身离去。' }
    ] },
  { id: 'n31', name: '闭关师叔祖', weight: 2, levelReq: 30, scenes: ['sect'],
    desc: '后山石室前，一个须发皆白的老者盘坐，周身气机鼓荡。',
    choices: [
      { text: '叩首求教', effect: { exp: 60, per: { ming: 8 } }, result: '老者点你一句，如醍醐灌顶。' },
      { text: '远远观摩', effect: { per: { ming: 5 } }, result: '你观其气机运转，获益良多。' },
      { text: '不敢惊扰', effect: {}, result: '你轻手轻脚地退下。' }
    ] },
  { id: 'n32', name: '叛徒暗号', weight: 2, levelReq: 25, scenes: ['sect'],
    desc: '你无意间看见，墙角刻着一串古怪的暗号。',
    choices: [
      { text: '记下暗号', effect: { per: { ming: 6 } }, result: '你默记于心，日后或有用处。' },
      { text: '上报长辈', effect: { moral: 4, rep: 3 }, result: '长辈神色凝重，说「此事你莫再声张」。' },
      { text: '当没看见', effect: {}, result: '你装作若无其事地走开。' }
    ] },
  { id: 'n33', name: '云端仙鹤', weight: 2, levelReq: 40, scenes: ['mystic'],
    desc: '一只仙鹤自云端俯冲而下，绕你三匝，似通人性。',
    choices: [
      { text: '伸手喂食', effect: { per: { qing: 5 }, hp: 40 }, result: '仙鹤轻啄你掌心，振翅而去。' },
      { text: '追随鹤影', effect: { per: { ming: 6 }, exp: 50 }, result: '你追至山巅，见云海翻涌，若有所悟。' },
      { text: '静立目送', effect: { per: { qing: 4 } }, result: '你目送仙鹤没入云端。' }
    ] },
  { id: 'n34', name: '破碎的镜子', weight: 2, levelReq: 50, scenes: ['mystic'],
    desc: '荒径上，一面铜镜碎成数片，每片都映出一个不同的你。',
    choices: [
      { text: '拼起镜子', effect: { per: { ming: 10 }, exp: 70 }, result: '镜中千万个你，齐齐看向同一个方向。' },
      { text: '拾起一片', effect: { per: { ming: 6 } }, result: '你拾起一片，镜中的你冲你笑了笑。' },
      { text: '一脚踩碎', effect: { per: { gang: 6 } }, result: '镜碎如雪，你心头莫名一空。' }
    ] },
  { id: 'n35', name: '会说话的星辰', weight: 2, levelReq: 60, scenes: ['mystic'],
    desc: '夜空中，一颗星辰忽明忽暗，竟传来低语。',
    choices: [
      { text: '抬头细听', effect: { per: { ming: 12 }, exp: 90 }, result: '星语入耳，你窥见一丝天机。' },
      { text: '向星作揖', effect: { per: { qing: 6 } }, result: '那星闪了闪，似在回应。' },
      { text: '揉揉眼睛', effect: {}, result: '你再抬头，星辰已归寂静。' }
    ] },
  { id: 'n36', name: '时间裂缝', weight: 2, levelReq: 70, scenes: ['mystic'],
    desc: '你一脚踏空，眼前景象飞速倒流，似回到多年前。',
    choices: [
      { text: '向前走', effect: { exp: 100, per: { ming: 12 } }, result: '你走出裂缝，恍如隔世，实力似有精进。' },
      { text: '回头看', effect: { per: { qing: 8 } }, result: '你看见自己来时的路，蜿蜒如昨。' },
      { text: '原地不动', effect: {}, result: '裂缝缓缓闭合，一切如常。' }
    ] },
  { id: 'n37', name: '梦中的自己', weight: 2, levelReq: 55, scenes: ['mystic'],
    desc: '你打了个盹，梦里另一个你对你拱手：「你终于来了。」',
    choices: [
      { text: '问他是谁', effect: { per: { ming: 10 }, exp: 70 }, result: '他笑而不答，只说了句「莫忘本心」。' },
      { text: '与他切磋', effect: { exp: 80, per: { gang: 8 } }, result: '你与梦中的自己大战一场，醒来汗透重衣。' },
      { text: '转身离开', effect: {}, result: '梦醒，枕边微凉。' }
    ] },
  { id: 'n38', name: '倒流瀑布', weight: 2, levelReq: 45, scenes: ['mystic'],
    desc: '山间一挂瀑布，竟是自下而上倒流，蔚为奇观。',
    choices: [
      { text: '走近观看', effect: { per: { ming: 8 }, exp: 50 }, result: '你伸手接水，那水却向天上飞去。' },
      { text: '掬一捧水', effect: { hp: 40, mp: 20 }, result: '水入喉，一股清气直冲灵台。' },
      { text: '记下奇景', effect: { per: { ming: 5 } }, result: '你把这奇景记在心头。' }
    ] },
  { id: 'n39', name: '天外之音', weight: 2, levelReq: 80, scenes: ['mystic'],
    desc: '虚空中传来一阵梵唱，似从九天之外，又似自心底而起。',
    choices: [
      { text: '静心聆听', effect: { per: { ming: 14 }, exp: 120 }, result: '你听罢，只觉神魂通透，境界隐隐松动。' },
      { text: '循声而问', effect: { per: { ming: 10 } }, result: '那声音道「不可说，不可说」。' },
      { text: '捂耳不闻', effect: {}, result: '梵唱却直抵心底，挥之不去。' }
    ] },
  { id: 'n40', name: '镜花水月', weight: 2, levelReq: 65, scenes: ['mystic'],
    desc: '潭水如镜，映出漫天星辰，你伸手一触，涟漪散开，星月皆碎。',
    choices: [
      { text: '静观其变', effect: { per: { ming: 10 }, exp: 80 }, result: '水面复平，你似看透了什么。' },
      { text: '掬水捞月', effect: { per: { qing: 6 } }, result: '月碎于掌心，你哑然失笑。' },
      { text: '转身离去', effect: {}, result: '身后水声潺潺，如一声轻叹。' }
    ] },
  { id: 'n41', name: '隐世渔翁', weight: 2, levelReq: 15, scenes: ['water'],
    desc: '江边一个蓑衣渔翁，鱼竿纹丝不动，似在钓这满江风月。',
    choices: [
      { text: '上前攀谈', sub: {
        desc: '渔翁头也不回：「鱼儿不上钩，客人却来了。」',
        choices: [
          { text: '问所钓为何', effect: { per: { ming: 6 } }, result: '渔翁道「钓的是缘，不是鱼」。' },
          { text: '讨杯热茶', effect: { hp: 20, per: { qing: 4 } }, result: '渔翁递来一壶粗茶，暖意融融。' }
        ] } },
      { text: '静静陪钓', effect: { per: { qing: 5 } }, result: '你与他同钓半日，心境澄明。' },
      { text: '不打扰', effect: {}, result: '你悄然离去。' }
    ] },
  { id: 'n42', name: '老和尚讲经', weight: 2, levelReq: 20, scenes: ['sect'],
    desc: '寺里老和尚开坛讲经，信众席地而坐，鸦雀无声。',
    choices: [
      { text: '坐下听经', effect: { per: { ming: 6, qing: 4 } }, result: '一炷香后，你心头一片澄澈。' },
      { text: '上前问禅', sub: {
        desc: '老和尚合十：「施主有何疑问？」',
        choices: [
          { text: '问「放下」二字', effect: { per: { ming: 8 } }, result: '老和尚只道「放下，便放下」。' },
          { text: '问来世因果', effect: { per: { ming: 6 } }, result: '老和尚说「种瓜得瓜，种豆得豆」。' }
        ] } },
      { text: '捐些香火', effect: { gold: -10, moral: 3 }, result: '你捐了香火，求得心安。' }
    ] },
  { id: 'n43', name: '盗墓人', weight: 2, levelReq: 25, scenes: ['graveyard'],
    desc: '荒坟前，一个盗墓人正刨着土，见你便压低声音：「兄弟，见者有份。」',
    choices: [
      { text: '跟他一探', sub: {
        desc: '盗墓人撬开棺木，里面却空空如也，只有一张纸条。',
        choices: [
          { text: '看纸条', effect: { per: { ming: 8 }, exp: 40 }, result: '纸条写着「借你吉穴一用，来日再会」。' },
          { text: '劝他收手', effect: { moral: 4 }, result: '盗墓人脸色变幻，终究填回了土。' }
        ] } },
      { text: '斥他缺德', effect: { moral: 5, rep: 3 }, result: '你喝斥一番，盗墓人悻悻而走。' },
      { text: '装作没看见', effect: {}, result: '你转身就走，权当没遇见。' }
    ] },
  { id: 'n44', name: '星象异变', weight: 2, levelReq: 45, scenes: ['mystic'],
    desc: '夜空群星移位，竟组成一个你从未见过的图案。',
    choices: [
      { text: '仰观星图', effect: { per: { ming: 12 }, exp: 90 }, result: '你凝神细看，那图案印入脑海，挥之不去。' },
      { text: '请教高人', sub: {
        desc: '路边一个老者也仰头望天，捋须不语。',
        choices: [
          { text: '问此为何兆', effect: { per: { ming: 10 } }, result: '老者叹道「天发杀机，移星易宿」。' },
          { text: '请他说破', effect: { exp: 60, per: { ming: 8 } }, result: '老者只道「命由己造」，不肯多言。' }
        ] } },
      { text: '默记于心', effect: { per: { ming: 8 } }, result: '你把这异象深深记下。' }
    ] },
  // ============================================================
  //  声望专属事件（repMin=正声望门槛 / repMax=负声望上限）
  // ============================================================
  { id: 'r1', name: '百姓夹道塞吃食', weight: 2, scenes: ['village', 'town'], repMin: 80,
    desc: '你路过村口，百姓认出你来，纷纷往你手里塞吃食，拦都拦不住。',
    choices: [
      { text: '收下好意', effect: { item: 'jijirou', gold: 20 }, result: '你怀里被塞得满满当当。' },
      { text: '只取一点', effect: { rep: 3, moral: 2 }, result: '你只取了一块，百姓愈发敬你。' }
    ] },
  { id: 'r2', name: '乡绅设宴', weight: 2, scenes: ['village', 'town'], repMin: 200,
    desc: '一位乡绅拦住你，拱手道：侠士为民除害，乡里感激不尽，略备薄宴，请务必赏光。',
    choices: [
      { text: '欣然赴宴', effect: { hp: 500, gold: 60 }, result: '酒足饭饱，气血尽复。' },
      { text: '婉言谢绝', effect: { rep: 5 }, result: '乡绅叹服：侠士高风亮节，钦佩！' }
    ] },
  { id: 'r3', name: '仰慕者求收徒', weight: 1, repMin: 400,
    desc: '一个背着行囊的少年跪在你面前，恳求拜你为师。',
    choices: [
      { text: '收为记名弟子', effect: { gold: 120, rep: 8 }, result: '少年大喜，献上束脩。' },
      { text: '指点几句', effect: { exp: 100, moral: 3 }, result: '少年如获至宝，千恩万谢。' },
      { text: '婉言推辞', effect: {}, result: '少年黯然离去，却说还会再来。' }
    ] },
  { id: 'r4', name: '富商送盘缠', weight: 1, scenes: ['village', 'town'], repMin: 700,
    desc: '一位富商亲自登门，送上厚礼：「侠名远播，这是小小心意，助侠士行侠仗义。」',
    choices: [
      { text: '收下', effect: { gold: 500 }, result: '富商拱手而别，了却一桩心愿。' },
      { text: '转赠穷苦人家', effect: { moral: 10, rep: 10 }, result: '你分文不取，尽数散给贫民，满城称颂。' }
    ] },
  { id: 'r5', name: '店家多找钱', weight: 2, scenes: ['village', 'town'], repMax: -80,
    desc: '茶棚店家战战兢兢地给你找钱，手抖得厉害，多找了不少。',
    choices: [
      { text: '照单全收', effect: { gold: 30, moral: -2 }, result: '店家如蒙大赦，低头不敢言语。' },
      { text: '退了回去', effect: { moral: 3, rep: 2 }, result: '店家愣住，随即千恩万谢。' }
    ] },
  { id: 'r6', name: '恶霸纳头便拜', weight: 2, scenes: ['village', 'town'], repMax: -200,
    desc: '一个横行乡里的恶霸见了你，扑通跪倒，献上一袋银子：「小的有眼无珠，孝敬您老人家。」',
    choices: [
      { text: '笑纳', effect: { gold: 120, moral: -3 }, result: '恶霸如释重负，连滚带爬地跑了。' },
      { text: '一脚踹开', effect: { rep: -5, moral: 2 }, result: '你一脚踹飞了他，凶名更盛，却也有人暗自称快。' }
    ] },
  { id: 'r7', name: '歹人慕名来投', weight: 1, repMax: -400,
    desc: '几个凶神恶煞的汉子找到你，抱拳道：「久仰凶名，愿追随左右，赴汤蹈火！」',
    choices: [
      { text: '收作手下', effect: { gold: 200, moral: -5 }, result: '几人纳头便拜，奉上见面礼。' },
      { text: '轰走', effect: { moral: 2 }, result: '你冷喝一声，几人灰溜溜地散了。' }
    ] },
  { id: 'r8', name: '百姓献买命钱', weight: 1, scenes: ['village', 'town'], repMax: -700,
    desc: '你走进镇子，家家紧闭门户。不多时，一个老者颤巍巍捧出一包银子：「求大王饶过我等性命。」',
    choices: [
      { text: '收下', effect: { gold: 300, moral: -8 }, result: '老者如释重负，踉跄而去。' },
      { text: '摔回银子', effect: { rep: 5, moral: 5 }, result: '你难得动了恻隐，掷回银包，转身便走。' }
    ] },
  // ============================================================
  //  探索型 / 区域专属 / 一次性剧情事件
  // ============================================================
  { id: 'x1', name: '剑冢剑鸣', weight: 1, region: 'jianzhong',
    desc: '万千断剑忽然齐鸣，似有剑意牵引你走向深处。',
    choices: [
      { text: '循剑意而行', effect: { exp: 120, per: { ming: 5 } }, result: '你于剑意中隐约悟到一式剑诀的雏形。' },
      { text: '不理会', effect: {}, result: '剑鸣渐歇，你转身离去。' }
    ] },
  { id: 'x2', name: '天机残页', weight: 1, region: 'tianji',
    desc: '阁前石阶缝里，半张写满蝇头小字的残页被风吹得沙沙响。',
    choices: [
      { text: '捡起参悟', effect: { tech: 'jh_jiuzhuan' }, result: '你参悟残页，竟是一部失传心法！' },
      { text: '放回原处', effect: { moral: 2 }, result: '你将残页放回，转身离开。' }
    ] },
  { id: 'x3', name: '西域沙市', weight: 1, region: 'xiyu',
    desc: '沙丘后竟有一处热闹集市，胡商兜售着各种奇货。',
    choices: [
      { text: '淘一件宝贝', effect: { gold: -50, item: 'random' }, result: '你淘到一件好东西。' },
      { text: '只看不买', effect: {}, result: '你逛了一圈，空手而归。' }
    ] },
  { id: 'x4', name: '苗疆蛊市', weight: 1, region: 'miaoling',
    desc: '你误入一处隐秘蛊市，各种奇蛊令人目不暇接。',
    choices: [
      { text: '买一味蛊', effect: { gold: -80, item: 'gudan' }, result: '你买下一味奇蛊，收好。' },
      { text: '看看就走', effect: {}, result: '你悄然退出蛊市。' }
    ] },
  { id: 'x5', name: '无名剑客遗书', weight: 1, once: 'got_yishu',
    desc: '山道上倒着一具骸骨，怀中藏着一封血书与一本剑谱。',
    choices: [
      { text: '掩埋骸骨，取走剑谱', effect: { tech: 'jh_yizi', moral: 3 }, result: '你安葬了无名剑客，习得「一字电剑」。' },
      { text: '只取剑谱', effect: { tech: 'jh_yizi', moral: -2 }, result: '你取走剑谱，扬长而去。' }
    ] },
  { id: 'x6', name: '老者的预言', weight: 1, once: 'got_yuyan',
    desc: '一个瞎眼老者拦住你：「你身上有半块玉佩，将引你入一场大梦。」',
    choices: [
      { text: '追问', effect: { per: { ming: 6 } }, result: '老者只留下一句「梦醒时，别回头」，飘然而去。' },
      { text: '不理会', effect: {}, result: '你只当他胡言乱语。' }
    ] },
  { id: 'x7', name: '神秘字条', weight: 1, once: 'got_zitiao',
    desc: '你醒来时，枕边多了一张字条，上书：「小心灰袍人。」',
    choices: [
      { text: '收好字条', effect: { per: { ming: 4 } }, result: '你警觉起来，此后处处留心。' },
      { text: '一笑置之', effect: {}, result: '你把字条揉成一团丢掉。' }
    ] },
  { id: 'hl1', name: '断龙石', weight: 1, region: 'huangling',
    desc: '你误触机括，头顶断龙石轰然落下，脚下现出一道深不见底的陷坑。',
    choices: [
      { text: '拼死攀住石壁', effect: { hp: -150, exp: 200, per: { gang: 4 } }, result: '你险险攀住石壁，借力翻身，落石擦身而过，惊出一身冷汗。' },
      { text: '纵身跃入陷坑', effect: { hp: -250, gold: 400, exp: 250 }, result: '你跌入坑底，虽摔得七荤八素，却见壁上嵌着几锭前朝金元宝。' },
      { text: '原路退回', effect: {}, result: '你屏息退出这条墓道，不敢再深入。' }
    ] },
  { id: 'hl2', name: '帝陵壁画', weight: 1, region: 'huangling',
    desc: '墓道两侧绘着前朝开国之战，金戈铁马，隐隐透出一股肃杀之气。',
    choices: [
      { text: '凝神观壁', effect: { exp: 300, per: { ming: 5, gang: 3 } }, result: '你于壁画刀兵之间，似窥见一丝前朝战阵的奥义。' },
      { text: '拓印下来', effect: { gold: -30, rep: 3 }, result: '你拓下几幅残画，或可卖给识货的藏家。' }
    ] },
  { id: 'tl1', name: '死囚遗言', weight: 1, region: 'tianlao',
    desc: '一个戴着重枷的死囚低声唤你，说狱中埋着一处藏金，只求你把半块烧饼分他。',
    choices: [
      { text: '分他半块烧饼', effect: { gold: -5, moral: 6, exp: 100 }, result: '死囚含泪咽下烧饼，临终前告知了你藏金所在。' },
      { text: '冷眼走开', effect: {}, result: '死囚的眼神暗了下去，再不言语。' }
    ] },
  { id: 'tl2', name: '越狱夜', weight: 1, region: 'tianlao',
    desc: '深夜，一伙蒙面人凿穿牢墙来劫狱，火光与喊杀声四起。',
    choices: [
      { text: '出手相助狱卒', effect: { exp: 300, gold: 200, moral: 5, rep: 8 }, result: '你助狱卒击退劫狱者，典狱官亲自道谢。' },
      { text: '趁乱脱身', effect: { per: { ming: 4 } }, result: '你趁乱隐入暗处，看尽人心鬼蜮。' },
      { text: '冷眼旁观', effect: {}, result: '你不动声色，静观其变。' }
    ] },
  // ---------- 情感剧情（悲喜交织） ----------
  { id: 'f1', name: '故人重逢', weight: 2, scenes: ['village', 'town'], levelReq: 20,
    desc: '客栈喧嚷间，一个熟悉的声音唤住你——竟是当年一同逃荒的伙伴，如今已成了走镖的镖头。',
    choices: [
      { text: '把酒相认', effect: { gold: -10, rep: 3, per: { qing: 5 } }, result: '你们对饮到天明，说起旧事，笑中带泪。' },
      { text: '只叙别情', effect: { per: { qing: 4 } }, result: '故人拍着你的肩，眼圈微红，约定来日再聚。' },
      { text: '佯装不识', effect: {}, result: '你侧身而过，故人的笑声在身后渐渐低了下去。' }
    ] },
  { id: 'f2', name: '红颜赠礼', weight: 2, levelReq: 30, cond: (p) => Object.values(p.redyan || {}).some((r) => r && r.status === 'redyan'),
    desc: '一包锦缎送到你手中，拆开是一枚亲手绣的香囊，针脚细密，还带着淡淡的桂花香。',
    choices: [
      { text: '珍重收好', effect: { per: { qing: 6 } }, result: '你把香囊贴身收着，心头一暖。' },
      { text: '回赠玉簪', effect: { gold: -20, per: { qing: 4 } }, result: '礼尚往来，情意更浓。' },
      { text: '不以为意', effect: { per: { qing: -3 } }, result: '你随手搁下，那缕桂香渐渐淡了。' }
    ] },
  { id: 'f3', name: '恩人已逝', weight: 1, levelReq: 35,
    desc: '你重游旧地，才知当年赠你盘缠、教你处世的老者已作古，坟头青草萋萋。',
    choices: [
      { text: '上香祭拜', effect: { moral: 5, per: { qing: 5 } }, result: '你跪拜上香，想起旧日叮咛，半晌无言。' },
      { text: '默立良久', effect: { per: { qing: 3 } }, result: '你在坟前站了许久，风过荒丘，似有叹息。' },
      { text: '转身离去', effect: { per: { qing: -3 } }, result: '你头也不回地走了，把往事留在身后。' }
    ] },
  { id: 'f4', name: '挚友诀别', weight: 1, levelReq: 45,
    desc: '并肩闯荡的兄弟背起行囊，说要独自去寻那灭门之仇，此去九死一生。',
    choices: [
      { text: '执意同行', effect: { exp: 150, rep: 3, per: { qing: 4 } }, result: '他苦劝无果，终是与你相视一笑："好兄弟。"' },
      { text: '好言相劝', effect: { moral: 3, per: { qing: 4 } }, result: '他按住你的肩："等我回来，再喝个痛快。"' },
      { text: '任他远去', effect: { per: { qing: -3 } }, result: '你目送他的背影没入暮色，再没回头。' }
    ] },
  { id: 'f5', name: '苦尽甘来', weight: 1, levelReq: 55,
    desc: '你负伤躲进破庙，高烧不退，恍惚间有人彻夜照料。睁眼时，却是那日你随手相救的乞丐。',
    choices: [
      { text: '含泪道谢', effect: { moral: 5, per: { qing: 4, xia: 3 } }, result: '他咧嘴一笑："当日恩公救我，今日我还恩公。"' },
      { text: '赠银答谢', effect: { gold: -20, moral: 6, rep: 3 }, result: '他推辞不过，收下银子，又添了碗热粥。' },
      { text: '默然不语', effect: {}, result: '你阖上眼，把那点暖意压在心底。' }
    ] },
  { id: 'f6', name: '身世一叹', weight: 1, levelReq: 65, once: 'got_shenshi_meng',
    desc: '梦里，一个看不清面容的女子立在雾中，对你说："孩子，别回头。"醒来时，枕边已湿了一片。',
    choices: [
      { text: '怔怔出神', effect: { per: { qing: 5, ming: 3 } }, result: '那声音在耳边萦绕不去，似远似近。' },
      { text: '记下此梦', effect: { per: { ming: 3 } }, result: '你起身记下梦境，字里行间皆是疑云。' },
      { text: '强自镇定', effect: { per: { gang: 3 } }, result: '你深吸一口气，只当是一场无稽之梦。' }
    ] },
  { id: 'f7', name: '善缘得报', weight: 2, levelReq: 25, cond: (p) => p.morality >= 20,
    desc: '当年你救下的孩子如今长大成人，辗转寻你多时，只为当面道一声谢。',
    choices: [
      { text: '欣慰相认', effect: { moral: 5, rep: 3, per: { qing: 4 } }, result: '他跪地便拜，你连忙扶起，相视而笑。' },
      { text: '婉拒谢礼', effect: { moral: 6, per: { xia: 4 } }, result: '你分文不取，只道一句"路见不平"。' },
      { text: '已然淡忘', effect: { per: { qing: -2 } }, result: '你摆摆手，那孩子眼中的光暗了暗。' }
    ] },
  { id: 'f8', name: '大梦一场', weight: 1, levelReq: 75, once: 'got_guli_meng',
    desc: '你在一场大梦中回到故里，亲人俱在，炊烟袅袅。醒来却只余一室孤灯，更漏声残。',
    choices: [
      { text: '怅然若失', effect: { per: { qing: 4 } }, result: '你枯坐良久，直到天光破窗。' },
      { text: '一笑置之', effect: { per: { gang: 3 } }, result: '你自嘲一笑，江湖人，何处不是家。' },
      { text: '起身练剑', effect: { exp: 200 }, result: '你以剑驱散残梦，汗水浸透衣衫。' }
    ] },
  { id: 'f9', name: '红颜一诺', weight: 2, levelReq: 40, cond: (p) => Object.values(p.redyan || {}).some((r) => r && r.status === 'redyan'),
    desc: '临别时，你的红颜为你系上一根红线，低声道："江湖路远，盼君平安。"',
    choices: [
      { text: '郑重收下', effect: { per: { qing: 6 } }, result: '你握住她的手，许下必归之诺。' },
      { text: '打趣回应', effect: { per: { qing: 2 } }, result: '你笑着宽慰，她佯嗔着替你理了理衣襟。' },
      { text: '无动于衷', effect: { per: { qing: -3 } }, result: '你抽回手，那根红线轻飘飘落在地上。' }
    ] },
  { id: 'f10', name: '仇人落魄', weight: 1, levelReq: 50, cond: (p) => (p.revenge || []).length > 0,
    desc: '那曾羞辱你的仇家，如今落魄街头，形销骨立，见你时浑身发抖。',
    choices: [
      { text: '上前了断', effect: { exp: 150, per: { gang: 4 } }, result: '你逼他当众认错，多年郁结一朝得解，却无半分快意。' },
      { text: '放他一马', effect: { moral: 4, per: { qing: 4 } }, result: '你转身离去，恩怨随风而散。' },
      { text: '冷眼走过', effect: {}, result: '你目不斜视，只当是陌路人。' }
    ] },
{ id: 'g1', name: '货郎叫卖', weight: 2, scenes: ['village'], levelReq: 10,
  desc: '村口货郎摇鼓叫卖，竹担挑满山货。',
  choices: [
    { text: '上前买些干粮', effect: { gold: -15, exp: 10 }, result: '买下干粮，货郎拱手称谢。' },
    { text: '观其货担深处', sub: {
        desc: '货担一角油布微鼓，似藏别物。',
        choices: [
          { text: '直言相询', effect: { moral: 2, exp: 20 }, result: '货郎赧然，原是私藏家传旧物。' },
          { text: '暗记于心，尾随其后', sub: {
              desc: '货郎收担穿巷，行迹忽隐忽现。',
              choices: [
                { text: '现身点破', effect: { exp: 30, moral: 1, gold: 20 }, result: '你点破行藏，货郎叹服，赠你散银。' },
                { text: '折返村中', effect: { exp: 10 }, result: '你悄然折返，心中存疑未解。' }
              ] } }
        ] } }
  ] },
{ id: 'g2', name: '村塾问字', weight: 2, scenes: ['village'], levelReq: 12,
  desc: '村塾内童声朗朗，老塾师执卷倚门。',
  choices: [
    { text: '入塾听讲', effect: { exp: 25, moral: 2 }, result: '听罢半日，蒙童之音涤人心尘。' },
    { text: '向塾师请教疑难', sub: {
        desc: '塾师见你佩剑，眉目间颇有深意。',
        choices: [
          { text: '请教武学道理', effect: { exp: 30, per: { ming: 2 } }, result: '师言：力之极处，反求诸心。' },
          { text: '请教江湖旧闻', sub: {
              desc: '塾师沉吟，提起一桩陈年旧事。',
              choices: [
                { text: '细问究竟', effect: { exp: 40, rep: 1 }, result: '旧闻暗藏线索，你默记于心。' },
                { text: '谢过便去', effect: { exp: 15 }, result: '先生拱手相送，不再多言。' }
              ] } }
        ] } }
  ] },
{ id: 'g3', name: '乡绅嫁女', weight: 2, scenes: ['village'], levelReq: 15,
  desc: '乡绅府前张灯结彩，媒婆穿梭如织。',
  choices: [
    { text: '入府观礼', effect: { exp: 20, rep: 2 }, result: '你随礼入席，宾主尽欢。' },
    { text: '寻个僻静处歇息', sub: {
        desc: '后园曲径，忽闻低泣之声。',
        choices: [
          { text: '循声探问', effect: { moral: 3, per: { qing: 2 } }, result: '原是新娘心有不甘，你温言开解。' },
          { text: '驻足侧耳', sub: {
              desc: '泣声断续，似有难言之隐。',
              choices: [
                { text: '暗中相助', effect: { moral: 4, exp: 35 }, result: '你暗递书信，助其了却旧缘。' },
                { text: '转身离去', effect: { moral: -1, exp: 10 }, result: '红尘事扰，你只作不知。' }
              ] } }
        ] } }
  ] },
{ id: 'g4', name: '丰年庙会', weight: 2, scenes: ['village'], levelReq: 18,
  desc: '秋收既毕，庙会灯烛彻夜不熄。',
  choices: [
    { text: '随人潮逛会', effect: { exp: 15, gold: 10 }, result: '你买了糖人，看尽百戏烟火。' },
    { text: '登楼远望灯火', sub: {
        desc: '楼头风清，万家灯火明灭如星。',
        choices: [
          { text: '静观良久', effect: { per: { ming: 2 }, mp: 10 }, result: '尘世烟火皆入眼底，心有所悟。' },
          { text: '下楼加入庆典', sub: {
              desc: '庙前人群围作一圈，喝彩声起。',
              choices: [
                { text: '与民同乐', effect: { exp: 25, rep: 2 }, result: '你击节而歌，乡人皆笑。' },
                { text: '旁观不语', effect: { exp: 15, per: { gang: 1 } }, result: '热闹是他们的，你只守心中一念。' }
              ] } }
        ] } }
  ] },
{ id: 'g5', name: '田垄异物', weight: 2, scenes: ['village'], levelReq: 20,
  desc: '老农拦住去路，言田里掘出异物。',
  choices: [
    { text: '随老农下田查看', sub: {
        desc: '田垄新翻，土中半露一件铁器。',
        choices: [
          { text: '掘起细看', effect: { item: 'random', exp: 30 }, result: '原是半截旧刀，寒光未减。' },
          { text: '环顾四周', sub: {
              desc: '田埂尽头，有脚印往乱草深处去。',
              choices: [
                { text: '循迹追查', effect: { exp: 40, moral: 1 }, result: '你在草中寻得一枚蒙面黑巾。' },
                { text: '不动声色', effect: { exp: 20 }, result: '你记下方位，暂且按下不表。' }
              ] } }
        ] } },
    { text: '婉言谢绝', effect: { exp: 10 }, result: '你径自赶路，心中却记下此事。' }
  ] },
{ id: 'g6', name: '药铺问疾', weight: 2, scenes: ['village'], levelReq: 22,
  desc: '药香盈巷，老郎中坐堂，病者络绎。',
  choices: [
    { text: '求一味伤药', effect: { hp: 30, gold: -10 }, result: '郎中配药，叮嘱你静养几日。' },
    { text: '看郎中诊脉', sub: {
        desc: '郎中三指搭脉，神色忽凝重。',
        choices: [
          { text: '上前询问', effect: { moral: 2, exp: 20 }, result: '原是村中多人染了怪病。' },
          { text: '暗中观察病患', sub: {
              desc: '病者面色青白，脉象皆似中毒。',
              choices: [
                { text: '出手施救', effect: { moral: 4, exp: 40, hp: -20 }, result: '你以内力逼毒，救回数人性命。' },
                { text: '告知郎中毒象', effect: { exp: 35, rep: 2 }, result: '郎中恍然，急开解毒之方。' }
              ] } }
        ] } }
  ] },
{ id: 'g7', name: '邻里纠纷', weight: 2, scenes: ['village'], levelReq: 25,
  desc: '两家农人当街争执，围观者众。',
  choices: [
    { text: '上前劝和', effect: { moral: 3, rep: 2 }, result: '你三言两语，化开一场干戈。' },
    { text: '打听缘由', sub: {
        desc: '原是两家共用的水渠被人动了手脚。',
        choices: [
          { text: '查那水渠', effect: { exp: 30, per: { ming: 2 } }, result: '渠口堵塞，似是人为。' },
          { text: '问动手之人', sub: {
              desc: '人群中一后生神色躲闪，欲走。',
              choices: [
                { text: '拦住盘问', effect: { exp: 40, moral: 2 }, result: '后生吐实，原是受人挑拨。' },
                { text: '任其离去', effect: { exp: 15 }, result: '你冷眼旁观，记住那张脸。' }
              ] } }
        ] } }
  ] },
{ id: 'g8', name: '老丐赠杖', weight: 1, scenes: ['village'], levelReq: 30,
  desc: '村口老丐倚墙而坐，破碗空空如也。',
  choices: [
    { text: '施舍几文', effect: { gold: -5, moral: 3 }, result: '老丐抬眼，浑浊目中似有精光。' },
    { text: '俯身与其攀谈', sub: {
        desc: '老丐自称姓洪，言谈间颇通武理。',
        choices: [
          { text: '虚心求教', effect: { exp: 40, per: { xia: 2 } }, result: '他随手折枝，为你演了一套杖法。' },
          { text: '观其手中竹杖', sub: {
              desc: '那竹杖乌沉如玉，非寻常之物。',
              choices: [
                { text: '恭敬请杖', effect: { gear: 'lan' }, result: '老丐大笑，掷杖于你：物归有缘人。' },
                { text: '不敢受赠', effect: { moral: 2, exp: 20 }, result: '老丐颔首，自顾睡去。' }
              ] } }
        ] } }
  ] },
{ id: 'g9', name: '杂耍斗技', weight: 2, scenes: ['village'], levelReq: 35,
  desc: '庙前空地，走江湖的班子正耍把式。',
  choices: [
    { text: '驻足观看', effect: { exp: 15, gold: -5 }, result: '铜钱掷去，博得满场喝彩。' },
    { text: '上台搭把手', sub: {
        desc: '班主拱手，邀你下场比划几招。',
        choices: [
          { text: '点到即止', effect: { exp: 45, rep: 3 }, result: '你身手利落，赢下满堂彩。' },
          { text: '故意落败', sub: {
              desc: '班主一怔，随即会意，托词收场。',
              choices: [
                { text: '暗中相助', effect: { moral: 2, exp: 30 }, result: '你输得自然，为班子留足脸面。' },
                { text: '随即离去', effect: { exp: 20 }, result: '事了拂衣去，不留姓与名。' }
              ] } }
        ] } }
  ] },
{ id: 'g10', name: '乡绅夜宴', weight: 2, scenes: ['village'], levelReq: 40,
  desc: '乡绅设宴，邀你过府，席间推杯换盏。',
  choices: [
    { text: '坦然赴宴', effect: { exp: 25, rep: 3 }, result: '你谈吐得体，宾主尽欢。' },
    { text: '留意席间暗语', sub: {
        desc: '觥筹之间，乡绅与一青衫客窃语。',
        choices: [
          { text: '凝神细听', effect: { exp: 35, per: { ming: 2 } }, result: '隐约听得一笔押镖买卖。' },
          { text: '借故离席', sub: {
              desc: '你离席更衣，绕到后堂。',
              choices: [
                { text: '探那青衫客行踪', effect: { exp: 45, moral: 1 }, result: '你见其袖中藏有一样信物。' },
                { text: '折返席间', effect: { exp: 15 }, result: '你不动声色，佯作不知。' }
              ] } }
        ] } }
  ] },
{ id: 'g11', name: '夜半犬吠', weight: 2, scenes: ['village'], levelReq: 45,
  desc: '夜半村犬齐吠，你披衣出户查看。',
  choices: [
    { text: '循声追去', sub: {
        desc: '月光下三条黑影翻墙遁入巷中。',
        choices: [
          { text: '疾追上前', effect: { exp: 50, rep: 3 }, result: '你擒下一贼，余者仓皇逃散。' },
          { text: '尾随观其巢穴', sub: {
              desc: '黑影钻入村外一座破庙。',
              choices: [
                { text: '破门擒贼', effect: { exp: 60, gold: 50, hp: -20 }, result: '你一举破贼，搜出不少赃银。' },
                { text: '报与里正', effect: { moral: 3, rep: 2, exp: 40 }, result: '里正带人围了破庙，贼人伏法。' }
              ] } }
        ] } },
    { text: '提灯守夜', effect: { exp: 20, moral: 2 }, result: '你静守半宿，村中再无异动。' }
  ] },
{ id: 'g12', name: '古井无波', weight: 1, scenes: ['village'], levelReq: 50,
  desc: '村口古井苔痕斑驳，水光幽然映月。',
  choices: [
    { text: '打水净手', effect: { hp: 10, mp: 20 }, result: '井水清凉，涤去一身风尘。' },
    { text: '俯身望井', sub: {
        desc: '井中倒影浮动，似有另一个人凝望于你。',
        choices: [
          { text: '凝神对视', effect: { per: { ming: 3 }, mp: 30 }, result: '影不动而心动，你恍然若失。' },
          { text: '掷石问井', sub: {
              desc: '石子入水，涟漪散尽，倒影依旧。',
              choices: [
                { text: '闭目静听水声', effect: { tech: 'jh_hanbing' }, result: '水声入耳，一线寒劲自井底透心而来。' },
                { text: '默然而退', effect: { exp: 25, per: { qing: 2 } }, result: '井水不波，你心波难平。' }
              ] } }
        ] } }
  ] },
{ id: 'g13', name: '茶楼听书', weight: 2, scenes: ['town'], levelReq: 14,
  desc: '茶馆里说书人一拍惊堂木，满堂喝彩。',
  choices: [
    { text: '丢几枚铜钱听书', effect: { gold: -5, exp: 20 }, result: '一段侠客旧事，听得入神。' },
    { text: '上前与说书人搭话', sub: {
        desc: '说书人眯眼打量你，低声道出一桩秘闻。',
        choices: [
          { text: '追问秘闻下落', effect: { exp: 30, rep: 2 }, result: '你记住了那失传刀法的线索。' },
          { text: '请他细说门派恩怨', sub: {
              desc: '他蘸茶在桌上写下一个名字。',
              choices: [
                { text: '记下这名字', effect: { rep: 3, exp: 25 }, result: '江湖多一桩心结，也多一分防备。' },
                { text: '付酒钱谢他', effect: { gold: -15, moral: 2 }, result: '他拱手道：后会有期。' }
              ] } }
        ] } }
  ] },

{ id: 'g14', name: '夜半刀兵', weight: 2, scenes: ['town'], levelReq: 18,
  desc: '投店歇脚，夜深忽闻隔壁刀兵之声。',
  choices: [
    { text: '佯装未觉', effect: { hp: 10 }, result: '你合衣而卧，一夜无话。' },
    { text: '提灯查看', sub: {
        desc: '隔壁房门半掩，一黑衣人负伤倚墙。',
        choices: [
          { text: '为他包扎', effect: { hp: 20, moral: 3 }, result: '他留下半块令牌，悄然离去。' },
          { text: '搜他行囊', effect: { gold: 60, moral: -4 }, result: '银两入手，你心头却微微一沉。' },
          { text: '佯装未觉回房', sub: {
              desc: '门缝里塞进一封信，落款无字。',
              choices: [
                { text: '拆信一观', effect: { exp: 25, rep: 2 }, result: '信中是一处宝库的大致方位。' },
                { text: '原信烧掉', effect: { moral: 2 }, result: '是非之地，明哲保身。' }
              ] } }
        ] } }
  ] },

{ id: 'g15', name: '当铺鉴宝', weight: 2, scenes: ['town'], levelReq: 22,
  desc: '当铺朝奉眯眼，将一件旧物翻来覆去。',
  choices: [
    { text: '典当祖传玉佩', effect: { gold: 80 }, result: '银货两讫，玉佩再难赎回。' },
    { text: '请朝奉鉴宝', sub: {
        desc: '朝奉眼中精光一闪，压低声音。',
        choices: [
          { text: '问他此宝来历', effect: { exp: 35, rep: 2 }, result: '原来此物牵着一桩灭门旧案。' },
          { text: '照价死当', effect: { gold: 120, rep: -2 }, result: '银两沉甸甸，却似沾着血。' },
          { text: '追查玉中铭文', sub: {
              desc: '铭文所指，竟是一处荒废祠堂。',
              choices: [
                { text: '夜探祠堂', effect: { exp: 40, hp: -20 }, result: '蛛网深处，翻出半卷旧账。' },
                { text: '知难而退', effect: { moral: 1 }, result: '有些旧事，还是让它沉埋吧。' }
              ] } }
        ] } }
  ] },

{ id: 'g16', name: '赌坊风波', weight: 2, scenes: ['town'], levelReq: 26,
  desc: '赌坊人声鼎沸，骰盅起落如雨。',
  choices: [
    { text: '小试一手', effect: { gold: 40 }, result: '手气尚可，小赚一笔便走。' },
    { text: '冷眼旁观', sub: {
        desc: '角落里一赌徒输红了眼，被人拖走。',
        choices: [
          { text: '出手拦住', effect: { rep: 3, moral: 2 }, result: '你救下一人，也结下仇家。' },
          { text: '暗中跟踪', sub: {
              desc: '那伙人拐进一条死巷，露出兵刃。',
              choices: [
                { text: '拔剑相向', effect: { exp: 35, hp: -20 }, result: '一场恶斗，你胜得并不轻松。' },
                { text: '悄然后退报官', effect: { moral: 2, rep: 2 }, result: '衙门来迟一步，你心中怅然。' }
              ] } }
        ] } }
  ] },

{ id: 'g17', name: '秦楼听曲', weight: 2, scenes: ['town'], levelReq: 30,
  desc: '秦楼楚馆，丝竹声声，歌女眼波流转。',
  choices: [
    { text: '点一曲《阳关》', effect: { mp: 30, gold: -20 }, result: '曲终人散，余音绕梁。' },
    { text: '向歌女打听消息', sub: {
        desc: '她以袖掩面，附耳低语。',
        choices: [
          { text: '重金买下消息', effect: { gold: -60, exp: 40 }, result: '一桩行踪，换你一场奔波。' },
          { text: '替她赎身', effect: { gold: -80, moral: 5, rep: 3 }, result: '她千恩万谢，你只道随缘。' },
          { text: '问幕后主家是谁', sub: {
              desc: '她脸色骤白，指尖微颤。',
              choices: [
                { text: '逼问到底', effect: { exp: 30, rep: -2 }, result: '她说出一个名字，你暗自心惊。' },
                { text: '不再相逼', effect: { moral: 2 }, result: '你放她一马，她欠你一分人情。' }
              ] } }
        ] } }
  ] },

{ id: 'g18', name: '镖局托镖', weight: 2, scenes: ['town'], levelReq: 38,
  desc: '镖局门前车马簇拥，总镖头抱拳相迎。',
  choices: [
    { text: '讨杯茶歇脚', effect: { exp: 15 }, result: '镖师们豪爽，留你一顿好酒。' },
    { text: '问可有顺路镖', sub: {
        desc: '总镖头沉吟片刻，取出一封镖书。',
        choices: [
          { text: '接下这趟镖', effect: { gold: 100, exp: 40 }, result: '一路风霜，幸而不辱使命。' },
          { text: '婉言谢绝', effect: { rep: 1 }, result: '他道：少侠随意。' },
          { text: '问他镖中何物', sub: {
              desc: '他面色一凛，将你引至僻静处。',
              choices: [
                { text: '听他说完', effect: { exp: 35, rep: 3 }, result: '原来押的是一桩惊天密函。' },
                { text: '立誓守口', effect: { moral: 2, rep: 3 }, result: '他托你捎口信去北方。' }
              ] } }
        ] } }
  ] },

{ id: 'g19', name: '衙门鸣冤', weight: 2, scenes: ['town'], levelReq: 46,
  desc: '衙门口贴着告示，皂衣捕快按刀而立。',
  choices: [
    { text: '上前看告示', effect: { exp: 20 }, result: '是缉拿江洋大盗的悬赏。' },
    { text: '递上状纸鸣冤', sub: {
        desc: '师爷收了状纸，却先问你身家几何。',
        choices: [
          { text: '奉上银两打点', effect: { gold: -80, rep: -3 }, result: '状纸递得快，你心却凉了半截。' },
          { text: '拂袖而去', effect: { moral: 3 }, result: '公门之外，自有公理。' },
          { text: '亮出江湖名号', sub: {
              desc: '捕头脸色骤变，屏退左右。',
              choices: [
                { text: '道明来意', effect: { rep: 4, exp: 30 }, result: '捕头拱手，愿与你共商大事。' },
                { text: '只要一句实话', effect: { moral: 2, exp: 25 }, result: '他叹口气，道出一桩官场密辛。' }
              ] } }
        ] } }
  ] },

{ id: 'g20', name: '码头商贾', weight: 2, scenes: ['town'], levelReq: 52,
  desc: '码头千帆竞渡，一队商贾围货而谈。',
  choices: [
    { text: '帮脚夫抬货', effect: { gold: 20, hp: 15 }, result: '汗透衣衫，得了几个辛苦钱。' },
    { text: '与客商攀谈', sub: {
        desc: '客商见你谈吐不凡，邀你入席。',
        choices: [
          { text: '合伙贩一批丝绸', effect: { gold: 130 }, result: '船出三日，获利而归。' },
          { text: '问水路可有凶险', sub: {
              desc: '他压低嗓音：前头水寨，专劫商船。',
              choices: [
                { text: '护送商船一程', effect: { gold: 90, exp: 40, hp: -20 }, result: '击退水匪，客商奉你为上宾。' },
                { text: '记下水路险要', effect: { exp: 30 }, result: '这一张水路图，日后大有用处。' }
              ] } }
        ] } }
  ] },

{ id: 'g21', name: '市井护弱', weight: 2, scenes: ['town'], levelReq: 58,
  desc: '市集一角，几个泼皮围住个卖菜老翁。',
  choices: [
    { text: '上前喝止', effect: { rep: 3, moral: 3 }, result: '泼皮散尽，老翁连声道谢。' },
    { text: '袖手旁观', effect: { moral: -3 }, result: '你转身时，身后传来老翁的哀求。' },
    { text: '问明缘由', sub: {
        desc: '原是帮派索要“地头钱”，由来已久。',
        choices: [
          { text: '替老翁交钱了事', effect: { gold: -30, moral: 2 }, result: '银钱小事，免他一场灾祸。' },
          { text: '找帮派头目理论', sub: {
              desc: '巷口一汉抱臂而立，满身横肉。',
              choices: [
                { text: '以武服人', effect: { exp: 45, hp: -25, rep: 3 }, result: '那汉倒地，众泼皮一哄而散。' },
                { text: '以理服人', effect: { rep: 4, exp: 30 }, result: '几句道破利害，那汉拱手让路。' }
              ] } }
        ] } }
  ] },

{ id: 'g22', name: '梨园剑影', weight: 2, scenes: ['town'], levelReq: 64,
  desc: '戏台上正演一出《易水》，满座寂然。',
  choices: [
    { text: '坐下看戏', effect: { exp: 25, mp: 20 }, result: '曲至悲处，满座皆垂泪。' },
    { text: '寻班主问曲', sub: {
        desc: '班主卸了妆，眉眼间却有杀伐之气。',
        choices: [
          { text: '请教剑舞之法', sub: {
              desc: '他不答，引你到后院空台。',
              choices: [
                { text: '接过戏剑', sub: {
                    desc: '剑身湛青如水，沉甸甸不似道具。',
                    choices: [
                      { text: '按剑诀舞动', effect: { exp: 50, gear: 'lan' }, result: '剑走如龙，方知戏中有真功夫。' },
                      { text: '问此剑来历', effect: { exp: 35, rep: 3 }, result: '他道：剑是假的，人是真的。' }
                    ] } },
                { text: '退后一步拱手', effect: { rep: 2 }, result: '他点头：知进退，好。' }
              ] } },
          { text: '问他为何藏身梨园', effect: { exp: 40 }, result: '他只笑不语，转身隐入幕后。' }
        ] } }
  ] },

{ id: 'g23', name: '茶棚隐翁', weight: 2, scenes: ['town'], levelReq: 70,
  desc: '茶棚里一灰衣老翁独坐，面前只一壶凉茶。',
  choices: [
    { text: '替他付茶钱', effect: { gold: -10, moral: 2 }, result: '他道声多谢，起身没入人群。' },
    { text: '上前讨茶', sub: {
        desc: '老翁抬眼看你，指节叩了叩桌沿。',
        choices: [
          { text: '陪他下一盘棋', sub: {
              desc: '残局摆开，黑白间似有杀意流转。',
              choices: [
                { text: '凝神对弈', effect: { exp: 60, talent: 1 }, result: '一子落下，你如醍醐灌顶。' },
                { text: '请教内息之妙', sub: {
                    desc: '他不语，只将一壶凉茶推向你的手边。',
                    choices: [
                      { text: '接茶而饮', effect: { tech: 'jh_hunyuan', exp: 30 }, result: '一股暖流自丹田升起，他飘然而去。' },
                      { text: '躬身求教', effect: { exp: 40, mp: 30 }, result: '他只道：道在茶中，自己悟。' }
                    ] } }
              ] } },
          { text: '问他何处来', effect: { exp: 20 }, result: '他答：从来处来，往去处去。' }
        ] } }
  ] },
{ id: 'g24', name: '官道遇匪', weight: 2, scenes: ['wild'], levelReq: 15,
  desc: '官道尘起，数名蒙面悍匪横刀拦路，喝令留下买路钱。',
  choices: [
    { text: '拔剑相向', effect: { exp: 25, rep: 2, hp: -20 }, result: '一番恶斗，匪徒落荒而逃，你肩上添了一道血口。' },
    { text: '破财消灾', effect: { gold: -60, moral: -2 }, result: '你掷下银两，匪徒哄笑而去，心头却添一分憋闷。' },
    { text: '喝问来路', sub: {
        desc: '你提气喝道：光天化日，尔等可知此地是哪位大人辖境？',
        choices: [
          { text: '诈称官差', effect: { exp: 30, per: { ming: 3 } }, result: '匪徒半信半疑，你趁其迟疑，纵身跃入林中脱身。' },
          { text: '软语周旋', sub: {
              desc: '你拱手赔笑，言说身上只有几两散银，愿尽数奉上。',
              choices: [
                { text: '伺机偷袭', effect: { exp: 35, hp: -15 }, result: '趁其伸手接银，你反手夺刀，将为首者制住。' },
                { text: '趁隙而走', effect: { exp: 15 }, result: '你佯装取银，忽地滚入道旁深沟，循沟底遁去。' }
              ] } }
        ] } }
  ] },

{ id: 'g25', name: '荒郊孤店', weight: 2, scenes: ['wild'], levelReq: 20,
  desc: '荒郊野店，幌旗半垂，店中只一老妪，灯下独坐，神色木然。',
  choices: [
    { text: '入店投宿', effect: { hp: 20, gold: -20 }, result: '一壶浊酒下肚，疲惫尽消，只是那酒味透着一丝古怪。' },
    { text: '讨碗水喝', sub: {
        desc: '你只在店外讨水，那老妪抬眼望你，目光浑浊。',
        choices: [
          { text: '饮后致谢', effect: { hp: 15, moral: 2 }, result: '清水入喉，清凉甘冽，你稽首道谢，继续赶路。' },
          { text: '追问孤店', sub: {
              desc: '你问：荒山野岭，店家一人，可曾遇着强人？',
              choices: [
                { text: '留意屋后', effect: { exp: 30, per: { ming: 2 } }, result: '你瞥见屋后草垛似有血迹，心下一凛，悄然离去。' },
                { text: '替她守夜', effect: { moral: 3, hp: -10, per: { xia: 3 } }, result: '你于店外守到天明，老妪终未吐露只言片语。' }
              ] } }
        ] } }
  ] },

{ id: 'g26', name: '野庙避雨', weight: 2, scenes: ['wild'], levelReq: 25,
  desc: '骤雨倾盆，你避入山间破庙，殿内蛛网尘灰，佛像倾颓。',
  choices: [
    { text: '燃火取暖', effect: { hp: 20 }, result: '火光摇曳，暖意渐生，你靠着残柱闭目调息。' },
    { text: '清理供案', sub: {
        desc: '你拂去供案尘灰，忽见案下似有暗格。',
        choices: [
          { text: '撬开暗格', effect: { gold: 40, exp: 20 }, result: '暗格内藏着一包散碎银两，许是前人所留。' },
          { text: '原样合上', effect: { moral: 3 }, result: '你未动分毫，只将那尘灰重新铺回，心内澄明。' },
          { text: '抬头细看', sub: {
              desc: '你抬头，见那残佛低垂的眼，似在望你。',
              choices: [
                { text: '合十礼拜', effect: { moral: 4, per: { qing: 2 } }, result: '你于佛前拜了三拜，心中块垒竟消了几分。' },
                { text: '寻隙翻找', effect: { gold: 20, moral: -2 }, result: '你寻遍殿角，只摸得几枚沾尘铜钱。' }
              ] } }
        ] } }
  ] },

{ id: 'g27', name: '断桥夜路', weight: 2, scenes: ['wild'], levelReq: 30,
  desc: '月黑风高，溪上小桥断作两截，唯余半截横在水面。',
  choices: [
    { text: '涉水而过', effect: { hp: -20, exp: 25 }, result: '溪水彻骨，你咬牙涉过，双腿冻得发僵。' },
    { text: '沿溪寻渡', sub: {
        desc: '你沿溪而上，寻那水浅处，忽闻前方有低沉水声。',
        choices: [
          { text: '投石问路', effect: { exp: 20, per: { ming: 3 } }, result: '石落深潭，回音沉沉，你知此处暗流凶险，另寻他途。' },
          { text: '踏石试探', sub: {
              desc: '你提气轻身，踩着露出水面的卵石，一步步向前。',
              choices: [
                { text: '稳住身形', effect: { exp: 35 }, result: '你屏息凝神，终是安然渡到对岸。' },
                { text: '纵身跃起', effect: { hp: -15, exp: 40 }, result: '你奋力一跃，堪堪攀住对岸树根，湿了半身。' }
              ] } }
        ] } }
  ] },

{ id: 'g28', name: '流民施粥', weight: 2, scenes: ['wild'], levelReq: 35,
  desc: '官道旁聚着些流民，扶老携幼，面有菜色，见你行来，目光怯怯。',
  choices: [
    { text: '分粮于众', effect: { gold: -40, moral: 4, per: { xia: 4 } }, result: '你将干粮银钱散与众人，孩童眼中似有了光亮。' },
    { text: '径自赶路', effect: { moral: -2 }, result: '你低下头匆匆而过，身后传来一声若有若无的叹息。' },
    { text: '上前询问', sub: {
        desc: '你问一位老者：老人家从何处来，欲往何方？',
        choices: [
          { text: '指路相助', effect: { exp: 20, per: { xia: 3 } }, result: '你指明了前路驿站与施粥之处，老者连声道谢。' },
          { text: '携银相赠', sub: {
              desc: '你取出怀中银两，塞进那老者枯瘦的手中。',
              choices: [
                { text: '赠予半身之资', effect: { gold: -80, moral: 5, per: { xia: 5 } }, result: '老者伏地而拜，你扶起他，只道：好好活着。' },
                { text: '略尽绵薄', effect: { gold: -30, per: { xia: 3 } }, result: '你留下些许银两，转身没入人潮。' }
              ] } }
        ] } }
  ] },

{ id: 'g29', name: '山道瘴气', weight: 2, scenes: ['wild'], levelReq: 40,
  desc: '深山古道，瘴气如纱弥漫林间，隐有异味扑鼻。',
  choices: [
    { text: '撕布掩口', effect: { hp: -10, exp: 20 }, result: '你以布掩口，仍觉头昏，强撑着走出瘴林。' },
    { text: '闭气急行', sub: {
        desc: '你提一口真气，欲以轻功一口气穿林而过。',
        choices: [
          { text: '运功护体', effect: { exp: 30, hp: -15 }, result: '真气护住心脉，你终究穿出瘴林，只余微微眩晕。' },
          { text: '中途折返', sub: {
              desc: '行至半途，瘴气愈浓，你心知不妙，止步欲退。',
              choices: [
                { text: '就地调息', effect: { hp: -20, exp: 35 }, result: '你盘膝坐下，以内力逼出所中瘴毒。' },
                { text: '采药自救', effect: { item: 'random', exp: 25 }, result: '你在林边寻得几株解毒草药，嚼碎咽下，渐觉清爽。' }
              ] } }
        ] } }
  ] },

{ id: 'g30', name: '拦路劫道', weight: 2, scenes: ['wild'], levelReq: 45,
  desc: '窄道之上，一伙山贼横陈拒马，为首大汉抱刀冷笑，索要过路银钱。',
  choices: [
    { text: '亮出兵器', effect: { exp: 40, rep: 3, hp: -25 }, result: '你拔剑而上，血战一场，山贼死伤数人，余者溃逃。' },
    { text: '交付买路钱', effect: { gold: -80 }, result: '你如数奉上银钱，山贼验过后，挥手放行。' },
    { text: '以理服人', sub: {
        desc: '你抱拳道：江湖路窄，诸位何苦做这无本买卖。',
        choices: [
          { text: '抬出师门', effect: { exp: 20, per: { ming: 3 } }, result: '你报了师门名号，山贼面面相觑，终是让开了道。' },
          { text: '约战单挑', sub: {
              desc: '你指着那大汉：可敢与在下单打独斗，胜过便放行。',
              choices: [
                { text: '速战速决', effect: { exp: 45, hp: -20, rep: 4 }, result: '你三招之内将那大汉击倒，山贼作鸟兽散。' },
                { text: '点到即止', effect: { exp: 30, rep: 2, moral: 2 }, result: '你只夺其刀而不伤人命，大汉羞惭，率众退去。' }
              ] } }
        ] } }
  ] },

{ id: 'g31', name: '山道孤客', weight: 2, scenes: ['wild'], levelReq: 50,
  desc: '山道寂寥，一青衫客负剑而行，与你擦肩，忽停步低语。',
  choices: [
    { text: '拱手见礼', effect: { exp: 25, per: { xia: 2 } }, result: '青衫客微微颔首，与你错身而过，剑鞘轻响，余音未绝。' },
    { text: '问其剑名', sub: {
        desc: '你问：足下所负之剑，可有名号？',
        choices: [
          { text: '夸赞剑意', effect: { exp: 30, per: { qing: 3 } }, result: '青衫客抚剑道：剑无名，只随主人心。言罢飘然而去。' },
          { text: '恳请一观', sub: {
              desc: '你道：既是有缘，可容在下一观此剑锋刃？',
              choices: [
                { text: '拔剑出鞘', effect: { exp: 40, rep: 2 }, result: '剑出三寸，寒光映面，你方知天外有天。' },
                { text: '静观不语', sub: {
                    desc: '你只静静凝视那剑，不置一言。',
                    choices: [
                      { text: '受剑为赠', effect: { gear: 'lan', exp: 50 }, result: '青衫客忽道：此剑随我十载，今赠有缘人。他将长剑递与你，转身没入山雾，再无踪影。' },
                      { text: '谢而不取', effect: { moral: 4, per: { xia: 3 } }, result: '你拱手道：君子不夺人所爱。青衫客一笑：如此，也算有缘。' }
                    ] } }
              ] } }
        ] } }
  ] },

{ id: 'g32', name: '荒郊隐者', weight: 2, scenes: ['wild'], levelReq: 55,
  desc: '山坳之中，一白发隐者临溪垂钓，身旁竹篓空空，怡然自得。',
  choices: [
    { text: '静静旁观', effect: { exp: 25, moral: 2 }, result: '你立在一旁，看浮标随波，心中竟也静了下来。' },
    { text: '上前请教', sub: {
        desc: '你上前一揖：老人家，此溪鱼稀，何不换一处垂钓？',
        choices: [
          { text: '论道半晌', effect: { exp: 40, per: { ming: 3 } }, result: '隐者抚须道：钓者之意不在鱼。你似有所悟。' },
          { text: '代为提竿', sub: {
              desc: '隐者将钓竿递来：小友，可愿代老朽守此一时？',
              choices: [
                { text: '静守浮标', effect: { exp: 35, moral: 3 }, result: '你守至日暮，浮标未动，心却已静如止水。' },
                { text: '闭目养神', effect: { hp: 30, mp: 20 }, result: '你于溪畔闭目吐纳，气息绵长，通体舒泰。' }
              ] } }
        ] } }
  ] },

{ id: 'g33', name: '夜路鬼火', weight: 2, scenes: ['wild'], levelReq: 65,
  desc: '荒坟野径，夜雾弥漫，数点幽绿鬼火忽明忽灭，游走其间。',
  choices: [
    { text: '绕道而行', effect: { exp: 20 }, result: '你不欲沾染晦气，远远绕开，脚下愈快。' },
    { text: '趋近查探', sub: {
        desc: '你暗自握剑，朝那鬼火缓步逼近，腥风扑面。',
        choices: [
          { text: '屏息凝神', effect: { exp: 35, per: { ming: 3 } }, result: '你凝神细辨，原是磷火伴腐骨，并无鬼魅。' },
          { text: '踏罡喝斥', sub: {
              desc: '你脚踏方位，朗声喝斥，声震荒野，惊起寒鸦一片。',
              choices: [
                { text: '驱散鬼火', effect: { exp: 45, mp: 10 }, result: '鬼火四散而灭，你长舒一口气，从容通过。' },
                { text: '循迹追去', effect: { item: 'random', exp: 30, hp: -15 }, result: '你循鬼火踪迹追去，捡得一枚前人遗落的旧物，却也沾了一身寒气。' }
              ] } }
        ] } }
  ] },

{ id: 'g34', name: '断桥垂钓人', weight: 2, scenes: ['wild'], levelReq: 75,
  desc: '荒桥断处，一蓑衣老者独坐垂钓，斗笠低垂，似与山川同寂。',
  choices: [
    { text: '躬身问路', effect: { exp: 25, per: { qing: 2 } }, result: '老者不答，只抬手一指，云雾深处似有微光。' },
    { text: '静坐同钓', sub: {
        desc: '你于老者身侧坐下，与他一同望着那无钩的钓线。',
        choices: [
          { text: '问其无钩', effect: { exp: 40, per: { ming: 3 } }, result: '老者道：钩者，形也；无钩，方能钓住过往的风。' },
          { text: '默候一炷', sub: {
              desc: '你不发一言，只静静候着，山风穿谷，衣袂轻扬。',
              choices: [
                { text: '静观其钓', effect: { exp: 45, moral: 3 }, result: '日影西移，老者起身，轻拍你肩，似笑非笑。' },
                { text: '再拜求教', sub: {
                    desc: '你起身长揖：前辈通玄，可否指点一二？',
                    choices: [
                      { text: '受其真传', effect: { tech: 'jh_fuguang', exp: 60 }, result: '老者忽以竹竿作剑，一招递来，你心神震动，如醍醐灌顶。待回神，人已不见，唯余竿影插于桥头。' },
                      { text: '只求一悟', effect: { talent: 1, exp: 40 }, result: '老者笑道：悟得者自得，何须多言。你怔立桥头，久久不能自已。' }
                    ] } }
              ] } }
        ] } }
  ] },
{ id: 'g35', name: '菌迷幽林', weight: 2, scenes: ['forest'], levelReq: 20,
  desc: '林深雾重，一丛彩菌散异香，归路已迷。',
  choices: [
    { text: '采菌充饥', sub: {
        desc: '菌盖绚烂，触手微温，似有生机暗藏。',
        choices: [
          { text: '入口一尝', effect: { exp: 30, hp: -40 }, result: '腹痛如绞，却觉气脉微动，似有所悟。' },
          { text: '弃菌续行', sub: {
              desc: '拨开藤蔓，见一老松盘根，枝干如龙。',
              choices: [
                { text: '攀树远望', effect: { exp: 25, per: { ming: 2 } }, result: '登高一望，山势尽收，胸中豁然。' },
                { text: '树下小憩', effect: { hp: 30 }, result: '倚松而眠，醒来神清气爽。' }
              ] } }
        ] } },
    { text: '循溪而行', sub: {
        desc: '溪声泠泠，水光映叶，似引前路。',
        choices: [
          { text: '溯流而上', effect: { exp: 25, per: { qing: 2 } }, result: '溪源见一石潭，清可见底，心神俱静。' },
          { text: '沿溪下行', effect: { gold: 20 }, result: '下游浅滩，拾得半串铜钱，苔痕斑驳。' }
        ] } },
    { text: '屏息待雾散', effect: { exp: 15, hp: 20 }, result: '静候多时，雾气渐散，山径复现。' }
  ] },

{ id: 'g36', name: '猎户问径', weight: 2, scenes: ['forest'], levelReq: 25,
  desc: '林间有猎户负弓而来，衣沾松露，神色匆匆。',
  choices: [
    { text: '上前问路', sub: {
        desc: '猎户驻足，言猛虎近日出没，山路多险。',
        choices: [
          { text: '结伴同行', effect: { exp: 25, rep: 2 }, result: '一路结伴，猎户指点山径，获益良多。' },
          { text: '问明方向独行', effect: { exp: 20 }, result: '依其所指，果然少走许多弯路。' }
        ] } },
    { text: '暗随其后', sub: {
        desc: '猎户似有所觉，忽转入密林，身影顿失。',
        choices: [
          { text: '继续追踪', sub: {
              desc: '林愈深，忽闻虎啸震谷，草木俱伏。',
              choices: [
                { text: '循声查探', effect: { exp: 35, hp: -30 }, result: '瞥见虎影，匿身而退，心有余悸。' },
                { text: '悄然折返', effect: { exp: 15 }, result: '抽身而退，未惹是非。' }
              ] } },
          { text: '止步不前', effect: { exp: 10 }, result: '谨慎为上，原地折返。' }
        ] } },
    { text: '拱手让行', effect: { rep: 2, moral: 2 }, result: '猎户颔首道谢，匆匆而去。' }
  ] },

{ id: 'g37', name: '狐仙夜语', weight: 1, scenes: ['forest'], levelReq: 30,
  desc: '月下古树，白狐蹲坐，目若寒星，似通人言。',
  choices: [
    { text: '以礼相待', sub: {
        desc: '白狐摇尾，化作一缕青烟，散作无数萤火。',
        choices: [
          { text: '随萤火而行', sub: {
              desc: '萤火聚散，引至一株老藤，藤下石匣半开。',
              choices: [
                { text: '开匣取物', effect: { gold: 40, per: { ming: 2 } }, result: '匣中一串古钱，触手生凉。' },
                { text: '合匣不取', effect: { moral: 4, per: { qing: 3 } }, result: '物各有主，非我之物，不取为善。' }
              ] } },
          { text: '伫立目送', effect: { per: { qing: 2 }, exp: 15 }, result: '狐影没入林间，唯余月光如水。' }
        ] } },
    { text: '拔剑相向', effect: { moral: -3, hp: -20 }, result: '白狐倏然遁去，唯觉心气浮动，怅然若失。' },
    { text: '凝神观其目', effect: { exp: 25, per: { ming: 3 } }, result: '对视良久，似窥见一丝天机，心神震荡。' }
  ] },

{ id: 'g38', name: '藤蔓溪涧', weight: 2, scenes: ['forest'], levelReq: 35,
  desc: '古藤垂涧，溪水穿石，氤氲水汽间隐见人影。',
  choices: [
    { text: '涉水而过', sub: {
        desc: '溪水寒冽，没至膝间，脚下一滑。',
        choices: [
          { text: '稳住身形', effect: { hp: -20, exp: 20 }, result: '借藤而起，水花四溅，终得上岸。' },
          { text: '顺势沉潜', sub: {
              desc: '溪底竟有一洞，幽深不知几许。',
              choices: [
                { text: '潜入探洞', effect: { exp: 40, gold: 50 }, result: '洞中石笋如林，拾得一枚玉佩。' },
                { text: '浮出水面', effect: { hp: 10 }, result: '呛了几口水，狼狈上岸。' }
              ] } }
        ] } },
    { text: '沿藤攀行', effect: { exp: 25, per: { xia: 2 } }, result: '借力古藤，轻身而过，身法略进。' },
    { text: '静观人影', effect: { per: { ming: 3 } }, result: '那人影原是一块形似人形的青石，虚惊一场。' }
  ] },

{ id: 'g39', name: '猿啼问药', weight: 2, scenes: ['forest'], levelReq: 40,
  desc: '猿啼入云，一老猿垂坐石上，怀抱一株赤芝。',
  choices: [
    { text: '以食易芝', sub: {
        desc: '老猿见你取食，目露犹疑，仍不肯放手。',
        choices: [
          { text: '再添一果', sub: {
              desc: '老猿接过鲜果，细细嗅闻，目光渐柔，仍不肯松手。',
              choices: [
                { text: '趁势易芝', effect: { item: 'random', exp: 15 }, result: '老猿欣然以赤芝相易，此芝异香扑鼻。' },
                { text: '再奉一果', sub: {
                    desc: '老猿低鸣两声，似仍有几分戒备。',
                    choices: [
                      { text: '摊掌示诚', effect: { item: 'random', moral: 2 }, result: '老猿终以整株赤芝相付，啼声欢悦，跃入深林。' },
                      { text: '静候其变', effect: { exp: 12 }, result: '老猿终未松手，你淡然一笑，转身而去。' }
                    ] } }
              ] } },
          { text: '作罢离去', effect: { exp: 10 }, result: '强求无益，转身另寻他径。' }
        ] } },
    { text: '夺芝而去', effect: { moral: -3, item: 'random' }, result: '老猿哀鸣不止，你夺芝而走，心不自安。' },
    { text: '静坐旁观', sub: {
        desc: '老猿见你无扰，竟掰下半株赤芝掷来。',
        choices: [
          { text: '接芝谢过', effect: { item: 'random', moral: 2 }, result: '得半株赤芝，猿啼渐远。' },
          { text: '拱手不取', effect: { moral: 3, rep: 2 }, result: '老猿似懂，鸣啸一声，攀藤而去。' }
        ] } }
  ] },

{ id: 'g40', name: '古树残碑', weight: 1, scenes: ['forest'], levelReq: 45,
  desc: '参天古树盘根如龙，树下一方残碑，苔痕深重。',
  choices: [
    { text: '拂苔读碑', sub: {
        desc: '碑文斑驳，依稀可辨数行剑诀口诀。',
        choices: [
          { text: '默记于心', sub: {
              desc: '口诀晦涩，字字如剑，直刺心扉。',
              choices: [
                { text: '潜心参悟', effect: { exp: 50, per: { ming: 4 } }, result: '静坐半日，似有所悟，剑意隐现。' },
                { text: '抄录于帛', effect: { exp: 25 }, result: '一字一句，誊录而成，留待日后。' }
              ] } },
          { text: '拜别古树', effect: { moral: 2, exp: 10 }, result: '前人遗迹，心存敬畏，悄然离去。' }
        ] } },
    { text: '绕树三匝', effect: { exp: 20, per: { qing: 2 } }, result: '树纹如年轮，触之而悟岁月之功。' },
    { text: '拔剑刻字', effect: { moral: -3, exp: 15 }, result: '剑痕落处，惊起一林宿鸟，心绪不宁。' }
  ] },

{ id: 'g41', name: '采药坠崖', weight: 2, scenes: ['forest'], levelReq: 50,
  desc: '崖边采药人失足悬藤，岌岌可危，呼救声切。',
  choices: [
    { text: '抛绳相救', sub: {
        desc: '藤蔓将断，采药人悬于半空，命悬一线。',
        choices: [
          { text: '奋身拽绳', sub: {
              desc: '你拽紧绳索，脚蹬崖壁，双臂青筋暴起。',
              choices: [
                { text: '拼死拉回', effect: { hp: -30, moral: 5, rep: 3 }, result: '拼力将人拉回，双双跌坐，惊魂方定。' },
                { text: '唤其借力', sub: {
                    desc: '采药人闻言，奋力攀住藤根，借力上纵。',
                    choices: [
                      { text: '合力上拉', effect: { hp: -20, moral: 5, rep: 3 }, result: '二人合力，终将人救上崖来，皆瘫坐喘息。' },
                      { text: '稳住绳端', effect: { hp: -15, moral: 4, rep: 2 }, result: '你稳住绳端，采药人借力攀上，连声道谢。' }
                    ] } }
              ] } },
          { text: '呼人来助', effect: { exp: 15 }, result: '虽未能独力相救，也算尽了心力。' }
        ] } },
    { text: '俯身拉手', effect: { moral: 3, hp: -20 }, result: '千钧一发，硬生生将他拽了上来。' },
    { text: '袖手旁观', effect: { moral: -5, rep: -3 }, result: '你转身离去，身后呼救声渐弱，心中难安。' }
  ] },

{ id: 'g42', name: '狐仙报恩', weight: 1, scenes: ['forest'], levelReq: 55,
  desc: '昔日所救白狐，今化一青衣女子，于月下盈盈一礼。',
  choices: [
    { text: '还礼相询', sub: {
        desc: '女子言谢当年活命之恩，愿以薄礼相赠。',
        choices: [
          { text: '婉言谢绝', effect: { moral: 5, per: { qing: 4 } }, result: '施恩不图报，女子目露敬意，飘然而去。' },
          { text: '问其所赠', sub: {
              desc: '女子摊开素手，掌心一盏青灯，焰色如萤。',
              choices: [
                { text: '接过青灯', effect: { gear: 'lan' }, result: '灯入掌中，温润如玉，照见前尘旧梦，狐踪已杳。' },
                { text: '不受而去', effect: { moral: 3, per: { ming: 3 } }, result: '你摇头不受，女子轻叹一声，化烟而去。' }
              ] } }
        ] } },
    { text: '戒备不语', effect: { exp: 20, per: { ming: 2 } }, result: '女子见你疏离，敛袂一礼，没入林间。' },
    { text: '问其族类', effect: { per: { qing: 3 } }, result: '女子笑而不答，只道缘分已尽，各自珍重。' }
  ] },

{ id: 'g43', name: '溪畔洗剑', weight: 2, scenes: ['forest'], levelReq: 60,
  desc: '溪畔一老剑客临水洗剑，剑光寒冽，映水生霜。',
  choices: [
    { text: '上前求教', sub: {
        desc: '老剑客不答，只缓缓举剑，示意你细看。',
        choices: [
          { text: '凝神观剑', effect: { exp: 60, per: { xia: 4 } }, result: '剑势如虹，一瞬而过，心中剑意渐明。' },
          { text: '拔剑相试', effect: { exp: 35, hp: -40 }, result: '剑未及身，已被剑气压退，方知差距。' }
        ] } },
    { text: '静立旁观', sub: {
        desc: '老剑客洗剑毕，忽将一页残谱掷入水中。',
        choices: [
          { text: '涉水捞谱', sub: {
              desc: '残谱随波飘摇，字迹浸水将散。',
              choices: [
                { text: '捞起誊抄', effect: { exp: 45, per: { ming: 3 } }, result: '抢出残谱，抄得数行，惜已不全。' },
                { text: '任其流去', effect: { moral: 2, exp: 15 }, result: '强求无益，目送残谱漂远。' }
              ] } },
          { text: '不为所动', effect: { exp: 20 }, result: '非己之物，不必强求。' }
        ] } },
    { text: '拱手作别', effect: { rep: 3 }, result: '老剑客颔首，背影没入溪雾。' }
  ] },

{ id: 'g44', name: '枯藤古阵', weight: 1, scenes: ['forest'], levelReq: 70,
  desc: '密林深处，枯藤交错如阵，隐有风雷之声。',
  choices: [
    { text: '入阵探路', sub: {
        desc: '一步踏入，藤影摇晃，方向尽失。',
        choices: [
          { text: '闭目听风', sub: {
              desc: '风声过藤，似有节奏，暗合某种步法。',
              choices: [
                { text: '循声而行', effect: { exp: 65, per: { xia: 4 } }, result: '脚踏风隙，竟一步步走出藤阵。' },
                { text: '硬闯而出', effect: { hp: -50, exp: 30 }, result: '藤蔓抽打，遍体生痕，终见天日。' }
              ] } },
          { text: '攀藤而上', effect: { exp: 35, per: { xia: 2 } }, result: '居高俯视，阵形尽收眼底，豁然开朗。' }
        ] } },
    { text: '绕阵而行', effect: { exp: 20 }, result: '多走半日，终于绕过此阵。' },
    { text: '纵火烧藤', effect: { moral: -4, hp: -20 }, result: '火起之处，惊动林间无数生灵，祸福难料。' }
  ] },

{ id: 'g45', name: '深林遗剑', weight: 1, scenes: ['forest'], levelReq: 80,
  desc: '林海尽头，一柄古剑斜插巨石，剑穗已朽，犹自鸣。',
  choices: [
    { text: '近前观剑', sub: {
        desc: '剑身无主，锈迹间隐见二字，似是一段旧怨。',
        choices: [
          { text: '拔剑一试', effect: { hp: -40, exp: 40 }, result: '剑重千钧，撼之不动，反震得虎口发麻。' },
          { text: '拂去尘泥', sub: {
              desc: '尘泥之下，剑格处刻满蝇头小字，乃一套剑诀。',
              choices: [
                { text: '默诵参悟', effect: { tech: 'jh_zhuifeng' }, result: '剑诀入心，剑鸣渐息，似在静候下一个有缘人。' },
                { text: '拜剑而退', effect: { moral: 4, exp: 30 }, result: '此剑有主，不可妄取，你躬身一拜，飘然离去。' }
              ] } }
        ] } },
    { text: '叩首拜剑', effect: { per: { xia: 3 }, moral: 2 }, result: '剑鸣三声，似有所应，冥冥中似有缘分。' },
    { text: '绕剑察势', effect: { exp: 40, per: { ming: 3 } }, result: '细察剑势，隐隐悟得几分运剑之理。' }
  ] },
{ id: 'g46', name: '渡口老船夫', weight: 2, scenes: ['water'], levelReq: 22,
  desc: '古渡无人，一叶扁舟横在芦花浅水处。',
  choices: [
    { text: '付银渡江', effect: { gold: -20, exp: 15 }, result: '老船夫摇橹不疾不徐，江风拂面，你安然抵岸。' },
    { text: '自划小舟', sub: {
        desc: '你解缆自划，舟行江心，忽遇暗流急涌。',
        choices: [
          { text: '运功稳住舟身', effect: { exp: 20, hp: -15 }, result: '你沉腰运劲，险险渡过暗流。' },
          { text: '弃舟踏水', sub: {
              desc: '浪高数尺，你纵身弃舟，踏波而行。',
              choices: [
                { text: '借浪而行', effect: { per: { ming: 3 }, exp: 25 }, result: '你在浪尖起落，如履平地，安然登岸。' },
                { text: '沉心渡水', effect: { exp: 30, mp: 20 }, result: '你屏息凝神，水到渠成，渡至对岸。' }
              ] } }
        ] } }
  ] },

{ id: 'g47', name: '渔家船娘', weight: 2, scenes: ['water'], levelReq: 27,
  desc: '船娘摇着乌篷，唱起渔歌，歌声清亮入云。',
  choices: [
    { text: '听歌解囊', effect: { gold: -30, moral: 3 }, result: '你赠银一锭，船娘含笑敛身，道声多谢。' },
    { text: '邀她载客', sub: {
        desc: '你登船落座，船娘递来一盏温热的江米酒。',
        choices: [
          { text: '小酌一杯', effect: { hp: 25, exp: 10 }, result: '酒入喉暖，连日风尘一扫而空。' },
          { text: '问水中传闻', sub: {
              desc: '船娘压低声音，说这江底有座水府，夜半常闻龙吟。',
              choices: [
                { text: '追根问底', effect: { exp: 35, per: { qing: 3 } }, result: '她道水府不渡凡人，只渡有缘，言罢不再多说。' },
                { text: '付银求指引', effect: { gold: -50, exp: 40, item: 'random' }, result: '船娘收银，塞给你一枚温润的水玉，说能避水。' }
              ] } }
        ] } }
  ] },

{ id: 'g48', name: '水匪拦江', weight: 2, scenes: ['water'], levelReq: 33,
  desc: '数条快舟横江而来，为首大汉喝道：留下买路钱！',
  choices: [
    { text: '交银买路', effect: { gold: -80, exp: 10 }, result: '水匪收银放行，你忍一时之气，平安过江。' },
    { text: '拔剑相抗', sub: {
        desc: '你仗剑而立，水匪呼哨一声，四面合围。',
        choices: [
          { text: '擒贼先擒王', effect: { exp: 45, hp: -40, rep: 4 }, result: '你踏舟跃出，一剑逼退匪首，余众溃散。' },
          { text: '且战且退', sub: {
              desc: '你剑光护身，且战且退，退至一处芦苇深处。',
              choices: [
                { text: '借苇伏击', effect: { exp: 50, gold: 60 }, result: '你隐于芦丛，反手制住追来的水匪，搜得银两。' },
                { text: '沉舟遁走', effect: { exp: 30, hp: -30 }, result: '你击沉小舟，趁乱潜行而去，虽险得脱。' }
              ] } }
        ] } }
  ] },

{ id: 'g49', name: '夜航水鬼', weight: 2, scenes: ['water'], levelReq: 39,
  desc: '夜半行船，江面忽起白雾，雾中似有哭声。',
  choices: [
    { text: '凝神静坐', effect: { exp: 20, mp: 30 }, result: '你守定心神，哭声渐远，雾散天明。' },
    { text: '循声探看', sub: {
        desc: '你循声望去，雾中浮着一点惨白，似有人影。',
        choices: [
          { text: '朗声喝问', effect: { moral: 3, exp: 25 }, result: '你一声断喝，白影一颤，缓缓沉入水中。' },
          { text: '掷符驱邪', sub: {
              desc: '你取符一掷，符光炸开，水鬼尖啸而退。',
              choices: [
                { text: '追而不舍', effect: { exp: 40, per: { gang: 3 } }, result: '你追出里许，见一沉船，捞起半箱遗物。' },
                { text: '念经超度', effect: { moral: 5, exp: 35 }, result: '你诵经超度，水鬼怨气渐消，江面复平。' }
              ] } }
        ] } }
  ] },

{ id: 'g50', name: '龙宫传说', weight: 2, scenes: ['water'], levelReq: 52,
  desc: '江心漩涡骤起，金光一线，直贯水底。',
  choices: [
    { text: '静观其变', effect: { exp: 25, mp: 25 }, result: '金光渐隐，漩涡归于平静，仿佛一场幻梦。' },
    { text: '循光下潜', sub: {
        desc: '你闭气下潜，金光引你入一座水府，珠贝为檐。',
        choices: [
          { text: '叩府而问', sub: {
              desc: '府门自开，一道空灵声音问：所为何来？',
              choices: [
                { text: '求问武道', effect: { tech: 'jh_polang', exp: 40 }, result: '那声音道：破浪者，先破心中之浪。言罢金光没入你眉心。' },
                { text: '言寻有缘', effect: { exp: 45, per: { qing: 4 } }, result: '水府一声长叹，道你本是有缘人，赠你一缕水息。' }
              ] } },
          { text: '掬水问缘', sub: {
              desc: '你掬起一捧府前之水，水中映出一张陌生而熟悉的容颜。',
              choices: [
                { text: '深究映象', effect: { per: { ming: 4 }, exp: 35 }, result: '你凝神看去，映象微笑而散，只余满手清光。' },
                { text: '拜谢而归', effect: { exp: 30, mp: 40 }, result: '你长揖一礼，水府渐隐，你浮出江面，如获新生。' }
              ] } }
        ] } }
  ] },

{ id: 'g51', name: '江上浮尸', weight: 2, scenes: ['water'], levelReq: 44,
  desc: '一具浮尸顺流而下，面朝下，辨不清来路。',
  choices: [
    { text: '打捞安葬', effect: { moral: 4, exp: 15 }, result: '你捞起遗体择地安葬，也算积一桩阴德。' },
    { text: '翻查遗物', sub: {
        desc: '你近前一看，尸身衣襟里似有硬物。',
        choices: [
          { text: '取物细看', effect: { gold: 40, item: 'random' }, result: '你取出一枚油布包裹，内有银两与一封血书。' },
          { text: '先寻线索', sub: {
              desc: '你细察尸身伤口，乃是一剑穿心，剑势狠辣。',
              choices: [
                { text: '循血迹追凶', effect: { exp: 40, rep: 3 }, result: '你沿血迹追寻，终在芦苇荡擒住一名凶手。' },
                { text: '报官了结', effect: { moral: 3, rep: 2 }, result: '你报与官差，此案渐明，也算替亡者伸冤。' }
              ] } }
        ] } }
  ] },

{ id: 'g52', name: '渡口赌局', weight: 2, scenes: ['water'], levelReq: 30,
  desc: '渡口茶寮里，几名水客正掷骰豪赌，声浪震天。',
  choices: [
    { text: '袖手旁观', effect: { exp: 10, mp: 15 }, result: '你看了一阵，江湖百态，尽在方寸之间。' },
    { text: '下场一搏', sub: {
        desc: '你抛出一锭银，道：算我一个。众人哄然让座。',
        choices: [
          { text: '凭运气', effect: { gold: 50, exp: 20 }, result: '你手气正旺，连赢数把，赢了五十两收手。' },
          { text: '凭手法', sub: {
              desc: '你暗运指力，骰子应声而转。',
              choices: [
                { text: '点到为止', effect: { gold: 80, moral: -2 }, result: '你略施小计赢下银两，抽身而去。' },
                { text: '揭穿老千', effect: { rep: 4, moral: 3 }, result: '你当众拆穿庄家出千，众人哗然，敬你一身正气。' }
              ] } }
        ] } }
  ] },

{ id: 'g53', name: '沉船遗宝', weight: 2, scenes: ['water'], levelReq: 48,
  desc: '渔人打捞时惊呼：江底有条沉船，怕有宝贝！',
  choices: [
    { text: '不趟浑水', effect: { exp: 10, moral: 2 }, result: '你冷眼旁观，江湖处处是局，不贪为安。' },
    { text: '下探沉船', sub: {
        desc: '你潜入江底，沉船腐朽，舱中似有微光。',
        choices: [
          { text: '直取宝箱', effect: { gold: 90, exp: 35 }, result: '你劈开舱门取出一箱银钱，浮出水面。' },
          { text: '细察微光', sub: {
              desc: '那微光源自一枚玉珠，温润如活物。',
              choices: [
                { text: '取珠而归', effect: { item: 'random', exp: 30, per: { ming: 3 } }, result: '你取走玉珠，登岸时它已温润如握暖阳。' },
                { text: '留珠于船', effect: { moral: 4, exp: 25 }, result: '你不动此物，长揖而去，心中一片澄明。' }
              ] } }
        ] } }
  ] },

{ id: 'g54', name: '寒江垂钓', weight: 2, scenes: ['water'], levelReq: 58,
  desc: '江畔独坐一蓑衣老翁，垂钓寒江，纹丝不动。',
  choices: [
    { text: '静坐相陪', effect: { mp: 30, exp: 20 }, result: '你陪坐半日，心随流水，渐入空明之境。' },
    { text: '上前请教', sub: {
        desc: '老翁头也不回：鱼不上钩，是心太急。',
        choices: [
          { text: '受教而悟', effect: { exp: 45, per: { qing: 3 } }, result: '你默然良久，如有所悟，谢过老翁。' },
          { text: '问其来路', sub: {
              desc: '老翁笑道：来处来，去处去。',
              choices: [
                { text: '追问不休', effect: { exp: 40, per: { ming: 4 } }, result: '他不再答，只缓缓收竿，遁入江雾之中。' },
                { text: '长揖辞别', effect: { moral: 3, exp: 25 }, result: '你知是高人，长揖一礼，转身踏上征途。' }
              ] } }
        ] } }
  ] },

{ id: 'g55', name: '白鱼渡劫', weight: 2, scenes: ['water'], levelReq: 66,
  desc: '江心忽跃起一尾白鱼，银鳞映日，似在叩拜苍天。',
  choices: [
    { text: '静立观礼', effect: { exp: 30, mp: 30 }, result: '你静立船头，见白鱼三跃，隐入深流。' },
    { text: '近前护法', sub: {
        desc: '你纵身踏水，护在白鱼左右，挡开几道暗箭。',
        choices: [
          { text: '击退射鱼者', effect: { rep: 4, exp: 35 }, result: '你震退暗箭之人，白鱼回首，似有感激之意。' },
          { text: '以气护水', sub: {
              desc: '你运功护住一片水域，白鱼于你身畔盘旋不去。',
              choices: [
                { text: '受其馈赠', effect: { gear: 'lan', exp: 40 }, result: '白鱼吐出一枚碧玉，落入你手。你方知它已化龙而去，此玉名兰，暗香不绝。' },
                { text: '目送化龙', effect: { per: { qing: 5 }, exp: 45 }, result: '你目送白鱼化龙腾空，天光一瞬，照彻江天。' }
              ] } }
        ] } }
  ] },

{ id: 'g56', name: '风雨渡口', weight: 2, scenes: ['water'], levelReq: 84,
  desc: '风骤雨急，渡口封船，行人尽作望江之叹。',
  choices: [
    { text: '冒雨赶路', effect: { hp: -20, exp: 15 }, result: '你披雨而行，虽湿透衣衫，终抵前路。' },
    { text: '助人撑船', sub: {
        desc: '一船载满妇孺，船夫力竭，眼看要翻。',
        choices: [
          { text: '出手稳船', effect: { moral: 4, rep: 3, exp: 25 }, result: '你跳上船帮，运功压浪，助一船人平安靠岸。' },
          { text: '以身为桨', sub: {
              desc: '你夺过船篙，逆流而上，双臂如铁。',
              choices: [
                { text: '坚持到底', effect: { exp: 40, moral: 3, hp: -30 }, result: '你力竭靠岸，满船妇孺叩谢恩情。' },
                { text: '传功船夫', effect: { exp: 30, talent: 1 }, result: '你教他数式运劲法门，此后船夫撑船如履平地。' }
              ] } }
        ] } }
  ] },
{ id: 'g57', name: '绿洲饮马', weight: 2, scenes: ['desert'], levelReq: 46,
  desc: '烈日炙沙，忽见一弯绿洲，清泉映天，宛如幻境。',
  choices: [
    { text: '掬水饮马，稍作歇息', effect: { hp: 40, exp: 15 }, result: '清泉入喉，暑气顿消，人马俱安。' },
    { text: '循水声深入查看', sub: {
        desc: '绿洲深处，一匹野马临水而立，毛色如银。',
        choices: [
          { text: '以草料相诱', effect: { exp: 30 }, result: '野马受惊，长嘶而去，唯余蹄印没于沙中。' },
          { text: '悄然逼近欲驯服', sub: {
              desc: '野马警觉，昂首回望，双目如电。',
              choices: [
                { text: '施展驯马之术', effect: { talent: 1 }, result: '僵持半日，野马终低下头，随你而行。' },
                { text: '放手任它自去', effect: { rep: 3, moral: 3 }, result: '你负手而立，目送银影没入沙海。' }
              ] } }
        ] } }
  ] },

{ id: 'g58', name: '胡商驼队', weight: 2, scenes: ['desert'], levelReq: 48,
  desc: '驼铃叮当，一队胡商自沙丘后缓缓转出。',
  choices: [
    { text: '上前攀谈问路', sub: {
        desc: '领队胡商掀开面巾，笑露白齿，汉话生硬。',
        choices: [
          { text: '问前方水源', effect: { exp: 20 }, result: '胡商指点，往西三日有古井，水微咸。' },
          { text: '问沙漠凶险处', sub: {
              desc: '胡商面色一沉，压低了声音。',
              choices: [
                { text: '递上银两细问', effect: { gold: -20, exp: 35 }, result: '得了要紧消息，你拱手别过，再赴路途。' },
                { text: '拱手谢过', effect: { rep: 2 }, result: '胡商叹道，江湖人各有命数，莫强求。' }
              ] } }
        ] } },
    { text: '愿否结伴同行', effect: { gold: 50, exp: 25 }, result: '同行一程，胡商感你仗义，赠了些许盘缠。' }
  ] },

{ id: 'g59', name: '沙匪劫道', weight: 2, scenes: ['desert'], levelReq: 50,
  desc: '沙尘骤起，十数骑沙匪呼啸围来，弯刀映日。',
  choices: [
    { text: '拔剑迎敌', sub: {
        desc: '为首悍匪怪笑一声，提刀纵马扑至。',
        choices: [
          { text: '先声夺人，直取匪首', sub: {
              desc: '你长啸一声，纵身迎上，剑光直指匪首咽喉。',
              choices: [
                { text: '拼力一剑，分出生死', effect: { exp: 45, rep: 3 }, result: '血战一场，沙匪溃散，余者遁入黄沙。' },
                { text: '点到即止，留其性命', effect: { exp: 30, moral: 2 }, result: '剑尖抵喉，匪首弃刀跪地，连声告饶。' }
              ] } },
          { text: '且战且退，寻隙突围', effect: { hp: -30, exp: 30 }, result: '你且战且退，终脱重围，臂上添了道血口。' }
        ] } },
    { text: '以财消灾', effect: { gold: -60, exp: 10 }, result: '抛下钱袋，沙匪呼啸拾去，扬长而去。' }
  ] },

{ id: 'g60', name: '海市蜃楼', weight: 2, scenes: ['desert'], levelReq: 53,
  desc: '极目处楼阁林立，商旅往来，恍若盛世古城。',
  choices: [
    { text: '策马奔向幻城', effect: { hp: -20, exp: 20 }, result: '追出十余里，幻影依旧，你口干舌燥，哑然失笑。' },
    { text: '静立观其生灭', sub: {
        desc: '日头西移，楼阁渐次淡去，如烟如雾。',
        choices: [
          { text: '闭目调息，悟其中幻理', sub: {
              desc: '你盘膝而坐，气沉丹田，眼前幻象与识海交织。',
              choices: [
                { text: '心若止水，任幻自去', effect: { mp: 30, exp: 30 }, result: '虚实一念，你胸中似有所悟。' },
                { text: '逆观其源，追索幻根', effect: { mp: 20, exp: 40 }, result: '你窥得一丝幻象根由，似真似幻，难以尽述。' }
              ] } },
          { text: '记下方位，留待他日', effect: { exp: 15 }, result: '你在心中默记，转身离去，不复回头。' }
        ] } }
  ] },

{ id: 'g61', name: '古国遗迹', weight: 2, scenes: ['desert'], levelReq: 57,
  desc: '断壁残垣半埋黄沙，石柱上刻着斑驳古字。',
  choices: [
    { text: '拂去浮沙，细辨铭文', sub: {
        desc: '字迹剥蚀，依稀是数百年前的国号。',
        choices: [
          { text: '拓印碑文', effect: { exp: 40 }, result: '你拓得残碑数行，或可换得识者青眼。' },
          { text: '深入废墟探寻', sub: {
              desc: '废墟深处，一扇石门半掩，寒气自缝中渗出。',
              choices: [
                { text: '以掌推门', effect: { gold: 80, exp: 35 }, result: '门内空荡，唯几件古器尚存，可换银钱。' },
                { text: '退身不扰亡者', effect: { moral: 4, rep: 2 }, result: '你对古国一揖，默然退去。' }
              ] } }
        ] } },
    { text: '登高远眺遗迹全貌', effect: { exp: 20 }, result: '登上残台，唯见黄沙万里，苍凉入骨。' }
  ] },

{ id: 'g62', name: '风沙迷途', weight: 2, scenes: ['desert'], levelReq: 61,
  desc: '黑风骤起，黄沙蔽日，天地间只余呼啸。',
  choices: [
    { text: '伏于沙丘背风处', effect: { hp: -15, exp: 20 }, result: '风沙过后，你抖落满身沙土，重辨方向。' },
    { text: '以星辰辨向而行', sub: {
        desc: '风沙稍歇，你仰观星斗，辨得西北方位。',
        choices: [
          { text: '循星而行', sub: {
              desc: '星斗在云隙间明灭，你踏沙而行，不敢稍歇。',
              choices: [
                { text: '认准北辰，一气赶路', effect: { exp: 30 }, result: '星辉引路，你终走出风区。' },
                { text: '时而观星，时而辨风', effect: { exp: 20, hp: 15 }, result: '行行止止，你以星辨向，稳步出了风区。' }
              ] } },
          { text: '暂宿一处，天明再行', effect: { hp: 30 }, result: '你寻了避风处，将养一夜，元气渐复。' }
        ] } }
  ] },

{ id: 'g63', name: '月牙泉', weight: 2, scenes: ['desert'], levelReq: 65,
  desc: '沙山环抱中，一泓碧水弯如新月，清冽照人。',
  choices: [
    { text: '俯身掬饮', effect: { hp: 50, mp: 20 }, result: '泉水甘冽，凉意透骨，疲乏尽去。' },
    { text: '绕泉而行，寻其源头', sub: {
        desc: '泉畔芦苇丛生，一缕水气自沙隙升起。',
        choices: [
          { text: '以指探沙隙', effect: { exp: 25 }, result: '指尖一凉，原来暗河潜行于沙下。' },
          { text: '就泉畔打坐吐纳', sub: {
              desc: '月升中天，泉面浮起淡淡清光。',
              choices: [
                { text: '引气归元', effect: { mp: 40, exp: 30 }, result: '清光入体，经脉间似有凉泉流转。' },
                { text: '掬水浣剑', effect: { exp: 20 }, result: '剑入清泉，冷光一闪，锋刃愈利。' }
              ] } }
        ] } }
  ] },

{ id: 'g64', name: '骆驼引路', weight: 2, scenes: ['desert'], levelReq: 69,
  desc: '一头无主骆驼拦在路中，颈铃轻响，似有所求。',
  choices: [
    { text: '解下它的辔头', effect: { exp: 15, moral: 2 }, result: '骆驼低鸣一声，如释重负。' },
    { text: '随它而去', sub: {
        desc: '骆驼转身，缓缓走向沙海深处。',
        choices: [
          { text: '信步跟随', sub: {
              desc: '行至日落，骆驼停在一处沙丘，以蹄刨沙。',
              choices: [
                { text: '拨开浮沙', effect: { gold: 70, exp: 30 }, result: '沙下埋着一只旧箱，内有散碎金银。' },
                { text: '抚其项而别', effect: { rep: 3 }, result: '你拍拍骆驼，任它自去，夕阳如血。' }
              ] } },
          { text: '止步不随', effect: { exp: 10 }, result: '骆驼驻足回望，终是没入风沙。' }
        ] } }
  ] },

{ id: 'g65', name: '老驼夫', weight: 2, scenes: ['desert'], levelReq: 74,
  desc: '篝火旁，一老驼夫佝偻而坐，面纹深如刀刻。',
  choices: [
    { text: '讨碗水喝，闲话几句', effect: { exp: 20 }, result: '老驼夫递来半瓢浊水，问你往何处去。' },
    { text: '席地而坐，听他讲古', sub: {
        desc: '老驼夫望向火堆，缓缓道起大漠旧事。',
        choices: [
          { text: '问当年大漠第一刀客', effect: { exp: 35 }, result: '老人一笑，说那人早埋进了风里。' },
          { text: '问他缘何孤身', sub: {
              desc: '老人沉默良久，火光明灭不定。',
              choices: [
                { text: '为他添柴续火', effect: { moral: 3 }, result: '火光一亮，老人眼中似有泪光一闪。' },
                { text: '静候其言', effect: { tech: 'jh_liehuo' }, result: '老人以指为笔，在沙上画下一套身法，烈焰之势，刻入你心。' }
              ] } }
        ] } }
  ] },

{ id: 'g66', name: '沙漠古墓', weight: 2, scenes: ['desert'], levelReq: 80,
  desc: '风蚀崖壁下，现出一孔黑洞，内里幽深无光。',
  choices: [
    { text: '点起火折，入内一探', sub: {
        desc: '火光摇动，照见石室中一具棺椁，漆色如新。',
        choices: [
          { text: '搜寻陪葬之物', effect: { gold: 90, exp: 30 }, result: '你取了几件金玉，指尖却微微发凉。' },
          { text: '对棺椁行礼，退出墓室', effect: { moral: 5, rep: 2 }, result: '你退身而出，将洞口以沙掩了。' }
        ] } },
    { text: '于洞口静观良久', sub: {
        desc: '暮色四合，洞中似有极轻的叹息随风散去。',
        choices: [
          { text: '不惊亡灵，悄然离去', effect: { exp: 25 }, result: '你转身离去，背后是无言的黄沙。' },
          { text: '再入最深一层', sub: {
              desc: '石阶盘旋而下，尽头是一方剑台，斜插一剑。',
              choices: [
                { text: '拔取宝剑', effect: { gear: 'lan' }, result: '剑出如虹，寒芒映壁，剑名"阑珊"，余韵悠长。' },
                { text: '只取剑穗，不取剑身', effect: { rep: 4 }, result: '你取一缕剑穗系于腕上，那剑仍静候有缘之人。' }
              ] } }
        ] } }
  ] },

{ id: 'g67', name: '落日孤骑', weight: 2, scenes: ['desert'], levelReq: 88,
  desc: '大漠孤烟直，长河落日圆，天地辽阔无垠。',
  choices: [
    { text: '策马独行，融入暮色', effect: { exp: 30 }, result: '马蹄踏碎残阳，你的身影没入苍茫。' },
    { text: '驻马而立，远眺归途', sub: {
        desc: '风过处，沙纹如浪，起伏不定。',
        choices: [
          { text: '闭目听风', effect: { mp: 30, exp: 25 }, result: '风中有驼铃、有沙鸣，皆是大漠天籁。' },
          { text: '提气纵马，疾驰而下', sub: {
              desc: '沙丘陡峭，你纵马而下，身后扬起一条沙龙。',
              choices: [
                { text: '一气到底', effect: { exp: 40 }, result: '你如离弦之箭，直贯而下，胸中郁气尽扫。' },
                { text: '勒马缓行', effect: { hp: 20 }, result: '你勒住缰绳，缓缓而下，心神安宁。' }
              ] } }
        ] } }
  ] },
{ id: 'g68', name: '乱葬岗拾骨', weight: 2, scenes: ['graveyard'], levelReq: 18,
  desc: '乱葬岗白骨半掩，一只野狗衔骨奔行。',
  choices: [
    { text: '驱狗掩骨', effect: { exp: 20, per: { xia: 2 } }, result: '你赶走野狗，掩骨成丘，心中稍安。' },
    { text: '尾随野狗', sub: {
        desc: '野狗钻入浅坑，坑中似有布帛之物。',
        choices: [
          { text: '掘坑查看', effect: { gold: 40 }, result: '坑底埋着几两碎银与一块残牌。' },
          { text: '合掌而退', sub: {
              desc: '坑中白骨累累，阴气森然可怖。',
              choices: [
                { text: '诵经超度', effect: { moral: 3, exp: 15 }, result: '你低声诵经，阴风渐渐散去。' },
                { text: '悄然离去', effect: { hp: -10 }, result: '你转身之际，似有冷气透骨而入。' }
              ] } }
        ] } }
  ] },

{ id: 'g69', name: '义庄守夜', weight: 2, scenes: ['graveyard'], levelReq: 22,
  desc: '义庄老门虚掩，一盏孤灯在夜风中明灭。',
  choices: [
    { text: '推门借宿', sub: {
        desc: '堂中停着几口薄棺，烛火映得人影摇晃。',
        choices: [
          { text: '守到天明', effect: { exp: 25, per: { ming: 2 } }, result: '一夜无惊，晨光透入，你竟觉神清气爽。' },
          { text: '掀开薄棺', sub: {
              desc: '棺中躺着一具面如生人的尸首。',
              choices: [
                { text: '以符镇之', effect: { exp: 30, item: 'random' }, result: '尸首纹丝不动，你得了守夜人的一件旧物。' },
                { text: '合棺封门', effect: { moral: 2 }, result: '你合上棺盖，默念往生，悄然退出。' }
              ] } }
        ] } },
    { text: '绕庄而行', effect: { gold: 15, hp: -5 }, result: '你摸黑绕行，绊了一跤，拾得几枚铜钱。' }
  ] },

{ id: 'g70', name: '荒坟鬼火', weight: 2, scenes: ['graveyard'], levelReq: 26,
  desc: '夜半荒坟，点点鬼火飘忽，忽远忽近。',
  choices: [
    { text: '静观其变', effect: { exp: 30, per: { ming: 3 } }, result: '你屏息而立，鬼火绕身三匝，终自散去。' },
    { text: '循火而去', sub: {
        desc: '鬼火引你至一座残碑之前，碑文斑驳。',
        choices: [
          { text: '抚碑细读', effect: { item: 'random' }, result: '碑下压着一枚旧物，似是前人遗赠。' },
          { text: '掘碑一观', sub: {
              desc: '碑下泥土松软，隐有暗穴。',
              choices: [
                { text: '探手入穴', effect: { gold: 60, hp: -15 }, result: '你摸出几两散银，臂上却多了几道抓痕。' },
                { text: '以石封穴', effect: { moral: 3 }, result: '你搬石封穴，鬼火顿灭，四下寂然。' }
              ] } }
        ] } }
  ] },

{ id: 'g71', name: '赶尸纸钱', weight: 2, scenes: ['graveyard'], levelReq: 30,
  desc: '山路尽头，一队尸身随铃而行，纸钱漫天。',
  choices: [
    { text: '让到一旁', effect: { rep: 2, moral: 1 }, result: '你侧身让路，赶尸人拱手致谢。' },
    { text: '上前盘问', sub: {
        desc: '赶尸人面沉如水，手中铜铃微微一晃。',
        choices: [
          { text: '道明来意', effect: { exp: 28 }, result: '赶尸人见你坦荡，指点了几句湘西赶尸的门道。' },
          { text: '强拦尸队', sub: {
              desc: '尸身齐停，一股尸气扑面而来。',
              choices: [
                { text: '运功相抗', effect: { hp: -25, exp: 20 }, result: '你硬受尸气，逼退赶尸人，得了半册残页。' },
                { text: '退避三舍', effect: { hp: -5 }, result: '你疾退数步，那尸队复又摇铃而去。' }
              ] } }
        ] } }
  ] },

{ id: 'g72', name: '招魂幡动', weight: 2, scenes: ['graveyard'], levelReq: 35,
  desc: '荒野中立一杆招魂幡，白幡无风自动。',
  choices: [
    { text: '绕幡而过', effect: { exp: 18 }, result: '你目不斜视，快步离去，冷汗湿了后背。' },
    { text: '近前查看', sub: {
        desc: '幡下摆着香烛供果，似有未干的血迹。',
        choices: [
          { text: '替亡者续香', effect: { moral: 4 }, result: '你续上三炷香，幡身渐止，心下一片澄明。' },
          { text: '拔幡细看', sub: {
              desc: '幡杆入手冰凉，仿佛有人在你耳边低语。',
              choices: [
                { text: '凝神听音', effect: { exp: 30, moral: 2 }, result: '那低语似在指点你阴阳轮转之理。' },
                { text: '弃幡急走', effect: { hp: -20 }, result: '你抛下幡杆狂奔，身后阴风久久不息。' }
              ] } }
        ] } }
  ] },

{ id: 'g73', name: '阴风古墓', weight: 2, scenes: ['graveyard'], levelReq: 42,
  desc: '暴雨冲开一座古墓，墓道幽深，阴风阵阵。',
  choices: [
    { text: '不入险地', effect: { moral: 1 }, result: '你记下方位，转身离去，留待来日。' },
    { text: '举火入墓', sub: {
        desc: '墓道两侧壁画斑驳，尽是先代剑客遗风。',
        choices: [
          { text: '观壁悟剑', effect: { exp: 45, per: { gang: 3 } }, result: '你凝望剑痕，胸中自有一股剑气流转。' },
          { text: '深入主室', sub: {
              desc: '主室中央停一石棺，棺盖半开。',
              choices: [
                { text: '取棺中之物', effect: { gold: 90, hp: -30 }, result: '你取出一匣金银，却被棺中腐气所伤。' },
                { text: '叩棺三拜', sub: {
                    desc: '石棺微震，似有亡魂回应。',
                    choices: [
                      { text: '诚心许愿', effect: { talent: 1 }, result: '冥冥中似有回响，你只觉灵台清明，根骨渐开。' },
                      { text: '抽身出墓', effect: { rep: 2 }, result: '你不贪不惧，安然退出，江湖人闻之皆敬。' }
                    ] } }
              ] } }
        ] } }
  ] },

{ id: 'g74', name: '守夜老人', weight: 2, scenes: ['graveyard'], levelReq: 50,
  desc: '坟地一角，白发老人独坐守夜，篝火将熄。',
  choices: [
    { text: '添柴问路', sub: {
        desc: '老人抬眼看你，眼里似有阅尽生死的平静。',
        choices: [
          { text: '请教生死', effect: { exp: 40, moral: 2 }, result: '老人只道：活着的人，才怕坟。你默然良久。' },
          { text: '问江湖旧事', sub: {
              desc: '老人添了把柴，火光映出满手老茧。',
              choices: [
                { text: '静听往事', effect: { per: { qing: 3 }, rep: 2 }, result: '一段旧怨娓娓道来，你听得入神。' },
                { text: '以酒相赠', sub: {
                    desc: '老人接过酒囊，仰头饮尽，长叹一声。',
                    choices: [
                      { text: '陪他守到天明', effect: { moral: 4, exp: 20 }, result: '天光破晓，老人笑着拍了拍你的肩。' },
                      { text: '起身辞行', effect: { gold: 30 }, result: '老人塞给你几两散银，道是酒钱。' }
                    ] } }
              ] } }
        ] } },
    { text: '远远避开', effect: { hp: 5 }, result: '你未打扰那守夜人，独自歇了一夜。' }
  ] },

{ id: 'g75', name: '义庄借宿', weight: 2, scenes: ['graveyard'], levelReq: 58,
  desc: '夜雨滂沱，义庄是方圆数里唯一的屋檐。',
  choices: [
    { text: '敲门投宿', sub: {
        desc: '门开处，一老者持灯而望，面色蜡黄。',
        choices: [
          { text: '说明来意', effect: { exp: 35 }, result: '老者让你歇在偏房，一夜安然。' },
          { text: '察觉有异', sub: {
              desc: '你隐约闻到一股尸油的气味。',
              choices: [
                { text: '假寐探察', effect: { item: 'random', hp: -10 }, result: '你暗中查探，得了件物什，也受了些寒气。' },
                { text: '以剑试之', sub: {
                    desc: '老者忽然转头，瞳孔幽绿如鬼。',
                    choices: [
                      { text: '一剑逼退', effect: { exp: 50, per: { gang: 3 } }, result: '你剑出如虹，那老者化作青烟遁去。' },
                      { text: '破窗而出', effect: { hp: -20 }, result: '你撞破窗棂，淋雨奔出，惊魂未定。' }
                    ] } }
              ] } }
        ] } }
  ] },

{ id: 'g76', name: '无主孤坟', weight: 2, scenes: ['graveyard'], levelReq: 66,
  desc: '孤坟无碑，坟头荒草间露出一角青布。',
  choices: [
    { text: '拔草祭扫', effect: { moral: 4 }, result: '你拔去荒草，添了新土，坟头竟似亮了一分。' },
    { text: '揭开青布', sub: {
        desc: '青布之下，是一只尘封多年的旧包袱。',
        choices: [
          { text: '打开包袱', sub: {
              desc: '包袱里别无长物，唯有一柄无鞘长剑。',
              choices: [
                { text: '持剑而起', effect: { gear: 'lan' }, result: '剑身如水，寒光逼人。你仿佛听见旧主低叹：剑赠有缘。' },
                { text: '重埋剑归', effect: { rep: 3, moral: 3 }, result: '你包剑重埋，长揖三拜，江湖自此传你重义。' }
              ] } },
          { text: '合土不动', effect: { exp: 25 }, result: '你掩好青布，心中忽有所悟，转身离去。' }
        ] } }
  ] },

{ id: 'g77', name: '古墓剑痕', weight: 2, scenes: ['graveyard'], levelReq: 75,
  desc: '塌陷的古墓壁上，几道剑痕深可没指。',
  choices: [
    { text: '拓下剑痕', effect: { exp: 55, per: { gang: 4 } }, result: '你临摹剑痕，只觉其中意蕴深不可测。' },
    { text: '以剑相和', sub: {
        desc: '你拔剑照痕而舞，墓中忽起回响。',
        choices: [
          { text: '随痕悟招', sub: {
              desc: '剑痕连成一式，正是失传的残剑遗意。',
              choices: [
                { text: '尽悟其意', effect: { tech: 'jh_xiujian' }, result: '最后一剑落下，你仿佛看见执剑人的背影，转眼又散。' },
                { text: '存疑而去', effect: { exp: 30 }, result: '你强记剑痕，只觉差了一线，怅然而去。' }
              ] } },
          { text: '以掌覆痕', effect: { hp: -15, moral: 2 }, result: '你以掌覆痕，默祭先贤，臂上多了道旧痕。' }
        ] } }
  ] },

{ id: 'g78', name: '乱葬岗超度', weight: 2, scenes: ['graveyard'], levelReq: 90,
  desc: '乱葬岗怨气郁结，孤魂野鬼哀声不绝。',
  choices: [
    { text: '诵经超度', sub: {
        desc: '你盘坐中央，梵音自起，阴风为之稍敛。',
        choices: [
          { text: '诚心渡亡', effect: { moral: 6, rep: 4 }, result: '万鬼俯首，怨气尽散，你只觉心中大光明。' },
          { text: '分神察异', sub: {
              desc: '诵经声中，你窥见一丝不寻常的阴气。',
              choices: [
                { text: '循气追去', effect: { exp: 60 }, result: '你追至一处深穴，得见多年前的一桩旧案。' },
                { text: '定心守一', sub: {
                    desc: '阴气翻涌，似有厉鬼阻你功德。',
                    choices: [
                      { text: '以力镇之', effect: { per: { xia: 4 }, exp: 40 }, result: '你一力镇下，孤魂皆服，四野复归平静。' },
                      { text: '以身渡之', effect: { talent: 1, hp: -40 }, result: '你舍身渡鬼，元气大伤，却觉心境空明。' }
                    ] } }
              ] } }
        ] } },
    { text: '布阵封怨', effect: { gold: 50, rep: 2 }, result: '你布阵封住怨气，乡民感念，赠银相谢。' }
  ] },
{ id: 'g79', name: '守山门人', weight: 2, scenes: ['sect'], levelReq: 26,
  desc: '山门半掩，石阶覆苔。一白发老仆倚帚而坐，双目似闭未闭。',
  choices: [
    { text: '上前见礼，问山门规矩', effect: { exp: 20, rep: 2 }, result: '老仆睁眼，道一句"心正门自开"，你只觉胸中澄明了几分。' },
    { text: '帮他扫净阶前落叶', effect: { moral: 3, exp: 15 }, result: '帚声沙沙，落叶归堆。老仆颔首，赠你一盏山泉，清冽入骨。' },
    { text: '求他指点入门之路', sub: {
        desc: '老仆不答，只以帚柄在地上划出三道横线，深浅不一。',
        choices: [
          { text: '细观三道横线，久久沉吟', effect: { exp: 30, per: { xia: 2 } }, result: '横线如剑痕，你忽有所悟，仿佛窥见几式剑意。' },
          { text: '再拜请教，愿闻其详', sub: {
              desc: '老仆笑而不语，拂袖起身，示意你随他绕至后山。',
              choices: [
                { text: '随行听训，不敢怠慢', effect: { exp: 40, rep: 3 }, result: '后山松涛阵阵，老人传你一句吐纳口诀，气息为之一畅。' },
                { text: '驻足自忖，悟那留白', effect: { exp: 25, per: { ming: 2 } }, result: '你于原地静立，渐觉扫地亦是修行，心下一片空明。' }
              ] } }
        ] } }
  ] },
{ id: 'g80', name: '演武较技', weight: 2, scenes: ['sect'], levelReq: 30,
  desc: '校场之上，众弟子轮番过招，喝彩声此起彼伏。一位师兄抱剑邀你下场。',
  choices: [
    { text: '抱拳下场，点到即止', effect: { exp: 35, rep: 3 }, result: '数合之后，你们同时收招。师兄拱手道一句"承让"，观者皆赞。' },
    { text: '自陈武艺低微，婉言推辞', effect: { moral: 2, exp: 10 }, result: '你退至场边静观，反将诸人拆招看得分明，亦有所得。' },
    { text: '问师兄可否指教剑法', sub: {
        desc: '师兄一笑，横剑而立，只等你进招，口称"但来无妨"。',
        choices: [
          { text: '使尽所学，全力抢攻', effect: { exp: 40, hp: -20 }, result: '你攻势如潮，终被师兄一剑架开，他赞你"胆气可嘉"。' },
          { text: '求他拆解方才那一式', sub: {
              desc: '师兄收剑入鞘，缓缓道："剑招易学，剑意难求。"',
              choices: [
                { text: '闭目回味，细品剑意', effect: { exp: 45, per: { gang: 2 } }, result: '你于心中将那一式拆了又拆，剑意渐明，腕力自增。' },
                { text: '再起一式，以身试剑', effect: { hp: -35, exp: 50 }, result: '剑风过处，你衣袖绽裂，却在电光火石间悟得变招之机。' }
              ] } }
        ] } }
  ] },
{ id: 'g81', name: '长老讲武', weight: 2, scenes: ['sect'], levelReq: 34,
  desc: '暮鼓初歇，一位长老于松下设席讲武，众弟子屏息环坐。',
  choices: [
    { text: '择一静处，凝神听讲', effect: { exp: 40, per: { xia: 1 } }, result: '长老所言字字入心，你只觉往日滞涩之处豁然贯通。' },
    { text: '当众发问，求释疑难', effect: { exp: 30, rep: 3 }, result: '长老抚须而答，又赞你"敢问方能精进"，众弟子皆投来钦服目光。' },
    { text: '讲毕留下，私下请益', sub: {
        desc: '人散之后，长老独坐未去，似早已候你多时。',
        choices: [
          { text: '斟茶奉上，虚心求教', effect: { exp: 50, rep: 3 }, result: '茶香袅袅，长老为你开解了多年未通的几处关节，你拜谢而去。' },
          { text: '问他武学之极在何处', sub: {
              desc: '长老目光深远，缓缓道："极不在招，在人心之诚。"',
              choices: [
                { text: '若有所悟，长揖而退', effect: { exp: 35, moral: 2 }, result: '你踏月而归，只觉一身武学皆有了归处。' },
                { text: '再问如何修得此诚', effect: { exp: 45, per: { ming: 2 } }, result: '长老不答，只指了指天心明月。你豁然一笑，不复多言。' }
              ] } }
        ] } }
  ] },
{ id: 'g82', name: '藏经阁值夜', weight: 2, scenes: ['sect'], levelReq: 40,
  desc: '藏经阁缺一夜值，执事寻到你，许你入阁可阅半卷闲书。',
  choices: [
    { text: '应下差事，趁夜览卷', effect: { exp: 35, per: { ming: 1 } }, result: '油灯如豆，你读至东方既白，只觉眼界大开。' },
    { text: '婉拒值夜，自顾练功', effect: { exp: 25, hp: 20 }, result: '你在院中打熬筋骨，一夜吐纳，真气更见充盈。' },
    { text: '问可否借阅高深心法', sub: {
        desc: '执事面色一肃，道："阁中典藏分九层，各凭机缘。"',
        choices: [
          { text: '求登上一层，寻访旧籍', effect: { exp: 45, rep: 2 }, result: '你拾级而上，于尘封书卷中觅得几页残缺批注，如获至宝。' },
          { text: '问顶层藏有何物', sub: {
              desc: '执事不答，只以目光示意你莫要多问。',
              choices: [
                { text: '知趣而止，安心值夜', effect: { moral: 3, exp: 30 }, result: '你守口如瓶，执事暗许你多阅两卷，受益良多。' },
                { text: '深夜独自窥探顶层', effect: { hp: -40, per: { qing: -2 } }, result: '你方触门扉，机关暗动，负伤而退，心知此路不可强求。' }
              ] } }
        ] } }
  ] },
{ id: 'g83', name: '拜师试炼', weight: 2, scenes: ['sect'], levelReq: 46,
  desc: '掌门师叔云游归来，欲择一徒，设下三关试炼，众弟子争相应试。',
  choices: [
    { text: '报名应试，倾力而为', effect: { exp: 40, rep: 3 }, result: '三关过后，你虽未折桂，却因心性沉稳得了师叔几句点拨。' },
    { text: '自认不足，先观他人', effect: { moral: 2, exp: 20 }, result: '你冷眼旁观，将诸人得失一一记下，亦是修行一场。' },
    { text: '私下求师叔指点', sub: {
        desc: '师叔立于崖畔，山风猎猎，头也不回地命你近前。',
        choices: [
          { text: '叩首奉茶，执弟子礼', effect: { exp: 50, rep: 3 }, result: '师叔饮茶而笑，未收你入门，却传了你一门精要功夫。' },
          { text: '坦言来意，求一条路', sub: {
              desc: '师叔回身，目如寒星，问："你求的，是名是道？"',
              choices: [
                { text: '答：但求己道', effect: { exp: 55, per: { xia: 3 } }, result: '师叔抚掌而笑，道"好一个己道"，赐你一卷残经。' },
                { text: '答：愿登绝顶', effect: { rep: 2, exp: 35 }, result: '师叔默然良久，道"心气可嘉，然根基未稳"，命你且回。' }
              ] } }
        ] } }
  ] },
{ id: 'g84', name: '名宿到访', weight: 2, scenes: ['sect'], levelReq: 52,
  desc: '一位江湖名宿到访，山门大开。掌门率众出迎，场面肃然。',
  choices: [
    { text: '随众迎接，端正礼数', effect: { rep: 3, exp: 20 }, result: '你执礼甚恭，名宿目光扫过，微微颔首。' },
    { text: '远观其气度风范', effect: { exp: 25, per: { ming: 2 } }, result: '你不近前，只观其行止，如见高山，心折不已。' },
    { text: '寻机求见，当面请益', sub: {
        desc: '夜宴之后，名宿于静室饮茶，你候在廊下，终得一见。',
        choices: [
          { text: '呈上所学，请其品评', effect: { exp: 45, rep: 2 }, result: '名宿看了几眼，指你两处破绽，你如遭棒喝，当场重演数遍。' },
          { text: '问江湖之外有何求', sub: {
              desc: '名宿抚杯而笑，道："江湖之外，不过心安二字。"',
              choices: [
                { text: '默记于心，长揖告退', effect: { moral: 3, exp: 30 }, result: '这一夜你辗转难眠，只觉心中块垒消去了大半。' },
                { text: '再问如何能得心安', effect: { exp: 40, per: { qing: 2 } }, result: '名宿不答，只指窗外明月。你似懂非懂，却觉心头一暖。' }
              ] } }
        ] } }
  ] },
{ id: 'g85', name: '武林大会', weight: 2, scenes: ['sect'], levelReq: 60,
  desc: '武林大会开擂，八方豪杰齐聚本门，擂台上战鼓如雷。',
  choices: [
    { text: '登台比试，一展身手', effect: { exp: 55, rep: 4, hp: -30 }, result: '你连胜数场，虽后折于一位高手，却已名动全场。' },
    { text: '台下观战，揣摩各家', effect: { exp: 35, per: { ming: 2 } }, result: '你一连数日观擂，各家路数皆记于心，融会贯通。' },
    { text: '约战擂主，欲问高下', sub: {
        desc: '擂主乃本门首席，闻言一笑，道："既来，便试你一试。"',
        choices: [
          { text: '放手一搏，全力应战', effect: { exp: 60, hp: -45 }, result: '你与他缠斗良久，虽败犹荣，观者齐声喝彩。' },
          { text: '先请教其成名绝技', sub: {
              desc: '他负手而立，道："看好了，只演一遍。"',
              choices: [
                { text: '凝神细看，强记其势', effect: { exp: 65, per: { gang: 2 } }, result: '那一式如惊鸿过隙，你记住了三分，已觉受益无穷。' },
                { text: '闭目以耳辨其劲风', effect: { exp: 50, per: { xia: 2 } }, result: '劲风掠耳，你以听劲之法窥得些许门径，暗暗称奇。' }
              ] } }
        ] } }
  ] },
{ id: 'g86', name: '密室传灯', weight: 2, scenes: ['sect'], levelReq: 68,
  desc: '掌门深夜召你入密室，灯影幢幢，墙上悬着一柄无鞘古剑。',
  choices: [
    { text: '躬身听命，静候示下', effect: { exp: 40, rep: 4 }, result: '掌门抚剑良久，道你"根骨可堪大用"，命你明日随他修习。' },
    { text: '问这剑有何来历', sub: {
        desc: '掌门取下古剑，剑身如水，寒光映亮半室。',
        choices: [
          { text: '细看剑身，默记其纹', effect: { exp: 55, per: { xia: 3 } }, result: '剑纹如江河奔流，你凝视之下，只觉一股剑意直透心扉。' },
          { text: '求掌门指教剑中玄机', sub: {
              desc: '掌门不答，却将古剑缓缓递到你面前。',
              choices: [
                { text: '双手接过，如承重托', effect: { gear: 'lan' }, result: '剑入手，温润如玉。掌门道："此剑名兰，今日传你。剑在，心便不可蒙尘。"你捧剑而拜，只觉肩上重了许多。' },
                { text: '退一步，道受之有愧', effect: { moral: 4, exp: 45 }, result: '掌门凝视你许久，点头道"知进退者，方成大器"，反授你几句心法。' }
              ] } }
        ] } }
  ] },
{ id: 'g87', name: '后山禁地', weight: 2, scenes: ['sect'], levelReq: 74,
  desc: '守山门人遥指后山，道禁地石壁上刻着一门失传武学，有缘者方得。',
  choices: [
    { text: '问明禁地禁忌，再作打算', effect: { moral: 2, exp: 30 }, result: '你问清规矩，方知强求无益，反得了几句守心的提点。' },
    { text: '趁夜潜入，寻那石壁', effect: { hp: -40, per: { qing: -2 } }, result: '你摸黑而入，误触机关，负伤而返，暗悔鲁莽。' },
    { text: '白日请命，正大光明而入', sub: {
        desc: '长老见你坦荡，破例许你入谷半日，命你日落前必返。',
        choices: [
          { text: '寻得石壁，逐字揣摩', effect: { exp: 55, per: { gang: 2 } }, result: '石壁刻痕斑驳，你强记大半，只觉胸中似有洪炉涌动。' },
          { text: '闭目以指抚字，感应剑意', sub: {
              desc: '指尖过处，字迹竟似发烫，一道旧日剑意自壁中透出。',
              choices: [
                { text: '凝神承接，纳为己用', effect: { tech: 'jh_hunyuan' }, result: '剑意如大江东去，你于混沌中窥见一门失传心法，刻入骨髓。出谷时，长老望你一眼，道："它既认了你，望你莫负。"' },
                { text: '不敢贪多，只记三分', effect: { exp: 60, rep: 3 }, result: '你强敛心神，只记下三成，出谷后闭门苦思，日有所进。' }
              ] } }
        ] } }
  ] },
{ id: 'g88', name: '掌门召见', weight: 2, scenes: ['sect'], levelReq: 82,
  desc: '掌门传你至正殿，殿中香雾缭绕，众长老分坐两侧。',
  choices: [
    { text: '整衣而入，行大礼', effect: { rep: 4, exp: 25 }, result: '你礼数周全，众长老相视颔首，掌门目光中有了赞许。' },
    { text: '坦然而立，不卑不亢', effect: { exp: 30, per: { xia: 2 } }, result: '你不为威势所动，掌门抚须而笑，道你"有几分意思"。' },
    { text: '问所召何事', sub: {
        desc: '掌门命人掩上殿门，缓缓道："本门有件要事，须托可信之人。"',
        choices: [
          { text: '拱手领命，任凭差遣', effect: { exp: 50, rep: 4 }, result: '你应得干脆，掌门大悦，授你一项机要差事。' },
          { text: '问清原委，再定行止', sub: {
              desc: '掌门面色沉静，道："此去关乎一桩陈年恩怨，凶险难料。"',
              choices: [
                { text: '慨然应下，道义不容辞', effect: { exp: 60, per: { xia: 3 } }, result: '你抱拳领命，殿中烛火为之一晃，似有风云将起。' },
                { text: '坦言尚须考量', effect: { moral: 3, exp: 35 }, result: '掌门不恼，反道"慎思者可行远"，许你三日后再答。' }
              ] } }
        ] } }
  ] },
{ id: 'g89', name: '山门风雪', weight: 2, scenes: ['sect'], levelReq: 90,
  desc: '岁暮大雪封山，你独坐山门，见一佝偻老者踏雪而来，形同乞儿。',
  choices: [
    { text: '起身迎入，奉上热汤', effect: { moral: 4, exp: 30 }, result: '老者饮尽热汤，浑身渐暖，望你一眼，目光竟亮如晨星。' },
    { text: '见其可怜，赠银几两', effect: { gold: -40, moral: 3 }, result: '老者不收银钱，只道"善念比黄金贵"，你怅然若失。' },
    { text: '问其雪夜何故至此', sub: {
        desc: '老者掸去肩头雪，笑道："特来寻一个可托付的人。"',
        choices: [
          { text: '再问所托何事', effect: { exp: 45, rep: 2 }, result: '老者不答，只从怀中取出一块旧玉，上刻古篆，晦涩难辨。' },
          { text: '为他扫出一席安身之地', sub: {
              desc: '夜深人静，老者与你围炉而坐，火光映着他满身风霜。',
              choices: [
                { text: '听他讲一段旧事', effect: { exp: 60, per: { ming: 3 } }, result: '旧事如雪，簌簌而落。讲到深处，老者声如金石，你只觉胸中豁然。' },
                { text: '问这块旧玉从何而来', effect: { exp: 55, per: { xia: 2 } }, result: '老者以指蘸水，在炉边缓缓写下一个字，未及看清，水迹已干。' }
              ] } }
        ] } }
  ] },
{ id: 'g90', name: '残卷天机', weight: 2, scenes: ['mystic'], levelReq: 60,
  desc: '雾散处石壁现残卷，字迹半隐半明。',
  choices: [
    { text: '拓印残卷，留待后参', effect: { exp: 30, per: { ming: 3 } }, result: '残卷入怀，恍惚闻剑鸣于壁后。' },
    { text: '就地参悟', sub: {
        desc: '残卷所载半阙剑诀，缺处令人扼腕。',
        choices: [
          { text: '强记剑诀', effect: { exp: 45, per: { xia: 2 } }, result: '剑诀入心，指尖微微发凉。' },
          { text: '苦思缺处', sub: {
              desc: '你枯坐三日，似窥得天机一线。',
              choices: [
                { text: '顿悟补全', effect: { exp: 60, per: { ming: 4 } }, result: '提笔续卷，山风为之一滞。' },
                { text: '弃卷而去', effect: { moral: 2 }, result: '强求不得，转身时壁影如一声轻叹。' }
              ] } }
        ] } }
  ] },

{ id: 'g91', name: '庄周梦蝶', weight: 2, scenes: ['mystic'], levelReq: 64,
  desc: '卧石小憩，梦中有蝶栖于肩头。',
  choices: [
    { text: '随蝶入梦', sub: {
        desc: '梦中山河皆缟素，一蝶引路，如故人归。',
        choices: [
          { text: '追逐彩蝶', effect: { exp: 40, per: { ming: 2 } }, result: '蝶影渐远，醒时余香满袖。' },
          { text: '问蝶归处', sub: {
              desc: '蝶振翅，竟吐人言：『君亦梦乎？』',
              choices: [
                { text: '答曰亦梦', effect: { moral: 3, per: { ming: 3 } }, result: '蝶绕三匝而去，你怅然若失。' },
                { text: '笑而不答', effect: { per: { ming: 4 } }, result: '蝶与梦俱散，唯余山风过耳。' }
              ] } }
        ] } },
    { text: '惊觉而起', effect: { moral: 2 }, result: '梦醒无痕，你久久不能自已。' }
  ] },

{ id: 'g92', name: '古剑沉渊', weight: 2, scenes: ['mystic'], levelReq: 68,
  desc: '寒潭之下，一柄古剑静卧千年。',
  choices: [
    { text: '取剑出潭', effect: { exp: 50, per: { xia: 3 } }, result: '剑出水寒，你掌中多了一缕剑气。' },
    { text: '以指叩剑', sub: {
        desc: '剑身长鸣，潭水倒卷如龙吟。',
        choices: [
          { text: '转身不取', effect: { moral: 3 }, result: '剑鸣渐息，你心有所悟。' },
          { text: '听剑自述', sub: {
              desc: '剑中残魂低语，道破一段江湖旧事。',
              choices: [
                { text: '代剑复仇', effect: { rep: 4, per: { xia: 2 } }, result: '你负剑出谷，旧事当由新剑了断。' },
                { text: '记下旧事', effect: { exp: 40, per: { ming: 2 } }, result: '恩怨随风，剑名入史。' }
              ] } }
        ] } }
  ] },

{ id: 'g93', name: '隐世高人', weight: 2, scenes: ['mystic'], levelReq: 72,
  desc: '竹林深处，有白发老者在石上煮茶。',
  choices: [
    { text: '上前讨茶', effect: { moral: 3 }, result: '一盏入喉，通体清和。' },
    { text: '叩问武学', sub: {
        desc: '老者不答，只以茶盏画圆，残水成势。',
        choices: [
          { text: '静观其势', effect: { per: { ming: 4 } }, result: '你于水痕中，窥见大巧若拙。' },
          { text: '出招试探', sub: {
              desc: '你一招递出，老者身形未动，茶烟自避。',
              choices: [
                { text: '拜服求教', effect: { exp: 55, per: { xia: 3 } }, result: '老者一笑，以竹枝点你三处。' },
                { text: '执意相拼', effect: { hp: -60, exp: 20 }, result: '你被茶烟所阻，气血翻涌。' }
              ] } }
        ] } }
  ] },

{ id: 'g94', name: '幻境残局', weight: 2, scenes: ['mystic'], levelReq: 76,
  desc: '洞府之中，一方残棋无人落子。',
  choices: [
    { text: '执黑先行', effect: { exp: 40, per: { ming: 2 } }, result: '落子无声，石枰隐隐生寒。' },
    { text: '观棋不语', sub: {
        desc: '棋局忽动，黑白如两军对峙于方寸。',
        choices: [
          { text: '代白落子', effect: { exp: 45, per: { ming: 3 } }, result: '一子解局，杀伐之气尽散。' },
          { text: '拂乱棋局', sub: {
              desc: '棋子四散，幻境如镜片寸寸碎裂。',
              choices: [
                { text: '从裂处而出', effect: { hp: -40, exp: 30 }, result: '你破境而出，衣袂带风。' },
                { text: '拾起一子', effect: { item: 'random' }, result: '掌心一子，温润如故。' }
              ] } }
        ] } }
  ] },

{ id: 'g95', name: '洞府遗蜕', weight: 2, scenes: ['mystic'], levelReq: 80,
  desc: '石室之中，有道者坐化，肉身不腐。',
  choices: [
    { text: '躬身一礼', effect: { moral: 3, rep: 2 }, result: '你肃然一拜，室中似有回响。' },
    { text: '查其遗物', sub: {
        desc: '蒲团旁有玉简一枚，触之温润。',
        choices: [
          { text: '翻阅玉简', effect: { exp: 50, per: { ming: 3 } }, result: '简中真义，字字入心。' },
          { text: '携简下山', sub: {
              desc: '玉简入怀，石室烛火无风自明。',
              choices: [
                { text: '细读功法', effect: { exp: 60, per: { ming: 2 } }, result: '道法自然，你渐入佳境。' },
                { text: '供奉道者', effect: { moral: 4 }, result: '你封简而拜，心神俱静。' }
              ] } }
        ] } }
  ] },

{ id: 'g96', name: '破碎虚空', weight: 2, scenes: ['mystic'], levelReq: 84,
  desc: '绝壁之巅，虚空裂开一道细纹。',
  choices: [
    { text: '伸手探纹', effect: { hp: -50, per: { ming: 2 } }, result: '指触裂纹，天地为之一震。' },
    { text: '静观其变', sub: {
        desc: '裂缝开合，泄出天光一缕，似有仙乐。',
        choices: [
          { text: '闭目不去', effect: { per: { ming: 4 } }, result: '你听天籁，浑然忘我。' },
          { text: '循乐而入', sub: {
              desc: '一步踏入，身后尘世尽成掌中方寸。',
              choices: [
                { text: '再进一步', effect: { exp: 65, per: { ming: 3 } }, result: '天地一阔，你仿佛触到道的边际。' },
                { text: '抽身而退', effect: { moral: 3 }, result: '你退回崖边，天光闭于身后。' }
              ] } }
        ] } }
  ] },

{ id: 'g97', name: '大梦一场', weight: 2, scenes: ['mystic'], levelReq: 88,
  desc: '枕石而眠，一梦历经了百年江湖。',
  choices: [
    { text: '醒后怅然', effect: { moral: 3 }, result: '百年一瞬，醒来时眼角已湿。' },
    { text: '追寻梦痕', sub: {
        desc: '梦醒犹记，掌中剑招分明如昨。',
        choices: [
          { text: '叹梦太短', effect: { exp: 40, per: { ming: 2 } }, result: '梦短情长，你久久无言。' },
          { text: '循梦练剑', sub: {
              desc: '你随梦中所悟演练，剑至酣处，四野无声。',
              choices: [
                { text: '悟透最后一式', effect: { gear: 'lan' }, result: '最后一式落定，你忽觉百年梦短，剑已非昨。' },
                { text: '留一式不练', effect: { per: { ming: 4 } }, result: '留三分余地，如梦中留白，方有余味。' }
              ] } }
        ] } }
  ] },

{ id: 'g98', name: '真假难辨', weight: 2, scenes: ['mystic'], levelReq: 92,
  desc: '山道上你遇见另一个自己，踏雾而来。',
  choices: [
    { text: '拔剑相向', effect: { per: { xia: 3 }, exp: 20 }, result: '剑未出鞘，那人已与你合而为一。' },
    { text: '与他对话', sub: {
        desc: '『你信眼前，还是信来处？』他问。',
        choices: [
          { text: '信来处', effect: { moral: 3 }, result: '他颔首，雾散时你仍在原地。' },
          { text: '信眼前', sub: {
              desc: '他微微一笑，化作镜花水月散去。',
              choices: [
                { text: '伸手去接', effect: { exp: 50, per: { ming: 3 } }, result: '指尖一凉，方知眼前皆是虚妄。' },
                { text: '默然良久', effect: { per: { ming: 3 }, moral: 2 }, result: '真假本无界，你低头看自己的手。' }
              ] } }
        ] } }
  ] },

{ id: 'g99', name: '天机石碑', weight: 2, scenes: ['mystic'], levelReq: 96,
  desc: '谷底石碑半埋，碑文只余寥寥数行。',
  choices: [
    { text: '拓碑而去', effect: { exp: 45, per: { ming: 2 } }, result: '碑拓入手，字字如刻于心上。' },
    { text: '以血洗碑', sub: {
        desc: '血浸碑文，隐字渐显，是失传的心法。',
        choices: [
          { text: '默诵心法', effect: { exp: 55, per: { ming: 3 } }, result: '心法流转，气海为之鼓荡。' },
          { text: '参悟奥义', sub: {
              desc: '碑文映心，似有老者在耳边低语大道。',
              choices: [
                { text: '得传绝学', effect: { tech: 'jh_jiuzhuan' }, result: '法诀入心，回望来路，竟分不清是碑中客，还是观碑人。' },
                { text: '自悟己道', effect: { per: { ming: 5 }, moral: 2 }, result: '你弃碑而立，于无字处自见真章。' }
              ] } }
        ] } }
  ] },

{ id: 'g100', name: '梦回少年', weight: 2, scenes: ['mystic'], levelReq: 100,
  desc: '月下枯坐，恍惚又见少年时的自己。',
  choices: [
    { text: '只静静看着', effect: { moral: 3 }, result: '少年回头一笑，隐入月光深处。' },
    { text: '与少年对剑', sub: {
        desc: '少年剑势青涩，却有一股至纯意气。',
        choices: [
          { text: '指点他几招', effect: { exp: 40, per: { xia: 2 } }, result: '你出言指点，少年一点即通。' },
          { text: '任他尽情施展', sub: {
              desc: '剑风掠过，你见自己昔日的影子分外清晰。',
              choices: [
                { text: '会心一笑', effect: { per: { ming: 4 }, moral: 2 }, result: '一笑之间，岁月皆成过往。' },
                { text: '拔剑相陪', effect: { exp: 50, per: { xia: 2 } }, result: '两剑并舞，你仿佛又年少了一回。' }
              ] } }
        ] } }
  ] },

];

// ---------- 情侣（6 位可攻略 NPC） ----------
const LOVERS = [
  { id: 'xiaoyu', name: '苏小鱼', gender: '女', title: '豆腐西施', color: '#ff9fb0',
    desc: '青石村卖豆腐的姑娘，笑起来有两个酒窝。',
    gift: { like: ['doufu', 'guihua'], hate: ['jiudai'] }, bonus: { hp: 0.10 },
    lines: { meet: '这位客官，来块豆腐吗？', date: '小鱼红着脸，陪你看了场皮影戏。', love: '她塞给你一块刻着"平安"的豆腐。' },
    meetReq: { good: true, xiaMin: 15 },
    meet: { desc: '清晨的豆腐摊前，一个姑娘冲你一笑，酒窝浅浅。', choices: [
      { text: '买块豆腐', affection: 15, result: '她眼睛一亮，多切了半块给你。' },
      { text: '夸她手巧', affection: 10, result: '她红了脸，低头搅着豆花。' },
      { text: '匆匆走过', affection: -5, result: '你行色匆匆，姑娘的笑容淡了淡。' }
    ] } },
  { id: 'lingyue', name: '冷凌月', gender: '女', title: '峨眉剑女', color: '#5fb8ff',
    desc: '峨眉派首席弟子，剑法超群，面冷心热。',
    gift: { like: ['guihua', 'mi'], hate: ['jiudai'] }, bonus: { atk: 0.08, spd: 0.05 },
    lines: { meet: '（冷凌月看了你一眼）有事？', date: '她难得一笑，与你月下比剑。', love: '她轻声道："以后，我的剑为你而舞。"' },
    meetReq: { gangMin: 25, level: 20 },
    meet: { desc: '月下，一道白衣身影持剑而立，回眸时目光如霜。', choices: [
      { text: '邀她比剑', affection: 15, result: '她眉梢微挑，剑尖轻轻一点，算作应战。' },
      { text: '赞她剑法', affection: 10, result: '她面色不改，只淡淡道了声"过奖"。' },
      { text: '敬而远之', affection: -5, result: '她没再多看你一眼。' }
    ] } },
  { id: 'yaoyao', name: '白瑶瑶', gender: '女', title: '青丘狐仙', color: '#ff7a9f',
    desc: '青丘的狐仙，古灵精怪，总爱捉弄人，心地却不坏。',
    gift: { like: ['guihua', 'mi'], hate: ['gudan'] }, bonus: { spd: 0.10, dodge: 0.05 },
    lines: { meet: '嘻嘻，小道士，你身上有股好闻的味道~', date: '她拉着你在花林里追萤火虫。', love: '她眨眨眼："跟了我，保你长生不老哦。"' },
    meetReq: { qingMin: 20, mingMin: 15, level: 40 },
    meet: { desc: '花林深处，一个白影飘然而至，绕着你转了三圈。', choices: [
      { text: '笑着回应', affection: 15, result: '她"噗嗤"一笑，尾巴都翘了起来。' },
      { text: '问她姓名', affection: 10, result: '"白瑶瑶~"她歪头，眼波流转。' },
      { text: '退后戒备', affection: -5, result: '她撇撇嘴，有些失望。' }
    ] } },
  { id: 'shenqingci', name: '沈青瓷', gender: '女', title: '医谷传人', color: '#8fe3c0',
    desc: '医谷弟子，医术高明，心地仁善，见不得人受苦。',
    gift: { like: ['mi', 'guihua'], hate: ['gudan'] }, bonus: { hp: 0.08, mp: 0.08 },
    lines: { meet: '你受伤了？别动，我看看。', date: '她教你辨认满山草药。', love: '她轻声道："有我在，不会让你有事。"' },
    meetReq: { good: true, qingMin: 20 },
    meet: { desc: '山路旁，一个采药姑娘正在为受伤的路人包扎。', choices: [
      { text: '上前帮忙', affection: 15, result: '她抬头一笑："多谢相助。"' },
      { text: '夸她仁心', affection: 10, result: '她摆摆手："医者本分而已。"' },
      { text: '绕道而行', affection: -5, result: '你快步离开。' }
    ] } },
  { id: 'guqingcheng', name: '顾倾城', gender: '女', title: '魔教圣女', color: '#ff5f8f',
    desc: '魔教圣女，亦正亦邪，一颦一笑皆可倾城。',
    gift: { like: ['guihua', 'jiudai'], hate: ['jijirou'] }, bonus: { atk: 0.10, lifeSteal: 0.02 },
    lines: { meet: '你敢这样看本圣女，胆子不小。', date: '她带你夜探魔宫，惊险刺激。', love: '她低声道："这江湖若负你，我便屠了这江湖。"' },
    meetReq: { evil: true, gangMin: 20, level: 40 },
    meet: { desc: '夜风里，一袭红衣的女子斜倚在楼栏上，似笑非笑地望向你。', choices: [
      { text: '坦然对视', affection: 15, result: '她勾唇一笑："有点意思。"' },
      { text: '出言试探', affection: 10, result: '"想套我话？"她懒懒道，"你还嫩了点。"' },
      { text: '移开目光', affection: -5, result: '她轻哼一声，似有不满。' }
    ] } },
  { id: 'liuruyan', name: '柳如烟', gender: '女', title: '江南歌姬', color: '#b9d8ff',
    desc: '江南名歌姬，歌声婉转，眉眼含愁。',
    gift: { like: ['guihua', 'mi'], hate: ['sheye'] }, bonus: { dodge: 0.06, spd: 0.06 },
    lines: { meet: '这位公子，可愿听奴家一曲？', date: '她为你独奏一曲，余音绕梁。', love: '她轻声道："愿与君共听这江南烟雨。"' },
    meetReq: { qingMin: 25, level: 10 },
    meet: { desc: '画舫上，一女子抚琴而歌，歌声如烟似雾。', choices: [
      { text: '静静聆听', affection: 15, result: '曲罢，她朝你微微欠身。' },
      { text: '打赏一曲', affection: 10, result: '她掩唇一笑，又弹了一首。' },
      { text: '无心停留', affection: -5, result: '你转身离去，歌声渐远。' }
    ] } },
  { id: 'murongxue', name: '慕容雪', gender: '女', title: '盟主之女', color: '#e8e0ff',
    desc: '武林盟主慕容昭之女，温婉中藏着倔强。',
    gift: { like: ['guihua', 'doufu'], hate: ['gudan'] }, bonus: { def: 0.10, hp: 0.08 },
    lines: { meet: '你……也是为山河印而来么？', date: '她与你并肩看雪，难得展颜。', love: '她轻声道："若这天下容不下我们，我便与你共赴天涯。"' },
    meetReq: { xiaMin: 20, qingMin: 20, flag: 'met_murongxue' },
    meet: { desc: '盟会后院，一个白衣女子正对着一株寒梅出神。', choices: [
      { text: '轻声问候', affection: 15, result: '她回眸，眼底似有千言万语。' },
      { text: '表明来意', affection: 10, result: '她垂眸："原来，你是来追查父亲的。"' },
      { text: '转身离开', affection: -5, result: '你悄然退去。' }
    ] } },
  { id: 'chuyunyan', name: '楚云烟', gender: '女', title: '天机阁女弟子', color: '#7f9fff',
    desc: '天机阁弟子，博闻强识，慧黠通透。',
    gift: { like: ['guihua', 'mi'], hate: ['gudan'] }, bonus: { mp: 0.10, expBonus: 0.05 },
    lines: { meet: '在下楚云烟，观你气度不凡。', date: '她与你登高望远，纵论天机。', love: '她轻声道："愿与你共窥这天地玄机。"' },
    meetReq: { mingMin: 35, level: 60 },
    meet: { desc: '观星台上，一个少女正执笔演算星象，头也不回。', choices: [
      { text: '请教天机', affection: 15, result: '她眼睛一亮，拉着你讲了半宿。' },
      { text: '猜她在算什么', affection: 10, result: '她"咦"了一声："你倒有几分眼力。"' },
      { text: '不打扰', affection: -5, result: '你静静走开。' }
    ] } },
  { id: 'luoshennv', name: '洛神女', gender: '女', title: '东海龙女', color: '#6fc8d8',
    desc: '东海龙宫之女，清冷出尘，似水中之月。',
    gift: { like: ['mi', 'guihua'], hate: ['gudan'] }, bonus: { mp: 0.15 },
    lines: { meet: '凡尘之人，也敢窥我龙宫？', date: '她带你潜入海底，看尽珊瑚璀璨。', love: '她轻声道："你是我在这人间，唯一想留的风景。"' },
    meetReq: { mingMin: 30, gangMax: -10, level: 60 },
    meet: { desc: '海岸边，一个蓝衣女子踏浪而立，衣袂不沾水汽。', choices: [
      { text: '温言相问', affection: 15, result: '她回眸，眸中似有沧海。' },
      { text: '赞她出尘', affection: 10, result: '她唇角微扬，未置可否。' },
      { text: '远远观望', affection: -5, result: '她看了你一眼，转身没入海中。' }
    ] } },
  { id: 'huaqianying', name: '花千影', gender: '女', title: '唐门暗器', color: '#d8d8e0',
    desc: '唐门女高手，暗器无双，出手如电。',
    gift: { like: ['sheye', 'guihua'], hate: ['doufu'] }, bonus: { crit: 0.05, atk: 0.06 },
    lines: { meet: '别动，你身上那枚暗器，我早就看见了。', date: '她教你在林间试射暗器。', love: '她低声道："以后，我的飞刀只护你。"' },
    meetReq: { gangMin: 35, level: 25 },
    meet: { desc: '林中，一枚飞刀"夺"地钉在你身侧树干上，一个女子从树后现身。', choices: [
      { text: '接招切磋', affection: 15, result: '你们过了几手，她眼中闪过激赏。' },
      { text: '赞她身手', affection: 10, result: '"雕虫小技。"她嘴上谦虚，眉梢却扬了起来。' },
      { text: '拔刀戒备', affection: -5, result: '她撇撇嘴："没意思。"' }
    ] } },
  { id: 'wenruyue', name: '温如月', gender: '女', title: '丐帮女侠', color: '#d8b26a',
    desc: '丐帮女侠，豪爽仗义，路见不平拔刀相助。',
    gift: { like: ['jiudai', 'jijirou'], hate: ['sheye'] }, bonus: { atk: 0.08, crit: 0.03 },
    lines: { meet: '兄弟，来根鸡腿不？', date: '她拉着你蹲在墙根下喝酒吹牛。', love: '她拍着胸脯："从今往后，你的事就是我的事！"' },
    meetReq: { xiaMin: 35, level: 15 },
    meet: { desc: '闹市街头，一个女子正揪着一个恶霸的领子，大嗓门震得整条街都听得见。', choices: [
      { text: '出手相助', affection: 15, result: '她回头一乐："够义气！"' },
      { text: '替她叫好', affection: 10, result: '她朝你抱了抱拳。' },
      { text: '看热闹', affection: -5, result: '她瞥了你一眼，似笑非笑。' }
    ] } },
  { id: 'yunbin', name: '云鬓', gender: '女', title: '青楼花魁', color: '#ffc8d8',
    desc: '青楼花魁，才情绝世，笑里藏着看透世情的凉薄。',
    gift: { like: ['guihua', 'mi'], hate: ['jiudai'] }, bonus: { dodge: 0.08, spd: 0.05 },
    lines: { meet: '这位公子，看着面生。', date: '她为你抚琴弄墨，谈笑风生。', love: '她低声道："红尘万丈，奴家只想留一人。"' },
    meetReq: { qingMin: 35, level: 15 },
    meet: { desc: '花楼之上，一个女子凭栏而立，回眸一笑，满楼生辉。', choices: [
      { text: '以礼相待', affection: 15, result: '她眼中多了几分真切的笑意。' },
      { text: '赞她才情', affection: 10, result: '她摇着团扇，似嗔似喜。' },
      { text: '视而不见', affection: -5, result: '她神色如常，眼底却冷了一分。' }
    ] } },
  { id: 'sumuqiu', name: '苏沐秋', gender: '女', title: '剑冢守剑人', color: '#c8d8e8',
    desc: '剑冢守剑人，沉默寡言，剑意通神。',
    gift: { like: ['sheye', 'guihua'], hate: ['jiudai'] }, bonus: { critDmg: 0.10, atk: 0.05 },
    lines: { meet: '（她只是握紧了剑柄，看着你。）', date: '她带你去看剑冢里最古老的那柄剑。', love: '她低声道："这柄剑，只为你出鞘。"' },
    meetReq: { gangMin: 30, mingMin: 20, level: 35 },
    meet: { desc: '荒废剑冢前，一个抱剑女子静立如石，见你前来，缓缓睁眼。', choices: [
      { text: '抱拳致意', affection: 15, result: '她微微颔首，算是回礼。' },
      { text: '问她剑名', affection: 10, result: '她抚过剑身："它还没有名字。"' },
      { text: '冒然闯入', affection: -5, result: '她眉峰一蹙，剑意陡寒。' }
    ] } },
  { id: 'lanfenghuang', name: '蓝凤凰', gender: '女', title: '苗疆蛊女', color: '#8fe3a0',
    desc: '苗疆蛊女，行事乖张，恩怨分明。',
    gift: { like: ['gudan', 'guihua'], hate: ['doufu'] }, bonus: { thorn: 0.05, lifeSteal: 0.02 },
    lines: { meet: '敢靠近我，不怕中蛊么？', date: '她带你看遍苗疆奇花异草。', love: '她低声道："我把最护主的蛊，种在了你身上。"' },
    meetReq: { evil: true, qingMin: 20, level: 35 },
    meet: { desc: '苗寨外的密林里，一个彩衣女子把玩着一只蛊虫，见你便笑。', choices: [
      { text: '好奇靠近', affection: 15, result: '她"咯咯"一笑，把蛊虫凑近了些。' },
      { text: '请教蛊术', affection: 10, result: '她来了兴致，讲得眉飞色舞。' },
      { text: '后退一步', affection: -5, result: '"没胆。"她撇了撇嘴。' }
    ] } },
  { id: 'luxueqi', name: '陆雪琪', gender: '女', title: '昆仑仙子', color: '#e0e8ff',
    desc: '昆仑弟子，清丽绝尘，如雪山之巅的一株雪莲。',
    gift: { like: ['guihua', 'mi'], hate: ['gudan'] }, bonus: { def: 0.08, mp: 0.08 },
    lines: { meet: '（她只是淡淡看了你一眼。）', date: '她与你并肩立于雪峰之巅。', love: '她轻声道："昆仑雪冷，唯你心热。"' },
    meetReq: { mingMin: 45, level: 50 },
    meet: { desc: '雪峰之巅，一个白衣女子负手而立，衣袂与风雪同舞。', choices: [
      { text: '请教剑道', affection: 15, result: '她凝望远方，缓缓开口。' },
      { text: '并肩观雪', affection: 10, result: '你们静立良久，只闻风雪声。' },
      { text: '不敢惊扰', affection: -5, result: '你悄然退下山去。' }
    ] } },
  { id: 'fengming', name: '凤鸣', gender: '女', title: '山庄大小姐', color: '#ffd75f',
    desc: '凤鸣山庄大小姐，明艳张扬，敢爱敢恨。',
    gift: { like: ['guihua', 'jiudai'], hate: ['sheye'] }, bonus: { hp: 0.08, atk: 0.08 },
    lines: { meet: '你就是那个近来声名鹊起的家伙？', date: '她拉着你纵马踏青，笑声洒了一路。', love: '她扬声道："我凤鸣看上的人，谁也抢不走！"' },
    meetReq: { xiaMin: 30, gangMin: 20, level: 20 },
    meet: { desc: '山庄门口，一个红衣少女骑着骏马，居高临下地打量你。', choices: [
      { text: '坦然自报家门', affection: 15, result: '她挑了挑眉："有点胆色。"' },
      { text: '赞她骑术', affection: 10, result: '她得意地扬了扬下巴。' },
      { text: '不理她', affection: -5, result: '"哼，架子倒不小。"她策马而去。' }
    ] } },
  { id: 'qinkeqing', name: '秦可卿', gender: '女', title: '西域商女', color: '#e8c8a0',
    desc: '西域商队女东家，精明干练，见多识广。',
    gift: { like: ['mi', 'jiudai'], hate: ['gudan'] }, bonus: { goldBonus: 0.10, expBonus: 0.05 },
    lines: { meet: '这位客人，可有什么好买卖？', date: '她带你逛遍西域集市。', love: '她低声道："我这辈子做的最划算的买卖，就是遇上你。"' },
    meetReq: { neutral: true, qingMin: 15, level: 35 },
    meet: { desc: '驼铃声里，一个异域装束的女子正在清点货物，抬头朝你一笑。', choices: [
      { text: '谈生意', affection: 15, result: '她眼中精光一闪："痛快人。"' },
      { text: '夸她精明', affection: 10, result: '"混口饭吃罢了。"她笑着摆手。' },
      { text: '不感兴趣', affection: -5, result: '她也不恼，继续算账。' }
    ] } },
  { id: 'jiangwanyin', name: '江晚吟', gender: '女', title: '渔家女', color: '#9fd8e8',
    desc: '江边渔家女，温婉坚韧，撑一叶小舟讨生活。',
    gift: { like: ['doufu', 'guihua'], hate: ['jiudai'] }, bonus: { hpRegen: 0.05, hp: 0.08 },
    lines: { meet: '客官，要坐船渡江吗？', date: '她摇着橹，与你共看江上日落。', love: '她轻声道："以后，我渡你过这世间所有江河。"' },
    meetReq: { good: true, gangMax: -10, xiaMin: 15 },
    meet: { desc: '渡口，一个渔家女正织补渔网，见你便停下手中的活计。', choices: [
      { text: '坐她的船', affection: 15, result: '她摇橹的姿势轻快，笑声随波而散。' },
      { text: '帮她补网', affection: 10, result: '她一愣，随即抿嘴笑了。' },
      { text: '不坐船', affection: -5, result: '她低头继续补网。' }
    ] } },
  { id: 'bairuoxue', name: '白若雪', gender: '女', title: '雪峰剑仙', color: '#e8f0ff',
    desc: '雪山剑仙，冷若冰霜，剑下无回。',
    gift: { like: ['guihua', 'sheye'], hate: ['jiudai'] }, bonus: { atk: 0.08, crit: 0.05 },
    lines: { meet: '（她连一个眼神都欠奉。）', date: '她与你雪中对剑，寒气与剑气齐飞。', love: '她低声道："我这辈子，第一次想为谁停剑。"' },
    meetReq: { qingMax: -10, mingMin: 40, flag: 'got_zhanwang' },
    meet: { desc: '雪山之巅，一个白衣剑客负剑独立，周身三尺，雪落不沾。', choices: [
      { text: '以剑会友', affection: 15, result: '她眼中闪过一丝战意，与你各出一剑。' },
      { text: '静观其剑', affection: 10, result: '你观她剑意，如见万里冰原。' },
      { text: '敬而远之', affection: -5, result: '她自始至终，未发一言。' }
    ] } },
  { id: 'qingli', name: '青璃', gender: '女', title: '狐族公主', color: '#b8ffd8',
    desc: '狐族公主，天真烂漫，未经世事。',
    gift: { like: ['guihua', 'mi'], hate: ['gudan'] }, bonus: { dodge: 0.08, spd: 0.08 },
    lines: { meet: '外面的世界，好玩吗？', date: '她拉着你在山林间奔跑嬉闹。', love: '她仰起脸："你带我去看遍这人间，好不好？"' },
    meetReq: { qingMin: 45, level: 45 },
    meet: { desc: '林间，一个少女蹲在花丛里追蝴蝶，见你便睁大了好奇的眼睛。', choices: [
      { text: '陪她玩', affection: 15, result: '她"咯咯"笑起来，拉着你一起追。' },
      { text: '讲外面的故事', affection: 10, result: '她听得入了迷，眼里满是向往。' },
      { text: '转身离开', affection: -5, result: '她有些失落地垂下头。' }
    ] } }
];

// ---------- 红颜定情信物（结缘时互赠，随人不同） ----------
const LOVER_TOKEN = {
  xiaoyu: '刻着"平安"的豆腐',
  lingyue: '一枚青玉剑穗',
  yaoyao: '一缕狐尾绒',
  shenqingci: '一枚回春药佩',
  guqingcheng: '一支血玉发簪',
  liuruyan: '一柄檀木团扇',
  murongxue: '一方绣雪手帕',
  chuyunyan: '一枚天机铜钱',
  luoshennv: '一颗沧海明珠',
  huaqianying: '一只机关蝶',
  wenruyue: '一只青竹酒葫芦',
  yunbin: '一支金步摇',
  sumuqiu: '一截残剑穗',
  lanfenghuang: '一只银铃',
  luxueqi: '一枚寒玉诀',
  fengming: '一把赤羽扇',
  qinkeqing: '一串琥珀念珠',
  jiangwanyin: '一枚海螺',
  bairuoxue: '一片冰晶雪花',
  qingli: '一颗九尾玉珠'
};

// ---------- 物品 / 丹药 / 礼物 ----------
const ITEMS = [
  { id: 'jinchuang', name: '金疮药', type: 'hp', value: 80, price: 20, desc: '止血疗伤，江湖必备。' },
  { id: 'xiaohuan', name: '小还丹', type: 'hp', value: 300, price: 80, desc: '回血良药，效果显著。' },
  { id: 'dahuan', name: '大还丹', type: 'hp', value: 800, price: 220, desc: '起死回生，千金难求。' },
  { id: 'peiyuan', name: '培元丹', type: 'mp', value: 150, price: 50, desc: '恢复内力。' },
  { id: 'jiedu', name: '解毒丹', type: 'cure', value: 0, price: 40, desc: '解百毒。' },
  { id: 'jijirou', name: '鸡腿', type: 'gift', value: 0, price: 5, desc: '香喷喷的鸡腿。' },
  { id: 'doufu', name: '嫩豆腐', type: 'gift', value: 0, price: 6, desc: '苏小鱼家的招牌豆腐。' },
  { id: 'guihua', name: '桂花糕', type: 'gift', value: 0, price: 8, desc: '甜而不腻的糕点。' },
  { id: 'mi', name: '蜂蜜', type: 'gift', value: 0, price: 10, desc: '野蜂蜜，香甜可口。' },
  { id: 'jiudai', name: '美酒', type: 'gift', value: 0, price: 15, desc: '上好的女儿红。' },
  { id: 'sheye', name: '蛇胆', type: 'gift', value: 0, price: 12, desc: '据说能明目。' },
  { id: 'gudan', name: '蛊虫', type: 'gift', value: 0, price: 20, desc: '毛骨悚然的小东西。' },
  { id: 'lingquan', name: '灵泉水', type: 'hp', value: 120, price: 60, desc: '灵气充沛的山泉。' },
  { id: 'jiayao', name: '假药', type: 'hp', value: -20, price: 5, desc: '吃了可能更糟。' }
];

// ---------- 掉落表（敌人掉落 / 宝箱） ----------
const DROPS = {
  jijirou: { type: 'item', id: 'jijirou', chance: 0.5, qty: [1, 2] },
  jiudai: { type: 'item', id: 'jiudai', chance: 0.4, qty: [1, 1] },
  jiayao: { type: 'item', id: 'jiayao', chance: 0.4, qty: [1, 1] },
  sheye: { type: 'item', id: 'sheye', chance: 0.5, qty: [1, 1] },
  zhupi: { type: 'item', id: 'jinchuang', chance: 0.5, qty: [1, 1] },
  gudan: { type: 'item', id: 'gudan', chance: 0.4, qty: [1, 1] },
  xiexing: { type: 'item', id: 'dahuan', chance: 0.3, qty: [1, 1] },
  langya: { type: 'item', id: 'jinchuang', chance: 0.5, qty: [1, 2] },
  xiongpi: { type: 'item', id: 'xiaohuan', chance: 0.5, qty: [1, 1] },
  shanling: { type: 'item', id: 'gold', chance: 1, qty: [30, 80] },
  sheyao_nei: { type: 'item', id: 'dahuan', chance: 0.4, qty: [1, 1] },
  huyao_wei: { type: 'item', id: 'gold', chance: 1, qty: [40, 100] },
  yaowang_dan: { type: 'item', id: 'dahuan', chance: 1, qty: [2, 3] },
  shanbao: { type: 'weapon', id: 'shanbao', chance: 1, qty: [1, 1] },
  xueshou: { type: 'weapon', id: 'xueshou', chance: 1, qty: [1, 1] },
  jianyi: { type: 'weapon', id: 'jianyi', chance: 1, qty: [1, 1] },
  yaohou_xin: { type: 'item', id: 'dahuan', chance: 1, qty: [3, 5] },
  moshen_dan: { type: 'item', id: 'dahuan', chance: 1, qty: [5, 10] },
  broken_sword: { type: 'weapon', id: 'broken_sword', chance: 1, qty: [1, 1] },
  heifeng_dao: { type: 'weapon', id: 'heifeng_dao', chance: 1, qty: [1, 1] },
  shali_jian: { type: 'weapon', id: 'shali_jian', chance: 1, qty: [1, 1] },
  tianmen_jian: { type: 'weapon', id: 'tianmen_jian', chance: 1, qty: [1, 1] },
  laojiao_dan: { type: 'item', id: 'dahuan', chance: 1, qty: [2, 3] },
  longzhu: { type: 'item', id: 'dahuan', chance: 1, qty: [3, 4] },
  guiwang_ling: { type: 'item', id: 'dahuan', chance: 1, qty: [3, 4] },
  kunlun_fa: { type: 'item', id: 'xiaohuan', chance: 1, qty: [2, 3] }
};

// ---------- 固定掉落武器（boss 专属） ----------
const UNIQUE_WEAPONS = {
  shanbao: { type: 'dao', quality: 'lv', name: '山贼王的宝刀', fixed: true, affix: ['sharp'] },
  xueshou: { type: 'fist', quality: 'lan', name: '血手印', fixed: true, affix: ['blood', 'ehuo'] },
  jianyi: { type: 'sword', quality: 'zi', name: '剑圣佩剑·吹雪', fixed: true, affix: ['sharp', 'leech', 'ejin'] },
  broken_sword: { type: 'sword', quality: 'hui', name: '断剑·残红', fixed: true, affix: ['crit'] },
  heifeng_dao: { type: 'dao', quality: 'lan', name: '鬼头刀·黑旋风', fixed: true, affix: ['heavy', 'ejin'] },
  shali_jian: { type: 'dao', quality: 'zi', name: '弯刀·沙里飞', fixed: true, affix: ['sharp', 'swift'] },
  tianmen_jian: { type: 'sword', quality: 'cheng', name: '斩天剑', fixed: true, affix: ['sharp', 'leech', 'ejin'] },
  longyuan: { type: 'sword', quality: 'cheng', name: '龙渊剑', fixed: true, affix: ['sharp', 'swift', 'ejin'] },
  xueshan: { type: 'dao', quality: 'zi', name: '雪魄刀', fixed: true, affix: ['sharp', 'eshui'] },
  lingxi: { type: 'fan', quality: 'lan', name: '灵犀扇', fixed: true, affix: ['swift', 'dodge'] },
  shouyin_jian: { type: 'sword', quality: 'cheng', name: '守印剑·山河', fixed: true, affix: ['sharp', 'leech', 'ejin'], bonus: { atk: 0.12, pierce: 0.15, def: 0.08 } }
};

// ---------- 固定名武器池（按等级段分布，10 类型均衡，低到高皆有） ----------
// type: 武器类型；quality: 品质；level: 最低掉落等级；affix: 固定词缀
const NAMED_WEAPONS = [
  // —— 1 级入门（普通）——
  { name: '青锋剑', type: 'sword', quality: 'bai', level: 1, affix: ['sharp'] },
  { name: '开山刀', type: 'dao', quality: 'bai', level: 1, affix: ['heavy'] },
  { name: '白蜡枪', type: 'qiang', quality: 'bai', level: 1, affix: ['swift'] },
  { name: '齐眉棍', type: 'gun', quality: 'bai', level: 1, affix: ['heavy'] },
  { name: '鱼肠匕', type: 'dagger', quality: 'bai', level: 1, affix: ['swift'] },
  { name: '铁莲子', type: 'hidden', quality: 'bai', level: 1, affix: ['crit'] },
  { name: '铁指环', type: 'fist', quality: 'bai', level: 1, affix: ['sharp'] },
  { name: '麻绳鞭', type: 'whip', quality: 'bai', level: 1, affix: ['dodge'] },
  { name: '竹骨扇', type: 'fan', quality: 'bai', level: 1, affix: ['heavy'] },
  { name: '猎弓', type: 'bow', quality: 'bai', level: 1, affix: ['crit'] },
  // —— 10 级（优良）——
  { name: '落霞剑', type: 'sword', quality: 'lv', level: 10, affix: ['sharp'] },
  { name: '雁翎刀', type: 'dao', quality: 'lv', level: 10, affix: ['sharp'] },
  { name: '梨花枪', type: 'qiang', quality: 'lv', level: 10, affix: ['pierce'] },
  { name: '熟铜棍', type: 'gun', quality: 'lv', level: 10, affix: ['heavy'] },
  { name: '追魂匕', type: 'dagger', quality: 'lv', level: 10, affix: ['crit'] },
  { name: '飞蝗石', type: 'hidden', quality: 'lv', level: 10, affix: ['leech'] },
  { name: '虎牙拳套', type: 'fist', quality: 'lv', level: 10, affix: ['pierce'] },
  { name: '软索鞭', type: 'whip', quality: 'lv', level: 10, affix: ['swift'] },
  { name: '折铁扇', type: 'fan', quality: 'lv', level: 10, affix: ['dodge'] },
  { name: '硬木弩', type: 'bow', quality: 'lv', level: 10, affix: ['leech'] },
  // —— 22 级（精良）——
  { name: '寒光剑', type: 'sword', quality: 'lan', level: 22, affix: ['sharp', 'eshui'] },
  { name: '血饮刀', type: 'dao', quality: 'lan', level: 22, affix: ['blood', 'leech'] },
  { name: '破军枪', type: 'qiang', quality: 'lan', level: 22, affix: ['pierce', 'heavy'] },
  { name: '盘龙棍', type: 'gun', quality: 'lan', level: 22, affix: ['heavy', 'thorn'] },
  { name: '影舞双匕', type: 'dagger', quality: 'lan', level: 22, affix: ['swift', 'crit'] },
  { name: '袖里剑', type: 'hidden', quality: 'lan', level: 22, affix: ['crit', 'leech'] },
  { name: '崩山拳套', type: 'fist', quality: 'lan', level: 22, affix: ['sharp', 'pierce'] },
  { name: '蛇信鞭', type: 'whip', quality: 'lan', level: 22, affix: ['swift', 'dodge'] },
  { name: '描金扇', type: 'fan', quality: 'lan', level: 22, affix: ['dodge', 'heavy'] },
  { name: '穿云弓', type: 'bow', quality: 'lan', level: 22, affix: ['crit', 'leech'] },
  // —— 36 级（精良）——
  { name: '龙纹剑', type: 'sword', quality: 'lan', level: 36, affix: ['sharp', 'ejin'] },
  { name: '虎啸刀', type: 'dao', quality: 'lan', level: 36, affix: ['heavy', 'sharp'] },
  { name: '追风枪', type: 'qiang', quality: 'lan', level: 36, affix: ['swift', 'pierce'] },
  { name: '浑铁棍', type: 'gun', quality: 'lan', level: 36, affix: ['heavy', 'thorn'] },
  { name: '破空匕', type: 'dagger', quality: 'lan', level: 36, affix: ['swift', 'pierce'] },
  { name: '追星逐月', type: 'hidden', quality: 'lan', level: 36, affix: ['crit', 'swift'] },
  { name: '断岳拳套', type: 'fist', quality: 'lan', level: 36, affix: ['sharp', 'pierce'] },
  { name: '灵蛇鞭', type: 'whip', quality: 'lan', level: 36, affix: ['swift', 'dodge'] },
  { name: '铁骨扇', type: 'fan', quality: 'lan', level: 36, affix: ['dodge', 'heavy'] },
  { name: '神臂弩', type: 'bow', quality: 'lan', level: 36, affix: ['crit', 'pierce'] },
  // —— 55 级（史诗）——
  { name: '紫电剑', type: 'sword', quality: 'zi', level: 55, affix: ['sharp', 'pojun'] },
  { name: '烈焰刀', type: 'dao', quality: 'zi', level: 55, affix: ['ehuo', 'wushuang'] },
  { name: '龙胆枪', type: 'qiang', quality: 'zi', level: 55, affix: ['pierce', 'pojun'] },
  { name: '降魔杵', type: 'gun', quality: 'zi', level: 55, affix: ['heavy', 'huichun'] },
  { name: '流光双匕', type: 'dagger', quality: 'zi', level: 55, affix: ['swift', 'shenxing'] },
  { name: '暴雨梨花', type: 'hidden', quality: 'zi', level: 55, affix: ['leech', 'lianzhu'] },
  { name: '裂天拳套', type: 'fist', quality: 'zi', level: 55, affix: ['sharp', 'pojun'] },
  { name: '缚龙索', type: 'whip', quality: 'zi', level: 55, affix: ['dodge', 'shihun'] },
  { name: '玄铁扇', type: 'fan', quality: 'zi', level: 55, affix: ['dodge', 'huichun'] },
  { name: '落日弓', type: 'bow', quality: 'zi', level: 55, affix: ['crit', 'lianzhu'] },
  // —— 78 级（传说）——
  { name: '天罡剑', type: 'sword', quality: 'cheng', level: 78, affix: ['sharp', 'leech', 'tianming'] },
  { name: '修罗刀', type: 'dao', quality: 'cheng', level: 78, affix: ['blood', 'leech', 'shihun'] },
  { name: '霸王枪', type: 'qiang', quality: 'cheng', level: 78, affix: ['heavy', 'pierce', 'wushuang'] },
  { name: '如意棍', type: 'gun', quality: 'cheng', level: 78, affix: ['heavy', 'thorn', 'tianming'] },
  { name: '无影', type: 'dagger', quality: 'cheng', level: 78, affix: ['swift', 'crit', 'shenxing'] },
  { name: '天女散花', type: 'hidden', quality: 'cheng', level: 78, affix: ['crit', 'leech', 'lianzhu'] },
  { name: '碎星拳套', type: 'fist', quality: 'cheng', level: 78, affix: ['sharp', 'pierce', 'wushuang'] },
  { name: '追魂索', type: 'whip', quality: 'cheng', level: 78, affix: ['swift', 'dodge', 'shihun'] },
  { name: '山河扇', type: 'fan', quality: 'cheng', level: 78, affix: ['dodge', 'heavy', 'tianming'] },
  { name: '射日弓', type: 'bow', quality: 'cheng', level: 78, affix: ['crit', 'leech', 'lianzhu'] }
];

// ---------- 境界（5 大境界 × 3 小境界） ----------
// 纯实力系统：等级达到 levelReq 即可突破，与剧情选择无关
const REALMS = [
  { major: '炼体境', minor: '淬皮', levelReq: 1,  statMult: 1.0 },
  { major: '炼体境', minor: '锻骨', levelReq: 6,  statMult: 1.12 },
  { major: '炼体境', minor: '易筋', levelReq: 12, statMult: 1.25 },
  { major: '聚气境', minor: '凝气', levelReq: 18, statMult: 1.4 },
  { major: '聚气境', minor: '通脉', levelReq: 25, statMult: 1.55 },
  { major: '聚气境', minor: '周天', levelReq: 32, statMult: 1.7 },
  { major: '先天境', minor: '开窍', levelReq: 40, statMult: 1.9 },
  { major: '先天境', minor: '洗髓', levelReq: 48, statMult: 2.1 },
  { major: '先天境', minor: '胎息', levelReq: 56, statMult: 2.3 },
  { major: '宗师境', minor: '化劲', levelReq: 65, statMult: 2.55 },
  { major: '宗师境', minor: '见神', levelReq: 74, statMult: 2.8 },
  { major: '宗师境', minor: '返真', levelReq: 83, statMult: 3.05 },
  { major: '天人境', minor: '合一', levelReq: 92, statMult: 3.35 },
  { major: '天人境', minor: '破妄', levelReq: 101, statMult: 3.65 },
  { major: '天人境', minor: '破碎虚空', levelReq: 110, statMult: 4.0 }
];

// ---------- 境界突破定场诗（与 REALMS 逐一对位） ----------
const REALM_POEM = [
  '皮如金石坚，百炼始成形。',
  '骨若生铁硬，千锤锻此身。',
  '筋似弓弦满，一触劲力生。',
  '丹田初聚气，一缕入灵台。',
  '百脉通如川，真气自流转。',
  '周天三百转，气海纳乾坤。',
  '七窍通天地，灵觉初开明。',
  '洗髓脱凡胎，垢尽见真如。',
  '胎息返先天，呼吸若有无。',
  '化劲如流水，刚柔一掌间。',
  '见神方知我，举手破万法。',
  '返璞归真境，浑然天地宽。',
  '天人合一境，我即此山河。',
  '破妄见真我，大梦初醒时。',
  '破碎虚空去，方知天外天。'
];

// ---------- 击杀 Boss 定场诗（随机取一联） ----------
const BOSS_POEMS = [
  '枭雄授首尘归土，一剑了却江湖债。',
  '强敌伏诛血未干，腥风血雨至此歇。',
  '斩将搴旗威名震，名动一方入传说。',
  '气吞万里如虎啸，试问天下谁争锋。'
];

// ---------- 装备槽位（5 件） ----------
const ARMOR_SLOTS = [
  { id: 'head', name: '头冠' },
  { id: 'body', name: '身甲' },
  { id: 'hand', name: '护腕' },
  { id: 'leg', name: '护腿' },
  { id: 'foot', name: '战靴' }
];
const ARMOR_NAME_SUFFIX = { head: ['冠', '巾', '笠', '簪'], body: ['甲', '袍', '衫', '铠'], hand: ['腕', '护手', '臂铠'], leg: ['裤', '护腿', '裙甲'], foot: ['靴', '履', '云履'] };

// ---------- 套装 ----------
const SETS = [
  // —— 低等级（1-20）——
  { id: 'buyi', name: '粗布衣', base: '粗布', level: 1, bonus: { def: 0.05, hp: 0.03 }, desc: '防御+5%，气血+3%' },
  { id: 'mabu', name: '青麻衣', base: '青麻', level: 4, bonus: { def: 0.06, hp: 0.04 }, desc: '防御+6%，气血+4%' },
  { id: 'pijia', name: '鹿皮软甲', base: '鹿皮', level: 7, bonus: { def: 0.08, hp: 0.05 }, desc: '防御+8%，气血+5%' },
  { id: 'tengjia', name: '青藤甲', base: '青藤', level: 11, bonus: { def: 0.10, dodge: 0.03 }, desc: '防御+10%，闪避+3%' },
  { id: 'mianjia', name: '铁絮甲', base: '铁絮', level: 15, bonus: { hp: 0.08, def: 0.06 }, desc: '气血+8%，防御+6%' },
  { id: 'tieyi', name: '镔铁衣', base: '镔铁', level: 19, bonus: { def: 0.12, hp: 0.06 }, desc: '防御+12%，气血+6%' },
  { id: 'tongjia', name: '赤铜甲', base: '赤铜', level: 23, bonus: { def: 0.14, hp: 0.07 }, desc: '防御+14%，气血+7%' },
  { id: 'ruanwei', name: '软猬甲', base: '软猬', level: 27, bonus: { def: 0.10, thorn: 0.08 }, desc: '防御+10%，反伤+8%' },
  { id: 'yingjia', name: '玄龟甲', base: '玄龟', level: 31, bonus: { def: 0.16, hp: 0.08 }, desc: '防御+16%，气血+8%' },
  // —— 中等级（35-60）——
  { id: 'hantie', name: '千年寒铁', base: '寒铁', level: 35, bonus: { def: 0.18, hp: 0.09 }, desc: '防御+18%，气血+9%' },
  { id: 'xuantie', name: '九天玄铁', base: '玄铁', level: 39, bonus: { def: 0.20, hp: 0.10 }, desc: '防御+20%，气血+10%' },
  { id: 'zijin', name: '紫金罗纹', base: '紫金', level: 43, bonus: { atk: 0.08, def: 0.12 }, desc: '攻击+8%，防御+12%' },
  { id: 'longlin', name: '龙鳞甲', base: '龙鳞', level: 47, bonus: { def: 0.18, hp: 0.12 }, desc: '防御+18%，气血+12%' },
  { id: 'fengyu', name: '凤羽霓裳', base: '凤羽', level: 51, bonus: { spd: 0.10, dodge: 0.06 }, desc: '身法+10%，闪避+6%' },
  { id: 'tiancan', name: '天蚕衣', base: '天蚕', level: 55, bonus: { hp: 0.14, def: 0.10 }, desc: '气血+14%，防御+10%' },
  { id: 'jinsi', name: '金缕玉衣', base: '金缕', level: 59, bonus: { def: 0.16, hp: 0.12 }, desc: '防御+16%，气血+12%' },
  // —— 高等级（63-90）——
  { id: 'yunyao', name: '踏云鹞', base: '踏云', level: 63, bonus: { spd: 0.14, dodge: 0.08 }, desc: '身法+14%，闪避+8%' },
  { id: 'xuanming', name: '玄冥甲', base: '玄冥', level: 67, bonus: { def: 0.15, hp: 0.10 }, desc: '防御+15%，气血+10%' },
  { id: 'chiyan', name: '赤焰焚天', base: '赤焰', level: 71, bonus: { atk: 0.15, crit: 0.05 }, desc: '攻击+15%，暴击+5%' },
  { id: 'qingfeng', name: '青锋剑意', base: '青锋', level: 75, bonus: { spd: 0.15, dodge: 0.06 }, desc: '身法+15%，闪避+6%' },
  { id: 'leiming', name: '紫电雷鸣', base: '紫电', level: 79, bonus: { atk: 0.10, critDmg: 0.25 }, desc: '攻击+10%，暴伤+25%' },
  { id: 'shenmo', name: '神魔不侵', base: '神魔', level: 83, bonus: { atk: 0.12, def: 0.12 }, desc: '攻击+12%，防御+12%' },
  { id: 'hundun', name: '混沌归元', base: '混沌', level: 87, bonus: { hp: 0.16, def: 0.14 }, desc: '气血+16%，防御+14%' },
  // —— 顶级（91-112）——
  { id: 'taiji', name: '太极两仪', base: '太极', level: 91, bonus: { def: 0.14, dodge: 0.08 }, desc: '防御+14%，闪避+8%' },
  { id: 'wanxiang', name: '万象森罗', base: '万象', level: 95, bonus: { atk: 0.14, crit: 0.06 }, desc: '攻击+14%，暴击+6%' },
  { id: 'tiangang', name: '天罡正气', base: '天罡', level: 99, bonus: { atk: 0.16, def: 0.10 }, desc: '攻击+16%，防御+10%' },
  { id: 'disha', name: '地煞玄阴', base: '地煞', level: 103, bonus: { def: 0.18, hp: 0.16 }, desc: '防御+18%，气血+16%' },
  { id: 'zhuxian', name: '诛仙斩神', base: '诛仙', level: 106, bonus: { atk: 0.18, critDmg: 0.20 }, desc: '攻击+18%，暴伤+20%' },
  { id: 'mieshi', name: '灭世劫', base: '灭世', level: 109, bonus: { atk: 0.20, crit: 0.08 }, desc: '攻击+20%，暴击+8%' },
  { id: 'posui', name: '破碎虚空', base: '破碎', level: 112, bonus: { atk: 0.15, def: 0.15, hp: 0.15 }, desc: '攻击+15%，防御+15%，气血+15%' }
];

// ---------- 江湖传说神器（红色，唯一，有渊源） ----------
const ARTIFACTS = [
  { id: 'zhanwang', name: '斩妄', type: 'weapon', weaponType: 'sword', lore: '传说能斩破虚妄之剑，剑锋所指，真假自现。', bonus: { atk: 0.4, pierce: 0.3 } },
  { id: 'wuxiang', name: '无相面具', type: 'armor', slot: 'head', lore: '戴上它的人，将不再被世人所见。', bonus: { dodge: 0.15, spd: 0.10 } },
  { id: 'dameng', name: '大梦袈裟', type: 'armor', slot: 'body', lore: '披上它的人，会在梦中看见另一个自己。', bonus: { hp: 0.35, def: 0.18 } },
  { id: 'shanhe', name: '山河印（残）', type: 'armor', slot: 'hand', lore: '失窃至宝的残片，似能改天换地。', bonus: { atk: 0.25, def: 0.12 } },
  { id: 'lunhui', name: '轮回', type: 'weapon', weaponType: 'dao', lore: '一刀斩断因果，也斩不断自己的轮回。', bonus: { atk: 0.4, lifeSteal: 0.12 } }
];

// ---------- 主线剧情（四幕；flags.story 记录当前步骤，choices.next 推进） ----------
const STORY = [
  { id: 'a1_1', title: '山河印失窃', levelReq: 1,
    lines: [
      '—— 第一幕 · 初入江湖 ——',
      '青石村近日人心惶惶：镇压村中气运的至宝「山河印」竟在一夜之间不翼而飞。',
      '村长带着众人查遍全村，只在藏印的石台上发现一行血字：「天地为局，众生为子。」'
    ],
    choices: [
      { text: '追查血字', sub: {
        lines: ['你凑近血字，屏息细看——笔画之间，竟暗藏着用内力刻成的两个小字：「无相」。'],
        choices: [
          { text: '记下这两个字', effect: { per: { ming: 6 } }, next: 'a1_2', result: '「无相」二字如芒在背，你决心查个水落石出。' },
          { text: '拓印血字', effect: {}, next: 'a1_2', result: '你拓下血字，收好作为凭证。' },
          { text: '抹去血字', effect: { per: { gang: 5 } }, next: 'a1_2', result: '你运功抹去血字，免得再吓到村民。' }
        ] } },
      { text: '先问村民', effect: {}, next: 'a1_2', result: '你挨个询问，王婶说夜里听见一声钟响，二傻子说天上多了个月亮——没一句靠谱。' },
      { text: '事不关己', effect: { per: { qing: -5 } }, next: 'a1_2', result: '你本想不管，可那行血字像烙在心上，挥之不去。' }
    ] },
  { id: 'a1_2', title: '追查线索·山贼寨', levelReq: 5,
    lines: [
      '—— 主线 · 追查线索 ——',
      '几经打听，你得知失窃当晚，青石山的山贼曾鬼鬼祟祟出没，还抬着一口沉甸甸的木箱。'
    ],
    choices: [
      { text: '夜探山贼寨', sub: {
        lines: ['你摸到寨外，听见两个喽啰在喝酒吹牛。一个说：「那雇主来头不小，出手就是一百两定金！」另一个压低声音：「听说姓穆的后面，还有更大的……」'],
        choices: [
          { text: '继续偷听', effect: { per: { ming: 6 } }, next: 'a1_3', result: '你又听了一阵，可惜喽啰醉倒，没了下文。' },
          { text: '捉个喽啰逼问', effect: { per: { gang: 6 } }, next: 'a1_3', result: '你拎起一个喽啰，他吓得全招了。' },
          { text: '放火烧寨', effect: { per: { gang: 8 }, moral: -5 }, next: 'a1_3', result: '你一把火烧了山寨，趁乱离去。' }
        ] } },
      { text: '正面叫阵', effect: { exp: 40, rep: 3, per: { xia: 5 } }, next: 'a1_3', result: '你打上门去，山贼哭爹喊娘，交代出雇主将在临江镇接头。' },
      { text: '买通喽啰', effect: { gold: -30 }, next: 'a1_3', result: '你花银子撬开一个喽啰的嘴：雇主来自临江镇，姓「穆」。' }
    ] },
  { id: 'a1_3', title: '临江镇的暗线', levelReq: 12,
    lines: [
      '—— 主线 · 临江镇的暗线 ——',
      '你追到临江镇，接头人却早已人去楼空，只在一间空屋里找到半张烧焦的信笺，残留几字：「……山河印……重塑江湖……盟主……」'
    ],
    choices: [
      { text: '拼合信笺', sub: {
        lines: ['你小心拼合信笺，残存的字迹渐渐清晰：「……山河印既得，只待炼成。届时重塑江湖，废盟主……另立新主……」'],
        choices: [
          { text: '细读落款', effect: { per: { ming: 8 } }, next: 'a1_4', result: '落款是个「穆」字——与山贼交代的雇主姓氏吻合。' },
          { text: '烧毁信笺', effect: { per: { gang: 5 } }, next: 'a1_4', result: '你烧掉信笺，免得走漏风声。' }
        ] } },
      { text: '询问码头脚夫', effect: { gold: -10 }, next: 'a1_4', result: '脚夫说，半夜有辆马车驶往北边，车上人披着黑斗篷。' },
      { text: '静观其变', effect: { per: { qing: 3 } }, next: 'a1_4', result: '你在暗处守了一夜，天快亮时，一个披黑斗篷的人影一闪而过。' }
    ] },
  { id: 'a1_4', title: '引路人现身', levelReq: 15,
    lines: [
      '—— 主线 · 引路人 ——',
      '你在客栈独酌，一位灰袍客不请自来，自顾自坐下，斟了杯茶。',
      '「少侠可曾听过『庄周梦蝶』？」他似笑非笑，「梦里不知身是客，一晌贪欢。」'
    ],
    choices: [
      { text: '追问他是谁', sub: {
        lines: ['他抿了口茶：「无名无姓，你就叫我『无尘』吧。我是谁不重要，重要的是——你信这方天地么？」'],
        choices: [
          { text: '追问下去', effect: { per: { ming: 8 } }, next: 'a1_5', result: '他低声道：「若天地是假，你手里的剑、心里的道，还作数么？」' },
          { text: '只信手中剑', effect: { per: { gang: 8 } }, next: 'a1_5', result: '你握紧剑柄：「我信它。」无尘笑了。' }
        ] } },
      { text: '拔剑相向', effect: { per: { gang: 5 } }, next: 'a1_5', result: '你剑未出鞘，无尘已不在原处，只余一盏茶还温着。' },
      { text: '请他详说', effect: { gold: -10, per: { ming: 8 } }, next: 'a1_5', result: '他低声道：「若这方天地，本就是一场大梦呢？」言罢，人已不见。' }
    ] },
  { id: 'a1_5', title: '世界失真', levelReq: 20,
    lines: [
      '—— 主线 · 世界失真 ——',
      '近日怪事频发：有人记不清昨日之事，镇口石碑上的字一夜之间换了方向，连你自己也开始屡屡「似曾相识」。',
      '你忽然明白——山河印一丢，这个世界正在「失真」。'
    ],
    choices: [
      { text: '寻求真相', sub: {
        lines: ['你四处查访，发现失真的征兆越来越多：有人在街头走了十年，却想不起回家的路；有的地名，一夜之间换了个字。'],
        choices: [
          { text: '记录这些异象', effect: { per: { ming: 8 } }, next: 'a1_6', result: '你一一记录，愈发确信：山河印，关系着这方天地的存续。' },
          { text: '去问无尘', effect: { per: { ming: 8, qing: 5 } }, next: 'a1_6', result: '无尘只道：「梦要醒了，谁也拦不住。」' }
        ] } },
      { text: '保持镇定', effect: { per: { gang: 5 } }, next: 'a1_6', result: '你压下心头不安：无论世界如何，手中的剑是真的。' },
      { text: '顺其自然', effect: { per: { qing: 5, ming: -3 } }, next: 'a1_6', result: '你不再多想，只当是连日奔波，精神恍惚了。' }
    ] },
  { id: 'a1_6', title: '山河印的真相', levelReq: 25,
    lines: [
      '—— 主线 · 山河印的真相 ——',
      '无尘再次现身，这次不再打机锋：「山河印，是维系这方天地的『锚』。它一失，梦就要醒了。」',
      '「而梦醒之后，是真是假，是生是死，无人知晓。」'
    ],
    choices: [
      { text: '追问「梦」是什么', sub: {
        lines: ['无尘的目光望向远方：「这天地，是众生心念织成的『梦』。山河印是锚，锚一失，梦便崩。」'],
        choices: [
          { text: '追问破解之法', effect: { per: { ming: 10 } }, next: 'a1_7', result: '无尘摇头：「无解。除非……你亲眼见到『无相』。」' },
          { text: '追问无相', effect: { per: { ming: 10 } }, next: 'a1_7', result: '「无相，是梦主，也可能……是你自己。」无尘言罢，转身而去。' }
        ] } },
      { text: '不信这套', effect: { per: { gang: 8, ming: -5 } }, next: 'a1_7', result: '你只当无尘疯癫，可夜里却梦见自己站在一片空无之中。' },
      { text: '沉默不语', effect: { per: { qing: 5 } }, next: 'a1_7', result: '你默然良久，无尘长叹一声，转身离去。' }
    ] },
  { id: 'a1_7', title: '初入江湖·转折', levelReq: 30,
    lines: [
      '—— 主线 · 转折 ——',
      '你顺着线索追查到江湖盟会，赫然发现：下令盗印之人，竟与武林盟主·慕容昭有关。',
      '而在盟会密室，你撞见一位与你年纪相仿的白衣女子——她正是慕容昭之女，慕容雪。'
    ],
    choices: [
      { text: '质问她', sub: {
        lines: ['慕容雪垂眸：「父亲常半夜对着一块残印喃喃自语，说『这世界是假的，我要重造一个真的』。我原以为他疯了……」'],
        choices: [
          { text: '追问残印', effect: { per: { ming: 10 } }, flags: ['met_murongxue'], next: 'a2_1', result: '「就是山河印。」她苦笑，「它早已不完整了。」——第一幕 · 完' },
          { text: '表明来意', effect: { per: { qing: 8, xia: 5 } }, flags: ['met_murongxue'], next: 'a2_1', result: '你坦言追查而来，她眼中闪过一丝希望：「也许，你能阻止他。」——第一幕 · 完' }
        ] } },
      { text: '表明来意', effect: { per: { qing: 5, xia: 5 } }, flags: ['met_murongxue'], next: 'a2_1', result: '你坦诚相告，慕容雪却道：「若我说，连这江湖都可能是假的，你信么？」——第一幕 · 完' },
      { text: '暗中观察', effect: { per: { ming: 8 } }, flags: ['met_murongxue'], next: 'a2_1', result: '你藏身暗处，听见慕容雪喃喃自语：「父亲要找的，是『无相』……」——第一幕 · 完' }
    ] },
  { id: 'a2_1', title: '慕容雪的来信', levelReq: 35,
    lines: [
      '—— 第二幕 · 黑手显形 ——',
      '自盟会一别，你收到一封匿名信，字迹娟秀：「家父欲炼化山河印，重塑江湖。我……不知该信谁。明日子时，城郊破庙，盼一见。——慕容雪」'
    ],
    choices: [
      { text: '赴约', sub: {
        lines: ['破庙中，慕容雪缓缓转身。月光下，她比上次更显憔悴，眼中藏着化不开的忧虑。'],
        choices: [
          { text: '问她信中所言', effect: { per: { qing: 6 } }, next: 'a2_2', result: '她低声道：「父亲要炼印，第一个要牺牲的，就是那些不肯归顺的门派。」' },
          { text: '先察四周', effect: { per: { ming: 6 } }, next: 'a2_2', result: '你确认四周无人埋伏，才放下心来。' }
        ] } },
      { text: '将信将疑，暗中埋伏', effect: { per: { ming: 5, qing: -3 } }, next: 'a2_2', result: '你提前藏身暗处，只见她独自在庙中苦等，不似有诈。' },
      { text: '不理不睬', effect: { per: { qing: -8 } }, next: 'a2_2', result: '你没有赴约，却总觉心头压着一块石头。' }
    ] },
  { id: 'a2_2', title: '盟会的异动', levelReq: 40,
    lines: [
      '—— 主线 · 盟会的异动 ——',
      '江湖盟会近来动作频频：各大门派或被威逼、或被利诱，纷纷「归顺」盟主慕容昭。稍有异心者，一夜之间销声匿迹。'
    ],
    choices: [
      { text: '暗中查访', sub: {
        lines: ['你摸进盟会地牢，只见被囚的几位掌门形容枯槁，眼中却仍有一丝倔强。'],
        choices: [
          { text: '探问内情', effect: { per: { ming: 8 } }, next: 'a2_3', result: '他们道：慕容昭要拿各派心法作「祭品」，喂给那方山河印。' },
          { text: '设法营救', effect: { per: { xia: 8 }, rep: 5 }, next: 'a2_3', result: '你暗中助他们逃出，几位掌门对你感激涕零。' }
        ] } },
      { text: '联络正派反抗', effect: { rep: 5, per: { xia: 5 } }, next: 'a2_3', result: '你奔走联络，几位正派掌门却神色躲闪：「慕容盟主……惹不得。」' },
      { text: '静观其变', effect: { per: { qing: 3 } }, next: 'a2_3', result: '你按兵不动，静待时机。' }
    ] },
  { id: 'a2_3', title: '山河印的下落', levelReq: 45,
    lines: [
      '—— 主线 · 山河印的下落 ——',
      '多方线索拼凑，你终于确认：山河印就在慕容昭手中，而他正在一处隐秘之地「炼化」它，企图改写整个江湖。'
    ],
    choices: [
      { text: '潜入查探', sub: {
        lines: ['你摸到炼印之地，只见慕容昭立于大阵中央，山河印悬浮半空，流光如血，四周元气被寸寸抽干。'],
        choices: [
          { text: '细看阵法', effect: { per: { ming: 8 } }, next: 'a2_4', result: '你认出这是「夺天阵」，以众生心念为柴，重铸山河。' },
          { text: '记下方位', effect: { per: { ming: 6, gang: 5 } }, next: 'a2_4', result: '你默记阵眼方位，以备后日破阵之用。' }
        ] } },
      { text: '找无尘商议', effect: { per: { ming: 8 } }, next: 'a2_4', result: '无尘叹道：「他以为能夺天改命，却不知自己也在梦中。」' },
      { text: '直接上门质问', effect: { per: { gang: 8 } }, next: 'a2_4', result: '你闯上盟会，却被慕容昭一掌逼退：「黄口小儿，也配问我？」' }
    ] },
  { id: 'a2_4', title: '无尘的警告', levelReq: 50,
    lines: [
      '—— 主线 · 无尘的警告 ——',
      '无尘正色道：「慕容昭不是你想的那种恶人。他也看见了这世界的『裂缝』，只是他选择的方式，是强夺这梦的主导权。」',
      '「而他所追索的那个名字——『无相』，才是这一切的根源。」'
    ],
    choices: [
      { text: '追问无相', sub: {
        lines: ['无尘闭目：「无形无相，无我无他。无相不是一个人，也不是一个神。」'],
        choices: [
          { text: '追问它是什么', effect: { per: { ming: 10 } }, next: 'a2_5', result: '「是梦主，是这方天地背后的『一念』。也许……它就是你我都逃不开的执念。」' },
          { text: '追问如何见它', effect: { per: { ming: 8 } }, next: 'a2_5', result: '「天门尽头，自会相见。」无尘言罢，不再多说。' }
        ] } },
      { text: '半信半疑', effect: { per: { ming: -3 } }, next: 'a2_5', result: '你听得云里雾里，只当无尘又在打机锋。' },
      { text: '更关心慕容雪', effect: { per: { qing: 5 } }, next: 'a2_5', result: '你问起慕容雪，无尘沉默片刻：「那孩子，怕是要成为这局里最苦的一颗棋。」' }
    ] },
  { id: 'a2_5', title: '世界裂缝', levelReq: 55,
    lines: [
      '—— 主线 · 世界裂缝 ——',
      '失真愈演愈烈：你亲眼看见街角的卖货郎如纸片般「褪色」了一瞬，远山如画，天边竟有裂缝般的黑线一闪而逝。',
      '路人们浑然不觉，依旧熙熙攘攘。'
    ],
    choices: [
      { text: '伸手触碰裂缝', sub: {
        lines: ['你探指入裂缝，指尖一凉，无数破碎的画面涌入脑海——都是你从未经历，却又无比熟悉的片段。'],
        choices: [
          { text: '凝神分辨', effect: { per: { ming: 10 } }, next: 'a2_6', result: '你强忍晕眩，从画面中窥见一角「世界之外」。' },
          { text: '抽身退开', effect: { per: { gang: 6 } }, next: 'a2_6', result: '你猛地抽手，心跳如鼓，指尖久久发凉。' }
        ] } },
      { text: '定心稳住心神', effect: { per: { gang: 8 } }, next: 'a2_6', result: '你默运心法，稳住心神。无论真假，你先要做自己。' },
      { text: '假装没看见', effect: { per: { ming: -5, qing: -3 } }, next: 'a2_6', result: '你移开目光，心却越来越沉。' }
    ] },
  { id: 'a2_6', title: '慕容雪的抉择', levelReq: 60,
    lines: [
      '—— 主线 · 慕容雪的抉择 ——',
      '慕容雪找到你，神色憔悴：「我已查明，父亲是被『无相』蛊惑……他以为炼化山河印就能挣脱宿命，可那只会害死更多人。」',
      '「求你……助我阻止他，别伤他性命，可以么？」'
    ],
    choices: [
      { text: '答应她，尽力不杀', effect: {}, flags: ['xue_trust'], next: 'a2_7', result: '你郑重应下。她眼中泪光一闪，深深一拜。' },
      { text: '细问她的难处', sub: {
        lines: ['她苦笑：「我是他的女儿，却要帮外人对付他……可我不能眼睁睁看着他拉着整个江湖陪葬。」'],
        choices: [
          { text: '应下，尽力周全', effect: { per: { qing: 8, xia: 5 } }, flags: ['xue_trust'], next: 'a2_7', result: '你郑重应下，她眼中泪光一闪，深深一拜。' },
          { text: '仍难答应', effect: { per: { qing: -5 } }, next: 'a2_7', result: '你沉默片刻，终是摇头。她脸色煞白，转身离去。' }
        ] } },
      { text: '冷冷拒绝', effect: { per: { qing: -8, xia: -5 } }, next: 'a2_7', result: '你冷声道：「斩草除根，方是江湖。」她脸色煞白，转身离去。' }
    ] },
  { id: 'a2_7', title: '决战慕容昭', levelReq: 65,
    lines: [
      '—— 主线 · 决战慕容昭 ——',
      '炼印之地，慕容昭已察觉你的到来。他周身山河印之力翻涌，眸中尽是决绝：「这江湖早已腐朽，我不过是要重造一个。挡我者——死！」',
      '（中 Boss 战 · 慕容昭）'
    ],
    choices: [
      { text: '细察破绽', sub: {
        lines: ['激斗中，你瞧见他眼底一闪而过的痛苦，以及他身后那方山河印上，一道道愈发狰狞的裂痕。'],
        choices: [
          { text: '趁机了结他', effect: {}, flags: ['killed_murongzhao', 'killed_murongxue'], next: 'a2_8', result: '你一剑刺出，慕容雪却突然扑来以身相挡——剑刃贯穿了她。慕容昭目眦欲裂：「雪儿！」你手中的剑，也似在滴血。' },
          { text: '只伤不杀', effect: {}, flags: ['spared_murongzhao'], next: 'a2_8', result: '你手下留情，寻隙将他制住。他跌坐在地，终于长叹：「罢了……我告诉你真相。」' }
        ] } },
      { text: '趁势追击，了结他', effect: {}, flags: ['killed_murongzhao', 'killed_murongxue'], next: 'a2_8', result: '你一剑刺出，慕容雪却突然扑来以身相挡——剑刃贯穿了她。慕容昭目眦欲裂：「雪儿！」你手中的剑，也似在滴血。' },
      { text: '只伤不杀，制住他', effect: {}, flags: ['spared_murongzhao'], next: 'a2_8', result: '你手下留情，寻隙将他制住。他跌坐在地，终于长叹：「罢了……我告诉你真相。」' },
      { text: '交予无尘处置', effect: {}, flags: ['spared_murongzhao'], next: 'a2_8', result: '无尘现身，制住慕容昭：「先留他一命，他还有话要说。」' }
    ] },
  { id: 'a2_8', title: '真相一角', levelReq: 70,
    lines: [
      '—— 主线 · 真相一角 ——',
      '慕容昭道出了真相：「我不过是一枚棋子。真正执棋的，是『无相』——它无形无相，藏在每个人的一念之间。」',
      '「而这场江湖，不过是一场……大梦。」',
      '天边那道裂缝，缓缓裂开了更大的口子。'
    ],
    choices: [
      { text: '仰望苍穹', sub: {
        lines: ['你仰望苍穹，裂缝之后，是无边的空无。那空无里，似有无数与你一样的人，正隔着什么望着你。'],
        choices: [
          { text: '凝望空无', effect: { per: { ming: 10 } }, next: 'a3_1', result: '你凝望良久，心中却前所未有地平静。——第二幕 · 完' },
          { text: '问慕容昭后续', effect: { per: { ming: 8 } }, next: 'a3_1', result: '他苦笑道：「无相，就藏在每个人心里。你避不开的。」——第二幕 · 完' }
        ] } },
      { text: '握紧剑柄', effect: { per: { gang: 8 } }, next: 'a3_1', result: '你握紧剑柄，心中只有一个念头：无论真假，先杀出一条路来。——第二幕 · 完' },
      { text: '想起那个白衣女子', effect: { per: { qing: 5 } }, next: 'a3_1', result: '你想起那个白衣女子，心中一痛。——第二幕 · 完' }
    ] },
  { id: 'a3_1', title: '真相的裂缝', levelReq: 75,
    lines: [
      '—— 第三幕 · 楚门之后 ——',
      '慕容昭倒下后，天边的裂缝并未愈合，反而缓缓扩张。越来越多的人开始「失真」：有人忘记自己的名字，有人凭空消失，仿佛从未存在。',
      '无尘望着天穹，低声道：「梦，要醒了。」'
    ],
    choices: [
      { text: '追问如何阻止', sub: {
        lines: ['无尘摇头：「醒与不醒，从来由不得你。你只能决定，醒来之后，成为谁。」'],
        choices: [
          { text: '追问梦中人何去何从', effect: { per: { ming: 8 } }, next: 'a3_2', result: '「梦中人，或随梦散，或……随梦醒入真实。无人知晓。」' },
          { text: '追问自己是谁', effect: { per: { ming: 10 } }, next: 'a3_2', result: '无尘深深看了你一眼：「这也是你此行，要自己找的答案。」' }
        ] } },
      { text: '先去安顿百姓', effect: { per: { qing: 5, xia: 5 } }, next: 'a3_2', result: '你奔走安抚惶惶人心，却发现人们转眼便忘了你的存在。' },
      { text: '冷眼旁观', effect: { per: { qing: -5 } }, next: 'a3_2', result: '你静静看着这一切，心底却生出一丝寒意。' }
    ] },
  { id: 'a3_2', title: '楚门之后', levelReq: 80,
    lines: [
      '—— 主线 · 楚门之后 ——',
      '真相终于完整地摊开在你面前：这方江湖，是一场由众生心念共同维系的「投影」。每个人都是戏中人，也都是造梦者。',
      '而山河印，正是这场大梦的「锚」。'
    ],
    choices: [
      { text: '追问「真实世界」', sub: {
        lines: ['无尘沉默良久：「也许……『真实』也只是一场更大的梦。」'],
        choices: [
          { text: '追问梦外之人', effect: { per: { ming: 10 } }, next: 'a3_3', result: '「若有人从梦外望进来，看我们，便如我们看皮影戏一般。」' },
          { text: '只问归途', effect: { per: { gang: 8 } }, next: 'a3_3', result: '「归途在天门尽头，在无相面前。」无尘答。' }
        ] } },
      { text: '难以置信', effect: { per: { ming: -5 } }, next: 'a3_3', result: '你无论如何不愿相信，可眼前的裂缝却无法否认。' },
      { text: '释然一笑', effect: { per: { qing: 5, gang: -3 } }, next: 'a3_3', result: '你忽然觉得，真真假假，似乎也没那么重要了。' }
    ] },
  { id: 'a3_3', title: '庄周梦蝶', levelReq: 85,
    lines: [
      '—— 主线 · 庄周梦蝶 ——',
      '你反复想起无尘初见时的话：「庄周梦蝶，不知周之梦为蝴蝶与，蝴蝶之梦为周与？」',
      '究竟是你在梦里闯江湖，还是这江湖梦见了你？'
    ],
    choices: [
      { text: '我思故我在', sub: {
        lines: ['你一念既起，心中凛然：无论真假，此刻的「我」，是真的。'],
        choices: [
          { text: '守住本心', effect: { per: { ming: 10, gang: 5 } }, next: 'a3_4', result: '你默念本心，任他天地真假，我自岿然不动。' },
          { text: '留待日后印证', effect: { per: { ming: 8 } }, next: 'a3_4', result: '你按下思绪，决定先走到无相面前，再做定论。' }
        ] } },
      { text: '真假本无别', effect: { per: { ming: 5, qing: 5 } }, next: 'a3_4', result: '你豁然开朗：真与假，或许本就是一体两面。' },
      { text: '越想越乱', effect: { per: { ming: -5 } }, next: 'a3_4', result: '你越想越头疼，索性不再想了。' }
    ] },
  { id: 'a3_4', title: '心念之锚', levelReq: 90,
    lines: [
      '—— 主线 · 心念之锚 ——',
      '无尘道出关键：「山河印是锚，无相是梦主。要破此局，唯有直面无相——它就在天门的尽头。」',
      '「而通往无相的路，不止一条。有人硬闯，有人潜入，有人刺杀，有人妄图取而代之，也有人……只想离开。」'
    ],
    choices: [
      { text: '询问各条路', sub: {
        lines: ['无尘缓缓道来：「硬闯，需力压天门群雄；潜入，需勘破世界裂缝；刺杀，需雷霆一击；取代，需比无相更强的执念；离开，则需放下一切。」'],
        choices: [
          { text: '记下各路的门道', effect: { per: { ming: 8 } }, next: 'a3_5', result: '你细细记下，心中已有计较。' },
          { text: '问哪条最险', effect: { per: { ming: 5 } }, next: 'a3_5', result: '「条条凶险。」无尘叹道，「唯『离开』一条，最是温柔，也最是难舍。」' }
        ] } },
      { text: '直接问他哪条最好', effect: { per: { qing: 5 } }, next: 'a3_5', result: '无尘苦笑：「别人的路，你走不了。你的路，在你的心性里。」' },
      { text: '沉默思考', effect: { per: { gang: 3 } }, next: 'a3_5', result: '你默然良久，心中渐渐有了计较。' }
    ] },
  { id: 'a3_5', title: '五条路径', levelReq: 95,
    lines: [
      '—— 主线 · 择路 ——',
      '天门在望。通往无相的五条路摆在眼前，每条都凶险万分。你的选择，将决定你如何面对这场大梦的终点。'
    ],
    choices: [
      { text: '硬闯天门（正面杀入）', effect: {}, flags: ['path_hard'], next: 'a3_6', result: '你决定以力破局，堂堂正正杀出一条血路。' },
      { text: '潜入裂缝（循隙潜入）', effect: {}, req: { mingMin: 20 }, flags: ['path_stealth'], next: 'a3_6', result: '你决定循着世界裂缝，悄无声息地潜向无相。' },
      { text: '隐秘刺杀（直取无相）', effect: {}, req: { gangMin: 30 }, flags: ['path_assassin'], next: 'a3_6', result: '你决定以雷霆之势，寻隐秘通道直刺无相。' },
      { text: '取而代之（夺梦主之位）', effect: {}, req: { evil: true }, flags: ['path_replace'], next: 'a3_6', result: '你心生一念：既然这梦缺个主人，为何不能是我？' },
      { text: '舍弃一切（只求离开）', effect: {}, req: { mingMin: 50 }, flags: ['path_leave'], next: 'a3_6', result: '你不再恋战，只想挣脱这场梦，回到「真实」。' }
    ] },
  { id: 'a3_6', title: '天门之前', levelReq: 100,
    lines: [
      '—— 主线 · 天门之前 ——',
      '你终于来到天门。那道青铜巨门缓缓开启，门后是一片没有尽头的空无，以及一道若有若无的「形」。',
      '无尘停下脚步：「我只能送你到此。门后，便是无相，也是你自己。」'
    ],
    choices: [
      { text: '踏入天门', sub: {
        lines: ['你深吸一口气，踏入门中。身后，江湖渐远；身前，唯有虚无。'],
        choices: [
          { text: '头也不回', effect: { per: { gang: 6 } }, next: 'a4_1', result: '你大步向前，不再回头。——第三幕 · 完' },
          { text: '回头看一眼', effect: { per: { qing: 6 } }, next: 'a4_1', result: '你回望一眼，那个烟雨江湖，正缓缓合上它的大门。——第三幕 · 完' }
        ] } },
      { text: '再望一眼江湖', effect: { per: { qing: 5 } }, next: 'a4_1', result: '你回望来路，烟雨江湖，如同一幅渐渐褪色的画。——第三幕 · 完' },
      { text: '问无尘最后一事', effect: { per: { ming: 5 } }, next: 'a4_1', result: '「无相，到底是谁？」无尘答：「无相者，无我相、无人相、无众生相。它，即是你所见。」——第三幕 · 完' }
    ] },
  { id: 'a4_1', title: '无相', levelReq: 105,
    lines: [
      '—— 第四幕 · 破妄 ——',
      '你踏入虚无。四周空无一物，唯有一道「形」悬浮于前——它忽而是你，忽而是众生，忽而什么都不是。',
      '「你来了。」声音似从四面八方响起，又似从你心底涌出。「我是无相，也是你的一念。你要如何破我？」'
    ],
    choices: [
      { text: '质问无相', sub: {
        lines: ['「你究竟是谁？这方天地，又是什么？」无相的声音顿了顿：「我是众生之念，是山河之梦。而你，也是这念的一部分。」'],
        choices: [
          { text: '以心照之', effect: { per: { ming: 10 } }, next: 'a4_2', result: '你收剑入鞘，凝神静气，以心光映照无相。' },
          { text: '以剑破之', effect: { per: { gang: 10 } }, next: 'a4_2', result: '你不再多问，拔剑而起，剑气撕裂虚无。' }
        ] } },
      { text: '以剑破之', effect: { per: { gang: 10 } }, next: 'a4_2', result: '你拔剑而起，剑气撕裂虚无，直指那道「形」。' },
      { text: '以心照之', effect: { per: { ming: 10 } }, next: 'a4_2', result: '你收剑入鞘，凝神静气，以心光映照无相。' },
      { text: '以情渡之', effect: { per: { qing: 10 } }, next: 'a4_2', result: '你想起一路走来的故人旧事，心头一软，缓步向前。' }
    ] },
  { id: 'a4_2', title: '破妄·抉择', levelReq: 110, endings: true,
    lines: [
      '—— 主线 · 破妄 · 抉择 ——',
      '无相在你面前，无数种结局如走马灯般流转。',
      '你的心性、你的善恶、你的每一次抉择，早已写好了你能走的那些路。',
      '现在，选择你的结局：'
    ] }
];

// ---------- 十结局（隐藏数值决定可见结局，玩家仍可在可见项中选择） ----------
const ENDINGS = [
  { id: 'zhen', name: '破妄归真', desc: '勘破大梦，醒于真实，江湖留名。', req: '明 ≥ 50' },
  { id: 'meng', name: '沉溺大梦', desc: '甘愿留梦，与幻共老。', req: '明 ≤ -50' },
  { id: 'dai', name: '取而代之', desc: '你成了新的「造梦者」。', req: '恶 且 刚 ≥ 30' },
  { id: 'du', name: '渡尽苍生', desc: '以心念重铸山河，还天下一个真的江湖。', req: '善 且 侠 ≥ 30' },
  { id: 'zhan', name: '斩断因果', desc: '一刀破妄，孑然一身。', req: '戾 且 刚 ≥ 30' },
  { id: 'yin', name: '归隐浮生', desc: '看破不说破，隐于市井。', req: '柔 或 冷' },
  { id: 'lunhui', name: '轮回不灭', desc: '与心上人携手入轮回，生生世世。', req: '情侣结缘 且 情 ≥ 30' },
  { id: 'wuwo', name: '无我无相', desc: '与无相合一，化入众生心念。', req: '明 ≥ 70 且 情 ≥ 30' },
  { id: 'xinmo', name: '心魔', desc: '误杀慕容雪，因果反噬，永堕心魔。', req: '误杀慕容雪 且（恶 或 戾）' },
  { id: 'kongmen', name: '空门', desc: '遁入空门，不问红尘。', req: '中立 且（明 ≥ 30 或 情 ≥ 30）' }
];

// ---------- 支线任务（探索触发，去指定地点完成，任务线越长奖励越好） ----------
const QUESTS = [
  { id: 'q1', name: '青石村的托付', steps: [
    { id: 'q1_1', desc: '王婶托你给临江镇的张大夫送一封家书。', targetRegion: 'zhen', reward: { gold: 60, exp: 50 }, result: '你把家书送到，张大夫给了谢银。' },
    { id: 'q1_2', desc: '张大夫托你送一包药到黑风寨附近的驿馆。', targetRegion: 'heifeng', reward: { gold: 100, exp: 80 }, result: '你把药送到，得了赏钱。' },
    { id: 'q1_3', desc: '最后，替张大夫去江湖官道讨一笔旧账。', targetRegion: 'jianghu', reward: { gold: 160, exp: 140, talent: 1 }, result: '你讨回旧账，张大夫传你岐黄之术（+1 天赋点）。' }
  ]},
  { id: 'q2', name: '山贼之患', steps: [
    { id: 'q2_1', desc: '青石山山贼猖獗，官府悬赏清剿。', targetRegion: 'shan', reward: { gold: 80, exp: 60 }, result: '你清剿了一窝山贼，官府赏银。' },
    { id: 'q2_2', desc: '山贼余党逃进黑风寨，去揪出来。', targetRegion: 'heifeng', reward: { gold: 160, exp: 140 }, result: '你直捣黑风寨，夺回被劫财物。' },
    { id: 'q2_3', desc: '为首的悍匪窜入江湖官道，务必将之擒拿。', targetRegion: 'jianghu', reward: { gold: 240, exp: 220, weapon: 'shanbao' }, result: '你擒下悍匪，夺下一柄宝刀！' }
  ]},
  { id: 'q3', name: '送药', steps: [
    { id: 'q3_1', desc: '村口药铺托你送药到临江镇。', targetRegion: 'zhen', reward: { gold: 50, exp: 40 }, result: '药送到，掌柜道了谢。' },
    { id: 'q3_2', desc: '临江镇的张大夫又托你回村带一味土产。', targetRegion: 'cun', reward: { gold: 70, exp: 55 }, result: '你带回土产，皆大欢喜。' }
  ]},
  { id: 'q4', name: '桃花坞的请柬', steps: [
    { id: 'q4_1', desc: '桃花坞的花魁托你送请柬到临江镇。', targetRegion: 'zhen', reward: { gold: 55, exp: 45 }, result: '请柬送到，得了赏钱。' },
    { id: 'q4_2', desc: '临江镇的客商想回访，托你带句话到桃花坞。', targetRegion: 'taohuawu', reward: { gold: 80, exp: 65 }, result: '话带到，客商大喜。' }
  ]},
  { id: 'q5', name: '云梦泽的鱼', steps: [
    { id: 'q5_1', desc: '渔夫托你去云梦泽收一批鲜鱼。', targetRegion: 'yunmeng', reward: { gold: 60, exp: 50 }, result: '你收了鱼，渔夫满意。' },
    { id: 'q5_2', desc: '把鱼送到临江镇的酒楼。', targetRegion: 'zhen', reward: { gold: 90, exp: 75 }, result: '酒楼掌柜如数收下。' }
  ]},
  { id: 'q6', name: '乱葬岗怪谈', steps: [
    { id: 'q6_1', desc: '村民说乱葬岗闹鬼，托你去查探。', targetRegion: 'luansanggang', reward: { gold: 70, exp: 60 }, result: '你查探一番，是野猫作祟。' },
    { id: 'q6_2', desc: '把真相告诉义庄的守夜人。', targetRegion: 'yizhuang', reward: { gold: 100, exp: 85 }, result: '守夜人松了口气。' }
  ]},
  { id: 'q7', name: '竹海迷途', steps: [
    { id: 'q7_1', desc: '樵夫在竹海迷路，托你寻回他的柴刀。', targetRegion: 'zhuhai', reward: { gold: 65, exp: 55 }, result: '你寻回柴刀，樵夫感激。' },
    { id: 'q7_2', desc: '顺路把樵夫的口信带到江湖官道。', targetRegion: 'jianghu', reward: { gold: 90, exp: 75 }, result: '口信带到。' }
  ]},
  { id: 'q8', name: '义庄收尸', steps: [
    { id: 'q8_1', desc: '义庄缺人手，托你照看一夜。', targetRegion: 'yizhuang', reward: { gold: 75, exp: 65 }, result: '你守了一夜，平安无事。' },
    { id: 'q8_2', desc: '次日去破庙请个和尚来超度。', targetRegion: 'pomiao', reward: { gold: 110, exp: 90 }, result: '和尚来了，法事圆满。' }
  ]},
  { id: 'q9', name: '破庙寻人', steps: [
    { id: 'q9_1', desc: '有人托你去破庙找一个流浪的故人。', targetRegion: 'pomiao', reward: { gold: 80, exp: 70 }, result: '你找到了人。' },
    { id: 'q9_2', desc: '把故人护送到驿站古道。', targetRegion: 'guandao2', reward: { gold: 110, exp: 90 }, result: '一路平安。' }
  ]},
  { id: 'q10', name: '驿站的包裹', steps: [
    { id: 'q10_1', desc: '驿站的包裹被调包，托你追查。', targetRegion: 'guandao2', reward: { gold: 90, exp: 75 }, result: '你查到了线索。' },
    { id: 'q10_2', desc: '线索指向峨眉山，去取回真包裹。', targetRegion: 'emei', reward: { gold: 130, exp: 110 }, result: '包裹寻回，物归原主。' }
  ]},
  { id: 'q11', name: '采药', steps: [
    { id: 'q11_1', desc: '药铺要一味水边药草，去云梦泽采。', targetRegion: 'yunmeng', reward: { gold: 70, exp: 60 }, result: '你采到药草。' },
    { id: 'q11_2', desc: '再去竹海采一味竹沥。', targetRegion: 'zhuhai', reward: { gold: 90, exp: 75 }, result: '竹沥到手。' },
    { id: 'q11_3', desc: '把药送到峨眉山。', targetRegion: 'emei', reward: { gold: 140, exp: 120, talent: 1 }, result: '药送到，医者赠你药理心得（+1 天赋点）。' }
  ]},
  { id: 'q12', name: '跑腿', steps: [
    { id: 'q12_1', desc: '村长的信要送到青石山。', targetRegion: 'shan', reward: { gold: 40, exp: 35 }, result: '信送到。' },
    { id: 'q12_2', desc: '青石山有人托你带话到临江镇。', targetRegion: 'zhen', reward: { gold: 60, exp: 50 }, result: '话带到。' },
    { id: 'q12_3', desc: '临江镇又托你送件物什到黑风寨。', targetRegion: 'heifeng', reward: { gold: 90, exp: 75 }, result: '物什送到。' },
    { id: 'q12_4', desc: '最后一趟，去江湖官道送一封急信。', targetRegion: 'jianghu', reward: { gold: 140, exp: 120, talent: 1 }, result: '急信送达，收信人重重谢你（+1 天赋点）。' }
  ]},
  { id: 'q13', name: '峨眉素斋', steps: [
    { id: 'q13_1', desc: '峨眉的师太托你去少林寺送素斋的食谱。', targetRegion: 'shaolinsi', reward: { gold: 120, exp: 100 }, result: '食谱送到，僧人们如获至宝。' },
    { id: 'q13_2', desc: '顺路把少林的回礼带回峨眉。', targetRegion: 'emei', reward: { gold: 150, exp: 130 }, result: '回礼带回，皆大欢喜。' }
  ]},
  { id: 'q14', name: '少林香火', steps: [
    { id: 'q14_1', desc: '少林寺要补一批香烛，托你去武当山采购。', targetRegion: 'wudangshan', reward: { gold: 130, exp: 110 }, result: '香烛购齐。' },
    { id: 'q14_2', desc: '把香烛送回少林。', targetRegion: 'shaolinsi', reward: { gold: 160, exp: 140 }, result: '香火又旺了起来。' }
  ]},
  { id: 'q15', name: '武当剑意', steps: [
    { id: 'q15_1', desc: '武当真人托你去藏剑山庄取一柄剑。', targetRegion: 'cangjian', reward: { gold: 140, exp: 120 }, result: '你取回一柄好剑。' },
    { id: 'q15_2', desc: '把剑送回武当山。', targetRegion: 'wudangshan', reward: { gold: 170, exp: 150, talent: 1 }, result: '真人甚喜，点拨了你几句剑理（+1 天赋点）。' }
  ]},
  { id: 'q16', name: '藏剑寻主', steps: [
    { id: 'q16_1', desc: '藏剑山庄有一柄古剑要归还唐家堡。', targetRegion: 'tangjiawu', reward: { gold: 150, exp: 130 }, result: '古剑送到。' },
    { id: 'q16_2', desc: '唐家堡的回信要带回藏剑山庄。', targetRegion: 'cangjian', reward: { gold: 180, exp: 160 }, result: '回信带到。' }
  ]},
  { id: 'q17', name: '唐门暗器', steps: [
    { id: 'q17_1', desc: '唐门要送一批暗器样品到药王谷。', targetRegion: 'yaowanggu', reward: { gold: 160, exp: 140 }, result: '样品送到。' },
    { id: 'q17_2', desc: '药王谷的回礼带回唐家堡。', targetRegion: 'tangjiawu', reward: { gold: 190, exp: 170 }, result: '回礼带到。' }
  ]},
  { id: 'q18', name: '药王谷求医', steps: [
    { id: 'q18_1', desc: '有人中了奇毒，托你去药王谷求医。', targetRegion: 'yaowanggu', reward: { gold: 170, exp: 150 }, result: '你求到了解药方。' },
    { id: 'q18_2', desc: '药方缺一味苗疆蛊草，去采来。', targetRegion: 'miaoling', reward: { gold: 200, exp: 180, talent: 1 }, result: '蛊草采到，病人得救（+1 天赋点）。' }
  ]},
  { id: 'q19', name: '苗疆寻蛊', steps: [
    { id: 'q19_1', desc: '苗疆巫师托你去血刀门寻一件蛊器。', targetRegion: 'xuedaomen', reward: { gold: 180, exp: 160 }, result: '你寻回蛊器。' },
    { id: 'q19_2', desc: '把蛊器带回苗疆。', targetRegion: 'miaoling', reward: { gold: 210, exp: 190 }, result: '巫师十分满意。' }
  ]},
  { id: 'q20', name: '血刀门旧事', steps: [
    { id: 'q20_1', desc: '血刀门托你去西域送一封密信。', targetRegion: 'xiyu', reward: { gold: 190, exp: 170 }, result: '密信送到。' },
    { id: 'q20_2', desc: '西域的回执带回血刀门。', targetRegion: 'xuedaomen', reward: { gold: 220, exp: 200, talent: 1 }, result: '回执带到（+1 天赋点）。' }
  ]},
  { id: 'q21', name: '寻医问药', steps: [
    { id: 'q21_1', desc: '峨眉山有位采药人病倒，去帮他找药。', targetRegion: 'emei', reward: { gold: 90, exp: 80 }, result: '你寻到草药，病情好转。' },
    { id: 'q21_2', desc: '去少林寺求一味「金刚砂」入药。', targetRegion: 'shaolinsi', reward: { gold: 140, exp: 120 }, result: '你求来金刚砂。' },
    { id: 'q21_3', desc: '最后去武当山取「紫霄露」作药引。', targetRegion: 'wudangshan', reward: { gold: 200, exp: 180, talent: 2 }, result: '药成，采药人赠你药经（+2 天赋点）。' }
  ]},
  { id: 'q22', name: '江湖传讯', steps: [
    { id: 'q22_1', desc: '江湖官道的盟会要传讯给峨眉。', targetRegion: 'emei', reward: { gold: 100, exp: 85 }, result: '讯息传到。' },
    { id: 'q22_2', desc: '峨眉回讯要送往少林。', targetRegion: 'shaolinsi', reward: { gold: 130, exp: 110 }, result: '回讯送到。' },
    { id: 'q22_3', desc: '少林再传讯给藏剑山庄。', targetRegion: 'cangjian', reward: { gold: 170, exp: 150 }, result: '讯息传到。' },
    { id: 'q22_4', desc: '最后把藏剑山庄的回执送回官道。', targetRegion: 'jianghu', reward: { gold: 220, exp: 200, talent: 2 }, result: '回执送达，盟会重赏（+2 天赋点）。' }
  ]},
  { id: 'q23', name: '护送镖', steps: [
    { id: 'q23_1', desc: '驿站古道有镖局要护镖去峨眉。', targetRegion: 'emei', reward: { gold: 110, exp: 95 }, result: '你护镖抵达。' },
    { id: 'q23_2', desc: '峨眉的镖要继续送往唐家堡。', targetRegion: 'tangjiawu', reward: { gold: 160, exp: 140 }, result: '你护送到底。' },
    { id: 'q23_3', desc: '唐家堡的回镖要押回驿站。', targetRegion: 'guandao2', reward: { gold: 220, exp: 200, armor: true }, result: '押镖圆满，镖局赠你一件护甲！' }
  ]},
  { id: 'q24', name: '寻剑', steps: [
    { id: 'q24_1', desc: '藏剑山庄失了一柄剑，线索在唐家堡。', targetRegion: 'tangjiawu', reward: { gold: 150, exp: 130 }, result: '你寻回剑的残片。' },
    { id: 'q24_2', desc: '残片要用药王谷的药液淬炼。', targetRegion: 'yaowanggu', reward: { gold: 180, exp: 160 }, result: '淬炼完成。' },
    { id: 'q24_3', desc: '最后去苗疆寻一块磨剑石。', targetRegion: 'miaoling', reward: { gold: 220, exp: 200, weapon: 'longyuan' }, result: '剑成——原来是一柄「龙渊剑」！' }
  ]},
  { id: 'q25', name: '西域商路', steps: [
    { id: 'q25_1', desc: '西域商队要打通去极乐楼的商路，请你探路。', targetRegion: 'kaiyang', reward: { gold: 200, exp: 180 }, result: '你探明路线。' },
    { id: 'q25_2', desc: '把路线图带回西域。', targetRegion: 'xiyu', reward: { gold: 230, exp: 210 }, result: '商队如获至宝。' }
  ]},
  { id: 'q26', name: '极乐楼传闻', steps: [
    { id: 'q26_1', desc: '极乐楼要送一封信去青丘。', targetRegion: 'qingqiu', reward: { gold: 210, exp: 190 }, result: '信送到。' },
    { id: 'q26_2', desc: '青丘的回礼带回极乐楼。', targetRegion: 'kaiyang', reward: { gold: 240, exp: 220, talent: 1 }, result: '回礼带到（+1 天赋点）。' }
  ]},
  { id: 'q27', name: '青丘狐影', steps: [
    { id: 'q27_1', desc: '青丘狐仙托你去雪山派取一物。', targetRegion: 'xueshanpai', reward: { gold: 220, exp: 200 }, result: '你取回了那物。' },
    { id: 'q27_2', desc: '把物什送回青丘。', targetRegion: 'qingqiu', reward: { gold: 250, exp: 230 }, result: '狐仙嫣然一笑。' }
  ]},
  { id: 'q28', name: '雪山采莲', steps: [
    { id: 'q28_1', desc: '雪山派托你去采一株雪莲。', targetRegion: 'xueshanpai', reward: { gold: 230, exp: 210 }, result: '你采到雪莲。' },
    { id: 'q28_2', desc: '雪莲要送到万兽山庄入药。', targetRegion: 'wanshou', reward: { gold: 260, exp: 240, talent: 1 }, result: '药成，庄主赠你心得（+1 天赋点）。' }
  ]},
  { id: 'q29', name: '万兽驯化', steps: [
    { id: 'q29_1', desc: '万兽山庄要送一头灵兽去魔教总坛。', targetRegion: 'mojiao_zongtan', reward: { gold: 240, exp: 220 }, result: '灵兽送到。' },
    { id: 'q29_2', desc: '魔教的回礼带回万兽山庄。', targetRegion: 'wanshou', reward: { gold: 270, exp: 250 }, result: '回礼带到。' }
  ]},
  { id: 'q30', name: '魔教边境', steps: [
    { id: 'q30_1', desc: '魔教总坛要探剑冢的虚实。', targetRegion: 'jianzhong', reward: { gold: 250, exp: 230 }, result: '你探得虚实。' },
    { id: 'q30_2', desc: '把情报带回魔教。', targetRegion: 'mojiao_zongtan', reward: { gold: 280, exp: 260, talent: 1 }, result: '魔教教主甚喜（+1 天赋点）。' }
  ]},
  { id: 'q31', name: '失窃的剑谱', steps: [
    { id: 'q31_1', desc: '藏剑山庄的剑谱被盗，线索指向唐家堡。', targetRegion: 'tangjiawu', reward: { gold: 120, exp: 100 }, result: '你寻回半卷剑谱。' },
    { id: 'q31_2', desc: '另外半卷流落到苗疆。', targetRegion: 'miaoling', reward: { gold: 180, exp: 160 }, result: '你在蛊师手中夺回。' },
    { id: 'q31_3', desc: '去西域大漠印证剑法。', targetRegion: 'xiyu', reward: { tech: 'huashan_jian', gold: 250, exp: 220 }, result: '你悟透剑法，习得华山剑法！' }
  ]},
  { id: 'q32', name: '商队护送', steps: [
    { id: 'q32_1', desc: '商队要运货去西域，招募护卫。', targetRegion: 'xiyu', reward: { gold: 150, exp: 120 }, result: '你护送到西域。' },
    { id: 'q32_2', desc: '商队要继续去青丘贩皮毛。', targetRegion: 'qingqiu', reward: { gold: 210, exp: 180 }, result: '你护送穿过青丘。' },
    { id: 'q32_3', desc: '最后去魔教总坛交界探明虚实。', targetRegion: 'mojiao_zongtan', reward: { gold: 300, exp: 280, armor: true }, result: '商队东家赠你一件护甲！' }
  ]},
  { id: 'q33', name: '血刀讨债', steps: [
    { id: 'q33_1', desc: '血刀门要讨一笔旧债，去西域。', targetRegion: 'xiyu', reward: { gold: 180, exp: 160 }, result: '你讨回一部分。' },
    { id: 'q33_2', desc: '债主躲进了极乐楼。', targetRegion: 'kaiyang', reward: { gold: 220, exp: 200 }, result: '你逼出债主。' },
    { id: 'q33_3', desc: '债主逃往青丘，追上去。', targetRegion: 'qingqiu', reward: { gold: 260, exp: 240 }, result: '你追回欠款。' },
    { id: 'q33_4', desc: '把欠款带回血刀门。', targetRegion: 'xuedaomen', reward: { gold: 320, exp: 300, tech: 'xuemo' }, result: '门主大喜，传你血魔功！' }
  ]},
  { id: 'q34', name: '药王谷秘方', steps: [
    { id: 'q34_1', desc: '药王谷要一味苗疆蛊草。', targetRegion: 'miaoling', reward: { gold: 200, exp: 180 }, result: '你采到蛊草。' },
    { id: 'q34_2', desc: '再取一味雪山雪莲。', targetRegion: 'xueshanpai', reward: { gold: 240, exp: 220 }, result: '雪莲到手。' },
    { id: 'q34_3', desc: '药成之后带回药王谷。', targetRegion: 'yaowanggu', reward: { gold: 300, exp: 280, talent: 2 }, result: '药王谷赠你秘方心得（+2 天赋点）。' }
  ]},
  { id: 'q35', name: '藏剑山庄铸剑', steps: [
    { id: 'q35_1', desc: '藏剑山庄要铸剑，缺唐门的铁矿。', targetRegion: 'tangjiawu', reward: { gold: 160, exp: 140 }, result: '铁矿运到。' },
    { id: 'q35_2', desc: '再取血刀门的血淬火。', targetRegion: 'xuedaomen', reward: { gold: 210, exp: 190 }, result: '血淬完成。' },
    { id: 'q35_3', desc: '最后借魔教的魔火开刃。', targetRegion: 'mojiao_zongtan', reward: { gold: 260, exp: 240 }, result: '魔火开刃成功。' },
    { id: 'q35_4', desc: '把铸成的剑带回藏剑山庄。', targetRegion: 'cangjian', reward: { gold: 330, exp: 310, weapon: 'xueshan' }, result: '剑成——庄主赠你「雪魄刀」！' }
  ]},
  { id: 'q36', name: '苗疆护送', steps: [
    { id: 'q36_1', desc: '苗疆要护送一位蛊师去西域。', targetRegion: 'xiyu', reward: { gold: 200, exp: 180 }, result: '你护送抵达。' },
    { id: 'q36_2', desc: '蛊师要继续去青丘。', targetRegion: 'qingqiu', reward: { gold: 240, exp: 220 }, result: '一路平安。' },
    { id: 'q36_3', desc: '把蛊师安全送回苗疆。', targetRegion: 'miaoling', reward: { gold: 300, exp: 280, talent: 2 }, result: '蛊师传你一手蛊术心得（+2 天赋点）。' }
  ]},
  { id: 'q37', name: '剑冢祭剑', steps: [
    { id: 'q37_1', desc: '剑冢守剑人托你去昆仑墟取一捧玄冰。', targetRegion: 'kunlun', reward: { gold: 260, exp: 240 }, result: '玄冰取回。' },
    { id: 'q37_2', desc: '把玄冰送回剑冢。', targetRegion: 'jianzhong', reward: { gold: 290, exp: 270, talent: 1 }, result: '守剑人赠你剑意心得（+1 天赋点）。' }
  ]},
  { id: 'q38', name: '昆仑求仙', steps: [
    { id: 'q38_1', desc: '昆仑散仙托你去华山论剑台送一封战帖。', targetRegion: 'huashan', reward: { gold: 270, exp: 250 }, result: '战帖送到。' },
    { id: 'q38_2', desc: '把华山的回帖带回昆仑。', targetRegion: 'kunlun', reward: { gold: 300, exp: 280, talent: 1 }, result: '回帖带到（+1 天赋点）。' }
  ]},
  { id: 'q39', name: '华山论剑', steps: [
    { id: 'q39_1', desc: '华山要请星宿海的高手来论剑，去传话。', targetRegion: 'xingsuhai', reward: { gold: 280, exp: 260 }, result: '话传到。' },
    { id: 'q39_2', desc: '把星宿海的答复带回华山。', targetRegion: 'huashan', reward: { gold: 310, exp: 290 }, result: '答复带到。' }
  ]},
  { id: 'q40', name: '星宿海观星', steps: [
    { id: 'q40_1', desc: '星宿门托你去天池取一瓢灵水。', targetRegion: 'tianchi', reward: { gold: 290, exp: 270 }, result: '灵水取回。' },
    { id: 'q40_2', desc: '把灵水送回星宿海。', targetRegion: 'xingsuhai', reward: { gold: 320, exp: 300, talent: 1 }, result: '星宿门赠你观星心得（+1 天赋点）。' }
  ]},
  { id: 'q41', name: '天池采药', steps: [
    { id: 'q41_1', desc: '天池水府托你去百花谷采一味花露。', targetRegion: 'baihuagu', reward: { gold: 300, exp: 280 }, result: '花露采到。' },
    { id: 'q41_2', desc: '把花露送回天池。', targetRegion: 'tianchi', reward: { gold: 330, exp: 310 }, result: '水府满意。' }
  ]},
  { id: 'q42', name: '百花酿', steps: [
    { id: 'q42_1', desc: '百花谷要酿百花酒，缺一味妖族禁地的奇花。', targetRegion: 'yaoyu', reward: { gold: 310, exp: 290 }, result: '奇花采到。' },
    { id: 'q42_2', desc: '把奇花带回百花谷。', targetRegion: 'baihuagu', reward: { gold: 340, exp: 320, talent: 1 }, result: '百花酿成（+1 天赋点）。' }
  ]},
  { id: 'q43', name: '妖族边境', steps: [
    { id: 'q43_1', desc: '妖族禁地要探修罗场的虚实。', targetRegion: 'xiuluochang', reward: { gold: 320, exp: 300 }, result: '你探得虚实。' },
    { id: 'q43_2', desc: '把情报带回妖族禁地。', targetRegion: 'yaoyu', reward: { gold: 350, exp: 330, talent: 1 }, result: '妖皇甚喜（+1 天赋点）。' }
  ]},
  { id: 'q44', name: '修罗试炼', steps: [
    { id: 'q44_1', desc: '剑圣居要考验弟子，请你护送一名剑客过修罗场。', targetRegion: 'xiuluochang', reward: { gold: 330, exp: 310 }, result: '你护送通过。' },
    { id: 'q44_2', desc: '把剑客送到剑圣居。', targetRegion: 'jianshengju', reward: { gold: 360, exp: 340, talent: 2 }, result: '剑圣亲自致谢（+2 天赋点）。' }
  ]},
  { id: 'q45', name: '无相残页', steps: [
    { id: 'q45_1', desc: '昆仑墟的散修请你寻回一页失落残卷。', targetRegion: 'kunlun', reward: { gold: 180, exp: 160 }, result: '你在雪峰寻回残页。' },
    { id: 'q45_2', desc: '去华山论剑台印证残卷。', targetRegion: 'huashan', reward: { gold: 240, exp: 220, talent: 2 }, result: '你见到似曾相识的剑痕。' },
    { id: 'q45_3', desc: '最后的线索指向妖族禁地。', targetRegion: 'yaoyu', reward: { gold: 360, exp: 340, talent: 3, tech: 'taiji' }, result: '你窥见「无相」一角——玄功大成！' }
  ]},
  { id: 'q46', name: '剑圣传信', steps: [
    { id: 'q46_1', desc: '剑圣要送一封信去东海龙宫。', targetRegion: 'donghai', reward: { gold: 340, exp: 320 }, result: '信送到。' },
    { id: 'q46_2', desc: '龙宫的回信带回剑圣居。', targetRegion: 'jianshengju', reward: { gold: 370, exp: 350, talent: 1 }, result: '回信带到（+1 天赋点）。' }
  ]},
  { id: 'q47', name: '星宿海追凶', steps: [
    { id: 'q47_1', desc: '星宿海有要犯逃往天池。', targetRegion: 'tianchi', reward: { gold: 300, exp: 280 }, result: '你追到天池。' },
    { id: 'q47_2', desc: '要犯又逃入修罗场。', targetRegion: 'xiuluochang', reward: { gold: 340, exp: 320 }, result: '你追入修罗场。' },
    { id: 'q47_3', desc: '将之擒拿，押回星宿海。', targetRegion: 'xingsuhai', reward: { gold: 380, exp: 360, talent: 2 }, result: '要犯归案（+2 天赋点）。' }
  ]},
  { id: 'q48', name: '剑冢寻剑', steps: [
    { id: 'q48_1', desc: '剑冢有一柄古剑失落在昆仑墟。', targetRegion: 'kunlun', reward: { gold: 260, exp: 240 }, result: '你在雪峰寻到剑。' },
    { id: 'q48_2', desc: '剑要送华山论剑台鉴定。', targetRegion: 'huashan', reward: { gold: 300, exp: 280 }, result: '剑鉴定为名剑。' },
    { id: 'q48_3', desc: '再送星宿海以星辉淬炼。', targetRegion: 'xingsuhai', reward: { gold: 340, exp: 320 }, result: '淬炼完成。' },
    { id: 'q48_4', desc: '把剑送回剑冢。', targetRegion: 'jianzhong', reward: { gold: 400, exp: 380, weapon: 'tianmen_jian' }, result: '守剑人赠你「斩天剑」！' }
  ]},
  { id: 'q49', name: '东海龙宫', steps: [
    { id: 'q49_1', desc: '龙宫要送一件信物去归墟。', targetRegion: 'guixu', reward: { gold: 350, exp: 330 }, result: '信物送到。' },
    { id: 'q49_2', desc: '归墟的回礼带回龙宫。', targetRegion: 'donghai', reward: { gold: 380, exp: 360, talent: 1 }, result: '回礼带到（+1 天赋点）。' }
  ]},
  { id: 'q50', name: '归墟寻宝', steps: [
    { id: 'q50_1', desc: '归墟有异宝现世，托你去天机阁占一卦。', targetRegion: 'tianji', reward: { gold: 360, exp: 340 }, result: '卦象已得。' },
    { id: 'q50_2', desc: '把卦象带回归墟。', targetRegion: 'guixu', reward: { gold: 390, exp: 370, talent: 1 }, result: '归墟水妖重谢（+1 天赋点）。' }
  ]},
  { id: 'q51', name: '天机阁传讯', steps: [
    { id: 'q51_1', desc: '天机阁要传讯给观星台。', targetRegion: 'guanxingtai', reward: { gold: 370, exp: 350 }, result: '讯息传到。' },
    { id: 'q51_2', desc: '观星台的回讯带回天机阁。', targetRegion: 'tianji', reward: { gold: 400, exp: 380, talent: 1 }, result: '回讯带到（+1 天赋点）。' }
  ]},
  { id: 'q52', name: '观星占卜', steps: [
    { id: 'q52_1', desc: '观星台要一件黄泉的物件来占卜。', targetRegion: 'huangquan', reward: { gold: 380, exp: 360 }, result: '物件取回。' },
    { id: 'q52_2', desc: '把物件送回观星台。', targetRegion: 'guanxingtai', reward: { gold: 410, exp: 390, talent: 1 }, result: '占卜有了结果（+1 天赋点）。' }
  ]},
  { id: 'q53', name: '黄泉引路', steps: [
    { id: 'q53_1', desc: '黄泉鬼域要送一位亡魂去无相寺超度。', targetRegion: 'wuxiangsi', reward: { gold: 390, exp: 370 }, result: '你引渡亡魂。' },
    { id: 'q53_2', desc: '把无相寺的凭证带回黄泉。', targetRegion: 'huangquan', reward: { gold: 420, exp: 400, talent: 1 }, result: '凭证带到（+1 天赋点）。' }
  ]},
  { id: 'q54', name: '无相寺参禅', steps: [
    { id: 'q54_1', desc: '无相寺要托你去魔域深渊取一物印证佛理。', targetRegion: 'mocheng', reward: { gold: 400, exp: 380 }, result: '你取回那物。' },
    { id: 'q54_2', desc: '把物什送回无相寺。', targetRegion: 'wuxiangsi', reward: { gold: 430, exp: 410, talent: 2 }, result: '寺僧参悟，赠你禅机（+2 天赋点）。' }
  ]},
  { id: 'q55', name: '魔域探查', steps: [
    { id: 'q55_1', desc: '魔域深渊要探破碎虚空的虚实。', targetRegion: 'posuixukong', reward: { gold: 410, exp: 390 }, result: '你探得虚实。' },
    { id: 'q55_2', desc: '把情报带回魔域。', targetRegion: 'mocheng', reward: { gold: 440, exp: 420, talent: 1 }, result: '魔尊甚喜（+1 天赋点）。' }
  ]},
  { id: 'q56', name: '破碎虚空', steps: [
    { id: 'q56_1', desc: '破碎虚空要送一物去天门。', targetRegion: 'tianmen', reward: { gold: 420, exp: 400 }, result: '物什送到。' },
    { id: 'q56_2', desc: '天门的回执带回破碎虚空。', targetRegion: 'posuixukong', reward: { gold: 450, exp: 430, talent: 2 }, result: '回执带到（+2 天赋点）。' }
  ]},
  { id: 'q57', name: '龙宫朝贡', steps: [
    { id: 'q57_1', desc: '龙宫要押送一批贡品去归墟。', targetRegion: 'guixu', reward: { gold: 360, exp: 340 }, result: '贡品送到。' },
    { id: 'q57_2', desc: '归墟要回礼给天机阁。', targetRegion: 'tianji', reward: { gold: 400, exp: 380 }, result: '回礼送到。' },
    { id: 'q57_3', desc: '天机阁的回执带回龙宫。', targetRegion: 'donghai', reward: { gold: 450, exp: 430, talent: 2 }, result: '回执带到（+2 天赋点）。' }
  ]},
  { id: 'q58', name: '天机阁寻卷', steps: [
    { id: 'q58_1', desc: '天机阁失了一卷天书，线索在观星台。', targetRegion: 'guanxingtai', reward: { gold: 380, exp: 360 }, result: '你寻回半卷。' },
    { id: 'q58_2', desc: '另外半卷流落到了无相寺。', targetRegion: 'wuxiangsi', reward: { gold: 420, exp: 400 }, result: '你在寺中寻回。' },
    { id: 'q58_3', desc: '天书合璧，带回天机阁。', targetRegion: 'tianji', reward: { gold: 480, exp: 460, talent: 3, tech: 'chunyang' }, result: '阁主大喜，传你纯阳无极功！' }
  ]},
  { id: 'q59', name: '黄泉还愿', steps: [
    { id: 'q59_1', desc: '黄泉有位亡魂未了心愿，请你带话去无相寺。', targetRegion: 'wuxiangsi', reward: { gold: 390, exp: 370 }, result: '你带去了话。' },
    { id: 'q59_2', desc: '无相寺要回一句偈语。', targetRegion: 'mocheng', reward: { gold: 430, exp: 410 }, result: '你在魔域参得偈语。' },
    { id: 'q59_3', desc: '把偈语带回黄泉，超度亡魂。', targetRegion: 'huangquan', reward: { gold: 490, exp: 470, talent: 3 }, result: '亡魂往生，你功德无量（+3 天赋点）。' }
  ]},
  { id: 'q60', name: '终局之约', steps: [
    { id: 'q60_1', desc: '魔域深渊要传一封信去破碎虚空。', targetRegion: 'posuixukong', reward: { gold: 420, exp: 400 }, result: '信送到。' },
    { id: 'q60_2', desc: '破碎虚空要回一份战书去天门。', targetRegion: 'tianmen', reward: { gold: 460, exp: 440 }, result: '战书送到。' },
    { id: 'q60_3', desc: '天门的答复要带回魔域。', targetRegion: 'mocheng', reward: { gold: 520, exp: 500, talent: 3, tech: 'tianmo' }, result: '魔尊惊觉天命，传你天魔解体大法！' }
  ]}
];

// ---------- 悬赏任务（可重复）：发任务的人与击杀目标随机替换 ----------
const BOUNTY_ISSUERS = ['王婶', '张大夫', '村长', '镖局掌柜', '县衙捕头', '客栈老板', '货商', '老猎户', '药铺老板', '说书人'];

// ---------- 江湖风云·动态限时事件 ----------
const WORLD_EVENTS = [
  { id: 'we1', name: '魔教入侵', desc: '魔教大军压境，正派岌岌可危！', boss: 'we_boss1', reward: { gold: 300, exp: 250, rep: 20 } },
  { id: 'we2', name: '宝物出世', desc: '天降异象，有宝物现世，群雄争夺！', boss: 'we_boss2', reward: { gold: 400, exp: 200, item: 'random' } },
  { id: 'we3', name: '门派危机', desc: '一处门派被围攻，危在旦夕！', boss: 'we_boss3', reward: { gold: 250, exp: 200, rep: 15, moral: 5 } },
  { id: 'we4', name: '武林大会', desc: '武林大会召开，群雄毕至！', boss: 'we_boss4', reward: { exp: 350, rep: 20, talent: 1 } },
  { id: 'we5', name: '妖祸', desc: '妖兽肆虐，百姓涂炭！', boss: 'we_boss5', reward: { gold: 280, exp: 240, rep: 15 } },
  { id: 'we6', name: '天降横财', desc: '一场暴雨冲出了前朝宝藏！', boss: 'we_boss6', reward: { gold: 500, exp: 150 } },
  { id: 'we7', name: '邪功出世', desc: '一部邪功流落江湖，引发血雨腥风！', boss: 'we_boss7', reward: { exp: 300, tech: 'xuemo', rep: 10 } },
  { id: 'we8', name: '侠客失踪', desc: '多位侠客离奇失踪，人心惶惶！', boss: 'we_boss8', reward: { gold: 260, exp: 220, rep: 15 } }
];

// ---------- 宿敌 ----------
const RIVAL_NAMES = ['冷面剑客·沈孤鸿', '狂刀·霍斩', '毒手·阎罗', '铁掌·石破天', '暗影·无命', '血衣·秦殇', '折柳·苏暮云', '裂空·韩啸'];
