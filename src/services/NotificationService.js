class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await this.requestPermission();
      if (permission) {
        return new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });
      }
    }
  }

  static async scheduleNotification(appointment) {
    const reminderTime = new Date(appointment.reminder_time);
    const now = new Date();
    
    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        this.showNotification(
          'Appointment Reminder',
          {
            body: `You have an appointment with ${appointment.doctor_name} at ${new Date(appointment.datetime).toLocaleTimeString()}`,
            tag: `appointment-${appointment.id}`,
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'View Details'
              }
            ]
          }
        );
      }, timeUntilReminder);
    }
  }
}

export default NotificationService; 