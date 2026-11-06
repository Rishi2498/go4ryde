import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({children}) => {

  // =========================================
  // 🔔 ALL NOTIFICATIONS
  // =========================================

  const [notifications, setNotifications] = useState([]);


  // =========================================
  // 🔔 CURRENT POPUP
  // =========================================

  const [activeNotification, setActiveNotification] =
    useState(null);


  // =========================================
  // ➕ ADD NOTIFICATION
  // =========================================

  const addNotification = useCallback(
    notification => {

      if (!notification) {
        return;
      }

      console.log(
        '🔔 ADD NOTIFICATION:',
        notification
      );


      setNotifications(previous => {

        // =====================================
        // 🚫 DUPLICATE CHECK
        // =====================================

        if (
          notification.id != null &&
          previous.some(
            item =>
              String(item.id) ===
              String(notification.id)
          )
        ) {

          console.log(
            '⚠️ DUPLICATE NOTIFICATION:',
            notification.id
          );

          return previous;
        }


        return [
          notification,
          ...previous,
        ];

      });


      // =====================================
      // 🔔 SHOW LIVE POPUP
      // =====================================

      setActiveNotification(
        notification
      );

    },
    []
  );


  // =========================================
  // ❌ CLOSE POPUP
  // =========================================

  const dismissNotification = useCallback(() => {

    console.log(
      '🔕 DISMISS NOTIFICATION POPUP'
    );

    setActiveNotification(null);

  }, []);


  // =========================================
  // 📋 SET FULL NOTIFICATION LIST
  // =========================================

  const setNotificationList = useCallback(
    items => {

      const safeItems =
        Array.isArray(items)
          ? items
          : [];

      setNotifications(
        safeItems
      );

    },
    []
  );


  // =========================================
  // 👁️ MARK ONE READ
  // =========================================

  const markNotificationRead = useCallback(
    id => {

      setNotifications(previous =>
        previous.map(item =>
          String(item.id) ===
          String(id)
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

    },
    []
  );


  // =========================================
  // 👁️ MARK ALL READ
  // =========================================

  const markAllNotificationsRead =
    useCallback(() => {

      setNotifications(previous =>
        previous.map(item => ({
          ...item,
          is_read: true,
        }))
      );

    }, []);


  // =========================================
  // 🎯 CONTEXT
  // =========================================

  return (
    <NotificationContext.Provider
      value={{

        // List
        notifications,

        // Live notification
        activeNotification,

        // Actions
        addNotification,

        dismissNotification,

        setNotificationList,

        markNotificationRead,

        markAllNotificationsRead,

      }}>

      {children}

    </NotificationContext.Provider>
  );
};


// =========================================
// 🔌 HOOK
// =========================================

export const useNotificationContext = () => {

  const context =
    useContext(
      NotificationContext
    );

  if (!context) {

    throw new Error(
      'useNotificationContext must be used inside NotificationProvider'
    );

  }

  return context;

};