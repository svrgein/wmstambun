'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const apply = (t: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const preferred = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        apply(preferred);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(preferred);
    }, []);

    const toggle = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        apply(next);
    };

    return (
        <button
            onClick={toggle}
            style={{
                position: 'fixed',
                top: '5px',
                right: '30%',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--text)',
                zIndex: 1000,
            }}
            title="Toggle theme"
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}