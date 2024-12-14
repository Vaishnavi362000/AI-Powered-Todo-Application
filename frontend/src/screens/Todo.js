import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Card, Title, IconButton, Text, Searchbar, Chip, Portal, FAB, Modal, useTheme, Switch, TextInput, Button, Surface, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, Layout, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import api from '../config';
import SuggestionsBox from '../components/SuggestionsBox';
import { aiService } from '../services/aiService';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const priorityColors = {
  high: '#FF6B6B',
  medium: '#4ECDC4',
  low: '#B19CD9',
};

const priorityIcons = {
  high: 'flag',
  medium: 'flag-outline',
  low: 'flag-variant-outline',
};

const categoryIcons = {
  work: 'briefcase',
  personal: 'account',
  shopping: 'cart',
  urgent: 'alert',
};

const StatCard = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function TodoScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const toggleTaskComplete = async (taskId, currentStatus) => {
    try {
      await api.put(`/update/${taskId}`, { completed: !currentStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/remove/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  const editTask = async (taskId, updatedData) => {
    try {
      await api.put(`/update/${taskId}`, updatedData);
      setEditModalVisible(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    const getSuggestions = async () => {
      if (editingTask && (editingTask.title.length > 2 || editingTask.description.length > 2)) {
        const similarTasks = await aiService.getSimilarTasks(
          `${editingTask.title} ${editingTask.description}`,
          tasks.filter(t => t.id !== editingTask.id)
        );
        setSuggestions(similarTasks);
      }
    };

    const timer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(timer);
  }, [editingTask?.title, editingTask?.description]);

  const GreetingHeader = () => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    };
  
    const getGreetingIcon = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'weather-sunny';
      if (hour < 17) return 'weather-partly-cloudy';
      return 'weather-night';
    };
  
    const getTaskStats = () => {
      const completed = tasks.filter(task => task.completed).length;
      const total = tasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const remaining = total - completed;
      return { completed, total, percentage, remaining };
    };
  
    const stats = getTaskStats();
    
    return (
      <Surface style={styles.greetingContainer} elevation={4}>
        <LinearGradient
          colors={['#9B7EDE', '#B19CD9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.greetingContent}>
            <View style={styles.greetingLeft}>
              <View style={styles.greetingIconContainer}>
                <MaterialCommunityIcons
                  name={getGreetingIcon()}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
            
            <AnimatedCircularProgress
              size={80}
              width={8}
              fill={stats.percentage}
              tintColor="#FFFFFF"
              backgroundColor="rgba(255,255,255,0.2)"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.progressTextContainer}>
                  <Text style={styles.circularProgressValue}>{Math.round(fill)}%</Text>
                  <Text style={styles.circularProgressLabel}>Done</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
  
          <View style={styles.statsContainer}>
            <StatCard
              icon="checkbox-marked-circle-outline"
              value={stats.completed}
              label="Completed"
              color="#4CAF50"
            />
            <StatCard
              icon="clock-outline"
              value={stats.remaining}
              label="Remaining"
              color="#FF9800"
            />
            <StatCard
              icon="flag-outline"
              value={stats.total}
              label="Total"
              color="#2196F3"
            />
          </View>
        </LinearGradient>
      </Surface>
    );
  };
  
  

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesCompletion = showCompleted ? task.completed : !task.completed;
    return matchesSearch && matchesCategory && matchesPriority && matchesCompletion;
  });

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100)}
      exiting={SlideOutRight}
      layout={Layout.springify()}
      style={[styles.animatedView, { flexBasis: '48%' }]}
    >
      <Card
        style={[styles.card, { backgroundColor: `${priorityColors[item.priority]}20` }]}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.iconGroup}>
              <MaterialCommunityIcons
                name={categoryIcons[item.category]}
                size={20}
                color={theme.colors.primary}
              />
              <MaterialCommunityIcons
                name={priorityIcons[item.priority]}
                size={20}
                color={priorityColors[item.priority]}
                style={styles.iconSpacing}
              />
            </View>
            <IconButton
              icon={item.completed ? "check-circle" : "circle-outline"}
              onPress={() => toggleTaskComplete(item.id, item.completed)}
              size={20}
              iconColor={item.completed ? theme.colors.primary : theme.colors.disabled}
            />
          </View>
  
          <Title style={[styles.title, item.completed && styles.completedText]}>
            {item.title}
          </Title>
          <Text style={styles.description}>{item.description}</Text>
  
          <View style={styles.chipContainer}>
            <Chip icon="tag" style={styles.chip}>{item.category}</Chip>
            {item.deadline && (
              <Chip icon="calendar" style={styles.chip}>
                {new Date(item.deadline).toLocaleDateString()}
              </Chip>
            )}
          </View>
        </Card.Content>
  
        <View style={styles.actionBar}>
          <IconButton
            icon="pencil"
            onPress={() => {
              setEditingTask(item);
              setEditModalVisible(true);
            }}
            size={20}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="delete"
            onPress={() => removeTask(item.id)}
            size={20}
            iconColor={theme.colors.error}
          />
        </View>
      </Card>
    </Animated.View>
  );
  
  

  return (
    <SafeAreaView style={styles.container}>
      
      <Searchbar
        placeholder="Search tasks"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <GreetingHeader />
      <View style={styles.filterContainer}>
        <Chip
          selected={showCompleted}
          onPress={() => setShowCompleted(!showCompleted)}
          style={styles.filterChip}
        >
          {showCompleted ? 'Show Active' : 'Show Completed'}
        </Chip>
        <IconButton
          icon="filter-variant"
          onPress={() => setFilterVisible(true)}
        />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />

      <Portal>
        <Modal
          visible={filterVisible}
          onDismiss={() => setFilterVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Filters</Title>
          <View style={styles.filterOptions}>
            <Text>Category:</Text>
            <View style={styles.chipGroup}>
              {Object.keys(categoryIcons).map(category => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                  style={styles.filterChip}
                >
                  {category}
                </Chip>
              ))}
            </View>

            <Text>Priority:</Text>
            <View style={styles.chipGroup}>
              {Object.keys(priorityColors).map(priority => (
                <Chip
                  key={priority}
                  selected={selectedPriority === priority}
                  onPress={() => setSelectedPriority(
                    selectedPriority === priority ? null : priority
                  )}
                  style={styles.filterChip}
                >
                  {priority}
                </Chip>
              ))}
            </View>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => {
            setEditModalVisible(false);
            setEditingTask(null);
          }}
          contentContainerStyle={styles.modal}
        >
          {editingTask && (
            <View>
              <Text variant="titleLarge" style={styles.modalTitle}>Edit Task</Text>
              
              <TextInput
                label="Title"
                value={editingTask.title}
                onChangeText={(text) => setEditingTask({...editingTask, title: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Description"
                value={editingTask.description}
                onChangeText={(text) => setEditingTask({...editingTask, description: text})}
                mode="outlined"
                multiline
                style={styles.input}
              />
              
              <SuggestionsBox
                suggestions={suggestions}
                onSelect={(suggestion) => {
                  setEditingTask({
                    ...editingTask,
                    title: suggestion.title || suggestion.task,
                    description: suggestion.description || editingTask.description,
                    category: suggestion.category || editingTask.category,
                    priority: suggestion.priority || editingTask.priority
                  });
                }}
              />
              
              <View style={styles.chipGroup}>
                {Object.keys(categoryIcons).map(cat => (
                  <Chip
                    key={cat}
                    selected={editingTask.category === cat}
                    onPress={() => setEditingTask({...editingTask, category: cat})}
                    style={styles.filterChip}
                  >
                    {cat}
                  </Chip>
                ))}
              </View>
              
              <View style={styles.chipGroup}>
                {Object.keys(priorityColors).map(pri => (
                  <Chip
                    key={pri}
                    selected={editingTask.priority === pri}
                    onPress={() => setEditingTask({...editingTask, priority: pri})}
                    style={styles.filterChip}
                  >
                    {pri}
                  </Chip>
                ))}
              </View>
              
              <Button
                mode="contained"
                onPress={() => editTask(editingTask.id, editingTask)}
                style={styles.editButton}
              >
                Save Changes
              </Button>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  greetingContainer: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  greetingContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 100,
  },
  statIconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  circularProgressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  circularProgressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    elevation: 3,
    borderRadius: 10,
  },
  completedCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  filterOptions: {
    marginTop: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#9B7EDE',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#9B7EDE',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  editButton: {
    marginTop: 16,
    backgroundColor: '#9B7EDE',
  },
  animatedView: {
   
    margin: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});