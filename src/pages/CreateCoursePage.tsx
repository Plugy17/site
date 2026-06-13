import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { createCourse, getCourse, updateCourse } from '../services/firebase';
import type { Lesson } from '../types';
import { Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react';

const categoryKeys = ['Programming', 'Design', 'Business', 'Languages', 'Music', 'Health'];
const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];

export default function CreateCoursePage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categoryKeys[0]);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'text' | 'quiz'>('video');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonContentUrl, setLessonContentUrl] = useState('');
  const [lessonText, setLessonText] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      getCourse(id).then(c => {
        if (c) {
          setTitle(c.title);
          setDescription(c.description);
          setCategory(c.category);
          setLevel(c.level);
          setPrice(c.price);
          setDuration(c.duration);
          setLessons(c.lessons || []);
        }
      });
    }
  }, [id]);

  function addLesson() {
    if (!lessonTitle.trim()) return;
    const lesson: Lesson = {
      id: Date.now().toString(),
      title: lessonTitle,
      description: lessonDesc,
      type: lessonType,
      duration: lessonDuration || '15 min',
      order: lessons.length + 1,
      contentUrl: lessonType === 'video' ? lessonContentUrl : undefined,
      textContent: lessonType === 'text' ? lessonText : undefined,
    };
    setLessons([...lessons, lesson]);
    setLessonTitle(''); setLessonDesc(''); setLessonDuration(''); setLessonContentUrl(''); setLessonText('');
  }

  function removeLesson(lid: string) {
    setLessons(lessons.filter(l => l.id !== lid).map((l, i) => ({ ...l, order: i + 1 })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateCourse(id, { title, description, category, level, price, duration, lessons });
      } else {
        await createCourse({
          instructorId: user.uid,
          instructorName: profile?.displayName || 'Instructor',
          title, description, category, level, price, duration, lessons,
        });
      }
      navigate('/instructor');
    } catch (err) { console.error('Failed:', err); alert('Failed to save course.'); }
    setSaving(false);
  }

  if (profile?.role !== 'instructor') { navigate('/dashboard'); return null; }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/instructor')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('create.backToDashboard')}
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? t('create.editCourse') : t('create.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('create.basicInfo')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.courseTitle')}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder={t('create.courseTitlePlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.description')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required placeholder={t('create.descriptionPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {categoryKeys.map(c => <option key={c} value={c}>{t(`category.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.level')}</label>
              <select value={level} onChange={e => setLevel(e.target.value as any)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize">
                {levels.map(l => <option key={l} value={l}>{t(`courses.${l}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.price')}</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.duration')}</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder={t('create.durationPlaceholder')} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{t('create.lessons')}</h2>
          {lessons.length > 0 && (
            <div className="space-y-2">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-emerald-600 w-6">{idx + 1}</span>
                  <div className="flex-1"><span className="text-sm font-medium text-gray-900">{lesson.title}</span><span className="text-xs text-gray-400 ml-2 capitalize">{lesson.type}</span></div>
                  <button type="button" onClick={() => removeLesson(lesson.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">{t('create.addLesson')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder={t('create.lessonTitle')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <select value={lessonType} onChange={e => setLessonType(e.target.value as any)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize">
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <input type="text" value={lessonDesc} onChange={e => setLessonDesc(e.target.value)} placeholder={t('create.lessonDescription')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} placeholder={t('create.lessonDuration')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              {lessonType === 'video' ? (
                <input type="text" value={lessonContentUrl} onChange={e => setLessonContentUrl(e.target.value)} placeholder={t('create.videoUrl')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : lessonType === 'text' ? (
                <input type="text" value={lessonText} onChange={e => setLessonText(e.target.value)} placeholder={t('create.textContent')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              ) : (
                <input type="text" placeholder={t('create.quizComingSoon')} disabled className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
              )}
            </div>
            <button type="button" onClick={addLesson} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              <Plus className="w-4 h-4" /> {t('create.addLesson')}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/instructor')} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{t('create.cancel')}</button>
          <button type="submit" disabled={saving || !title.trim()} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {saving ? (isEdit ? t('create.saving') : t('create.creating')) : (isEdit ? t('create.saveCourse') : t('create.createCourse'))}
          </button>
        </div>
      </form>
    </div>
  );
}
