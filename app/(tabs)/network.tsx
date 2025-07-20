import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Search, UserPlus, Users, Scan, Wifi, Zap } from 'lucide-react-native';
import ContactCard from '@/components/ContactCard';
import LogoutButton from '@/components/LogoutButton';
import { mockContacts, mockUser } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { Contact } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
// @ts-ignore
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '@/services/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function NetworkScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'qr'>('contacts');
  const [showQRModal, setShowQRModal] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const alertShownRef = useRef(false);

  useEffect(() => {
    if (user?.id) {
      DatabaseService.getContacts(user.id).then(users => {
        setContacts(users.map(u => ({
          ...u,
          metAt: 'EventConnect',
          dateAdded: u.created_at ? u.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        })));
      });
    }
  }, [user]);

  const filteredContacts = contacts.filter(contact =>
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
    alertShownRef.current = false;
  };

  const handleCloseScanner = () => {
    setScanning(false);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || alertShownRef.current) return; // Prevent multiple scans/alerts
    setScanned(true);
    setScanning(false);
    alertShownRef.current = true;
    try {
      const parsed = JSON.parse(data);
      if (!parsed.id || !parsed.name || !parsed.email) {
        throw new Error('Missing required contact fields');
      }
      if (contacts.some(c => c.email === parsed.email)) {
        setTimeout(() => {
          Alert.alert('Contact already exists', `${parsed.name} is already in your contacts.`);
        }, 100);
        return;
      }
      if (user?.id) {
        const success = await DatabaseService.addContactConnection(user.id, parsed.id);
        if (success) {
          const updatedContacts = await DatabaseService.getContacts(user.id);
          setContacts(updatedContacts.map(u => ({
            ...u,
            metAt: 'EventConnect',
            dateAdded: u.created_at ? u.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          })));
          setTimeout(() => {
            Alert.alert('Contact Added', `${parsed.name} has been added to your contacts.`);
          }, 100);
        } else {
          setTimeout(() => {
            Alert.alert('Error', 'Failed to add contact connection.');
          }, 100);
        }
      }
    } catch (e) {
      setTimeout(() => {
        Alert.alert('Invalid QR Code', 'The scanned QR code is not a valid contact.');
      }, 100);
    }
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
        <View style={[styles.qrCard, Shadows.medium]}>
          <View style={styles.qrHeader}>
            <View style={styles.qrIconContainer}>
              <QrCode size={24} color={Colors.primary} />
            </View>
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

        <View style={[styles.qrCard, Shadows.medium]}>
          <View style={styles.qrHeader}>
            <View style={[styles.qrIconContainer, { backgroundColor: Colors.secondaryLight }]}>
              <Scan size={24} color={Colors.secondary} />
            </View>
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

      <View style={[styles.qrInfo, Shadows.small]}>
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
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(125,181,180,0.85)', 'rgba(90,140,139,0.95)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Wifi size={24} color={Colors.white} />
                  <Text style={styles.title}>Network</Text>
                </View>
                <Text style={styles.subtitle}>Connect with amazing people</Text>
              </View>
              <LogoutButton 
                size={20} 
                color={Colors.white}
                style={styles.logoutButton}
              />
            </View>
            
            <View style={styles.tabSelector}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
                onPress={() => setActiveTab('contacts')}
              >
                <Users size={16} color={activeTab === 'contacts' ? Colors.secondary : Colors.white} />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'contacts' && styles.tabTextActive
                  ]}
                >
                  Contacts ({contacts.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'qr' && styles.tabActive]}
                onPress={() => setActiveTab('qr')}
              >
                <QrCode size={16} color={activeTab === 'qr' ? Colors.secondary : Colors.white} />
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
        </LinearGradient>
      </ImageBackground>

      <ScrollView style={styles.contentContainer} contentContainerStyle={{flexGrow: 1}}>
        {activeTab === 'contacts' ? renderContactsTab() : renderQRTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerBackground: {
    minHeight: 160,
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  header: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    backgroundColor: Colors.white,
    flex: 1,
    ...Shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    ...Typography.captionMedium,
    color: Colors.white,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.secondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  qrIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '600',
  },
  qrDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  generateQRButton: {
    backgroundColor: Colors.primary, // fallback
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  generateQRText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  scanQRButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  scanQRText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  qrInfo: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  qrInfoTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '600',
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
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.captionMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  stepText: {
    ...Typography.body,
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    width: 300,
    ...Shadows.xl,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '600',
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
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadows.small,
  },
  closeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
});