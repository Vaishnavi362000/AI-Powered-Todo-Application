import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Surface, 
  Text, 
  Title, 
  Button, 
  IconButton, 
  Menu,
  Chip,
  ProgressBar,
  TouchableRipple,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import api from '../config';
import { aiService } from '../services/aiService';
import SuggestionsBox from '../components/SuggestionsBox';

const habitCategories = {
  health: { icon: 'heart', color: '#FF6B6B' },
  fitness: { icon: 'run', color: '#4ECDC4' },
  learning: { icon: 'book', color: '#45B7D1' },
  productivity: { icon: 'briefcase', color: '#96CEB4' },
  mindfulness: { icon: 'meditation', color: '#FFEEAD' }
};

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const CalendarHeader = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDates = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 31; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <View style={styles.calendarContainer}>
      <Text style={styles.monthText}>
        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.datesScrollView}
      >
        {getDates().map(date => (
          <TouchableRipple
            key={date.toISOString()}
            onPress={() => handleDateSelect(date)}
            style={[
              styles.dateButton,
              date.toDateString() === new Date().toDateString() && styles.todayButton,
              date.toDateString() === selectedDate.toDateString() && styles.selectedButton
            ]}
          >
            <View>
              <Text style={[
                styles.dayName,
                date.toDateString() === new Date().toDateString() && styles.todayText,
                date.toDateString() === selectedDate.toDateString() && styles.selectedText
              ]}>
                {weekDays[date.getDay()]}
              </Text>
              <Text style={[
                styles.dateText,
                date.toDateString() === new Date().toDateString() && styles.todayText,
                date.toDateString() === selectedDate.toDateString() && styles.selectedText
              ]}>
                {date.getDate()}
              </Text>
              {/* Streak indicator */}
              <View style={styles.streakDot} />
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
};

const HabitStats = ({ habit }) => {
  const streakGoals = [7, 30, 100];
  const currentStreak = habit.streak || 0;
  const nextGoal = streakGoals.find(goal => goal > currentStreak) || streakGoals[streakGoals.length - 1];
  
  return (
    <View style={styles.statsContainer}>
      <View style={styles.streakMilestone}>
        <MaterialCommunityIcons 
          name={currentStreak >= nextGoal ? "trophy" : "trophy-outline"} 
          size={24} 
          color={currentStreak >= nextGoal ? "#FFD700" : "#B19CD9"} 
        />
        <Text style={styles.streakGoalText}>
          {currentStreak}/{nextGoal} days streak
        </Text>
      </View>
      
      <ProgressBar
        progress={currentStreak / nextGoal}
        color={habitCategories[habit.category]?.color || '#B19CD9'}
        style={styles.streakProgress}
      />
    </View>
  );
};

const HabitCard = ({ habit, onComplete, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const progress = habit.completions?.length || 0;
  const targetCount = habit.target_count || 1;

  return (
    <Surface style={styles.habitCard} elevation={2}>
      <View style={styles.habitHeader}>
        <TouchableRipple 
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.habitHeaderContent}
        >
          <View style={styles.habitMainInfo}>
            <View style={styles.habitIcon}>
              <MaterialCommunityIcons
                name={habitCategories[habit.category]?.icon || 'star'}
                size={24}
                color={habitCategories[habit.category]?.color || '#B19CD9'}
              />
            </View>
            <View style={styles.habitInfo}>
              <Title style={styles.habitTitle}>{habit.name}</Title>
              <Chip 
                style={[styles.frequencyChip, { 
                  backgroundColor: (habitCategories[habit.category]?.color || '#B19CD9') + '20' 
                }]}
                textStyle={{ color: habitCategories[habit.category]?.color || '#B19CD9' }}
              >
                {habit.frequency}
              </Chip>
            </View>
          </View>
        </TouchableRipple>
        

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              onEdit(habit);
            }} 
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              onDelete(habit.id);
            }} 
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
        
        
      </View>

      {isExpanded && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={{ height: 220 }}>
          <Text style={styles.habitDescription}>{habit.description}</Text>
          <HabitStats habit={habit} />
          <View style={styles.completionContainer}>
            <Text style={styles.completionLabel}>
              Progress: {progress}/{targetCount} for today
            </Text>
            <View style={{ flex: 1 }}>
            <ProgressBar
                progress={progress / targetCount}
              color={habitCategories[habit.category]?.color || '#B19CD9'}
              style={styles.progressBar}
            />
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => onComplete(habit.id)}
                style={[styles.actionButton, { 
                  backgroundColor: habitCategories[habit.category]?.color || '#B19CD9' 
                }]}
              >
                Complete {habit.streak > 0 ? '🔥' : ''}
              </Button>
            </View>
            </View>
          </View>
        </Animated.View>
      )}
    </Surface>
  );
};

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newHabit, setNewHabit] = useState({
    id: null,
    name: '',
    description: '',
    frequency: 'daily',
    category: 'health',
    reminder: false,
    target_count: 1
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchHabits();
  }, [selectedDate]);

  useEffect(() => {
    const getSuggestions = async () => {
      if (newHabit.name.length > 2 || newHabit.description.length > 2) {
        const similarTasks = await aiService.getSimilarTasks(
          newHabit.name,
          newHabit.description,
          habits
        );
        setSuggestions(similarTasks);

        if (similarTasks.length > 0 && similarTasks[0].similarity_score > 0.5) {
          setNewHabit(prev => ({
            ...prev,
            category: similarTasks[0].category
          }));
        }
      }
    };

    const timer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(timer);
  }, [newHabit.name, newHabit.description]);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits', {
        params: {
          date: selectedDate.toISOString()
        }
      });
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const habitData = {
        ...newHabit,
        start_date: selectedDate.toISOString()
      };

      if (isEditing) {
        await api.put(`/update_habit/${newHabit.id}`, habitData);
      } else {
        await api.post('/add_habit', habitData);
      }
      setModalVisible(false);
      resetForm();
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const resetForm = () => {
    setNewHabit({
      id: null,
      name: '',
      description: '',
      frequency: 'daily',
      category: 'health',
      reminder: false,
      target_count: 1
    });
    setIsEditing(false);
  };

  const completeHabit = async (habitId) => {
    try {
      await api.post(`/complete_habit/${habitId}`);
      fetchHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleEditHabit = (habit) => {
    setNewHabit({
      ...habit,
      category: habit.category || 'health'
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await api.delete(`/delete_habit/${habitId}`);
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // fetchHabits will be called automatically due to the useEffect dependency
  };

  const renderSuggestions = () => {
    if (!suggestions.length) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Similar Habits:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              style={styles.suggestionChip}
              onPress={() => {
                console.log('Selected suggestion:', suggestion); // Debug log
                setNewHabit(prev => ({
                  ...prev,
                  name: suggestion.title || suggestion.task || prev.name,
                  category: suggestion.category || prev.category,
                  description: suggestion.description || prev.description
                }));
              }}
            >
              {suggestion.title}
            </Chip>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalendarHeader onDateSelect={handleDateSelect} />
      <ScrollView style={styles.content}>
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={completeHabit}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
          />
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>
            {isEditing ? 'Edit Habit' : 'Create New Habit'}
          </Title>
          
          <TextInput
            label="Habit Name"
            value={newHabit.name}
            onChangeText={(text) => setNewHabit({ ...newHabit, name: text })}
            style={styles.input}
          />
          
          <TextInput
            label="Description"
            value={newHabit.description}
            onChangeText={(text) => setNewHabit({ ...newHabit, description: text })}
            style={styles.input}
            multiline
          />
          
          <SuggestionsBox
            suggestions={suggestions}
            onSelect={(suggestion) => {
              console.log('Selected suggestion:', suggestion); // Debug log
              setNewHabit(prev => ({
                ...prev,
                name: suggestion.title || suggestion.task || prev.name,
                category: suggestion.category || prev.category,
                description: suggestion.description || prev.description
              }));
            }}
          />
          
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            {Object.entries(habitCategories).map(([key, { icon, color }]) => (
              <Chip
                key={key}
                selected={newHabit.category === key}
                onPress={() => setNewHabit({ ...newHabit, category: key })}
                icon={() => (
                  <MaterialCommunityIcons name={icon} size={20} color={color} />
                )}
                style={styles.categoryChip}
              >
                {key}
              </Chip>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Frequency</Text>
          <SegmentedButtons
            value={newHabit.frequency}
            onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value })}
            buttons={frequencies}
          />
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.addButton}
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </Modal>
      </Portal>

      <Button
        mode="contained"
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      >
        Add Habit
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  habitCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    elevation: 2,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayText: {
    width: (Dimensions.get('window').width - 32) / 7,
    textAlign: 'center',
    color: '#666666',
    fontWeight: '500',
  },
  datesScrollView: {
    paddingHorizontal: 8,
  },
  datesScrollContent: {
    paddingVertical: 8,
  },
  dateContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
  },
  todayContainer: {
    backgroundColor: '#9B7EDE',
  },
  dateText: {
    fontSize: 16,
    color: '#666666',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  habitDescription: {
    padding: 16,
    paddingTop: 0,
    color: '#666666',
  },
  frequencyChip: {
    marginTop: 4,
    height: 24,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  streakMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakGoalText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666666',
  },
  streakProgress: {
    height: 8,
    borderRadius: 4,
  },
  completionContainer: {
    padding: 16,
    paddingTop: 0,
  },
  completionLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666666',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#9B7EDE',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#9B7EDE',
  },
  habitHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitMainInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginLeft: 'auto',
  },
  dateButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    elevation: 2,
  },
  todayButton: {
    backgroundColor: '#9B7EDE',
  },
  dayName: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  todayText: {
    color: '#FFFFFF',
  },
  streakDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    marginTop: 4,
  },
  selectedButton: {
    backgroundColor: '#7B5CD9', // Darker shade of your primary color
    borderWidth: 2,
    borderColor: '#9B7EDE',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dateChip: {
    marginTop: 4,
    backgroundColor: '#F0F0F0',
  },
  suggestionsContainer: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  suggestionChip: {
    margin: 4,
    backgroundColor: '#e0e0e0',
  }
});