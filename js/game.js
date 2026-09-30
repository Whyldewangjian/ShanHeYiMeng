// ============================================================
//  武侠文字游戏 · 引擎（game.js）
// ============================================================
(function () {
  'use strict';

  // ---------- 工具 ----------
  const $ = (id) => document.getElementById(id);
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const rndf = () => Math.random();
  const pick = (arr) => arr[rnd(0, arr.length - 1)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = Math.round;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- 查询 ----------
  const sectById = (id) => SECTS.find((s) => s.id === id);
  const techById = (id) => TECHS.find((t) => t.id === id);
  const enemyById = (id) => ENEMY_ARCHETYPES.find((e) => e.id === id);
  const regionById = (id) => REGIONS.find((r) => r.id === id);
  const regionScene = (id) => (REGION_SCENES[id]) || 'wild';
  const loverById = (id) => LOVERS.find((l) => l.id === id);
  const itemById = (id) => ITEMS.find((i) => i.id === id);
  const findTalentNode = (nid) => { for (const br of TALENT_BRANCHES) for (const n of br.nodes) if (n.id === nid) return n; return null; };
  const branchOf = (nid) => { for (const br of TALENT_BRANCHES) if (br.nodes.some((n) => n.id === nid)) return br; return null; };

  // ---------- 状态 ----------
  let S = null;

  const expNeed = (lv) => Math.floor(60 * Math.pow(lv, 1.55));
  const STAMINA_COST = 10;   // 每次探索消耗的体力
  function staminaMaxOf(p) { return 100 + (p.level - 1) * 2 + (p.realm || 0) * 20; }

  function newGame(name, element, weaponId) {
    const starter = makeWeapon(weaponId, 'hui');
    return {
      player: {
        name, element, activeElement: element, level: 1, exp: 0, expNext: expNeed(1),
        hp: 120, hpMax: 120, mp: 60, mpMax: 60,
        gold: 80, stats: {}, talentPoints: 3, talents: {}, realm: 0,
        morality: 0, reputation: 0, personality: { xia: 0, gang: 0, ming: 0, qing: 0 },
        sect: null, sectRank: 0, sectContribution: 0, sectTasksDone: 0, sectTurns: 0, sectElderOffered: false,
        equipped: { weapon: starter, head: null, body: null, hand: null, leg: null, foot: null },
        inventory: [{ id: 'jinchuang', qty: 3 }, { id: 'peiyuan', qty: 2 }, { id: 'jijirou', qty: 1 }],
        techniques: [{ id: 'tuji', level: 1 }],
        equippedTechs: ['tuji'],
        lover: null, revenge: [], flags: { story: 'a1_1' }, kills: 0, bosses: 0, reincarnations: 0,
        bountyDone: 0, everGold: 80, everOrange: false, rivalCooldown: 0,
        knownSets: [],
        weaponProf: {},
        redyan: {},
        clues: [],
        rank: 0,
        stamina: 100,
        innerBreath: 0,
      },
      location: { region: 'cun', loc: 'cunkou' },
      screen: 'explore', talentBranch: null, pendingEvent: null,
      combat: null, quest: null, bounty: null, worldEvent: null, rival: null, achievements: [], pendingWorldEvent: null, rivalFight: false, sectTask: null, weather: 'clear', shichen: 3, timeSteps: 0, day: 0, innDaily: {}, blackMarket: null, seenLore: [], mapQuest: null, mapQuestOffered: [], goals: [], goalQuota: 0, rumors: [], mysteryStatus: {}, chronicle: [], log: [], version: 2
    };
  }

  // ---------- 存档 ----------
  const SAVE_KEY = 'wuxia_save_v1';
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };
  const load = () => { try { const s = localStorage.getItem(SAVE_KEY); if (s) { S = JSON.parse(s); S.quest = S.quest || null; S.bounty = S.bounty || null; S.worldEvent = S.worldEvent || null; S.rival = S.rival || null; S.achievements = S.achievements || []; S.pendingWorldEvent = S.pendingWorldEvent || null; S.rivalFight = S.rivalFight || false; S.sectTask = S.sectTask || null; S.weather = S.weather || 'clear'; S.shichen = S.shichen || 0; S.timeSteps = S.timeSteps || 0; S.seenLore = S.seenLore || []; S.mapQuest = S.mapQuest || null; if (S.mapQuest && (!regionById(S.mapQuest.region) || regionById(S.mapQuest.region).hub)) S.mapQuest = null; S.mapQuestOffered = S.mapQuestOffered || []; S.goals = S.goals || []; S.goalQuota = S.goalQuota || 0; S.rumors = S.rumors || []; S.mysteryStatus = S.mysteryStatus || {}; S.chronicle = S.chronicle || []; S.day = S.day || 0; S.innDaily = S.innDaily || {}; S.blackMarket = S.blackMarket || null; if (S.rival && !S.rival.origin) S.rival.origin = '旧怨'; if (S.player) { S.player.activeElement = S.player.activeElement || S.player.element; S.player.morality = S.player.morality || 0; S.player.reputation = S.player.reputation || 0; S.player.personality = S.player.personality || { xia: 0, gang: 0, ming: 0, qing: 0 }; S.player.flags = S.player.flags || {}; if (!S.player.flags.story) S.player.flags.story = 'a1_1'; S.player.redyan = S.player.redyan || {}; S.player.bountyDone = S.player.bountyDone || 0; S.player.everGold = S.player.everGold || 0; S.player.everOrange = S.player.everOrange || false; S.player.rivalCooldown = S.player.rivalCooldown || 0; S.player.knownSets = S.player.knownSets || []; S.player.sectTasksDone = S.player.sectTasksDone || 0; S.player.sectTurns = S.player.sectTurns || 0; S.player.sectElderOffered = S.player.sectElderOffered || false; S.player.weaponProf = S.player.weaponProf || {}; S.player.clues = S.player.clues || []; S.player.ambientSeen = S.player.ambientSeen || {}; S.player.rank = S.player.rank || 0; S.player.stamina = clamp((typeof S.player.stamina === 'number') ? S.player.stamina : staminaMaxOf(S.player), 0, staminaMaxOf(S.player)); S.player.innerBreath = S.player.innerBreath || 0; S.player.equippedTechs = S.player.equippedTechs || []; if (!S.player.equippedTechs.length && S.player.techniques && S.player.techniques.length) S.player.equippedTechs = S.player.techniques.slice(0, 5).map((t) => t.id); if (S.player.lover) { const lo = S.player.lover; if (!S.player.redyan[lo.id]) S.player.redyan[lo.id] = { affection: lo.affection || 5, status: (lo.affection >= 60 ? 'redyan' : 'met'), gifts: lo.gifts || 0, dates: lo.dates || 0 }; } } } } catch (e) {} };
  const hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
  const wipeSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} };
  function changeMorality(d) { const p = S.player; if (!p) return; p.morality = clamp(p.morality + d, -100, 100); }
  function changeReputation(d) { const p = S.player; if (!p) return; p.reputation = clamp(p.reputation + d, -1999, 1999); }
  function changePersonality(o) { const p = S.player; if (!p || !o) return; for (const k in o) p.personality[k] = clamp((p.personality[k] || 0) + o[k], -100, 100); }

  // ---------- 属性计算 ----------
  function scaleMods(per, n) { const o = {}; for (const k in per) o[k] = per[k] * n; return o; }
  function addMods(t, s) { for (const k in s) t[k] = (t[k] || 0) + s[k]; }
  // 功法被动递减收益：第1级100%，之后每级按 0.85 衰减，总收益趋近上限（约 6.7 倍）
  const TECH_MAX_LEVEL = 15;
  function techPassive(per, level) {
    let coef = 0;
    for (let i = 0; i < level; i++) coef += Math.pow(0.85, i);
    const o = {};
    // 吸血不随功法等级成长，避免被功法等级放大到失衡
    for (const k in per) o[k] = (k === 'lifeSteal') ? per[k] : per[k] * coef;
    return o;
  }
  function techCultivateCost(level) { return round(Math.pow(level, 2) * 30); }

  function recalc() {
    const p = S.player, L = p.level;
    const base = {
      hpMax: 100 + L * 20 + Math.pow(L, 1.7), mpMax: 50 + L * 8,
      atk: 9 + L * 2.4, def: 4 + L * 1.1, spd: 10 + L * 0.7,
      crit: Math.min(0.6, 0.05 + L * 0.0007), critDmg: 1.5,
      dodge: Math.min(0.5, 0.03 + L * 0.0005),
      lifeSteal: 0, pierce: 0, thorn: 0, combo: 0,
      mpRegen: 0.04, hpRegen: 0.02, expBonus: 0, goldBonus: 0, dropBonus: 0
    };
    const m = {};
    if (p.sect) { const s = sectById(p.sect); if (s) { addMods(m, s.bonus); addMods(m, scaleMods(s.rankBonus, p.sectRank + 1)); } }
    else { addMods(m, rogueBonus(p)); }
    for (const nid in p.talents) { const n = findTalentNode(nid); if (n) addMods(m, scaleMods(n.per, p.talents[nid])); }
    p.equippedTechs = p.equippedTechs || [];
    for (const t of p.techniques) { if (!p.equippedTechs.includes(t.id)) continue; const tech = techById(t.id); if (tech && tech.passive) addMods(m, techPassive(tech.passive, t.level || 1)); }
    let flatAtk = 0, flatDef = 0, flatHp = 0;
    const w = p.equipped.weapon;
    if (w) { flatAtk += w.atk || 0; if (w.affixes) for (const a of w.affixes) { if (a.per) addMods(m, a.per); } if (w.bonus) addMods(m, w.bonus); const plv = weaponProfLevel(p, w.type); const pb = WEAPON_PROF_BONUS[w.type]; if (pb && plv.tier > 0) addMods(m, { [pb.stat]: pb.val[plv.tier] }); }
    // 防具五槽 + 套装
    const setCount = {};
    for (const slot of ['head', 'body', 'hand', 'leg', 'foot']) {
      const a = p.equipped[slot];
      if (a) { flatDef += a.def || 0; flatHp += a.hp || 0; if (a.bonus) addMods(m, a.bonus); if (a.affixes) for (const af of a.affixes) { if (af.per) addMods(m, af.per); } if (a.set) setCount[a.set] = (setCount[a.set] || 0) + 1; }
    }
    for (const setId in setCount) if (setCount[setId] >= 5) { const st = SETS.find((x) => x.id === setId); if (st) addMods(m, st.bonus); }
    // 红颜加成：收益递减（第 1 位 100%、第 2 位 70%、第 3 位 50%、之后更低）
    const REDYAN_DIMINISH = [1, 0.7, 0.5, 0.35, 0.25];
    let redyanIdx = 0;
    for (const id in p.redyan) { const r = p.redyan[id]; if (r && r.status === 'redyan') { const lv = loverById(id); if (lv) { const factor = REDYAN_DIMINISH[Math.min(redyanIdx, REDYAN_DIMINISH.length - 1)]; addMods(m, scaleMods(lv.bonus, factor)); redyanIdx++; } } }
    if (p.revenge && p.revenge.length) addMods(m, { atk: -0.02 * p.revenge.length, def: -0.02 * p.revenge.length });

    const realm = REALMS[p.realm] || REALMS[0];
    const s = {};
    s.hpMax = round((base.hpMax * (1 + (m.hp || 0)) + flatHp) * realm.statMult);
    s.mpMax = round(base.mpMax * (1 + (m.mp || 0))) + (p.innerBreath || 0);
    s.atk = round((base.atk * (1 + (m.atk || 0)) + flatAtk) * realm.statMult);
    s.def = round((base.def * (1 + (m.def || 0)) + flatDef) * realm.statMult);
    s.spd = round(base.spd * (1 + (m.spd || 0)));
    s.crit = clamp(base.crit + (m.crit || 0), 0, 0.7);
    s.critDmg = base.critDmg + (m.critDmg || 0);
    s.dodge = clamp(base.dodge + (m.dodge || 0), 0, 0.6);
    s.lifeSteal = Math.min(m.lifeSteal || 0, 0.50); s.pierce = m.pierce || 0; s.thorn = m.thorn || 0; s.combo = m.combo || 0;
    s.mpRegen = base.mpRegen + (m.mpRegen || 0); s.hpRegen = base.hpRegen + (m.hpRegen || 0);
    s.expBonus = m.expBonus || 0; s.goldBonus = m.goldBonus || 0; s.dropBonus = m.dropBonus || 0;
    s.element = p.activeElement || p.element || 'jin';
    p.stats = s; p.hpMax = s.hpMax; p.mpMax = s.mpMax;
    p.hp = clamp(p.hp, 1, s.hpMax); p.mp = clamp(p.mp, 0, s.mpMax);
  }

  // ---------- 武器 ----------
  function drawAffixes(q) {
    const count = q.affixes || 0;
    if (!count) return [];
    const out = [];
    const specialCount = q.tier >= 6 ? 2 : q.tier >= 4 ? 1 : 0;
    const sp = SPECIAL_AFFIXES.slice();
    for (let i = 0; i < specialCount; i++) { if (!sp.length) break; out.push(sp.splice(rnd(0, sp.length - 1), 1)[0]); }
    const pool = AFFIXES.slice();
    for (let i = out.length; i < count; i++) { if (!pool.length) break; out.push(pool.splice(rnd(0, pool.length - 1), 1)[0]); }
    return out;
  }
  function makeWeapon(typeId, qualityId) {
    const t = WEAPON_TYPES.find((w) => w.id === typeId);
    const q = QUALITIES.find((x) => x.id === qualityId);
    const atk = round(t.baseAtk * q.mult * (0.9 + rndf() * 0.2));
    const affixes = drawAffixes(q);
    const adjAffix = affixes.find((a) => a.adj);
    const name = (adjAffix ? adjAffix.adj + '的' : '') + pick(WEAPON_NAME_PREFIX) + pick(WEAPON_NAME_MID) + t.name;
    markGearQuality(qualityId);
    const w = { id: 'w_' + Date.now() + '_' + rnd(1, 99999), type: typeId, typeName: t.name, quality: qualityId, qualityName: q.name, qualityColor: q.color, qualityEmoji: q.emoji, name, atk, affixes, flat: t.flat || {} };
    ITEM_TIPS[w.name] = weaponTip(w);
    ITEM_COLORS[w.name] = w.qualityColor;
    return w;
  }
  function adjPrefixName(gear, baseName) {
    const adjAffix = (gear.affixes || []).find((a) => a.adj);
    return (adjAffix ? adjAffix.adj + '的' : '') + baseName;
  }
  function markGearQuality(q) { if (S && S.player && (q === 'cheng' || q === 'hong')) { if (!S.player.everOrange) recordChronicle('first_orange', '首获传说神兵'); S.player.everOrange = true; } }
  function randomQuality(level) {
    const L = level;
    const w = {
      hui: Math.max(0, 45 - L * 2.2),
      bai: Math.max(0, 40 - Math.abs(L - 14) * 2.0),
      lv: Math.max(0, 40 - Math.abs(L - 28) * 1.5),
      lan: Math.max(0, 38 - Math.abs(L - 44) * 1.2),
      zi: L >= 40 ? Math.max(3, 32 - Math.abs(L - 60) * 1.0) : 0,
      cheng: L >= 55 ? Math.max(1, 12 - Math.abs(L - 80) * 0.5) : 0
    };
    let others = 0;
    for (const k in w) if (k !== 'cheng') others += w[k];
    const maxCheng = others * 0.0526;
    if (w.cheng > maxCheng) w.cheng = maxCheng;
    let total = 0;
    for (const k in w) total += w[k];
    if (total <= 0) return 'zi';
    let roll = rndf() * total;
    for (const k in w) { roll -= w[k]; if (roll <= 0) return k; }
    return 'zi';
  }
  function randomNamedWeapon(level) {
    const pool = NAMED_WEAPONS.filter((w) => w.level <= level);
    if (!pool.length) return null;
    const maxLvl = Math.max.apply(null, pool.map((w) => w.level));
    const near = pool.filter((w) => w.level >= maxLvl - 12);
    return pick(near.length ? near : pool);
  }
  function randomWeapon(level) {
    // 30% 概率给固定名武器，其余走随机组合
    if (NAMED_WEAPONS.length && rndf() < 0.3) {
      const nw = randomNamedWeapon(level);
      if (nw) {
        const wp = makeWeapon(nw.type, nw.quality);
        wp.affixes = (nw.affix || []).map((a) => AFFIXES.find((x) => x.id === a) || SPECIAL_AFFIXES.find((x) => x.id === a)).filter(Boolean);
        wp.name = adjPrefixName(wp, nw.name);
        ITEM_TIPS[wp.name] = weaponTip(wp);
        ITEM_COLORS[wp.name] = wp.qualityColor;
        return wp;
      }
    }
    return makeWeapon(pick(WEAPON_TYPES).id, randomQuality(level));
  }
  function setForLevel(level) {
    const pool = SETS.filter((s) => s.level <= level);
    if (!pool.length) return SETS[0];
    const maxLvl = Math.max.apply(null, pool.map((s) => s.level));
    const near = pool.filter((s) => s.level >= maxLvl - 8);
    return pick(near.length ? near : pool);
  }
  function discoverSet(setId) {
    const p = S.player; if (!p || !setId) return;
    p.knownSets = p.knownSets || [];
    if (p.knownSets.includes(setId)) return;
    p.knownSets.push(setId);
    const st = SETS.find((s) => s.id === setId);
    if (st) {
      log('🏮 你发现了新套装【' + st.name + '】！', 'level');
      showNotice('🏮 发现新套装 · ' + st.name, [
        '集齐 5 件即可触发套装效果：' + st.desc,
        '继续在这片区域打怪 / 探索，可凑齐整套。'
      ], [{ text: '✔ 太好了', cls: 'primary' }]);
    }
  }
  function makeArmor(slotId, qualityId, setId) {
    const q = QUALITIES.find((x) => x.id === qualityId) || QUALITIES[0];
    const slot = ARMOR_SLOTS.find((s) => s.id === slotId);
    const def = round(4 * q.mult * (0.9 + rndf() * 0.2));
    const hp = round(18 * q.mult * (0.9 + rndf() * 0.2));
    const set = setId || pick(SETS).id;
    const st = SETS.find((x) => x.id === set) || { name: '', base: '' };
    const setName = st.name;
    const affixes = drawAffixes(q);
    const adjAffix = affixes.find((a) => a.adj);
    const name = (adjAffix ? adjAffix.adj + '的' : '') + (st.base || st.name) + slot.name;
    markGearQuality(qualityId);
    const a = { id: 'a_' + Date.now() + '_' + rnd(1, 99999), slot: slotId, slotName: slot.name, quality: qualityId, qualityName: q.name, qualityColor: q.color, qualityEmoji: q.emoji, name, def, hp, set, setName, affixes };
    ITEM_TIPS[a.name] = armorTip(a);
    ITEM_COLORS[a.name] = a.qualityColor;
    return a;
  }
  function randomArmor(level) {
    const set = setForLevel(level);
    return makeArmor(pick(ARMOR_SLOTS).id, randomQuality(level), set.id);
  }
  function makeArtifact(id) {
    const art = ARTIFACTS.find((x) => x.id === id);
    if (!art) return null;
    const q = QUALITIES.find((x) => x.id === 'hong');
    if (art.type === 'weapon') {
      const t = WEAPON_TYPES.find((w) => w.id === art.weaponType);
      const w = { weapon: { id: 'art_' + art.id, type: art.weaponType, typeName: t.name, quality: 'hong', qualityName: q.name, qualityColor: q.color, name: art.name, atk: round(t.baseAtk * q.mult), affixes: [], flat: t.flat || {}, bonus: art.bonus, lore: art.lore } };
      ITEM_TIPS[w.weapon.name] = weaponTip(w.weapon);
      ITEM_COLORS[w.weapon.name] = w.weapon.qualityColor;
      return w;
    }
    const slot = ARMOR_SLOTS.find((s) => s.id === art.slot);
    const a = { armor: { id: 'art_' + art.id, slot: art.slot, slotName: slot.name, quality: 'hong', qualityName: q.name, qualityColor: q.color, name: art.name, def: round(4 * q.mult), hp: round(18 * q.mult), set: null, setName: null, bonus: art.bonus, lore: art.lore } };
    ITEM_TIPS[a.armor.name] = armorTip(a.armor);
    ITEM_COLORS[a.armor.name] = a.armor.qualityColor;
    return a;
  }

  // ---------- 敌人 ----------
  function makeEnemy(archId, level) {
    const a = enemyById(archId);
    const sc = 1 + a.scale * (level - 1);
    const e = {
      id: a.id, name: a.name, tier: a.tier, element: a.element, desc: a.desc, drop: a.drop, level: level,
      hp: round(a.base.hp * sc), hpMax: round(a.base.hp * sc),
      atk: round(a.base.atk * sc), def: round(a.base.def * sc), spd: round(a.base.spd * sc),
      crit: 0.05, critDmg: 1.5, dodge: 0.02 + level * 0.0003,
      gold: a.gold, exp: round(a.exp * (1 + level * 0.08)), statuses: []
    };
    if (a.tier === 'boss') { e.crit = 0.1; e.critDmg = 1.8; e.dodge += 0.05; }
    if (a.tier === 'elite') { e.crit = 0.08; e.critDmg = 1.6; }
    return e;
  }
  function spawnRandomEnemy() {
    const region = regionById(S.location.region);
    const level = Math.max(1, region.level + rnd(-2, 3));
    return makeEnemy(pick(region.enemies), level);
  }
  function spawnBoss(bossId) {
    const region = regionById(S.location.region);
    return makeEnemy(bossId, region.level);
  }

  // ---------- 五行克制 ----------
  function elementMult(a, d) {
    if (!a || !d) return 1;
    if (ELEMENTS[a] && ELEMENTS[a].beats === d) return 1.5;
    if (ELEMENTS[d] && ELEMENTS[d].beats === a) return 0.7;
    return 1;
  }
  const ELEMENT_ORDER = ['jin', 'mu', 'shui', 'huo', 'tu'];
  function cycleElement() {
    const p = S.player;
    let i = ELEMENT_ORDER.indexOf(p.activeElement || p.element || 'jin');
    p.activeElement = ELEMENT_ORDER[(i + 1) % ELEMENT_ORDER.length];
    log('你运转内息，本命五行切换为「' + elementName(p.activeElement) + '」。', 'level');
    recalc();
    renderHUD();
  }

  // ---------- 功法类型 → 所需武器（空手/内功/身法等无需武器） ----------
  const TECH_TYPE_WEAPON = { '剑法': 'sword', '刀法': 'dao', '枪法': 'qiang', '棍法': 'gun', '棒法': 'gun', '暗器': 'hidden', '扇法': 'fan', '弓术': 'bow', '鞭法': 'whip' };
  const weaponTypeName = (id) => { const w = WEAPON_TYPES.find((x) => x.id === id); return w ? w.name : id; };

  // ---------- 武器熟练度（3 级：初窥门径 → 融会贯通 → 出神入化，每种武器专属加成） ----------
  const PROF_LEVELS = [
    { name: '初窥门径', need: 0 },
    { name: '融会贯通', need: 60 },
    { name: '出神入化', need: 240 }
  ];
  const WEAPON_PROF_BONUS = {
    sword: { stat: 'crit', label: '暴击', val: [0, 0.03, 0.08] },
    dao: { stat: 'critDmg', label: '暴伤', val: [0, 0.10, 0.25] },
    qiang: { stat: 'pierce', label: '破甲', val: [0, 0.05, 0.12] },
    gun: { stat: 'hp', label: '气血', val: [0, 0.05, 0.12] },
    dagger: { stat: 'crit', label: '暴击', val: [0, 0.03, 0.08] },
    hidden: { stat: 'critDmg', label: '暴伤', val: [0, 0.10, 0.25] },
    fist: { stat: 'atk', label: '攻击', val: [0, 0.06, 0.15] },
    whip: { stat: 'dodge', label: '闪避', val: [0, 0.03, 0.08] },
    fan: { stat: 'def', label: '防御', val: [0, 0.05, 0.12] },
    bow: { stat: 'crit', label: '暴击', val: [0, 0.03, 0.08] }
  };
  function weaponProfLevel(p, type) {
    const exp = (p.weaponProf && p.weaponProf[type]) || 0;
    let tier = 0;
    for (let i = 0; i < PROF_LEVELS.length; i++) if (exp >= PROF_LEVELS[i].need) tier = i;
    return { tier, name: PROF_LEVELS[tier].name };
  }
  function weaponProfBonusText(type) {
    const pb = WEAPON_PROF_BONUS[type];
    if (!pb) return '';
    return pb.label + ' +' + (pb.val[1] * 100).toFixed(0) + '% / +' + (pb.val[2] * 100).toFixed(0) + '%';
  }
  function gainWeaponProf(type, amount) {
    const p = S.player;
    if (!p || !type) return;
    p.weaponProf = p.weaponProf || {};
    const before = weaponProfLevel(p, type);
    p.weaponProf[type] = (p.weaponProf[type] || 0) + amount;
    const after = weaponProfLevel(p, type);
    if (after.name !== before.name) log('⚔ 你的「' + weaponTypeName(type) + '」熟练度提升至【' + after.name + '】！', 'level');
  }

  // ---------- 称号系统（按声望/善恶/境界/性格/击杀/收集/熟练度综合判定） ----------
  const TITLES = [
    { name: '无名之辈', cond: () => true },
    { name: '小有名气', cond: (p) => p.reputation >= 100 },
    { name: '后起之秀', cond: (p) => p.level >= 30 },
    { name: '名动一方', cond: (p) => p.reputation >= 400 },
    { name: '路见不平', cond: (p) => p.personality.xia >= 40 },
    { name: '至情至性', cond: (p) => p.personality.qing >= 40 },
    { name: '明察秋毫', cond: (p) => p.personality.ming >= 40 },
    { name: '刚猛无俦', cond: (p) => p.personality.gang >= 40 },
    { name: '百人斩', cond: (p) => p.kills >= 100 },
    { name: '斩妖除魔', cond: (p) => p.bosses >= 1 },
    { name: '威震江湖', cond: (p) => p.reputation >= 600 },
    { name: '富甲一方', cond: (p) => (p.everGold || 0) >= 10000 },
    { name: '红颜环绕', cond: (p) => Object.values(p.redyan || {}).length >= 5 },
    { name: '侠肝义胆', cond: (p) => p.morality >= 30 && p.personality.xia >= 40 },
    { name: '血手人屠', cond: (p) => p.morality <= -30 && p.kills >= 300 },
    { name: '聚气凝神', cond: (p) => p.realm >= 3 },
    { name: '先天高手', cond: (p) => p.realm >= 6 },
    { name: '千人斩', cond: (p) => p.kills >= 1000 },
    { name: '降龙伏虎', cond: (p) => p.bosses >= 10 },
    { name: '神兵在手', cond: (p) => p.everOrange },
    { name: '破妄归真', cond: (p) => p.flags.clueFinale },
    { name: '一代宗师', cond: (p) => p.reputation >= 1000 },
    { name: '侠之大者', cond: (p) => p.morality >= 50 && p.reputation >= 500 },
    { name: '魔焰滔天', cond: (p) => p.morality <= -50 && p.reputation <= -500 },
    { name: '剑心通明', cond: (p) => (p.weaponProf && p.weaponProf.sword >= 240) },
    { name: '刀出无悔', cond: (p) => (p.weaponProf && p.weaponProf.dao >= 240) },
    { name: '枪出如龙', cond: (p) => (p.weaponProf && p.weaponProf.qiang >= 240) },
    { name: '棍扫千军', cond: (p) => (p.weaponProf && p.weaponProf.gun >= 240) },
    { name: '暗夜幽灵', cond: (p) => (p.weaponProf && (p.weaponProf.dagger >= 240 || p.weaponProf.hidden >= 240)) },
    { name: '拳镇山河', cond: (p) => (p.weaponProf && p.weaponProf.fist >= 240) },
    { name: '红颜知己满堂', cond: (p) => Object.values(p.redyan || {}).filter((r) => r && r.status === 'redyan').length >= 5 },
    { name: '富可敌国', cond: (p) => (p.everGold || 0) >= 100000 },
    { name: '宗师气象', cond: (p) => p.realm >= 9 },
    { name: '天人合一', cond: (p) => p.realm >= 12 },
    { name: '亦正亦邪', cond: (p) => Math.abs(p.morality) < 20 && p.personality.gang >= 40 },
    { name: '闲云野鹤', cond: (p) => Math.abs(p.morality) < 20 && p.personality.qing >= 40 && p.realm >= 6 },
    { name: '破碎虚空', cond: (p) => p.realm >= REALMS.length - 1 },
    { name: '万人屠', cond: (p) => p.kills >= 10000 },
    { name: '江湖传说', cond: (p) => p.reputation >= 1800 && p.level >= 80 }
  ];
  function earnedTitles(p) { return TITLES.filter((t) => t.cond(p)).map((t) => t.name); }
  function rogueIndex(p) { return Math.min(ROGUE_TITLES.length - 1, Math.floor((p.realm || 0) / 3)); }
  function rogueTitle(p) { return ROGUE_TITLES[rogueIndex(p)].name; }
  function rogueBonus(p) { return ROGUE_TITLES[rogueIndex(p)].bonus; }
  function roguePerkText(p) { return bonusText(rogueBonus(p)) + ' · 奇遇率提升'; }
  function playerTitle(p) { if (!p.sect) return rogueTitle(p); const list = earnedTitles(p); return list.length ? list[list.length - 1] : '无名之辈'; }

  // ---------- 文案演出 ----------
  const TYPE_FLAVOR = {
    '剑法': ['剑光一闪，如雪如虹', '一剑刺出，直取要害', '剑走轻灵，寒芒点点'],
    '刀法': ['刀光一闪，快如闪电', '一刀劈出，势若奔雷', '刀势如风，横扫千军'],
    '枪法': ['枪出如龙，寒星点点', '长枪一抖，直捣黄龙', '枪影重重，寒光闪烁'],
    '棍法': ['棍扫千军，风声呼啸', '一棍砸下，山岳震动', '棍影翻飞，虎虎生风'],
    '棒法': ['棒影翻飞，破空有声', '一棒横扫，虎虎生风'],
    '掌法': ['掌风如涛，排山倒海', '一掌拍出，劲风扑面', '掌力浑厚，直透脏腑'],
    '拳法': ['拳出如龙，劲风扑面', '拳影重重，势大力沉', '一拳轰出，石破天惊'],
    '暗器': ['暗器破空，悄无声息', '寒芒一点，例不虚发'],
    '鞭法': ['长鞭一抖，如灵蛇出洞', '鞭影如网，缠敌制胜'],
    '扇法': ['折扇一开，寒光乍现', '铁扇翻飞，攻守兼备'],
    '弓术': ['弓弦一响，箭如流星', '弯弓搭箭，一矢破空'],
    '腿法': ['腿影连环，快如旋风', '一脚踢出，势大力沉'],
    '指法': ['一指点出，隔空取命', '指风凛冽，直透穴道'],
    '内功': ['气贯长虹，直取要害', '内力鼓荡，劲气如涛', '真气流转，掌风如岳'],
    '身法': ['身形一晃，欺身而上', '步法飘忽，鬼魅难测']
  };
  const GENERIC_FLAVOR = ['气贯长虹，直取要害', '运劲如风，攻其不备', '长驱直入，势若奔雷', '身形一晃，欺身而上'];
  const WEAPON_FLAVOR_KEY = { sword: '剑法', dao: '刀法', qiang: '枪法', gun: '棍法', dagger: '剑法', hidden: '暗器', fist: '拳法', whip: '鞭法', fan: '扇法', bow: '弓术' };
  function flavorFor(type) { const f = TYPE_FLAVOR[type]; return (f && f.length) ? pick(f) : pick(GENERIC_FLAVOR); }
  const ENEMY_FLAVOR = ['凶相毕露，猛扑过来', '怒吼一声，全力一击', '目露凶光，欺身而上', '蓄势待发，突施冷箭', '身形暴起，直取咽喉', '翻掌拍出，劲风呼啸'];

  // ---------- 日志 / UI ----------
  let cardStack = [];
  const CARD_TAG = { combat: '⚔ 战斗', loot: '💎 收获', quest: '📜 任务', event: '✨ 奇遇', story: '🏯 剧情', up: '🎉 突破', sys: '⚙ 系统' };
  function logCard(type, title) {
    const el = $('log'); if (!el) return null;
    const card = document.createElement('div');
    card.className = 'log-card card-' + type;
    const tag = document.createElement('div');
    tag.className = 'card-tag';
    tag.textContent = CARD_TAG[type] || type;
    card.appendChild(tag);
    if (title) { const t = document.createElement('div'); t.className = 'card-title'; t.textContent = title; card.appendChild(t); }
    const body = document.createElement('div');
    body.className = 'card-body';
    card.appendChild(body);
    const settle = document.createElement('div');
    settle.className = 'card-settle';
    settle.style.display = 'none';
    const settleLabel = document.createElement('div');
    settleLabel.className = 'card-settle-label';
    settleLabel.textContent = '— 结算 —';
    settle.appendChild(settleLabel);
    card.appendChild(settle);
    el.appendChild(card);
    cardStack.push({ body, settle });
    el.scrollTop = el.scrollHeight;
    return card;
  }
  function closeCard() { if (cardStack.length) cardStack.pop(); }
  function appendLog(t, cls, html) {
    if (!S) return null;
    S.log.push({ t: t, c: cls || '', html: !!html });
    if (S.log.length > 400) S.log = S.log.slice(-400);
    const el = $('log'); if (!el) return null;
    const d = document.createElement('div');
    d.className = 'log-line ' + (cls || '');
    if (html) d.innerHTML = t; else d.innerHTML = linkifyItems(t);
    const top = cardStack.length ? cardStack[cardStack.length - 1] : null;
    const target = top ? top.body : el;
    target.appendChild(d);
    el.scrollTop = el.scrollHeight;
    return d;
  }
  function settle(msg, cls) {
    if (!cardStack.length) { log(msg, cls); return; }
    const s = cardStack[cardStack.length - 1].settle;
    s.style.display = '';
    const d = document.createElement('div');
    d.className = 'log-line settle-line ' + (cls || '');
    d.innerHTML = linkifyItems(msg);
    s.appendChild(d);
    const el = $('log'); if (el) el.scrollTop = el.scrollHeight;
  }
  function log(msg, cls) { appendLog(msg, cls, false); }
  function logHTML(html, cls) { appendLog(html, cls, true); }
  function logHover(html, cls, tipHtml) {
    const d = appendLog(html, cls, true);
    if (d && tipHtml) {
      d.classList.add('hoverable');
      d.addEventListener('mouseenter', (ev) => showTooltip(tipHtml, ev));
      d.addEventListener('mouseleave', hideTooltip);
      d.addEventListener('mousemove', (ev) => positionTooltip(ev));
    }
  }
  function qName(it) { return '<span style="color:' + (it.qualityColor || '#e8dcc4') + ';">' + esc(it.name) + '</span>'; }
  function showTooltip(html, ev) {
    const t = $('tooltip'); if (!t) return;
    t.innerHTML = html; t.style.display = 'block';
    positionTooltip(ev);
  }
  function positionTooltip(ev) {
    const t = $('tooltip'); if (!t) return;
    t.style.left = '0px'; t.style.top = '0px';
    const r = t.getBoundingClientRect();
    let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - 10;
    if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - 10;
    t.style.left = Math.max(4, x) + 'px';
    t.style.top = Math.max(4, y) + 'px';
  }
  function hideTooltip() { const t = $('tooltip'); if (t) t.style.display = 'none'; }
  // —— 物品名悬停浮窗：注册表 + 文本内自动加链接 ——
  const ITEM_TIPS = {};
  const ITEM_COLORS = {};   // 物品名 → 品质颜色（用于日志内按品质上色）
  function buildItemTips() { for (const it of ITEMS) ITEM_TIPS[it.name] = itemTip(it); }
  function linkifyItems(text) {
    return esc(text).replace(/【([^】]+)】/g, (m, name) => {
      if (ITEM_TIPS[name] == null) return m;
      const _c = ITEM_COLORS[name];
      return '【<span class="hl-item" data-name="' + name + '"' + (_c ? ' style="color:' + _c + ';"' : '') + '>' + name + '</span>】';
    });
  }
  function qualityDetail(q) {
    if (!q) return '';
    if (q.tier >= 6) return '✦ 神器 · 独一无二，蕴含天道因果。';
    if (q.tier >= 4) return '✦ 稀有之物，来历不凡。';
    if (q.tier >= 2) return '✦ 上乘之作，非同凡品。';
    return '· 寻常之物。';
  }
  function weaponTip(w) {
    const q = QUALITIES.find((x) => x.id === w.quality);
    let h = '<div class="tip-title" style="color:' + (w.qualityColor || '#e8dcc4') + ';">' + esc(w.name) + '</div>';
    h += '<div class="tip-line">' + (w.qualityName || '') + ' · ' + (w.typeName || '') + '</div>';
    const _fx = affixEffects(w);
    h += '<div class="tip-line">攻击 +' + w.atk + (_fx.length ? ' · ' + _fx.join(' · ') : '') + '</div>';
    if (w.lore) h += '<div class="tip-detail">' + esc(w.lore) + '</div>';
    if (q && q.tier >= 2) h += '<div class="tip-detail">' + qualityDetail(q) + '</div>';
    return h;
  }
  function armorTip(a) {
    const q = QUALITIES.find((x) => x.id === a.quality);
    let h = '<div class="tip-title" style="color:' + (a.qualityColor || '#e8dcc4') + ';">' + esc(a.name) + '</div>';
    h += '<div class="tip-line">' + (a.qualityName || '') + ' · ' + (a.slotName || '') + '</div>';
    const _fx = affixEffects(a);
    h += '<div class="tip-line">防御 +' + a.def + ' · 气血 +' + a.hp + (_fx.length ? ' · ' + _fx.join(' · ') : '') + '</div>';
    if (a.setName) {
      h += '<div class="tip-line">套装：' + a.setName + '</div>';
      const st = SETS.find((x) => x.id === a.set);
      if (st && st.desc) h += '<div class="tip-line">套装效果：' + st.desc + '</div>';
    }
    if (a.lore) h += '<div class="tip-detail">' + esc(a.lore) + '</div>';
    if (q && q.tier >= 2) h += '<div class="tip-detail">' + qualityDetail(q) + '</div>';
    return h;
  }
  function itemTip(it) {
    let typeName = '物品', effectText = '';
    if (it.type === 'hp') { typeName = '回血'; effectText = '效果：气血 ' + (it.value > 0 ? '+' : '') + it.value; }
    else if (it.type === 'mp') { typeName = '回内'; effectText = '效果：内力 ' + (it.value > 0 ? '+' : '') + it.value; }
    else if (it.type === 'cure') { typeName = '丹药'; effectText = '效果：解除中毒等负面状态'; }
    else if (it.type === 'gift') { typeName = '礼物'; effectText = '效果：赠予红颜，提升好感'; }
    let h = '<div class="tip-title">' + esc(it.name) + '</div>';
    h += '<div class="tip-line">' + typeName + ' · 单价 ' + it.price + ' 两</div>';
    if (effectText) h += '<div class="tip-line">' + effectText + '</div>';
    if (it.desc) h += '<div class="tip-detail">' + esc(it.desc) + '</div>';
    return h;
  }

  function setActions(btns) {
    const el = $('actions'); if (!el) return;
    el.innerHTML = '';
    btns.forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'act ' + (b.cls || '');
      const _pl = pixLabel(b.label);
      btn.innerHTML = (_pl.icon ? _pl.icon + ' ' : '') + esc(_pl.text);
      if (b.disabled) btn.disabled = true;
      if (b.hint) btn.title = b.hint;
      if (b.tip) {
        btn.addEventListener('mouseenter', (ev) => showTooltip(b.tip, ev));
        btn.addEventListener('mouseleave', hideTooltip);
        btn.addEventListener('mousemove', (ev) => positionTooltip(ev));
      }
      btn.addEventListener('click', b.fn);
      el.appendChild(btn);
    });
  }

  function renderHUD() {
    const p = S.player; const hud = $('hud'); if (!hud) return;
    const _sect = p.sect ? sectById(p.sect) : null;
    const sectLabel = _sect ? (_sect.name + '·' + _sect.ranks[p.sectRank || 0]) : '散修';
    const w = weatherInfo();
    const sc = shichenInfo();
    const _stm = staminaMaxOf(p);
    hud.innerHTML =
      '<div class="hud-main" title="查看人物状态"><div class="hud-name">' + esc(p.name) + '<span class="hud-lv">Lv.' + p.level + ' · ' + elementName(p.activeElement || p.element) + '</span></div>' +
      '<div class="hud-sub"' + (p.sect ? '' : ' title="散修称号加成：' + esc(roguePerkText(p)) + '"') + '>' + playerTitle(p) + ' · ' + reputationTierCapped(p.reputation, p.level) + ' · ' + sectLabel + ' · ' + (REALMS[p.realm] || REALMS[0]).minor + '</div></div>' +
      '<div class="hud-bars">' +
      '<div class="bar-row"><span>气血</span><div class="bar"><div class="bar-fill hp" style="width:' + (p.hp / p.hpMax * 100) + '%"></div></div><span class="bar-num">' + round(p.hp) + '/' + p.hpMax + '</span></div>' +
      '<div class="bar-row"><span>内力</span><div class="bar"><div class="bar-fill mp" style="width:' + (p.mp / p.mpMax * 100) + '%"></div></div><span class="bar-num">' + round(p.mp) + '/' + p.mpMax + '</span></div>' +
      '<div class="bar-row"><span>体力</span><div class="bar"><div class="bar-fill stamina" style="width:' + (_stm > 0 ? clamp((p.stamina || 0) / _stm * 100, 0, 100) : 0) + '%"></div></div><span class="bar-num">' + round(p.stamina || 0) + '/' + _stm + '</span></div>' +
      '<div class="bar-row"><span>经验</span><div class="bar"><div class="bar-fill xp" style="width:' + (p.exp / p.expNext * 100) + '%"></div></div><span class="bar-num">' + p.exp + '/' + p.expNext + '</span></div>' +
      '</div>' +
      '<div class="hud-stats"><span class="weather-badge" title="' + esc(w.desc) + '">' + uiIcon(w.icon) + ' ' + w.name + '</span><span class="weather-badge shichen-badge" title="' + esc(sc.desc) + '">' + uiIcon(sc.icon) + ' ' + sc.name + '</span><span>' + uiIcon('💰') + ' 金钱 ' + p.gold + '</span><span>' + uiIcon('⚔') + ' 攻击 ' + p.stats.atk + '</span><span>' + uiIcon('🛡') + ' 防御 ' + p.stats.def + '</span><span>' + uiIcon('💨') + ' 身法 ' + p.stats.spd + '</span></div>';
    const nameEl = hud.querySelector('.hud-main');
    if (nameEl) { nameEl.style.cursor = 'pointer'; nameEl.onclick = () => screen('char'); }
    updateStoryHighlight();
    renderStoryHint();
  }
  function applyStaticIcons() {
    const targets = [];
    const sb = $('startBtn'); if (sb) targets.push(sb);
    document.querySelectorAll('#nav button[data-screen]').forEach((b) => targets.push(b));
    const et = $('eventTitle'); if (et) targets.push(et);
    targets.forEach((el) => {
      const pl = pixLabel(el.textContent);
      if (pl.icon) el.innerHTML = pl.icon + ' ' + esc(pl.text);
    });
  }
  function updateStoryHighlight() {
    const btn = document.querySelector('#nav button[data-screen="story"]');
    if (!btn || !S || !S.player) return;
    const stepId = S.player.flags.story || 'a1_1';
    let hot = false;
    if (stepId !== 'done') {
      const step = STORY.find((s) => s.id === stepId);
      if (step && S.player.level >= step.levelReq) hot = true;
    }
    btn.classList.toggle('story-hot', hot);
  }
  function currentStoryObjective() {
    const p = S.player;
    if (!p) return '';
    const stepId = p.flags.story || 'a1_1';
    if (stepId === 'done') return { text: '📖 主线已了 · 江湖未老，可继续闯荡，或择轮回。', done: true };
    const step = STORY.find((s) => s.id === stepId);
    if (!step) return '';
    const can = p.level >= step.levelReq;
    return { text: (can ? '📖 主线可推进 · ' : '📖 主线 · ') + step.title + (can ? '' : '（' + step.levelReq + ' 级解锁）'), done: false };
  }
  function renderStoryHint() {
    const el = $('storyHint');
    if (!el || !S || !S.player) return;
    const o = currentStoryObjective();
    if (!o) { el.textContent = ''; return; }
    el.textContent = o.text;
    el.classList.toggle('done', !!o.done);
  }

  // ---------- 战斗面板：像素头像 + 敌人血槽 ----------
  const TIER_NAME = { normal: '普通', elite: '精英', boss: 'BOSS' };
  const TIER_COLOR = { normal: '#8a9ba8', elite: '#d4a24e', boss: '#e05a5a' };
  function enemyIcon(e) {
    if (ENEMY_SPRITE[e.id]) return pixelSprite(ENEMY_SPRITE[e.id]);
    if (ENEMY_ICONS[e.id]) return ENEMY_ICONS[e.id];
    if (e.icon) return e.icon;
    if (e.tier === 'boss') return '👹';
    if (e.tier === 'elite') return '⚔';
    const def = { jin: '🗡', mu: '🌿', tu: '🪨', shui: '💧', huo: '🔥' };
    return def[e.element] || '👤';
  }
  function renderCombatHUD() {
    const el = $('combatPanel');
    if (!el) return;
    if (!S.combat) { el.style.display = 'none'; el.innerHTML = ''; return; }
    const e = S.combat.enemy;
    const pct = clamp(e.hp / e.hpMax * 100, 0, 100);
    const ec = elementColor(e.element);
    const statuses = S.combat.enemyStatuses || [];
    const stText = statuses.map((s) => {
      const ic = s.type === 'burn' ? '🔥' : s.type === 'poison' ? '☠' : '💫';
      return ic + s.turns;
    }).join(' ');
    el.style.display = 'block';
    el.innerHTML =
      '<div class="combat-wrap">' +
      '<div class="combat-avatar" style="border-color:' + ec + ';background:' + ec + '22;">' + enemyIcon(e) + '</div>' +
      '<div class="combat-body">' +
      '<div class="combat-head"><span class="combat-name">' + esc(e.name) + '</span>' +
      '<span class="combat-tier" style="color:' + TIER_COLOR[e.tier] + ';">' + (TIER_NAME[e.tier] || '') + '</span>' +
      (e.element ? '<span class="combat-element" style="color:' + ec + ';">' + elementName(e.element) + '</span>' : '') +
      '</div>' +
      '<div class="bar combat-bar"><div class="bar-fill enemy-hp" style="width:' + pct + '%;"></div></div>' +
      '<div class="combat-sub"><span class="combat-hpnum">' + round(Math.max(0, e.hp)) + '/' + e.hpMax + '</span>' +
      (stText ? '<span class="combat-statuses">' + stText + '</span>' : '') +
      '</div></div></div>';
  }

  // ============================================================
  //  成就系统
  // ============================================================
  function hasFullSet(p) {
    const cnt = {};
    for (const slot of ['head', 'body', 'hand', 'leg', 'foot']) { const a = p.equipped[slot]; if (a && a.set) cnt[a.set] = (cnt[a.set] || 0) + 1; }
    return Object.values(cnt).some((c) => c >= 5);
  }
  const ACHIEVEMENTS = [
    { id: 'kill100', name: '杀鸡儆猴', desc: '累计击杀 100 个敌人', check: (p) => p.kills >= 100 },
    { id: 'kill1000', name: '千人斩', desc: '累计击杀 1000 个敌人', check: (p) => p.kills >= 1000 },
    { id: 'boss1', name: '初斩妖魔', desc: '击败 1 个 Boss', check: (p) => p.bosses >= 1 },
    { id: 'boss10', name: 'Boss 猎手', desc: '击败 10 个 Boss', check: (p) => p.bosses >= 10 },
    { id: 'bounty10', name: '赏金猎人', desc: '完成 10 个悬赏委托', check: (p) => (p.bountyDone || 0) >= 10 },
    { id: 'fullset', name: '套装在手', desc: '集齐任意一套 5 件套装', check: hasFullSet },
    { id: 'level50', name: '一代宗师', desc: '达到 50 级', check: (p) => p.level >= 50 },
    { id: 'level100', name: '武破虚空', desc: '达到 100 级', check: (p) => p.level >= 100 },
    { id: 'redyan5', name: '红颜环绕', desc: '结交 5 位红颜', check: (p) => Object.values(p.redyan || {}).filter((r) => r && r.status === 'redyan').length >= 5 },
    { id: 'rich', name: '富甲一方', desc: '身上银子达到 10000 两', check: (p) => (p.everGold || 0) >= 10000 },
    { id: 'orange', name: '神装现世', desc: '获得一件橙色品质装备', check: (p) => !!p.everOrange },
    { id: 'realm15', name: '破碎虚空', desc: '臻至最高境界', check: (p) => p.realm >= REALMS.length - 1 }
  ];
  function touchTrackers() { const p = S.player; if (p && p.gold > (p.everGold || 0)) p.everGold = p.gold; }
  function checkAchievements() {
    const p = S.player; if (!p) return;
    for (const a of ACHIEVEMENTS) {
      if (S.achievements.includes(a.id)) continue;
      if (a.check(p)) { S.achievements.push(a.id); log('🏆 达成成就【' + a.name + '】：' + a.desc + '！', 'level'); }
    }
  }
  function screenAchievements() {
    log('🏆 成就（' + S.achievements.length + '/' + ACHIEVEMENTS.length + '）', 'title');
    ACHIEVEMENTS.forEach((a) => { const got = S.achievements.includes(a.id); log((got ? '✅ ' : '⬜ ') + a.name + ' — ' + a.desc, got ? 'good' : 'dim'); });
    setActions([{ label: '← 返回', fn: () => screen('explore') }]);
  }

  // ============================================================
  //  江湖风云·限时世界事件
  // ============================================================
  function tickWorldEvent() {
    const we = S.worldEvent;
    if (we) {
      we.turns--;
      if (we.turns <= 0) { S.worldEvent = null; log('⏳ 江湖大事【' + we.name + '】已尘埃落定——你错过了时机。', 'dim'); }
      else if (we.turns <= 3) { log('⏳ 限时大事【' + we.name + '】即将消失（剩 ' + we.turns + ' 次行动）！', 'danger'); }
      return false;
    }
    if (rndf() < 0.015) { spawnWorldEvent(); return true; }
    return false;
  }
  function spawnWorldEvent() {
    const p = S.player;
    const pool = WORLD_EVENTS.filter((w) => !p.flags['we_' + w.id]);
    if (!pool.length) return;
    const w = pick(pool);
    const region = pick(REGIONS.filter((r) => r.level <= p.level));
    if (!region) return;
    S.worldEvent = { id: w.id, name: w.name, desc: w.desc, reward: w.reward, boss: w.boss, region: region.id, turns: rnd(18, 30) };
    log('🌍 江湖风云！限时大事件【' + w.name + '】！', 'event');
    showNotice('🌍 江湖风云 · 限时大事件', [
      { html: '<span class="hl">【' + esc(w.name) + '】</span>' + esc(w.desc), cls: '' },
      '📍 发生地：' + region.name + '（' + region.desc + '）',
      '⏳ 剩余行动次数：' + S.worldEvent.turns + ' 次。倒计时归零，此事件将永远错过。',
      '🎁 奖励：' + rewardText(w.reward),
      '前往事发地，击败卷入风波的强敌，即可赢取回报。'
    ], [
      { text: '⚡ 立即前往', cls: 'primary', fn: () => handleWorldEventNow() },
      { text: '稍后处理', fn: () => { save(); screen('explore'); } }
    ]);
  }
  function handleWorldEventNow() {
    const we = S.worldEvent;
    if (!we) { screen('explore'); return; }
    if (S.location.region !== we.region) { log('你星夜兼程，赶往【' + regionById(we.region).name + '】……', 'dim'); enterRegion(we.region); }
    if (S.worldEvent) doWorldEvent(); else screen('explore');
  }
  function doWorldEvent() {
    const we = S.worldEvent;
    if (!we) return;
    const region = regionById(we.region);
    if (S.location.region !== we.region) { log('你星夜兼程，赶往【' + region.name + '】……', 'dim'); enterRegion(we.region); return; }
    S.worldEvent = null;
    S.pendingWorldEvent = { id: we.id, name: we.name, reward: we.reward };
    log('你赶到【' + region.name + '】，挺身卷入【' + we.name + '】！', 'good');
    const bossId = we.boss || 'we_boss1';
    const boss = enemyById(bossId);
    log('　强敌现身——【' + boss.name + '】！', 'danger');
    log('　' + boss.desc, 'dim');
    const enemy = makeEnemy(bossId, S.player.level);
    // 动态平衡：Boss 战力随玩家水涨船高，略强但可战胜（专有 Boss，绝不刷鸡）
    const ps = S.player.stats;
    enemy.hpMax = enemy.hp = round(S.player.hpMax * 2.0);
    enemy.atk = round(ps.atk * 0.82);
    enemy.def = round(ps.def * 0.6);
    enemy.spd = round(ps.spd * 0.9);
    startCombat(enemy);
  }

  // ============================================================
  //  宿敌系统
  // ============================================================
  const RIVAL_ORIGINS = [
    { title: '酒馆结怨', text: (n) => '你在酒馆小酌，邻桌的【' + n + '】借着酒劲寻衅，故意把酒泼到你身上，还扬言要称称你的斤两。你与他一言不合，当众结下了梁子。' },
    { title: '夺宝之争', text: (n) => '一处前朝宝藏出世，你抢先一步夺得宝物。【' + n + '】慢你半步，怀恨在心，撂下狠话："此仇不报，誓不为人！"' },
    { title: '路见不平', text: (n) => '你路见不平，救下被恶霸欺压的百姓，却得罪了横行一方的【' + n + '】。他放言必取你性命。' },
    { title: '武会扬名', text: (n) => '武林大会上，你技惊四座，力压【' + n + '】，令他颜面扫地。自此他视你为一生之敌。' }
  ];
  function spawnRival() {
    const p = S.player;
    const name = pick(RIVAL_NAMES);
    const origin = pick(RIVAL_ORIGINS);
    S.rival = { name, origin: origin.title, level: p.level, element: pick(ELEMENT_ORDER), playerWins: 0, playerLosses: 0 };
    p.rivalCooldown = rnd(12, 18);
    log('👤 你与【' + name + '】结下了梁子！', 'danger');
    showNotice('⚔ ' + origin.title, [
      { html: esc(origin.text(name)), cls: '' },
      { html: '<span class="hl">【' + esc(name) + '】</span>从此成为你的宿敌，与你一同成长，日后定会找上门来。', cls: 'danger' }
    ], [
      { text: '⚔ 当场迎战', cls: 'primary', fn: () => { S.rivalFight = true; log('你拔剑而起，与【' + name + '】战作一团！', 'good'); startCombat(rivalEnemy()); } },
      { text: '改日再战', fn: () => { log('你按下剑柄，与【' + name + '】约定改日再战。', 'dim'); save(); screen('explore'); } }
    ]);
  }
  function rivalInsult() {
    return pick(['「哟，还没死呢？来，让爷爷再教训教训你。」', '「听说你最近混得不错？也就那样。」', '「上次的教训还不够？今日我送你回老家。」', '「就你也配行走江湖？笑掉大牙。」', '「跪下叫三声爷爷，我饶你不死。」', '「你的剑，和你的人一样，软！」']);
  }
  function tryRivalEncounter() {
    const p = S.player;
    if ((p.rivalCooldown || 0) > 0) { p.rivalCooldown--; return false; }
    if (!S.rival) {
      if (rndf() > 0.008) return false;
      spawnRival();
      return true;
    }
    const r = S.rival;
    if (r.appearing) return true;
    if (rndf() > 0.05) return false;
    r.appearing = true;
    r.level = p.level;   // 战力随你水涨船高
    log('⚔ 一个熟悉的身影拦住去路——正是宿敌【' + r.name + '】！', 'danger');
    showNotice('⚔ 宿敌拦路 · ' + r.name, [
      { html: '<span class="hl">' + esc(r.name) + '</span> 冷笑：' + esc(rivalInsult()), cls: '' },
      '当年「' + (r.origin || '结怨') + '」一事后，他一直视你为眼中钉。',
      '如今他与你一同成长（' + r.level + ' 级 · 五行' + elementName(r.element) + '），今日决意一雪前耻。'
    ], [
      { text: '⚔ 迎战宿敌！', cls: 'primary', fn: startRivalFight },
      { text: '😤 忍气吞声', fn: () => { r.appearing = false; p.rivalCooldown = rnd(14, 22); p.reputation = clamp(p.reputation - 8, -1999, 1999); log('你低头绕行，' + r.name + ' 放声狂笑："废物！"', 'dim'); log('　声望 -8。', 'danger'); save(); screen('explore'); } }
    ]);
    return true;
  }
  function rivalEnemy() {
    const r = S.rival, p = S.player, ps = p.stats;
    // 宿敌战力动态绑定玩家，始终略强一线，绝不落后
    return {
      id: 'rival', name: r.name, tier: 'elite', element: r.element, desc: '你的宿敌，与你一同成长，越战越强。', drop: [], level: p.level,
      hp: round(p.hpMax * 1.8), hpMax: round(p.hpMax * 1.8),
      atk: round(ps.atk * 1.05), def: round(ps.def * 0.9), spd: round(ps.spd * 1.0),
      crit: 0.10, critDmg: 1.8, dodge: 0.05, gold: [100, 250], exp: round(80 * (1 + p.level * 0.08)), statuses: []
    };
  }
  function startRivalFight() {
    const r = S.rival;
    r.appearing = false;
    S.rivalFight = true;
    log('你拔剑而出，与【' + r.name + '】战作一团！', 'good');
    startCombat(rivalEnemy());
  }

  // ---------- 屏幕导航 ----------
  function screen(name) {
    if (S && S.combat && name !== 'combat' && name !== 'combatItem' && name !== 'menu') { log('⚔ 战斗尚未结束，无法离开！', 'danger'); return; }
    S.screen = name;
    save();
    renderScreen();
  }
  function renderScreen() {
    if (!S) return;
    hideTooltip();
    if (S.player) { recalc(); renderHUD(); touchTrackers(); checkAchievements(); }   // ★ 创建角色时 player 为 null，不能 recalc
    renderWeather();
    const nav = $('nav'); if (nav) nav.style.display = (S.screen === 'create') ? 'none' : 'flex';
    renderCombatHUD();
    const fn = SCREENS[S.screen];
    if (fn) fn(); else SCREENS.explore();
  }

  // ============================================================
  //  屏幕：创建角色
  // ============================================================
  function screenCreate() {
    $('createPanel').style.display = '';
    $('log').innerHTML = '';
    log('===== 欢迎来到《山河一梦》 =====', 'title');
    log('这是一片广袤的江湖。你即将踏上自己的武侠之路。', '');
    log('（文字武侠 · 探索 · 随机 · 可无限刷级）', 'dim');
  }
  function confirmCreate() {
    const name = ($('nameInput').value || '').trim() || '无名侠客';
    const element = $('elementSelect').value;
    const weapon = $('weaponSelect').value;
    S = newGame(name, element, weapon);
    $('createPanel').style.display = 'none';
    $('log').innerHTML = '';
    log('===== 《山河一梦》 =====', 'title');
    log('你叫【' + name + '】，天生' + elementName(element) + '命，手持一柄' + S.player.equipped.weapon.name + '。', '');
    // 开场钩子（B型）：逐段演出，结束后落地到青石村
    playOpening(() => {
      showRegionLore('cun');
      refillGoals();
      updateMysteries();
      log('提示：点「探索」开始闯荡。', 'hint');
      screen('explore');
    });
  }
  function playOpening(onDone) {
    const hook = OPENING_HOOK || [];
    let i = 0;
    const next = () => {
      if (i >= hook.length) { if (onDone) onDone(); return; }
      const it = hook[i++];
      showNotice(it.title, it.lines, [{ text: '▶ 继续', cls: 'primary', fn: next }]);
    };
    next();
  }

  // ============================================================
  //  屏幕：探索
  // ============================================================
  function screenExplore() {
    const region = regionById(S.location.region);
    let loc = region.locs.find((l) => l.id === S.location.loc);
    if (!loc && region.locs.length) { loc = region.locs[0]; S.location.loc = loc.id; }   // 兜底：地点悬空时回退到首个地点
    const _cn = tickMapQuestVisit(); if (_cn) showClueNotice(_cn);
    log('📍 ' + region.name + ' · ' + loc.name, 'title');
    log(loc.desc, 'dim');
    // 声望氛围（同一地点同一档位只显示一次）
    S.player.ambientSeen = S.player.ambientSeen || {};
    const _ambKey = S.location.region + ':' + S.location.loc;
    const _ambBucket = repBucket(S.player.reputation);
    const _ambient = repAmbient(S.player.reputation, regionScene(S.location.region));
    if (_ambient && S.player.ambientSeen[_ambKey] !== _ambBucket) {
      log(_ambient, 'ambient');
      S.player.ambientSeen[_ambKey] = _ambBucket;
    }
    log('你要做什么？', 'hint');
    const btns = [];
    const _cityTypes = { guanfu: 1, qinglou: 1, bitai: 1, dufang: 1 };
    const canExplore = loc.type !== 'rest' && loc.type !== 'shop' && !_cityTypes[loc.type];
    const isGambleHouse = loc.type === 'dufang' || loc.id === 'dufang';
    if (isGambleHouse) {
      btns.push({ label: '🎲 赌博', fn: screenGamble, cls: 'primary' });
    } else {
      const _stmOk = (S.player.stamina || 0) >= STAMINA_COST;
      if (canExplore) btns.push({ label: '🗡 探索' + (_stmOk ? '' : '（体力不足）'), fn: doExplore, cls: 'primary', disabled: !_stmOk });
      if (canExplore) btns.push({ label: '🔁 连续探索 ×5', fn: multiExplore, disabled: !_stmOk });
    }
    if (S.worldEvent) btns.push({ label: '🌍 ' + S.worldEvent.name + '（剩 ' + S.worldEvent.turns + ' 次）', fn: handleWorldEventNow, cls: 'event' });
    if (loc.type === 'shop') btns.push({ label: '🛒 逛店', fn: screenShop, cls: 'primary' });
    if (loc.type === 'rest') btns.push({ label: '🏮 进客栈', fn: screenInn, cls: 'primary' });
    if (loc.type === 'shop' || loc.type === 'rest') btns.push({ label: '💬 打听情报（5 两）', fn: doGossip });
    if (loc.type === 'guanfu') { btns.push({ label: '📜 悬赏榜（通缉要犯）', fn: screenBountyBoard, cls: 'primary' }); btns.push({ label: '💬 打听情报（5 两）', fn: doGossip }); }
    if (loc.type === 'qinglou') { btns.push({ label: '🛏 歇息（回满，20 两）', fn: () => { if (S.player.gold < 20) { log('钱不够。', 'danger'); return; } S.player.gold -= 20; S.player.hp = S.player.hpMax; S.player.mp = S.player.mpMax; S.player.stamina = staminaMaxOf(S.player); log('你在青楼歇息，恢复满状态。', 'good'); save(); renderHUD(); }, cls: 'primary' }); btns.push({ label: '🌑 黑市', fn: screenBlackMarket, cls: 'primary' }); btns.push({ label: '💬 打听情报（5 两）', fn: doGossip }); }
    if (loc.type === 'bitai') btns.push({ label: '⚔ 比武台（江湖排行榜）', fn: screenRanking, cls: 'primary' });
    btns.push({ label: '🚶 换地方', fn: () => screen('loc') });
    btns.push({ label: '📖 背景志', fn: () => showRegionLore(S.location.region, true) });
    const secret = getSecretAt(S.location.region, S.location.loc);
    if (secret) btns.push({ label: '🗝 探寻秘密', fn: () => discoverSecret(secret.id), cls: 'event' });
    const clueSrc = clueAtLocation();
    if (clueSrc) btns.push({ label: '🔍 查探线索', fn: () => doClueInvestigate(clueSrc), cls: 'event' });
    if (region.boss && !S.player.flags['bossSlain_' + region.boss]) {
      const _boss = enemyById(region.boss);
      if (_boss) btns.push({ label: '⚔ 挑战此地霸主【' + _boss.name + '】', fn: () => { log('你挺身上前，挑战此地霸主【' + _boss.name + '】！', 'event'); startCombat(spawnBoss(region.boss)); }, cls: 'event' });
    }
    setActions(btns);
  }

  // 极小概率在探索中发现江湖流传功法残卷
  function tryDiscoverJianghuTech() {
    const p = S.player;
    if (rndf() > 0.001) return false;
    const pool = TECHS.filter((t) => !t.sect && !p.techniques.some((x) => x.id === t.id));
    if (!pool.length) return false;
    const tech = pick(pool);
    addTechnique(tech.id);
    log('📜 你在探索中偶然寻得一本功法残卷，参悟后习得【' + tech.name + '】！', 'level');
    showNotice('📜 探索发现功法 · ' + tech.name, ['你在荒郊野岭偶然寻得一本功法残卷。', '参悟之后，习得【' + tech.name + '】。'], [{ text: '✔ 机缘难得', cls: 'primary' }]);
    save();
    return true;
  }
  function tickSectTurn() { const p = S.player; if (p && p.sect) p.sectTurns = (p.sectTurns || 0) + 1; }
  // ---------- 天气 ----------
  const weatherInfo = () => WEATHER.find((w) => w.id === S.weather) || WEATHER[0];
  function rotateWeather() {
    const total = WEATHER.reduce((s, w) => s + w.weight, 0);
    let roll = rndf() * total;
    let w = WEATHER[0];
    for (const x of WEATHER) { roll -= x.weight; if (roll <= 0) { w = x; break; } }
    if (w.id !== S.weather) { S.weather = w.id; log('🌦 天气转【' + w.icon + w.name + '】。', 'dim'); }
  }
  // 每 100~150 次探索才切换一次天气
  function tickWeather() {
    S.weatherTurns = (S.weatherTurns || 0) + 1;
    if (!S.weatherDuration) S.weatherDuration = rnd(100, 150);
    if (S.weatherTurns >= S.weatherDuration) {
      S.weatherTurns = 0;
      S.weatherDuration = rnd(100, 150);
      rotateWeather();
    }
    renderWeather();
  }
  function renderWeather() {
    const w = weatherInfo();
    const badge = $('weatherBadge');
    if (badge) { badge.textContent = w.icon + ' ' + w.name; badge.title = w.desc; }
    const tint = $('weatherTint');
    if (tint) tint.className = w.tint;
  }
  // ---------- 时辰 ----------
  const shichenInfo = () => SHICHEN[clamp(S.shichen || 0, 0, 11)] || SHICHEN[0];
  // 每 4 次探索推进一个时辰（十二时辰 = 一日），换时辰有仪式感提示
  function tickTime() {
    S.timeSteps = (S.timeSteps || 0) + 1;
    if (S.timeSteps % 4 !== 0) return;
    const _prev = S.shichen || 0;
    S.shichen = (_prev + 1) % 12;
    if (S.shichen === 0 && _prev === 11) S.day = (S.day || 0) + 1;
    const sc = shichenInfo();
    log('🕰 ' + sc.icon + ' 已入' + sc.name + '，' + sc.desc, 'dim');
    renderHUD();
  }
  // 推进 n 个时辰（跨日自动 +1 天）
  function passShichen(n) {
    const _total = (S.shichen || 0) + n;
    S.shichen = _total % 12;
    S.day = (S.day || 0) + Math.floor(_total / 12);
    renderHUD();
  }
  function doExplore() {
    if ((S.player.stamina || 0) < STAMINA_COST) { log('你已疲惫不堪，体力不支，先去客栈歇息吧。', 'danger'); screen('explore'); return; }
    S.player.stamina -= STAMINA_COST;
    renderHUD();
    tickSectTurn();
    tickWeather();
    tickTime();
    if (trySectElderEvent()) return;
    if (tickWorldEvent()) return;
    if (tryDiscoverJianghuTech()) return;
    if (tryQuestComplete()) return;
    if (tryQuestTrigger()) return;
    if (tryLoverEncounter()) return;
    if (tryRivalEncounter()) return;
    exploreOnce();
  }
  function multiExplore() {
    const _max = Math.floor((S.player.stamina || 0) / STAMINA_COST);
    if (_max < 1) { log('你已疲惫不堪，体力不支，先去客栈歇息吧。', 'danger'); screen('explore'); return; }
    const _runs = Math.min(5, _max);
    log('🔁 你打起精神，连续探索 ' + _runs + ' 次……', 'hint');
    for (let i = 0; i < _runs; i++) {
      if (S.combat || S.pendingEvent || modalOpen()) break;
      S.player.stamina -= STAMINA_COST;
      tickSectTurn();
      tickWeather();
      tickTime();
      if (trySectElderEvent()) break;
      if (tickWorldEvent()) break;
      if (tryDiscoverJianghuTech()) break;
      if (tryQuestComplete()) break;
      if (tryQuestTrigger()) break;
      if (tryLoverEncounter()) break;
      if (tryRivalEncounter()) break;
      if (modalOpen()) break;
      exploreOnce();
    }
    save(); renderHUD();
  }
  function exploreOnce() {
    const _cn = tickMapQuestExplore(); if (_cn) showClueNotice(_cn);
    tickGoals('explore', S.location.region);
    maybeHearRumor();
    const region = regionById(S.location.region);
    const roll = rndf();
    const _rogue = !S.player.sect;
    const _evLo = _rogue ? 0.48 : 0.52;
    const _evHi = _rogue ? 0.66 : 0.64;
    if (roll < _evLo) {
      const enemy = spawnRandomEnemy();
      log('⚔ 遭遇敌人【' + enemy.name + '】！', 'danger');
      log('　' + enemy.desc, 'dim');
      startCombat(enemy);
    } else if (roll < _evHi) {
      triggerEvent();
    } else if (roll < 0.9) {
      const g = rnd(5, 30) * Math.max(1, Math.floor(region.level / 5));
      S.player.gold += g;
      log('💎 你发现了一处藏宝！获得 ' + g + ' 两。', 'good');
      const r2 = rndf();
      if (r2 < 0.3) { const w = randomWeapon(S.player.level); S.player.inventory.push({ id: w.id, weapon: w }); log('🎁 捡到武器【' + w.name + '】（' + w.qualityName + '）', 'good'); }
      else if (r2 < 0.55) { const a = randomArmor(S.player.level); S.player.inventory.push({ id: a.id, armor: a }); discoverSet(a.set); log('🎁 捡到防具【' + a.name + '】（' + a.slotName + ' · ' + a.qualityName + '）', 'good'); }
      save(); renderHUD();
    } else {
      log('你转了转，没什么特别的。', 'dim');
      save();
    }
  }

  function doRest() {
    const p = S.player;
    if (p.gold < 10) { log('钱不够，住不起店。', 'danger'); screenInn(); return; }
    p.gold -= 10;
    p.hp = p.hpMax; p.mp = p.mpMax; p.stamina = staminaMaxOf(p);
    log('你歇息一番，气血、内力、体力尽复。', 'good');
    save(); renderHUD();
    screenInn();
  }

  // ============================================================
  //  客栈：投宿 / 调息 / 入梦 / 独酌 / 药浴（特殊活动每日一次）
  // ============================================================
  function innDailyDone(key) { return (S.innDaily && S.innDaily[key] === S.day); }
  function innDailySet(key) { S.innDaily = S.innDaily || {}; S.innDaily[key] = S.day; }
  function screenInn() {
    const p = S.player;
    S.innDaily = S.innDaily || {};
    const _r = regionById(S.location.region);
    const _l = _r ? (_r.locs || []).find((x) => x.id === S.location.loc) : null;
    const _innName = (_l && _l.name) || '客栈';
    const tiaoxi = innDailyDone('tiaoxi'), rumeng = innDailyDone('rumeng'), duzhuo = innDailyDone('duzhuo'), yaoyu = innDailyDone('yaoyu');
    showNotice('🏮 ' + _innName, [
      '特殊活动每日一次，随时间推移（探索）跨日自动重置。',
      '体力 ' + round(p.stamina || 0) + '/' + staminaMaxOf(p) + '　气血 ' + round(p.hp) + '/' + p.hpMax + '　内力 ' + round(p.mp) + '/' + p.mpMax
    ], [
      { text: '🛏 投宿歇息（10 两 · 回满）', cls: 'primary', disabled: p.gold < 10, fn: doRest },
      { text: '🧘 调息' + (tiaoxi ? '（今日已做）' : ' · 回内力·体力'), disabled: tiaoxi, fn: doTiaoxi },
      { text: '💤 入梦' + (rumeng ? '（今日已做）' : ' · 小憩入梦'), disabled: rumeng, fn: doRumeng },
      { text: '🍶 独酌' + (duzhuo ? '（今日已饮）' : ' · 5 两'), disabled: duzhuo, fn: doDuzhuo },
      { text: '🛁 药浴' + (yaoyu ? '（今日已浴）' : ' · 8 两 · 回血'), disabled: yaoyu, fn: doYaoyu },
      { text: '← 离开客栈', cls: 'back', fn: () => screen('explore') }
    ]);
  }
  function doTiaoxi() {
    const p = S.player;
    if (innDailyDone('tiaoxi')) { screenInn(); return; }
    innDailySet('tiaoxi');
    passShichen(2);
    let _bonus = '';
    if (rndf() < 0.08) { p.innerBreath = (p.innerBreath || 0) + 2; _bonus = '　恍惚间似有明悟，内力上限永久 +2！'; }
    recalc();
    const mpGain = round(p.mpMax * 0.4), stGain = round(staminaMaxOf(p) * 0.4);
    p.mp = clamp(p.mp + mpGain, 0, p.mpMax);
    p.stamina = clamp((p.stamina || 0) + stGain, 0, staminaMaxOf(p));
    const sc = shichenInfo();
    log('你于' + sc.name + '盘膝调息，吐纳绵长，内力 +' + mpGain + '、体力 +' + stGain + '。', 'good');
    if (_bonus) log(_bonus, 'level');
    tryEnlighten('tiaoxi');
    save(); renderHUD();
    screenInn();
  }
  function doRumeng() {
    const p = S.player;
    if (innDailyDone('rumeng')) { screenInn(); return; }
    innDailySet('rumeng');
    passShichen(2);
    tryEnlighten('rumeng');
    if (rndf() < 0.65) { showDream(); return; }
    log('你合眼小憩，一梦无痕，只觉神思清朗。', 'dim');
    save(); renderHUD();
    screenInn();
  }
  function showDream() {
    showNotice('💤 庄周梦蝶', [
      '你沉入梦乡，恍惚来到云海之巅，',
      '一位看不清面目的人问你：此身何求？'
    ], [
      { text: '🦸 侠 · 路见不平，拔刀相助', fn: () => { changePersonality({ xia: 2 }); log('梦中你仗剑行侠，醒来心胸更见开阔（侠 +2）。', 'good'); finishDream(); } },
      { text: '🗡 恶 · 快意恩仇，我行我素', fn: () => { changePersonality({ gang: 2 }); S.player.morality = clamp(S.player.morality - 2, -100, 100); log('梦中你杀伐果断，醒来戾气略增（刚 +2 · 善 -2）。', 'dim'); finishDream(); } },
      { text: '❤ 情 · 执子之手，与子偕老', fn: () => { changePersonality({ qing: 2 }); log('梦中有人眉眼温柔，醒来心口尚有余温（情 +2）。', 'good'); finishDream(); } },
      { text: '💡 悟 · 参破虚妄，求得真知', fn: () => { log('你于梦中参悟武道，醒来心境通明。', 'good'); gainExp(round(expNeed(S.player.level) * 0.25)); finishDream(); } }
    ]);
  }
  function finishDream() { save(); renderHUD(); screenInn(); }
  function doDuzhuo() {
    const p = S.player;
    if (innDailyDone('duzhuo')) { screenInn(); return; }
    if (p.gold < 5) { log('你囊中羞涩，连一壶浊酒都买不起。', 'danger'); screenInn(); return; }
    p.gold -= 5;
    innDailySet('duzhuo');
    passShichen(1);
    const roll = rndf();
    if (roll < 0.3) {
      p.reputation = clamp(p.reputation + 3, -1999, 1999);
      log('你独坐一隅，听邻座说书人讲起一桩江湖旧事，见识见长（声望 +3）。', 'good');
    } else if (roll < 0.55) {
      const wt = p.equipped.weapon ? p.equipped.weapon.type : null;
      if (wt) { gainWeaponProf(wt, 8); log('一位豪客邀你比划，点到即止，你对【' + weaponTypeName(wt) + '】更熟稔了。', 'good'); }
      else { p.reputation = clamp(p.reputation + 2, -1999, 1999); log('你与几位江湖客谈武论道，各有所得（声望 +2）。', 'good'); }
    } else if (roll < 0.75) {
      log('一个醉汉踉跄撞来，不由分说动起手！', 'danger');
      save(); renderHUD();
      startCombat(makeEnemy('zuihan', p.level));
      return;
    } else {
      const g = rnd(5, 20);
      p.gold += g;
      log('你独自饮酒，忽闻一声熟悉的轻唤，原来是位故人，赠你 ' + g + ' 两盘缠。', 'good');
    }
    save(); renderHUD();
    screenInn();
  }
  function doYaoyu() {
    const p = S.player;
    if (innDailyDone('yaoyu')) { screenInn(); return; }
    if (p.gold < 8) { log('你银子不够，泡不起药浴。', 'danger'); screenInn(); return; }
    p.gold -= 8;
    innDailySet('yaoyu');
    passShichen(1);
    const heal = round(p.hpMax * 0.5);
    p.hp = clamp(p.hp + heal, 1, p.hpMax);
    log('你浸入药汤，周身暖流涌动，余毒尽去，气血 +' + heal + '。', 'good');
    save(); renderHUD();
    screenInn();
  }
  function tryEnlighten(source) {
    if (innDailyDone('dunwu')) return false;
    if (rndf() > 0.12) return false;
    innDailySet('dunwu');
    doEnlighten();
    return true;
  }
  function doEnlighten() {
    const p = S.player;
    const roll = rndf();
    if (roll < 0.3) {
      const pool = p.techniques.filter((t) => t.level < TECH_MAX_LEVEL);
      if (pool.length) {
        const t = pick(pool); t.level++;
        const tech = techById(t.id);
        recalc();
        log('💡 灵台一瞬清明，你于半梦半醒间参透【' + tech.name + '】的奥义，升至 Lv.' + t.level + '！', 'level');
      } else { enlightenFallback(); }
    } else if (roll < 0.55) {
      p.talentPoints += 1;
      log('💡 似梦非梦之间，你福至心灵，获得 1 点天赋！', 'level');
    } else if (roll < 0.75) {
      log('💡 你忽有所悟，武学境界更进一层！', 'level');
      gainExp(round(expNeed(p.level) * 0.5));
    } else {
      const pool = TECHS.filter((t) => !t.sect && !p.techniques.some((x) => x.id === t.id));
      if (pool.length) {
        const tech = pick(pool);
        addTechnique(tech.id);
        recalc();
        log('💡 睡梦中一篇残卷浮上心头，你领悟了江湖功法【' + tech.name + '】！', 'level');
      } else { enlightenFallback(); }
    }
    save(); renderHUD();
  }
  function enlightenFallback() {
    log('💡 你似有所悟，武学根基愈发扎实。', 'level');
    gainExp(round(expNeed(S.player.level) * 0.3));
  }
  const GOSSIP_LINES = [
    '掌柜压低声音：「听说西边山里闹妖，晚上可别乱走。」',
    '店家笑道：「最近有批商队招护卫，酬劳不低，就看敢不敢去。」',
    '邻桌的汉子嘀咕：「昨晚乱葬岗那边，有鬼火飘了大半夜……」',
    '「前些日子有个剑客路过，说是去找什么神兵，再没回来。」',
    '「魔教最近动静不小，正道各派都绷着弦呢。」',
    '「你要有闲钱，不妨去赌坊碰碰运气……别怪我没提醒你。」'
  ];
  function doGossip() {
    const p = S.player;
    if (p.gold < 5) { log('你连打听消息的茶钱都没有了。', 'danger'); return; }
    p.gold -= 5;
    log('你花 5 两请店家喝茶，打听江湖消息。', '');
    if (!S.quest && !S.bounty && rndf() < 0.35) {
      const chains = QUESTS.filter((q) => !p.flags['qdone_' + q.id] && regionById(q.steps[0].targetRegion).level <= p.level + 2);
      if (chains.length && rndf() < 0.5) {
        const q = pick(chains);
        S.quest = { id: q.id, step: 0 };
        const st = q.steps[0];
        log('📜 你打听到一条要紧消息，触发支线任务：' + q.name, 'event');
        showNotice('📜 新任务 · ' + q.name, [st.desc, '目标：前往【' + regionById(st.targetRegion).name + '】。'], [{ text: '✔ 接下任务', cls: 'primary' }]);
        save();
        return;
      }
      if (startBounty()) return;
    }
    log(pick(GOSSIP_LINES), 'dim');
    save();
  }
  function screenGamble() {
    const p = S.player;
    const opts = [10, 50, 100, 500];
    const bets = opts.filter((b) => b <= p.gold);
    const choices = bets.map((b) => ({ text: '押 ' + b + ' 两（赢了翻倍得 ' + (b * 2) + ' 两）', fn: () => doGamble(b) }));
    if (p.gold > 0 && !bets.includes(p.gold)) choices.push({ text: '孤注一掷（押全部 ' + p.gold + ' 两）', cls: 'primary', fn: () => doGamble(p.gold) });
    choices.push({ text: '← 离开', fn: null });
    showNotice('🎲 赌坊', ['押上金币，五五开：赢了翻倍，输了血本无归。', '当前金币：' + p.gold + ' 两'], choices);
  }
  function doGamble(amount) {
    const p = S.player;
    if (p.gold < amount) { log('钱不够。', 'danger'); return; }
    const win = rndf() < 0.5;
    if (win) {
      p.gold += amount;
      log('🎲 你押 ' + amount + ' 两，赢了！翻倍到账。', 'level');
      showNotice('🎲 你赢了！', ['你押下 ' + amount + ' 两，庄家赔你一倍。', '当前金币：' + p.gold + ' 两'], [{ text: '✔ 再来一把', cls: 'primary', fn: () => screenGamble() }, { text: '见好就收', fn: null }]);
    } else {
      p.gold -= amount;
      log('🎲 你押 ' + amount + ' 两，输了……血本无归。', 'danger');
      showNotice('🎲 你输了', ['你押下 ' + amount + ' 两，血本无归。', '当前金币：' + p.gold + ' 两'], [{ text: '🔁 翻本', fn: () => screenGamble() }, { text: '离开', fn: null }]);
    }
    save(); renderHUD();
  }

  // ============================================================
  //  随机事件
  // ============================================================
  // 计算事件层级深度：1=一层（直接选择），2=两层（一层子对话），以此类推
  function eventDepth(ev) {
    let max = 1;
    const walk = (choices, d) => { for (const c of choices || []) { if (c.sub) { max = Math.max(max, d + 1); walk(c.sub.choices, d + 1); } } };
    walk(ev.choices, 1);
    return max;
  }
  function triggerEvent() {
    const p = S.player;
    const recent = S.recentEvents || [];
    const base = EVENTS.filter((ev) => (!ev.levelReq || p.level >= ev.levelReq) && (!ev.region || S.location.region === ev.region) && (!ev.scenes || ev.scenes.includes(regionScene(S.location.region))) && (!ev.once || !p.flags[ev.once]) && (!ev.repMin || p.reputation >= ev.repMin) && (!ev.repMax || p.reputation <= ev.repMax) && (!ev.cond || ev.cond(p)));
    // 全池按权重抽取（去掉强制深度分层，扩大每次可选范围、降低重复感）
    let pool = base.filter((ev) => !recent.includes(ev.id));
    if (!pool.length) pool = base;
    const total = pool.reduce((s, ev) => s + (ev.weight || 1), 0);
    let roll = rndf() * total;
    let ev = pool[pool.length - 1];
    for (const e of pool) { roll -= (e.weight || 1); if (roll <= 0) { ev = e; break; } }
    recent.push(ev.id);
    if (recent.length > 18) recent.shift();
    S.recentEvents = recent;
    S.pendingEvent = ev;
    log('✨ 奇遇：' + ev.name, 'event');
    showEventModal(ev);
  }
  let eventStack = [];
  function showEventModal(ev) {
    const m = $('eventModal');
    if (!m) { setActions(ev.choices.map((c) => ({ label: '· ' + c.text, fn: () => resolveEvent(c) }))); return; }
    eventStack = [{ desc: ev.desc, choices: ev.choices }];
    const title = $('eventTitle');
    if (title) title.textContent = '✨ 奇遇 · ' + ev.name;
    renderEventNode();
    m.style.display = 'flex';
  }
  function renderEventNode() {
    const node = eventStack[eventStack.length - 1];
    const desc = $('eventDesc'), list = $('eventChoices');
    if (desc) desc.textContent = node.desc;
    if (list) {
      list.innerHTML = '';
      if (eventStack.length > 1) {
        const back = document.createElement('button');
        back.className = 'act back';
        back.textContent = '← 返回';
        back.addEventListener('click', () => { eventStack.pop(); renderEventNode(); });
        list.appendChild(back);
      }
      node.choices.forEach((c) => {
        const b = document.createElement('button');
        b.className = 'act';
        b.textContent = '· ' + c.text;
        b.addEventListener('click', () => {
          if (c.sub) { eventStack.push({ desc: c.sub.desc, choices: c.sub.choices }); renderEventNode(); }
          else showEventResult(c);
        });
        list.appendChild(b);
      });
    }
  }
  function hideEventModal() { eventStack = []; const m = $('eventModal'); if (m) m.style.display = 'none'; }
  // 通用重要信息弹窗（标题 + 多行正文 + 按钮）
  function showNotice(title, lines, choices) {
    const m = $('eventModal'); if (!m) { log('（弹窗不可用）', 'dim'); return; }
    eventStack = [];
    const t = $('eventTitle'); if (t) { const _pl = pixLabel(title); t.innerHTML = (_pl.icon ? _pl.icon + ' ' : '') + esc(_pl.text); }
    const d = $('eventDesc');
    if (d) {
      d.innerHTML = '';
      (lines || []).forEach((ln) => {
        const p = document.createElement('p');
        if (typeof ln === 'string') p.textContent = ln;
        else { p.innerHTML = ln.html; if (ln.cls) p.className = ln.cls; }
        d.appendChild(p);
      });
    }
    const list = $('eventChoices'); if (list) {
      list.innerHTML = '';
      (choices || []).forEach((c) => {
        const b = document.createElement('button');
        b.className = 'act' + (c.cls ? ' ' + c.cls : '');
        b.textContent = c.text;
        if (c.disabled) b.disabled = true;
        b.addEventListener('click', () => { hideEventModal(); if (c.fn) c.fn(); });
        list.appendChild(b);
      });
    }
    m.style.display = 'flex';
  }
  function modalOpen() { const m = $('eventModal'); return !!(m && m.style.display && m.style.display !== 'none'); }
  // 连续展示多条确认类通知
  function showNoticeChain(list) {
    if (!list || !list.length) return;
    const item = list[0], rest = list.slice(1);
    showNotice(item.title, item.lines, [{ text: '✔ 确认', cls: 'primary', fn: () => { if (rest.length) showNoticeChain(rest); } }]);
  }
  function rewardText(r) {
    const parts = [];
    if (r.gold) parts.push('银子 ' + r.gold);
    if (r.exp) parts.push('经验 ' + r.exp);
    if (r.rep) parts.push('声望 +' + r.rep);
    if (r.moral) parts.push('善 +' + r.moral);
    if (r.talent) parts.push('天赋点 +' + r.talent);
    if (r.item === 'random') parts.push('随机武器');
    if (r.tech) parts.push('功法【' + (techById(r.tech) ? techById(r.tech).name : r.tech) + '】');
    return parts.length ? parts.join(' · ') : '丰厚奖励';
  }
  function showEventResult(c) {
    const desc = $('eventDesc'), list = $('eventChoices');
    if (desc) desc.textContent = c.result;
    if (list) {
      list.innerHTML = '';
      const ok = document.createElement('button');
      ok.className = 'act primary';
      ok.textContent = '✔ 确认';
      ok.addEventListener('click', () => resolveEvent(c));
      list.appendChild(ok);
    }
  }
  function resolveEvent(c) {
    const ev = S.pendingEvent;
    S.pendingEvent = null;
    hideEventModal();
    log(c.result, 'good');
    const depth = ev ? eventDepth(ev) : 1;
    const e = { ...(c.effect || {}) };
    // 层数越多，奖励越好（1/2/3/4 层 → ×1 / ×1.3 / ×1.8 / ×2.5）
    const depthMult = [1, 1.3, 1.8, 2.5][depth - 1] || 1;
    if (e.gold > 0) e.gold = Math.round(e.gold * depthMult);
    if (e.exp > 0) e.exp = Math.round(e.exp * depthMult);
    applyEffect(e);
    if (e.gold > 0) log('💰 获得 ' + e.gold + ' 两。', 'good');
    else if (e.gold < 0) log('　花费 ' + (-e.gold) + ' 两。', 'dim');
    // 三层以上：极小概率获得功法 / 装备，并由事件人物给出合理解释
    if (depth >= 3 && rndf() < (depth === 3 ? 0.03 : 0.06)) {
      grantEventLoot(ev);
    }
    if (ev && ev.once) S.player.flags[ev.once] = true;
    save();
    screen('explore');   // ★ 事件结束，回到探索界面并复位操作按钮
  }
  const LOOT_TECH_LINES = [
    '「此番多亏了你，这卷{name}是老朽偶然所得，你我有缘，便转赠于你。」',
    '「这部{name}我参悟不透，你慧根不浅，拿去修习罢。」',
    '「承蒙相助，无以为报，这部{name}聊表谢意。」',
    '「这{name}搁在我这儿也是蒙尘，今日赠予有缘人。」'
  ];
  const LOOT_GEAR_LINES = [
    '「这件{name}跟了我多年，今日赠你，莫要辱没了它。」',
    '「这是祖上传下的{name}，送予你，望你行走江湖行侠仗义。」',
    '「这{name}我留着也无用，赠你防身罢。」',
    '「早年间得来的{name}，你我有缘，便送你了。」'
  ];
  function grantEventLoot(ev) {
    const p = S.player;
    const giver = (ev && ev.giver) || '对方';
    if (rndf() < 0.5) {
      const pool = TECHS.filter((t) => !t.sect && !p.techniques.some((x) => x.id === t.id));
      if (pool.length) {
        const tech = pick(pool);
        addTechnique(tech.id);
        const line = pick(LOOT_TECH_LINES).replace('{name}', tech.name);
        log('📜 ' + giver + ' ' + line, 'level');
        log('　习得功法【' + tech.name + '】。', 'good');
        showNotice('📜 获得功法 · ' + tech.name, [giver + '：' + line, '（已自动习得，可在「功法」查看）'], [{ text: '✔ 多谢厚赠', cls: 'primary' }]);
        return;
      }
    }
    const line = pick(LOOT_GEAR_LINES);
    if (rndf() < 0.5) {
      const w = randomWeapon(p.level);
      p.inventory.push({ id: w.id, weapon: w });
      log('🎁 ' + giver + ' ' + line.replace('{name}', w.name), 'level');
      log('　获得武器【' + w.name + '】· ' + w.qualityName + '，已放入背包。', 'good');
      showNotice('🎁 获赠神兵 · ' + w.name, [giver + '：' + line.replace('{name}', w.name), '（' + w.qualityName + '，已放入背包）'], [{ text: '✔ 多谢厚赠', cls: 'primary' }]);
    } else {
      const a = randomArmor(p.level);
      p.inventory.push({ id: a.id, armor: a });
      discoverSet(a.set);
      log('🎁 ' + giver + ' ' + line.replace('{name}', a.name), 'level');
      log('　获得防具【' + a.name + '】· ' + a.slotName + ' · ' + a.qualityName + '，已放入背包。', 'good');
      showNotice('🎁 获赠防具 · ' + a.name, [giver + '：' + line.replace('{name}', a.name), '（' + a.slotName + ' · ' + a.qualityName + '）'], [{ text: '✔ 多谢厚赠', cls: 'primary' }]);
    }
  }
  function applyEffect(e) {
    const p = S.player;
    if (e.gold) p.gold = Math.max(0, p.gold + e.gold);
    if (e.exp) gainExp(e.exp);
    if (e.hp) { p.hp = clamp(p.hp + e.hp, 1, p.hpMax); log('❤ 气血 ' + (e.hp > 0 ? '+' : '') + e.hp + '。', 'good'); }
    if (e.mp) { p.mp = clamp(p.mp + e.mp, 0, p.mpMax); log('🌀 内力 ' + (e.mp > 0 ? '+' : '') + e.mp + '。', 'good'); }
    if (e.item) { if (e.item === 'random') { const w = randomWeapon(p.level); p.inventory.push({ id: w.id, weapon: w }); log('🎁 获得武器【' + w.name + '】', 'good'); } else { addItem(e.item, 1); const _it = itemById(e.item); log('🎁 获得【' + (_it ? _it.name : e.item) + '】。', 'good'); } }
    if (e.weapon) { const uw = UNIQUE_WEAPONS[e.weapon]; if (uw) { const w = makeWeapon(uw.type, uw.quality); w.affixes = uw.affix.map((a) => AFFIXES.find((x) => x.id === a)).filter(Boolean); if (uw.bonus) w.bonus = uw.bonus; w.name = adjPrefixName(w, uw.name); ITEM_TIPS[w.name] = weaponTip(w); ITEM_COLORS[w.name] = w.qualityColor; p.inventory.push({ id: w.id, weapon: w }); log('🎁 获得武器【' + w.name + '】！', 'good'); } }
    if (e.artifact) { const art = makeArtifact(e.artifact); if (art) { if (art.weapon) { p.inventory.push({ id: art.weapon.id, weapon: art.weapon }); log('🔴 获得神器【' + art.weapon.name + '】！', 'level'); } else if (art.armor) { p.inventory.push({ id: art.armor.id, armor: art.armor }); log('🔴 获得神器【' + art.armor.name + '】！', 'level'); } } }
    if (e.sectContribution && p.sect) { p.sectContribution += e.sectContribution; log('📜 门派贡献 +' + e.sectContribution, 'good'); }
    if (e.tech) { if (!p.techniques.some((t) => t.id === e.tech)) { addTechnique(e.tech); const tt = techById(e.tech); log('📜 习得功法【' + (tt ? tt.name : e.tech) + '】！', 'good'); } else { gainExp(80); } }
    if (e.talent) { p.talentPoints += e.talent; log('🌟 天赋点 +' + e.talent, 'good'); }
    if (e.armor) { const a = randomArmor(p.level); p.inventory.push({ id: a.id, armor: a }); discoverSet(a.set); log('🎁 获得防具【' + a.name + '】（' + a.slotName + ' · ' + a.qualityName + '）', 'good'); }
    if (e.gear) { if (rndf() < 0.5) { const w = makeWeapon(pick(WEAPON_TYPES).id, e.gear); p.inventory.push({ id: w.id, weapon: w }); log('🎁 获得武器【' + w.name + '】（' + w.qualityName + '）', 'good'); } else { const a = makeArmor(pick(ARMOR_SLOTS).id, e.gear, setForLevel(p.level).id); p.inventory.push({ id: a.id, armor: a }); discoverSet(a.set); log('🎁 获得防具【' + a.name + '】（' + a.slotName + ' · ' + a.qualityName + '）', 'good'); } }
    if (e.moral) { changeMorality(e.moral); log('善恶 ' + (e.moral > 0 ? '+' : '') + e.moral + '。', e.moral > 0 ? 'good' : 'dim'); }
    if (e.rep) { changeReputation(e.rep); log('声望 ' + (e.rep > 0 ? '+' : '') + e.rep + '。', e.rep > 0 ? 'good' : 'dim'); }
    if (e.per) { changePersonality(e.per); for (const _k in e.per) { const _d = PERSONALITY_DIMS.find((x) => x.id === _k); let _lbl = _k; if (_d) { const _p = _d.desc.split('↔'); _lbl = (e.per[_k] > 0 ? (_p[0] || '').trim() : (_p[1] || '').trim()); } log('　' + _lbl + ' +' + Math.abs(e.per[_k]), e.per[_k] > 0 ? 'good' : 'dim'); } }
    renderHUD();
  }
  function addItem(id, qty) {
    const p = S.player;
    const it = p.inventory.find((x) => x.id === id && !x.weapon);
    if (it) it.qty += qty; else p.inventory.push({ id, qty });
  }

  // ============================================================
  //  经验 / 升级
  // ============================================================
  function gainExp(n) {
    const p = S.player;
    const gained = round(n * 1.2 * (1 + (p.stats.expBonus || 0)));
    p.exp += gained;
    settle('✨ 获得 ' + gained + ' 经验', 'good');
    // 防呆：经验/升级阈值异常（NaN/Infinity/<=0）时重置，避免死循环
    if (!isFinite(p.exp)) p.exp = 0;
    if (!isFinite(p.expNext) || p.expNext <= 0) p.expNext = expNeed(p.level || 1);
    let _guard = 0;
    while (p.exp >= p.expNext && _guard++ < 100) {
      p.exp -= p.expNext; p.level++; p.expNext = expNeed(p.level); p.talentPoints += 2;
      p.hp = p.hpMax; p.mp = p.mpMax; recalc();
      logCard('up', '突破至 ' + p.level + ' 级');
      log('意气风发！你突破至 ' + p.level + ' 级！（+2 天赋点）', 'level');
      if (p.level === 10) log('　【初出茅庐】你已小有名气。', 'good');
      if (p.level === 30) log('　【声名鹊起】你已是独当一面的高手。', 'good');
      if (p.level === 50) log('　【一代宗师】你的名号如雷贯耳。', 'good');
      if (p.level === 80) log('　【登峰造极】天下武功信手拈来。', 'good');
      if (p.level === 100) log('　【武破虚空】传说，也不过如此。', 'good');
      closeCard();
    }
    renderHUD();
    checkAchievements();
  }

  // ============================================================
  //  战斗
  // ============================================================
  function startCombat(enemy) {
    // 血月天象：妖邪躁动，敌人更强、经验更丰
    if (S.weather === 'blood') {
      enemy.hpMax = round(enemy.hpMax * 1.12); enemy.hp = enemy.hpMax;
      enemy.atk = round(enemy.atk * 1.12); enemy.def = round(enemy.def * 1.12); enemy.exp = round(enemy.exp * 1.3);
    }
    S.combat = { enemy, fled: false, playerStatuses: [], enemyStatuses: enemy.statuses || [], flaw: false };
    S.screen = 'combat';
    logCard('combat', enemy.name);
    if (S.weather === 'blood') log('🩸 血月当空，妖邪躁动，此战凶险异常！', 'danger');
    log('敌方：气血 ' + round(enemy.hp) + '/' + enemy.hpMax + ' · 攻 ' + enemy.atk + ' · 防 ' + enemy.def + (enemy.element ? ' · ' + elementName(enemy.element) : ''), 'dim');
    setCombatActions();
  }
  function setCombatActions() {
    if (!S.combat) return;
    const p = S.player; const e = S.combat.enemy;
    log('你的回合。', 'hint');
    const skills = getSkills();
    const curW = p.equipped.weapon;
    const btns = [{ label: '🗡 普通攻击', fn: () => playerAct('attack', null) }];
    skills.forEach((sk) => {
      const weaponOk = !sk.needWeapon || (curW && curW.type === sk.needWeapon);
      btns.push({ label: sk.name + '（' + sk.mp + ' 内力）' + (!weaponOk ? '· 需' + weaponTypeName(sk.needWeapon) : ''), fn: () => playerAct('skill', sk), disabled: p.mp < sk.mp || !weaponOk, hint: sk.desc + (!weaponOk ? '（需装备' + weaponTypeName(sk.needWeapon) + '）' : '') });
    });
    btns.push({ label: '🛡 防御', fn: () => playerAct('defend', null) });
    btns.push({ label: '🔁 五行·' + elementName(p.activeElement || p.element), fn: () => { cycleElement(); setCombatActions(); } });
    btns.push({ label: '🧪 用药', fn: () => screen('combatItem') });
    if ((e.level || 1) <= p.level - 8) btns.push({ label: '⚡ 一键了结', fn: () => { log('你未出招，' + e.name + ' 已吓得肝胆俱裂，当场毙命！', 'good'); victory(); } });
    btns.push({ label: '🏃 逃跑', fn: () => playerAct('flee', null) });
    setActions(btns);
    renderCombatHUD();
  }
  function getSkills() {
    const out = [], seen = {};
    S.player.equippedTechs = S.player.equippedTechs || [];
    for (const t of S.player.techniques) {
      if (!S.player.equippedTechs.includes(t.id)) continue;
      const tech = techById(t.id);
      if (!tech) continue;
      const needWeapon = TECH_TYPE_WEAPON[tech.type] || null;
      tech.skills.forEach((sk) => { if (sk.mp > 0 && !seen[sk.id]) { seen[sk.id] = 1; out.push({ ...sk, needWeapon, techName: tech.name, type: tech.type }); } });
    }
    return out;
  }

  function playerAct(kind, skill) {
    if (!S.combat) return;
    const p = S.player, e = S.combat.enemy;
    if (hasStatus(S.combat.playerStatuses, 'stun')) {
      S.combat.playerStatuses = consumeStun(S.combat.playerStatuses);
      log('你被眩晕，动弹不得！', 'danger');
      enemyTurn(); return;
    }
    if (kind === 'attack') {
      let dmg = hit(p.stats, e, 1.0, p.stats.element);
      if (S.combat.flaw) { dmg = round(dmg * 2); S.combat.flaw = false; log('　你抓住破绽，一击重创！', 'level'); }
      e.hp -= dmg;
      log('你' + flavorFor(WEAPON_FLAVOR_KEY[(p.equipped.weapon ? p.equipped.weapon.type : 'fist')]) + '，造成 ' + dmg + ' 点伤害' + critNote() + '。', 'good');
      if (p.equipped.weapon) gainWeaponProf(p.equipped.weapon.type, 1);
      postHit(dmg);
    } else if (kind === 'skill') {
      p.mp -= skill.mp;
      const el = skill.element || p.stats.element;
      let dmg = hit(p.stats, e, skill.mult, el);
      if (S.combat.flaw) { dmg = round(dmg * 2); S.combat.flaw = false; log('　你抓住破绽，一击重创！', 'level'); }
      e.hp -= dmg;
      log('你施展【' + skill.name + '】，' + flavorFor(skill.type) + '，造成 ' + dmg + ' 点伤害' + critNote() + '。', 'good');
      tryApplyStatus(S.combat.enemyStatuses, el, e);
      postHit(dmg);
    } else if (kind === 'defend') {
      S.combat.playerDefend = true;
      S.combat.flaw = false;
      log('你摆出防御架势。', 'dim');
      enemyTurn(); return;
    } else if (kind === 'flee') {
      S.combat.flaw = false;
      if (rndf() < 0.55 + p.stats.spd * 0.0015) { S.combat.fled = true; log('你脚底抹油，成功逃脱。', 'good'); endCombat(); return; }
      log('逃跑失败，被拦住了！', 'danger');
      enemyTurn(); return;
    }
    if (!S.combat) return;
    if (e.hp <= 0) { victory(); return; }
    enemyTurn();
  }

  function postHit(dmg) {
    const p = S.player, e = S.combat.enemy;
    if (dmg > 0 && p.stats.lifeSteal > 0) {
      const heal = round(dmg * p.stats.lifeSteal);
      if (heal > 0) { p.hp = clamp(p.hp + heal, 1, p.hpMax); log('❤ 吸血回复 ' + heal + ' 气血。', 'good'); }
    }
    if (p.stats.combo > 0 && rndf() < p.stats.combo && e.hp > 0) {
      const dmg = hit(p.stats, e, 0.6, p.stats.element);
      e.hp -= dmg; log('⚡ 连击！追加 ' + dmg + ' 点伤害。', 'good');
    }
    renderCombatHUD();
  }

  function hit(attacker, defender, mult, element) {
    let dmg = attacker.atk * mult - defender.def * 0.6 * (1 - (attacker.pierce || 0));
    dmg *= elementMult(element, defender.element);
    C_tmp = { crit: false, dodge: false };
    if (rndf() < (attacker.crit || 0)) { dmg *= (attacker.critDmg || 1.5); C_tmp.crit = true; }
    if (defender.dodge && rndf() < defender.dodge) { dmg = 0; C_tmp.dodge = true; }
    dmg *= (0.9 + rndf() * 0.2);
    return Math.max(1, round(dmg));
  }
  let C_tmp = { crit: false, dodge: false };
  function critNote() { return C_tmp.crit ? '（暴击！）' : ''; }

  function tryApplyStatus(target, element, enemy) {
    if (!element || !enemy) return;
    const ch = element === 'huo' ? 0.25 : element === 'mu' ? 0.2 : 0;
    if (ch && rndf() < ch && !target.some((s) => s.type === (element === 'huo' ? 'burn' : 'poison'))) {
      const type = element === 'huo' ? 'burn' : 'poison';
      const dmg = round(enemy.hpMax * (element === 'huo' ? 0.03 : 0.02));
      target.push({ type, turns: 3, dmg });
      log('　' + (type === 'burn' ? '🔥 灼烧' : '☠ 中毒') + '！' + enemy.name + ' 每回合损失 ' + dmg + ' 气血。', 'good');
    }
  }

  function hasStatus(list, type) { return list.some((s) => s.type === type && s.turns > 0); }
  function consumeStun(list) { list.forEach((s) => { if (s.type === 'stun') s.turns--; }); return list.filter((s) => s.turns > 0); }

  function enemyTurn() {
    if (!S.combat) return;
    const p = S.player, e = S.combat.enemy;
    if (e.hp <= 0) { victory(); return; }
    if (hasStatus(S.combat.enemyStatuses, 'stun')) {
      S.combat.enemyStatuses = consumeStun(S.combat.enemyStatuses);
      log(e.name + ' 被眩晕，跳过回合。', 'dim');
      tickStatuses();
      return;
    }
    let dmg, mult = 1.0, label = '攻击';
    const roll = rndf();
    if (e.tier === 'boss' && roll < 0.18) { mult = 2.0; label = '施展绝招'; }
    else if ((e.tier === 'boss' || e.tier === 'elite') && roll < 0.45) { mult = 1.5; label = '蓄力重击'; }
    dmg = hit(e, p.stats, mult, e.element);
    if (S.combat.playerDefend) { dmg = round(dmg * 0.5); S.combat.playerDefend = false; label += '（你防御）'; }
    p.hp -= dmg;
    log(e.name + ' ' + pick(ENEMY_FLAVOR) + '，' + label + '，造成 ' + dmg + ' 点伤害。', 'danger');
    if (p.stats.thorn > 0) { const re = round(dmg * p.stats.thorn); e.hp -= re; if (re > 0) log('　荆棘反伤 ' + re + ' 点。', 'dim'); }
    if (e.element && rndf() < 0.12) { const type = e.element === 'huo' ? 'burn' : e.element === 'mu' ? 'poison' : null; if (type && !hasStatus(S.combat.playerStatuses, type)) { S.combat.playerStatuses.push({ type, turns: 3, dmg: round(p.hpMax * 0.02) }); log('　你中了' + (type === 'burn' ? '灼烧' : '中毒') + '！', 'danger'); } }
    if (p.hp <= 0) { defeat(); return; }
    if (rndf() < 0.28) { S.combat.flaw = true; log('　' + e.name + ' 露出破绽！此时出手伤害翻倍！', 'hint'); }
    renderCombatHUD();
    tickStatuses();
  }

  function tickStatuses() {
    if (!S.combat) return;
    const p = S.player, e = S.combat.enemy;
    for (const s of S.combat.playerStatuses) { if (s.type === 'poison') { p.hp -= s.dmg; log('☠ 中毒发作 -' + s.dmg + ' 气血。', 'danger'); } if (s.type === 'burn') { p.hp -= s.dmg; log('🔥 灼烧 -' + s.dmg + ' 气血。', 'danger'); } s.turns--; }
    for (const s of S.combat.enemyStatuses) { if (s.type === 'poison') { e.hp -= s.dmg; log('☠ ' + e.name + ' 中毒 -' + s.dmg + '。', 'good'); } if (s.type === 'burn') { e.hp -= s.dmg; log('🔥 ' + e.name + ' 灼烧 -' + s.dmg + '。', 'good'); } s.turns--; }
    S.combat.playerStatuses = S.combat.playerStatuses.filter((s) => s.turns > 0);
    S.combat.enemyStatuses = S.combat.enemyStatuses.filter((s) => s.turns > 0);
    if (p.hp <= 0) { defeat(); return; }
    if (e.hp <= 0) { victory(); return; }
    renderCombatHUD();
    renderHUD();
    setCombatActions();
  }

  function victory() {
    if (!S.combat) return;
    const p = S.player, e = S.combat.enemy;
    S.combat = null;
    const notices = [];
    const gold = round(rnd(e.gold[0], e.gold[1]) * (1 + (p.stats.goldBonus || 0)));
    p.gold += gold; p.kills++;
    if (p.equipped.weapon) gainWeaponProf(p.equipped.weapon.type, 2);
    checkSectTaskKill(e.id, notices);
    if (S.bounty && e.id === S.bounty.enemyId && S.location.region === S.bounty.regionId) {
      S.bounty.killed++;
      log('　悬赏进度：' + S.bounty.killed + '/' + S.bounty.need, 'hint');
      if (S.bounty.killed >= S.bounty.need) {
        const b = S.bounty;
        log('🏆 悬赏「' + b.issuer + '」的委托完成了！', 'level');
        applyEffect(b.reward);
        p.bountyDone = (p.bountyDone || 0) + 1;
        notices.push({ title: '🏆 悬赏完成', lines: ['委托人 ' + b.issuer + ' 的委托已办妥。', '你已击杀 ' + b.need + ' 个【' + b.enemyName + '】。', '报酬：' + rewardText(b.reward) + '。'] });
        S.bounty = null;
      }
    }
    const _cn = tickMapQuestKill(e.id); if (_cn) notices.push(_cn);
    tickGoals('kill');
    if (e.id === 'xie_jian' && S.location.region === 'jianzhong' && !S.player.flags.slainGuardian) {
      S.player.flags.slainGuardian = true;
      log('🗡 你击败了守剑之灵【邪剑灵】，冢心似有异动。', 'level');
    }
    const repGain = e.tier === 'boss' ? 20 : e.tier === 'elite' ? 2 : 0;
    if (repGain) p.reputation = clamp(p.reputation + repGain, -1999, 1999);
    settle('🏆 你击败了【' + e.name + '】！', 'level');
    settle('　获得 ' + gold + ' 两', 'good');
    gainExp(e.exp);
    if (e.drop && e.drop.length) for (const dk of e.drop) { const d = DROPS[dk]; if (d && rndf() < (d.chance + (p.stats.dropBonus || 0))) { if (d.type === 'item') { if (d.id === 'gold') { const g = rnd(d.qty[0], d.qty[1]); p.gold += g; settle('　掉落 ' + g + ' 两', 'dim'); } else { addItem(d.id, rnd(d.qty[0], d.qty[1])); settle('　掉落【' + (itemById(d.id) ? itemById(d.id).name : d.id) + '】', 'dim'); } } else if (d.type === 'weapon') { const uw = UNIQUE_WEAPONS[d.id]; if (uw) { const w = makeWeapon(uw.type, uw.quality); w.affixes = uw.affix.map((a) => AFFIXES.find((x) => x.id === a)).filter(Boolean); w.name = adjPrefixName(w, uw.name); ITEM_TIPS[w.name] = weaponTip(w); ITEM_COLORS[w.name] = w.qualityColor; p.inventory.push({ id: w.id, weapon: w }); settle('　掉落神兵【' + w.name + '】！', 'good'); } } } }
    // 打怪掉落套装防具：按当前区域等级，随新地图解锁新套装
    if (rndf() < 0.12) {
      const region = regionById(S.location.region);
      const set = setForLevel(region.level);
      const a = makeArmor(pick(ARMOR_SLOTS).id, randomQuality(p.level), set.id);
      p.inventory.push({ id: a.id, armor: a });
      discoverSet(a.set);
      settle('🎁 你从【' + e.name + '】身上搜得防具【' + a.name + '】（' + a.slotName + ' · ' + a.qualityName + '）', 'good');
    }
    if (p.revenge.some((r) => r.id === e.id)) {
      p.revenge = p.revenge.filter((r) => r.id !== e.id);
      settle('🔥 大仇得报！你手刃了这个曾羞辱你的家伙，胸中郁气一扫而空！', 'level');
      const bonus = 100 * p.level; p.gold += bonus; settle('　复仇奖励：' + bonus + ' 两 + 大量经验', 'good'); gainExp(200 + p.level * 10);
    }
    if (e.tier === 'boss') {
      p.bosses++;
      settle('　（累计击杀 Boss：' + p.bosses + '）', 'dim');
      notices.push({ title: '⚔ 斩灭 · ' + e.name, lines: [pick(BOSS_POEMS), '血战之下，你击杀了【' + e.name + '】，此役之后，江湖又少一枭雄。'] });
      recordChronicle('boss_' + e.id, '斩灭 Boss【' + e.name + '】');
      const _rb = regionById(S.location.region);
      if (_rb && _rb.boss === e.id) S.player.flags['bossSlain_' + e.id] = true;
    }
    if (S.rivalFight) {
      S.rivalFight = false;
      const r = S.rival;
      if (r) {
        r.playerWins++; r.playerLosses = 0;
        const g = 150 * p.level; p.gold += g;
        settle('😎 你击败了宿敌【' + r.name + '】，扬眉吐气，痛快！', 'level');
        gainExp(150 + p.level * 8);
        r.level = clamp(r.level + rnd(1, 2), 1, p.level + 1);
        p.rivalCooldown = rnd(14, 22);
        notices.push({ title: '😎 大败宿敌', lines: ['你击败了宿敌【' + r.name + '】，扬眉吐气，痛快！', r.name + ' 咬牙道："我还会回来的！"', '气运回馈：' + g + ' 两 + 大量经验。', '（' + r.name + ' 败后苦修，实力更胜从前，改日还会再来。）'] });
      }
    }
    if (S.rankFight) {
      const rank = S.rankFight;
      S.rankFight = false;
      const entry = RANKINGS.find((r) => r.rank === rank);
      if (entry) {
        p.rank = rank;
        settle('🏆 你击败【' + entry.name + '】，登上江湖榜第 ' + rank + ' 名！', 'level');
        applyEffect(entry.reward);
        recordChronicle('rank_' + rank, '登上江湖榜第 ' + rank + ' 名');
      }
    }
    if (S.pendingWorldEvent) {
      try {
        const we = S.pendingWorldEvent; S.pendingWorldEvent = null;
        p.flags['we_' + we.id] = true;
        settle('🌍 你平息了江湖风波【' + we.name + '】！', 'level');
        recordChronicle('we_' + we.id, '平定江湖风波「' + we.name + '」');
        applyEffect(we.reward);
        notices.push({ title: '🌍 风波已平', lines: ['你平息了江湖风波【' + we.name + '】！', '奖励：' + rewardText(we.reward) + '。'] });
        // 中下等概率在大事件中夺得江湖功法秘籍
        if (rndf() < 0.12) {
          const pool = TECHS.filter((t) => !t.sect && !p.techniques.some((x) => x.id === t.id));
          if (pool.length) {
            const tech = pick(pool);
            addTechnique(tech.id);
            log('📜 你在混战中夺得一本功法秘籍，参悟后习得【' + tech.name + '】！', 'level');
            notices.push({ title: '📜 夺得功法 · ' + tech.name, lines: ['你在江湖风波中夺得一本秘籍。', '参悟后习得【' + tech.name + '】。'] });
          }
        }
      } catch (err) {
        // 世界事件奖励结算偶发异常：兜底恢复，避免卡死在结算；并把根因打到控制台
        S.pendingWorldEvent = null;
        try { console.error('[victory] 世界事件奖励结算异常：', err); } catch (_e) {}
        log('⚠ 风波奖励结算出现异常，已自动恢复（按 F12 打开控制台可查看具体报错）。', 'danger');
      }
    }
    if (e.id === 'final_boss') gameClear();
    p.hp = clamp(p.hp, 1, p.hpMax);
    recalc(); checkAchievements(); save();
    closeCard();
    screen('explore');
    showNoticeChain(notices);
  }

  function defeat() {
    if (!S.combat) return;
    const p = S.player, e = S.combat.enemy;
    S.combat = null;
    const wasRankFight = S.rankFight; S.rankFight = false;
    let rivalLost = null;
    if (S.rivalFight) { S.rivalFight = false; if (S.rival) { const r = S.rival; r.playerLosses++; r.playerWins = 0; r.level = clamp(r.level + 1, 1, p.level + 1); p.rivalCooldown = rnd(14, 22); rivalLost = r; } }
    S.pendingWorldEvent = null;
    const lostGold = round(p.gold * 0.15); p.gold -= lostGold;
    p.hp = round(p.hpMax * 0.3); p.mp = round(p.mpMax * 0.3);
    p.reputation = clamp(p.reputation - 5, -1999, 1999);
    settle('💀 你败给了【' + e.name + '】……', 'danger');
    if ((e.tier === 'boss' || e.tier === 'elite') && !wasRankFight) {
      settle('　' + e.name + ' 冷冷道：' + mockLine(), 'dim');
      if (!p.revenge.some((r) => r.id === e.id)) p.revenge.push({ id: e.id, name: e.name });
      settle('　【憋屈】' + e.name + ' 已列入复仇名单（攻击/防御暂时受挫，击败它即可雪耻）。', 'danger');
    }
    settle('　你狼狈退走，损失 ' + lostGold + ' 两，只剩三成状态', 'dim');
    settle('（留得青山在，不怕没柴烧。）', 'hint');
    const region = regionById(S.location.region);
    const safe = region.locs.find((l) => l.type === 'rest') || region.locs[0];
    S.location.loc = safe.id;
    recalc(); save();
    closeCard();
    screen('explore');
    if (rivalLost) {
      showNotice('💀 宿敌羞辱', [
        { html: '<span class="hl">' + esc(rivalLost.name) + '</span> 踩着你，仰天狂笑。', cls: '' },
        '「就这点本事，也配与我为敌？」',
        { html: '【' + esc(rivalLost.name) + '】已列入复仇名单——雪耻之日，加倍奉还。', cls: 'danger' }
      ], [{ text: '😤 此仇必报', cls: 'primary' }]);
    }
  }
  function mockLine() {
    return pick(['「就这点本事，也敢闯江湖？」', '「回去再练十年吧，废物。」', '「啧啧，我奶奶都比你强。」', '「快滚，别脏了我的刀。」', '「江湖险恶，你还是回家种田吧。」', '「今日留你一命，改日记得来送死。」']);
  }
  function endCombat() { S.combat = null; closeCard(); save(); screen('explore'); }

  function screenCombatItem() {
    const items = S.player.inventory.filter((x) => !x.weapon && itemById(x.id) && itemById(x.id).type === 'hp');
    log('选择要用的药：', 'hint');
    setActions([...items.map((x) => ({ label: x.qty + ' × ' + itemById(x.id).name, fn: () => useInCombat(x.id) })), { label: '← 返回', fn: () => { screen('combat'); } }]);
  }
  function useInCombat(id) {
    if (!S.combat) return;
    const p = S.player, it = itemById(id);
    const x = p.inventory.find((z) => z.id === id && !z.weapon);
    if (!x || x.qty <= 0) { screen('combatItem'); return; }
    p.hp = clamp(p.hp + it.value, 1, p.hpMax); x.qty--; if (x.qty <= 0) p.inventory = p.inventory.filter((z) => z !== x);
    log('你用了一瓶【' + it.name + '】，气血 +' + it.value + '。', 'good');
    renderHUD(); enemyTurn();
  }

  function gameClear() {
    S.player.flags.cleared = true;
    log('🌅 你击败了【魔尊·万世劫】！', 'level');
    log('　魔云散尽，天下太平。你的名字将被传唱千年。', 'good');
    log('—— 恭喜通关《山河一梦》！——', 'title');
    log('（可继续刷怪、刷装备、刷满天赋，直到天荒地老。）', 'hint');
  }

  // ============================================================
  //  屏幕：背包 / 装备 / 用药
  // ============================================================
  function screenBag() {
    const p = S.player;
    log('🧳 背包（钱 ' + p.gold + '）', 'title');
    log('— 已装备 —', 'hint');
    const w = p.equipped.weapon;
    if (w) logHover('　武器：' + qName(w) + '（' + w.qualityName + ' · ' + gearStatLine(w, true) + '）', '', weaponTip(w));
    else log('　武器：（无）', '');
    for (const slot of ARMOR_SLOTS) {
      const a = p.equipped[slot.id];
      if (a) logHover('　' + slot.name + '：' + qName(a) + '（' + a.qualityName + ' · ' + gearStatLine(a, false) + '）', '', armorTip(a));
      else log('　' + slot.name + '：（无）', '');
    }
    const weapons = p.inventory.filter((x) => x.weapon);
    const armors = p.inventory.filter((x) => x.armor);
    const items = p.inventory.filter((x) => !x.weapon && !x.armor);
    if (weapons.length) { log('— 武器 —', 'hint'); weapons.forEach((x, i) => { logHover('　' + (i + 1) + '. ' + qName(x.weapon) + '（' + x.weapon.qualityName + ' · ' + gearStatLine(x.weapon, true) + '）', '', weaponTip(x.weapon)); }); }
    if (armors.length) { log('— 防具 —', 'hint'); armors.forEach((x) => logHover('　· ' + qName(x.armor) + '（' + x.armor.slotName + ' · ' + x.armor.qualityName + ' · ' + gearStatLine(x.armor, false) + '）', '', armorTip(x.armor))); }
    if (items.length) { log('— 物品 —', 'hint'); items.forEach((x) => { const it = itemById(x.id); if (it) logHover('　· ' + esc(it.name) + ' × ' + x.qty, '', itemTip(it)); }); }
    const btns = [];
    if (weapons.length || armors.length) btns.push({ label: '🛡 装备/更换装备', fn: screenEquip });
    btns.push({ label: '📜 功法装备（' + (p.equippedTechs || []).length + '/5）', fn: screenTechEquip });
    if (items.some((x) => itemById(x.id) && itemById(x.id).type === 'hp')) btns.push({ label: '🧪 使用回血物品', fn: () => screen('useitem') });
    btns.push({ label: '← 返回', fn: () => screen('explore') });
    setActions(btns);
  }
  function activeSetInfo() {
    const p = S.player;
    const cnt = {};
    for (const slot of ['head', 'body', 'hand', 'leg', 'foot']) { const a = p.equipped[slot]; if (a && a.set) cnt[a.set] = (cnt[a.set] || 0) + 1; }
    for (const setId in cnt) if (cnt[setId] >= 5) { const st = SETS.find((x) => x.id === setId); if (st) return st; }
    return null;
  }
  function screenEquip() {
    const p = S.player;
    const w = p.equipped.weapon;
    const choices = [{ text: '🗡 武器（' + (w ? w.name + ' · ' + w.qualityName + ' · ' + gearStatLine(w, true) : '空') + '）', cls: w ? ('qc-' + w.quality) : '', fn: () => equipSlotModal('weapon') }];
    for (const slot of ARMOR_SLOTS) {
      const a = p.equipped[slot.id];
      choices.push({ text: '🛡 ' + slot.name + '（' + (a ? a.name + ' · ' + a.qualityName + ' · ' + gearStatLine(a, false) : '空') + '）', cls: a ? ('qc-' + a.quality) : '', fn: () => equipSlotModal(slot.id) });
    }
    choices.push({ text: '✔ 完成', cls: 'primary', fn: () => { recalc(); save(); screen('bag'); } });
    const lines = ['选择要更换的部位：'];
    const activeSet = activeSetInfo();
    if (activeSet) lines.push({ html: '<span class="hl">✨ 套装效果已激活：【' + esc(activeSet.name) + '】' + esc(activeSet.desc) + '</span>', cls: '' });
    showNotice('🛡 装备 / 更换', lines, choices);
  }
  function equipSlotModal(slotId) {
    const p = S.player;
    const isWeapon = slotId === 'weapon';
    const slotName = isWeapon ? '武器' : (ARMOR_SLOTS.find((s) => s.id === slotId) || {}).name;
    const list = isWeapon ? p.inventory.filter((x) => x.weapon) : p.inventory.filter((x) => x.armor && x.armor.slot === slotId);
    const lines = [];
    if (!list.length) lines.push('（背包里没有可装备的' + slotName + '）');
    const choices = list.map((x) => {
      const it = isWeapon ? x.weapon : x.armor;
      return { text: it.name + '（' + it.qualityName + ' · ' + gearStatLine(it, isWeapon) + '）', cls: 'qc-' + (it.quality || 'hui'), fn: () => equipConfirmModal(slotId, x) };
    });
    choices.push({ text: '← 返回', fn: () => screenEquip() });
    showNotice('🛡 选择' + slotName, lines, choices);
  }
  function equipConfirmModal(slotId, x) {
    const p = S.player;
    const isWeapon = slotId === 'weapon';
    const it = isWeapon ? x.weapon : x.armor;
    const cur = p.equipped[slotId];
    const slotName = isWeapon ? '武器' : (ARMOR_SLOTS.find((s) => s.id === slotId) || {}).name;
    const lines = [{ html: '新装备：' + qName(it) + '（' + it.qualityName + '）', cls: '' }];
    lines.push('　' + gearStatLine(it, isWeapon));
    if (cur) {
      lines.push({ html: '将替换：' + qName(cur) + '（' + cur.qualityName + '）', cls: '' });
      lines.push('　' + gearStatLine(cur, isWeapon));
      lines.push('（被替换的装备会回到背包）');
    } else {
      lines.push('当前该部位为空。');
    }
    showNotice('🔁 替换' + slotName + '？', lines, [
      { text: '✔ 替换装备', cls: 'primary', fn: () => doEquip(slotId, x, it) },
      { text: '取消', fn: () => equipSlotModal(slotId) }
    ]);
  }
  function doEquip(slotId, x, it) {
    const p = S.player;
    const isWeapon = slotId === 'weapon';
    const cur = p.equipped[slotId];
    p.equipped[slotId] = it;
    p.inventory = p.inventory.filter((z) => z !== x);
    if (cur) p.inventory.push(isWeapon ? { id: cur.id, weapon: cur } : { id: cur.id, armor: cur });
    log('已装备【' + it.name + '】' + (cur ? '，换下【' + cur.name + '】。' : '。'), 'good');
    recalc(); save();
    screenEquip();   // 回到部位选择，可连续装备，点「完成」退出
  }
  function screenUseItem() {
    const items = S.player.inventory.filter((x) => !x.weapon && itemById(x.id) && itemById(x.id).type === 'hp');
    log('选择要用的药（鼠标悬停可查看作用）：', 'hint');
    setActions([...items.map((x) => ({ label: x.qty + ' × ' + itemById(x.id).name, tip: itemTip(itemById(x.id)), fn: () => useConsumable(x.id) })), { label: '← 返回', fn: () => screen('bag') }]);
  }
  function useConsumable(id) {
    const p = S.player, it = itemById(id);
    const x = p.inventory.find((z) => z.id === id && !z.weapon);
    if (!x || x.qty <= 0) return;
    p.hp = clamp(p.hp + it.value, 1, p.hpMax); x.qty--; if (x.qty <= 0) p.inventory = p.inventory.filter((z) => z !== x);
    log('你使用了【' + it.name + '】，气血 +' + it.value + '。', 'good');
    recalc(); save(); screen('bag');
  }

  // ============================================================
  //  屏幕：人物
  // ============================================================
  function screenChar() {
    const p = S.player, s = p.stats;
    log('👤 ' + esc(p.name) + ' · ' + p.level + ' 级 · ' + (p.sect ? sectById(p.sect).name : '散修'), 'title');
    log('称号：' + playerTitle(p) + (p.sect ? '' : '（' + roguePerkText(p) + '）'), 'good');
    log('气血 ' + round(p.hp) + '/' + p.hpMax + ' · 内力 ' + round(p.mp) + '/' + p.mpMax, '');
    log('攻击 ' + s.atk + ' · 防御 ' + s.def + ' · 身法 ' + s.spd, '');
    log('暴击 ' + (s.crit * 100).toFixed(1) + '% · 暴伤 ' + (s.critDmg * 100).toFixed(0) + '% · 闪避 ' + (s.dodge * 100).toFixed(1) + '%', 'dim');
    log('吸血 ' + (s.lifeSteal * 100).toFixed(0) + '% · 反伤 ' + (s.thorn * 100).toFixed(0) + '% · 连击 ' + (s.combo * 100).toFixed(0) + '%', 'dim');
    log('天赋点 ' + p.talentPoints + ' · 击杀 ' + p.kills + ' · Boss ' + p.bosses, 'dim');
    const _repTier = reputationTierCapped(p.reputation, p.level);
    log('善恶：' + moralityForm(p.morality) + '（' + p.morality + '）　声望：' + _repTier + '（' + p.reputation + '）' + (_repTier !== reputationTier(p.reputation) ? ' · 受等级所限' : ''), 'good');
    log('— 心性 —', 'hint');
    PERSONALITY_DIMS.forEach((d) => {
      log('　' + d.desc + '：' + personalityLabel(d.id, p.personality[d.id]), '');
    });
    log('⚔ 武器熟练度（用武器普攻/击杀可提升）：', 'hint');
    for (const wt of WEAPON_TYPES) {
      const lv = weaponProfLevel(p, wt.id);
      const exp = (p.weaponProf && p.weaponProf[wt.id]) || 0;
      log('　' + wt.name + '：' + lv.name + '（' + exp + '）· 加成：' + weaponProfBonusText(wt.id), 'dim');
    }
    if (p.revenge.length) { log('🔥 复仇名单：', 'danger'); p.revenge.forEach((r) => log('　· ' + r.name, 'dim')); }
    if (S.rival) { const r = S.rival; log('⚔ 宿敌：' + r.name + '（' + r.level + ' 级 · 五行' + elementName(r.element) + ' · 胜 ' + r.playerWins + ' / 负 ' + r.playerLosses + '）', 'danger'); }
    if (S.worldEvent) log('🌍 当前江湖大事：【' + S.worldEvent.name + '】剩 ' + S.worldEvent.turns + ' 次行动。', 'event');
    log('🏆 成就：' + S.achievements.length + '/' + ACHIEVEMENTS.length, 'good');
    const titles = earnedTitles(p);
    log('📛 已获称号（' + titles.length + '）：' + titles.join('、'), 'dim');
    setActions([
      { label: '🔁 切换五行（当前·' + elementName(p.activeElement || p.element) + '）', fn: () => { cycleElement(); screen('char'); } },
      { label: '🏆 查看成就', fn: () => screen('achievements') },
      { label: '← 返回', fn: () => screen('explore') }
    ]);
  }

  // ============================================================
  //  屏幕：境界
  // ============================================================
  function screenRealm() {
    const p = S.player;
    const r = REALMS[p.realm];
    log('🌀 境界', 'title');
    log('当前：' + r.major + ' · ' + r.minor + '（' + (p.realm + 1) + '/' + REALMS.length + '）', 'good');
    log('境界加成：气血/攻击/防御 × ' + r.statMult.toFixed(2), 'dim');
    if (p.realm < REALMS.length - 1) {
      const nr = REALMS[p.realm + 1];
      log('下一境：' + nr.major + ' · ' + nr.minor + '（需 ' + nr.levelReq + ' 级）', '');
      const can = p.level >= nr.levelReq;
      setActions(can
        ? [{ label: '⚡ 突破！', fn: doBreakthrough, cls: 'primary' }, { label: '← 返回', fn: () => screen('explore') }]
        : [{ label: '（等级不足，当前 ' + p.level + ' 级）', disabled: true }, { label: '← 返回', fn: () => screen('explore') }]);
    } else {
      log('你已臻至【破碎虚空】，前无古人。', 'level');
      setActions([{ label: '← 返回', fn: () => screen('explore') }]);
    }
  }
  function doBreakthrough() {
    const p = S.player;
    const nr = REALMS[p.realm + 1];
    if (p.level < nr.levelReq) { log('等级不足！', 'danger'); return; }
    p.realm++;
    p.hp = p.hpMax; p.mp = p.mpMax;
    recalc();
    const prevMajor = REALMS[p.realm - 1] ? REALMS[p.realm - 1].major : null;
    if (nr.major !== prevMajor) recordChronicle('realm_' + nr.major, '突破至【' + nr.major + '】');
    logCard('up', '⚡ 突破 · ' + nr.major + ' · ' + nr.minor);
    const poem = REALM_POEM[p.realm];
    if (poem) appendLog('　' + poem, 'poem');
    appendLog('气冲斗牛，天地为之色变！你已臻至【' + nr.major + ' · ' + nr.minor + '】，实力大增。', 'level');
    closeCard();
    save(); screen('realm');
  }

  // ============================================================
  //  屏幕：功法
  // ============================================================
  function screenTech() {
    const p = S.player;
    log('📜 功法', 'title');
    p.techniques.forEach((t) => {
      const tech = techById(t.id);
      if (!tech) return;
      log('· ' + tech.name + '（' + tech.type + '）Lv.' + t.level + '　' + tech.desc, '');
      log('　　被动加成：' + bonusText(techPassive(tech.passive, t.level)), 'good');
      tech.skills.forEach((sk) => {
        if (sk.mp > 0) log('　　【' + sk.name + '】耗 ' + sk.mp + ' 内力 · 伤害：攻击×' + sk.mult + (sk.element ? '（' + elementName(sk.element) + '）' : '') + '　' + sk.desc, 'dim');
      });
    });
    const btns = [];
    if (p.sect) btns.push({ label: '🎓 向' + sectById(p.sect).name + '求教', fn: () => screen('learn') });
    btns.push({ label: '🛠 修炼功法', fn: () => screen('cultivate') });
    btns.push({ label: '← 返回', fn: () => screen('explore') });
    setActions(btns);
  }
  function addTechnique(id) {
    const p = S.player;
    p.equippedTechs = p.equippedTechs || [];
    if (p.techniques.some((t) => t.id === id)) return false;
    p.techniques.push({ id, level: 1 });
    if (p.equippedTechs.length < 5 && !p.equippedTechs.includes(id)) p.equippedTechs.push(id);
    return true;
  }
  function screenTechEquip() {
    const p = S.player;
    p.equippedTechs = p.equippedTechs || [];
    log('📜 功法装备（' + p.equippedTechs.length + '/5）', 'title');
    log('已装备的功法才生效（被动加成 + 可施展招式）。', 'hint');
    const btns = [];
    p.techniques.forEach((t) => {
      const tech = techById(t.id);
      if (!tech) return;
      const on = p.equippedTechs.includes(t.id);
      btns.push({
        label: (on ? '✅ ' : '⬜ ') + tech.name + ' Lv.' + t.level + (on ? '（已装备）' : ''),
        cls: on ? 'primary' : '',
        fn: () => {
          if (on) { p.equippedTechs = p.equippedTechs.filter((x) => x !== t.id); }
          else { if (p.equippedTechs.length >= 5) { log('最多只能装备 5 门功法。', 'danger'); screenTechEquip(); return; } p.equippedTechs.push(t.id); }
          recalc(); save(); screenTechEquip();
        }
      });
    });
    if (!btns.length) log('（还没有学会任何功法）', 'dim');
    btns.push({ label: '← 返回', fn: () => screen('bag') });
    setActions(btns);
  }
  const techCost = (tech) => 50 + (TECHS.indexOf(tech) % 5) * 30;
  function screenLearn() {
    const p = S.player;
    const learned = p.techniques.map((t) => t.id);
    const sectTechs = TECHS.filter((t) => t.sect === p.sect && !learned.includes(t.id));
    log('向师门求教（需门派贡献，高阶功法需职位）：', 'hint');
    if (!sectTechs.length) log('（已学完本门功法）', 'dim');
    setActions([...sectTechs.map((t) => {
      const needRank = t.rankReq || 0;
      const locked = p.sectRank < needRank;
      return { label: t.name + (locked ? '（需职位·' + sectById(p.sect).ranks[needRank] + '）' : '（' + techCost(t) + ' 贡献）'), disabled: locked, fn: () => learnTech(t.id) };
    }), { label: '← 返回', fn: () => screen('tech') }]);
  }
  function learnTech(id) {
    const p = S.player, tech = techById(id), cost = techCost(tech);
    const needRank = tech.rankReq || 0;
    if (p.sectRank < needRank) { log('你的职位还不够，需晋升为【' + sectById(p.sect).ranks[needRank] + '】才能修习此功。', 'danger'); screen('tech'); return; }
    if (p.sectContribution < cost) { log('门派贡献不足！', 'danger'); screen('tech'); return; }
    p.sectContribution -= cost; addTechnique(id);
    log('你学会了【' + tech.name + '】！', 'good');
    recalc(); save(); screen('tech');
  }
  function screenCultivate() {
    log('选择要修炼的功法：', 'hint');
    setActions([...S.player.techniques.map((t) => {
      const tech = techById(t.id);
      if (t.level >= TECH_MAX_LEVEL) return { label: tech.name + ' Lv.' + t.level + '（已满级）', disabled: true };
      const cost = techCultivateCost(t.level);
      return { label: tech.name + ' Lv.' + t.level + '→' + (t.level + 1) + '（' + cost + ' 两）', fn: () => cultivate(t.id) };
    }), { label: '← 返回', fn: () => screen('tech') }]);
  }
  function cultivate(id) {
    const p = S.player, t = p.techniques.find((x) => x.id === id);
    if (t.level >= TECH_MAX_LEVEL) { log('此功法已臻至圆满。', 'good'); screen('tech'); return; }
    const cost = techCultivateCost(t.level);
    if (p.gold < cost) { log('银子不够！', 'danger'); screen('tech'); return; }
    const tech = techById(id);
    const beforeStats = { ...p.stats };
    const beforeBonus = bonusText(techPassive(tech.passive, t.level));
    p.gold -= cost; t.level++;
    recalc();
    const afterBonus = bonusText(techPassive(tech.passive, t.level));
    log('你勤修苦练，【' + tech.name + '】提升至 Lv.' + t.level + '。', 'good');
    log('　被动加成：' + beforeBonus + '　→　' + afterBonus, 'good');
    const label = { atk: '攻击', def: '防御', hpMax: '气血', mpMax: '内力', spd: '身法', crit: '暴击' };
    let changed = false;
    for (const k in label) {
      const b = Math.round(beforeStats[k]), a = Math.round(p.stats[k]);
      if (a !== b) { log('　　' + label[k] + '：' + b + ' → ' + a, 'dim'); changed = true; }
    }
    if (!changed) log('　（本次升级未直接影响面板属性）', 'dim');
    save(); screen('tech');
  }

  // ============================================================
  //  屏幕：天赋
  // ============================================================
  function screenTalent() {
    const p = S.player;
    log('🌟 天赋树（天赋点 ' + p.talentPoints + '）', 'title');
    if (S.talentBranch) { renderTalentBranch(S.talentBranch); return; }
    log('选择一个分支：', 'hint');
    setActions([...TALENT_BRANCHES.map((br) => ({ label: br.icon + ' ' + br.name + ' — ' + br.desc, fn: () => { S.talentBranch = br.id; screen('talent'); } })), { label: '← 返回', fn: () => screen('explore') }]);
  }
  function renderTalentBranch(branchId) {
    const p = S.player, br = TALENT_BRANCHES.find((b) => b.id === branchId);
    log(br.icon + ' ' + br.name + ' 分支', 'title');
    setActions([...br.nodes.map((n) => {
      const cur = p.talents[n.id] || 0;
      const idx = br.nodes.indexOf(n);
      const unlocked = idx === 0 || (p.talents[br.nodes[idx - 1].id] || 0) > 0;
      const can = !(cur >= n.max) && unlocked && p.talentPoints > 0;
      return { label: n.name + ' Lv.' + cur + '/' + n.max + '　' + n.desc + (cur >= n.max ? '（满）' : ''), fn: () => buyTalent(n.id), disabled: !can, hint: n.desc };
    }), { label: '← 返回分支列表', fn: () => { S.talentBranch = null; screen('talent'); } }]);
  }
  function buyTalent(nodeId) {
    const p = S.player, n = findTalentNode(nodeId), br = branchOf(nodeId), idx = br.nodes.indexOf(n);
    if (idx > 0 && !(p.talents[br.nodes[idx - 1].id] || 0)) { log('需先点亮上一节点！', 'danger'); return; }
    if (p.talentPoints <= 0) { log('天赋点不足！', 'danger'); return; }
    if ((p.talents[nodeId] || 0) >= n.max) { log('已点满！', 'danger'); return; }
    p.talents[nodeId] = (p.talents[nodeId] || 0) + 1; p.talentPoints--;
    log('你点亮【' + n.name + '】Lv.' + p.talents[nodeId] + '。', 'good');
    recalc(); save(); screen('talent');
  }

  // ============================================================
  //  屏幕：门派
  // ============================================================
  function screenSect() {
    const p = S.player;
    log('🏯 师门', 'title');
    if (!p.sect) { log('你如今是散修——无门无派，天地为家，来去自如。', 'title'); log('当前称号：' + rogueTitle(p) + '（' + roguePerkText(p) + '）', 'good'); log('称号属性加成随大境界进阶（奇遇率提升为散修固有）：', 'hint'); ROGUE_TITLES.forEach((t, i) => { const cur = rogueIndex(p) === i; log('　' + (cur ? '▶' : '·') + ' ' + t.name + '　' + bonusText(t.bonus) + (cur ? '（当前）' : ''), cur ? 'good' : 'dim'); }); log('加入门派可获得专属功法与职位晋升。', 'dim'); setActions([...SECTS.map((s) => ({ label: s.name + '（' + elementName(s.element) + '）', fn: () => joinSect(s.id), hint: s.desc })), { label: '← 返回', fn: () => screen('explore') }]); return; }
    const s = sectById(p.sect);
    log('所属：' + s.name + ' · 职位：' + s.ranks[p.sectRank] + ' · 贡献：' + p.sectContribution + ' · 已完成任务 ' + (p.sectTasksDone || 0) + ' 个', 'good');
    log(s.desc, 'dim');
    let promoteBtn;
    if (p.sectRank >= s.ranks.length - 1) {
      promoteBtn = { label: '🔝 已是【' + s.ranks[p.sectRank] + '】', disabled: true };
    } else {
      const needCont = (p.sectRank + 1) * 150;
      const needTasks = (p.sectRank + 1) * 2;
      const levelReq = SECT_RANK_LEVELS[p.sectRank + 1] || 0;
      promoteBtn = { label: '⬆ 晋升为【' + s.ranks[p.sectRank + 1] + '】（等级 ' + p.level + '/' + levelReq + ' · 贡献 ' + p.sectContribution + '/' + needCont + ' · 任务 ' + (p.sectTasksDone || 0) + '/' + needTasks + '）', fn: sectPromote };
    }
    setActions([{ label: '📜 师门任务', fn: () => screen('sectTask') }, promoteBtn, { label: '🚪 退出师门', fn: leaveSectConfirm }, { label: '← 返回', fn: () => screen('explore') }]);
  }
  function joinSect(id) {
    const p = S.player, s = sectById(id);
    p.sect = id; p.sectRank = 0; p.sectContribution = 0;
    if (s.startTech && !p.techniques.some((t) => t.id === s.startTech)) addTechnique(s.startTech);
    log('你拜入【' + s.name + '】！', 'good');
    log(s.joke, 'dim');
    log('习得入门功法【' + techById(s.startTech).name + '】。', 'good');
    recalc(); save(); screen('sect');
  }
  const sectTaskById = (id) => SECT_TASKS.find((t) => t.id === id);
  function screenSectTask() {
    const p = S.player;
    if (S.sectTask) {
      const t = sectTaskById(S.sectTask.id);
      if (!t) { S.sectTask = null; screenSectTask(); return; }
      log('📜 师门任务', 'title');
      log('进行中：' + t.name, 'good');
      log('　' + t.desc, 'dim');
      log('　进度：' + S.sectTask.progress + '/' + t.count, 'hint');
      log('　奖励：贡献 +' + t.contrib + ' · ' + rewardText(t.reward), 'dim');
      setActions([{ label: '❌ 放弃任务', fn: () => { S.sectTask = null; log('你放弃了师门任务。', 'dim'); save(); screen('sectTask'); } }, { label: '← 返回', fn: () => screen('sect') }]);
      return;
    }
    const available = SECT_TASKS.filter((t) => t.minRank <= p.sectRank);
    log('📜 师门任务（完成得贡献，用于学功法、晋职）', 'title');
    log('　当前职位：' + sectById(p.sect).ranks[p.sectRank] + ' · 已完成任务 ' + (p.sectTasksDone || 0) + ' 个', 'dim');
    if (!available.length) log('（当前职位无可接任务）', 'dim');
    setActions([...available.map((t) => ({ label: t.name + '（贡献 +' + t.contrib + '）', hint: t.desc + '　奖励：' + rewardText(t.reward), fn: () => acceptSectTask(t.id) })), { label: '← 返回', fn: () => screen('sect') }]);
  }
  function acceptSectTask(id) {
    const t = sectTaskById(id);
    if (!t) return;
    if (S.sectTask) { log('你已有进行中的师门任务。', 'danger'); screen('sectTask'); return; }
    S.sectTask = { id, progress: 0 };
    log('你接下师门任务【' + t.name + '】。', 'good');
    log('　' + t.desc, 'dim');
    save(); screen('sectTask');
  }
  function completeSectTask(notices) {
    const t = sectTaskById(S.sectTask.id);
    const p = S.player;
    S.sectTask = null;
    p.sectContribution += t.contrib;
    p.sectTasksDone = (p.sectTasksDone || 0) + 1;
    log('✔ 师门任务完成：【' + t.name + '】！', 'level');
    log('　贡献 +' + t.contrib + ' · 奖励：' + rewardText(t.reward), 'good');
    applyEffect(t.reward);
    save();
    const lines = ['你完成了师门任务【' + t.name + '】。', '贡献 +' + t.contrib + ' · 奖励：' + rewardText(t.reward)];
    if (notices) notices.push({ title: '📜 师门任务完成', lines });
    else showNotice('📜 师门任务完成', lines, [{ text: '✔ 太好了', cls: 'primary' }]);
  }
  function checkSectTaskKill(enemyId, notices) {
    if (!S.sectTask) return;
    const t = sectTaskById(S.sectTask.id);
    if (!t) { S.sectTask = null; return; }
    if ((t.type === 'kill' || t.type === 'boss') && t.target === enemyId) {
      S.sectTask.progress++;
      if (S.sectTask.progress >= t.count) completeSectTask(notices);
      else log('　师门任务进度：' + S.sectTask.progress + '/' + t.count, 'hint');
    }
  }
  function checkSectTaskTravel(regionId) {
    if (!S.sectTask) return;
    const t = sectTaskById(S.sectTask.id);
    if (!t) { S.sectTask = null; return; }
    if (t.type === 'travel' && t.target === regionId) {
      S.sectTask.progress++;
      if (S.sectTask.progress >= t.count) completeSectTask();
      else log('　师门任务进度：' + S.sectTask.progress + '/' + t.count, 'hint');
    }
  }
  function sectPromote() {
    const p = S.player, s = sectById(p.sect);
    const need = (p.sectRank + 1) * 150;
    const needTasks = (p.sectRank + 1) * 2;
    const levelReq = SECT_RANK_LEVELS[p.sectRank + 1] || 0;
    if (p.sectRank >= s.ranks.length - 1) { log('你已位极人臣。', 'good'); screen('sect'); return; }
    if (p.level < levelReq) { log('晋升需达到 ' + levelReq + ' 级（当前 ' + p.level + ' 级），先去江湖历练吧。', 'danger'); screen('sect'); return; }
    if (p.sectContribution < need || (p.sectTasksDone || 0) < needTasks) {
      log('晋升需贡献 ' + need + '（当前 ' + p.sectContribution + '）且完成 ' + needTasks + ' 个师门任务（当前 ' + (p.sectTasksDone || 0) + '）。', 'danger');
      screen('sect'); return;
    }
    p.sectContribution -= need; p.sectRank++;
    log('你晋升为【' + s.ranks[p.sectRank] + '】！属性加成提升。', 'level');
    recalc(); save(); screen('sect');
  }
  // 特殊晋升：核心弟子级 + 同门历练 1000 回合，触发「破格提拔长老」剧情
  function trySectElderEvent() {
    const p = S.player;
    if (!p.sect || p.sectElderOffered) return false;
    const s = sectById(p.sect);
    const elderRank = s.ranks.length - 2;
    if (p.sectRank !== elderRank - 1) return false;
    if ((p.sectTurns || 0) < 1000) return false;
    const elderLevelReq = SECT_RANK_LEVELS[elderRank] || 0;
    if (p.level < elderLevelReq) return false;
    p.sectElderOffered = true;
    showNotice('🏯 宗门的暗流', [
      '近日江湖暗流涌动，宗门似在暗中遴选栋梁，以备来日之劫。',
      '你入我门已久，历经千般历练，掌门与诸位长老私下议定，欲破格擢升你为【' + s.ranks[elderRank] + '】。',
      '长老之位，是荣耀，亦是千钧重担。你可愿担起？'
    ], [
      { text: '愿为宗门分忧', cls: 'primary', fn: () => { p.sectRank = elderRank; p.reputation = clamp(p.reputation + 30, -1999, 1999); log('🏯 你被破格擢升为【' + s.ranks[elderRank] + '】！', 'level'); log('　长老会密授你一事，声望大涨。', 'good'); recalc(); save(); screen('sect'); } },
      { text: '婉拒，暂不出头', fn: () => { log('你以历练不足为由婉拒。掌门叹道：「既如此，再等些时日罢。」', 'dim'); save(); screen('explore'); } }
    ]);
    return true;
  }
  function leaveSectConfirm() {
    const s = sectById(S.player.sect);
    showNotice('🚪 退出师门', ['你确定要退出【' + s.name + '】吗？', '退出后恢复散修之身，门派加成与职位消失，声望 -10。', '（已习得的本门功法会保留）'], [
      { text: '✔ 确定退出', cls: 'primary', fn: leaveSect },
      { text: '再想想', fn: () => screen('sect') }
    ]);
  }
  function leaveSect() {
    const p = S.player;
    const s = sectById(p.sect);
    log('你退出了【' + s.name + '】，从此恢复散修之身。', 'dim');
    p.sect = null; p.sectRank = 0; p.sectContribution = 0; p.sectTurns = 0; p.sectElderOffered = false; S.sectTask = null;
    p.reputation = clamp(p.reputation - 10, -1999, 1999);
    log('　声望 -10。', 'danger');
    recalc(); save(); screen('sect');
  }

  // ============================================================
  //  屏幕：情侣
  // ============================================================
  function screenLover() {
    const p = S.player;
    log('💞 红颜知己', 'title');
    const met = Object.keys(p.redyan);
    if (!met.length) { log('你尚未结识有缘人。（缘分会在江湖中不期而至）', 'dim'); setActions([{ label: '← 返回', fn: () => screen('explore') }]); return; }
    log('选择一位红颜：', 'hint');
    const btns = met.map((id) => {
      const lv = loverById(id), r = p.redyan[id];
      if (!lv || !r) return null;
      return { label: lv.name + '　' + lv.title + '　好感 ' + r.affection + '/100　' + statusLabel(r.status), fn: () => screenLoverDetail(id), cls: r.status === 'redyan' ? 'primary' : '' };
    }).filter(Boolean);
    btns.push({ label: '← 返回', fn: () => screen('explore') });
    setActions(btns);
  }
  function screenLoverDetail(id) {
    const lv = loverById(id), r = S.player.redyan[id];
    if (!lv || !r) { screen('lover'); return; }
    logHTML('<div class="lover-portrait">' + loverPortrait(lv, 48) + '<span>' + esc(lv.name) + '　' + esc(lv.title) + '</span></div>', '');
    log(lv.desc, 'dim');
    log('好感度：' + r.affection + '/100　' + statusLabel(r.status), r.status === 'redyan' ? 'good' : '');
    if (r.status === 'redyan') { log('　红颜加成：' + bonusText(lv.bonus), 'good'); if (r.token) log('　定情信物：' + r.token, 'dim'); }
    else if (r.status === 'met') log('　结为红颜可获得：' + bonusText(lv.bonus), 'dim');
    const btns = [];
    if (r.status === 'met') {
      btns.push({ label: '🎁 送礼', fn: () => screenGift(id) });
      btns.push({ label: '🌙 约会（20 两）', fn: () => doDate(id) });
      if (r.affection >= 100) btns.push({ label: '❤ 告白', fn: () => confessLover(id), cls: 'primary' });
    } else {
      btns.push({ label: '🎁 送礼', fn: () => screenGift(id) });
      if (r.status === 'redyan') btns.push({ label: '🌙 约会（20 两）', fn: () => doDate(id) });
    }
    btns.push({ label: '← 返回红颜列表', fn: () => screen('lover') });
    setActions(btns);
  }
  const statusLabel = (s) => s === 'redyan' ? '❤ 红颜' : s === 'friend' ? '知己' : '相识';
  const BONUS_LABEL = { atk: '攻击', def: '防御', hp: '气血', mp: '内力', spd: '身法', crit: '暴击', critDmg: '暴伤', dodge: '闪避', lifeSteal: '吸血', thorn: '反伤', combo: '连击', pierce: '破甲', expBonus: '经验', goldBonus: '金钱', dropBonus: '掉落', hpRegen: '气血回复', mpRegen: '内力回复' };
  function bonusText(bonus) {
    const parts = [];
    for (const k in bonus) { const label = BONUS_LABEL[k] || k; parts.push(label + '+' + Math.round(bonus[k] * 100) + '%'); }
    return parts.join('、');
  }
  function affixEffects(it) {
    const parts = [];
    for (const a of (it.affixes || [])) { if (a.per) parts.push(bonusText(a.per)); else if (a.element) parts.push('五行·' + elementName(a.element)); }
    return parts;
  }
  function gearStatLine(it, isWeapon) {
    const fx = affixEffects(it);
    const base = isWeapon ? ('攻 ' + it.atk) : ('防 ' + it.def + ' · 血 ' + it.hp);
    return base + (fx.length ? ' · ' + fx.join(' · ') : '');
  }
  function loverEligible(l) {
    if (!l.meetReq) return true;
    const p = S.player, per = p.personality, r = l.meetReq;
    if (r.level && p.level < r.level) return false;
    if (r.mingMin != null && per.ming < r.mingMin) return false;
    if (r.mingMax != null && per.ming > r.mingMax) return false;
    if (r.gangMin != null && per.gang < r.gangMin) return false;
    if (r.gangMax != null && per.gang > r.gangMax) return false;
    if (r.xiaMin != null && per.xia < r.xiaMin) return false;
    if (r.xiaMax != null && per.xia > r.xiaMax) return false;
    if (r.qingMin != null && per.qing < r.qingMin) return false;
    if (r.qingMax != null && per.qing > r.qingMax) return false;
    if (r.good && p.morality < 20) return false;
    if (r.evil && p.morality > -20) return false;
    if (r.neutral && (p.morality >= 20 || p.morality <= -20)) return false;
    if (r.flag && !p.flags[r.flag]) return false;
    return true;
  }
  function meetLover(id) {
    const l = loverById(id);
    if (!l) return;
    showEncounterModal(l);
  }
  function showEncounterModal(l) {
    const m = $('eventModal');
    if (!m) { log('你与【' + l.name + '】擦肩而过。', 'dim'); return; }
    eventStack = [{ desc: l.meet.desc, choices: l.meet.choices }];
    const title = $('eventTitle');
    if (title) title.textContent = '🌸 偶遇 · ' + l.name;
    renderEncounterNode(l);
    m.style.display = 'flex';
  }
  function renderEncounterNode(l) {
    const node = eventStack[eventStack.length - 1];
    const desc = $('eventDesc'), list = $('eventChoices');
    if (desc) {
      desc.innerHTML = '';
      const p = document.createElement('div');
      p.className = 'lover-portrait';
      p.innerHTML = loverPortrait(l, 48) + '<span>' + esc(l.name) + '</span>';
      desc.appendChild(p);
      const d = document.createElement('p');
      d.textContent = node.desc;
      desc.appendChild(d);
    }
    if (list) {
      list.innerHTML = '';
      node.choices.forEach((c) => {
        const b = document.createElement('button');
        b.className = 'act';
        b.textContent = '· ' + c.text;
        b.addEventListener('click', () => resolveEncounter(l, c));
        list.appendChild(b);
      });
    }
  }
  function resolveEncounter(l, c) {
    hideEventModal();
    log(c.result, 'good');
    const aff = clamp(20 + (c.affection || 0), 1, 100);
    S.player.redyan[l.id] = { affection: aff, status: 'met', gifts: 0, dates: 0 };
    log('　' + l.name + ' 对你的好感：' + aff + '/100', 'dim');
    save();
    screen('explore');
  }
  function tryLoverEncounter() {
    const p = S.player;
    if (p.level < 5) return false;   // 剧情前期不安排红颜
    if ((p.loverCooldown || 0) > 0) { p.loverCooldown--; return false; }
    const eligible = LOVERS.filter((l) => !p.redyan[l.id] && loverEligible(l));
    if (!eligible.length) return false;
    if (rndf() > 0.006) return false;   // 大幅降低偶遇频率
    const l = pick(eligible);
    log('🌸 你与一位有缘人不期而遇……', 'event');
    showEncounterModal(l);
    p.loverCooldown = rnd(24, 36);   // 拉长偶遇间隔
    return true;
  }
  function screenGift(id) {
    const l = loverById(id);
    const gifts = S.player.inventory.filter((x) => !x.weapon && itemById(x.id) && itemById(x.id).type === 'gift');
    log('送礼给 ' + l.name + '：', 'hint');
    if (!gifts.length) log('（身上没有礼物，去商店买点吧）', 'dim');
    setActions([...gifts.map((x) => ({ label: x.qty + ' × ' + itemById(x.id).name, fn: () => giveGift(id, x.id) })), { label: '← 返回', fn: () => screenLoverDetail(id) }]);
  }
  function giveGift(id, itemId) {
    const p = S.player, l = loverById(id), it = itemById(itemId);
    const r = p.redyan[id];
    const x = p.inventory.find((z) => z.id === itemId && !z.weapon);
    if (!r || !x || x.qty <= 0) return;
    x.qty--; if (x.qty <= 0) p.inventory = p.inventory.filter((z) => z !== x);
    let d;
    if (l.gift.like.includes(itemId)) { d = rnd(8, 12); log(l.name + ' 眼睛一亮："这是我最喜欢的！"', 'good'); }
    else if (l.gift.hate.includes(itemId)) { d = rnd(-5, -2); log(l.name + ' 皱眉："……你还是自己留着吧。"', 'danger'); }
    else { d = rnd(3, 6); log(l.name + ' 收下了礼物。', ''); }
    r.affection = clamp(r.affection + d, 0, 100); r.gifts = (r.gifts || 0) + 1;
    log('　好感度 ' + (d >= 0 ? '+' : '') + d + '（当前 ' + r.affection + '）', 'dim');
    if (r.status === 'met' && r.affection >= 100) log('　' + l.name + ' 似乎有话想对你说……（可告白）', 'hint');
    recalc(); save(); screenLoverDetail(id);
  }
  function doDate(id) {
    const p = S.player, l = loverById(id);
    const r = p.redyan[id];
    if (!r) return;
    if (S.timeSteps < (r.dateCooldown || 0)) { log('你与 ' + l.name + ' 刚约过会，改日再来吧。', 'dim'); screenLoverDetail(id); return; }
    if (p.gold < 20) { log('约会要花钱的。', 'danger'); screenLoverDetail(id); return; }
    p.gold -= 20; r.dates = (r.dates || 0) + 1;
    r.dateCooldown = S.timeSteps + 16;
    const d = Math.max(2, round(rnd(5, 10) * Math.pow(0.85, r.dates - 1)));
    r.affection = clamp(r.affection + d, 0, 100);
    log('你与 ' + l.name + ' 共度了一段美好时光。', 'good');
    log('「' + l.lines.date + '」', 'dim');
    log('　好感度 +' + d + '（当前 ' + r.affection + '）', 'dim');
    if (r.status === 'met' && r.affection >= 100) log('　' + l.name + ' 似乎有话想对你说……（可告白）', 'hint');
    recalc(); save(); screenLoverDetail(id);
  }
  function confessLover(id) {
    const l = loverById(id), r = S.player.redyan[id];
    if (!r || r.affection < 100) { log('好感不足。', 'danger'); screenLoverDetail(id); return; }
    log('❤ 告白 · ' + l.name, 'level');
    log('「' + l.lines.love + '」', 'dim');
    setActions([
      { label: '❤ 结为红颜', cls: 'primary', fn: () => {
        r.status = 'redyan';
        const token = LOVER_TOKEN[l.id] || '定情信物';
        r.token = token;
        logCard('story', '💞 结缘 · ' + l.name);
        appendLog('「' + l.lines.love + '」', 'lore');
        appendLog('　她将信物【' + token + '】系于你腕间。', 'lore');
        closeCard();
        log('你与 ' + l.name + ' 结为红颜知己！', 'level');
        log('　获得属性加成（红颜越多，单份加成递减）。', 'good');
        recordChronicle('lover_' + l.id, '与 ' + l.name + ' 结为红颜');
        recalc(); save(); screenLoverDetail(id);
      } },
      { label: '维持知己之交', fn: () => { r.status = 'friend'; log('你们约定，做一生的知己。', 'dim'); save(); screenLoverDetail(id); } },
      { label: '← 再想想', fn: () => screenLoverDetail(id) }
    ]);
  }

  // ============================================================
  //  屏幕：地图 / 地点
  // ============================================================
  function screenMap() {
    const p = S.player;
    log('🗺 天下舆图（按等级解锁）', 'title');
    const btns = [];
    REGIONS.filter((r) => r.hub || !CITY_LINKED[r.id]).sort((a, b) => a.level - b.level).forEach((r) => {
      const can = p.level >= r.level;
      const prefix = r.hub ? '🏯 ' : '⚔ ';
      btns.push({ label: (can ? '' : '🔒') + prefix + r.name + '（' + r.level + ' 级）', fn: () => r.hub ? screenCity(r.id) : enterRegion(r.id), disabled: !can, hint: r.desc });
    });
    btns.push({ label: '← 返回', fn: () => screen('explore') });
    setActions(btns);
  }
  function screenCity(id) {
    const p = S.player;
    const c = regionById(id);
    if (!c || !c.hub) { screen('map'); return; }
    const links = CITY_LINKS[id] || { suburbs: [], wilds: [] };
    log('🏯 ' + c.name, 'title');
    log(c.desc, 'dim');
    const btns = [];
    c.locs.forEach((l) => {
      const tag = l.type === 'rest' ? '客栈' : l.type === 'shop' ? '集市/商铺' : l.type === 'guanfu' ? '官府' : l.type === 'qinglou' ? '青楼' : l.type === 'dufang' ? '赌坊' : l.type === 'bitai' ? '比武台' : '';
      btns.push({ label: '· ' + l.name + (tag ? '（' + tag + '）' : ''), cls: 'safe', fn: () => { S.location.region = id; S.location.loc = l.id; save(); screen('explore'); } });
    });
    if (links.suburbs.length) {
      links.suburbs.forEach((rid) => {
        const r = regionById(rid);
        if (!r) return;
        const can = p.level >= r.level;
        btns.push({ label: '· ' + r.name + '（' + r.level + ' 级）', fn: () => enterRegion(rid), disabled: !can, hint: r.desc });
      });
    }
    if (links.wilds.length) {
      links.wilds.forEach((rid) => {
        const r = regionById(rid);
        if (!r) return;
        const can = p.level >= r.level;
        btns.push({ label: '· ' + r.name + '（' + r.level + ' 级）', fn: () => enterRegion(rid), disabled: !can, hint: r.desc });
      });
    }
    btns.push({ label: '← 返回地图', fn: () => screen('map') });
    setActions(btns);
  }
  // 展示区域背景志：首次进图自动展示，force 时强制重读（供「背景志」按钮）
  function showRegionLore(id, force) {
    const lore = REGION_LORE[id];
    if (!lore || !lore.length) return;
    S.seenLore = S.seenLore || [];
    if (!force) {
      if (S.seenLore.indexOf(id) >= 0) return;
      S.seenLore.push(id);
    }
    const r = regionById(id);
    if (!r) return;
    logCard('story', '📖 ' + r.name + ' · 背景志');
    const poem = REGION_POEM[id];
    if (poem) appendLog('　' + poem, 'poem');
    for (const ln of lore) appendLog(ln, 'lore');
    closeCard();
  }
  function enterRegion(id) {
    const r = regionById(id);
    S.location.region = id;
    S.location.loc = (r.locs && r.locs.length) ? r.locs[0].id : (S.location.loc || '');   // 进入即落到首个地点，避免地点悬空
    log('你来到了【' + r.name + '】。', 'good');
    log(r.desc, 'dim');
    showRegionLore(id);
    checkSectTaskTravel(id);
    save(); screenLoc();
    tryOfferMapQuest(id);
  }
  function screenLoc() {
    const r = regionById(S.location.region);
    if (r.hub) { screenCity(r.id); return; }
    log('📍 ' + r.name + ' · 选择地点：', 'hint');
    const btns = r.locs.map((l) => {
      const hasSecret = getSecretAt(r.id, l.id);
      return { label: l.name + (l.type === 'shop' ? '（店）' : l.type === 'rest' ? '（客栈）' : '') + (hasSecret ? '　🗝 有秘密' : ''), fn: () => { S.location.loc = l.id; save(); screen('explore'); } };
    });
    const cid = CITY_LINKED[r.id];
    if (cid) btns.push({ label: '↑ 返回【' + regionById(cid).name + '】', fn: () => screenCity(cid) });
    btns.push({ label: '🗺 地图', fn: () => screen('map') }, { label: '← 返回', fn: () => screen('explore') });
    setActions(btns);
  }

  // ============================================================
  //  屏幕：商店 / 菜单
  // ============================================================
  const QUALITY_SELL_BASE = { hui: 3, bai: 10, lv: 25, lan: 60, zi: 140, cheng: 320, hong: 800 };
  function weaponSellPrice(w) { const base = QUALITY_SELL_BASE[w.quality] || 10; return Math.max(1, round(base + w.atk * 0.4)); }
  function armorSellPrice(a) { const base = QUALITY_SELL_BASE[a.quality] || 10; return Math.max(1, round(base * 0.7 + a.def * 1.2 + a.hp * 0.6)); }
  function itemSellPrice(it) { return Math.max(1, round((it.price || 1) * 0.4)); }
  function screenShop() {
    const p = S.player;
    const goods = ITEMS.filter((i) => i.type === 'hp' || i.type === 'mp' || i.type === 'gift');
    const choices = goods.map((i) => ({ text: i.name + '　' + i.price + ' 两　' + i.desc, disabled: p.gold < i.price, fn: () => buyItem(i.id, i.price) }));
    choices.push({ text: '💰 出售', fn: sellModal });
    choices.push({ text: '← 返回', fn: () => screen('explore') });
    showNotice('🛒 店铺 · 钱 ' + p.gold + ' 两', ['点击物品即可购买：'], choices);
  }
  function buyItem(id, price) {
    if (S.player.gold < price) { log('钱不够。', 'danger'); screenShop(); return; }
    S.player.gold -= price; addItem(id, 1);
    log('你买下了【' + itemById(id).name + '】。', 'good');
    save(); screenShop();
  }
  function screenBountyBoard() {
    const p = S.player;
    log('📜 悬赏榜', 'title');
    if (S.bounty) {
      const b = S.bounty;
      log('进行中的通缉令：', 'hint');
      log('　通缉【' + b.enemyName + '】× ' + b.need + '，出没于【' + b.regionName + '】', '');
      log('　进度：' + b.killed + '/' + b.need, 'hint');
      log('　报酬：' + b.reward.gold + ' 两 + ' + b.reward.exp + ' 经验。', 'dim');
      setActions([{ label: '← 返回', fn: () => screen('explore') }]);
      return;
    }
    const near = REGIONS.filter((r) => !r.hub && r.enemies && r.enemies.length && r.level <= p.level + 2 && r.level >= Math.max(1, p.level - 6));
    const pool = near.length ? near : REGIONS.filter((r) => !r.hub && r.enemies && r.enemies.length);
    if (!pool.length) { log('（榜上暂时没有合适的通缉令）', 'dim'); setActions([{ label: '← 返回', fn: () => screen('explore') }]); return; }
    const region = pick(pool);
    const enemy = enemyById(pick(region.enemies));
    const need = rnd(3, 8);
    const rewardGold = round((20 + region.level * 3) * need);
    const rewardExp = round((15 + region.level * 2) * need);
    const issuer = pick(BOUNTY_ISSUERS);
    log('最新通缉令：', 'hint');
    log('　【' + enemy.name + '】出没于【' + region.name + '】，' + need + ' 名，悬赏 ' + rewardGold + ' 两 + ' + rewardExp + ' 经验。', '');
    setActions([
      { label: '✔ 揭下通缉令', cls: 'primary', fn: () => { S.bounty = { enemyId: enemy.id, regionId: region.id, need, killed: 0, issuer, enemyName: enemy.name, regionName: region.name, reward: { gold: rewardGold, exp: rewardExp } }; log('你揭下通缉令，接下悬赏！', 'good'); save(); screen('explore'); } },
      { label: '← 返回', fn: () => screen('explore') }
    ]);
  }
  function genBlackMarketStock() {
    const p = S.player;
    const isWeapon = rndf() < 0.5;
    const highTier = rndf() < 0.12;   // 小概率刷出「下一地图」的高级货
    const effLevel = highTier ? (p.level + 10) : p.level;
    const gear = isWeapon ? { weapon: randomWeapon(effLevel) } : { armor: randomArmor(effLevel) };
    const g = gear.weapon || gear.armor;
    const price = isWeapon ? Math.max(1, round(weaponSellPrice(g) * 2)) : Math.max(1, round(armorSellPrice(g) * 2));
    return { day: S.day, gear, isWeapon, price, highTier };
  }
  function screenBlackMarket() {
    const p = S.player;
    S.blackMarket = S.blackMarket || null;
    if (!S.blackMarket || S.blackMarket.day !== S.day) S.blackMarket = genBlackMarketStock();
    const bm = S.blackMarket;
    const choices = [];
    ITEMS.filter((i) => i.type === 'gift').forEach((i) => {
      const price = Math.round((i.price || 10) * 1.5);
      choices.push({ text: '🎁 ' + i.name + '　' + price + ' 两　' + i.desc, disabled: p.gold < price, fn: () => buyItem(i.id, price) });
    });
    if (bm.gear) {
      const g = bm.gear.weapon || bm.gear.armor;
      const bstat = gearStatLine(g, bm.isWeapon);
      choices.push({ text: '🗡 ' + g.name + '（' + g.qualityName + ' · ' + bstat + '）　' + bm.price + ' 两' + (bm.highTier ? '　✨ 稀世珍品' : ''), disabled: p.gold < bm.price, fn: buyBlackMarketGear });
    } else {
      choices.push({ text: '（今日的稀罕货已售罄，明日再来）', disabled: true });
    }
    choices.push({ text: '← 返回', fn: () => screen('explore') });
    showNotice('🌑 黑市 · 钱 ' + p.gold + ' 两', ['黑市不问来路，只认银子。', '稀罕货每日只此一件，看中就下手。'], choices);
  }
  function buyBlackMarketGear() {
    const p = S.player;
    const bm = S.blackMarket;
    if (!bm || !bm.gear) { screenBlackMarket(); return; }
    if (p.gold < bm.price) { log('钱不够。', 'danger'); screenBlackMarket(); return; }
    p.gold -= bm.price;
    const g = bm.gear.weapon || bm.gear.armor;
    if (bm.gear.weapon) p.inventory.push({ id: g.id, weapon: g });
    else { p.inventory.push({ id: g.id, armor: g }); discoverSet(g.set); }
    log('你买下了【' + g.name + '】。', 'good');
    bm.gear = null;   // 本日售罄，不再刷新
    save(); renderHUD();
    screenBlackMarket();
  }
  function makeRankEnemy(entry) {
    const e = makeEnemy(entry.arch, entry.level);
    e.name = entry.name;
    e.tier = 'elite';
    e.desc = '江湖榜第 ' + entry.rank + ' 名，实力深不可测。';
    return e;
  }
  function screenRanking() {
    const p = S.player;
    const cur = p.rank || 0;
    log('⚔ 江湖排行榜', 'title');
    if (cur <= 0) log('你尚未上榜，可从第 10 名开始挑战。', 'hint');
    else log('你当前位列江湖第 ' + cur + ' 名。', 'good');
    const nextRank = cur <= 0 ? 10 : cur - 1;
    const entry = RANKINGS.find((r) => r.rank === nextRank);
    if (!entry) {
      log('你已是天下第一，登峰造极！', 'level');
      setActions([{ label: '← 返回', fn: () => screen('explore') }]);
      return;
    }
    log('下一战：挑战第 ' + entry.rank + ' 名【' + entry.name + '】（约 ' + entry.level + ' 级）', 'hint');
    log('　首胜奖励：' + rewardText(entry.reward), 'dim');
    setActions([
      { label: '⚔ 挑战第 ' + entry.rank + ' 名【' + entry.name + '】', cls: 'primary', fn: () => { S.rankFight = entry.rank; log('你登上比武台，挑战【' + entry.name + '】！', 'event'); startCombat(makeRankEnemy(entry)); } },
      { label: '← 返回', fn: () => screen('explore') }
    ]);
  }
  // —— 出售界面（下拉分类 + 品质筛选弹窗 + 出售/自动出售）——
  function sellItemName(x) { return x.weapon ? x.weapon.name : x.armor ? x.armor.name : (itemById(x.id) ? itemById(x.id).name : x.id); }
  function sellItemPrice(x) { return x.weapon ? weaponSellPrice(x.weapon) : x.armor ? armorSellPrice(x.armor) : itemSellPrice(itemById(x.id)); }
  function sellItemQty(x) { return (!x.weapon && !x.armor) ? x.qty : 1; }
  function sellItemCat(x) { return x.weapon ? 'weapon' : x.armor ? 'armor' : 'item'; }
  function sellItemQuality(x) { const g = x.weapon || x.armor; return g ? g.quality : null; }
  function sellItemColor(x) { const g = x.weapon || x.armor; return (g && g.qualityColor) ? g.qualityColor : '#e8dcc4'; }

  function sellModal() {
    const p = S.player;
    if (S.sellCat !== 'weapon' && S.sellCat !== 'armor' && S.sellCat !== 'item') S.sellCat = 'weapon';
    S.sellQuals = S.sellQuals || [];
    S.sellSel = S.sellSel || [];
    S.sellSel = S.sellSel.filter((x) => p.inventory.indexOf(x) >= 0);
    renderSell();
  }

  function renderSell() {
    const p = S.player;
    const m = $('eventModal'); if (!m) return;
    eventStack = [];
    const titleEl = $('eventTitle');
    if (titleEl) { const pl = pixLabel('💰 出售'); titleEl.innerHTML = (pl.icon ? pl.icon + ' ' : '') + esc(pl.text) + '　<span style="color:#e8c87a;">钱 ' + p.gold + ' 两</span>'; }

    const desc = $('eventDesc'); desc.innerHTML = '';
    const hint = document.createElement('p');
    hint.className = 'sell-hint';
    hint.textContent = '下拉切换类别；点「出售筛选」勾选品质后，「自动出售」会一次卖掉对应品质的武器与护甲。';
    desc.appendChild(hint);

    const ctl = document.createElement('div');
    ctl.className = 'sell-controls';
    const sel = document.createElement('select');
    sel.className = 'sell-select';
    [['weapon', '🗡 武器'], ['armor', '🛡 护甲'], ['item', '📦 道具']].forEach(([v, lb]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = lb;
      if (S.sellCat === v) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => { S.sellCat = sel.value; S.sellSel = []; renderSell(); });
    ctl.appendChild(sel);
    const fbtn = document.createElement('button');
    fbtn.type = 'button';
    fbtn.className = 'act';
    fbtn.textContent = '⚙ 出售筛选';
    fbtn.addEventListener('click', openSellQualPopup);
    ctl.appendChild(fbtn);
    desc.appendChild(ctl);

    const qsum = document.createElement('p');
    qsum.className = 'sell-qual-summary';
    if (!S.sellQuals.length) qsum.textContent = '未勾选品质：自动出售不会出售任何东西。';
    else {
      const names = S.sellQuals.map((qid) => { const q = QUALITIES.find((x) => x.id === qid); return q ? q.name : qid; });
      qsum.textContent = '自动出售品质：' + names.join('、') + '（对道具无效）。';
    }
    desc.appendChild(qsum);

    const listWrap = document.createElement('div');
    listWrap.className = 'sell-list';
    const items = p.inventory.filter((x) => sellItemCat(x) === S.sellCat);
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'sell-empty';
      empty.textContent = '该类别下没有可出售的东西。';
      listWrap.appendChild(empty);
    } else {
      const MAX = 50, shown = items.slice(0, MAX);
      shown.forEach((x) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'sell-row' + (S.sellSel.indexOf(x) >= 0 ? ' sel' : '');
        const qty = sellItemQty(x), total = sellItemPrice(x) * qty;
        row.innerHTML = '<span class="sell-name" style="color:' + sellItemColor(x) + ';">' + esc(sellItemName(x)) + '</span>' +
          (qty > 1 ? '<span class="sell-qty">×' + qty + '</span>' : '') +
          '<span class="sell-price">+' + total + ' 两</span>';
        row.addEventListener('click', () => {
          if (S.sellSel.indexOf(x) >= 0) S.sellSel = []; else S.sellSel = [x];
          renderSell();
        });
        listWrap.appendChild(row);
      });
      if (items.length > MAX) {
        const more = document.createElement('div');
        more.className = 'sell-more';
        more.textContent = '（还有 ' + (items.length - MAX) + ' 件未显示，可用「自动出售」清理）';
        listWrap.appendChild(more);
      }
    }
    desc.appendChild(listWrap);

    const choices = $('eventChoices'); choices.innerHTML = '';
    const selOne = S.sellSel.length ? S.sellSel[0] : null;
    const sellTotal = selOne ? sellItemPrice(selOne) * sellItemQty(selOne) : 0;
    const bSell = document.createElement('button');
    bSell.className = 'act primary';
    bSell.textContent = selOne ? ('💰 出售　' + sellItemName(selOne) + '　+' + sellTotal + ' 两') : '💰 出售（先点上方一件物品）';
    bSell.disabled = !selOne;
    bSell.addEventListener('click', doSellSelected);
    choices.appendChild(bSell);

    const autoItems = S.sellQuals.length ? p.inventory.filter((x) => { const q = sellItemQuality(x); return q && S.sellQuals.indexOf(q) >= 0; }) : [];
    const autoTotal = autoItems.reduce((s, x) => s + sellItemPrice(x) * sellItemQty(x), 0);
    const bAuto = document.createElement('button');
    bAuto.className = 'act safe';
    bAuto.textContent = autoItems.length ? ('⚡ 自动出售 ' + autoItems.length + ' 件　+' + autoTotal + ' 两　（对道具无效）') : '⚡ 自动出售（对道具无效）';
    bAuto.disabled = !autoItems.length;
    bAuto.addEventListener('click', () => doSellAuto(autoItems));
    choices.appendChild(bAuto);

    const bBack = document.createElement('button');
    bBack.className = 'act back';
    bBack.textContent = '← 返回店铺';
    bBack.addEventListener('click', () => { hideEventModal(); screenShop(); });
    choices.appendChild(bBack);

    m.style.display = 'flex';
  }

  function openSellQualPopup() {
    closeSellQualPopup();
    const ov = document.createElement('div');
    ov.id = 'sellQualOverlay';
    ov.className = 'sell-qual-overlay';
    const box = document.createElement('div');
    box.className = 'sell-qual-box';
    const t = document.createElement('div');
    t.className = 'sell-qual-title';
    t.textContent = '选择要自动出售的品质';
    box.appendChild(t);
    const note = document.createElement('div');
    note.className = 'sell-qual-note';
    note.textContent = '仅对武器 / 护甲生效，道具不会被自动出售。';
    box.appendChild(note);
    const list = document.createElement('div');
    list.className = 'sell-qual-list';
    QUALITIES.forEach((q) => {
      const label = document.createElement('label');
      label.className = 'sell-qual-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = S.sellQuals.indexOf(q.id) >= 0;
      cb.addEventListener('change', () => {
        const i = S.sellQuals.indexOf(q.id);
        if (cb.checked && i < 0) S.sellQuals.push(q.id);
        else if (!cb.checked && i >= 0) S.sellQuals.splice(i, 1);
      });
      const sw = document.createElement('span');
      sw.className = 'sell-qual-swatch';
      sw.style.background = q.color;
      const nm = document.createElement('span');
      nm.className = 'sell-qual-name';
      nm.style.color = q.color;
      nm.textContent = (q.emoji || '') + ' ' + q.name;
      label.appendChild(cb); label.appendChild(sw); label.appendChild(nm);
      list.appendChild(label);
    });
    box.appendChild(list);
    const btns = document.createElement('div');
    btns.className = 'sell-qual-btns';
    const ok = document.createElement('button');
    ok.className = 'act primary';
    ok.textContent = '✔ 确定';
    ok.addEventListener('click', () => { closeSellQualPopup(); renderSell(); });
    const clr = document.createElement('button');
    clr.className = 'act';
    clr.textContent = '清空';
    clr.addEventListener('click', () => { S.sellQuals = []; list.querySelectorAll('input').forEach((c) => { c.checked = false; }); });
    btns.appendChild(ok); btns.appendChild(clr);
    box.appendChild(btns);
    ov.appendChild(box);
    document.body.appendChild(ov);
  }
  function closeSellQualPopup() { const ov = $('sellQualOverlay'); if (ov) ov.remove(); }

  function doSellSelected() {
    const p = S.player;
    const sel = S.sellSel && S.sellSel.length ? S.sellSel[0] : null;
    if (!sel) { renderSell(); return; }
    const total = sellItemPrice(sel) * sellItemQty(sel);
    p.inventory = p.inventory.filter((z) => z !== sel);
    p.gold += total;
    log('你卖出了【' + sellItemName(sel) + '】，获得 ' + total + ' 两。', 'good');
    S.sellSel = [];
    save(); renderHUD();
    renderSell();
  }
  function doSellAuto(items) {
    const p = S.player;
    if (!items || !items.length) { renderSell(); return; }
    let total = 0;
    items.forEach((x) => { total += sellItemPrice(x) * sellItemQty(x); p.inventory = p.inventory.filter((z) => z !== x); });
    p.gold += total;
    log('你一次性卖出了 ' + items.length + ' 件武器/护甲，获得 ' + total + ' 两。', 'good');
    S.sellSel = [];
    save(); renderHUD();
    renderSell();
  }
  function screenMenu() {
    log('⚙ 菜单', 'title');
    const _music = (window.WuxiaMusic && window.WuxiaMusic.isOn()) ? '🎵 音乐：开' : '🎵 音乐：关';
    setActions([{ label: _music, fn: () => { if (window.WuxiaMusic) window.WuxiaMusic.toggle(); screenMenu(); } }, { label: '💾 保存', fn: () => { save(); log('已保存。', 'good'); } }, { label: '📖 帮助', fn: screenHelp }, { label: '🔄 重新开始', fn: () => { if (confirm('确定重新开始？进度将丢失。')) { wipeSave(); location.reload(); } } }, { label: '← 返回', fn: () => screen('explore') }]);
  }
  function screenHelp() {
    log('📖 玩法说明', 'title');
    log('· 探索：遇敌 / 奇遇 / 宝藏。', '');
    log('· 战斗：招式耗内力；五行相克（金克木、木克土、土克水、水克火、火克金），克制 +50% 伤害。', '');
    log('· 五行可随时切换（战斗中/人物界面点「🔁 五行」）；敌人偶尔露出破绽，此时出手伤害翻倍。', '');
    log('· 地图会刷新「限时大事件」，有倒计时，错过就没了；还有随你成长的宿敌，隔三差五上门羞辱。', '');
    log('· 对远弱于你的敌人可「⚡ 一键了结」；可「🔁 连续探索 ×5」快速刷图。', '');
    log('· 升级得天赋点；学功法、修炼、换武器提升战力。', '');
    log('· 加入门派得加成；送礼约会，好感 60 结为道侣。', '');
    log('· 被 Boss 羞辱进复仇名单，击败它雪耻拿重赏。', '');
    log('· 地图随等级解锁；不打最终 Boss（魔域深渊）可一直刷。', '');
    setActions([{ label: '← 返回', fn: () => screen('menu') }]);
  }

  // ============================================================
  //  屏幕分发
  // ============================================================
  // ============================================================
  //  屏幕：主线
  // ============================================================
  let storyStack = [];
  function screenStory() {
    const p = S.player;
    const stepId = p.flags.story || 'a1_1';
    storyStack = [];
    if (stepId === 'done') {
      log('📖 主线', 'title');
      log('你已破妄，停留于此界。', 'good');
      log('江湖未老，你的传说仍在继续——可继续探索、无限变强。', 'dim');
      log('（也可随时选择「轮回」，转生开启新周目。）', 'hint');
      setActions([{ label: '🌀 轮回', fn: doReincarnate }, { label: '← 返回', fn: () => screen('explore') }]);
      return;
    }
    const step = STORY.find((s) => s.id === stepId);
    log('📖 主线 · ' + (step ? step.title : '未知'), 'title');
    if (!step) { log('（剧情暂不可用）', 'dim'); setActions([{ label: '← 返回', fn: () => screen('explore') }]); return; }
    if (p.level < step.levelReq) {
      log('（此段剧情需 ' + step.levelReq + ' 级解锁，先去闯荡江湖吧）', 'dim');
      setActions([{ label: '← 返回', fn: () => screen('explore') }]);
      return;
    }
    if (step.endings) {
      const ends = visibleEndings();
      setActions(ends.map((e) => ({ label: '· ' + e.name + '（' + e.req + '）', fn: () => doEnding(e) })));
      return;
    }
    storyStack = [{ lines: step.lines, choices: step.choices }];
    renderStoryNode(true);
  }
  function renderStoryNode(logLines) {
    const node = storyStack[storyStack.length - 1];
    if (logLines !== false) node.lines.forEach((l) => log(l, ''));
    const btns = [];
    if (storyStack.length > 1) btns.push({ label: '← 返回', cls: 'back', fn: () => { storyStack.pop(); renderStoryNode(false); } });
    node.choices.filter(choiceVisible).forEach((c) => {
      btns.push({ label: '· ' + c.text, fn: () => {
        if (c.sub) { storyStack.push({ lines: c.sub.lines, choices: c.sub.choices }); renderStoryNode(true); }
        else doStoryChoice(c);
      } });
    });
    setActions(btns);
  }
  function doStoryChoice(c) {
    log(c.result, 'good');
    if (c.effect) {
      const e = { ...c.effect };
      // 主线选择对隐藏属性（性格/善恶/声望）的影响是普通偶发事件的 2.5 倍
      if (e.per) { const p2 = {}; for (const k in e.per) p2[k] = Math.round(e.per[k] * 2.5); e.per = p2; }
      if (e.moral) e.moral = Math.round(e.moral * 2.5);
      if (e.rep) e.rep = Math.round(e.rep * 2.5);
      applyEffect(e);
      if (e.gold > 0) log('💰 获得 ' + e.gold + ' 两。', 'good');
      else if (e.gold < 0) log('　花费 ' + (-e.gold) + ' 两。', 'dim');
    }
    if (c.flags) c.flags.forEach((f) => { S.player.flags[f] = true; });
    const curStep = STORY.find((s) => s.id === S.player.flags.story);
    if (c.next && c.next !== 'done') recordChronicle('story_' + c.next, '主线推进：' + (curStep ? curStep.title : '未知'));
    S.player.flags.story = c.next || 'done';
    grantStoryClues();
    save();
    screenStory();
  }
  // 剧情选项可见性（隐藏数值决定哪些选项可见，玩家仍可在可见项中选择）
  function choiceVisible(c) {
    if (!c.req) return true;
    const p = S.player, per = p.personality, r = c.req;
    if (r.mingMin != null && per.ming < r.mingMin) return false;
    if (r.mingMax != null && per.ming > r.mingMax) return false;
    if (r.gangMin != null && per.gang < r.gangMin) return false;
    if (r.xiaMin != null && per.xia < r.xiaMin) return false;
    if (r.xiaMax != null && per.xia > r.xiaMax) return false;
    if (r.evil && p.morality > -20) return false;
    if (r.good && p.morality < 20) return false;
    if (r.flag && !p.flags[r.flag]) return false;
    return true;
  }
  // 十结局可见性判定：隐藏数值决定「能看到哪些结局」，玩家仍可在可见项中选择
  function visibleEndings() {
    const p = S.player, per = p.personality;
    const isGood = p.morality >= 20, isEvil = p.morality <= -20;
    const married = Object.values(p.redyan).some((r) => r && r.status === 'redyan');
    const killedXue = !!p.flags.killed_murongxue;
    const get = (id) => ENDINGS.find((e) => e.id === id);
    const out = [];
    const add = (id) => { if (!out.some((e) => e.id === id)) out.push(get(id)); };
    if (per.ming >= 50) add('zhen');
    if (per.ming <= -50) add('meng');
    if (isEvil && per.gang >= 30) add('dai');
    if (isGood && per.xia >= 30) add('du');
    if (per.xia <= -30 && per.gang >= 30) add('zhan');
    if (per.gang <= -30 || per.qing <= -30) add('yin');
    if (married && per.qing >= 30) add('lunhui');
    if (per.ming >= 70 && per.qing >= 30) add('wuwo');
    if (killedXue && (isEvil || per.xia <= -30)) add('xinmo');
    if (!isGood && !isEvil && (per.ming >= 30 || per.qing >= 30)) add('kongmen');
    if (p.flags.path_replace) add('dai');
    if (p.flags.path_leave) add('zhen');
    if (p.flags.path_hard) add('zhan');
    if (p.flags.path_assassin) add('xinmo');
    if (p.flags.path_stealth) add('yin');
    if (!out.length) add('yin');
    return out;
  }
  function doEnding(ending) {
    const p = S.player;
    p.flags.ending = ending.id;
    p.flags.cleared = true;
    log('🌅 结局 · ' + ending.name, 'level');
    log('　' + ending.desc, 'good');
    log('—— 这场大梦，就此落下帷幕 ——', 'title');
    save();
    setActions([
      { label: '🌇 停留此界（继续探索，无限变强）', fn: doStay },
      { label: '🌀 轮回（转生新周目）', fn: doReincarnate }
    ]);
  }
  function doStay() {
    S.player.flags.story = 'done';
    log('你选择留下。江湖未老，你的传说仍在继续。', 'good');
    log('（可继续探索、无限变强；随时可从「主线」选择轮回。）', 'hint');
    save();
    screen('explore');
  }
  function doReincarnate() {
    const p = S.player;
    const talents = p.talentPoints;
    const personality = { xia: p.personality.xia, gang: p.personality.gang, ming: p.personality.ming, qing: p.personality.qing };
    const arts = [];
    if (p.equipped.weapon && p.equipped.weapon.bonus) arts.push({ weapon: p.equipped.weapon });
    for (const s of ARMOR_SLOTS) { const a = p.equipped[s.id]; if (a && a.bonus) arts.push({ armor: a }); }
    p.inventory.forEach((x) => { if (x.weapon && x.weapon.bonus) arts.push({ weapon: x.weapon }); if (x.armor && x.armor.bonus) arts.push({ armor: x.armor }); });
    const reinc = (p.reincarnations || 0) + 1;
    S = newGame(p.name, p.element, pick(WEAPON_TYPES).id);
    S.player.talentPoints = talents + 5;
    S.player.personality = personality;
    S.player.reincarnations = reinc;
    arts.forEach((a) => { if (a.weapon) S.player.inventory.push({ id: a.weapon.id, weapon: a.weapon }); else if (a.armor) S.player.inventory.push({ id: a.armor.id, armor: a.armor }); });
    const el = $('log'); if (el) el.innerHTML = '';
    log('🌀 轮回开启 · 第 ' + reinc + ' 世', 'level');
    log('你带着前世的记忆与心性，踏入一个似曾相识、却又崭新的江湖。', 'good');
    save();
    screen('explore');
  }

  // ============================================================
  //  支线任务
  // ============================================================
  const questById = (id) => QUESTS.find((q) => q.id === id);
  function tryQuestTrigger() {
    if (S.quest || S.bounty) return false;
    if (rndf() > 0.08) return false;
    const chains = QUESTS.filter((q) => !S.player.flags['qdone_' + q.id] && regionById(q.steps[0].targetRegion).level <= S.player.level + 2);
    if (chains.length && rndf() < 0.5) {
      const q = pick(chains);
      S.quest = { id: q.id, step: 0 };
      const st = q.steps[0];
      log('📜 支线任务触发：' + q.name, 'event');
      log(st.desc, '');
      showNotice('📜 新任务 · ' + q.name, [
        st.desc,
        '目标：前往【' + regionById(st.targetRegion).name + '】。'
      ], [{ text: '✔ 接下任务', cls: 'primary' }]);
      save();
      return true;
    }
    return startBounty();
  }
  function startBounty() {
    const p = S.player;
    const near = REGIONS.filter((r) => r.level <= p.level + 2 && r.level >= Math.max(1, p.level - 6));
    const pool = near.length ? near : REGIONS.filter((r) => r.level <= p.level + 2);
    if (!pool.length) return false;
    const region = pick(pool);
    if (!region.enemies || !region.enemies.length) return false;
    const enemyId = pick(region.enemies);
    const enemy = enemyById(enemyId);
    if (!enemy) return false;
    const need = rnd(3, 8);
    const issuer = pick(BOUNTY_ISSUERS);
    const rewardGold = round((20 + region.level * 3) * need);
    const rewardExp = round((15 + region.level * 2) * need);
    S.bounty = { enemyId, regionId: region.id, need, killed: 0, issuer, enemyName: enemy.name, regionName: region.name, reward: { gold: rewardGold, exp: rewardExp } };
    log('📜 悬赏委托：' + issuer + ' 有求于你。', 'event');
    showNotice('📜 悬赏委托', [
      issuer + ' 有求于你。',
      '去【' + region.name + '】击杀 ' + need + ' 个【' + enemy.name + '】。',
      '报酬：' + rewardGold + ' 两 + ' + rewardExp + ' 经验。'
    ], [{ text: '✔ 接下委托', cls: 'primary' }]);
    save();
    return true;
  }
  function tryQuestComplete() {
    const q = S.quest;
    if (!q) return false;
    const qd = questById(q.id);
    if (!qd) { S.quest = null; return false; }
    const st = qd.steps[q.step];
    if (!st) { S.quest = null; return false; }
    if (S.location.region !== st.targetRegion) return false;
    log('✔ 任务完成：' + qd.name + '（' + (q.step + 1) + '/' + qd.steps.length + '）', 'level');
    log(st.result, 'good');
    applyEffect(st.reward || {});
    q.step++;
    const rw = st.reward || {};
    const rewardLine = Object.keys(rw).length ? ('奖励：' + rewardText(rw)) : null;
    if (q.step >= qd.steps.length) {
      S.player.flags['qdone_' + q.id] = true;
      S.quest = null;
      log('📜 任务线「' + qd.name + '」全部完成！', 'good');
      const lines = ['任务线「' + qd.name + '」全部完成！', st.result];
      if (rewardLine) lines.push(rewardLine);
      showNotice('📜 任务完成', lines, [{ text: '✔ 收下', cls: 'primary' }]);
    } else {
      const nst = qd.steps[q.step];
      log('　后续：' + nst.desc, 'hint');
      log('　目标：前往【' + regionById(nst.targetRegion).name + '】。', 'hint');
      const lines = [st.result];
      if (rewardLine) lines.push(rewardLine);
      lines.push('下一步：' + nst.desc);
      lines.push('目标：前往【' + regionById(nst.targetRegion).name + '】。');
      showNotice('📜 任务推进（' + q.step + '/' + qd.steps.length + '）', lines, [{ text: '✔ 继续前行', cls: 'primary' }]);
    }
    save();
    return true;
  }
  // ============================================================
  //  地图任务 + 主线线索
  // ============================================================
  function pickMainClue() {
    return MAIN_CLUES.find((c) => !S.player.clues.includes(c.id)) || null;
  }
  function clueHook(idx) {
    if (idx < 4) return '你心中一动：这与你身上那半块玉佩，似有千丝万缕的关联。';
    if (idx < 8) return '碎片渐次拼起，身世的迷雾，似乎又散开了一层。';
    return '真相已近在咫尺——这场「山河一梦」，究竟藏着什么？';
  }
  function mysteryTransitions(afterN) {
    S.mysteryStatus = S.mysteryStatus || {};
    const solved = [], known = [];
    for (const m of MYSTERIES) {
      if (S.mysteryStatus[m.id] === 'solved') continue;
      if (afterN >= m.solveReq) solved.push(m.name);
      else if (afterN >= m.knowReq && !S.mysteryStatus[m.id]) known.push(m.name);
    }
    return { solved, known };
  }
  // 获得一条主线线索：入账并返回「仪式」通知，由调用方决定弹窗或并入战斗结算链
  function grantClue(clue) {
    if (!clue || S.player.clues.includes(clue.id)) return null;
    S.player.clues.push(clue.id);
    const n = S.player.clues.length;
    const idx = MAIN_CLUES.indexOf(clue);
    const t = mysteryTransitions(n);
    const lines = [
      { html: '<span class="hl">' + esc(clue.text) + '</span>', cls: 'lore' },
      clueHook(idx)
    ];
    if (t.solved.length) lines.push('疑点【' + t.solved.join('】【') + '】就此解开——去「手札」看真相。');
    else if (t.known.length) lines.push('你心中生出疑点【' + t.known.join('】【') + '】。');
    updateMysteries();
    checkGoals();
    return { title: '🔍 获得主线线索（' + n + '/' + MAIN_CLUES.length + '）', lines: lines };
  }
  function showClueNotice(note) {
    if (!note) return;
    showNotice(note.title, note.lines, [{ text: '✔ 记下了', cls: 'primary', fn: () => {} }]);
  }
  function storyPast(stepId) {
    const cur = S.player.flags.story;
    if (cur === 'done') return true;
    const idx = STORY.findIndex((s) => s.id === stepId);
    const curIdx = STORY.findIndex((s) => s.id === cur);
    return idx >= 0 && curIdx > idx;
  }
  function clueAtLocation() {
    for (const cid in CLUE_SOURCES) {
      const src = CLUE_SOURCES[cid];
      if (src.region !== S.location.region || src.loc !== S.location.loc) continue;
      if (S.player.clues.includes(cid)) return null;
      if (src.flag && !storyPast(src.flag)) return null;
      return { clueId: cid, desc: src.desc };
    }
    return null;
  }
  function doClueInvestigate(src) {
    log(src.desc, 'lore');
    const clue = MAIN_CLUES.find((c) => c.id === src.clueId);
    if (clue) showClueNotice(grantClue(clue));
  }
  function grantStoryClues() {
    for (const cid in CLUE_STORY) {
      if (S.player.clues.includes(cid)) continue;
      if (storyPast(CLUE_STORY[cid])) {
        const clue = MAIN_CLUES.find((c) => c.id === cid);
        if (clue) showClueNotice(grantClue(clue));
      }
    }
  }
  function genMapQuest(region) {
    const kinds = [];
    if (region.enemies && region.enemies.length) kinds.push('hunt');
    kinds.push('explore');
    const specialLocs = region.locs.filter((l) => l.type === 'landmark' || l.type === 'special');
    if (specialLocs.length) kinds.push('visit');
    if (region.boss) kinds.push('boss');
    const kind = pick(kinds);
    let targetId = null, targetName = '', need = 1, desc = '';
    if (kind === 'hunt') {
      targetId = pick(region.enemies);
      const en = enemyById(targetId); targetName = en ? en.name : targetId;
      need = rnd(3, 6);
      desc = '击杀 ' + need + ' 个【' + targetName + '】';
    } else if (kind === 'explore') {
      need = rnd(3, 5);
      desc = '在【' + region.name + '】探索 ' + need + ' 次';
    } else if (kind === 'visit') {
      const loc = pick(specialLocs);
      targetId = loc.id; targetName = loc.name;
      desc = '前往【' + loc.name + '】一探究竟';
    } else if (kind === 'boss') {
      targetId = region.boss;
      const en = enemyById(targetId); targetName = en ? en.name : targetId;
      desc = '击败此地霸主【' + targetName + '】';
    }
    const clue = pickMainClue();
    return {
      region: region.id, kind, targetId, targetName, need, progress: 0, desc,
      reward: { gold: round(25 + region.level * 4), exp: round(20 + region.level * 3) },
      clueId: clue ? clue.id : null
    };
  }
  function tryOfferMapQuest(regionId) {
    if (S.mapQuest) return;
    S.mapQuestOffered = S.mapQuestOffered || [];
    if (S.mapQuestOffered.indexOf(regionId) >= 0) return;
    const region = regionById(regionId);
    if (!region) return;
    if (region.hub) return;   // 城池无敌人/探索点/特殊地点，无法生成可完成的地图任务
    if (rndf() > 0.5) return;
    S.mapQuestOffered.push(regionId);
    const mq = genMapQuest(region);
    const issuer = pick(BOUNTY_ISSUERS);
    showNotice('🗺 地图任务 · ' + region.name, [
      issuer + ' 有事相求：' + mq.desc + '。',
      '完成另有报酬相谢（可选，拒绝无损失）。'
    ], [
      { text: '✔ 接下', cls: 'primary', fn: () => { S.mapQuest = mq; log('📜 接下地图任务：' + mq.desc + '。', 'event'); save(); } },
      { text: '暂不理会', fn: () => { log('你婉拒了这桩差事。', 'dim'); } }
    ]);
    save();
  }
  function completeMapQuest() {
    const mq = S.mapQuest;
    if (!mq) return null;
    applyEffect(mq.reward || {});
    updateMysteries(); checkGoals();
    log('🏆 地图任务完成：' + mq.desc + '（报酬 ' + rewardText(mq.reward || {}) + '）', 'level');
    S.mapQuest = null;
    save();
    return null;
  }
  function tickMapQuestKill(enemyId) {
    const mq = S.mapQuest;
    if (!mq || mq.region !== S.location.region) return;
    if ((mq.kind === 'hunt' || mq.kind === 'boss') && enemyId === mq.targetId) {
      mq.progress++;
      if (mq.progress >= mq.need) return completeMapQuest();
      else log('　地图任务进度：' + mq.progress + '/' + mq.need, 'hint');
    }
  }
  function tickMapQuestExplore() {
    const mq = S.mapQuest;
    if (!mq || mq.region !== S.location.region || mq.kind !== 'explore') return;
    mq.progress++;
    if (mq.progress >= mq.need) return completeMapQuest();
    else log('　地图任务进度：' + mq.progress + '/' + mq.need, 'hint');
  }
  function tickMapQuestVisit() {
    const mq = S.mapQuest;
    if (!mq || mq.region !== S.location.region || mq.kind !== 'visit') return;
    if (S.location.loc === mq.targetId) return completeMapQuest();
  }
  function screenClues() {
    log('🔍 主线线索', 'title');
    const got = S.player.clues.length;
    if (!got) {
      log('你还没有收集到任何主线线索。', 'dim');
      log('完成各地图任务，可逐步拼出你的身世与「山河一梦」的真相。', 'hint');
    } else {
      log('已收集 ' + got + '/' + MAIN_CLUES.length + ' 条线索：', 'hint');
      MAIN_CLUES.forEach((c) => {
        const has = S.player.clues.includes(c.id);
        log((has ? '✔ ' : '· ') + (has ? c.text : '？？？（未获得）'), has ? '' : 'dim');
      });
    }
    setActions([{ label: '← 返回', fn: () => screen('explore') }]);
  }
  function screenQuest() {
    log('📜 任务', 'title');
    log('🔍 主线线索：' + S.player.clues.length + '/' + MAIN_CLUES.length + '（「江湖」菜单可查看）', 'hint');
    const _abandonMQ = S.mapQuest ? [{ label: '🗑 放弃地图任务', fn: () => { S.mapQuest = null; log('你放弃了这桩地图任务。', 'dim'); save(); screenQuest(); } }] : [];
    if (S.mapQuest) {
      const mq = S.mapQuest;
      log('🗺 地图任务（' + regionById(mq.region).name + '）：' + mq.desc, 'good');
      log('　进度：' + mq.progress + '/' + mq.need, 'hint');
      log('　奖励：一条主线线索 + ' + rewardText(mq.reward) + '。', 'dim');
    }
    if (S.bounty) {
      const b = S.bounty;
      log('悬赏委托：' + b.issuer + ' 有求于你。', 'good');
      log('　去【' + b.regionName + '】击杀 ' + b.need + ' 个【' + b.enemyName + '】。', '');
      log('　进度：' + b.killed + '/' + b.need, 'hint');
      log('　报酬：' + b.reward.gold + ' 两 + ' + b.reward.exp + ' 经验。', 'dim');
      setActions(_abandonMQ.concat([{ label: '← 返回', fn: () => screen('explore') }]));
      return;
    }
    const q = S.quest;
    if (!q) {
      const done = QUESTS.filter((x) => S.player.flags['qdone_' + x.id]).length;
      log('你目前没有进行中的任务。', 'dim');
      log(done ? ('（已完成 ' + done + ' 条任务线）') : '（探索江湖时，或会触发新的委托）', 'dim');
      setActions(_abandonMQ.concat([{ label: '← 返回', fn: () => screen('explore') }]));
      return;
    }
    const qd = questById(q.id);
    const st = qd.steps[q.step];
    log('任务：' + qd.name + '（' + (q.step + 1) + '/' + qd.steps.length + '）', 'good');
    log(st.desc, '');
    log('　目标位置：前往【' + regionById(st.targetRegion).name + '】。', 'hint');
    setActions(_abandonMQ.concat([{ label: '← 返回', fn: () => screen('explore') }]));
  }

  // ============================================================
  //  手札（短目标 + 传闻 + 疑点）
  // ============================================================
  function genGoal() {
    const p = S.player;
    const pool = [];
    const killN = rnd(3, 8);
    pool.push({ type: 'kill', n: killN, label: '击败 ' + killN + ' 名敌人' });
    const goldN = p.gold + rnd(80, 300) * Math.max(1, Math.floor(p.level / 5));
    pool.push({ type: 'gold', n: goldN, label: '攒到 ' + goldN + ' 两银子' });
    const region = regionById(S.location.region);
    const exN = rnd(3, 5);
    pool.push({ type: 'explore', region: region.id, n: exN, label: '在【' + region.name + '】探索 ' + exN + ' 次' });
    const lvN = p.level + rnd(1, 3);
    pool.push({ type: 'level', n: lvN, label: '修炼至 ' + lvN + ' 级' });
    const learnN = rnd(1, 2);
    pool.push({ type: 'learn', from: p.techniques.length, n: learnN, label: '习得 ' + learnN + ' 门新功法' });
    const clN = Math.min(p.clues.length + 2, MAIN_CLUES.length);
    if (clN > p.clues.length) pool.push({ type: 'clue', n: clN, label: '收集 ' + clN + ' 条主线线索' });
    const g = pick(pool);
    return { id: 'g' + Date.now() + '_' + rnd(1, 99999), type: g.type, region: g.region || null, from: g.from || 0, n: g.n, label: g.label, progress: 0, reward: { gold: round(25 + p.level * 4), exp: round(18 + p.level * 3) }, done: false };
  }
  function refillGoals() {
    S.goals = (S.goals || []).filter((g) => !g.done);
    if (!S.goalQuota) S.goalQuota = rnd(2, 4);
    while (S.goals.length < S.goalQuota) S.goals.push(genGoal());
  }
  function checkGoals() {
    const p = S.player;
    S.goals = S.goals || [];
    let changed = false;
    for (const g of S.goals) {
      if (g.done) continue;
      let done = false;
      if (g.type === 'kill') done = g.progress >= g.n;
      else if (g.type === 'explore') done = g.progress >= g.n;
      else if (g.type === 'gold') done = p.gold >= g.n;
      else if (g.type === 'level') done = p.level >= g.n;
      else if (g.type === 'learn') done = (p.techniques.length - g.from) >= g.n;
      else if (g.type === 'clue') done = p.clues.length >= g.n;
      if (done) {
        g.done = true;
        applyEffect(g.reward);
        log('📓 手札目标完成：「' + g.label + '」（' + rewardText(g.reward) + '）', 'level');
        changed = true;
      }
    }
    if (changed) { refillGoals(); save(); }
  }
  function tickGoals(type, regionId) {
    if (!S.goals || !S.goals.length) return;
    let hit = false;
    for (const g of S.goals) {
      if (g.done) continue;
      if (type === 'kill' && g.type === 'kill') { g.progress++; hit = true; }
      else if (type === 'explore' && g.type === 'explore' && g.region === regionId) { g.progress++; hit = true; }
    }
    if (hit) checkGoals();
  }
  function maybeHearRumor() {
    if (rndf() > 0.03) return;
    const pool = RUMORS.filter((r) => !S.rumors.includes(r));
    if (!pool.length) return;
    const rumor = pick(pool);
    S.rumors.push(rumor);
    log('👂 江湖传闻：' + rumor, 'event');
  }
  function updateMysteries() {
    const n = S.player.clues.length;
    S.mysteryStatus = S.mysteryStatus || {};
    for (const m of MYSTERIES) {
      if (S.mysteryStatus[m.id] === 'solved') continue;
      if (n >= m.solveReq) {
        S.mysteryStatus[m.id] = 'solved';
        applyEffect(m.reward);
        log('🔎 疑点【' + m.name + '】解开：' + m.answer + '（' + rewardText(m.reward) + '）', 'level');
      } else if (n >= m.knowReq && !S.mysteryStatus[m.id]) {
        S.mysteryStatus[m.id] = 'known';
        log('🔎 你心中生出一个疑点【' + m.name + '】：' + m.question, 'event');
      }
    }
    triggerClueFinale();
  }
  function triggerClueFinale() {
    if (S.player.flags.clueFinale) return;
    if (S.player.clues.length < MAIN_CLUES.length) return;
    S.player.flags.clueFinale = true;
    logCard('story', '📖 真相大白 · 身世之谜');
    if (CLUE_FINALE.poem) appendLog('　' + CLUE_FINALE.poem, 'poem');
    for (const ln of CLUE_FINALE.lines) appendLog(ln, 'lore');
    closeCard();
    S.player.flags.seekSword = true;
    log('🗡 你得知守印世家有祖传神剑「守印剑·山河」埋于剑冢。', 'event');
    log('　先去剑冢击败【邪剑灵】，再到【冢心】挖取此剑。', 'hint');
    recordChronicle('finale', '集齐主线线索，身世真相大白');
    save();
  }
  function screenHandbook() {
    log('📓 手札', 'title');
    // 短目标
    S.goals = S.goals || [];
    checkGoals();
    const active = S.goals.filter((g) => !g.done);
    log('— 短目标（' + active.length + '/' + (S.goalQuota || active.length) + '）—', 'hint');
    if (!active.length) log('　（暂无目标）', 'dim');
    active.forEach((g) => {
      const prog = (g.type === 'kill' || g.type === 'explore') ? ('　' + g.progress + '/' + g.n) : '';
      log('　· ' + g.label + prog, '');
    });
    // 传闻
    log('— 江湖传闻（' + S.rumors.length + '/' + RUMORS.length + '）—', 'hint');
    if (!S.rumors.length) log('　（尚未听闻）', 'dim');
    S.rumors.forEach((r) => log('　· ' + r, ''));
    // 疑点
    S.mysteryStatus = S.mysteryStatus || {};
    const known = MYSTERIES.filter((m) => S.mysteryStatus[m.id]);
    log('— 疑点（' + known.length + '/' + MYSTERIES.length + '）—', 'hint');
    if (!known.length) log('　（尚无头绪）', 'dim');
    MYSTERIES.forEach((m) => {
      const st = S.mysteryStatus[m.id];
      if (st === 'solved') log('　✔【' + m.name + '】' + m.answer, 'good');
      else if (st === 'known') log('　？【' + m.name + '】' + m.question + '（线索 ' + S.player.clues.length + '/' + m.solveReq + '）', '');
      else log('　·【' + m.name + '】？？？（尚未察觉）', 'dim');
    });
    setActions([{ label: '← 返回', fn: () => screen('explore') }]);
  }

  // ============================================================
  //  固定秘密 + 一次性剧情装备
  // ============================================================
  function getSecretAt(regionId, locId) {
    return SECRETS.find((s) => s.region === regionId && s.loc === locId && !S.player.flags['secret_' + s.id] && (!s.cond || s.cond(S.player)));
  }
  function discoverSecret(id) {
    const s = SECRETS.find((x) => x.id === id);
    if (!s || S.player.flags['secret_' + id]) return;
    S.player.flags['secret_' + id] = true;
    logCard('story', '🔍 秘密 · ' + s.name);
    appendLog(s.desc, 'lore');
    closeCard();
    const rw = s.reward || {};
    if (rw.clue) {
      const clue = MAIN_CLUES.find((c) => c.id === rw.clue);
      if (clue && !S.player.clues.includes(rw.clue)) showClueNotice(grantClue(clue));
      else S.player.gold += 50;
    }
    applyEffect({ gold: rw.gold || 0, exp: rw.exp || 0, tech: rw.tech, weapon: rw.weapon, per: rw.per, moral: rw.moral, rep: rw.rep });
    if (rw.gold) log('　得银两 ' + rw.gold + '。', 'good');
    if (rw.per) log('　似有所悟，心境微变。', 'hint');
    updateMysteries();
    checkGoals();
    save();
    screen('explore');
  }

  // ============================================================
  //  江湖录（大事记）
  // ============================================================
  function recordChronicle(key, text) {
    S.chronicle = S.chronicle || [];
    if (key && S.player.flags['chron_' + key]) return;
    if (key) S.player.flags['chron_' + key] = true;
    S.chronicle.push(text);
    if (S.chronicle.length > 200) S.chronicle = S.chronicle.slice(-200);
  }
  function screenChronicle() {
    log('📜 江湖录', 'title');
    S.chronicle = S.chronicle || [];
    if (!S.chronicle.length) { log('江湖上还没有你的传说。', 'dim'); log('（大事会自动记录于此）', 'hint'); }
    S.chronicle.forEach((c, i) => log((i + 1) + ' · ' + c, i === S.chronicle.length - 1 ? 'level' : ''));
    setActions([{ label: '← 返回', fn: () => screen('explore') }]);
  }

  const SCREENS = {
    create: screenCreate, explore: screenExplore, combat: setCombatActions,
    bag: screenBag, equip: screenEquip, useitem: screenUseItem, combatItem: screenCombatItem,
    char: screenChar, realm: screenRealm, story: screenStory, tech: screenTech, learn: screenLearn, cultivate: screenCultivate, techEquip: screenTechEquip,
    talent: screenTalent, sect: screenSect, sectTask: screenSectTask,
    lover: screenLover, gift: screenGift, map: screenMap, loc: screenLoc, shop: screenShop, menu: screenMenu, help: screenHelp, quest: screenQuest, clues: screenClues, handbook: screenHandbook, chronicle: screenChronicle, achievements: screenAchievements
  };

  // ============================================================
  //  启动 / 绑定
  // ============================================================
  function closeNavDrops(except) {
    document.querySelectorAll('.nav-item.open').forEach((n) => { if (n !== except) n.classList.remove('open'); });
  }
  function bindUI() {
    // 分组导航：点「分类」展开/收起子菜单
    document.querySelectorAll('#nav .nav-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');
        closeNavDrops();
        if (!wasOpen) item.classList.add('open');
      });
    });
    // 子菜单/直达按钮：跳转并收起
    $('nav').querySelectorAll('button[data-screen]').forEach((b) => b.addEventListener('click', () => { closeNavDrops(); screen(b.getAttribute('data-screen')); }));
    // 点击别处收起子菜单
    document.addEventListener('click', () => closeNavDrops());
    $('createConfirm').addEventListener('click', confirmCreate);
    $('nameInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmCreate(); });
    $('startBtn').addEventListener('click', doBoot);
    // 物品名悬停浮窗（委托到日志容器）
    buildItemTips();
    const _logEl = $('log');
    if (_logEl) {
      _logEl.addEventListener('mouseover', (ev) => { const el = ev.target && ev.target.closest ? ev.target.closest('.hl-item') : null; if (el) { const n = el.getAttribute('data-name'); if (n && ITEM_TIPS[n]) showTooltip(ITEM_TIPS[n], ev); } });
      _logEl.addEventListener('mouseout', (ev) => { const el = ev.target && ev.target.closest ? ev.target.closest('.hl-item') : null; if (el) hideTooltip(); });
      _logEl.addEventListener('mousemove', (ev) => { const el = ev.target && ev.target.closest ? ev.target.closest('.hl-item') : null; if (el) positionTooltip(ev); });
    }
    // 主界面右上角音乐开关
    const _musicBtn = $('musicBtn');
    if (_musicBtn) {
      const _mupd = () => {
        const _on = !!(window.WuxiaMusic && window.WuxiaMusic.isOn());
        _musicBtn.textContent = _on ? '🔊' : '🔇';
        _musicBtn.classList.toggle('off', !_on);
        _musicBtn.title = _on ? '音乐：开（点击关闭）' : '音乐：关（点击开启）';
      };
      _mupd();
      _musicBtn.addEventListener('click', () => { if (window.WuxiaMusic) window.WuxiaMusic.toggle(); _mupd(); });
    }
  }
  function boot() {
    const st = $('startScreen');
    if (st) st.style.display = 'flex';
  }
  function doBoot() {
    const st = $('startScreen');
    if (st) st.style.display = 'none';
    if (window.WuxiaMusic && window.WuxiaMusic.isOn()) window.WuxiaMusic.start();
    if (hasSave()) { load(); if (S && S.player) { $('createPanel').style.display = 'none'; const el = $('log'); el.innerHTML = ''; S.log.forEach((l) => { const d = document.createElement('div'); d.className = 'log-line ' + (l.c || ''); if (l.html) d.innerHTML = l.t; else d.textContent = l.t; el.appendChild(d); }); el.scrollTop = el.scrollHeight; if (S.combat) { S.screen = 'combat'; renderScreen(); } else { if (S.screen === 'combat') S.screen = 'explore'; screen('explore'); } return; } }
    S = { player: null, screen: 'create', talentBranch: null, pendingEvent: null, combat: null, log: [] };
    screen('create');
  }

  document.addEventListener('DOMContentLoaded', () => { applyStaticIcons(); bindUI(); boot(); });
})();
