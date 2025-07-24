import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
  Dimensions,
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

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export default function PlayTimePickerScreen() {
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('30');

  const hourRef = useRef<FlatList>(null);
  const minuteRef = useRef<FlatList>(null);

  const scrollToIndex = (ref: any, index: number) => {
    ref.current?.scrollToIndex({ index, animated: true });
  };

  const handleHourScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedHour(hours[index]);
  };

  const handleMinuteScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    setSelectedMinute(minutes[index]);
  };

  const renderItem = (item: string) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item}</Text>
    </View>
  );

  const handleSubmit = () => {
    const duration = `${selectedHour}:${selectedMinute}`;
    router.push({
      pathname: '/places',
      params: { duration },
    });
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
          <Text style={styles.title}>How long would {'\n'} you like to play {'\n'} today?</Text>

          <View style={styles.pickerContainer}>
            <View style={styles.centerHighlight} />
            <View style={styles.scrollArea}>
              <FlatList
                ref={hourRef}
                data={hours}
                keyExtractor={(item) => item}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handleHourScroll}
                snapToInterval={ITEM_HEIGHT}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                initialScrollIndex={12}
                renderItem={({ item }) => renderItem(item)}
              />
            </View>

            <Text style={styles.colon}>:</Text>

            <View style={styles.scrollArea}>
              <FlatList
                ref={minuteRef}
                data={minutes}
                keyExtractor={(item) => item}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                onMomentumScrollEnd={handleMinuteScroll}
                snapToInterval={ITEM_HEIGHT}
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                initialScrollIndex={30}
                renderItem={({ item }) => renderItem(item)}
              />
            </View>
          </View>

          <Pressable style={styles.button} onPress={handleSubmit}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </Pressable>
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
    marginBottom: 110,
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 280,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#e6e6e6',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    zIndex: 2,
  },
  scrollArea: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 60,
    overflow: 'hidden',
    zIndex: 4,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#000',
  },
  colon: {
    fontSize: 30,
    marginHorizontal: 10,
    color: '#000',
    zIndex: 4,
  },
  button: {
    position: 'absolute',
    bottom: hp('3%'),
    alignSelf: 'center',
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#5D9C3F',
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
