import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

const ContinuousVoiceAssistant = () => {
  const [recording, setRecording] = useState(null);

  // Request necessary permissions for recording
  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access microphone was denied');
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  // Function to start recording
  const startRecording = async () => {
    console.log('Starting audio recording...');
    try {
      const { granted } = await Audio.getPermissionsAsync();
      if (!granted) {
        console.warn('Permission to access microphone is required');
        return;
      }

      const newRecording = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(newRecording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    console.log('Stopping audio recording...');
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped, file saved at:', uri);
        setRecording(null);
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  useEffect(() => {
    // Request permissions on component mount
    requestPermissions();
  }, []);

  return null;
};

export default ContinuousVoiceAssistant;
