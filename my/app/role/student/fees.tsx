import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Animated, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ACCENT = '#A259FF';
const BG = '#181A20';
const CARD_BG = '#23262F';
const SUCCESS = '#4CAF50';
const ERROR = '#F44336';
const PENDING = '#FFA000';

const studentInfo = {
  name: 'Shinchan',
  id: 'STU123456',
  class: 'Class A',
  balance: 12500,
};

const outstandingFees = [
  { id: '1', type: 'Tuition', due: '2024-07-01', amount: 10000, urgent: true },
  { id: '2', type: 'Library', due: '2024-07-10', amount: 1500, urgent: false },
  { id: '3', type: 'Lab', due: '2024-07-15', amount: 2000, urgent: false },
];

type PaymentMethod = {
  id: string;
  icon: 'credit-card' | 'university' | 'mobile';
  name: string;
  lastUsed: boolean;
};

const paymentMethods: PaymentMethod[] = [
  { id: '1', icon: 'credit-card', name: 'Credit Card', lastUsed: true },
  { id: '2', icon: 'university', name: 'Bank Transfer', lastUsed: false },
  { id: '3', icon: 'mobile', name: 'Digital Wallet', lastUsed: false },
];

const paymentHistory = [
  { id: '1', date: '2024-06-01', amount: 5000, method: 'Credit Card', status: 'Success' },
  { id: '2', date: '2024-05-15', amount: 3000, method: 'Bank Transfer', status: 'Success' },
  { id: '3', date: '2024-05-01', amount: 2000, method: 'Digital Wallet', status: 'Pending' },
  { id: '4', date: '2024-04-10', amount: 1000, method: 'Credit Card', status: 'Failed' },
];

export default function FeesScreen() {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id);
  const [paying, setPaying] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const totalDue = outstandingFees.reduce((sum, f) => sum + f.amount, 0);

  const filteredHistory = paymentHistory.filter(h =>
    (filter === 'All' || h.status === filter) &&
    (search === '' || h.method.toLowerCase().includes(search.toLowerCase()) || h.date.includes(search))
  );

  const handlePayNow = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Fees Payment</Text>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentName}>{studentInfo.name}</Text>
            <Text style={styles.studentId}>{studentInfo.id}</Text>
            <Text style={styles.studentClass}>{studentInfo.class}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>₹{studentInfo.balance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Outstanding Fees */}
        <Text style={styles.sectionTitle}>Outstanding Fees</Text>
        {outstandingFees.map(fee => (
          <View key={fee.id} style={styles.feeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeType}>{fee.type}</Text>
              <Text style={[styles.feeDue, fee.urgent && { color: ERROR }]}>Due: {fee.due}</Text>
            </View>
            <Text style={styles.feeAmount}>₹{fee.amount.toLocaleString()}</Text>
            <TouchableOpacity style={styles.quickPayBtn}>
              <Text style={styles.quickPayText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentMethodsRow}>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.8}
            >
              <FontAwesome name={method.icon} size={28} color={selectedMethod === method.id ? ACCENT : '#fff'} />
              <Text style={styles.methodName}>{method.name}</Text>
              {method.lastUsed && <Text style={styles.lastUsed}>Last used</Text>}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addMethodCard}>
            <FontAwesome name="plus" size={28} color={ACCENT} />
            <Text style={styles.methodName}>Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
      {/* Bottom Action Area */}
      <View style={styles.stickyBottom}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Due</Text>
          <Text style={styles.summaryValue}>₹{totalDue.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.payNowBtn} onPress={handlePayNow} disabled={paying}>
          {paying ? <ActivityIndicator color="#fff" /> : <Text style={styles.payNowText}>Pay Now</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReceipt}>
          <FontAwesome name="download" size={18} color={ACCENT} />
          <Text style={styles.downloadReceiptText}>Download Receipt</Text>
        </TouchableOpacity>
      </View>
      {/* Success/Error States */}
      {showSuccess && (
        <Animated.View style={[styles.statusPopup, { backgroundColor: SUCCESS }]}> 
          <FontAwesome name="check-circle" size={32} color="#fff" />
          <Text style={styles.statusPopupText}>Payment Successful!</Text>
        </Animated.View>
      )}
      {showError && (
        <Animated.View style={[styles.statusPopup, { backgroundColor: ERROR }]}> 
          <FontAwesome name="times-circle" size={32} color="#fff" />
          <Text style={styles.statusPopupText}>Receipt download failed!</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  headerSection: {
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: BG,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  studentName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 12,
  },
  studentId: {
    color: '#A0A0A0',
    fontSize: 14,
    marginRight: 12,
  },
  studentSemester: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  studentClass: {
    color: '#A0A0A0',
    fontSize: 14,
    marginLeft: 12,
  },
  balanceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 2,
  },
  balanceValue: {
    color: ACCENT,
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 10,
  },
  feeCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  feeType: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  feeDue: {
    color: '#FFA000',
    fontSize: 13,
  },
  feeAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  quickPayBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  quickPayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentMethodsRow: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  methodCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 14,
    width: 120,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  methodCardSelected: {
    borderWidth: 2,
    borderColor: ACCENT,
  },
  methodName: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  lastUsed: {
    color: ACCENT,
    fontSize: 12,
    marginTop: 2,
  },
  addMethodCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 14,
    width: 120,
    borderWidth: 2,
    borderColor: ACCENT,
    borderStyle: 'dashed',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 18,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 6,
    backgroundColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: ACCENT,
  },
  filterText: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: CARD_BG,
    color: '#fff',
    borderRadius: 8,
    fontSize: 15,
    padding: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  historyDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  historyMethod: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  historyAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stickyBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#A0A0A0',
    fontSize: 15,
  },
  summaryValue: {
    color: ACCENT,
    fontSize: 20,
    fontWeight: 'bold',
  },
  payNowBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  payNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  downloadReceiptText: {
    color: ACCENT,
    fontSize: 15,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  statusPopup: {
    position: 'absolute',
    top: 80,
    left: 40,
    right: 40,
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    zIndex: 100,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  statusPopupText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
}); 