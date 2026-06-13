import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { getCourse, enrollStudent, getEnrollments, updateEnrollmentProgress } from '../services/firebase';
import type { Course, Enrollment } from '../types';
import { Clock, Users, Star, BookOpen, CheckCircle, Play, ArrowLeft, Video } from 'lucide-react';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadCourse();
  }, [id]);

  async function loadCourse() {
    try {
      const data = await getCourse(id!);
      setCourse(data);
      if (user && data) {
        const enrollments = await getEnrollments(user.uid);
        const en = enrollments.find(e => e.courseId === id);
        setEnrollment(en || null);
      }
    } catch (err) { console.error('Failed to load course:', err); }
    setLoading(false);
  }

  async function handleEnroll() {
    if (!user || !course) return;
    setEnrolling(true);
    try {
      await enrollStudent(course.id, user.uid, course.title);
      await loadCourse();
      navigate('/dashboard');
    } catch (err: any) { alert(err.message || 'Failed to enroll'); }
    setEnrolling(false);
  }

  async function handleCompleteLesson(lessonId: string) {
    if (!enrollment || !course) return;
    const completed = enrollment.completedLessons || [];
    if (completed.includes(lessonId)) return;
    const newCompleted = [...completed, lessonId];
    const progress = Math.round((newCompleted.length / course.lessons.length) * 100);
    await updateEnrollmentProgress(enrollment.id, newCompleted, progress);
    setEnrollment({ ...enrollment, completedLessons: newCompleted, progress });
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" /><div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8" /><div className="space-y-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></div></div>;
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">{t('course.notFound')}</h2>
        <button onClick={() => navigate('/courses')} className="mt-4 text-emerald-600 dark:text-emerald-400 hover:underline">{t('course.backToCourses')}</button>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('course.backToCourses')}
      </button>

      <div className="bg-gradient-to-br from-emerald-600 dark:from-emerald-700 to-teal-700 dark:to-teal-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-emerald-200 dark:text-emerald-300 text-sm mb-2">
              <span className="bg-white/20 rounded-full px-3 py-0.5 capitalize">{t(`courses.${course.level}`)}</span>
              <span>{t(`category.${course.category}`) || course.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{course.title}</h1>
            <p className="text-emerald-100 dark:text-emerald-200 text-sm leading-relaxed mb-4">{course.description}</p>
            <div className="flex items-center gap-6 text-sm text-emerald-200 dark:text-emerald-300 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrolledStudents?.length || 0} {t('courses.students')}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {course.rating || t('common.noRating')}</span>
              <span>{t('common.instructor')}: {course.instructorName}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-3">{course.price === 0 ? t('courses.free') : `$${course.price}`}</div>
            {isEnrolled ? (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-5 py-2.5">
                <CheckCircle className="w-5 h-5" /> {t('course.enrolled')}
              </div>
            ) : (
              <button onClick={handleEnroll} disabled={!user || enrolling} className="bg-white dark:bg-gray-100 text-emerald-700 dark:text-emerald-800 px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-gray-200 transition-colors disabled:opacity-50">
                {enrolling ? t('course.enrolling') : !user ? t('course.signInToEnroll') : t('course.enrollNow')}
              </button>
            )}
          </div>
        </div>
        {isEnrolled && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
              </div>
              <span className="text-sm font-medium">{enrollment.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('course.courseContent')}</h2>
        <div className="space-y-2">
          {course.lessons?.map((lesson, idx) => {
            const isCompleted = enrollment?.completedLessons?.includes(lesson.id);
            return (
              <div key={lesson.id} className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border transition-colors ${isCompleted ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium ${isCompleted ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-gray-900 dark:text-white'}`}>{lesson.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lesson.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.duration}</span>
                  <span className="flex items-center gap-1">
                    {lesson.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    {lesson.type}
                  </span>
                  {isEnrolled && !isCompleted && (
                    <button onClick={() => handleCompleteLesson(lesson.id)} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                      <Play className="w-3.5 h-3.5 inline mr-1" /> {t('course.start')}
                    </button>
                  )}
                  {isCompleted && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">{t('common.completed')}</span>}
                </div>
              </div>
            );
          })}
          {(!course.lessons || course.lessons.length === 0) && (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">{t('course.noLessons')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
