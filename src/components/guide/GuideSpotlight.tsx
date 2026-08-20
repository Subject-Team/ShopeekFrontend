import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { useGuide } from '../../context/GuideContext';
import { formatPersianNumber } from '../../utils';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const GuideSpotlight: React.FC = () => {
  const {
    isGuideOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    closeGuide,
    currentConfig,
  } = useGuide();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Update target element coordinates
  const updateRect = useCallback(() => {
    if (!isGuideOpen || !currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
    } else {
      setTargetRect(null);
    }
  }, [isGuideOpen, currentStep]);

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isGuideOpen || !currentStep) return;

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }

    // Measure after short scroll delay
    const timer = setTimeout(updateRect, 150);
    return () => clearTimeout(timer);
  }, [isGuideOpen, currentStep, updateRect]);

  // Track window scroll, resize, element resize, and DOM mutations
  useEffect(() => {
    if (!isGuideOpen || !currentStep) return;

    const handleScrollOrResize = () => {
      updateRect();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    // ResizeObserver for target element and body
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateRect();
      });
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        resizeObserver.observe(el);
      }
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    // MutationObserver to detect DOM additions or target element insertions
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        updateRect();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    // Periodic check for first 2 seconds to handle async API delays smoothly
    const interval = setInterval(updateRect, 200);
    const stopTimer = setTimeout(() => clearInterval(interval), 2000);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [isGuideOpen, currentStep, updateRect]);

  // Compute Tooltip position relative to target
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) {
      setTooltipPos(null);
      return;
    }

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl.offsetWidth || 360;
    const tooltipHeight = tooltipEl.offsetHeight || 220;
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const placement = currentStep?.placement || 'bottom';
    let top = 0;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    // Constrain horizontal position
    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportWidth - padding) {
      left = viewportWidth - tooltipWidth - padding;
    }

    if (placement === 'bottom') {
      top = targetRect.bottom + 12;
      // Flip to top if overflowing bottom
      if (top + tooltipHeight > viewportHeight - padding && targetRect.top > tooltipHeight + padding) {
        top = targetRect.top - tooltipHeight - 12;
      }
    } else if (placement === 'top') {
      top = targetRect.top - tooltipHeight - 12;
      // Flip to bottom if overflowing top
      if (top < padding && targetRect.bottom + tooltipHeight < viewportHeight - padding) {
        top = targetRect.bottom + 12;
      }
    } else {
      // Auto placement
      if (targetRect.bottom + tooltipHeight + 12 <= viewportHeight - padding) {
        top = targetRect.bottom + 12;
      } else if (targetRect.top - tooltipHeight - 12 >= padding) {
        top = targetRect.top - tooltipHeight - 12;
      } else {
        top = Math.max(padding, (viewportHeight - tooltipHeight) / 2);
      }
    }

    // Safety bounds
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));

    setTooltipPos({ top, left });
  }, [targetRect, currentStep]);

  if (!isGuideOpen || !currentStep || !currentConfig) {
    return null;
  }

  const isLastStep = currentStepIndex >= totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none select-none font-vazir dir-rtl">
      {/* SVG Spotlight Overlay */}
      {targetRect ? (
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="shopeek-guide-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          {/* Dark backdrop with cutout mask */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(15, 23, 42, 0.65)"
            mask="url(#shopeek-guide-mask)"
            onClick={closeGuide}
          />
        </svg>
      ) : (
        /* Fallback centered backdrop if target element is offscreen or hidden */
        <div
          className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs pointer-events-auto transition-opacity"
          onClick={closeGuide}
        />
      )}

      {/* Target Element Highlight Glowing Border */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-2xl border-2 border-brand-500 shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Floating Tooltip Card */}
      <div
        ref={tooltipRef}
        className={`pointer-events-auto absolute transition-all duration-300 ease-out ${
          !targetRect || !tooltipPos
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : ''
        }`}
        style={
          targetRect && tooltipPos
            ? {
                top: `${tooltipPos.top}px`,
                left: `${tooltipPos.left}px`,
              }
            : undefined
        }
      >
        <div className="w-[340px] sm:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-fade-in text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {currentConfig.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                گام {formatPersianNumber(currentStepIndex + 1)} از {formatPersianNumber(totalSteps)}
              </span>
              <button
                onClick={closeGuide}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="بستن راهنما"
                aria-label="بستن راهنما"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
              {currentStep.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Tips Section */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-1.5 mt-2">
                {currentStep.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-brand-500'
                    : idx < currentStepIndex
                    ? 'w-2.5 bg-brand-300 dark:bg-brand-700'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
                title={`گام ${formatPersianNumber(idx + 1)}`}
                aria-label={`رفتن به گام ${formatPersianNumber(idx + 1)}`}
              />
            ))}
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={closeGuide}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-1"
            >
              انصراف و بستن
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>قبلی</span>
                </button>
              )}

              <button
                onClick={nextStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all"
              >
                <span>{isLastStep ? 'اتمام این بخش' : 'بعدی'}</span>
                {isLastStep ? <Check className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
