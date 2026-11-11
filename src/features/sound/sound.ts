import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * Soft sound effects that go with Bondly's animations. They follow the
 * phone's silent switch, mix with whatever else is playing, and can be
 * turned off in Settings.
 */
const SOURCES = {
  /** Buttons and choices. */
  tap: require('../../../assets/sounds/tap.wav'),
  /** Something popping into view. */
  pop: require('../../../assets/sounds/pop.wav'),
  /** A right answer. */
  correct: require('../../../assets/sounds/correct.wav'),
  /** A wrong answer, kept gentle. */
  wrong: require('../../../assets/sounds/wrong.wav'),
  /** A calm “thanks”, like after a check-in. */
  chime: require('../../../assets/sounds/chime.wav'),
  /** The streak going up by one. */
  streak: require('../../../assets/sounds/streak.wav'),
  /** Finishing a lesson or reaching a new level. */
  celebrate: require('../../../assets/sounds/celebrate.wav'),
  /** A card flying off-screen. */
  swoosh: require('../../../assets/sounds/swoosh.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const STORAGE_KEY = 'bondly.sound.enabled';
const players: Partial<Record<SoundName, AudioPlayer>> = {};
const listeners = new Set<() => void>();
let enabled = true;
let audioModeSet = false;

AsyncStorage.getItem(STORAGE_KEY)
  .then((v) => {
    if (v === 'false') {
      enabled = false;
      listeners.forEach((l) => l());
    }
  })
  .catch(() => {});

function player(name: SoundName) {
  if (!players[name]) {
    const p = createAudioPlayer(SOURCES[name]);
    p.volume = name === 'tap' ? 0.5 : 0.8;
    players[name] = p;
  }
  return players[name]!;
}

/** Plays a sound effect, unless sounds are turned off. Never throws. */
export function playSound(name: SoundName) {
  if (!enabled || Platform.OS === 'web') return;
  try {
    if (!audioModeSet) {
      audioModeSet = true;
      // Respect the silent switch; never stop someone's music or podcast.
      setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    const p = player(name);
    if (p.currentTime > 0) {
      // Rewind first, then play. Calling play() while the rewind is still in
      // flight leaves a sound that already finished stuck at its end, silent.
      const play = () => p.play();
      p.seekTo(0).then(play, play);
    } else {
      p.play();
    }
  } catch {
    // A missing sound should never break the app.
  }
}

/** Plays a sound after a delay, timed to an animation. Returns a cancel function. */
export function playSoundAfter(name: SoundName, ms: number) {
  const t = setTimeout(() => playSound(name), ms);
  return () => clearTimeout(t);
}

/** Loads every sound up front, so the first one plays without a delay. */
export function preloadSounds() {
  if (Platform.OS === 'web') return;
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    try {
      player(name);
    } catch {}
  });
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  AsyncStorage.setItem(STORAGE_KEY, String(on)).catch(() => {});
  listeners.forEach((l) => l());
  if (on) playSound('tap');
}

/** Whether sound effects are on, for the Settings switch. */
export function useSoundEnabled() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled
  );
}
