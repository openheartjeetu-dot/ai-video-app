import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Alert
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const CATALOG = [
 {id:'his_girl_friday',t:'His Girl Friday',y:1940,g:'Comedy',d:'Cary Grant comedy about a fast-talking reporter.',nw:1},
 {id:'night_of_the_living_dead',t:'Night of the Living Dead',y:1968,g:'Horror',d:'The original zombie nightmare.',nw:1},
 {id:'house_on_haunted_hill',t:'House on Haunted Hill',y:1959,g:'Horror',d:'Five strangers, a haunted house, $10,000 each.',nw:1},
 {id:'the_brain_that_wouldnt_die',t:'The Brain That Would Not Die',y:1962,g:'Sci-Fi',d:'A scientist keeps his fiancee alive.',nw:1},
 {id:'charade',t:'Charade',y:1963,g:'Thriller',d:'Cary Grant and Audrey Hepburn mystery.',nw:1},
 {id:'detour',t:'Detour',y:1945,g:'Noir',d:'A doomed hitchhiking noir classic.',nw:1},
 {id:'carnival_of_souls',t:'Carnival of Souls',y:1962,g:'Horror',d:'A woman haunted by a strange carnival.'},
 {id:'the_last_man_on_earth',t:'The Last Man on Earth',y:1964,g:'Sci-Fi',d:'Vincent Price, alone after a plague.'},
];
const thumb = id => 'https://archive.org/services/get-item-image.php?identifier=' + id;
const vid = async (id, saver) => {
  const r = await fetch('https://archive.org/metadata/' + id);
  const j = await r.json();
  const fs = (j.files || []).filter(f => f.name && f.name.endsWith('.mp4'));
  const f = (saver ? fs.find(x => x.name.includes('512kb')) : null) || fs.find(x => !x.name.includes('512kb')) || fs[0];
  if (!f) throw new Error('none');
  return 'https://archive.org/download/' + id + '/' + encodeURIComponent(f.name);
};
const CHANNELS = [
 {n:'Sports 1',e:'🏏',c:'#e74c3c'},{n:'Movie Max',e:'🎬',c:'#8e44ad'},
 {n:'Toon Town',e:'🧸',c:'#f39c12'},{n:'News 24',e:'📰',c:'#2980b9'},
 {n:'Music Box',e:'🎵',c:'#16a085'},{n:'Docu World',e:'🌍',c:'#27ae60'},
];
const CATS = ['💥 Action','🏔️ Adventure','😂 Comedy','🎭 Drama','💀 Horror','💗 Romance',' Sci-Fi','⊞ More'];
function TopBar({ onSearch, onPremium }) {
  return (
    <View style={st.topBar}>
      <Text style={st.logo}>AURA<Text style={st.logo2}>STREAM</Text><Text style={st.logo3}>▷</Text></Text>
      <TouchableOpacity style={st.searchPill} onPress={onSearch}><Text style={st.searchPillTxt}>🔍 Search movies, shows...</Text></TouchableOpacity>
      <TouchableOpacity style={st.premPill} onPress={onPremium}><Text style={st.premPillTxt}>👑</Text></TouchableOpacity>
    </View>
  );
}
function Hero({ m, onPlay, onInfo }) {
  return (
    <View style={st.hero}>
      <Image source={{ uri: thumb(m.id) }} style={st.heroImg} resizeMode="cover" />
      <View style={st.heroGrad} />
      <View style={st.heroTxt}>
        <View style={st.heroTagBox}><Text style={st.heroTag}>🔥 Trending Now</Text></View>
        <Text style={st.heroTitle}>{m.t}</Text>
        <Text style={st.heroSub}>{m.y} • {m.g} • HD</Text>
        <Text style={st.heroDesc} numberOfLines={2}>{m.d}</Text>
        <View style={st.heroBtns}>
          <TouchableOpacity style={st.playBtn} onPress={() => onPlay(m)}><Text style={st.playTxt}>▶ Watch Now</Text></TouchableOpacity>
          <TouchableOpacity style={st.infoBtn} onPress={() => onInfo(m)}><Text style={st.infoTxt}>+ My List</Text></TouchableOpacity>
        </View>
        <View style={st.dots}><View style={st.dotOn} /><View style={st.dot} /><View style={st.dot} /><View style={st.dot} /></View>
      </View>
    </View>
  );
}
function QuickCards({ go }) {
  const Q = [
    { l: 'Movies', s: 'Browse all', e: '🎬', c: '#8b5cf6', p: 'movies' },
    { l: 'TV Shows', s: 'Popular', e: '📺', c: '#ec4899', p: 'tv' },
    { l: 'Live TV', s: '6 Channels', e: '📡', c: '#ef4444', p: 'live' },
    { l: 'Kids Zone', s: 'Fun & safe', e: '😊', c: '#f59e0b', p: 'kids' },
    { l: 'Downloads', s: 'Offline', e: '⬇️', c: '#22c55e', p: 'dl' },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.quickRow}>
      {Q.map(q => (
        <TouchableOpacity key={q.l} style={st.quickCard} onPress={() => go(q.p)}>
          <View style={[st.quickIco, { backgroundColor: q.c + '33' }]}><Text style={st.quickIcoTxt}>{q.e}</Text></View>
          <Text style={st.quickLbl}>{q.l}</Text>
          <Text style={st.quickSub}>{q.s}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
function PosterCard({ m, onOpen, badge }) {
  return (
    <TouchableOpacity style={st.card} onPress={() => onOpen(m)} activeOpacity={0.85}>
      <Image source={{ uri: thumb(m.id) }} style={st.cardImg} resizeMode="cover" />
      {badge ? <View style={st.newBadge}><Text style={st.newTxt}>{badge}</Text></View> : null}
      <View style={st.cardGrad} />
      <Text style={st.cardTitle} numberOfLines={2}>{m.t}</Text>
      <Text style={st.cardYear}>{m.y}</Text>
    </TouchableOpacity>
  );
}
function ContinueCard({ m, onOpen }) {
  return (
    <TouchableOpacity style={st.contCard} onPress={() => onOpen(m)} activeOpacity={0.85}>
      <Image source={{ uri: thumb(m.id) }} style={st.contImg} resizeMode="cover" />
      <View style={st.contPlay}><Text style={st.contPlayTxt}>▶</Text></View>
      <Text style={st.cardTitle} numberOfLines={1}>{m.t}</Text>
      <Text style={st.cardYear}>1h 20m left</Text>
      <View style={st.prog}><View style={[st.progFill, { width: '45%' }]} /></View>
    </TouchableOpacity>
  );
}
function Row({ title, children, onAll }) {
  return (
    <View style={st.row}>
      <View style={st.rowHead}><Text style={st.rowTitle}>{title}</Text><TouchableOpacity onPress={onAll}><Text style={st.viewAll}>View All</Text></TouchableOpacity></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.rowScroll}>{children}</ScrollView>
    </View>
  );
}
function ChannelCard({ ch }) {
  return (
    <TouchableOpacity style={st.chCard} onPress={() => Alert.alert(ch.n, 'Live TV unlocks at public launch 📡')}>
      <View style={[st.chLogo, { backgroundColor: ch.c + '22' }]}><Text style={st.chEmoji}>{ch.e}</Text></View>
      <Text style={st.chName}>{ch.n}</Text>
    </TouchableOpacity>
  );
}
function Home({ onOpen, onPlay, go, list, onList }) {
  const feat = CATALOG[2];
  return (
    <ScrollView style={st.page} showsVerticalScrollIndicator={false}>
      <TopBar onSearch={() => go('explore')} onPremium={() => go('premium')} />
      <Hero m={feat} onPlay={onPlay} onInfo={onOpen} />
      <QuickCards go={go} />
      <Row title="Continue Watching">
        {CATALOG.slice(0, 4).map(m => <ContinueCard key={m.id} m={m} onOpen={onOpen} />)}
      </Row>
      <Row title="New Releases" onAll={() => go('movies')}>
        {CATALOG.filter(m => m.nw).map(m => <PosterCard key={m.id} m={m} onOpen={onOpen} badge="NEW" />)}
      </Row>
      <View style={st.rowHead2}>
        <Text style={st.rowTitle}>Categories</Text>
        <TouchableOpacity onPress={() => go('explore')}><Text style={st.viewAll}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chipRow}>
        {CATS.map(c => (
          <TouchableOpacity key={c} style={st.chip} onPress={() => go('explore')}>
            <Text style={st.chipTxt}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Row title="Live TV Channels" onAll={() => go('live')}>
        {CHANNELS.map(ch => <ChannelCard key={ch.n} ch={ch} />)}
      </Row>
      <Row title="Top Picks For You" onAll={() => go('movies')}>
        {CATALOG.slice(4).map(m => <PosterCard key={m.id} m={m} onOpen={onOpen} />)}
      </Row>
      <View style={st.featStrip}>
        <View style={st.feat}><Text style={st.featIco}>📱</Text><Text style={st.featT1}>Watch Anywhere</Text><Text style={st.featT2}>Mobile & TV</Text></View>
        <View style={st.feat}><Text style={st.featIco}>⬇️</Text><Text style={st.featT1}>Download & Go</Text><Text style={st.featT2}>Offline mode</Text></View>
        <View style={st.feat}><Text style={st.featIco}>👥</Text><Text style={st.featT1}>Profiles</Text><Text style={st.featT2}>For family</Text></View>
        <View style={st.feat}><Text style={st.featIco}>4K</Text><Text style={st.featT1}>HD & 4K</Text><Text style={st.featT2}>Best quality</Text></View>
      </View>
      <View style={st.foot}><Text style={st.footTxt}>AuraStream v1.0 • Made with ❤️ in India</Text></View>
    </ScrollView>
  );
}
function Grid({ items, onOpen }) {
  return <ScrollView contentContainerStyle={st.grid}>{items.map(m => <PosterCard key={m.id} m={m} onOpen={onOpen} />)}</ScrollView>;
}
function ExplorePage({ onOpen }) {
  const [q, setQ] = useState('');
  const res = CATALOG.filter(m => (m.t + m.g).toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>🧭 Explore</Text>
      <TextInput style={st.input} placeholder="Movies, shows, genres..." placeholderTextColor="#777" value={q} onChangeText={setQ} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chipRow}>
        {CATS.map(c => <TouchableOpacity key={c} style={st.chip} onPress={() => setQ(c.split(' ')[1])}><Text style={st.chipTxt}>{c}</Text></TouchableOpacity>)}
      </ScrollView>
      <Grid items={res} onOpen={onOpen} />
    </View>
  );
}
function MoviesPage({ onOpen }) {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>🎬 Movies</Text>
      <Grid items={CATALOG} onOpen={onOpen} />
    </View>
  );
}
function TVPage({ onOpen }) {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>📺 TV Shows</Text>
      <Text style={st.empty}>Classic shows premiere at launch!{'\n'}Meanwhile, enjoy timeless movies. 🎬</Text>
      <Grid items={CATALOG.slice(0, 4)} onOpen={onOpen} />
    </View>
  );
}
function KidsPage({ onOpen }) {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>😊 Kids Zone</Text>
      <Text style={st.empty}>Safe & fun cartoons coming soon! 🧸</Text>
      <Grid items={CATALOG.filter(m => m.g === 'Sci-Fi' || m.g === 'Comedy')} onOpen={onOpen} />
    </View>
  );
}
function LivePage() {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>📡 Live TV</Text>
      <ScrollView contentContainerStyle={st.liveGrid}>
        {CHANNELS.map(ch => <ChannelCard key={ch.n} ch={ch} />)}
      </ScrollView>
    </View>
  );
}
function PremiumPage() {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>👑 Premium</Text>
      <View style={st.premCard}>
        <Text style={st.premTitle}>AuraStream Premium</Text>
        <Text style={st.premPrice}>₹99<Text style={st.premPer}>/month</Text></Text>
        <Text style={st.premFeat}>✅ 4K streaming{'\n'}✅ Downloads (offline){'\n'}✅ No ads, ever{'\n'}✅ 4 family profiles</Text>
        <TouchableOpacity style={st.playBtn} onPress={() => Alert.alert('Coming soon', 'Payments activate at Play Store launch! 👑')}>
          <Text style={st.playTxt}>👑 Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const TABS = [
 { id: 'home', i: '🏠', l: 'Home' },
 { id: 'explore', i: '🧭', l: 'Explore' },
 { id: 'live', i: '📡', l: 'Live TV' },
 { id: 'list', i: '❤️', l: 'My List' },
 { id: 'dl', i: '⬇️', l: 'Downloads' },
 { id: 'settings', i: '⚙️', l: 'Settings' },
];
export default function App() {
  const [tab, setTab] = useState('home');
  const [detail, setDetail] = useState(null);
  const [playUrl, setPlayUrl] = useState(null);
  const [list, setList] = useState([]);
  const [saver, setSaver] = useState(false);
  const [loading, setLoading] = useState(false);
  const play = async m => {
    setLoading(true);
    try { setPlayUrl(await vid(m.id, saver)); }
    catch (e) { Alert.alert('Not available', 'No stream right now.'); }
    setLoading(false);
  };
  const toggleList = id => setList(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);
  const go = p => { setDetail(null); setTab(p); };
  if (playUrl) return (
    <View style={st.app}>
      <Player url={playUrl} onBack={() => setPlayUrl(null)} />
      <StatusBar style="light" />
    </View>
  );
  return (
    <View style={st.app}>
      {detail ? <Detail m={detail} onBack={() => setDetail(null)} onPlay={() => play(detail)} inList={list.includes(detail.id)} onList={() => toggleList(detail.id)} />
        : tab === 'home' ? <Home onOpen={setDetail} onPlay={play} go={go} list={list} onList={toggleList} />
        : tab === 'explore' ? <ExplorePage onOpen={setDetail} />
        : tab === 'live' ? <LivePage />
        : tab === 'list' ? <MyListPage list={list} onOpen={setDetail} />
        : tab === 'dl' ? <DownloadsPage go={go} />
        : <SettingsPage saver={saver} setSaver={setSaver} go={go} />}
      {!detail && (
        <View style={st.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} style={st.tab} onPress={() => setTab(t.id)}>
              <Text style={[st.tabIco, tab === t.id && st.tabOn]}>{t.i}</Text>
              <Text style={[st.tabTxt, tab === t.id && st.tabOn]}>{t.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#8b5cf6" style={st.spin} />}
      <StatusBar style="light" />
    </View>
  );
}
const st = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#0a0a14' },
  page: { flex: 1, backgroundColor: '#0a0a14' },
  pgTitle: { color: '#fff', fontSize: 26, fontWeight: '900', margin: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  logo: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logo2: { color: '#8b5cf6' },
  logo3: { color: '#8b5cf6', fontSize: 16 },
  searchPill: { flex: 1, backgroundColor: '#1c1c2e', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  searchPillTxt: { color: '#777', fontSize: 12 },
  premPill: { backgroundColor: '#2a2140', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#8b5cf6' },
  premPillTxt: { fontSize: 14 },
  hero: { height: 320, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(10,10,20,0.3)', shadowColor: '#000', shadowOpacity: 0.95, shadowRadius: 70, shadowOffset: { width: 0, height: -50 } },
  heroTxt: { position: 'absolute', bottom: 12, left: 14, right: 14 },
  heroTagBox: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 },
  heroTag: { color: '#ffb347', fontSize: 11, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  heroSub: { color: '#ccc', fontSize: 12, marginVertical: 3 },
  heroDesc: { color: '#9aa', fontSize: 12, marginBottom: 8 },
  heroBtns: { flexDirection: 'row', gap: 8 },
  playBtn: { backgroundColor: '#8b5cf6', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 20, alignItems: 'center', marginHorizontal: 16, marginTop: 6 },
  playTxt: { color: '#fff', fontWeight: '800' },
  infoBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center' },
  infoTxt: { color: '#fff', fontWeight: '700' },
  listOn: { backgroundColor: '#22c55e' },
  dots: { flexDirection: 'row', gap: 4, marginTop: 10, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#555' },
  dotOn: { width: 16, height: 6, borderRadius: 3, backgroundColor: '#8b5cf6' },
  quickRow: { paddingHorizontal: 12, marginTop: 14 },
  quickCard: { width: 108, backgroundColor: '#16162a', borderRadius: 12, padding: 10, marginRight: 10 },
  quickIco: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickIcoTxt: { fontSize: 17 },
  quickLbl: { color: '#fff', fontSize: 12, fontWeight: '800' },
  quickSub: { color: '#778', fontSize: 10, marginTop: 2 },
  row: { marginTop: 18 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 8 },
  rowHead2: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 18, marginBottom: 8 },
  rowTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  viewAll: { color: '#8b5cf6', fontSize: 12, fontWeight: '700' },
  rowScroll: { paddingHorizontal: 14 },
  card: { width: 120, marginRight: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#16162a' },
  cardImg: { width: 120, height: 170 },
  newBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#8b5cf6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, zIndex: 2 },
  newTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardGrad: { position: 'absolute', bottom: 0, height: 70, left: 0, right: 0, backgroundColor: 'rgba(10,10,20,0.35)', shadowColor: '#000', shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: -20 } },
  cardTitle: { position: 'absolute', bottom: 18, left: 6, right: 6, color: '#fff', fontSize: 12, fontWeight: '700' },
  cardYear: { position: 'absolute', bottom: 4, left: 6, color: '#9aa', fontSize: 10 },
  contCard: { width: 150, marginRight: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#16162a', paddingBottom: 8 },
  contImg: { width: 150, height: 90 },
  contPlay: { position: 'absolute', top: 28, left: 58, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  contPlayTxt: { color: '#fff', fontSize: 12 },
  prog: { height: 3, backgroundColor: '#333', borderRadius: 2, marginHorizontal: 8, marginTop: 6 },
  progFill: { height: 3, backgroundColor: '#ec4899', borderRadius: 2 },
  chipRow: { paddingHorizontal: 14, marginTop: 4 },
  chip: { backgroundColor: '#16162a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#222' },
  chipTxt: { color: '#ddd', fontSize: 12, fontWeight: '700' },
  chCard: { width: 96, marginRight: 10, backgroundColor: '#16162a', borderRadius: 12, padding: 10, alignItems: 'center' },
  chLogo: { width: 52, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  chEmoji: { fontSize: 18 },
  chName: { color: '#ccc', fontSize: 11, fontWeight: '700' },
  liveGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 14, gap: 10 },
  featStrip: { flexDirection: 'row', margin: 16, backgroundColor: '#16162a', borderRadius: 14, padding: 12, justifyContent: 'space-between' },
  feat: { alignItems: 'center', width: '24%' },
  featIco: { fontSize: 16, color: '#8b5cf6', fontWeight: '900' },
  featT1: { color: '#fff', fontSize: 10, fontWeight: '800', marginTop: 4 },
  featT2: { color: '#778', fontSize: 9, marginTop: 2 },
  foot: { padding: 20, alignItems: 'center' },
  footTxt: { color: '#556', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  input: { backgroundColor: '#1c1c2e', color: '#fff', borderRadius: 12, marginHorizontal: 14, marginBottom: 10, padding: 12, fontSize: 15 },
  empty: { color: '#778', textAlign: 'center', marginTop: 30, marginBottom: 16, fontSize: 14, lineHeight: 22, paddingHorizontal: 30 },
  dHero: { height: 340 },
  dHeroImg: { width: '100%', height: '100%' },
  dGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, backgroundColor: 'rgba(10,10,20,0.4)', shadowColor: '#000', shadowOpacity: 1, shadowRadius: 80, shadowOffset: { width: 0, height: -50 } },
  backBtn: { position: 'absolute', top: 16, left: 14, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  backTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  dTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  dTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  dMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dMetaTxt: { color: '#bbb', fontSize: 12 },
  dBadge: { color: '#8b5cf6', fontSize: 12, fontWeight: '800', backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  dBody: { padding: 16 },
  dHead: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 18, marginBottom: 6 },
  dDesc: { color: '#aab', fontSize: 14, lineHeight: 22 },
  playerWrap: { flex: 1, backgroundColor: '#000' },
  player: { flex: 1 },
  setCard: { backgroundColor: '#16162a', borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 16 },
  setName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  setVal: { color: '#889', fontSize: 13, lineHeight: 20 },
  premCard: { marginHorizontal: 16, borderRadius: 18, padding: 22, backgroundColor: '#1a1430', borderWidth: 1, borderColor: '#8b5cf6' },
  premTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  premPrice: { color: '#8b5cf6', fontSize: 34, fontWeight: '900', marginVertical: 8 },
  premPer: { color: '#778', fontSize: 14, fontWeight: '600' },
  premFeat: { color: '#ccc', fontSize: 14, lineHeight: 26, marginBottom: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#12121f', borderTopWidth: 1, borderTopColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIco: { fontSize: 16 },
  tabTxt: { color: '#667', fontSize: 9, fontWeight: '700', marginTop: 2 },
  tabOn: { color: '#8b5cf6' },
  spin: { position: 'absolute', top: '45%', left: '48%' },
});
