import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import { router } from 'expo-router';

export default function PointsScreen() {
  const [storyStarted, setStoryStarted] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('activeStory');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Questions:', parsed.questions);
        setPoints(Array.isArray(parsed.points) ? parsed.points : []);
        setQuestions(Array.isArray(parsed.questions) ? parsed.questions : []);
        setStoryStarted(true);
      }
    }
  }, []);

  const handleSelectAnswer = (questionKey: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionKey]: answerIndex,
    }));
  };

  const handleStoryNavigation = () => {
    router.push('/story');
  };

  if (!storyStarted) {
    return (
      <ImageBackground
        source={require('@/assets/images/obiettivi.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>
            Start your story to unlock your objectives!
          </Text>
        </View>
        <BottomNavbar state="start" onPress={() => {}} />
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={points}
        keyExtractor={(item, index) => (item?.point_id ?? index).toString()}
        renderItem={({ item }) => {
          const isCompleted = item.completed === 1;
          const relatedQuestions = questions.filter(
            (q) => Number(q.point_id) === Number(item.point_id)
          );

          return (
            <View style={styles.pointBox}>
              <View style={styles.pointHeader}>
                <Text style={styles.pointTitle}>{item.name}</Text>
                {isCompleted && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#5D9C3F"
                  />
                )}
              </View>

              {item.text && <Text style={styles.pointText}>{item.text}</Text>}

              {relatedQuestions.length > 0 ? (
                relatedQuestions.map((q, index) => {
                  const questionKey = `${item.point_id}-${index}`;

                  return (
                    <View key={questionKey} style={{ marginBottom: 8 }}>
                      <Text style={styles.question}>• {q.question}</Text>

                      {[q.first_answer, q.second_answer, q.third_answer].map(
                        (answer, idx) => {
                          const isSelected =
                            selectedAnswers[questionKey] === idx + 1;

                          return (
                            <Text
                              key={idx}
                              style={[
                                styles.answerOption,
                                isSelected && styles.selectedAnswer,
                              ]}
                              onPress={() =>
                                handleSelectAnswer(questionKey, idx + 1)
                              }
                            >
                              {String.fromCharCode(65 + idx)}. {answer}
                            </Text>
                          );
                        }
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.question}>No questions.</Text>
              )}
            </View>
          );
        }}
      />
      <BottomNavbar state="stop" onPress={handleStoryNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
    backgroundColor: '#f6f6f6',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    margin: 32,
    padding: 24,
    borderRadius: 16,
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pointBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pointTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pointText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  question: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    marginTop: 4,
  },
  answerOption: {
    fontSize: 14,
    color: '#444',
    marginLeft: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginTop: 4,
  },
  selectedAnswer: {
    backgroundColor: '#D84171',
    color: '#fff',
    fontWeight: 'bold',
  },
});
