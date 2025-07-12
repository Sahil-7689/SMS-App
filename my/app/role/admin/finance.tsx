import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Tab = createMaterialTopTabNavigator();

function FeeStructureTab() {
  return (
    <View style={styles.centered}><Text style={styles.text}>Fee Structure</Text></View>
  );
}
function CollectionTab() {
  return (
    <View style={styles.centered}><Text style={styles.text}>Collection</Text></View>
  );
}
function PendingPaymentsTab() {
  return (
    <View style={styles.centered}><Text style={styles.text}>Pending Payments</Text></View>
  );
}

export default function FinanceTabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <Text style={styles.tabTitle}>Finance</Text>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#A259FF',
          tabBarInactiveTintColor: '#A0A0A0',
          tabBarStyle: { backgroundColor: '#23262F' },
          tabBarIndicatorStyle: { backgroundColor: '#A259FF' },
          tabBarLabelStyle: { fontWeight: 'bold' },
          tabBarIcon: ({ color }) => {
            switch (route.name) {
              case 'Fee Structure':
                return <FontAwesome name="money" size={20} color={color} />;
              case 'Collection':
                return <FontAwesome name="credit-card" size={20} color={color} />;
              case 'Pending Payments':
                return <FontAwesome name="exclamation-circle" size={20} color={color} />;
              default:
                return <FontAwesome name="question" size={20} color={color} />;
            }
          },
          tabBarShowIcon: true,
        })}
      >
        <Tab.Screen name="Fee Structure" component={FeeStructureTab} />
        <Tab.Screen name="Collection" component={CollectionTab} />
        <Tab.Screen name="Pending Payments" component={PendingPaymentsTab} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181A20',
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
}); 