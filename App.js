import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, TextInput, View, TouchableOpacity, Image, Animated,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';

function Slideshow({ urls }) {
  const [i, setI] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % urls.length), 1600);
    return () => clearInterval(t);
  }, [urls]);
  useEffect(() => {
    scale.setValue(1);
    Animated.timing(scale, { toValue: 1.18, duration: 1600, useNativeDriver: true }).start();
  }, [i, scale]);
  return (
    <View style={styles.video}>
      <Animated.Image
        source={{ uri: urls[i] }}
        style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}
        resizeMode="cover"
      />
      <View style={styles.badge}><Text style={styles.badgeText}>AI Scene {i + 1}/{urls.length}</Text></View>
    </View>
  );
}

export default function App() {
  const [prompt, setPrompt] = useState('A lion running after a deer, animated cinematic style');
  const [status, setStatus] = useState('idle');
  const [images, setImages] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) { Alert.alert('Type a scene first'); return; }
    setStatus('generating');
    setImages(null);
    try {
      const seeds = [7, 21, 42, 99];
      const urls = seeds.map(s =>
        'https://image.pollinations.ai/prompt/' +
        encodeURIComponent(prompt) +
        '?seed=' + s + '&width=768&height=432&nologo=true'
      );
      await Image.prefetch(urls[0]);
      setImages(urls);
      setStatus('done');
    } catch (e) {
      Alert.alert('Free AI busy', 'Try again in a moment');
      setStatus('idle');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <Text style={styles.title}>🎬 AI Video Maker</Text>
      {status !== 'done' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Describe your scene..."
            placeholderTextColor="#888"
            multiline
            value={prompt}
            onChangeText={setPrompt}
          />
          <TouchableOpacity
            style={[styles.button, status === 'generating' && {opacity: 0.6}]}
            onPress={generate}
            disabled={status === 'generating'}
          >
            {status === 'generating' ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Video ✨</Text>}
          </TouchableOpacity>
          <Text style={styles.hint}>Free AI mode: your prompt becomes an animated AI scene 🎞️</Text>
        </>
      )}
      {status === 'done' && images && (
        <>
          <Slideshow urls={images} />
          <TouchableOpacity style={styles.button} onPress={() => { setStatus('idle'); setImages(null); }}>
            <Text style={styles.buttonText}>Make Another 🔄</Text>
          </TouchableOpacity>
        </>
      )}
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#1c1c2e', color: '#fff', borderRadius: 12, padding: 14, minHeight: 110, textAlignVertical: 'top', marginBottom: 16 },
  button: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  hint: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 12 },
  video: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20, overflow: 'hidden', backgroundColor: '#000' },
  badge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11 }
});
