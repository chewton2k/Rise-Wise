import React, { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';
import { cs35lQuestions } from '../constants/cs35lQ';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<{ id: string; date: Date; enabled: boolean }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [currentAlarmId, setCurrentAlarmId] = useState<string | null>(null);
  const [randomQuestions, setRandomQuestions] = useState<typeof cs35lQuestions[0][]>([]); 
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionIndex: number]: string }>({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [questionStatus, setQuestionStatus] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    registerForPushNotifications();
    
    // Subscribe to notification received
    const receivedSubscription = Notifications.addNotificationReceivedListener(async notification => {
      const alarmId = notification.request.identifier;
      setCurrentAlarmId(alarmId);
      triggerAlarm();
    });

    // Subscribe to notification response (when user taps on notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.identifier;
      setCurrentAlarmId(alarmId);
      triggerAlarm();
    });

    // Clean up subscriptions
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
      stopAlarm();
    };
  }, []);

  // Function to trigger alarm (pop up with random questions)
  const triggerAlarm = () => {
    setAlarmPlaying(true);
    setSelectedAnswers({});
    setShowAnswerFeedback(false);
    setQuestionStatus({});
    
    // Randomly select two questions
    const shuffledQuestions = [...cs35lQuestions].sort(() => 0.5 - Math.random());
    setRandomQuestions(shuffledQuestions.slice(0, 2)); // Select the first two questions
  };

  const stopAlarm = () => {
    setAlarmPlaying(false);
    setCurrentAlarmId(null);
  };

  // Check if all questions have been answered correctly
  const allQuestionsCorrect = () => {
    if (randomQuestions.length === 0) return false;
    
    // Check if we have answers for all questions and they're all correct
    return randomQuestions.every((_, index) => questionStatus[index] === true);
  };

  const handleAnswerSelect = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
    
    // Check if the answer is correct
    const isCorrect = selectedOption === randomQuestions[questionIndex].answer;
    setIsAnswerCorrect(isCorrect);
    setShowAnswerFeedback(true);
    
    // Update the question's status
    setQuestionStatus(prev => ({
      ...prev,
      [questionIndex]: isCorrect
    }));
    
    // Hide feedback after 1.5 seconds
    setTimeout(() => {
      setShowAnswerFeedback(false);
    }, 1500);
  };

  const registerForPushNotifications = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for notifications!');
        return;
      }
    } else {
      alert('Must use physical device for notifications');
    }
  };

  const toggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === id) {
          if (alarm.enabled) {
            Notifications.cancelScheduledNotificationAsync(id);
          } else {
            scheduleAlarmNotification(id, alarm.date);
          }
          return { ...alarm, enabled: !alarm.enabled };
        }
        return alarm;
      })
    );
  };

  const deleteAlarm = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  };

  const scheduleAlarmNotification = async (id: string, dateTime: Date) => {
    const now = new Date();
    const triggerTime = new Date(dateTime);
    
    triggerTime.setFullYear(now.getFullYear());
    triggerTime.setMonth(now.getMonth());
    triggerTime.setDate(now.getDate());
    
    if (triggerTime <= now) {
      triggerTime.setDate(triggerTime.getDate() + 1);
    }

    const trigger: Notifications.NotificationTriggerInput = {
      type: SchedulableTriggerInputTypes.CALENDAR,
      hour: dateTime.getHours(),
      minute: dateTime.getMinutes(),
      repeats: false,
    };

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Quiz Time!',
          body: 'Wake up and answer some questions!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          data: { id },
        },
        trigger,
        identifier: id,
      });

      console.log('Notification scheduled for:', triggerTime.toString(), 'with ID:', identifier);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const addAlarm = async (date: Date) => {
    const newId = Date.now().toString();
    const newAlarm = { id: newId, date, enabled: true };
    setAlarms((prev) => [...prev, newAlarm]);
    await scheduleAlarmNotification(newId, date);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes < 10 ? '0' + minutes : minutes;
    return `${h}:${m} ${ampm}`;
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity onPress={() => deleteAlarm(id)} style={styles.deleteButton}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: typeof alarms[0] }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.alarmItem}>
        <Text style={styles.alarmText}>{formatTime(item.date)}</Text>
        <Switch value={item.enabled} onValueChange={() => toggleAlarm(item.id)} />
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[...alarms].sort((a, b) => a.date.getTime() - b.date.getTime())}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No alarms yet</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setShowPicker(true)}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {showPicker && (
        <Modal transparent={true} animationType="slide" visible={showPicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Alarm Time</Text>
              <DateTimePicker
                mode="time"
                value={pickerTime}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setPickerTime(selectedDate);
                }}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant="dark"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={[styles.modalButton, { backgroundColor: '#888' }]}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    addAlarm(pickerTime);
                    setShowPicker(false);
                  }}
                  style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                >
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* CS35L Question Modal */}
      {alarmPlaying && (
        <Modal transparent={true} animationType="slide" visible={alarmPlaying}>
          <View style={styles.alarmModalOverlay}>
            <View style={styles.alarmModalContent}>
              <Text style={styles.alarmModalTitle}>⏰ CS35L QUIZ TIME</Text>
              
              {randomQuestions.map((questionItem, qIndex) => (
                <View key={qIndex} style={[
                  styles.questionContainer,
                  questionStatus[qIndex] === true && styles.correctQuestionContainer,
                  questionStatus[qIndex] === false && styles.incorrectQuestionContainer
                ]}>
                  <Text style={styles.questionText}>{questionItem.question}</Text>
                  
                  {questionItem.options.map((option, oIndex) => (
                    <TouchableOpacity
                      key={oIndex}
                      style={[
                        styles.optionButton,
                        selectedAnswers[qIndex] === option && styles.selectedOption
                      ]}
                      onPress={() => handleAnswerSelect(qIndex, option)}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  {questionStatus[qIndex] === true && (
                    <Text style={styles.correctIndicator}>✓ Correct</Text>
                  )}
                </View>
              ))}
              
              {showAnswerFeedback && (
                <View style={[
                  styles.feedbackContainer,
                  isAnswerCorrect ? styles.correctFeedback : styles.incorrectFeedback
                ]}>
                  <Text style={styles.feedbackText}>
                    {isAnswerCorrect ? "Correct!" : "Incorrect!"}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                onPress={stopAlarm}
                style={[
                  styles.stopAlarmButton,
                  !allQuestionsCorrect() && styles.disabledStopButton
                ]}
                disabled={!allQuestionsCorrect()}
              >
                <Text style={styles.stopAlarmText}>
                  {allQuestionsCorrect() ? "STOP ALARM" : "ANSWER ALL QUESTIONS CORRECTLY"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  alarmText: {
    fontSize: 24,
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alarmModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  alarmModalContent: {
    width: '95%',
    backgroundColor: '#0f2e49',  // Changed to a CS/programming-themed color
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    maxHeight: '90%',
  },
  alarmModalTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    position: 'relative',
  },
  correctQuestionContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectQuestionContainer: {
    borderWidth: 2,
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  questionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  stopAlarmButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 15,
  },
  disabledStopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stopAlarmText: {
    color: '#0f2e49',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedbackContainer: {
    width: '80%',
    padding: 12,
    borderRadius: 15,
    marginTop: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  correctFeedback: {
    backgroundColor: '#4CAF50',
  },
  incorrectFeedback: {
    backgroundColor: '#F44336',
  },
  feedbackText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  correctIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  }
});