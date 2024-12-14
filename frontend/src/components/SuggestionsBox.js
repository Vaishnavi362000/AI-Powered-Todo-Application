import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Chip, Card, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SuggestionsBox({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Surface style={styles.suggestionsContainer}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#666" />
        <Text style={styles.suggestionsTitle}>Smart Suggestions</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index}
            style={styles.suggestionCard}
            onPress={() => onSelect(suggestion)}
          >
            <Card.Content style={styles.cardContent}>
              <Text style={styles.suggestionTitle} numberOfLines={1}>
                {suggestion.title || suggestion.task || 'Unnamed Task'}
              </Text>
              {suggestion.description && (
                <Text style={styles.suggestionDescription} numberOfLines={2}>
                  {suggestion.description}
                </Text>
              )}
              <View style={styles.tagContainer}>
                {suggestion.category && (
                  <Chip 
                    style={styles.miniChip}
                    textStyle={styles.miniChipText}
                  >
                    {suggestion.category}
                  </Chip>
                )}
                {suggestion.priority && (
                  <Chip 
                    style={[styles.miniChip, { marginLeft: 4 }]}
                    textStyle={styles.miniChipText}
                  >
                    {suggestion.priority}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    fontWeight: '600',
  },
  suggestionCard: {
    marginRight: 12,
    width: 200,
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  cardContent: {
    padding: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniChip: {
    height: 24,
    backgroundColor: '#f0f0f0',
  },
  miniChipText: {
    fontSize: 10,
  }
});