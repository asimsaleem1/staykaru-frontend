import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { theme } from '../../styles/theme';

const HelpScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const faqData = {
    student: [
      {
        id: 1,
        question: 'How do I book accommodation?',
        answer: 'To book accommodation:\n1. Browse accommodations on the Accommodations tab\n2. Use filters to find what you need\n3. Tap on a property to view details\n4. Click "Book Now" and fill in your details\n5. Complete payment to confirm booking',
      },
      {
        id: 2,
        question: 'How do I order food?',
        answer: 'To order food:\n1. Go to the Food tab\n2. Browse available food providers\n3. Select a restaurant and browse their menu\n4. Add items to your cart\n5. Choose delivery or pickup\n6. Complete your order and payment',
      },
      {
        id: 3,
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel bookings:\n• Free cancellation up to 24 hours before check-in\n• Partial refund for cancellations within 24 hours\n• No refund for same-day cancellations\n• Go to Bookings > Your Booking > Cancel',
      },
      {
        id: 4,
        question: 'How do I track my food order?',
        answer: 'Track your order:\n1. Go to the Bookings tab\n2. Find your recent order\n3. Tap to view order details\n4. See real-time status updates\n5. Contact restaurant for specific queries',
      },
      {
        id: 5,
        question: 'How do I write a review?',
        answer: 'Leave a review after your experience:\n1. Go to your completed booking/order\n2. Tap "Write Review"\n3. Rate your experience (1-5 stars)\n4. Add comments and photos (optional)\n5. Submit to help other students',
      },
    ],
    landlord: [
      {
        id: 1,
        question: 'How do I list my property?',
        answer: 'To list your property:\n1. Go to Properties tab\n2. Tap "Add Property"\n3. Fill in property details and amenities\n4. Upload high-quality photos\n5. Set your pricing and availability\n6. Submit for review',
      },
      {
        id: 2,
        question: 'How do I manage booking requests?',
        answer: 'Manage booking requests:\n1. Check the Bookings tab for new requests\n2. Review student details and requirements\n3. Accept or decline with reason\n4. Communicate with students if needed\n5. Confirm check-in details',
      },
      {
        id: 3,
        question: 'When do I receive payments?',
        answer: 'Payment schedule:\n• Students pay upfront when booking\n• Funds held securely until check-in\n• Released to you after successful check-in\n• Automatic transfer to your bank account\n• Check Analytics for payment history',
      },
      {
        id: 4,
        question: 'How can I improve my property visibility?',
        answer: 'Boost your property visibility:\n• Add detailed descriptions and amenities\n• Upload multiple high-quality photos\n• Keep pricing competitive\n• Maintain good reviews and ratings\n• Respond quickly to booking requests\n• Keep availability calendar updated',
      },
    ],
    food_provider: [
      {
        id: 1,
        question: 'How do I add menu items?',
        answer: 'To add menu items:\n1. Go to Menu tab\n2. Tap "Add Menu Item"\n3. Enter item details and price\n4. Upload an appetizing photo\n5. Set dietary information (vegetarian, etc.)\n6. Set availability and prep time',
      },
      {
        id: 2,
        question: 'How do I manage orders?',
        answer: 'Manage incoming orders:\n1. Check Orders tab for new requests\n2. Accept or decline orders\n3. Update order status as you prepare\n4. Mark as ready when complete\n5. Handle delivery or pickup coordination',
      },
      {
        id: 3,
        question: 'When do I get paid?',
        answer: 'Payment process:\n• Customers pay when ordering\n• Funds held until order completion\n• Released after successful delivery/pickup\n• Daily transfers to your account\n• View earnings in Analytics',
      },
      {
        id: 4,
        question: 'How can I increase my orders?',
        answer: 'Boost your orders:\n• Maintain fresh, appealing menu photos\n• Offer competitive pricing\n• Provide accurate prep times\n• Maintain high ratings with quality food\n• Respond quickly to orders\n• Update menu regularly with specials',
      },
    ],
    admin: [
      {
        id: 1,
        question: 'How do I manage users?',
        answer: 'User management:\n1. Go to Users tab\n2. Search and filter users\n3. View user profiles and activity\n4. Suspend or ban problematic users\n5. Monitor user statistics and reports',
      },
      {
        id: 2,
        question: 'How do I handle reported content?',
        answer: 'Content moderation:\n1. Check Reviews tab for flagged content\n2. Review reported items carefully\n3. Take appropriate action (approve/remove)\n4. Communicate with users when necessary\n5. Track moderation activity',
      },
      {
        id: 3,
        question: 'How do I view platform analytics?',
        answer: 'Platform analytics:\n• Dashboard shows key metrics\n• User growth and activity trends\n• Revenue and transaction data\n• Location-based performance\n• Export reports for detailed analysis',
      },
    ],
  };

  const contactOptions = [
    {
      id: 1,
      title: 'Email Support',
      subtitle: 'Get help via email',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:support@staykaru.com'),
    },
    {
      id: 2,
      title: 'Phone Support',
      subtitle: 'Call us directly',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+60123456789'),
    },
    {
      id: 3,
      title: 'WhatsApp',
      subtitle: 'Chat on WhatsApp',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/60123456789'),
    },
    {
      id: 4,
      title: 'Send Message',
      subtitle: 'Contact us through the app',
      icon: 'chatbox-outline',
      action: () => setShowContactForm(true),
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'User Guide',
      subtitle: 'Step-by-step tutorials',
      icon: 'book-outline',
      action: () => Alert.alert('User Guide', 'Comprehensive user guides will be available in the next update!'),
    },
    {
      id: 2,
      title: 'Video Tutorials',
      subtitle: 'Watch how-to videos',
      icon: 'play-circle-outline',
      action: () => Alert.alert('Video Tutorials', 'Video tutorials coming soon!'),
    },
    {
      id: 3,
      title: 'Community Forum',
      subtitle: 'Join discussions',
      icon: 'people-outline',
      action: () => Alert.alert('Community Forum', 'Community forum will be available soon!'),
    },
    {
      id: 4,
      title: 'Report Bug',
      subtitle: 'Report technical issues',
      icon: 'bug-outline',
      action: () => setShowContactForm(true),
    },
  ];

  const userFaqs = faqData[user?.role] || faqData.student;

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const sendMessage = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simulate sending message
    Alert.alert(
      'Message Sent',
      'Your message has been sent to our support team. We will get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '' });
            setShowContactForm(false);
          },
        },
      ]
    );
  };

  const renderFaqItem = (faq) => (
    <Card key={faq.id} style={styles.faqCard}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => toggleFaq(faq.id)}
      >
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons
          name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
      {expandedFaq === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </Card>
  );

  const renderContactOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.contactOption}
      onPress={option.action}
    >
      <View style={styles.contactIconContainer}>
        <Ionicons name={option.icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
    </TouchableOpacity>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickAction}
      onPress={action.action}
    >
      <Ionicons name={action.icon} size={32} color={theme.colors.primary} />
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>

        <View style={styles.content}>
          {/* Welcome Card */}
          <Card style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <Ionicons name="help-circle" size={48} color={theme.colors.primary} />
              <Text style={styles.welcomeTitle}>How can we help you?</Text>
              <Text style={styles.welcomeSubtitle}>
                Find answers to common questions or contact our support team
              </Text>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map(renderQuickAction)}
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Frequently Asked Questions ({user?.role?.replace('_', ' ') || 'Student'})
            </Text>
            {userFaqs.map(renderFaqItem)}
          </View>

          {/* Contact Form */}
          {showContactForm && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Send us a message</Text>
              <Input
                label="Subject"
                value={contactForm.subject}
                onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
                placeholder="Brief description of your issue"
              />
              <Input
                label="Message"
                value={contactForm.message}
                onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                placeholder="Describe your issue in detail..."
                multiline
                numberOfLines={4}
              />
              <View style={styles.formButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowContactForm(false)}
                  variant="outline"
                  style={styles.formButton}
                />
                <Button
                  title="Send Message"
                  onPress={sendMessage}
                  style={styles.formButton}
                />
              </View>
            </Card>
          )}

          {/* Contact Options */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            {contactOptions.map(renderContactOption)}
          </Card>

          {/* Support Hours */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Support Hours</Text>
            <View style={styles.supportHours}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Monday - Friday</Text>
                <Text style={styles.hoursTime}>9:00 AM - 6:00 PM</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Saturday</Text>
                <Text style={styles.hoursTime}>10:00 AM - 4:00 PM</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Sunday</Text>
                <Text style={styles.hoursTime}>Closed</Text>
              </View>
            </View>
            <Text style={styles.timezoneNote}>* All times are in Malaysia Standard Time (MST)</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  welcomeCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeHeader: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  quickActionTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  faqCard: {
    marginBottom: theme.spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  faqQuestion: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  faqAnswer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  faqAnswerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },
  contactSubtitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  formButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  supportHours: {
    marginBottom: theme.spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  hoursDay: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  hoursTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textLight,
  },
  timezoneNote: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
});

export default HelpScreen;
