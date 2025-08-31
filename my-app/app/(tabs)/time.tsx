import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LayoutWrapper from '@/components/LayoutWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { router } from 'expo-router';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

// liste di base
const BASE_HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const BASE_MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// liste circolari
const repeat = <T,>(arr: T[], times: number) =>
  Array.from({ length: times }).flatMap(() => arr);

const LOOPS = 25; // abbastanza lungo da evitare bordi frequenti
const HOURS = repeat(BASE_HOURS, LOOPS);
const MINUTES = repeat(BASE_MINUTES, LOOPS);

// centro della lista lunga
const CENTER_HOUR = Math.floor(HOURS.length / 2);
const CENTER_MIN = Math.floor(MINUTES.length / 2);

// indice iniziale per mostrare un valore specifico al centro
const indexForHour = (h: string) => CENTER_HOUR + BASE_HOURS.indexOf(h);
const indexForMinute = (m: string) => CENTER_MIN + BASE_MINUTES.indexOf(m);

// normalizza indice su lunghezza base
const norm = (i: number, len: number) => ((i % len) + len) % len;

export default function PlayTimePickerScreen() {
  // se vuoi partire da 00:30 cambia qui
  const [selectedHour, setSelectedHour] = useState<'00' | string>('00');
  const [selectedMinute, setSelectedMinute] = useState<'30' | string>('30');

  const hourRef = useRef<FlatList<string>>(null);
  const minuteRef = useRef<FlatList<string>>(null);

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const baseIndex = norm(rawIndex, BASE_HOURS.length);
    setSelectedHour(BASE_HOURS[baseIndex]);

    // ricentra se vicino ai bordi della lista lunga
    if (rawIndex < BASE_HOURS.length || rawIndex > HOURS.length - BASE_HOURS.length) {
      const target = CENTER_HOUR + baseIndex;
      hourRef.current?.scrollToIndex({ index: target, animated: false });
    }
  };

  const handleMinuteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const baseIndex = norm(rawIndex, BASE_MINUTES.length);
    setSelectedMinute(BASE_MINUTES[baseIndex]);

    if (rawIndex < BASE_MINUTES.length || rawIndex > MINUTES.length - BASE_MINUTES.length) {
      const target = CENTER_MIN + baseIndex;
      minuteRef.current?.scrollToIndex({ index: target, animated: false });
    }
  };

  const renderItem = (item: string) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item}</Text>
    </View>
  );

  const handleSubmit = () => {
    const duration = `${selectedHour}:${selectedMinute}`;
    router.push({ pathname: '/places', params: { duration } });
  };

  return (
    <LayoutWrapper>
      <ImageBackground
        source={require('@/assets/images/time.png')}
        style={styles.background}
        resizeMode="cover"
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>
            How long would {'\n'} you like to play {'\n'} today?
          </Text>

          {/* Etichette sopra il rettangolo */}
          <View style={styles.labelsRow}>
            <Text style={styles.labelWhite}>h</Text>
            <Text style={styles.labelSeparator}>:</Text>
            <Text style={styles.labelWhite}>min</Text>
          </View>

          <View style={styles.pickerContainer}>
            <View style={styles.centerHighlight} />

            {/* Colonna ore */}
            <View style={styles.scrollArea}>
              <FlatList
                ref={hourRef}
                data={HOURS}
                keyExtractor={(_, i) => `h-${i}`}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handleHourScroll}
                snapToInterval={ITEM_HEIGHT}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                initialScrollIndex={indexForHour(selectedHour)}
                renderItem={({ item }) => renderItem(item)}
              />
            </View>

            <Text style={styles.colon}>:</Text>

            {/* Colonna minuti */}
            <View style={styles.scrollArea}>
              <FlatList
                ref={minuteRef}
                data={MINUTES}
                keyExtractor={(_, i) => `m-${i}`}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handleMinuteScroll}
                snapToInterval={ITEM_HEIGHT}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                initialScrollIndex={indexForMinute(selectedMinute)}
                renderItem={({ item }) => renderItem(item)}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={() => router.push('/home')}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Pressable style={styles.button} onPress={handleSubmit}>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 70, 
  },


  labelsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 10,
  },
  labelWhite: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    paddingHorizontal: 28, 
  },
  labelSeparator: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
  },

  // rettangolo del picker 
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,          
    paddingVertical: 10,
    alignItems: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 300,                    
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 12,                     
    right: 12,
    height: ITEM_HEIGHT,
    backgroundColor: '#e6e6e6',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    zIndex: 2,
    borderRadius: 8,
  },
  scrollArea: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS - 8, 
    width: 72,                               
    overflow: 'hidden',
    zIndex: 4,
    borderRadius: 12,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
  },
  colon: {
    fontSize: 30,
    marginHorizontal: 8,
    color: '#000',
    zIndex: 4,
  },

  // --- bottoni ---
  button: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#5D9C3F',
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('30%'),
    position: 'absolute',
    bottom: hp('3%'),
    alignSelf: 'center',
  },
});
