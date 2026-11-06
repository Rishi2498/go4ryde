import React, {useCallback, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {
  getChatMessages,
  sendChatMessage,
  markChatRead,
} from '../../services/chatService';

import styles from '../../styles/ChatScreen.styles';


const ChatScreen = ({route, navigation}) => {

  const {
    bookingId,
    passengerName,
    driverName,
    currentUserRole,
  } = route.params || {};


  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);


  // ===================================================
  // LOAD MESSAGES
  // ===================================================

  const loadMessages = async () => {

    if (!bookingId) {
      console.log('❌ CHAT: NO BOOKING ID');
      return;
    }

    try {

      setLoading(true);

      console.log(
        '💬 LOADING CHAT FOR BOOKING:',
        bookingId,
      );

      const response =
        await getChatMessages(bookingId);

      console.log(
        '💬 CHAT RESPONSE:',
        response,
      );

      const chatMessages =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.results)
            ? response.results
            : Array.isArray(response?.messages)
              ? response.messages
              : [];

      setMessages(chatMessages);

      await markChatRead(bookingId);

    } catch (error) {

      console.log(
        '❌ LOAD CHAT ERROR:',
        error,
      );

      Alert.alert(
        'Chat Error',
        error?.message ||
          'Unable to load messages.',
      );

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // LOAD WHEN SCREEN OPENS
  // ===================================================

  useFocusEffect(
    useCallback(() => {

      loadMessages();

    }, [bookingId]),
  );


  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const handleSend = async () => {

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!bookingId) {

      Alert.alert(
        'Chat Error',
        'Booking ID is missing.',
      );

      return;
    }

    if (sending) {
      return;
    }

    try {

      setSending(true);

      console.log(
        '💬 SENDING MESSAGE:',
        trimmedMessage,
      );

      const response =
        await sendChatMessage(
          bookingId,
          trimmedMessage,
        );

      console.log(
        '💬 SEND RESPONSE:',
        response,
      );

      setMessage('');

      // Reload messages from Django
      await loadMessages();

    } catch (error) {

      console.log(
        '❌ SEND MESSAGE ERROR:',
        error,
      );

      Alert.alert(
        'Message Failed',
        error?.message ||
          'Unable to send message.',
      );

    } finally {

      setSending(false);

    }
  };


  // ===================================================
  // CHAT NAME
  // ===================================================

  const chatName =
    currentUserRole === 'DRIVER'
      ? passengerName || 'Passenger'
      : driverName || 'Driver';


  // ===================================================
  // MESSAGE ITEM
  // ===================================================

  const renderMessage = ({item}) => {

    const isMine =
      item.is_mine === true ||
      item.sender_role === currentUserRole;

    return (
      <View
        style={[
          styles.messageRow,
          isMine
            ? styles.myMessageRow
            : styles.otherMessageRow,
        ]}>

        <View
          style={[
            styles.messageBubble,
            isMine
              ? styles.myMessageBubble
              : styles.otherMessageBubble,
          ]}>

          <Text
            style={[
              styles.messageText,
              isMine
                ? styles.myMessageText
                : styles.otherMessageText,
            ]}>

            {item.message ||
              item.text ||
              ''}

          </Text>

        </View>

      </View>
    );
  };


  // ===================================================
  // SCREEN
  // ===================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }>

          <Text style={styles.backText}>
            ‹
          </Text>

        </TouchableOpacity>


        <View style={styles.headerInfo}>

          <Text style={styles.headerTitle}>
            {chatName}
          </Text>

          <Text style={styles.headerSubtitle}>
            Booking #{bookingId}
          </Text>

        </View>

      </View>


      {/* MESSAGES */}

      {loading ? (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color="#16384A"
          />

          <Text style={styles.loadingText}>
            Loading messages...
          </Text>

        </View>

      ) : (

        <FlatList
          data={messages}
          keyExtractor={item =>
            String(item.id)
          }
          renderItem={renderMessage}
          contentContainerStyle={
            messages.length === 0
              ? styles.emptyContainer
              : styles.messagesContainer
          }
          ListEmptyComponent={

            <View style={styles.emptyState}>

              <Text style={styles.emptyIcon}>
                💬
              </Text>

              <Text style={styles.emptyTitle}>
                Start the conversation
              </Text>

              <Text style={styles.emptyText}>
                Send a message to your{' '}
                {currentUserRole === 'DRIVER'
                  ? 'passenger'
                  : 'driver'}.
              </Text>

            </View>

          }
        />

      )}


      {/* INPUT */}

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#8A98A2"
          multiline
          maxLength={500}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() ||
              sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={
            !message.trim() ||
            sending
          }>

          {sending ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <Text style={styles.sendButtonText}>
              ➤
            </Text>

          )}

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  );
};


export default ChatScreen;