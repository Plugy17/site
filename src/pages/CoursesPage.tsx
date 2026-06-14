import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getAllCourses } from '../services/firebase';
import type { Course } from '../types';
import { Search, Clock, Users, Star, BookOpen } from 'lucide-react';

const levelKeys = ['beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (err) { console.error('Failed to load courses:', err); }
    setLoading(false);
  }

  // Фильтр: только Cybersecurity + поиск + уровень
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'All' || c.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('courses.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('courses.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder={t('courses.search')} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:text-white" />
        </div>
        <select value={level} onChange={e => setLevel(e.target.value)}
          className="px-4 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white capitalize">
          <option value="All">{t('courses.allLevels')}</option>
          {levelKeys.map(l => <option key={l} value={l}>{t(`courses.${l}`)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700" />
              <div className="p-5 space-y-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">{t('courses.noCourses')}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t('courses.noCoursesSub')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Нажмите /seed в адресной строке чтобы создать демо-курсы</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => (
            <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-lg hover:shadow-violet-500/10 transition-all shadow-lg">
              <div className="h-40 bg-gradient-to-br from-violet-100 dark:from-violet-900/20 to-fuchsia-100 dark:to-fuchsia-900/20 relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex items-center justify-center h-full"><BookOpen className="w-12 h-12 text-violet-300 dark:text-violet-400/60" /></div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 capitalize">{t(`courses.${course.level}`)}</div>
              </div>
              <div className="p-5">
                <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-2">Кибербезопасность</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrolledStudents?.length || 0}</span>
                  </div>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.rating || t('common.new')}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{course.price === 0 ? t('courses.free') : `$${course.price}`}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{course.instructorName}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}