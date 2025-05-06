import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { cs35lQuestions } from '../constants/cs35lQ';

export default function AlarmsScreen() {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({});

  // Reset function to clear all answers
  const resetAnswers = () => {
    setSelectedAnswers({});
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#121212' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
        CS35L Restudy
      </Text>
      {cs35lQuestions.map((q, idx) => (
        <View key={idx} style={{ marginBottom: 24, backgroundColor: '#1e1e1e', padding: 16, borderRadius: 10 }}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 12 }}>{idx + 1}. {q.question}</Text>
          {q.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[idx] === option;
            const isCorrect = option === q.answer;
            const hasAnswered = selectedAnswers[idx] !== undefined;
            const bgColor = hasAnswered
              ? isCorrect
                ? '#4CAF50'
                : isSelected
                ? '#f44336'
                : '#2c2c2c'
              : '#2c2c2c';

            return (
              <TouchableOpacity
                key={optIdx}
                onPress={() =>
                  !hasAnswered && setSelectedAnswers({ ...selectedAnswers, [idx]: option })
                }
                style={{
                  backgroundColor: bgColor,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: 'white' }}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {/* Reset Button */}
      <TouchableOpacity
        onPress={resetAnswers}
        style={{
          backgroundColor: '#2196F3',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Reset All Answers</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
