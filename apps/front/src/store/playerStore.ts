import { Model } from '@music/types';
import { create } from 'zustand';

// TODO: music base interface 병합
export interface AudioData {
  id: string;
  title: string;
  album: string;
  artist: string;
  source: string;
  duration: number;
  thumbnailURL: string;
}

interface playingState {
  paused: boolean;
  musicInfo: Model.MusicInfo;
  progress: number;
}

interface PlayerStore {
  playing: playingState | null;
  volume: number;
  replay: 'none' | 'shuffle' | 'single';
  playList: Model.MusicInfo[];
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPlaying: (playing: PlayerStore['playing']) => void;
  setPaused: (paused: boolean) => void;
  prependPlaylist: (musicInfo: Model.MusicInfo) => void;
  appendPlaylist: (musicInfo: Model.MusicInfo) => void;
  removePlaylist: (index: number) => void;
}
export const usePlayerStore = create<PlayerStore>((set) => ({
  playing: null,
  volume: 5,
  replay: 'none',
  playList: [],
  setProgress: (progress) =>
    set((prev) => {
      if (!prev.playing || prev.playing.progress === progress) return prev;
      return {
        playing: {
          ...prev.playing,
          progress,
        },
      };
    }),
  setVolume: (volume) => set({ volume }),
  setPlaying: (playing) => set({ playing }),
  setPaused: (paused) =>
    set((prev) => {
      if (!prev.playing || prev.playing.paused === paused) return prev;
      return {
        playing: {
          ...prev.playing,
          paused,
        },
      };
    }),
  prependPlaylist: (musicInfo) =>
    set((prev) => ({ ...prev, playList: [musicInfo, ...prev.playList] })),
  appendPlaylist: (musicInfo) =>
    set((prev) => ({ ...prev, playList: [...prev.playList, musicInfo] })),
  removePlaylist: (index) =>
    set((prev) => {
      if (!prev.playList.at(index)) return prev;
      return { ...prev, playList: prev.playList.filter((_, i) => i !== index) };
    }),
}));
