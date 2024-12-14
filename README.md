# AI-Powered Todo Application

An advanced todo application that combines modern UI/UX with artificial intelligence to provide smart task suggestions and management. Built with React Native and Flask, featuring Sentence Transformers for intelligent task recommendations.

![App Screenshot](./assets/screenshots/app-preview.png)

## 🌟 Key Features

- 🤖 AI-powered task suggestions using Sentence Transformers
- 📋 Comprehensive task management system
- 🎯 Habit tracking with streak monitoring
- 🪣 Bucket list goal setting
- 🌓 Dark/Light theme support
- 📱 Responsive and animated UI
- 🔐 Secure user authentication
- 📊 Progress visualization

## 📸 Screenshots

<div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <img src="../frontend/assets/screenshots/task1.png" alt="Tasks Screen" width="200"/>
    <img src="./assets/screenshots/task2.png" alt="Tasks Screen" width="200"/>
    <img src="./assets/screenshots/task3.png" alt="Tasks Screen" width="200"/>
    <img src="./assets/screenshots/task4.png" alt="Tasks Screen" width="200"/>
    <img src="./assets/screenshots/bucket1.png" alt="Bucket List" width="200"/>
    <img src="./assets/screenshots/bucket2.png" alt="Bucket List" width="200"/>
    <img src="./assets/screenshots/habit1.png" alt="Habits Screen" width="200"/>
    <img src="./assets/screenshots/habit2.png" alt="Habits Screen" width="200"/>
    <img src="./assets/screenshots/setting1.png" alt="Settings" width="200"/>
</div>

## 🤖 AI/ML Integration

### Sentence Transformers Implementation

The application leverages Hugging Face's Sentence Transformers for intelligent task suggestions and categorization:

### AI Features

1. **Smart Task Suggestions**
   - Analyzes task content using Sentence Transformers
   - Suggests similar tasks based on semantic similarity
   - Helps prevent duplicate task creation
   - Provides category recommendations

2. **Intelligent Categorization**
   - Automatically suggests task categories
   - Learns from user patterns
   - Improves organization efficiency

## 🛠️ Technology Stack

### Frontend
- React Native with Expo
- React Navigation for routing
- React Native Paper for UI
- Axios for API communication
- AsyncStorage for local storage
- React Native Reanimated for animations

### Backend
- Flask (Python)
- SQLite Database
- JWT Authentication
- Sentence Transformers (Hugging Face)
- scikit-learn for similarity computations

## ⚙️ Installation

### Frontend Setup

```bash
cd todo/frontend
npm install
npm start
```

### Backend Setup
```bash
cd todo/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### Environment Configuration
Create `.env` file in backend directory:
```env
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///todo.db
FLASK_ENV=development
FLASK_APP=app.py
```

## 📁 Project Structure

```
todo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── config.js
│   ├── assets/
│   └── App.js
└── backend/
    ├── app.py
    ├── models/
    ├── routes/
    ├── services/
    └── utils/
```

## 🚀 Usage

1. **Task Management**
   - Create, edit, and delete tasks
   - Set priorities and categories
   - Track progress and deadlines

2. **Habit Tracking**
   - Set up daily/weekly/monthly habits
   - Monitor streaks and progress
   - View detailed statistics

3. **Bucket List**
   - Create long-term goals
   - Track achievement progress
   - Organize by categories

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📸 Adding Screenshots

To add screenshots to this README:

1. Create a screenshots directory:
```bash
mkdir -p assets/screenshots
```

2. Add your screenshots to this directory
3. Reference them in the README using relative paths:
```markdown
![Screenshot Description](./assets/screenshots/screenshot-name.png)
```

## 🙏 Acknowledgments

- Hugging Face for Sentence Transformers
- React Native Paper for UI components
- The open-source community

---

<p align="center">
  Made with ❤️ by [Your Name]
</p>
```

To add screenshots to your README:

1. Create an `assets/screenshots` directory in your project root
2. Take screenshots of your app's key features
3. Save them in the screenshots directory
4. Update the image paths in the README to match your screenshot filenames
5. Optimize the images for web viewing (compress them if needed)

Recommended screenshots to include:
- Main task list
- Task creation/editing interface
- Habit tracking view
- Bucket list view
- Settings screen
- Dark/light theme comparison
- AI suggestions in action

Remember to:
- Use clear, high-quality screenshots
- Keep image file sizes reasonable
- Add descriptive alt text for accessibility
- Maintain consistent image sizes in the README

You can also add GIFs to demonstrate interactive features or workflows using tools like ScreenToGif or LICEcap.
```

To add screenshots to your README:

1. Create an `assets/screenshots` directory in your project root
2. Take screenshots of your app's key features
3. Save them in the screenshots directory
4. Update the image paths in the README to match your screenshot filenames
5. Optimize the images for web viewing (compress them if needed)

Recommended screenshots to include:
- Main task list
- Task creation/editing interface
- Habit tracking view
- Bucket list view
- Settings screen
- Dark/light theme comparison
- AI suggestions in action

Remember to:
- Use clear, high-quality screenshots
- Keep image file sizes reasonable
- Add descriptive alt text for accessibility
- Maintain consistent image sizes in the README

You can also add GIFs to demonstrate interactive features or workflows using tools like ScreenToGif or LICEcap.
