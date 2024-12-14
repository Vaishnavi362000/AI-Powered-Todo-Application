from flask import Flask, request, jsonify, send_from_directory, url_for, flash, redirect
from services.ai_service import AIService
from flask_cors import CORS
from models import Session, Task, Priority, Category, Habit, HabitCompletion, BucketList
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os


app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8081", "http://127.0.0.1:5000", "http://192.168.1.7:8081"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Content-Range", "X-Content-Range"]
        }
    })
ai_service = AIService()


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# Rename the upload function to avoid conflicts
@app.route('/upload', methods=['POST'])
def handle_file_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Ensure upload folder exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save the file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Return the file URL
        file_url = url_for('serve_file', filename=filename, _external=True)
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': file_url
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

# Serve uploaded files
@app.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/bucket-list', methods=['GET'])
def get_bucket_list():
    session = Session()
    items = session.query(BucketList).all()
    
    return jsonify([{
        'id': item.id,
        'title': item.title,
        'description': item.description,
        'deadline': item.deadline.isoformat() if item.deadline else None,
        'status': item.status.value,
        'category': item.category.value,
        'priority': item.priority.value,
        'progress': item.progress,
        'image_url': item.image_url,
        'inspiration_images': item.inspiration_images,
        'tags': item.tags,
        'reward': item.reward,
        'steps': item.steps,
        'motivation': item.motivation,
        'created_at': item.created_at.isoformat(),
        'updated_at': item.updated_at.isoformat()
    } for item in items])

@app.route('/bucket-list/stats', methods=['GET'])
def get_bucket_list_stats():
    session = Session()
    total_goals = session.query(BucketList).count()
    completed_goals = session.query(BucketList).filter(BucketList.status == 'COMPLETED').count()
    in_progress = session.query(BucketList).filter(BucketList.status == 'IN_PROGRESS').count()
    
    return jsonify({
        'total_goals': total_goals,
        'completed_goals': completed_goals,
        'in_progress': in_progress,
        'completion_rate': (completed_goals / total_goals * 100) if total_goals > 0 else 0
    })

@app.route('/bucket-list/search', methods=['GET'])
def search_bucket_list():
    query = request.args.get('query', '')
    category = request.args.get('category')
    priority = request.args.get('priority')
    status = request.args.get('status')
    
    session = Session()
    items_query = session.query(BucketList)
    
    if query:
        items_query = items_query.filter(BucketList.title.ilike(f'%{query}%'))
    if category:
        items_query = items_query.filter(BucketList.category == Category[category.upper()])
    if priority:
        items_query = items_query.filter(BucketList.priority == Priority[priority.upper()])
    if status:
        items_query = items_query.filter(BucketList.status == status)
        
    items = items_query.all()

@app.route('/bucket-list', methods=['POST'])
def add_bucket_list_item():
    data = request.json
    session = Session()
    
    item = BucketList(
        title=data['title'],
        description=data.get('description'),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
        category=Category[data['category'].upper()],
        priority=Priority[data['priority'].upper()],
        image_url=data.get('image_url'),
        inspiration_images=data.get('inspiration_images', []),
        tags=data.get('tags', []),
        reward=data.get('reward'),
        steps=data.get('steps', []),
        motivation=data.get('motivation'),
        progress=0,
        status='NOT_STARTED'
    )
    
    session.add(item)
    session.commit()
    return jsonify({'message': 'Bucket list item added successfully', 'id': item.id})

@app.route('/tasks', methods=['GET'])
def get_tasks():
    session = Session()
    tasks = session.query(Task).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'category': task.category.value,
        'priority': task.priority.value,
        'deadline': task.deadline.isoformat() if task.deadline else None,
        'completed': task.completed
    } for task in tasks])

@app.route('/add', methods=['POST'])
def add_task():
    data = request.json
    session = Session()
    
    deadline = None
    if data.get('deadline'):
        deadline = datetime.fromisoformat(data['deadline'])
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        category=Category[data['category'].upper()],
        priority=Priority[data['priority'].upper()],
        deadline=deadline
    )
    
    session.add(task)
    session.commit()
    return jsonify({'message': 'Task added successfully'})

