import json
import os
from pathlib import Path

class AIService:
    def __init__(self):
        self.recommendations = []
        self.load_recommendations()
    
    def load_recommendations(self):
        try:
            base_dir = Path(__file__).resolve().parent.parent
            recommendations_path = base_dir / 'ml_models' / 'recommendations.json'
            
            with open(recommendations_path, 'r') as f:
                self.recommendations = json.load(f)
        except FileNotFoundError as e:
            print(f"Error loading recommendations: {e}")
            self.recommendations = []
        except Exception as e:
            print(f"Unexpected error loading recommendations: {e}")
            self.recommendations = []
    
    def find_similar_tasks(self, input_text, existing_tasks=None, top_k=3):
        try:
            if not input_text:
                return []
                
            input_words = set(input_text.lower().split())
            similarities = []
            
            for rec in self.recommendations:
                try:
                    # Get task text from recommendation
                    task_text = rec.get('task', '').lower()
                    task_words = set(task_text.split())
                    
                    # Calculate word overlap similarity
                    union_length = len(input_words.union(task_words))
                    if union_length > 0:
                        intersection_length = len(input_words.intersection(task_words))
                        similarity = intersection_length / union_length
                        
                        # Create a new dictionary with similarity score
                        suggestion = {
                            'title': rec.get('task'),
                            'category': rec.get('category', 'personal'),
                            'description': rec.get('description', ''),
                            'priority': rec.get('priority', 'medium'),
                            'similarity_score': similarity,
                            'similar_habits': rec.get('similar_habits', [])
                        }
                        similarities.append((similarity, suggestion))
                except Exception as e:
                    print(f"Error processing recommendation: {e}")
                    continue
            
            # Sort by similarity score
            similarities.sort(key=lambda x: x[0], reverse=True)
            
            # Return only the suggestion dictionaries, not the scores
            return [item[1] for item in similarities[:top_k]]
            
        except Exception as e:
            print(f"Error in find_similar_tasks: {e}")
            return []
    
    def suggest_category(self, title, description):
        try:
            text = f"{title} {description}".lower()
            
            category_keywords = {
                'work': ['work', 'project', 'meeting', 'deadline', 'office'],
                'personal': ['home', 'family', 'self', 'life', 'personal'],
                'shopping': ['buy', 'shop', 'purchase', 'grocery', 'store'],
                'urgent': ['urgent', 'important', 'asap', 'deadline', 'critical']
            }
            
            max_matches = 0
            suggested_category = 'personal'  # default
            
            for category, keywords in category_keywords.items():
                matches = sum(1 for keyword in keywords if keyword in text)
                if matches > max_matches:
                    max_matches = matches
                    suggested_category = category
            
            return suggested_category
        except Exception as e:
            print(f"Error in suggest_category: {e}")
            return 'personal'