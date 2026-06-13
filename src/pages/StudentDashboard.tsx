import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { getEnrollments, getAllCourses, getStudentBookings } from '../services/firebase';
import type { Enrollment, Course, ScheduleSlot } from '../types';
import { BookOpen, Calendar, Clock, ArrowRight, BarChart3, Video } from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [enrollData, courseData, bookingData] = await Promise.all([
        getEnrollments(user!.uid),
        getAllCourses(),
        getStudentBookings(user!.uid),
      ]);
      setEnrollments(enrollData);
      setCourses(courseData);
      setBookings(bookingData.filter(b => b.status === 'booked' && new Date(b.startTime) > new Date()));
    } catch (err) { console.error('Failed to load dashboard:', err); }
    setLoading(false);
  }

  if (!user) { navigate('/login'); return null; }

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id));
  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.welcome')}, {profile?.displayName}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.trackProgress')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-violet-500/5">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{enrollments.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.enrolledCourses')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-blue-500/5">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3"><BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgProgress}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.avgProgress')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-amber-500/5">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-3"><Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.upcomingSessions')}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 shadow-lg shadow-rose-500/5">
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center mb-3"><Video className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.videoCalls')}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.myCourses')}</h2>
          <Link to="/courses" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">{t('dashboard.browseMore')} <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
        ) : enrolledCourses.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-10 text-center shadow-lg">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-1">{t('dashboard.noCourses')}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{t('dashboard.noCoursesSub')}</p>
            <Link to="/courses" className="inline-flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors">
              {t('dashboard.browseCourses')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map(course => {
              const en = enrollments.find(e => e.courseId === course.id);
              return (
                <Link key={course.id} to={`/courses/${course.id}`} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-violet-500/10 transition-all shadow-lg">
                  <div className="h-28 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-teal-50 dark:to-teal-900/20 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-emerald-300 dark:text-emerald-400/60" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-1">{course.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3">
                      <span>{course.instructorName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 dark:bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${en?.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{en?.progress || 0}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/schedule" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 hover:border-violet-200 dark:hover:border-violet-700 transition-all group shadow-lg shadow-violet-500/5">
          <Calendar className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{t('dashboard.mySchedule')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.myScheduleSub')}</p>
        </Link>
        <Link to="/video" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-5 hover:border-violet-200 dark:hover:border-violet-700 transition-all group shadow-lg shadow-violet-500/5">
          <Video className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{t('dashboard.videoCallsTitle')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.videoCallsSub')}</p>
        </Link>
      </div>
    </div>
  );
}