@app.route('/update/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    session = Session()
    task = session.query(Task).get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.json
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'category' in data:
        task.category = Category[data['category'].upper()]
    if 'priority' in data:
        task.priority = Priority[data['priority'].upper()]
    if 'deadline' in data:
        task.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
    if 'completed' in data:
        task.completed = data['completed']
    
    session.commit()
    return jsonify({'message': 'Task updated successfully'})

@app.route('/remove/<int:task_id>', methods=['DELETE'])
def remove_task(task_id):
    session = Session()
    task = session.query(Task).get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    session.delete(task)
    session.commit()
    return jsonify({'message': 'Task removed successfully'})


@app.route('/habits', methods=['GET'])
def get_habits():
    session = Session()
    # Get the date parameter from the request
    selected_date = request.args.get('date')
    
    # Base query
    query = session.query(Habit)
    
    # If date is provided, filter habits for that date
    if selected_date:
        selected_date = datetime.fromisoformat(selected_date.split('T')[0])
        # Filter habits based on their start_date
        query = query.filter(Habit.start_date <= selected_date)
    
    habits = query.all()
    
    # For each habit, check if it has completions for the selected date
    return jsonify([{
        'id': habit.id,
        'name': habit.name,
        'description': habit.description,
        'frequency': habit.frequency,
        'category': habit.category,
        'streak': habit.streak,
        'start_date': habit.start_date.isoformat() if habit.start_date else None,
        'last_completed': habit.last_completed.isoformat() if habit.last_completed else None,
        'reminder': habit.reminder,
        'target_count': habit.target_count,
        'completions': [{
            'date': completion.completed_date.isoformat(),
            'count': completion.count
        } for completion in habit.completions if not selected_date or 
            completion.completed_date == selected_date.date()]
    } for habit in habits])

@app.route('/add_habit', methods=['POST'])
def add_habit():
    data = request.json
    session = Session()
    
    # Convert start_date from ISO format
    start_date = None
    if data.get('start_date'):
        start_date = datetime.fromisoformat(data['start_date'].split('T')[0])
    
    habit = Habit(
        name=data['name'],
        description=data.get('description', ''),
        frequency=data['frequency'],
        category=data.get('category', 'health'),
        start_date=start_date,
        target_count=data.get('target_count', 1),
        reminder=data.get('reminder', False)
    )
    
    session.add(habit)
    session.commit()
    return jsonify({'message': 'Habit added successfully'})

@app.route('/update_habit/<int:habit_id>', methods=['PUT'])
def update_habit(habit_id):
    session = Session()
    habit = session.query(Habit).get(habit_id)
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    data = request.json
    if 'name' in data:
        habit.name = data['name']
    if 'description' in data:
        habit.description = data['description']
    if 'frequency' in data:
        habit.frequency = data['frequency']
    if 'streak' in data:
        habit.streak = data['streak']
    if 'last_completed' in data:
        habit.last_completed = datetime.fromisoformat(data['last_completed']) if data['last_completed'] else None
    
    session.commit()
    return jsonify({'message': 'Habit updated successfully'})

@app.route('/delete_habit/<int:habit_id>', methods=['DELETE'])
def delete_habit(habit_id):
    session = Session()
    habit = session.query(Habit).get(habit_id)
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    session.delete(habit)
    session.commit()
    return jsonify({'message': 'Habit deleted successfully'})

@app.route('/complete_habit/<int:habit_id>', methods=['POST'])
def complete_habit(habit_id):
    session = Session()
    habit = session.query(Habit).get(habit_id)
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    current_date = datetime.utcnow().date()
    
    # Check if habit was already completed today
    existing_completion = session.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completed_date == current_date
    ).first()
    
    if existing_completion:
        if habit.frequency == 'daily':
            return jsonify({'message': 'Already completed today'})
        # For habits that can be completed multiple times
        existing_completion.count += 1
    else:
        # Create new completion record
        completion = HabitCompletion(
            habit_id=habit_id,
            completed_date=current_date,
            count=1
        )
        session.add(completion)
        
        # Update streak
        if not habit.last_completed:
            habit.streak = 1
        else:
            last_completed_date = habit.last_completed.date()
            if current_date - last_completed_date == timedelta(days=1):
                habit.streak += 1
            elif current_date - last_completed_date > timedelta(days=1):
                habit.streak = 1
    
    habit.last_completed = datetime.utcnow()
    session.commit()
    
    return jsonify({
        'message': 'Habit completed',
        'streak': habit.streak,
        'last_completed': habit.last_completed.isoformat(),
        'completion_count': existing_completion.count if existing_completion else 1
    })

