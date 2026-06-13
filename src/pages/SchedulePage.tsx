import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { getScheduleSlots, getStudentBookings, bookSlot, cancelSlot } from '../services/firebase';
import type { ScheduleSlot } from '../types';
import { Calendar, Clock, Video, User, BookOpen } from 'lucide-react';

export default function SchedulePage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const isInstructor = profile?.role === 'instructor';

  useEffect(() => { if (user) loadSlots(); }, [user]);

  async function loadSlots() {
    try {
      const data = isInstructor ? await getScheduleSlots(user!.uid) : await getStudentBookings(user!.uid);
      setSlots(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleBook(slotId: string) {
    if (!user || !profile) return;
    try { await bookSlot(slotId, user.uid, profile.displayName); await loadSlots(); } catch (err) { console.error(err); }
  }

  async function handleCancel(slotId: string) {
    try { await cancelSlot(slotId); await loadSlots(); } catch (err) { console.error(err); }
  }

  const upcoming = slots.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const past = slots.filter(s => new Date(s.startTime) <= new Date()).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('schedule.title')}</h1>
        <p className="text-gray-500 mt-1">{isInstructor ? t('schedule.subtitleInstructor') : t('schedule.subtitleStudent')}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('schedule.upcoming')}</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-8">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('schedule.noUpcoming')}</p>
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              {upcoming.map(slot => (
                <div key={slot.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{slot.courseTitle}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${slot.status === 'available' ? 'bg-green-50 text-green-600' : slot.status === 'booked' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>{t(`common.${slot.status}`)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(slot.startTime).toLocaleString()}</span>
                      {slot.studentName && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {slot.studentName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.status === 'booked' && (
                      <a href={`/video?room=${slot.id}`} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                        <Video className="w-3.5 h-3.5" /> {t('schedule.join')}
                      </a>
                    )}
                    {!isInstructor && slot.status === 'available' && (
                      <button onClick={() => handleBook(slot.id)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors">{t('schedule.book')}</button>
                    )}
                    {!isInstructor && slot.status === 'booked' && (
                      <button onClick={() => handleCancel(slot.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-colors">{t('schedule.cancel')}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('schedule.past')}</h2>
              <div className="space-y-2">
                {past.slice(0, 5).map(slot => (
                  <div key={slot.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 opacity-60">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-gray-400" /></div>
                    <div className="flex-1"><div className="text-sm text-gray-600">{slot.courseTitle}</div><div className="text-xs text-gray-400">{new Date(slot.startTime).toLocaleString()}</div></div>
                    <span className="text-xs text-gray-400 capitalize">{t(`common.${slot.status}`)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
