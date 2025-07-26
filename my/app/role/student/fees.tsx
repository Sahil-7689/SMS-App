import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Animated, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const ACCENT = '#A259FF';
const BG = '#181A20';
const CARD_BG = '#23262F';
const SUCCESS = '#4CAF50';
const ERROR = '#F44336';
const PENDING = '#FFA000';

// Add explicit types for placeholders
interface StudentInfo { name: string; id: string; class: string; balance: number; }
interface OutstandingFee { id: string; type: string; due: string; amount: number; urgent: boolean; }
type PaymentMethod = { id: string; icon: string; name: string; lastUsed: boolean; };
interface PaymentHistory { id: string; date: string; amount: number; method: string; status: string; }
const studentInfo: Partial<StudentInfo> = {}; // TODO: Inject student info from API or context
const outstandingFees: OutstandingFee[] = []; // TODO: Inject from API or context
const paymentMethods: PaymentMethod[] = []; // TODO: Inject from API or context
const paymentHistory: PaymentHistory[] = []; // TODO: Inject from API or context

export default function FeesScreen() {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.id || '');
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
            <Text style={styles.studentName}>{studentInfo.name || 'N/A'}</Text>
            <Text style={styles.studentId}>{studentInfo.id || 'N/A'}</Text>
            <Text style={styles.studentClass}>{studentInfo.class || 'N/A'}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>₹{studentInfo.balance?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Outstanding Fees */}
        <Text style={styles.sectionTitle}>Outstanding Fees</Text>
        {outstandingFees.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>No outstanding fees.</Text>
        ) : (
          outstandingFees.map(fee => (
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
          ))
        )}

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        {paymentMethods.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>No payment methods.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentMethodsRow}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.8}
              >
                <FontAwesome name={method.icon as any} size={28} color={selectedMethod === method.id ? ACCENT : '#fff'} />
                <Text style={styles.methodName}>{method.name}</Text>
                {method.lastUsed && <Text style={styles.lastUsed}>Last used</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addMethodCard}>
              <FontAwesome name="plus" size={28} color={ACCENT} />
              <Text style={styles.methodName}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Payment History */}
        <Text style={styles.sectionTitle}>Payment History</Text>
        {paymentHistory.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center', padding: 20 }}>No payment history.</Text>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyRow}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyMethod}>{item.method}</Text>
                <Text style={styles.historyAmount}>₹{item.amount.toLocaleString()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Success' ? SUCCESS : (item.status === 'Failed' ? ERROR : PENDING) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            )}
            ListHeaderComponent={() => (
              <View style={styles.historyHeaderRow}>
                <View style={styles.filterRow}>
                  <TouchableOpacity
                    style={[styles.filterBtn, filter === 'All' && styles.filterBtnActive]}
                    onPress={() => setFilter('All')}
                  >
                    <Text style={[styles.filterText, filter === 'All' && styles.filterTextActive]}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterBtn, filter === 'Success' && styles.filterBtnActive]}
                    onPress={() => setFilter('Success')}
                  >
                    <Text style={[styles.filterText, filter === 'Success' && styles.filterTextActive]}>Success</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterBtn, filter === 'Pending' && styles.filterBtnActive]}
                    onPress={() => setFilter('Pending')}
                  >
                    <Text style={[styles.filterText, filter === 'Pending' && styles.filterTextActive]}>Pending</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterBtn, filter === 'Failed' && styles.filterBtnActive]}
                    onPress={() => setFilter('Failed')}
                  >
                    <Text style={[styles.filterText, filter === 'Failed' && styles.filterTextActive]}>Failed</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search history"
                  placeholderTextColor="#A0A0A0"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.historyRow}>
                <Text style={styles.historyDate}>Total Due</Text>
                <Text style={styles.historyMethod}>₹{totalDue.toLocaleString()}</Text>
              </View>
            )}
          />
        )}
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