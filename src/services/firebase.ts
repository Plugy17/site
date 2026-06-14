import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { db } from '../config/firebase';
import type { UserProfile, Course, Enrollment, ScheduleSlot } from '../types';

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt'>) {
  const userRef = ref(db, `users/${profile.uid}`);
  // Убираем undefined поля — Firebase не принимает undefined
  const cleanProfile: Record<string, any> = { ...profile, createdAt: Date.now() };
  Object.keys(cleanProfile).forEach(key => {
    if (cleanProfile[key] === undefined) {
      delete cleanProfile[key];
    }
  });
  await set(userRef, cleanProfile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = ref(db, `users/${uid}`);
  // Убираем undefined поля
  const cleanData: Record<string, any> = { ...data, updatedAt: Date.now() };
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key] === undefined) {
      delete cleanData[key];
    }
  });
  await update(userRef, cleanData);
}

export async function createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'enrolledStudents'>) {
  const coursesRef = ref(db, 'courses');
  const newRef = push(coursesRef);
  const id = newRef.key!;
  const courseData = {
    ...course,
    id,
    enrolledStudents: [],
    rating: 0,
    ratingCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await set(newRef, courseData);
  return id;
}

export async function getCourse(id: string): Promise<Course | null> {
  const courseRef = ref(db, `courses/${id}`);
  const snapshot = await get(courseRef);
  return snapshot.exists() ? (snapshot.val() as Course) : null;
}

export async function getAllCourses(): Promise<Course[]> {
  const coursesRef = ref(db, 'courses');
  const snapshot = await get(coursesRef);
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, Course>;
  return Object.values(data);
}

export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  const coursesRef = ref(db, 'courses');
  const q = query(coursesRef, orderByChild('instructorId'), equalTo(instructorId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, Course>;
  return Object.values(data);
}

export async function updateCourse(id: string, data: Partial<Course>) {
  const courseRef = ref(db, `courses/${id}`);
  await update(courseRef, { ...data, updatedAt: Date.now() });
}

export async function deleteCourse(id: string) {
  const courseRef = ref(db, `courses/${id}`);
  await remove(courseRef);
}

export async function enrollStudent(courseId: string, studentId: string, courseTitle: string) {
  const courseRef = ref(db, `courses/${courseId}`);
  const courseSnap = await get(courseRef);
  if (!courseSnap.exists()) throw new Error('Course not found');

  const courseData = courseSnap.val() as Course;
  const enrolled = courseData.enrolledStudents || [];
  if (enrolled.includes(studentId)) throw new Error('Already enrolled');

  await update(courseRef, { enrolledStudents: [...enrolled, studentId] });

  const enrollmentsRef = ref(db, 'enrollments');
  const newEnrollmentRef = push(enrollmentsRef);
  await set(newEnrollmentRef, {
    studentId,
    courseId,
    courseTitle,
    progress: 0,
    completedLessons: [],
    id: newEnrollmentRef.key,
    enrolledAt: Date.now(),
  });
}

export async function getEnrollments(studentId: string): Promise<Enrollment[]> {
  const enrollmentsRef = ref(db, 'enrollments');
  const q = query(enrollmentsRef, orderByChild('studentId'), equalTo(studentId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, Enrollment>;
  return Object.values(data);
}

export async function updateEnrollmentProgress(enrollmentId: string, completedLessons: string[], progress: number) {
  const enrollmentRef = ref(db, `enrollments/${enrollmentId}`);
  await update(enrollmentRef, { completedLessons, progress });
}

export async function createScheduleSlot(slot: Omit<ScheduleSlot, 'id'>) {
  const scheduleRef = ref(db, 'schedule');
  const newRef = push(scheduleRef);
  const id = newRef.key!;
  await set(newRef, { ...slot, id });
  return id;
}

export async function getScheduleSlots(instructorId: string): Promise<ScheduleSlot[]> {
  const scheduleRef = ref(db, 'schedule');
  const q = query(scheduleRef, orderByChild('instructorId'), equalTo(instructorId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, ScheduleSlot>;
  return Object.values(data).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export async function getStudentBookings(studentId: string): Promise<ScheduleSlot[]> {
  const scheduleRef = ref(db, 'schedule');
  const q = query(scheduleRef, orderByChild('studentId'), equalTo(studentId));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, ScheduleSlot>;
  return Object.values(data).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export async function bookSlot(slotId: string, studentId: string, studentName: string) {
  const slotRef = ref(db, `schedule/${slotId}`);
  await update(slotRef, { studentId, studentName, status: 'booked' });
}

export async function cancelSlot(slotId: string) {
  const slotRef = ref(db, `schedule/${slotId}`);
  await update(slotRef, { status: 'available' });
}

export async function deleteSlot(slotId: string) {
  const slotRef = ref(db, `schedule/${slotId}`);
  await remove(slotRef);
}