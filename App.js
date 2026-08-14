import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, TouchableOpacity, PanResponder,
  Vibration, Dimensions
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const HORIZON = H * 0.30;
const ROAD_BOTTOM = H * 0.86;

function proj(z, lane) {
  const t = z * z;
  return {
    x: W / 2 + lane * W * 0.30 * t,
    y: HORIZON + (ROAD_BOTTOM - HORIZON) * t,
    s: 0.10 + 0.90 * t,
  };
}

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [, setTick] = useState(0);
  const g = useRef({
    lane: 0, laneV: 0, jump: 0, slide: 0,
    speed: 0.012, score: 0, coins: 0,
    objs: [], spawn: 0, dead: false,
  }).current;

  const start = () => {
    g.lane = 0; g.laneV = 0; g.jump = 0; g.slide = 0;
    g.speed = 0.012; g.score = 0; g.coins = 0;
    g.objs = []; g.spawn = 0; g.dead = false;
    setScreen('play');
  };

  useEffect(() => {
    if (screen !== 'play') return;
    const iv = setInterval(() => {
      g.score += g.speed * 100;
      g.speed += 0.000004;
      if (g.jump > 0) g.jump--;
      if (g.slide > 0) g.slide--;
      g.laneV += (g.lane - g.laneV) * 0.25;
      for (const o of g.objs) o.z += g.speed * (1 + o.z * 2);
      g.spawn--;
      if (g.spawn <= 0) {
        g.spawn = Math.max(14, 30 - g.speed * 800);
        const lane = Math.floor(Math.random() * 3) - 1;
        const r = Math.random();
        if (r < 0.35) g.objs.push({ lane, z: 0, type: 'coin' });
        else if (r < 0.62) g.objs.push({ lane, z: 0, type: 'low' });
        else if (r < 0.82) g.objs.push({ lane, z: 0, type: 'high' });
        else g.objs.push({ lane, z: 0, type: 'train' });
      }
      for (const o of g.objs) {
        if (!o.hit && !o.passed && o.z > 0.82 && o.z < 1.02 && o.lane === g.lane) {
          if (o.type === 'coin') { o.hit = true; g.coins++; }
          else if (o.type === 'low' && g.jump > 0) { o.passed = true; }
          else if (o.type === 'high' && g.slide > 0) { o.passed = true; }
          else { g.dead = true; }
        }
      }
      g.objs = g.objs.filter(o => o.z < 1.15 && !o.hit);
      if (g.dead) {
        Vibration.vibrate(300);
        setScreen('over');
      }
      setTick(t => t + 1);
    }, 33);
    return () => clearInterval(iv);
  }, [screen]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (e, gs) => {
      const { dx, dy } = gs;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 25 && g.lane < 1) g.lane++;
        else if (dx < -25 && g.lane > -1) g.lane--;
      } else {
        if (dy < -25) g.jump = 18;
        else if (dy > 25) g.slide = 18;
      }
    },
  })).current;

  const objs = [...g.objs].sort((a, b) => a.z - b.z);
  const pp = proj(1, g.laneV);
  const jumpY = g.jump > 0 ? Math.sin(((18 - g.jump) / 18) * Math.PI) * 90 : 0;

  return (
    <View style={styles.wrap} {...(screen === 'play' ? pan.panHandlers : {})}>
      <View style={styles.sky} />
      <Text style={styles.city}>🏢🏬🏢🌇🏬🏢</Text>
      <View style={styles.road} />
      {screen !== 'menu' && objs.map((o, i) => {
        const p = proj(o.z, o.lane);
        const emoji = o.type === 'coin' ? '🪙' : o.type === 'low' ? '🚧' : o.type === 'high' ? '🪧' : '🚇';
        return (
          <Text key={i} style={{
            position: 'absolute', left: p.x - 40 * p.s, top: p.y - 70 * p.s,
            fontSize: 64 * p.s, opacity: Math.min(1, o.z * 4),
          }}>{emoji}</Text>
        );
      })}
      {screen !== 'menu' && (
        <Text style={{
          position: 'absolute', left: pp.x - 32, top: ROAD_BOTTOM - 78 - jumpY,
          fontSize: 62, transform: [{ scaleY: g.slide > 0 ? 0.5 : 1 }],
        }}>🏃</Text>
      )}
      {screen === 'play' && (
        <View style={styles.hud}>
          <Text style={styles.hudText}>🏆 {Math.floor(g.score)}</Text>
          <Text style={styles.hudText}>🪙 {g.coins}</Text>
        </View>
      )}
      {screen === 'menu' && (
        <View style={styles.overlay}>
          <Text style={styles.title}>🚇 SUBWAY DASH 3D</Text>
          <Text style={styles.sub}>Swipe ⬅️➡️ change lane{'\n'}Swipe ⬆️ jump   •  Swipe ⬇️ slide 🪧{'\n'}Dodge 🚇, grab 🪙</Text>
          <TouchableOpacity style={styles.btn} onPress={start}>
            <Text style={styles.btnText}>▶ PLAY</Text>
          </TouchableOpacity>
        </View>
      )}
      {screen === 'over' && (
        <View style={styles.overlay}>
          <Text style={styles.title}>💥 GAME OVER</Text>
          <Text style={styles.sub}>Score: {Math.floor(g.score)}   •   Coins: {g.coins}</Text>
          <TouchableOpacity style={styles.btn} onPress={start}>
            <Text style={styles.btnText}>🔄 RUN AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0d0d16' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0, height: HORIZON, backgroundColor: '#1a1a3a' },
  city: { position: 'absolute', top: HORIZON - 34, left: 0, right: 0, textAlign: 'center', fontSize: 26 },
  road: {
    position: 'absolute', top: HORIZON, left: W / 2 - W * 0.08,
    width: W * 0.16, height: 0,
    borderLeftWidth: W * 0.62, borderRightWidth: W * 0.62,
    borderBottomWidth: H - HORIZON,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#26263a',
  },
  hud: { position: 'absolute', top: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: '#ffd700', fontSize: 22, fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  sub: { color: '#bbb', fontSize: 16, textAlign: 'center', marginBottom: 30, lineHeight: 26 },
  btn: { backgroundColor: '#6c5ce7', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
