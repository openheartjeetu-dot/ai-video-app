import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Alert
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const APP_NAME = 'AuraStream';
const CATALOG = [
 {id:'his_girl_friday',t:'His Girl Friday',y:1940,g:'Comedy',d:'Cary Grant comedy about a fast-talking reporter.'},
 {id:'night_of_the_living_dead',t:'Night of the Living Dead',y:1968,g:'Horror',d:'The original zombie nightmare.'},
 {id:'house_on_haunted_hill',t:'House on Haunted Hill',y:1959,g:'Horror',d:'Five strangers, a haunted house, $10,000 each.'},
 {id:'the_brain_that_wouldnt_die',t:'The Brain That Would Not Die',y:1962,g:'Sci-Fi',d:'A scientist keeps his fiancee alive.'},
 {id:'charade',t:'Charade',y:1963,g:'Thriller',d:'Cary Grant and Audrey Hepburn mystery.'},
 {id:'detour',t:'Detour',y:1945,g:'Noir',d:'A doomed hitchhiking noir classic.'},
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
function Player({ url, onBack }) {
  const player = useVideoPlayer(url, p => { p.play(); });
  return (
    <View style={st.playerWrap}>
      <VideoView player={player} style={st.player} allowsFullscreen />
      <TouchableOpacity style={st.backBtn} onPress={onBack}>
        <Text style={st.backTxt}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function Detail({ m, onBack, onPlay, inList, onList }) {
  return (
    <View style={st.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={st.dHero}>
          <Image source={{ uri: thumb(m.id) }} style={st.dHeroImg} resizeMode="cover" />
          <View style={st.dGrad} />
          <TouchableOpacity style={st.backBtn} onPress={onBack}>
            <Text style={st.backTxt}>←</Text>
          </TouchableOpacity>
          <View style={st.dTitleBox}>
            <Text style={st.dTitle}>{m.t}</Text>
            <View style={st.dMeta}>
              <Text style={st.dMetaTxt}>{m.y}</Text>
              <Text style={st.dMetaTxt}>•</Text>
              <Text style={st.dBadge}>{m.g}</Text>
              <Text style={st.dMetaTxt}>• HD</Text>
            </View>
          </View>
        </View>
        <View style={st.dBody}>
          <TouchableOpacity style={st.playBtn} onPress={onPlay}>
            <Text style={st.playTxt}>▶ Watch Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.listBtn, inList && st.listBtnOn]} onPress={onList}>
            <Text style={st.listTxt}>{inList ? '✓ In My List' : '+ My List'}</Text>
          </TouchableOpacity>
          <Text style={st.dHead}>Story</Text>
          <Text style={st.dDesc}>{m.d}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
function Card({ m, onOpen }) {
  return (
    <TouchableOpacity style={st.card} onPress={onOpen} activeOpacity={0.8}>
      <Image source={{ uri: thumb(m.id) }} style={st.cardImg} resizeMode="cover" />
      <View style={st.cardGrad} />
      <Text style={st.cardTitle} numberOfLines={2}>{m.t}</Text>
      <Text style={st.cardYear}>{m.y}</Text>
    </TouchableOpacity>
  );
}

function Row({ title, items, onOpen }) {
  return (
    <View style={st.row}>
      <Text style={st.rowTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.rowScroll}>
        {items.map(m => <Card key={m.id} m={m} onOpen={() => onOpen(m)} />)}
      </ScrollView>
    </View>
  );
}

function Home({ onOpen, onPlay, onSearch }) {
  const feat = CATALOG[2];
  return (
    <ScrollView style={st.page} showsVerticalScrollIndicator={false}>
      <View style={st.topBar}>
        <Text style={st.logo}>AURA<Text style={st.logo2}>STREAM</Text></Text>
        <TouchableOpacity style={st.searchPill} onPress={onSearch}>
          <Text style={st.searchPillTxt}>🔍 Search movies...</Text>
        </TouchableOpacity>
      </View>
      <View style={st.hero}>
        <Image source={{ uri: thumb(feat.id) }} style={st.heroImg} resizeMode="cover" />
        <View style={st.heroGrad} />
        <View style={st.heroTxt}>
          <Text style={st.heroTag}>🔥 Trending Now</Text>
          <Text style={st.heroTitle}>{feat.t}</Text>
          <Text style={st.heroSub}>{feat.y} • {feat.g} • HD</Text>
          <View style={st.heroBtns}>
            <TouchableOpacity style={st.playBtn} onPress={() => onPlay(feat)}>
              <Text style={st.playTxt}>▶ Watch Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.listBtn} onPress={() => onOpen(feat)}>
              <Text style={st.listTxt}>ℹ️ Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Row title="🎬 Continue Watching" items={CATALOG.slice(0, 4)} onOpen={onOpen} />
      <Row title="🔥 New Releases" items={CATALOG.slice(4)} onOpen={onOpen} />
      <Row title="👻 Horror" items={CATALOG.filter(m => m.g === 'Horror')} onOpen={onOpen} />
      <Row title="🚀 Sci-Fi" items={CATALOG.filter(m => m.g === 'Sci-Fi')} onOpen={onOpen} />
      <View style={st.foot}>
        <Text style={st.footTxt}>AuraStream v1.0 • Made with ❤️ in India</Text>
      </View>
    </ScrollView>
  );
}
function SearchPage({ onOpen }) {
  const [q, setQ] = useState('');
  const res = CATALOG.filter(m => (m.t + m.g).toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>🔍 Search</Text>
      <TextInput style={st.input} placeholder="Movies, genres..." placeholderTextColor="#777" value={q} onChangeText={setQ} />
      <ScrollView contentContainerStyle={st.grid}>
        {(q ? res : CATALOG).map(m => <Card key={m.id} m={m} onOpen={() => onOpen(m)} />)}
      </ScrollView>
    </View>
  );
}

function MyListPage({ list, onOpen }) {
  const items = CATALOG.filter(m => list.includes(m.id));
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>❤️ My List</Text>
      {items.length === 0 ? <Text style={st.empty}>No saved movies yet.{'\n'}Tap "+ My List" on any movie.</Text>
        : <ScrollView contentContainerStyle={st.grid}>{items.map(m => <Card key={m.id} m={m} onOpen={() => onOpen(m)} />)}</ScrollView>}
    </View>
  );
}

function DownloadsPage() {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>⬇️ Downloads</Text>
      <Text style={st.empty}>No offline movies yet.{'\n'}Downloads unlock with Premium 👑</Text>
      <TouchableOpacity style={st.playBtn}><Text style={st.playTxt}>👑 Go Premium</Text></TouchableOpacity>
    </View>
  );
}

function SettingsPage({ saver, setSaver }) {
  return (
    <View style={st.page}>
      <Text style={st.pgTitle}>⚙️ Settings</Text>
      <View style={st.setCard}>
        <Text style={st.setName}>👤 Profile</Text>
        <Text style={st.setVal}>Jeet • Free Plan</Text>
      </View>
      <TouchableOpacity style={st.setCard} onPress={() => setSaver(!saver)}>
        <Text style={st.setName}>📶 Data Saver Mode</Text>
        <Text style={st.setVal}>{saver ? '✅ ON (low data)' : '⬜ OFF (HD quality)'}</Text>
      </TouchableOpacity>
      <View style={st.setCard}>
        <Text style={st.setName}>🎬 Video Quality</Text>
        <Text style={st.setVal}>{saver ? '480p' : 'Auto (HD)'}</Text>
      </View>
      <View style={st.setCard}>
        <Text style={st.setName}>ℹ️ About</Text>
        <Text style={st.setVal}>AuraStream v1.0{'\n'}100% legal public-domain movies</Text>
      </View>
    </View>
  );
}
const st = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0a0a14', paddingTop: 8 },
  pgTitle: { color: '#fff', fontSize: 26, fontWeight: '800', margin: 16 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  logo: { color: '#fff', fontSize: 24, fontWeight: '900' },
  logo2: { color: '#8b5cf6' },
  searchPill: { flex: 1, marginLeft: 14, backgroundColor: '#1c1c2e', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  searchPillTxt: { color: '#777', fontSize: 13 },
  hero: { height: 300, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: 'rgba(10,10,20,0.25)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, shadowColor: '#000', shadowOpacity: 0.9, shadowRadius: 60, shadowOffset: { width: 0, height: -40 } },
  heroTxt: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  heroTag: { color: '#ffb347', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  heroSub: { color: '#bbb', fontSize: 12, marginVertical: 4 },
  heroBtns: { flexDirection: 'row', gap: 8 },
  playBtn: { backgroundColor: '#8b5cf6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22, alignItems: 'center' },
  playTxt: { color: '#fff', fontWeight: '800' },
  listBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center' },
  listBtnOn: { backgroundColor: '#22c55e' },
  listTxt: { color: '#fff', fontWeight: '700' },
  row: { marginTop: 18 },
  rowTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginHorizontal: 16, marginBottom: 8 },
  rowScroll: { paddingHorizontal: 14, gap: 10 },
  card: { width: 120, marginRight: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#16162a' },
  cardImg: { width: 120, height: 170 },
  cardGrad: { position: 'absolute', bottom: 0, height: 70, left: 0, right: 0, backgroundColor: 'rgba(10,10,20,0.35)', shadowColor: '#000', shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: -20 } },
  cardTitle: { position: 'absolute', bottom: 18, left: 6, right: 6, color: '#fff', fontSize: 12, fontWeight: '700' },
  cardYear: { position: 'absolute', bottom: 4, left: 6, color: '#9aa', fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  input: { backgroundColor: '#1c1c2e', color: '#fff', borderRadius: 12, margin: 14, padding: 12, fontSize: 15 },
  empty: { color: '#778', textAlign: 'center', marginTop: 60, fontSize: 14, lineHeight: 22 },
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
  foot: { padding: 30, alignItems: 'center' },
  footTxt: { color: '#556', fontSize: 12 },
  app: { flex: 1, backgroundColor: '#0a0a14' },
  tabs: { flexDirection: 'row', backgroundColor: '#12121f', borderTopWidth: 1, borderTopColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIco: { fontSize: 18 },
  tabTxt: { color: '#667', fontSize: 10, fontWeight: '700', marginTop: 2 },
  tabOn: { color: '#8b5cf6' },
  spin: { position: 'absolute', top: '45%', left: '48%' },
});
const TABS = [
  { id: 'home', i: '🏠', l: 'Home' },
  { id: 'search', i: '🔍', l: 'Search' },
  { id: 'list', i: '❤️', l: 'My List' },
  { id: 'dl', i: '⬇️', l: 'Downloads' },
  { id: 'set', i: '⚙️', l: 'Settings' },
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
    catch (e) { Alert.alert('Not available', 'This movie has no stream right now.'); }
    setLoading(false);
  };
  const toggleList = id => setList(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);

  if (playUrl) return (
    <View style={st.app}>
      <Player url={playUrl} onBack={() => setPlayUrl(null)} />
      <StatusBar style="light" />
    </View>
  );

  return (
    <View style={st.app}>
      {detail ? (
        <Detail m={detail} onBack={() => setDetail(null)} onPlay={() => play(detail)}
          inList={list.includes(detail.id)} onList={() => toggleList(detail.id)} />
      ) : tab === 'home' ? (
        <Home onOpen={setDetail} onPlay={play} onSearch={() => setTab('search')} />
      ) : tab === 'search' ? (
        <SearchPage onOpen={setDetail} />
      ) : tab === 'list' ? (
        <MyListPage list={list} onOpen={setDetail} />
      ) : tab === 'dl' ? (
        <DownloadsPage />
      ) : (
        <SettingsPage saver={saver} setSaver={setSaver} />
      )}
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
const TABS = [
  { id: 'home', i: '🏠', l: 'Home' },
  { id: 'search', i: '🔍', l: 'Search' },
  { id: 'list', i: '❤️', l: 'My List' },
  { id: 'dl', i: '⬇️', l: 'Downloads' },
  { id: 'set', i: '⚙️', l: 'Settings' },
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
    catch (e) { Alert.alert('Not available', 'This movie has no stream right now.'); }
    setLoading(false);
  };
  const toggleList = id => setList(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);

  if (playUrl) return (
    <View style={st.app}>
      <Player url={playUrl} onBack={() => setPlayUrl(null)} />
      <StatusBar style="light" />
    </View>
  );

  return (
    <View style={st.app}>
      {detail ? (
        <Detail m={detail} onBack={() => setDetail(null)} onPlay={() => play(detail)}
          inList={list.includes(detail.id)} onList={() => toggleList(detail.id)} />
      ) : tab === 'home' ? (
        <Home onOpen={setDetail} onPlay={play} onSearch={() => setTab('search')} />
      ) : tab === 'search' ? (
        <SearchPage onOpen={setDetail} />
      ) : tab === 'list' ? (
        <MyListPage list={list} onOpen={setDetail} />
      ) : tab === 'dl' ? (
        <DownloadsPage />
      ) : (
        <SettingsPage saver={saver} setSaver={setSaver} />
      )}
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
