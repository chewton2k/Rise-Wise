import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

export default function AlarmsScreen() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const allClasses = [
    'Math 32A', 'Math 32B', 'Math 33A',
    'Math 33B', 'Math 115A', 'CS 35L ',
    'CS 131', 'CS 111'
  ];

  const filteredClasses = allClasses.filter((cls) =>
    cls.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addClass = () => {
    if (selectedClass && !classes.find((c) => c.name === selectedClass)) {
      setClasses((prev) => [...prev, { id: Date.now().toString(), name: selectedClass }]);
    }
    setShowClassModal(false);
    setSearchQuery('');
    setSelectedClass(null);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== id));
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity onPress={() => deleteClass(id)} style={styles.deleteButton}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: { id: string; name: string } }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.classItem}>
        <Text style={styles.classText}>{item.name}</Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No classes yet</Text>}
      />

      {/* Add Class Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowClassModal(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showClassModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select a Class</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredClasses}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.classOption,
                    selectedClass === item && styles.selectedClassOption,
                  ]}
                  onPress={() => setSelectedClass(item)}
                >
                  <Text style={styles.classOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowClassModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addClass}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  classItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderBottomColor: '#555',
    borderBottomWidth: 1,
  },
  classText: {
    fontSize: 20,
    color: 'white',
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
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#333',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  classOption: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  selectedClassOption: {
    backgroundColor: '#444',
  },
  classOptionText: {
    color: 'white',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButtonText: {
    fontSize: 18,
    color: '#00ADEF',
  },
});



