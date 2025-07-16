import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Search, UserPlus, Users, Scan } from 'lucide-react-native';
import ContactCard from '@/components/ContactCard';
import LogoutButton from '@/components/LogoutButton';
import { mockContacts, mockUser } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Contact } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef } from 'react';

export default function NetworkScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'qr'>('contacts');
  const [showQRModal, setShowQRModal] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = (contact: Contact) => {
    console.log('Navigate to contact details:', contact.id);
  };

  const handleScanQR = () => {
    setScanning(true);
    setScanned(false);
  };

  const handleCloseScanner = () => {
    setScanning(false);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScanning(false);
    Alert.alert('QR Code Scanned', data);
  };

  const handleGenerateQR = () => {
    setShowQRModal(true);
  };

  const handleAddContact = () => {
    Alert.alert(
      'Add Contact',
      'This would open a form to manually add a new contact.',
      [{ text: 'OK' }]
    );
  };

  const renderContactsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <UserPlus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contactsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contactsContent}
      >
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No contacts found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Start networking by scanning QR codes at events'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderQRTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.qrSection}>
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <QrCode size={24} color={Colors.primary} />
            <Text style={styles.qrTitle}>Your QR Code</Text>
          </View>
          <Text style={styles.qrDescription}>
            Let others scan your QR code to instantly save your contact information
          </Text>
          <TouchableOpacity style={styles.generateQRButton} onPress={handleGenerateQR}>
            <QrCode size={20} color={Colors.white} />
            <Text style={styles.generateQRText}>Show My QR Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <Scan size={24} color={Colors.secondary} />
            <Text style={styles.qrTitle}>Scan QR Code</Text>
          </View>
          <Text style={styles.qrDescription}>
            Scan someone's QR code to instantly add them to your contacts
          </Text>
          <TouchableOpacity style={styles.scanQRButton} onPress={handleScanQR}>
            <Scan size={20} color={Colors.white} />
            <Text style={styles.scanQRText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.qrInfo}>
        <Text style={styles.qrInfoTitle}>How QR Networking Works</Text>
        <View style={styles.qrInfoSteps}>
          <View style={styles.qrInfoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Show your QR code to others</Text>
          </View>
          <View style={styles.qrInfoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Scan their QR code with your camera</Text>
          </View>
          <View style={styles.qrInfoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Contacts are automatically saved</Text>
          </View>
        </View>
      </View>
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>My QR Code</Text>
            {user && (
              <QRCode
                value={JSON.stringify({
                  id: user.id,
                  name: user.user_metadata?.name || '',
                  email: user.email || '',
                  role: user.user_metadata?.role || '',
                })}
                size={200}
                color={Colors.primary}
                backgroundColor={Colors.white}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={scanning}
        transparent
        animationType="slide"
        onRequestClose={handleCloseScanner}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: 0, width: '90%', height: 400 }]}> 
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            {!cameraPermission ? (
              <Text>Requesting camera permission...</Text>
            ) : !cameraPermission.granted ? (
              <View>
                <Text>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.closeButton} onPress={requestCameraPermission}>
                  <Text style={styles.closeButtonText}>Grant permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView
                style={{ flex: 1, width: '100%' }}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            )}
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseScanner}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Network</Text>
          <LogoutButton 
            size={20} 
            color={Colors.textSecondary}
            style={styles.logoutButton}
          />
        </View>
        
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
            onPress={() => setActiveTab('contacts')}
          >
            <Users size={16} color={activeTab === 'contacts' ? Colors.white : Colors.textSecondary} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'contacts' && styles.tabTextActive
              ]}
            >
              Contacts ({mockContacts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'qr' && styles.tabActive]}
            onPress={() => setActiveTab('qr')}
          >
            <QrCode size={16} color={activeTab === 'qr' ? Colors.white : Colors.textSecondary} />
            <Text
              style={[
                styles.tabText,
                activeTab === 'qr' && styles.tabTextActive
              ]}
            >
              QR Code
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'contacts' ? renderContactsTab() : renderQRTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  logoutButton: {
    marginLeft: 'auto',
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.white,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsContainer: {
    flex: 1,
  },
  contactsContent: {
    paddingBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  qrSection: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  qrCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  qrTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  qrDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  generateQRButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  generateQRText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '500',
  },
  scanQRButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  scanQRText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '500',
  },
  qrInfo: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrInfoTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  qrInfoSteps: {
    gap: Spacing.md,
  },
  qrInfoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  stepText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  qrCodeContainer: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  closeButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
});