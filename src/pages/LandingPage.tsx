import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getAllCourses } from '../services/firebase';
import type { Course } from '../types';
import { GraduationCap, BookOpen, Video, Calendar, Brain, ArrowRight, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllCourses();
        setCourses(data.slice(0, 3));
        const students = new Set<string>();
        data.forEach(c => (c.enrolledStudents || []).forEach(s => students.add(s)));
        setTotalStudents(students.size);
      } catch {}
    }
    load();
  }, []);

  const features = [
    { icon: BookOpen, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: Video, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: Calendar, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { icon: Brain, title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
  ];

  const stats = [
    { value: courses.length, label: t('nav.courses') },
    { value: totalStudents, label: t('courses.students') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">{t('landing.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {t('landing.title1')}<br />
              <span className="text-emerald-400">{t('landing.title2')}</span>
            </h1>
            <p className="text-lg text-gray-300 dark:text-gray-400 mb-8 max-w-xl">{t('landing.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/courses" className="inline-flex items-center justify-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25">
                {t('landing.browseCourses')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 dark:bg-white/5 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20">
                {t('landing.becomeInstructor')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — real data only */}
      {stats.some(s => s.value > 0) && (
        <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
              {stats.filter(s => s.value > 0).map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{s.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t('landing.everythingTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{t('landing.everythingSub')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-50 dark:hover:shadow-emerald-900/20 transition-all">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <f.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses — real data */}
      {courses.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.courses')}</h2>
              <Link to="/courses" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">{t('landing.exploreAll')} <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {courses.map(course => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-700 transition-all">
                  <div className="h-36 bg-gradient-to-br from-emerald-100 dark:from-emerald-900/20 to-teal-100 dark:to-teal-900/20 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><BookOpen className="w-10 h-10 text-emerald-300 dark:text-emerald-400/60" /></div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 capitalize">{course.level}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">{t(`category.${course.category}`) || course.category}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledStudents?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('landing.ctaTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">{t('landing.ctaSub')}</p>
          <Link to="/courses" className="inline-flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/25">
            {t('landing.exploreAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
