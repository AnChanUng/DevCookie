try {
  const theme = localStorage.getItem('theme');
  if (theme && theme !== 'light') document.documentElement.dataset.theme = theme;
  if (theme === 'dim' || theme === 'dark' || theme === 'black' || theme === 'soft-charcoal') document.documentElement.dataset.mode = 'dark';
} catch { /* A blocked store must not prevent the first render. */ }
