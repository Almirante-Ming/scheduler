import { useEffect, useRef, useState } from 'react'
import { createCalendar } from '@schedule-x/calendar'
import { createViewDay, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, Clock, MapPin } from 'lucide-react'

interface BookingFormData {
  name: string
  email: string
  phone: string
  service: string
  notes: string
}

export function BookingPage() {
  const calendarRef = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    notes: ''
  })

  const availableServices = [
    { id: 'consultation', name: 'Consultation', duration: '30 min', price: '$50' },
    { id: 'treatment', name: 'Treatment', duration: '60 min', price: '$100' },
    { id: 'therapy', name: 'Therapy Session', duration: '45 min', price: '$75' },
    { id: 'checkup', name: 'Health Checkup', duration: '90 min', price: '$150' }
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  useEffect(() => {
    if (calendarRef.current) {
      const calendar = createCalendar({
        views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
        events: [
          {
            id: '1',
            title: 'Consultation - John Doe',
            start: '2025-07-15 09:00',
            end: '2025-07-15 09:30',
          },
          {
            id: '2',
            title: 'Treatment - Jane Smith',
            start: '2025-07-15 10:00',
            end: '2025-07-15 11:00',
          },
          {
            id: '3',
            title: 'Therapy - Mike Johnson',
            start: '2025-07-16 14:00',
            end: '2025-07-16 14:45',
          }
        ],
        selectedDate: '2025-07-15',
        callbacks: {
          onEventClick: (event: any) => {
            console.log('Event clicked:', event)
          },
          onClickDate: (date: string) => {
            setSelectedDate(date)
            setShowBookingForm(false)
          }
        }
      })

      calendar.render(calendarRef.current)
    }
  }, [])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowBookingForm(true)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', {
      ...bookingData,
      date: selectedDate,
      time: selectedTime
    })
    
    // Reset form and show success message
    setBookingData({
      name: '',
      email: '',
      phone: '',
      service: '',
      notes: ''
    })
    setShowBookingForm(false)
    setSelectedDate('')
    setSelectedTime('')
    
    alert('Booking submitted successfully!')
  }

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
          <p className="text-gray-600">Select a date and time for your appointment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Select Date & Time
                </CardTitle>
                <CardDescription>
                  Choose your preferred date and time slot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={calendarRef} className="schedule-x-calendar" />
              </CardContent>
            </Card>
          </div>

          {/* Booking Form Section */}
          <div className="space-y-6 relative">
            {/* Booking Form */}
            {showBookingForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Booking Details
                  </CardTitle>
                  <CardDescription>
                    {selectedDate} at {selectedTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="service">Service</Label>
                      <select
                        id="service"
                        value={bookingData.service}
                        onChange={(e) => handleInputChange('service', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a service</option>
                        {availableServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.duration} - {service.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <textarea
                        id="notes"
                        value={bookingData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any special requests or information..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Confirm Booking
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Time Slots */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Available Times
                  </CardTitle>
                  <CardDescription>
                    {selectedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTimeSelect(time)}
                        className="text-sm"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
