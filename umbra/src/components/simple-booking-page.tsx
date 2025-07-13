import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { BookingData } from '@/services/bookingService'

interface BookingFormData {
  userName: string
  course: string
  annotation: string
}

interface Course {
  id: number
  name: string
  nickname: string
  course_code: string
  period: string
  capacity: number
  description?: string
}

interface SimpleBookingPageProps {
  currentUser?: {
    name?: string
    email?: string
    id?: string
  }
}

export function SimpleBookingPage({ currentUser }: SimpleBookingPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<BookingFormData>({
    userName: currentUser?.name || 'Convidado',
    course: '',
    annotation: ''
  })
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInfoMessage, setIsInfoMessage] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [courseModalLoading, setCourseModalLoading] = useState(false)
  const [studentModalLoading, setStudentModalLoading] = useState(false)
  const [courseModalError, setCourseModalError] = useState<string | null>(null)
  const [studentModalError, setStudentModalError] = useState<string | null>(null)
  const [newCourseData, setNewCourseData] = useState({
    name: '',
    nickname: '',
    course_code: '',
    period: '',
    capacity: '',
    description: ''
  })
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    course_id: '',
    phone: '',
    registration_number: ''
  })

  // Check if current user is a guest
  const isGuestUser = !currentUser || currentUser.name === 'Convidado' || !currentUser.name
  
  // Check if current user is logged in (not a guest)
  const isLoggedIn = currentUser && currentUser.name !== 'Convidado' && currentUser.name

  // Update booking data when current user changes
  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      userName: currentUser?.name || 'Convidado'
    }))
  }, [currentUser])

  // Load courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        setError(null)
        
        // Dynamic import to avoid loading coursesService on initial page load
        const { coursesService } = await import('../services/lumusService')
        
        // Fetch courses from API (no auth required now)
        const response = await coursesService.getCourses()
        setCourses(response.data)
        
        console.log('Courses loaded:', response.data)
      } catch (err: any) {
        console.error('Error fetching courses:', err)
        
        // Handle different error types
        if (err.response?.status === 401) {
          setError('Não autorizado. Faça login novamente.')
        } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
          setError('Erro de conexão. Verifique sua internet.')
        } else {
          setError('Erro ao carregar cursos. Tente novamente.')
        }
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Custom time slots as specified
  const timeSlots = [
    '07:00', '07:45', '08:30', '09:05', '09:15', '10:00', '10:45', 
    '11:30', '12:15', '13:00', '13:45', '14:30', '15:05', '15:15', 
    '16:00', '16:45', '17:30', '18:15', '19:00', '19:45', '20:30', 
    '21:05', '21:15', '22:00', '22:45'
  ]

  // Load bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Dynamic import to avoid loading schedulesService on initial page load
        const { schedulesService } = await import('../services/lumusService')
        
        // Fetch schedules from API (no auth required now)
        const response = await schedulesService.getSchedules()
        
        // Convert schedules to BookingData format
        const convertedBookings: BookingData[] = response.data.map(schedule => ({
          id: schedule.id.toString(),
          date: schedule.date,
          times: schedule.times,
          userName: schedule.user_name,
          course: schedule.course_code,
          annotation: schedule.annotation || '',
          repeatType: 'none' // Default to 'none' since we removed repeat functionality
        }))
        
        setBookings(convertedBookings)
        console.log('Bookings loaded:', convertedBookings)
      } catch (err: any) {
        console.error('Error fetching bookings:', err)
        
        // Handle different error types
        if (err.response?.status === 401) {
          setError('Não autorizado. Faça login novamente.')
        } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
          setError('Erro de conexão. Verifique sua internet.')
        } else {
          setError('Erro ao carregar reservas. Tente novamente.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Get booked slots for current selected date
  const getBookedSlotsForDate = (date: string): string[] => {
    const dateBookings = bookings.filter(booking => booking.date === date)
    return dateBookings.flatMap(booking => booking.times)
  }

  // Get booking details for a specific time slot
  const getBookingDetailsForTime = (date: string, time: string) => {
    const dateBookings = bookings.filter(booking => 
      booking.date === date && booking.times.includes(time)
    )
    return dateBookings[0] // Return the first booking for this time slot
  }

  // Get count of available slots for selected date
  const getAvailabilityStats = (date: string) => {
    const bookedSlots = getBookedSlotsForDate(date)
    const availableSlots = timeSlots.filter(time => !bookedSlots.includes(time))
    return {
      total: timeSlots.length,
      booked: bookedSlots.length,
      available: availableSlots.length
    }
  }

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const formatDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1 // JavaScript months are 0-based, so add 1
    const dayStr = day.toString().padStart(2, '0')
    const monthStr = month.toString().padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }

  const formatDateDisplay = (dateString: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month - 1 because JavaScript months are 0-based
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDateAvailable = (day: number) => {
    const today = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = new Date(year, month, day)
    
    // Set both dates to start of day to avoid time comparison issues
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    
    return date >= today
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDateSelect = (day: number) => {
    const dateStr = formatDate(day)
    setSelectedDate(dateStr)
    setShowBookingForm(false)
  }

  const handleTimeSelect = (time: string) => {
    // For guest users, only allow viewing of booked time slots
    if (isGuestUser) {
      if (isTimeSlotBooked(time)) {
        // Show booking details for guests
        const booking = getBookingDetailsForTime(selectedDate, time)
        setError(`Horário ${time} reservado por ${booking?.userName || 'usuário'} - ${booking?.course || 'curso não especificado'}${booking?.annotation ? ` (${booking.annotation})` : ''}`)
        setIsInfoMessage(true)
        setTimeout(() => {
          setError(null)
          setIsInfoMessage(false)
        }, 5000)
        return
      } else {
        // Block guest users from selecting available times
        setError('Visitantes não podem fazer reservas. Faça login para reservar laboratórios.')
        setIsInfoMessage(false)
        setTimeout(() => setError(null), 5000)
        return
      }
    }

    // Don't allow selection of already booked times
    if (isTimeSlotBooked(time)) {
      const booking = getBookingDetailsForTime(selectedDate, time)
      setError(`Horário ${time} já está reservado por ${booking?.userName || 'outro usuário'}`)
      setIsInfoMessage(false)
      setTimeout(() => setError(null), 3000) // Clear error after 3 seconds
      return
    }
    
    // Clear any existing errors
    setError(null)
    setIsInfoMessage(false)
    
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        // Remove time if already selected
        return prev.filter(t => t !== time)
      } else {
        // Add time if not selected
        return [...prev, time].sort()
      }
    })
    
    // Show booking form when at least one time is selected
    if (selectedTimes.length > 0 || !selectedTimes.includes(time)) {
      setShowBookingForm(true)
    }
  }

  const handleReserveFullDay = () => {
    // Block guest users from making reservations
    if (isGuestUser) {
      setError('Visitantes não podem fazer reservas. Por favor, faça login para reservar laboratórios.')
      setIsInfoMessage(false)
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
      return
    }

    // Get all available time slots for the selected date (not booked)
    const availableSlots = timeSlots.filter(time => !isTimeSlotBooked(time))
    setSelectedTimes(availableSlots)
    setShowBookingForm(true)
  }

  const isTimeSlotBooked = (time: string) => {
    const bookedSlots = getBookedSlotsForDate(selectedDate)
    return bookedSlots.includes(time)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Block guest users from submitting bookings
    if (isGuestUser) {
      setError('Visitantes não podem fazer reservas. Por favor, faça login para reservar laboratórios.')
      setIsInfoMessage(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      // Validate that no selected times are already booked
      const bookedSlots = getBookedSlotsForDate(selectedDate)
      const conflictingTimes = selectedTimes.filter(time => bookedSlots.includes(time))
      
      if (conflictingTimes.length > 0) {
        setError(`Os seguintes horários já estão reservados: ${conflictingTimes.join(', ')}. Por favor, selecione outros horários.`)
        return
      }

      // Dynamic import to avoid loading schedulesService on initial page load
      const { schedulesService } = await import('../services/lumusService')
      
      // Create booking request
      const bookingRequest = {
        date: selectedDate,
        times: selectedTimes,
        user_name: bookingData.userName,
        course_code: bookingData.course,
        annotation: bookingData.annotation,
        repeat_type: 'NONE' as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
        lab_nickname: 'LAB01', // Default lab for now
        status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
        user_id: 'guest' // Guest user ID
      }

      // Submit the booking to the API
      const response = await schedulesService.createSchedule(bookingRequest)
      
      // Convert response to BookingData format
      const newBooking: BookingData = {
        id: response.id.toString(),
        date: response.date,
        times: response.times,
        userName: response.user_name,
        course: response.course_code,
        annotation: response.annotation || '',
        repeatType: 'none' // Default to 'none' since we removed repeat functionality
      }
      
      // Add the new booking to local state
      setBookings(prev => [...prev, newBooking])
      
      // Reset form
      setBookingData({
        userName: currentUser?.name || 'Convidado', // Keep the current user's name
        course: '',
        annotation: ''
      })
      setShowBookingForm(false)
      setSelectedDate('')
      setSelectedTimes([])
      
      alert('Reserva criada com sucesso!')
    } catch (err: any) {
      console.error('Error creating booking:', err)
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Não autorizado. Faça login novamente.')
      } else if (err.response?.status === 400) {
        setError('Dados inválidos. Verifique os campos preenchidos.')
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        setError('Erro de conexão. Verifique sua internet.')
      } else {
        setError('Erro ao criar reserva. Tente novamente.')
      }
      
      alert(error || 'Erro ao criar reserva. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Course modal handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setCourseModalLoading(true)
    setCourseModalError(null)

    try {
      const { coursesService } = await import('../services/lumusService')
      
      const courseData = {
        name: newCourseData.name,
        nickname: newCourseData.nickname,
        course_code: newCourseData.course_code,
        period: newCourseData.period,
        capacity: parseInt(newCourseData.capacity),
        description: newCourseData.description || undefined
      }

      const newCourse = await coursesService.createCourse(courseData)
      
      // Add the new course to the list and refresh courses
      setCourses(prev => [...prev, newCourse])
      
      // Reset form and close modal
      setNewCourseData({ name: '', nickname: '', course_code: '', period: '', capacity: '', description: '' })
      setShowCourseModal(false)
      
      console.log('Course created successfully:', newCourse)
    } catch (error: any) {
      console.error('Error creating course:', error)
      setCourseModalError(error.response?.data?.message || 'Erro ao criar turma. Tente novamente.')
    } finally {
      setCourseModalLoading(false)
    }
  }

  const handleCloseCourseModal = () => {
    setShowCourseModal(false)
    setNewCourseData({ name: '', nickname: '', course_code: '', period: '', capacity: '', description: '' })
    setCourseModalError(null)
  }

  // Student modal handlers
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setStudentModalLoading(true)
    setStudentModalError(null)

    try {
      const { studentsService } = await import('../services/lumusService')
      
      const studentData = {
        name: newStudentData.name,
        email: newStudentData.email,
        course_id: parseInt(newStudentData.course_id),
        phone: newStudentData.phone || undefined,
        registration_number: newStudentData.registration_number || undefined
      }

      const newStudent = await studentsService.createStudent(studentData)
      
      // Reset form and close modal
      setNewStudentData({ name: '', email: '', course_id: '', phone: '', registration_number: '' })
      setShowStudentModal(false)
      
      console.log('Student created successfully:', newStudent)
    } catch (error: any) {
      console.error('Error creating student:', error)
      setStudentModalError(error.response?.data?.message || 'Erro ao criar aluno. Tente novamente.')
    } finally {
      setStudentModalLoading(false)
    }
  }

  const handleCloseStudentModal = () => {
    setShowStudentModal(false)
    setNewStudentData({ name: '', email: '', course_id: '', phone: '', registration_number: '' })
    setStudentModalError(null)
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isGuestUser ? 'Visualizar Reservas do Laboratório' : 'Reservar Laboratório'}
              </h1>
              <p className="text-gray-300">
                {isGuestUser 
                  ? 'Visualize todas as reservas e horários ocupados. Faça login para fazer novas reservas.'
                  : 'Selecione uma data e horário para sua reserva'
                }
              </p>
            </div>
            {isLoggedIn && (
              <div className="flex gap-3 ml-4">
                <Button 
                  onClick={() => setShowCourseModal(true)}
                  className="bg-[#00b97e] hover:bg-[#059669] text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Cadastrar Turma
                </Button>
                <Button 
                  onClick={() => setShowStudentModal(true)}
                  className="bg-[#00b97e] hover:bg-[#059669] text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Cadastrar Alunos
                </Button>
              </div>
            )}
          </div>
          {error && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              isInfoMessage 
                ? 'bg-blue-900/20 border border-blue-500 text-blue-400' 
                : 'bg-red-900/20 border border-red-500 text-red-400'
            }`}>
              {error}
            </div>
          )}
          {loading && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-md text-blue-400 text-sm">
              Carregando reservas...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Selecionar Data e Horário
                </CardTitle>
                <CardDescription>
                  Escolha sua data e horário preferidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                  {generateCalendar().map((day, index) => (
                    <div key={index} className="p-2">
                      {day && (
                        <Button
                          variant={selectedDate === formatDate(day) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDateSelect(day)}
                          disabled={!isDateAvailable(day)}
                          className="w-full h-10"
                        >
                          {day}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-white">Horários Disponíveis</h3>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const stats = getAvailabilityStats(selectedDate)
                          return (
                            <div className="text-sm text-gray-400 mr-2">
                              {stats.available} de {stats.total} horários disponíveis
                            </div>
                          )
                        })()}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReserveFullDay}
                          disabled={isGuestUser}
                          className={`text-xs border-[#00b97e] ${
                            isGuestUser 
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                              : 'bg-[#00b97e] hover:bg-[#00b97e]/80 text-white'
                          }`}
                          title={isGuestUser ? 'Faça login para fazer reservas' : 'Reservar todos os horários disponíveis'}
                        >
                          Reservar Dia Inteiro
                        </Button>
                        {selectedTimes.length > 0 && (
                          <>
                            <span className="text-sm text-[#00b97e]">
                              {selectedTimes.length} horário{selectedTimes.length > 1 ? 's' : ''} selecionado{selectedTimes.length > 1 ? 's' : ''}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTimes([])}
                              className="text-xs"
                            >
                              Limpar Tudo
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      {formatDateDisplay(selectedDate)}
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      {isGuestUser 
                        ? 'Visitantes podem visualizar todas as reservas. Clique nos horários ocupados para ver detalhes ou faça login para criar novas reservas.'
                        : 'Clique nos horários individuais para selecioná-los, ou use "Reservar Dia Inteiro" para selecionar todos os horários disponíveis'
                      }
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const isBooked = isTimeSlotBooked(time)
                        const isSelected = selectedTimes.includes(time)
                        const isDisabledForGuest = isGuestUser && !isBooked // Guests can click booked slots to view details
                        
                        return (
                          <Button
                            key={time}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSelect(time)}
                            disabled={isDisabledForGuest}
                            className={`text-sm transition-all duration-200 ${
                              isBooked 
                                ? 'bg-red-900/50 border-red-600 text-red-300 cursor-pointer opacity-80 hover:opacity-100' 
                                : isDisabledForGuest
                                  ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                                  : isSelected 
                                    ? 'bg-[#00b97e] hover:bg-[#059669] text-white' 
                                    : 'border-gray-600 text-gray-300 hover:border-[#00b97e] hover:text-[#00b97e]'
                            }`}
                            title={
                              isBooked 
                                ? isGuestUser 
                                  ? 'Clique para ver detalhes da reserva' 
                                  : 'Horário já reservado'
                                : isDisabledForGuest 
                                  ? 'Faça login para fazer reservas'
                                  : 'Clique para selecionar'
                            }
                          >
                            {time}
                            {isBooked && (
                              <span className="ml-1 text-xs">🔒</span>
                            )}
                          </Button>
                        )
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs">
                      {!isGuestUser && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-[#00b97e] rounded"></div>
                          <span className="text-gray-400">Selecionado</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-700 border border-gray-600 rounded"></div>
                        <span className="text-gray-400">{isGuestUser ? 'Disponível para reserva' : 'Disponível'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-900/50 border border-red-600 rounded"></div>
                        <span className="text-gray-400">{isGuestUser ? 'Ocupado (clique para detalhes)' : 'Ocupado'}</span>
                      </div>
                      {isGuestUser && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-600/50 border border-yellow-500 rounded"></div>
                          <span className="text-gray-400">Faça login para reservar</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Existing Reservations for Selected Date */}
                {selectedDate && (() => {
                  const dateBookings = bookings.filter(booking => booking.date === selectedDate)
                  return dateBookings.length > 0 ? (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <h4 className="text-md font-medium text-white mb-3">
                        Reservas Existentes para {formatDateDisplay(selectedDate)}
                      </h4>
                      <div className="space-y-2">
                        {dateBookings.map((booking, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-600">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {booking.userName}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {booking.course} • {booking.times.join(', ')}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {booking.annotation && booking.annotation.length > 0 
                                ? booking.annotation 
                                : 'Sem observações'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()} 
              </CardContent>
            </Card>
          </div>

          {/* Booking Form Section */}
          <div className="space-y-6 relative">
            {/* Booking Form */}
            {showBookingForm && selectedTimes.length > 0 && (
              <Card>
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="flex items-center gap-2">
                    Detalhes da Reserva
                  </CardTitle>
                  <CardDescription>
                    {formatDateDisplay(selectedDate)} às {selectedTimes.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="userName">{currentUser?.name || 'Responsável'}</Label>
                      <Input
                        id="userName"
                        type="text"
                        value={bookingData.userName}
                        onChange={(e) => handleInputChange('userName', e.target.value)}
                        disabled
                        className="bg-gray-700 text-gray-400 mt-2"
                        placeholder="Preenchido pelo login"
                      />
                      <p className="text-xs text-gray-400 mt-1">Este campo é preenchido automaticamente pelo seu login</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="course">Turma</Label>
                      <select
                        id="course"
                        value={bookingData.course}
                        onChange={(e) => handleInputChange('course', e.target.value)}
                        required
                        disabled={coursesLoading}
                        className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e] mt-2 disabled:opacity-50"
                      >
                        <option value="">
                          {coursesLoading ? 'Carregando turmas...' : 'Selecione uma turma'}
                        </option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.course_code}>
                            {course.name} ({course.course_code})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="annotation">Observações</Label>
                      <textarea
                        id="annotation"
                        value={bookingData.annotation}
                        onChange={(e) => handleInputChange('annotation', e.target.value)}
                        placeholder="Adicione observações ou comentários sobre esta reserva..."
                        rows={3}
                        className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e] placeholder-gray-400 mt-2"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Criando Reserva...' : 'Confirmar Reserva'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Cadastrar Nova Turma</h2>
              
              {courseModalError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
                  <p className="text-red-200 text-sm">{courseModalError}</p>
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Nome da Turma</label>
                  <input
                    type="text"
                    value={newCourseData.name}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: Programação Web"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Apelido da Turma</label>
                  <input
                    type="text"
                    value={newCourseData.nickname}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: PWE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Código da Turma</label>
                  <input
                    type="text"
                    value={newCourseData.course_code}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, course_code: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: CS101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Período</label>
                  <select
                    value={newCourseData.period}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    required
                  >
                    <option value="">Selecione o período</option>
                    <option value="MATUTINO">Matutino</option>
                    <option value="VESPERTINO">Vespertino</option>
                    <option value="NOTURNO">Noturno</option>
                    <option value="INTEGRAL">Integral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Capacidade</label>
                  <input
                    type="number"
                    value={newCourseData.capacity}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, capacity: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: 30"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Descrição (opcional)</label>
                  <textarea
                    value={newCourseData.description}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Descrição da turma..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseCourseModal}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={courseModalLoading}
                    className="flex-1 bg-[#00b97e] hover:bg-[#059669] text-white"
                  >
                    {courseModalLoading ? 'Criando...' : 'Criar Turma'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Cadastrar Novo Aluno</h2>
              
              {studentModalError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
                  <p className="text-red-200 text-sm">{studentModalError}</p>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: João Silva Santos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: joao.silva@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Turma</label>
                  <select
                    value={newStudentData.course_id}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, course_id: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    required
                  >
                    <option value="">Selecione uma turma</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Telefone (opcional)</label>
                  <input
                    type="tel"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: (11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Número de Matrícula (opcional)</label>
                  <input
                    type="text"
                    value={newStudentData.registration_number}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, registration_number: e.target.value }))}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-[#00b97e] focus:border-[#00b97e]"
                    placeholder="Ex: 2024001234"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseStudentModal}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={studentModalLoading}
                    className="flex-1 bg-[#00b97e] hover:bg-[#059669] text-white"
                  >
                    {studentModalLoading ? 'Criando...' : 'Criar Aluno'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
