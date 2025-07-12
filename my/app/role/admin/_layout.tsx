import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: '#B3B3B3',
      tabBarStyle: { backgroundColor: '#181A20', borderTopColor: '#232136' },
      headerShown: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="book" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="money" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="meeting"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />, 
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="exclamation-circle" color={color} />, 
        }}
      />
    </Tabs>
  );
} 