import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, TextInput, View, TouchableOpacity,
    KeyboardAvoidingView, Platform,
    } from 'react-native';

    export default function App() {
      const [prompt, setPrompt] = useState('');
        const [status, setStatus] = useState('');

          const generate = () => {
              setStatus('🎬 Coming soon: "' + prompt + '"');
                };

                  return (
                      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                            <Text style={styles.title}>🎬 AI Video Maker</Text>
                                  <Text style={styles.subtitle}>Describe your scene</Text>

                                        <TextInput
                                                style={styles.input}
                                                        placeholder="A young boy walking alone in the rain, anime style..."
                                                                placeholderTextColor="#888"
                                                                        multiline
                                                                                value={prompt}
                                                                                        onChangeText={setPrompt}
                                                                                              />

                                                                                                    <TouchableOpacity style={styles.button} onPress={generate}>
                                                                                                            <Text style={styles.buttonText}>Generate Video ✨</Text>
                                                                                                                  </TouchableOpacity>

                                                                                                                        {status !== '' ? <Text style={styles.status}>{status}</Text> : null}

                                                                                                                              <StatusBar style="light" />
                                                                                                                                  </KeyboardAvoidingView>
                                                                                                                                    );
                                                                                                                                    }

                                                                                                                                    const styles = StyleSheet.create({
                                                                                                                                      container: { flex: 1, backgroundColor: '#0f0f1a', padding: 24, justifyContent: 'center' },
                                                                                                                                        title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
                                                                                                                                          subtitle: { color: '#888', textAlign: 'center', marginBottom: 24 },
                                                                                                                                            input: { backgroundColor: '#1c1c2e', color: '#fff', borderRadius: 12, padding: 14, minHeight: 110, textAlignVertical: 'top', marginBottom: 16 },
                                                                                                                                              button: { backgroundColor: '#6c5ce7', borderRadius: 12, padding: 16, alignItems: 'center' },
                                                                                                                                                buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
                                                                                                                                                  status: { color: '#7bed9f', marginTop: 20, textAlign: 'center' },
                                                                                                                                                  });