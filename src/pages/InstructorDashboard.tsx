import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { getCoursesByInstructor, getScheduleSlots, deleteCourse } from '../services/firebase';
import type { Course, ScheduleSlot } from '../types';
import { BookOpen, Plus, Calendar, Users, Trash2, Edit, BarChart3, UserPlus } from 'lucide-react';

export default function InstructorDashboard() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (profile?.role !== 'instructor') { navigate('/dashboard'); return; }
    loadData();
  }, [user, profile]);

  async function loadData() {
    try {
      const [courseData, slotData] = await Promise.all([
        getCoursesByInstructor(user!.uid),
        getScheduleSlots(user!.uid),
      ]);
      setCourses(courseData);
      setSlots(slotData);
    } catch (err) { console.error('Failed to load instructor data:', err); }
    setLoading(false);
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm('Delete this course?')) return;
    try { await deleteCourse(id); setCourses(prev => prev.filter(c => c.id !== id)); } catch (err) { console.error(err); }
  }

  if (!user || profile?.role !== 'instructor') return null;

  const totalStudents = new Set(courses.flatMap(c => c.enrolledStudents || [])).size;
  const bookedSlots = slots.filter(s => s.status === 'booked' && new Date(s.startTime) > new Date());
  const avgRating = courses.length && courses.some(c => c.rating > 0) ? (courses.filter(c => c.rating > 0).reduce((a, c) => a + c.rating, 0) / courses.filter(c => c.rating > 0).length).toFixed(1) : t('common.noRating');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructor.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('instructor.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/instructor/schedule" className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar className="w-4 h-4" /> {t('instructor.manageSchedule')}
          </Link>
          <Link to="/instructor/create-instructor" className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <UserPlus className="w-4 h-4" /> {t('instructor.createInstructor')}
          </Link>
          <Link to="/instructor/create" className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
            <Plus className="w-4 h-4" /> {t('instructor.newCourse')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-violet-500/5">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('instructor.myCourses')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-blue-500/5">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('instructor.totalStudents')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-amber-500/5">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-3"><Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookedSlots.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('instructor.upcomingSessions')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-rose-500/5">
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center mb-3"><BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('instructor.avgRating')}</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('instructor.myCourses')}</h2>
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : courses.length === 0 ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-10 text-center shadow-lg">
          <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-1">{t('instructor.noCourses')}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{t('instructor.noCoursesSub')}</p>
          <Link to="/instructor/create" className="inline-flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> {t('instructor.createCourse')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 flex items-center gap-4 hover:border-violet-200 dark:hover:border-violet-700 transition-colors shadow-lg shadow-violet-500/5">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-emerald-400 dark:text-emerald-400/60" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white">{course.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                  <span>{course.enrolledStudents?.length || 0} {t('courses.students')}</span>
                  <span>{course.lessons?.length || 0} {t('common.lessons')}</span>
                  <span className="capitalize">{t(`courses.${course.level}`)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/instructor/edit/${course.id}`)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" title={t('common.edit')}>
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title={t('common.delete')}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookedSlots.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('instructor.upcomingTitle')}</h2>
          <div className="space-y-2">
            {bookedSlots.map(slot => (
              <div key={slot.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-4 flex items-center justify-between shadow-lg shadow-violet-500/5">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{slot.courseTitle}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('common.with')} {slot.studentName} &middot; {new Date(slot.startTime).toLocaleString()}</div>
                </div>
                <Link to={`/video?room=${slot.id}`} className="text-sm text-violet-600 dark:text-violet-400 hover:underline">{t('instructor.joinCall')}</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
