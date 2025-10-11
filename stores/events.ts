import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface Event {
  event_id: number
  event_name: string
  event_date: string
  event_time?: string
  venue?: string
  guest_count: number
  budget?: number
  status: string
  type_name?: string
  client_name?: string
}

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as Event[],
    currentEvent: null as Event | null,
    loading: false
  }),

  actions: {
    async fetchEvents() {
      const authStore = useAuthStore()
      this.loading = true

      try {
        const response: any = await $fetch('/api/events', {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        this.events = response.data
        return { success: true }
      } catch (error: any) {
        console.error('Failed to fetch events:', error)
        return {
          success: false,
          message: error.data?.message || 'Failed to fetch events'
        }
      } finally {
        this.loading = false
      }
    },

    async createEvent(eventData: any) {
      const authStore = useAuthStore()
      this.loading = true

      try {
        const response: any = await $fetch('/api/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: eventData
        })

        this.events.unshift(response.data)
        return { success: true, data: response.data }
      } catch (error: any) {
        console.error('Failed to create event:', error)
        return {
          success: false,
          message: error.data?.message || 'Failed to create event'
        }
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    upcomingEvents: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.events.filter(e => e.event_date >= today)
    },
    pastEvents: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.events.filter(e => e.event_date < today)
    }
  }
})
