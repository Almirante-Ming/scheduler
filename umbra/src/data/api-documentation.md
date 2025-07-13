# API Endpoints Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All requests require an Authorization header with a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Schedules
```
GET /bookings
```
**Query Parameters:**
- `startDate` (optional): Filter schedules from this date (YYYY-MM-DD)
- `endDate` (optional): Filter schedules until this date (YYYY-MM-DD)

**Example Request:**
```bash
GET /bookings?startDate=2025-07-15&endDate=2025-07-31
```

**Example Response:**
```json
{
  "schedules": [
    {
      "id": "1",
      "date": "2025-07-15",
      "times": ["09:00", "10:00"],
      "userName": "João Silva",
      "course": "physics",
      "annotation": "Experimento de óptica",
      "repeatType": "none",
      "lab_nickname": "LF",
      "status": "confirmed",
      "createdAt": "2025-07-10T10:30:00Z"
    }
  ],
  "availableTimeSlots": [
    "07:00", "07:45", "08:30", "09:05", "09:15", "10:00", "10:45",
    "11:30", "12:15", "13:00", "13:45", "14:30", "15:05", "15:15",
    "16:00", "16:45", "17:30", "18:15", "19:00", "19:45", "20:30",
    "21:05", "21:15", "22:00", "22:45", "23:30"
  ],
  "courses": [
    { "id": "mathematics", "name": "Matemática" },
    { "id": "physics", "name": "Física" },
    { "id": "chemistry", "name": "Química" }
  ]
}
```

### 2. Get Bookings by Date
```
GET /bookings/date/:date
```
**Path Parameters:**
- `date`: Date in YYYY-MM-DD format

**Example Request:**
```bash
GET /bookings/date/2025-07-15
```

**Example Response:**
```json
{
  "bookings": [
    {
      "id": "1",
      "date": "2025-07-15",
      "times": ["09:00", "10:00"],
      "userName": "João Silva",
      "course": "physics",
      "annotation": "Experimento de óptica",
      "repeatType": "none",
      "lab_nickname": "LF",
      "status": "confirmed",
      "createdAt": "2025-07-10T10:30:00Z"
    }
  ]
}
```

### 3. Create Booking
```
POST /bookings
```
**Request Body:**
```json
{
  "date": "2025-07-15",
  "times": ["09:00", "10:00"],
  "userName": "João Silva",
  "course": "physics",
  "annotation": "Experimento de óptica",
  "repeatType": "none",
  "lab_nickname": "LF"
}
```

**Example Response:**
```json
{
  "booking": {
    "id": "123",
    "date": "2025-07-15",
    "times": ["09:00", "10:00"],
    "userName": "João Silva",
    "course": "physics",
    "annotation": "Experimento de óptica",
    "repeatType": "none",
    "lab_nickname": "LF",
    "status": "confirmed",
    "createdAt": "2025-07-11T14:30:00Z"
  },
  "message": "Reserva criada com sucesso",
  "success": true
}
```

