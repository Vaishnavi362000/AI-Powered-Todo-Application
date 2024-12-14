import { createStackNavigator } from '@react-navigation/stack';
import TodoScreen from '../screens/Todo';
import AddTaskScreen from '../screens/AddTask';

const Stack = createStackNavigator();

export default function TaskStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TaskList" 
        component={TodoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen}
        options={{ 
          headerTitle: 'Add New Task',
          headerStyle: {
            backgroundColor: '#9B7EDE',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack.Navigator>
  );
} 