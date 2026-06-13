import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { getScheduleSlots, createScheduleSlot, deleteSlot, getCoursesByInstructor } from '../services/firebase';
import type { ScheduleSlot, Course } from '../types';
import { Calendar, Plus, Clock, ArrowLeft, Trash2 } from 'lucide-react';

export default function InstructorSchedulePage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [courseId, setCourseId] = useState('');
  const [slotType, setSlotType] = useState<'lesson' | 'consultation'>('lesson');

  useEffect(() => {
    if (!user || profile?.role !== 'instructor') { navigate('/dashboard'); return; }
    loadData();
  }, [user, profile]);

  async function loadData() {
    try {
      const [slotData, courseData] = await Promise.all([getScheduleSlots(user!.uid), getCoursesByInstructor(user!.uid)]);
      setSlots(slotData); setCourses(courseData);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleAdd() {
    if (!date || !time || !user) return;
    const startTime = new Date(`${date}T${time}`).toISOString();
    const endDate = new Date(startTime); endDate.setHours(endDate.getHours() + 1);
    const course = courses.find(c => c.id === courseId);
    try {
      await createScheduleSlot({
        instructorId: user.uid, courseId: courseId || '', courseTitle: course?.title || t('instructorSchedule.openConsultation'),
        startTime, endTime: endDate.toISOString(), type: slotType, status: 'available',
      });
      setShowAdd(false); setDate(''); setTime(''); setCourseId('');
      await loadData();
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id: string) {
    try { await deleteSlot(id); await loadData(); } catch (err) { console.error(err); }
  }

  const upcoming = slots.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/instructor')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('create.backToDashboard')}
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructorSchedule.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('instructorSchedule.subtitle')}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> {t('instructorSchedule.addSlot')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('instructorSchedule.addSlot')}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedule.date')}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('schedule.time')}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('instructorSchedule.course')}</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                <option value="">{t('instructorSchedule.openConsultation')}</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('instructorSchedule.type')}</label>
              <select value={slotType} onChange={e => setSlotType(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                <option value="lesson">{t('instructorSchedule.lesson')}</option>
                <option value="consultation">{t('instructorSchedule.consultation')}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-emerald-600 dark:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors">{t('instructorSchedule.add')}</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('create.cancel')}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : upcoming.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-10 text-center">
          <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600 dark:text-gray-300">{t('instructorSchedule.noSlots')}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('instructorSchedule.noSlotsSub')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map(slot => (
            <div key={slot.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{slot.courseTitle}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${slot.status === 'available' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>{t(`common.${slot.status}`)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{t(`common.${slot.type}Type`)}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(slot.startTime).toLocaleString()} — {new Date(slot.endTime).toLocaleTimeString()}
                </div>
                {slot.studentName && <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{t('common.with')} {slot.studentName}</div>}
              </div>
              <button onClick={() => handleDelete(slot.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
