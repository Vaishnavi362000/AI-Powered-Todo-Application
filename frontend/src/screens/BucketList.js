import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Image } from 'react-native';
import {
  FAB,
  Card,
  Text,
  Chip,
  Portal,
  Modal,
  TextInput,
  Button,
  IconButton,
  Surface,
  Searchbar,
  Menu,

  useTheme,
  ProgressBar,
  FlatList,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config';
import * as ImagePicker from 'expo-image-picker';

// Add StatItem component definition
const StatItem = ({ label, value, icon }) => (
  <View style={styles.statItem}>
    <MaterialCommunityIcons name={icon} size={24} color="#ffffff" />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const Category = {
  WORK: 'work',
  PERSONAL: 'personal',
  SHOPPING: 'shopping',
  URGENT: 'urgent',
  // Add any other categories you have defined in your backend
};

// Add helper functions
const getCategoryColors = (category) => {
  const colors = {
    PERSONAL: ['#FF9966', '#FF5E62'],
    TRAVEL: ['#4facfe', '#00f2fe'],
    CAREER: ['#43e97b', '#38f9d7'],
    HEALTH: ['#fa709a', '#fee140'],
    EDUCATION: ['#6a11cb', '#2575fc'],
    // Add more categories as needed
  };
  return colors[category] || ['#9B7EDE', '#B19CD9'];
};

const getCategoryIcon = (category) => {
  const icons = {
    PERSONAL: 'account',
    TRAVEL: 'airplane',
    CAREER: 'briefcase',
    HEALTH: 'heart',
    EDUCATION: 'school',
    // Add more categories as needed
  };
  return icons[category] || 'star';
};

const getStatusStyle = (status) => {
  const styles = {
    COMPLETED: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    IN_PROGRESS: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    NOT_STARTED: { backgroundColor: '#9E9E9E', borderColor: '#9E9E9E' },
  };
  return [{ borderWidth: 1, margin: 4 }, styles[status]];
};

const getProgressColor = (progress) => {
  if (progress >= 75) return '#4CAF50';
  if (progress >= 50) return '#2196F3';
  if (progress >= 25) return '#FFC107';
  return '#FF5722';
};

// Add new helper function for priority colors
const getPriorityColors = (priority) => {
  const colors = {
    HIGH: ['#EF4444', '#DC2626'],
    MEDIUM: ['#F59E0B', '#D97706'],
    LOW: ['#10B981', '#059669'],
  };
  return colors[priority] || ['#6B7280', '#4B5563'];
};



export default function BucketListScreen() {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [reward, setReward] = useState('');
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [motivation, setMotivation] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [inspirationImages, setInspirationImages] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('');

  const [stats, setStats] = useState({
    total_goals: 0,
    completed_goals: 0,
    in_progress: 0,
    completion_rate: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    priority: null,
    status: null
  });

  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bucket-list');
      setItems(response.data);
    } catch (error) {
      setError('Failed to fetch bucket list items');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/bucket-list/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchItems();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchItems().finally(() => setRefreshing(false));
  }, []);

  const handleAddItem = async () => {
    try {
      setLoading(true);
      const itemData = {
        title,
        description,
        category,
        priority,
        deadline: deadline.toISOString(),
        tags,
        reward,
        steps,
        motivation,
        imageUrl,
        inspirationImages,
      };

      await api.post('/bucket-list', itemData);
      setVisible(false);
      clearForm();
      fetchItems();
    } catch (error) {
      setError('Failed to add item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('PERSONAL');
    setPriority('MEDIUM');
    setDeadline(new Date());
    setTags([]);
    setReward('');
    setSteps([]);
    setMotivation('');
    setImageUrl(null);
    setInspirationImages([]);
    setSelectedPriority('MEDIUM');
  };

  const handleStartItem = async (itemId) => {
    try {
      await api.put(`/bucket-list/${itemId}/start`);
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to start item:', error);
    }
  };

  const handleEditItem = async (item) => {
    try {
      setTitle(item.title);
      setDescription(item.description);
      setCategory(item.category);
      setPriority(item.priority);
      setDeadline(item.deadline ? new Date(item.deadline) : new Date());
      setTags(item.tags || []);
      setReward(item.reward || '');
      setSteps(item.steps || []);
      setMotivation(item.motivation || '');
      setImageUrl(item.image_url || null);
      setInspirationImages(item.inspiration_images || []);
      setSelectedPriority(item.priority);
      setEditingItem(item);
      setVisible(true);
    } catch (error) {
      console.error('Failed to load item for editing:', error);
      alert('Failed to load item for editing. Please try again.');
    }
  };

  const handleUpdateItem = async () => {
    try {
      setLoading(true);
      const updatedData = {
        title,
        description,
        category,
        priority,
        deadline: deadline.toISOString(),
        tags,
        reward,
        steps,
        motivation,
        imageUrl,
        inspirationImages,
      };
      
      await api.put(`/bucket-list/${editingItem.id}`, updatedData);
      setVisible(false);
      clearForm();
      setEditingItem(null);
      fetchItems();
      fetchStats();
    } catch (error) {
      setError('Failed to update item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/bucket-list/${itemId}`);
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleCompleteItem = async (itemId) => {
    try {
      await api.put(`/bucket-list/${itemId}/complete`);
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Failed to complete item:', error);
    }
  };

  const renderHeader = () => (
    <Surface style={styles.headerContainer}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Bucket List</Text>
            <Text style={styles.headerSubtitle}>Track your life goals</Text>
          </View>
          <AnimatedCircularProgress
            size={100}
            width={10}
            fill={stats.completion_rate}
            tintColor="#FFF"
            backgroundColor="rgba(255,255,255,0.2)"
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressValue}>{Math.round(fill)}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={stats.total_goals}
            label="Total Goals"
            icon="flag-outline"
          />
          <StatCard
            value={stats.completed_goals}
            label="Completed"
            icon="check-circle-outline"
          />
          <StatCard
            value={stats.in_progress}
            label="In Progress"
            icon="progress-clock"
          />
        </View>
      </LinearGradient>
    </Surface>
  );

  const StatCard = ({ value, label, icon }) => (
    <View style={styles.statCard}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFF" style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search your goals..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#6366F1"
      />
      <IconButton
        icon="tune-vertical"
        size={24}
        iconColor="#6366F1"
        style={styles.filterButton}
        onPress={() => setFilterVisible(true)}
      />
    </View>
  );

  const renderGoalCard = (item) => (
    <Card style={[styles.goalCard, { backgroundColor: `${getCategoryColors(item.category)[0]}20` }]}>
      <LinearGradient
        colors={getCategoryColors(item.category)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardHeader}
      >
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
        
        <View style={styles.actionButtons}>
            <IconButton
              icon="pencil-outline"
              size={18}
              onPress={() => handleEditItem(item)}
              containerColor="#F3F4F6"
              />
            <IconButton
              icon="delete-outline"
              size={18}
              onPress={() => handleDeleteItem(item.id)}
              containerColor="#FEE2E2"
              iconColor="#EF4444"
            />
            {status !== 'COMPLETED' && (
              <IconButton
                icon="check-circle-outline"
                size={18}
                onPress={() => handleCompleteItem(item.id)}
                containerColor="#DCFCE7"
                iconColor="#10B981"
              />
            )}
        </View>
        </View>
      </LinearGradient>

      <Card.Content style={styles.cardContent}>
        <View style={styles.categoryRow}>
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category)}
            size={20}
            color="#6366F1"
          />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.goalTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.goalDescription} numberOfLines={3}>{item.description}</Text>
        </View>
        
          <AnimatedCircularProgress
            size={50}
            width={4}
            fill={item.progress || 0}
            tintColor={getProgressColor(item.progress || 0)}
            backgroundColor="#E5E7EB"
            rotation={0}
          >
            {(fill) => (
              <Text style={styles.progressText}>{Math.round(fill)}%</Text>
            )}
          </AnimatedCircularProgress>
        </View>
 
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          {item.reward && (
            <View style={styles.rewardContainer}>
              <MaterialCommunityIcons name="gift-outline" size={16} color="#6366F1" />
               <Text style={styles.rewardText} numberOfLines={1}>{item.reward}</Text>
               </View>
          )}
          <View style={styles.deadlineContainer}>
              <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.deadlineText}>
              {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
                </Text>
            </View>
          </View>

         
      </Card.Content>
    </Card>
  );

  const renderForm = () => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          setVisible(false);
          setEditingItem(null);
          clearForm();
        }}
        contentContainerStyle={styles.modalContent}
      >
        <ScrollView>
          <Text style={styles.modalTitle}>
            {editingItem ? 'Edit Goal' : 'Add New Goal'}
          </Text>
  
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Basic Information</Text>
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />
  
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Category & Priority</Text>
          <View style={styles.categoryGrid}>
            {Object.keys(Category).map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons
                    name={getCategoryIcon(cat)}
                    size={20}
                    color={category === cat ? '#FFF' : '#6366F1'}
                  />
                )}
              >
                {cat}
              </Chip>
            ))}
          </View>

          <View style={styles.priorityContainer}>
            {['LOW', 'MEDIUM', 'HIGH'].map((pri) => (
              <Chip
                key={pri}
                selected={selectedPriority === pri}
                onPress={() => setSelectedPriority(pri)}
                style={[
                  styles.priorityChip,
                  selectedPriority === pri && styles.selectedPriorityChip,
                ]}
              >
                {pri}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Timeline & Tags</Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            {deadline ? deadline.toLocaleDateString() : 'Select a deadline'}
          </Button>

          <TextInput
            label="Tags (comma-separated)"
            value={tags.join(', ')}
            onChangeText={(text) => setTags(text.split(',').map(t => t.trim()))}
            mode="outlined"
            style={styles.input}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Additional Details</Text>
          <TextInput
            label="Reward"
            value={reward}
            onChangeText={setReward}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Motivation"
            value={motivation}
            onChangeText={setMotivation}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />
        </View>

        <Button
          mode="contained"
          onPress={editingItem ? handleUpdateItem : handleAddItem}
          loading={loading}
          style={styles.submitButton}
        >
          {editingItem ? 'Update Goal' : 'Add Goal'}
        </Button>
      </ScrollView>
    </Modal>
  </Portal>
);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderSearchBar()}
        {items.map(renderGoalCard)}
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setVisible(true)}
        color="#FFF"
      />
      
      {renderForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  searchInput: {
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  goalCard: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCategory: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statusChip: {
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366F1',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  categoryChip: {
    margin: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityChip: {
    flex: 1,
    marginTop: 12
  },
  selectedPriorityChip: {
    backgroundColor: '#6366F1',
  },
  dateButton: {
    marginBottom: 12,
    borderColor: '#6366F1',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderColor: '#6366F1',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardHeader: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  progressSection: {
    marginVertical: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  priorityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    height: 40, // Fixed height for 2 lines
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  rewardContainer: {
   
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rewardText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  cardFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});