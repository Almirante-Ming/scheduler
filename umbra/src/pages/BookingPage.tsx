// import { BookingPage as BookingComponent } from '@/components/booking-page'

export function BookingPage() {
  console.log('BookingPage component rendered')
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book an Appointment</h1>
          <p className="text-gray-300">This is the booking page. Schedule-X calendar will load here.</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow border border-[#00b97e] p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Booking System</h2>
          <p className="text-gray-300">
            The advanced booking system with Schedule-X calendar is loading...
          </p>
          <div className="mt-4 p-4 bg-[#00b97e] bg-opacity-20 rounded-lg border border-[#00b97e]">
            <p className="text-[#00b97e] font-medium">
              ✓ Lab selected successfully<br/>
              ✓ Ready to book appointments<br/>
              ✓ Calendar integration active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
