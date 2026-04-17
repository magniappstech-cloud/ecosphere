import { useRef, useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'ecology', label: 'Экология' },
  { value: 'energy', label: 'Энергетика' },
  { value: 'science', label: 'Наука' },
  { value: 'cities', label: 'Города' },
  { value: 'projects', label: 'Проекты' },
  { value: 'culture', label: 'Культура' },
  { value: 'other', label: 'Другое' },
];

function buildLoginUrl(siteUrl) {
  return `${siteUrl || '/'}#login`;
}

export function InitiativePage({ data }) {
  const initiativeCount = data?.collections?.initiatives?.length || 0;
  const projectCount = data?.stats?.projects || 0;
  const isLoggedIn = Boolean(data?.user?.loggedIn);
  const loginUrl = buildLoginUrl(data?.site?.url);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [form, setForm] = useState({
    title: '',
    initiativeCategory: '',
    excerpt: '',
    problemDescription: '',
    proposedSolution: '',
    expectedResult: '',
  });
  const [file, setFile] = useState(null);
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });
  const [invalidFields, setInvalidFields] = useState({});

  const getFieldClassName = (field) => `form-input${invalidFields[field] ? ' form-input--invalid' : ''}`;

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    setInvalidFields((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleFilesChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    applySelectedFile(selectedFile);
  };

  const applySelectedFile = (selectedFile) => {
    setFile(selectedFile);

    if (fileInputRef.current) {
      const transfer = new DataTransfer();

      if (selectedFile) {
        transfer.items.add(selectedFile);
      }

      fileInputRef.current.files = transfer.files;
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const droppedFile = event.dataTransfer.files?.[0] || null;

    if (droppedFile) {
      applySelectedFile(droppedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setSubmitState({
        status: 'error',
        message: 'Отправлять инициативы могут только зарегистрированные пользователи.',
      });
      return;
    }

    const requiredFields = ['title', 'initiativeCategory', 'excerpt', 'problemDescription', 'proposedSolution'];
    const nextInvalidFields = requiredFields.reduce((accumulator, field) => {
      if (!String(form[field] || '').trim()) {
        accumulator[field] = true;
      }

      return accumulator;
    }, {});

    setInvalidFields(nextInvalidFields);

    if (Object.keys(nextInvalidFields).length > 0) {
      setSubmitState({
        status: 'error',
        message: 'Заполните обязательные поля, отмеченные подсветкой.',
      });
      return;
    }

    setSubmitState({
      status: 'submitting',
      message: 'Отправляем инициативу на модерацию...',
    });

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (file) {
        payload.append('mediaFile', file);
      }

      const response = await fetch(data?.rest?.initiativeSubmission, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': data?.rest?.nonce || '',
        },
        body: payload,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || 'Не удалось отправить инициативу.');
      }

      setForm({
        title: '',
        initiativeCategory: '',
        excerpt: '',
        problemDescription: '',
        proposedSolution: '',
        expectedResult: '',
      });
      setFile(null);
      setIsDragOver(false);
      setInvalidFields({});

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSubmitState({
        status: 'success',
        message: 'Инициатива отправлена на модерацию. После проверки администратором она появится в разделе Initiatives.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Не удалось отправить инициативу.',
      });
    }
  };

  return (
    <>
      <div className="initiative-hero">
        <div className="sec-label both reveal" style={{ justifyContent: 'center', marginBottom: 'var(--sp-5)' }}>
          Ваш голос
        </div>
        <h1 className="initiative-title reveal">
          ВАШ ГОЛОС: ПРЕДЛОЖИТЕ <span>ИНИЦИАТИВУ</span>
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--c-text-2)',
            maxWidth: '560px',
            margin: 'var(--sp-4) auto var(--sp-8)',
            lineHeight: 1.8,
          }}
          className="reveal"
        >
          Опишите проблему, предложите решение и приложите материалы. Инициатива будет создана в WordPress как запись
          типа <strong>Initiatives</strong> со статусом модерации и автором текущего пользователя.
        </p>
      </div>

      <form className="init-form-grid initiative-form" onSubmit={handleSubmit}>
        <div>
          <div className="init-col-h">Как это работает</div>
          <ul className="init-instructions">
            <li data-n="1">Заполните обязательные поля.</li>
            <li data-n="2">Прикрепите один документ или файл, если он помогает модератору понять идею и её реалистичность.</li>
            <li data-n="3">После отправки инициатива отправляется на модерацию</li>
            <li data-n="4">Администратор увидит автора инициативы и сможет одобрить или доработать запись.</li>
          </ul>

          <div
            style={{
              background: 'var(--c-green-dim)',
              border: '1px solid rgba(42,245,152,.2)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--sp-5)',
              marginTop: 'var(--sp-5)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--f-data)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--c-green)',
                marginBottom: 'var(--sp-3)',
              }}
            >
              Статистика
            </div>
            <div style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: 1.8 }}>
              {initiativeCount} инициатив опубликовано
              <br />
              {projectCount} проектов в экосистеме
            </div>
          </div>

          <div className="initiative-note">
            {isLoggedIn ? (
              <>
                Отправка будет выполнена от имени <strong>{data?.user?.displayName || 'текущего пользователя'}</strong>.
              </>
            ) : (
              <>
                Чтобы отправить инициативу, нужно <a href={loginUrl}>войти в аккаунт</a>.
              </>
            )}
          </div>
        </div>

        <div>
          <div className="init-col-h">Заполните форму</div>

          <div className="form-group">
            <label className="form-label">Название инициативы *</label>
            <input
              className={getFieldClassName('title')}
              placeholder="Например: Открытая карта безопасных маршрутов"
              value={form.title}
              onChange={handleChange('title')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Категория *</label>
            <select
              className={getFieldClassName('initiativeCategory')}
              value={form.initiativeCategory}
              onChange={handleChange('initiativeCategory')}
              required
            >
              <option value="">Выберите категорию</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Краткое описание *</label>
            <textarea
              className={getFieldClassName('excerpt')}
              rows="4"
              placeholder="Коротко опишите инициативу и её смысл"
              value={form.excerpt}
              onChange={handleChange('excerpt')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание проблемы *</label>
            <textarea
              className={getFieldClassName('problemDescription')}
              rows="5"
              placeholder="Какую проблему вы хотите решить?"
              value={form.problemDescription}
              onChange={handleChange('problemDescription')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Предлагаемое решение *</label>
            <textarea
              className={getFieldClassName('proposedSolution')}
              rows="5"
              placeholder="Как именно должна работать инициатива?"
              value={form.proposedSolution}
              onChange={handleChange('proposedSolution')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Ожидаемый результат</label>
            <textarea
              className="form-input"
              rows="4"
              placeholder="Каких изменений вы ожидаете после реализации?"
              value={form.expectedResult}
              onChange={handleChange('expectedResult')}
            />
          </div>

          {submitState.message ? (
            <p className={`art-submit-message art-submit-message--${submitState.status}`}>{submitState.message}</p>
          ) : null}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={submitState.status === 'submitting'}>
            {submitState.status === 'submitting' ? 'Отправляем...' : 'Отправить инициативу →'}
          </button>
        </div>

        <div className="upload-col">
          <div className="init-col-h">Документ или вложение</div>
          <input
            ref={fileInputRef}
            className="initiative-upload-input"
            type="file"
            onChange={handleFilesChange}
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
          />
          <button
            className={`upload-zone${isDragOver ? ' upload-zone--dragover' : ''}`}
            type="button"
            aria-label="Загрузить файл"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon" aria-hidden="true">
              +
            </div>
            <div className="upload-text">Добавьте документ, изображение или архив</div>
            <div className="upload-sub">
              Перетащите файл сюда или нажмите для выбора. Он загрузится вместе с инициативой и будет виден администратору
            </div>
            <div style={{ marginTop: 'var(--sp-4)' }}>
              <span className="btn btn-ghost btn-sm">Выбрать файл</span>
            </div>
          </button>

          {file ? (
            <div className="initiative-files">
              <div className="initiative-files__title">Выбранный файл</div>
              <ul className="initiative-files__list">
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              </ul>
            </div>
          ) : (
            <p className="initiative-files__hint">Можно оставить без файла, если текста достаточно для модерации.</p>
          )}
        </div>
      </form>
    </>
  );
}
