import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBEF',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 36,
    color: '#16384A',
    lineHeight: 40,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16384A',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#8A98A2',
  },

  // ===================================================
  // MESSAGES
  // ===================================================

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  emptyContainer: {
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16384A',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#71808A',
    textAlign: 'center',
  },

  messageRow: {
    width: '100%',
    marginBottom: 10,
  },

  myMessageRow: {
    alignItems: 'flex-end',
  },

  otherMessageRow: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  myMessageBubble: {
    backgroundColor: '#16384A',
    borderBottomRightRadius: 4,
  },

  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E1E7EB',
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  myMessageText: {
    color: '#FFFFFF',
  },

  otherMessageText: {
    color: '#16384A',
  },

  // ===================================================
  // INPUT
  // ===================================================

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EBEF',
  },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: '#F1F4F6',
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#16384A',
  },

  sendButton: {
    width: 46,
    height: 46,
    marginLeft: 8,
    borderRadius: 23,
    backgroundColor: '#16384A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.4,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },

});

export default styles;