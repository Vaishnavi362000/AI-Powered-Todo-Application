import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TaskList({ tasks, onRemoveTask }) {
  return (
    <FlatList
      data={tasks}
      style={styles.list}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.taskContainer}>
          <Text style={styles.task}>{item}</Text>
          <TouchableOpacity onPress={() => onRemoveTask(item)}>
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  task: {
    fontSize: 18,
    color: '#ff69b4',
    textDecorationLine: 'none',
    flex: 1,
  },
  deleteButton: {
    color: '#ff69b4',
    fontSize: 18,
  },
});