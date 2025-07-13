import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { authService, coursesService, studentsService, schedulesService, type User, type Course, type Student, type Schedule } from '../services/lumusService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const LumusDashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load courses
      const coursesResponse = await coursesService.getCourses({ per_page: 5 });
      setCourses(coursesResponse.data);

      // Load students
      const studentsResponse = await studentsService.getStudents({ per_page: 5 });
      setStudents(studentsResponse.data);

      // Load recent schedules
      const schedulesResponse = await schedulesService.getSchedules({ per_page: 5 });
      setSchedules(schedulesResponse.data);

    } catch (err: any) {
      console.error('Dashboard data loading error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout(); // Logout anyway
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PROFESSOR': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lumus Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.type)}`}>
                  {user.type}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
            <Button variant="outline" size="sm" onClick={loadDashboardData} className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">📚</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                Active courses this semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lab Bookings</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🏫</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                Recent lab bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>Latest courses in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-gray-600">{course.course_code} - {course.nickname}</div>
                      <div className="text-xs text-gray-500">Capacity: {course.capacity}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.period}
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No courses found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Latest student enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                      <div className="text-xs text-gray-500">
                        {student.registration_number && `Reg: ${student.registration_number}`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {student.course?.course_code || `Course ID: ${student.course_id}`}
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No students found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedules */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Lab Bookings</CardTitle>
              <CardDescription>Latest laboratory scheduling activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{schedule.course_code}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {schedule.user_name} • {schedule.lab_nickname}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {schedule.annotation}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{schedule.date}</div>
                      <div className="text-xs text-gray-500">
                        {schedule.times.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No lab bookings found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
