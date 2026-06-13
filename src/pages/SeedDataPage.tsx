import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { push, ref, set } from 'firebase/database';
import { db } from '../config/firebase';
import { Sparkles, Shield, BookOpen } from 'lucide-react';

const demoInstructorId = 'demo-instructor-1';

const demoCourses = [
  {
    title: 'Основы кибербезопасности',
    description: 'Изучите фундаментальные принципы защиты информации, типы угроз и методы их предотвращения. Идеально для начинающих.',
    category: 'Cybersecurity',
    level: 'beginner',
    price: 0,
    duration: '6 недель',
    lessons: [
      { id: 'l1', title: 'Введение в кибербезопасность', description: 'Что такое кибербезопасность и почему это важно', type: 'video', contentUrl: 'https://www.youtube.com/embed/GpVl4pBj0Kc', duration: '15 мин', order: 1 },
      { id: 'l2', title: 'Типы киберугроз', description: 'Вирусы, фишинг, DDoS-атаки и другие угрозы', type: 'video', contentUrl: 'https://www.youtube.com/embed/wV7xPYPmi-Q', duration: '20 мин', order: 2 },
      { id: 'l3', title: 'Защита паролей', description: 'Как создавать надёжные пароли и использовать менеджеры паролей', type: 'text', textContent: 'Надёжный пароль должен содержать минимум 12 символов, включая заглавные и строчные буквы, цифры и спецсимволы. Используйте менеджеры паролей (LastPass, 1Password, Bitwarden).', duration: '10 мин', order: 3 },
      { id: 'l4', title: 'Безопасность в сети', description: 'Как защитить себя при использовании общественного Wi-Fi', type: 'text', textContent: 'Используйте VPN при подключении к общественным сетям Wi-Fi. Не вводите пароли на сайтах без HTTPS. Включите двухфакторную аутентификацию.', duration: '15 мин', order: 4 },
    ],
  },
  {
    title: 'Этичный хакинг: уровень 1',
    description: 'Научитесь мыслить как хакер, чтобы защищать системы. Практический курс по пентестингу.',
    category: 'Cybersecurity',
    level: 'intermediate',
    price: 49,
    duration: '8 недель',
    lessons: [
      { id: 'l5', title: 'Введение в этичный хакинг', description: 'Что такое пентестинг и этичный хакинг', type: 'video', contentUrl: 'https://www.youtube.com/embed/3Kq1MIfTWCE', duration: '20 мин', order: 1 },
      { id: 'l6', title: 'Разведка и сбор информации', description: 'Инструменты для сбора информации о целях', type: 'text', textContent: 'Используйте Nmap для сканирования портов, Wireshark для анализа трафика, и Shodan для поиска устройств в интернете.', duration: '25 мин', order: 2 },
      { id: 'l7', title: 'SQL-инъекции', description: 'Как находить и эксплуатировать SQL-уязвимости', type: 'video', contentUrl: 'https://www.youtube.com/embed/ciNHn38EyRc', duration: '30 мин', order: 3 },
    ],
  },
  {
    title: 'Защита сети и мониторинг',
    description: 'Продвинутый курс по настройке сетевой безопасности и системам обнаружения вторжений.',
    category: 'Cybersecurity',
    level: 'advanced',
    price: 99,
    duration: '10 недель',
    lessons: [
      { id: 'l8', title: 'Архитектура сетевой безопасности', description: 'Проектирование защищённых сетей', type: 'video', contentUrl: 'https://www.youtube.com/embed/5QxL0eFv1-U', duration: '25 мин', order: 1 },
      { id: 'l9', title: 'IDS/IPS системы', description: 'Настройка систем обнаружения и предотвращения вторжений', type: 'text', textContent: 'Snort и Suricata — популярные системы IDS/IPS. Они анализируют трафик в реальном времени и блокируют подозрительную активность.', duration: '30 мин', order: 2 },
      { id: 'l10', title: 'SIEM системы', description: 'Централизованный сбор и анализ логов безопасности', type: 'video', contentUrl: 'https://www.youtube.com/embed/6dCQJ5sMQhk', duration: '35 мин', order: 3 },
    ],
  },
  {
    title: 'Криптография для начинающих',
    description: 'Основы шифрования, хеширования и цифровых подписей. Поймите, как работает защита данных.',
    category: 'Cybersecurity',
    level: 'beginner',
    price: 0,
    duration: '4 недели',
    lessons: [
      { id: 'l11', title: 'История криптографии', description: 'От шифра Цезаря до современных алгоритмов', type: 'text', textContent: 'Криптография существует тысячи лет. Первый известный шифр — шифр Цезаря, который сдвигал буквы на 3 позиции.', duration: '15 мин', order: 1 },
      { id: 'l12', title: 'Симметричное шифрование', description: 'AES, DES и другие алгоритмы', type: 'video', contentUrl: 'https://www.youtube.com/embed/o_g-M7UqUXY', duration: '20 мин', order: 2 },
    ],
  },
];

export default function SeedDataPage() {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSeed() {
    setSeeding(true);
    setError('');
    try {
      for (const course of demoCourses) {
        const coursesRef = ref(db, 'courses');
        const newRef = push(coursesRef);
        const id = newRef.key!;
        await set(newRef, {
          id,
          instructorId: demoInstructorId,
          instructorName: 'Cyber Academy Team',
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          duration: course.duration,
          lessons: course.lessons,
          enrolledStudents: [],
          rating: 4.5,
          ratingCount: 10,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка создания демо-данных');
    }
    setSeeding(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Наполнение сайта демо-данными</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Создаст 4 демо-курса по кибербезопасности с видеоуроками и текстовыми материалами
      </p>

      {done ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-4">
          <BookOpen className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">✅ Демо-данные созданы!</h3>
          <p className="text-sm text-green-600 dark:text-green-400 mb-4">4 курса по кибербезопасности с уроками</p>
          <button onClick={() => navigate('/courses')} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700">
            Перейти к курсам
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3 mb-8 text-left">
            {demoCourses.map((c, i) => (
              <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-white/20 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-violet-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.lessons.length} уроков · {c.price === 0 ? 'Бесплатно' : `$${c.price}`} · {c.level}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSeed} disabled={seeding}
            className="bg-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20">
            {seeding ? 'Создание...' : '🚀 Создать демо-курсы'}
          </button>
        </>
      )}
    </div>
  );
}