import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import { getAllCourses } from '../services/firebase';
import type { ChatMessage, Course } from '../types';
import { Send, Bot, User, Sparkles, X, MessageCircle } from 'lucide-react';

export default function AIAssistant() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: t('ai.greeting'), timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (open && courses.length === 0) {
      getAllCourses().then(setCourses).catch(() => {});
    }
  }, [open]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const lower = input.toLowerCase();

    let response = generateResponse(lower);
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() + 1 };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  }

  function generateResponse(input: string): string {
    const isRu = lang === 'ru';
    const isUk = lang === 'uk';
    const langSafe = (ru: string, uk: string, en: string) => isRu ? ru : isUk ? uk : en;

    // Course recommendations with real data
    if (courses.length > 0) {
      const beginnerCourses = courses.filter(c => c.level === 'beginner');
      const popular = courses.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0)).slice(0, 3);

      if (input.includes('рекоменд') || input.includes('порад') || input.includes('recommend') || input.includes('suggest') || input.includes('совет')) {
        return langSafe(
          `На основе данных платформы, вот что могу порекомендовать:\n\n` +
          (beginnerCourses.length > 0
            ? `📚 Для начинающих: "${beginnerCourses[0].title}" (${beginnerCourses[0].enrolledStudents?.length || 0} студентов)\n\n`
            : '') +
          (popular.length > 0
            ? `🔥 Популярные курсы:\n${popular.map((c, i) => `${i + 1}. "${c.title}" — ${c.enrolledStudents?.length || 0} записей (${c.duration})`).join('\n')}\n\n`
            : '') +
          `Всего на платформе ${courses.length} курсов по кибербезопасности.`
        );
      }

      if (input.includes('курс') || input.includes('course') || input.includes('навчан') || input.includes('обучен')) {
        return langSafe(
          `📋 Всего на платформе **${courses.length} курсов** по кибербезопасности.\n\n` +
          courses.slice(0, 5).map((c, i) =>
            `${i + 1}. "${c.title}" — ${c.level === 'beginner' ? '🟢 начальный' : c.level === 'intermediate' ? '🟡 средний' : '🔴 продвинутый'} | ${c.enrolledStudents?.length || 0} студентов | ${c.duration}`
          ).join('\n') +
          (courses.length > 5 ? `\n\n...и ещё ${courses.length - 5} курсов.` : '')
        );
      }

      if (input.includes('популярн') || input.includes('popular') || input.includes('топ') || input.includes('best')) {
        const top = courses.sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0)).slice(0, 5);
        return langSafe(
          `🏆 Топ-5 популярных курсов:\n\n` +
          top.map((c, i) => `${i + 1}. "${c.title}" — ${c.enrolledStudents?.length || 0} студентов 👨‍🎓`).join('\n') +
          `\n\nВсего на платформе ${courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0)} студентов.`
        );
      }
    }

    if (input.includes('кибербезопасность') || input.includes('cyber') || input.includes('security') || input.includes('безпек') || input.includes('безопасн')) {
      return langSafe(
        'NovaShield Academy специализируется исключительно на **кибербезопасности**. ' +
        'Все курсы разработаны экспертами по информационной безопасности. ' +
        'У нас вы найдете курсы по этичному хакингу, сетевой безопасности, криптографии и многому другому. ' +
        'Каждый курс включает практические задания, видеоуроки и возможность общения с преподавателем.'
      );
    }

    if (input.includes('сколько') || input.includes('price') || input.includes('цен') || input.includes('варт') || input.includes('cost') || input.includes('$')) {
      const pricedCourses = courses.filter(c => c.price > 0);
      const freeCourses = courses.filter(c => c.price === 0);
      return langSafe(
        `💰 Информация о ценах:\n\n` +
        (freeCourses.length > 0 ? `🎉 Бесплатных курсов: ${freeCourses.length}\n` : '') +
        (pricedCourses.length > 0
          ? `💳 Платных курсов: ${pricedCourses.length}\nЦены от $${Math.min(...pricedCourses.map(c => c.price))} до $${Math.max(...pricedCourses.map(c => c.price))}\n`
          : '') +
        `\nСредняя цена: $${courses.length > 0 ? Math.round(courses.reduce((s, c) => s + c.price, 0) / courses.length) : 0}`
      );
    }

    if (input.includes('запис') || input.includes('enroll') || input.includes('sign up') || input.includes('join')) {
      return langSafe(
        '📝 Чтобы записаться на курс:\n\n' +
        '1. Нажмите "Войти через Google" на странице входа\n' +
        '2. Перейдите в раздел "Курсы"\n' +
        '3. Выберите интересующий курс\n' +
        '4. Нажмите "Записаться"\n\n' +
        'После записи курс появится в вашем кабинете, где вы сможете отслеживать прогресс.'
      );
    }

    if (input.includes('расписан') || input.includes('schedule') || input.includes('розклад') || input.includes('бронюв') || input.includes('book')) {
      return langSafe(
        '📅 Как работает расписание:\n\n' +
        '• Преподаватели создают доступные временные слоты\n' +
        '• Ученики могут забронировать подходящее время\n' +
        '• После бронирования слот появляется в вашем расписании\n' +
        '• За 5 минут до занятия появится кнопка "Войти в звонок"\n\n' +
        'Все предстоящие сессии отображаются в кабинете и на странице "Расписание".'
      );
    }

    if (input.includes('видео') || input.includes('video') || input.includes('call') || input.includes('звон') || input.includes('дзвін') || input.includes('jitsi')) {
      return langSafe(
        '🎥 Видеозвонки на платформе:\n\n' +
        '• Работают через Jitsi Meet прямо в браузере (не нужно ничего скачивать)\n' +
        '• Можно включить/выключить микрофон и камеру\n' +
        '• Доступен чат и демонстрация экрана\n\n' +
        'Чтобы присоединиться: перейдите на страницу "Видеозвонок" или нажмите "Войти" в расписании.'
      );
    }

    if (input.includes('прогресс') || input.includes('progress') || input.includes('прогрес')) {
      return langSafe(
        '📊 Прогресс обучения:\n\n' +
        'После записи на курс вы можете отмечать пройденные уроки кнопкой "Начать".\n' +
        'Прогрес отображается в процентах на странице курса и в вашем кабинете.\n' +
        'Чем больше уроков вы завершите — тем выше процент прогресса.'
      );
    }

    if (input.includes('инструктор') || input.includes('instructor') || input.includes('преподавател') || input.includes('викладач') || input.includes('teach')) {
      return langSafe(
        '👨‍🏫 Для преподавателей:\n\n' +
        '• Войдите через Email/Пароль: admin@cyberacademy.com\n' +
        '• В кабинете преподавателя можно создавать курсы\n' +
        '• Добавляйте видеоуроки, текстовые материалы\n' +
        '• Управляйте расписанием занятий\n' +
        '• Отслеживайте количество студентов и их прогресс'
      );
    }

    if (input.includes('оплат') || input.includes('pay') || input.includes('плат') || input.includes('деньг') || input.includes('грош')) {
      return langSafe(
        '💳 Оплата курсов:\n\n' +
        '• Бесплатные курсы доступны сразу после записи\n' +
        '• Для платных курсов откроется окно оплаты\n' +
        '• В данный момент система оплаты в режиме демо\n' +
        '• В ближайшее время будет подключена полноценная оплата через Stripe'
      );
    }

    // Default response with actionable context
    return langSafe(
      'Я AI-помощник NovaShield Academy 🤖\n\n' +
      'Я могу помочь с:\n' +
      (courses.length > 0 ? `📚 Поиск среди ${courses.length} курсов\n` : '') +
      '💳 Информация о ценах\n' +
      '📝 Как записаться на курс\n' +
      '📅 Как работает расписание\n' +
      '🎥 Как работают видеозвонки\n' +
      '👨‍🏫 Для преподавателей\n\n' +
      'Что вас интересует?'
    );
  }

  function handleQuickQuestion(q: string) {
    setInput(q);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/30 flex items-center justify-center text-white hover:bg-violet-500 transition-all hover:scale-105">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden" style={{ height: '550px' }}>
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <div className="text-white font-semibold text-sm">{t('ai.title')}</div>
              <div className="text-violet-200 text-xs">{t('ai.status')}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" /></div>
                )}
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-md'}`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-4 h-4 text-white" /></div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {[
                `📚 Что за курсы?`,
                `💰 Сколько стоят?`,
                `📝 Как записаться?`,
                `👨‍🏫 Для преподавателей`,
              ].map(s => (
                <button key={s} onClick={() => handleQuickQuestion(s)} className="text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">{s}</button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-gray-100 dark:border-gray-700">
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={t('ai.placeholder')}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white" />
              <button type="submit" className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white hover:bg-violet-700 transition-colors flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}