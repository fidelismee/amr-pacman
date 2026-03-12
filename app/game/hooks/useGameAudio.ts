"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getDesiredLoopTrack,
  shouldPlayMovementSfx,
  type LoopTrackName,
  type SoundEffectName,
} from "../audio/audioState";

type AudioAssetName =
  | "bacteriaAnimation"
  | "city"
  | "function"
  | "inGame"
  | "opening";

interface AudioConfig {
  loop: boolean;
  src: string;
  volume: number;
}

interface UseGameAudioOptions {
  gameActive: boolean;
  hasFocus: boolean;
  isRunning: boolean;
}

const AUDIO_CONFIG: Record<AudioAssetName, AudioConfig> = {
  bacteriaAnimation: {
    loop: false,
    src: "/sound/bacteria-animation.mp3",
    volume: 0.45,
  },
  city: {
    loop: true,
    src: "/sound/city-sound.wav",
    volume: 0.18,
  },
  function: {
    loop: false,
    src: "/sound/function.wav",
    volume: 0.4,
  },
  inGame: {
    loop: true,
    src: "/sound/in-game.wav",
    volume: 0.22,
  },
  opening: {
    loop: false,
    src: "/sound/opening-game.wav",
    volume: 0.32,
  },
};

function stopAudio(audio: HTMLAudioElement, resetToStart = true) {
  audio.pause();
  if (resetToStart) {
    audio.currentTime = 0;
  }
}

function createAudioElement({ loop, src, volume }: AudioConfig): HTMLAudioElement {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}

export function useGameAudio({ gameActive, hasFocus, isRunning }: UseGameAudioOptions) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const activeLoopRef = useRef<Exclude<LoopTrackName, "none"> | null>(null);
  const audioUnlockedRef = useRef(false);
  const desiredLoopTrackRef = useRef<LoopTrackName>("none");
  const audioElementsRef = useRef<Record<AudioAssetName, HTMLAudioElement | null>>({
    bacteriaAnimation: null,
    city: null,
    function: null,
    inGame: null,
    opening: null,
  });
  const lastMovementEffectAtRef = useRef(0);

  const desiredLoopTrack = useMemo(
    () =>
      getDesiredLoopTrack({
        audioUnlocked,
        gameActive,
        hasFocus,
        isRunning,
      }),
    [audioUnlocked, gameActive, hasFocus, isRunning],
  );

  const stopAllLoops = useCallback(() => {
    const { city, inGame } = audioElementsRef.current;

    if (city) {
      stopAudio(city);
    }

    if (inGame) {
      stopAudio(inGame);
    }

    activeLoopRef.current = null;
  }, []);

  const playLoop = useCallback((track: Exclude<LoopTrackName, "none">) => {
    const nextAudio = track === "city" ? audioElementsRef.current.city : audioElementsRef.current.inGame;

    if (!nextAudio) {
      return;
    }

    if (activeLoopRef.current === track) {
      if (nextAudio.paused) {
        void nextAudio.play().catch((error: unknown) => {
          console.warn(`Failed to resume ${track} audio loop.`, error);
        });
      }
      return;
    }

    if (activeLoopRef.current === "city" && audioElementsRef.current.city) {
      stopAudio(audioElementsRef.current.city);
    }

    if (activeLoopRef.current === "inGame" && audioElementsRef.current.inGame) {
      stopAudio(audioElementsRef.current.inGame);
    }

    nextAudio.currentTime = 0;
    activeLoopRef.current = track;
    void nextAudio.play().catch((error: unknown) => {
      console.warn(`Failed to start ${track} audio loop.`, error);
      if (activeLoopRef.current === track) {
        activeLoopRef.current = null;
      }
    });
  }, []);

  const resumeDesiredLoop = useCallback(() => {
    const track = desiredLoopTrackRef.current;

    if (track === "none") {
      return;
    }

    playLoop(track);
  }, [playLoop]);

  const ensureAudioUnlocked = useCallback(() => {
    if (audioUnlockedRef.current) {
      resumeDesiredLoop();
      return;
    }

    audioUnlockedRef.current = true;
    setAudioUnlocked(true);

    const primerAudio = createAudioElement({
      ...AUDIO_CONFIG.function,
      loop: false,
      volume: 0,
    });
    primerAudio.muted = true;

    const playAttempt = primerAudio.play();
    if (playAttempt && typeof playAttempt.then === "function") {
      void playAttempt
        .then(() => {
          stopAudio(primerAudio);
        })
        .catch(() => undefined);
      return;
    }

    stopAudio(primerAudio);
  }, [resumeDesiredLoop]);

  const playEffect = useCallback(
    (soundName: SoundEffectName) => {
      if (!audioUnlockedRef.current) {
        return;
      }

      const audio = audioElementsRef.current[soundName];
      if (!audio) {
        return;
      }

      stopAudio(audio);
      void audio.play().catch((error: unknown) => {
        console.warn(`Failed to play ${soundName} sound effect.`, error);
      });
    },
    [],
  );

  const playMovementEffect = useCallback(() => {
    if (!audioUnlockedRef.current) {
      return;
    }

    const now = Date.now();
    if (
      !shouldPlayMovementSfx({
        lastPlayedAt: lastMovementEffectAtRef.current,
        now,
      })
    ) {
      return;
    }

    lastMovementEffectAtRef.current = now;
    playEffect("bacteriaAnimation");
  }, [playEffect]);

  useEffect(() => {
    desiredLoopTrackRef.current = desiredLoopTrack;
  }, [desiredLoopTrack]);

  useEffect(() => {
    audioElementsRef.current = {
      bacteriaAnimation: createAudioElement(AUDIO_CONFIG.bacteriaAnimation),
      city: createAudioElement(AUDIO_CONFIG.city),
      function: createAudioElement(AUDIO_CONFIG.function),
      inGame: createAudioElement(AUDIO_CONFIG.inGame),
      opening: createAudioElement(AUDIO_CONFIG.opening),
    };

    return () => {
      Object.values(audioElementsRef.current).forEach((audio) => {
        if (audio) {
          audio.onended = null;
          stopAudio(audio);
        }
      });
      audioUnlockedRef.current = false;
      activeLoopRef.current = null;
    };
  }, []);

  useEffect(() => {
    switch (desiredLoopTrack) {
      case "city":
        playLoop("city");
        break;
      case "inGame":
        playLoop("inGame");
        break;
      case "none":
        stopAllLoops();
        break;
      default: {
        const exhaustiveTrack: never = desiredLoopTrack;
        return exhaustiveTrack;
      }
    }
  }, [desiredLoopTrack, playLoop, stopAllLoops]);

  return {
    audioUnlocked,
    ensureAudioUnlocked,
    playEffect,
    playMovementEffect,
    stopAllLoops,
  };
}
