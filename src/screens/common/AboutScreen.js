import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AboutScreen = ({ navigation }) => {
  const appVersion = '1.0.0';
  const buildNumber = '100';

  const handleContactPress = (type) => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@staykaru.com');
        break;
      case 'website':
        Linking.openURL('https://www.staykaru.com');
        break;
      case 'phone':
        Linking.openURL('tel:+1234567890');
        break;
      default:
        break;
    }
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate StayKaru',
      'Would you like to rate our app on the App Store?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Redirect to app store') },
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Share StayKaru',
      'Share this app with your friends!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Share app') },
      ]
    );
  };

  const InfoItem = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity
      style={styles.infoItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.text.secondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo and Info */}
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoContainer}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="home"
                size={64}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.appName}>StayKaru</Text>
            <Text style={styles.appTagline}>
              Your one-stop solution for student accommodation and food services
            </Text>
            <Text style={styles.versionText}>
              Version {appVersion} (Build {buildNumber})
            </Text>
          </View>
        </Card>

        {/* About the App */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.aboutText}>
            StayKaru is designed specifically for students to help them find affordable 
            and convenient accommodation and food services. Our platform connects students 
            with verified landlords and food providers, making student life easier and 
            more enjoyable.
          </Text>
          <Text style={styles.aboutText}>
            Whether you're looking for a place to stay or delicious meals, StayKaru 
            has got you covered with our comprehensive booking and ordering system.
          </Text>
        </Card>

        {/* Features */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Find and book student accommodation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Order food from local providers</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Rate and review services</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Secure payment integration</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Real-time notifications</Text>
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <InfoItem
            icon="mail-outline"
            title="Email Support"
            subtitle="support@staykaru.com"
            onPress={() => handleContactPress('email')}
          />
          <InfoItem
            icon="globe-outline"
            title="Website"
            subtitle="www.staykaru.com"
            onPress={() => handleContactPress('website')}
          />
          <InfoItem
            icon="call-outline"
            title="Phone Support"
            subtitle="+1 (234) 567-8900"
            onPress={() => handleContactPress('phone')}
          />
        </Card>

        {/* App Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support Us</Text>
          <Button
            title="Rate This App"
            onPress={handleRateApp}
            style={styles.actionButton}
            variant="outline"
          />
          <Button
            title="Share with Friends"
            onPress={handleShareApp}
            style={styles.actionButton}
            variant="outline"
          />
        </Card>

        {/* Legal */}
        <Card style={[styles.sectionCard, styles.lastCard]}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <InfoItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => console.log('Terms of Service')}
          />
          <InfoItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => console.log('Privacy Policy')}
          />
          <InfoItem
            icon="information-circle-outline"
            title="Licenses"
            onPress={() => console.log('Open Source Licenses')}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 StayKaru. All rights reserved.
          </Text>
          <Text style={styles.footerText}>
            Made with ❤️ for students
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  appInfoCard: {
    marginBottom: theme.spacing.md,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  appTagline: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  lastCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  aboutText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    gap: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  infoSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
});

export default AboutScreen;
