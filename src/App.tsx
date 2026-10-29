import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Помилка сервера: ${response.status}`);
        }

        const data: User[] = await response.json();
        if (!controller.signal.aborted) {
          setUsers(data);
        }
      } catch (error: unknown) {
        // Скасування запиту не є помилкою для користувача.
        if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
          return;
        }

        setError(error instanceof Error ? error.message : 'Невідома помилка.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      controller.abort();
    };
  }, []);

  // Пошук працює з уже завантаженим масивом і не запускає новий запит.
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="container">
      <header>
        <h1>Каталог користувачів</h1>
        <p>Знайдіть користувача та перегляньте його контакти.</p>
      </header>

      {loading ? (
        <p className="message" role="status">Завантаження користувачів…</p>
      ) : error ? (
        <div className="message error" role="alert">
          <p>Не вдалося завантажити користувачів: {error}</p>
          <p>Перевірте інтернет-з’єднання та оновіть сторінку.</p>
        </div>
      ) : (
        <>
          <label className="search-label" htmlFor="search">Пошук за ім’ям</label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Введіть ім’я користувача"
          />
          <p className="result-count" role="status">Знайдено: {filteredUsers.length}</p>

          {filteredUsers.length > 0 ? (
            <div className="user-list">
              {filteredUsers.map((user) => (
                <article className="user-card" key={user.id}>
                  <h2>{user.name}</h2>
                  <p><strong>Email:</strong> <a href={`mailto:${user.email}`}>{user.email}</a></p>
                  <p><strong>Телефон:</strong> {user.phone}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="message">
              {users.length === 0 ? 'Список користувачів порожній.' : 'За вашим запитом нікого не знайдено.'}
            </p>
          )}
        </>
      )}
    </main>
  );
}

export default App;