@app.route('/habit_stats/<int:habit_id>', methods=['GET'])
def get_habit_stats(habit_id):
    session = Session()
    habit = session.query(Habit).get(habit_id)
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    # Calculate completion rate for the last 30 days
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
    completions = session.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completed_date >= thirty_days_ago
    ).all()
    
    # Calculate completion rate based on frequency
    if habit.frequency == 'daily':
        completion_rate = len(completions) / 30.0
    elif habit.frequency == 'weekly':
        completion_rate = len(completions) / 4.0  # 4 weeks
    else:  # monthly
        completion_rate = len(completions)  # 1 month
    
    # Get completion history for calendar view
    completion_dates = {
        completion.completed_date.isoformat(): completion.count 
        for completion in completions
    }
    
    return jsonify({
        'streak': habit.streak,
        'completion_rate': completion_rate,
        'last_completed': habit.last_completed.isoformat() if habit.last_completed else None,
        'completion_history': completion_dates
    })

@app.route('/habit_completions/<int:habit_id>', methods=['GET'])
def get_habit_completions(habit_id):
    session = Session()
    completions = session.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id
    ).order_by(HabitCompletion.completed_date.desc()).all()
    
    return jsonify([{
        'date': completion.completed_date.isoformat(),
        'count': completion.count,
        'notes': completion.notes
    } for completion in completions])

@app.route('/api/suggestions/similar', methods=['POST'])
def get_similar_tasks():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text parameter'}), 400
            
        similar_tasks = ai_service.find_similar_tasks(
            data['text'],
            data.get('existing_tasks', [])
        )
        
        return jsonify({
            'suggestions': similar_tasks,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error in get_similar_tasks: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/suggestions/category', methods=['POST'])
def get_category_suggestion():
    data = request.json
    category = ai_service.suggest_category(
        data['title'],
        data['description']
    )
    return jsonify({'category': category})

@app.route('/bucket-list/<int:item_id>', methods=['PUT'])
def update_bucket_list_item(item_id):
    session = Session()
    item = session.query(BucketList).get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    data = request.json
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'deadline' in data:
        item.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
    if 'category' in data:
        item.category = Category[data['category'].upper()]
    if 'priority' in data:
        item.priority = Priority[data['priority'].upper()]
    if 'status' in data:
        item.status = data['status']
    if 'progress' in data:
        item.progress = data['progress']
    if 'image_url' in data:
        item.image_url = data['image_url']
    if 'inspiration_images' in data:
        item.inspiration_images = data['inspiration_images']
    if 'tags' in data:
        item.tags = data['tags']
    if 'reward' in data:
        item.reward = data['reward']
    if 'steps' in data:
        item.steps = data['steps']
    if 'motivation' in data:
        item.motivation = data['motivation']
    
    item.updated_at = datetime.utcnow()
    session.commit()
    return jsonify({'message': 'Bucket list item updated successfully'})

@app.route('/bucket-list/<int:item_id>', methods=['DELETE'])
def delete_bucket_list_item(item_id):
    session = Session()
    item = session.query(BucketList).get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    session.delete(item)
    session.commit()
    return jsonify({'message': 'Bucket list item deleted successfully'})

@app.route('/bucket-list/<int:item_id>/start', methods=['PUT'])
def start_bucket_list_item(item_id):
    session = Session()
    item = session.query(BucketList).get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    item.status = 'IN_PROGRESS'
    item.updated_at = datetime.utcnow()
    session.commit()
    return jsonify({'message': 'Bucket list item started successfully'})

@app.route('/bucket-list/<int:item_id>/complete', methods=['PUT'])
def complete_bucket_list_item(item_id):
    session = Session()
    item = session.query(BucketList).get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    item.status = 'COMPLETED'
    item.progress = 100
    item.updated_at = datetime.utcnow()
    session.commit()
    return jsonify({'message': 'Bucket list item completed successfully'})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Create uploads directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        file.save(filepath)
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': f'/uploads/{filename}'
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)