### 4. Update Booking
```
PUT /bookings/:id
```
**Path Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "date": "2025-07-16",
  "times": ["11:00", "12:00"],
  "annotation": "Experimento atualizado",
  "repeatType": "weekly"
}
```

**Example Response:**
```json
{
  "booking": {
    "id": "123",
    "date": "2025-07-16",
    "times": ["11:00", "12:00"],
    "userName": "João Silva",
    "course": "physics",
    "annotation": "Experimento atualizado",
    "repeatType": "weekly",
    "lab_nickname": "LF",
    "status": "confirmed",
    "createdAt": "2025-07-10T10:30:00Z",
    "updatedAt": "2025-07-11T14:30:00Z"
  },
  "message": "Reserva atualizada com sucesso",
  "success": true
}
```

### 5. Delete Booking
```
DELETE /bookings/:id
```
**Path Parameters:**
- `id`: Booking ID

**Example Response:**
```json
{
  "success": true,
  "message": "Reserva cancelada com sucesso"
}
```

### 6. Get Available Time Slots
```
GET /bookings/available-slots/:date
```
**Path Parameters:**
- `date`: Date in YYYY-MM-DD format

**Query Parameters:**
- `lab_nickname` (optional): Filter by laboratory nickname

**Example Request:**
```bash
GET /bookings/available-slots/2025-07-15?lab_nickname=LF
```

**Example Response:**
```json
{
  "availableTimeSlots": [
    "07:00", "07:45", "08:30", "11:30", "12:15", "13:00", "13:45",
    "14:30", "15:05", "15:15", "16:00", "16:45", "17:30", "18:15",
    "19:00", "19:45", "20:30", "21:05", "21:15", "22:00", "22:45", "23:30"
  ]
}
```

### 7. Get Bookings by Lab
```
GET /bookings/lab/:lab_nickname
```
**Path Parameters:**
- `lab_nickname`: Laboratory nickname

**Query Parameters:**
- `startDate` (optional): Filter bookings from this date (YYYY-MM-DD)
- `endDate` (optional): Filter bookings until this date (YYYY-MM-DD)

**Example Request:**
```bash
GET /bookings/lab/LF?startDate=2025-07-15&endDate=2025-07-31
```

**Example Response:**
```json
{
  "lab_name": "Laboratório de Física",
  "lab_nickname": "LF",
  "schedules": [
    {
      "id": "1",
      "user_id": "user123",
      "course": "physics",
      "date": "2025-07-15",
      "times": ["09:00", "10:00"],
      "repeatType": "none",
      "createdAt": "2025-07-10T10:30:00Z"
    },
    {
      "id": "2",
      "user_id": "user456",
      "course": "chemistry",
      "date": "2025-07-16",
      "times": ["14:00", "15:00"],
      "repeatType": "weekly",
      "createdAt": "2025-07-11T08:15:00Z"
    }
  ]
}
```

### 8. Get User Bookings
```
GET /bookings/user/:userId
```
**Path Parameters:**
- `userId`: User ID

**Example Response:**
```json
{
  "bookings": [
    {
      "id": "1",
      "date": "2025-07-15",
      "times": ["09:00", "10:00"],
      "userName": "João Silva",
      "course": "physics",
      "annotation": "Experimento de óptica",
      "repeatType": "none",
      "lab_nickname": "LF",
      "status": "confirmed",
      "createdAt": "2025-07-10T10:30:00Z"
    }
  ]
}
```

## Turma (Class) Management

### 9. Get All Turmas
```
GET /turmas
```
**Query Parameters:**
- `course` (optional): Filter by course (e.g., "engineering", "mechanics")
- `period` (optional): Filter by period (e.g., "first", "second", "third")

**Example Request:**
```bash
GET /turmas?course=engineering&period=first
```

**Example Response:**
```json
{
  "turmas": [
    {
      "id": "1",
      "name": "Engenharia Experimental I",
      "nickname": "ENG101",
      "course": "engineering",
      "period": "first",
      "students": {
          {
            "id": "student1",
            "name": "João Silva",
            "email": "joao@email.com"
          },
          {
            "id": "student2", 
            "name": "Maria Santos",
            "email": "maria@email.com"
          }
      },
      "createdAt": "2025-07-10T10:30:00Z",
      "updatedAt": "2025-07-11T14:30:00Z"
    }
  ]
}
```

### 10. Get Turma by ID
```
GET /turmas/:id
```
**Path Parameters:**
- `id`: Turma ID

**Example Request:**
```bash
GET /turmas/1
```

**Example Response:**
```json
{
  "turma": {
    "id": "1",
    "name": "Engenharia Experimental I",
    "nickname": "ENG101",
    "course": "engineering",
    "period": "first",
    "students": {
        {
          "id": "student1",
          "name": "João Silva",
          "email": "joao@email.com"
        },
        {
          "id": "student2", 
          "name": "Maria Santos",
          "email": "maria@email.com"
        }
    },
    "createdAt": "2025-07-10T10:30:00Z",
    "updatedAt": "2025-07-11T14:30:00Z"
  }
}
```

### 11. Create Turma
```
POST /turmas
```
**Request Body:**
```json
{
  "name": "Engenharia Experimental I",
  "nickname": "ENG101",
  "course": "engineering",
  "period": "first",
  "students": {
      {
        "name": "João Silva",
        "email": "joao@email.com"
      },
      {
        "name": "Maria Santos",
        "email": "maria@email.com"
      }
  }
}
```

**Example Response:**
```json
{
  "turma": {
    "id": "123",
    "name": "Engenharia Experimental I",
    "nickname": "ENG101",
    "course": "engineering",
    "period": "first",
    "students": {
        {
          "id": "student1",
          "name": "João Silva",
          "email": "joao@email.com"
        },
        {
          "id": "student2", 
          "name": "Maria Santos",
          "email": "maria@email.com"
        }
    },
    "createdAt": "2025-07-11T14:30:00Z"
  },
  "message": "Turma criada com sucesso",
  "success": true
}
```

### 12. Update Turma
```
PUT /turmas/:id
```
**Path Parameters:**
- `id`: Turma ID

**Request Body:**
```json
{
  "name": "Engenharia Experimental I - Atualizada",
  "nickname": "ENG101A",
  "course": "engineering",
  "period": "second",
  "students": {
      {
        "id": "student1",
        "name": "João Silva",
        "email": "joao@email.com"
      },
      {
        "id": "student2", 
        "name": "Maria Santos",
        "email": "maria@email.com"
      },
      {
        "name": "Pedro Costa",
        "email": "pedro@email.com"
      }
  }
}
```

**Example Response:**
```json
{
  "turma": {
    "id": "123",
    "name": "Engenharia Experimental I - Atualizada",
    "nickname": "ENG101A",
    "course": "engineering",
    "period": "second",
    "students": {
        {
          "id": "student1",
          "name": "João Silva",
          "email": "joao@email.com"
        },
        {
          "id": "student2", 
          "name": "Maria Santos",
          "email": "maria@email.com"
        },
        {
          "id": "student3",
          "name": "Pedro Costa",
          "email": "pedro@email.com"
        }
    },
    "createdAt": "2025-07-11T14:30:00Z",
    "updatedAt": "2025-07-11T16:45:00Z"
  },
  "message": "Turma atualizada com sucesso",
  "success": true
}
```

### 13. Delete Turma
```
DELETE /turmas/:id
```
**Path Parameters:**
- `id`: Turma ID

**Example Response:**
```json
{
  "success": true,
  "message": "Turma excluída com sucesso"
}
```

### 14. Add Student to Turma
```
POST /turmas/:id/students
```
**Path Parameters:**
- `id`: Turma ID

**Request Body:**
```json
{
  "name": "Ana Silva",
  "email": "ana@email.com"
}
```

**Example Response:**
```json
{
  "student": {
    "id": "student4",
    "name": "Ana Silva",
    "email": "ana@email.com"
  },
  "message": "Estudante adicionado à turma com sucesso",
  "success": true
}
```

### 15. Remove Student from Turma
```
DELETE /turmas/:id/students/:studentId
```
**Path Parameters:**
- `id`: Turma ID
- `studentId`: Student ID

**Example Response:**
```json
{
  "success": true,
  "message": "Estudante removido da turma com sucesso"
}
```

### 16. Get Turmas by Course
```
GET /turmas/course/:course
```
**Path Parameters:**
- `course`: Course name

**Example Request:**
```bash
GET /turmas/course/engineering
```

**Example Response:**
```json
{
  "turmas": [
    {
      "id": "1",
      "name": "Engenharia Experimental I",
      "nickname": "ENG101",
      "course": "engineering",
      "period": "first",
      "students": {
      },
      "createdAt": "2025-07-10T10:30:00Z"
    }
  ]
}
```

## Student Management

### 17. Get All Students
```
GET /students
```
**Query Parameters:**
- `turma_id` (optional): Filter by turma ID
- `course` (optional): Filter by course
- `search` (optional): Search by name or email

**Example Request:**
```bash
GET /students?turma_id=123&search=João
```

**Example Response:**
```json
{
  "students": [
    {
      "id": "student1",
      "name": "João Silva",
      "email": "joao@email.com",
      "turma_id": "123",
      "createdAt": "2025-07-10T10:30:00Z",
      "updatedAt": "2025-07-11T14:30:00Z"
    },
    {
      "id": "student2",
      "name": "Maria Santos", 
      "email": "maria@email.com",
      "turma_id": "123",
      "createdAt": "2025-07-10T11:15:00Z",
      "updatedAt": "2025-07-11T15:45:00Z"
    }
  ]
}
```

### 18. Get Student by ID
```
GET /students/:id
```
**Path Parameters:**
- `id`: Student ID

**Example Request:**
```bash
GET /students/student1
```

**Example Response:**
```json
{
  "student": {
    "id": "student1",
    "name": "João Silva",
    "email": "joao@email.com",
    "turma_id": "123",
    "turma": {
      "id": "123",
      "name": "Engenharia Experimental I",
      "nickname": "ENG101",
      "course": "engineering",
      "period": "first"
    },
    "createdAt": "2025-07-10T10:30:00Z",
    "updatedAt": "2025-07-11T14:30:00Z"
  }
}
```

### 19. Create Student
```
POST /students
```
**Request Body:**
```json
{
  "name": "Pedro Costa",
  "email": "pedro@email.com",
  "turma_id": "123"
}
```

**Example Response:**
```json
{
  "student": {
    "id": "student3",
    "name": "Pedro Costa",
    "email": "pedro@email.com",
    "turma_id": "123",
    "createdAt": "2025-07-11T16:30:00Z"
  },
  "message": "Estudante criado com sucesso",
  "success": true
}
```

### 20. Update Student
```
PUT /students/:id
```
**Path Parameters:**
- `id`: Student ID

**Request Body:**
```json
{
  "name": "Pedro Costa Silva",
  "email": "pedro.silva@email.com",
  "turma_id": "456"
}
```

**Example Response:**
```json
{
  "student": {
    "id": "student3",
    "name": "Pedro Costa Silva",
    "email": "pedro.silva@email.com",
    "turma_id": "456",
    "createdAt": "2025-07-11T16:30:00Z",
    "updatedAt": "2025-07-11T17:45:00Z"
  },
  "message": "Estudante atualizado com sucesso",
  "success": true
}
```

### 21. Delete Student
```
DELETE /students/:id
```
**Path Parameters:**
- `id`: Student ID

**Example Response:**
```json
{
  "success": true,
  "message": "Estudante excluído com sucesso"
}
```

### 22. Get Students by Turma
```
GET /students/turma/:turma_id
```
**Path Parameters:**
- `turma_id`: Turma ID

**Example Request:**
```bash
GET /students/turma/123
```

**Example Response:**
```json
{
  "students": [
    {
      "id": "student1",
      "name": "João Silva",
      "email": "joao@email.com",
      "turma_id": "123",
      "createdAt": "2025-07-10T10:30:00Z"
    },
    {
      "id": "student2",
      "name": "Maria Santos",
      "email": "maria@email.com", 
      "turma_id": "123",
      "createdAt": "2025-07-10T11:15:00Z"
    }
  ],
  "turma": {
    "id": "123",
    "name": "Engenharia Experimental I",
    "nickname": "ENG101",
    "course": "engineering",
    "period": "first"
  }
}
```

### 23. Transfer Student to Another Turma
```
PATCH /students/:id/transfer
```
**Path Parameters:**
- `id`: Student ID

**Request Body:**
```json
{
  "turma_id": "456"
}
```

**Example Response:**
```json
{
  "student": {
    "id": "student1",
    "name": "João Silva",
    "email": "joao@email.com",
    "turma_id": "456",
    "previousTurmaId": "123",
    "updatedAt": "2025-07-11T18:00:00Z"
  },
  "message": "Estudante transferido com sucesso",
  "success": true
}
```

### 24. Bulk Create Students
```
POST /students/bulk
```
**Request Body:**
```json
{
  "students": [
    {
      "name": "Ana Silva",
      "email": "ana@email.com",
      "turma_id": "123"
    },
    {
      "name": "Carlos Lima",
      "email": "carlos@email.com",
      "turma_id": "123"
    },
    {
      "name": "Fernanda Costa",
      "email": "fernanda@email.com",
      "turma_id": "456"
    }
  ]
}
```

**Example Response:**
```json
{
  "students": [
    {
      "id": "student4",
      "name": "Ana Silva",
      "email": "ana@email.com",
      "turma_id": "123",
      "createdAt": "2025-07-11T18:30:00Z"
    },
    {
      "id": "student5",
      "name": "Carlos Lima",
      "email": "carlos@email.com",
      "turma_id": "123",
      "createdAt": "2025-07-11T18:30:00Z"
    },
    {
      "id": "student6",
      "name": "Fernanda Costa",
      "email": "fernanda@email.com",
      "turma_id": "456",
      "createdAt": "2025-07-11T18:30:00Z"
    }
  ],
  "created": 3,
  "message": "3 estudantes criados com sucesso",
  "success": true
}
```

## User Management (Usuarios)

### 25. Get All Users
```
GET /usuarios
```
**Query Parameters:**
- `type` (optional): Filter by user type ("user" or "admin")
- `search` (optional): Search by name

**Example Request:**
```bash
GET /usuarios?type=admin&search=João
```

**Example Response:**
```json
{
  "usuarios": [
    {
      "id": "user1",
      "name": "João Silva",
      "type": "admin",
      "createdAt": "2025-07-10T10:30:00Z",
      "updatedAt": "2025-07-11T14:30:00Z"
    },
    {
      "id": "user2",
      "name": "Maria Santos",
      "type": "user",
      "createdAt": "2025-07-10T11:15:00Z",
      "updatedAt": "2025-07-11T15:45:00Z"
    }
  ]
}
```

### 26. Get User by ID
```
GET /usuarios/:id
```
**Path Parameters:**
- `id`: User ID

**Example Request:**
```bash
GET /usuarios/user1
```

**Example Response:**
```json
{
  "usuario": {
    "id": "user1",
    "name": "João Silva",
    "type": "admin",
    "createdAt": "2025-07-10T10:30:00Z",
    "updatedAt": "2025-07-11T14:30:00Z"
  }
}
```

### 27. Create User
```
POST /usuarios
```
**Request Body:**
```json
{
  "name": "Pedro Costa",
  "type": "user"
}
```

**Example Response:**
```json
{
  "usuario": {
    "id": "user3",
    "name": "Pedro Costa",
    "type": "user",
    "createdAt": "2025-07-11T16:30:00Z"
  },
  "message": "Usuário criado com sucesso",
  "success": true
}
```

### 28. Update User
```
PUT /usuarios/:id
```
**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "name": "Pedro Costa Silva",
  "type": "admin"
}
```

