import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, TextInput, View, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const BACKEND_URL = 'https://potential-spoon-wvr95xp5xq6j3gv9q-3000.app.github.dev';

export default function App() {
  const [prompt, setPrompt] = useState('A young boy walking alone in the rain, anime style...');
  const [status, setStatus] = useState('idle');
  const [taskId, setTaskId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const video = useRef(null);

  useEffect(() => {
    let interval;
    if (taskId && status === 'generating') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(BACKEND_URL + '/status/' + taskId);
          const data = await res.json();
          if (data.status === 'succeeded') {
            clearInterval(interval);
            setVideoUrl(data.videoUrl);
            setStatus('done');
          } else if (data.status === 'failed') {
            clearInterval(interval);
            Alert.alert('Error', 'Video generation failed');
            setStatus('idle');
          }
        } catch (e) { console.log(e); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId, status]);

  const generate = async () => {
    setStatus('generating');
    setVideoUrl(null);
    try {
      const res = await fetch(BACKEND_URL + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setTaskId(data.taskId);
    } catch (e) {
      Alert.alert('Debug', String(e));
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
        </>
      )}
      {status === 'done' && videoUrl && (
        <View style={styles.videoContainer}>
          <Video
            ref={video}
            style={styles.video}
            source={{ uri: videoUrl }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
          <TouchableOpacity style={styles.button} onPress={() => { setStatus('idle'); setVideoUrl(null); }}>
            <Text style={styles.buttonText}>Make Another 🔄</Text>
          </TouchableOpacity>
        </View>
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
  videoContainer: { flex: 1, width: '100%', justifyContent: 'center' },
  video: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20 }
});
