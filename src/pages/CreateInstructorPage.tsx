import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { createUserProfile } from '../services/firebase';
import { ref, push } from 'firebase/database';
import { db } from '../config/firebase';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function CreateInstructorPage() {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || profile?.role !== 'instructor') { navigate('/dashboard'); return null; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Generate a unique ID for the new instructor
      const instructorsRef = ref(db, 'instructors');
      const newRef = push(instructorsRef);
      const newId = newRef.key!;

      // Save instructor profile to database
      await createUserProfile({
        uid: newId,
        email: email,
        displayName: name,
        photoURL: undefined,
        role: 'instructor',
      });

      setSuccess(`Преподаватель "${name}" успешно создан!\nEmail: ${email}\nПароль: ${password}\n\nДля входа используйте Google Sign-In или создайте аккаунт в Firebase Console.`);
      setName(''); setEmail(''); setPassword('');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания преподавателя');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/instructor')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад в кабинет
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('instructor.createInstructor')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('instructor.createInstructorSub')}</p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-600 dark:text-green-400 whitespace-pre-line">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя и Фамилия</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Иван Петров"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="instructor@example.com"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Минимум 6 символов"
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> {loading ? 'Создание...' : 'Создать преподавателя'}
        </button>
      </form>
    </div>
  );
}