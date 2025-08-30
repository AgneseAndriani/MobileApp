import { Slot } from 'expo-router';
import { StoryStateProvider } from '@/constants/StoryStateProvider';

export default function RootLayout() {
  return (
    <StoryStateProvider>
      <Slot />
    </StoryStateProvider>
  );
}
