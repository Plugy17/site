export type UserRole = 'student' | 'instructor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
  createdAt: number;
}

export interface Course {
  id: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  price: number;
  duration: string;
  lessons: Lesson[];
  enrolledStudents: string[];
  rating: number;
  ratingCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz';
  contentUrl?: string;
  textContent?: string;
  duration: string;
  order: number;
  completed?: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: number;
}

export interface ScheduleSlot {
  id: string;
  instructorId: string;
  studentId?: string;
  studentName?: string;
  courseId: string;
  courseTitle: string;
  startTime: string;
  endTime: string;
  type: 'lesson' | 'consultation';
  meetingLink?: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
