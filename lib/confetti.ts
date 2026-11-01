export const triggerConfetti = async () => {
  if (typeof window === 'undefined') return;
  try {
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1'],
    });
  } catch (err) {
    console.error('Confetti error:', err);
  }
};

