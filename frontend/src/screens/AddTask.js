import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { TextInput, Button, Surface, SegmentedButtons, Text, IconButton, Card, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import api from '../config';
import { aiService } from '../services/aiService';
import SuggestionsBox from '../components/SuggestionsBox';

const priorityColors = {
  high: '#FF6B6B',
  medium: '#4ECDC4',
  low: '#B19CD9',
};

const categoryIcons = {
  work: 'briefcase',
  personal: 'account',
  shopping: 'cart',
  urgent: 'alert',
};

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const addTask = async () => {
    if (title.trim()) {
      try {
        await api.post('/add', {
          title,
          description,
          category,
          priority,
          deadline: deadline.toISOString(),
        });
        navigation.navigate('Tasks');
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Preview card to show how the task will look
  const TaskPreview = () => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Card style={[styles.previewCard, { backgroundColor: priorityColors[priority] + '20' }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={categoryIcons[category]}
              size={24}
              color={priorityColors[priority]}
            />
            <Text style={styles.previewLabel}>Preview</Text>
          </View>
          
          <Text variant="titleLarge" style={styles.previewTitle}>
            {title || 'Task Title'}
          </Text>
          
          <Text variant="bodyMedium" style={styles.previewDescription}>
            {description || 'Task Description'}
          </Text>
          
          <View style={styles.chipContainer}>
            <Chip icon="tag" style={styles.chip}>{category}</Chip>
            <Chip icon="calendar" style={styles.chip}>
              {deadline.toLocaleDateString()}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  // Get suggestions when title/description changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (title.length > 2 || description.length > 2) {
        try {
          const similarTasks = await aiService.getSimilarTasks(
            `${title} ${description}`,
            []
          );
          setSuggestions(similarTasks);
        } catch (error) {
          console.error('Error getting suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(timer);
  }, [title, description]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.surface}>
          <Text variant="titleLarge" style={styles.formTitle}>Create New Task</Text>
          
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon="pencil" />}
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            right={<TextInput.Icon icon="text" />}
          />

          <SuggestionsBox
            suggestions={suggestions}
            onSelect={(suggestion) => {
              setTitle(suggestion.title || suggestion.task);
              setDescription(suggestion.description || '');
              setCategory(suggestion.category || 'personal');
              setPriority(suggestion.priority || 'medium');
            }}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            {Object.entries(categoryIcons).map(([key, icon]) => (
              <Chip
                key={key}
                selected={category === key}
                onPress={() => setCategory(key)}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons
                    name={icon}
                    size={20}
                    color={category === key ? '#fff' : '#666'}
                  />
                )}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>Priority</Text>
          <SegmentedButtons
            value={priority}
            onValueChange={setPriority}
            buttons={[
              { 
                value: 'low',
                label: 'Low',
                style: { backgroundColor: priority === 'low' ? priorityColors.low + '40' : 'transparent' }
              },
              {
                value: 'medium',
                label: 'Medium',
                style: { backgroundColor: priority === 'medium' ? priorityColors.medium + '40' : 'transparent' }
              },
              {
                value: 'high',
                label: 'High',
                style: { backgroundColor: priority === 'high' ? priorityColors.high + '40' : 'transparent' }
              },
            ]}
            style={styles.segmentedButtons}
          />

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            Deadline: {deadline.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDeadline(selectedDate);
                }
              }}
            />
          )}

          <TaskPreview />

          <Button
            mode="contained"
            onPress={addTask}
            style={styles.submitButton}
            icon="plus"
            buttonColor="#9B7EDE"
          >
            Create Task
          </Button>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#9B7EDE',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: '#6B6B6B',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
    borderColor: '#9B7EDE',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#9B7EDE',
  },
  previewCard: {
    marginTop: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  previewTitle: {
    marginBottom: 8,
    color: '#2D2B52',
  },
  previewDescription: {
    marginBottom: 16,
    color: '#6B6B6B',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  }
});