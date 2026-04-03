import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const player = useVideoPlayer({ uri: url }, (instance) => {
    instance.loop = false;
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
  },
  video: {
    flex: 1,
  },
});