**Example Response:**
```json
{
  "usuario": {
    "id": "user3",
    "name": "Pedro Costa Silva",
    "type": "admin",
    "createdAt": "2025-07-11T16:30:00Z",
    "updatedAt": "2025-07-11T17:45:00Z"
  },
  "message": "Usuário atualizado com sucesso",
  "success": true
}
```

### 29. Delete User
```
DELETE /usuarios/:id
```
**Path Parameters:**
- `id`: User ID

**Example Response:**
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

### 30. Get Users by Type
```
GET /usuarios/type/:type
```
**Path Parameters:**
- `type`: User type ("user" or "admin")

**Example Request:**
```bash
GET /usuarios/type/admin
```

**Example Response:**
```json
{
  "usuarios": [
    {
      "id": "user1",
      "name": "João Silva",
      "type": "admin",
      "createdAt": "2025-07-10T10:30:00Z"
    },
    {
      "id": "user4",
      "name": "Ana Costa",
      "type": "admin",
      "createdAt": "2025-07-11T09:15:00Z"
    }
  ]
}
```

### 31. Change User Type
```
PATCH /usuarios/:id/type
```
**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "type": "admin"
}
```

**Example Response:**
```json
{
  "usuario": {
    "id": "user2",
    "name": "Maria Santos",
    "type": "admin",
    "previousType": "user",
    "updatedAt": "2025-07-11T18:00:00Z"
  },
  "message": "Tipo de usuário atualizado com sucesso",
  "success": true
}
```

### 32. Bulk Create Users
```
POST /usuarios/bulk
```
**Request Body:**
```json
{
  "usuarios": [
    {
      "name": "Carlos Lima",
      "type": "user"
    },
    {
      "name": "Fernanda Costa",
      "type": "admin"
    },
    {
      "name": "Roberto Silva",
      "type": "user"
    }
  ]
}
```

**Example Response:**
```json
{
  "usuarios": [
    {
      "id": "user5",
      "name": "Carlos Lima",
      "type": "user",
      "createdAt": "2025-07-11T18:30:00Z"
    },
    {
      "id": "user6",
      "name": "Fernanda Costa",
      "type": "admin",
      "createdAt": "2025-07-11T18:30:00Z"
    },
    {
      "id": "user7",
      "name": "Roberto Silva",
      "type": "user",
      "createdAt": "2025-07-11T18:30:00Z"
    }
  ],
  "created": 3,
  "message": "3 usuários criados com sucesso",
  "success": true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field": "date",
    "message": "Date is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Booking not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Time slot already booked",
  "details": {
    "conflictingTimes": ["09:00", "10:00"]
  }
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### 422 Unprocessable Entity (Turma specific)
```json
{
  "error": "Unprocessable Entity",
  "message": "Turma capacity exceeded",
  "details": {
    "capacity": 30,
    "currentEnrolled": 30,
    "attemptedToAdd": 5
  }
}
```

### 409 Conflict (Turma specific)
```json
{
  "error": "Conflict",
  "message": "Turma nickname already exists",
  "details": {
    "nickname": "FIS101",
    "conflictingTurmaId": "123"
  }
}
```

### 409 Conflict (Student specific)
```json
{
  "error": "Conflict",
  "message": "Student email already exists",
  "details": {
    "email": "joao@email.com",
    "conflictingStudentId": "student1"
  }
}
```

### 422 Unprocessable Entity (Student specific)
```json
{
  "error": "Unprocessable Entity",
  "message": "Cannot transfer student: target turma is at capacity",
  "details": {
    "targetTurmaId": "456",
    "capacity": 30,
    "currentEnrolled": 30
  }
}
```

### 400 Bad Request (User specific)
```json
{
  "error": "Bad Request",
  "message": "Invalid user type",
  "details": {
    "type": "invalid_type",
    "allowedTypes": ["user", "admin"]
  }
}
```

### 403 Forbidden (User specific)
```json
{
  "error": "Forbidden",
  "message": "Only admin users can perform this action",
  "details": {
    "requiredType": "admin",
    "currentType": "user"
  }
}
```

## Data Types

### Booking Object
```typescript
interface BookingData {
  id?: string;
  date: string; // YYYY-MM-DD
  times: string[]; // Array of time slots like ["09:00", "10:00"]
  userName: string;
  course: string;
  annotation: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  lab_nickname?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string; // ISO 8601 datetime
  updatedAt?: string; // ISO 8601 datetime
}
```

### Course Object
```typescript
interface Course {
  id: string;
  name: string;
}
```

### Lab Booking Response
```typescript
interface LabBookingResponse {
  lab_name: string;
  lab_nickname: string;
  schedules: LabScheduleItem[];
}
```

### Lab Schedule Item
```typescript
interface LabScheduleItem {
  id: string;
  user_id: string; // Bypassed on login
  course: string;
  date: string; // YYYY-MM-DD
  times: string[]; // Array of time slots like ["09:00", "10:00"]
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string; // ISO 8601 datetime
}
```

### Turma Object
```typescript
interface Turma {
  id?: string;
  name: string;
  nickname: string;
  course: string; // e.g., "engineering", "mechanics", "physics"
  period: string; // e.g., "first", "second", "third", "fourth", "fifth" (course stage/semester)
  students: {
    enrolled?: number;
    capacity: number;
    list: Student[];
  };
  createdAt?: string; // ISO 8601 datetime
  updatedAt?: string; // ISO 8601 datetime
}
```

### Student Object
```typescript
interface Student {
  id?: string;
  name: string;
  email: string;
  turma_id: string;
  turma?: {
    id: string;
    name: string;
    nickname: string;
    course: string;
    period: string;
  };
  createdAt?: string; // ISO 8601 datetime
  updatedAt?: string; // ISO 8601 datetime
}
```

### Student Response
```typescript
interface StudentResponse {
  student: Student;
  message?: string;
  success?: boolean;
}
```

### Students List Response
```typescript
interface StudentsListResponse {
  students: Student[];
  turma?: {
    id: string;
    name: string;
    nickname: string;
    course: string;
    period: string;
  };
}
```

### Bulk Students Response
```typescript
interface BulkStudentsResponse {
  students: Student[];
  created: number;
  message?: string;
  success?: boolean;
}
```

### Turma Response
```typescript
interface TurmaResponse {
  turma: Turma;
  message?: string;
  success?: boolean;
}
```

### Turmas List Response
```typescript
interface TurmasListResponse {
  turmas: Turma[];
}
```

### Turma Object
```typescript
interface Turma {
  id?: string;
  name: string;
  nickname: string;
  course: string;
  period: string;
  students?: {
    enrolled?: number;
    capacity: number;
    list?: Student[];
  };
  createdAt?: string; // ISO 8601 datetime
  updatedAt?: string; // ISO 8601 datetime
}
```

### Student Object
```typescript
interface Student {
  id?: string;
  name: string;
  email: string;
}
```

### User Object (Usuario)
```typescript
interface Usuario {
  id?: string;
  name: string;
  type: 'user' | 'admin';
  createdAt?: string; // ISO 8601 datetime
  updatedAt?: string; // ISO 8601 datetime
}
```

### User Response
```typescript
interface UsuarioResponse {
  usuario: Usuario;
  message?: string;
  success?: boolean;
}
```

### Users List Response
```typescript
interface UsuariosListResponse {
  usuarios: Usuario[];
}
```

### Bulk Users Response
```typescript
interface BulkUsuariosResponse {
  usuarios: Usuario[];
  created: number;
  message?: string;
  success?: boolean;
}
```

## Environment Variables

Create a `.env` file in your React app with:
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Authentication

The API expects a JWT token in the Authorization header. The token should be stored in localStorage with the key `authToken`.

Example:
```javascript
localStorage.setItem('authToken', 'your-jwt-token-here');
```

## Notes

1. All times are in 24-hour format (HH:MM)
2. Dates are in YYYY-MM-DD format
3. The API uses Brazilian Portuguese for user-facing messages
4. Booking conflicts are automatically detected and will return a 409 error
5. Repeated bookings are created as separate booking records
6. The API supports pagination for large result sets (add `?page=1&limit=50` to GET requests)
7. Turma nicknames must be unique across all courses
8. Student capacity is enforced when adding students to a turma
9. **Course field** is used for filtering and represents the main area of study (e.g., "engineering", "mechanics", "physics")
10. **Period field** refers to the stage/semester of the course (e.g., "first", "second", "third", "fourth", "fifth") - used for details only, not relevant for scheduling
11. When creating a turma, students without IDs will be automatically assigned new IDs
12. Deleting a turma will also remove all associated bookings and student enrollments
13. Both `course` and `lab_nickname` can be used for filtering turmas and schedules
14. **Students table** is separate from turmas and contains individual student records with turma_id foreign key
15. Student email addresses must be unique across the entire system
16. When transferring students between turmas, capacity limits are enforced
17. Bulk student creation supports creating multiple students at once, useful for enrollment processes
18. Students can be searched by name, email, or filtered by turma_id or course
19. Deleting a student will remove their bookings and references from the turma
20. **Usuarios table** contains system users with two types: "user" and "admin"
21. **Admin users** have elevated privileges and can perform administrative actions
22. **Regular users** have limited access to system features
23. User type can be changed dynamically through the API
24. Bulk user creation is available for administrative purposes
25. Only admin users can create other admin users or modify user types
