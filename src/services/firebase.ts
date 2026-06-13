import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile, Course, Enrollment, ScheduleSlot } from '../types';

function withTimestamps<T extends Record<string, unknown>>(data: T, isNew: boolean) {
  const ts = serverTimestamp();
  return { ...data, [isNew ? 'createdAt' : 'updatedAt']: ts };
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt'>) {
  const ref = doc(db, 'users', profile.uid);
  await setDoc(ref, withTimestamps({ ...profile }, true));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, withTimestamps(data, false));
}

export async function createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'enrolledStudents'>) {
  const ref = collection(db, 'courses');
  const docRef = await addDoc(ref, withTimestamps({
    ...course,
    enrolledStudents: [],
    rating: 0,
    ratingCount: 0,
  }, true));
  return docRef.id;
}

export async function getCourse(id: string): Promise<Course | null> {
  const ref = doc(db, 'courses', id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } as Course : null;
}

export async function getAllCourses(): Promise<Course[]> {
  const ref = collection(db, 'courses');
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
}

export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  const q = query(collection(db, 'courses'), where('instructorId', '==', instructorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
}

export async function updateCourse(id: string, data: Partial<Course>) {
  const ref = doc(db, 'courses', id);
  await updateDoc(ref, withTimestamps(data, false));
}

export async function deleteCourse(id: string) {
  const ref = doc(db, 'courses', id);
  await deleteDoc(ref);
}

export async function enrollStudent(courseId: string, studentId: string, courseTitle: string) {
  const courseRef = doc(db, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error('Course not found');

  const enrolled = courseSnap.data().enrolledStudents || [];
  if (enrolled.includes(studentId)) throw new Error('Already enrolled');

  await updateDoc(courseRef, { enrolledStudents: [...enrolled, studentId] });

  const enrollmentRef = collection(db, 'enrollments');
  await addDoc(enrollmentRef, withTimestamps({
    studentId,
    courseId,
    courseTitle,
    progress: 0,
    completedLessons: [],
  }, true));
}

export async function getEnrollments(studentId: string): Promise<Enrollment[]> {
  const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
}

export async function updateEnrollmentProgress(enrollmentId: string, completedLessons: string[], progress: number) {
  const ref = doc(db, 'enrollments', enrollmentId);
  await updateDoc(ref, { completedLessons, progress });
}

export async function createScheduleSlot(slot: Omit<ScheduleSlot, 'id'>) {
  const ref = collection(db, 'schedule');
  const docRef = await addDoc(ref, slot);
  return docRef.id;
}

export async function getScheduleSlots(instructorId: string): Promise<ScheduleSlot[]> {
  const q = query(collection(db, 'schedule'), where('instructorId', '==', instructorId), orderBy('startTime'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleSlot));
}

export async function getStudentBookings(studentId: string): Promise<ScheduleSlot[]> {
  const q = query(collection(db, 'schedule'), where('studentId', '==', studentId), orderBy('startTime'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleSlot));
}

export async function bookSlot(slotId: string, studentId: string, studentName: string) {
  const ref = doc(db, 'schedule', slotId);
  await updateDoc(ref, { studentId, studentName, status: 'booked' });
}

export async function cancelSlot(slotId: string) {
  const ref = doc(db, 'schedule', slotId);
  await updateDoc(ref, { studentId: null, studentName: null, status: 'available' });
}

export async function deleteSlot(slotId: string) {
  const ref = doc(db, 'schedule', slotId);
  await deleteDoc(ref);
}
