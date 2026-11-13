import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, Pressable, StyleSheet, View} from 'react-native';

import Text from '../../../components/AppText';
import {
  getMusicRecommendations,
  type MusicTrack,
} from '../../../services/api/music';
import {shadows} from '../../../theme/shadows';
import {useAppTheme} from '../../../theme/ThemeProvider';
import type {PreferenceOption} from '../types';
import {coverImageStyle} from './MusicRecommendation';

interface MusicGenrePickerProps {
  options: PreferenceOption[];
  // 고른 장르와 그 장르의 대표곡(못 불러왔으면 null)
  onSelect: (choice: string, track: MusicTrack | null) => void;
}

const ART_SIZE = 96;

// 같은 날 같은 장르면 서버가 같은 목록을 주므로, 앱을 켜 둔 동안은 다시 묻지 않는다.
const tracksCache = new Map<string, Promise<MusicTrack[]>>();
const loadTracks = (choice: string) => {
  let pending = tracksCache.get(choice);
  if (!pending) {
    pending = getMusicRecommendations(choice);
    tracksCache.set(choice, pending);
    pending.catch(() => tracksCache.delete(choice));
  }
  return pending;
};

const pickRandom = <T,>(items: T[]) =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;

function GenreCard({
  option,
  onSelect,
}: {
  option: PreferenceOption;
  onSelect: MusicGenrePickerProps['onSelect'];
}) {
  const {theme} = useAppTheme();
  // undefined: 불러오는 중, null: 곡 없음·실패
  const [track, setTrack] = useState<MusicTrack | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadTracks(option.label)
      .then(tracks => !cancelled && setTrack(pickRandom(tracks)))
      .catch(error => {
        console.log('[music] 장르 대표곡 조회 실패:', error);
        if (!cancelled) setTrack(null);
      });
    return () => {
      cancelled = true;
    };
  }, [option.label]);

  return (
    <Pressable
      accessibilityLabel={option.label}
      onPress={() => onSelect(option.label, track ?? null)}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.art, {backgroundColor: theme.border}]}>
        {track === undefined && <ActivityIndicator color={theme.accent} />}
        {track?.thumbnail ? (
          <Image source={{uri: track.thumbnail}} style={coverImageStyle(ART_SIZE)} />
        ) : (
          track === null && <Text style={styles.fallback}>🎵</Text>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.genre, {color: theme.text}]}>
        {option.label}
      </Text>
      <Text numberOfLines={1} style={[styles.song, {color: theme.textMuted}]}>
        {track ? track.title : option.description}
      </Text>
    </Pressable>
  );
}

// 음악 버튼 아래에 펼쳐지는 오늘의 장르. 장르마다 대표곡 앨범 자켓을 보여 준다.
export default function MusicGenrePicker({options, onSelect}: MusicGenrePickerProps) {
  return (
    <View style={styles.row}>
      {options.map(option => (
        <GenreCard key={option.label} option={option} onSelect={onSelect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 26,
    paddingHorizontal: 8,
  },
  card: {
    width: ART_SIZE,
  },
  art: {
    ...shadows.raised,
    alignItems: 'center',
    borderRadius: 14,
    height: ART_SIZE,
    justifyContent: 'center',
    overflow: 'hidden',
    width: ART_SIZE,
  },
  fallback: {
    fontSize: 34,
  },
  genre: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 7,
  },
  song: {
    fontSize: 11,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.75,
    transform: [{scale: 0.95}],
  },
});
