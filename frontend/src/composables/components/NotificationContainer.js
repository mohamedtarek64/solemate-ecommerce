// Notification Container Composable
export function useNotificationContainer() {
  // Get notification classes based on type
  const getNotificationClasses = (type) => {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden'

    const typeClasses = {
      success: 'border-l-4 border-green-400',
      error: 'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info: 'border-l-4 border-blue-400'
    }

    return [baseClasses, typeClasses[type] || typeClasses.info]
  }

  // Get action button classes based on type
  const getActionClasses = (type) => {
    const baseClasses = 'text-sm font-medium rounded-md px-3 py-1 transition-colors'

    const typeClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-100 text-red-700 hover:bg-red-200'
    }

    return [baseClasses, typeClasses[type] || typeClasses.secondary]
  }

  return {
    getNotificationClasses,
    getActionClasses
  }
}
