'use client';

import { useEffect, useRef } from 'react';
import { useAutomationsStore } from '@/features/automations/automations-store';
import { useChatStore } from '@/features/chat/chat-store';
import { useChatSender } from '@/features/chat/chat-service';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import type { Automation } from '@/lib/types';

const weekdayMap: Record<string, number> = {
  周日: 0,
  周一: 1,
  周二: 2,
  周三: 3,
  周四: 4,
  周五: 5,
  周六: 6,
};

function cronPartMatches(part: string, value: number) {
  return part.split(',').some((token) => {
    if (token === '*') return true;
    if (token.startsWith('*/')) {
      const step = Number(token.slice(2));
      return step > 0 && value % step === 0;
    }
    if (token.includes('-')) {
      const [start, end] = token.split('-').map(Number);
      return Number.isFinite(start) && Number.isFinite(end) && value >= start && value <= end;
    }
    return Number(token) === value;
  });
}

function cronMatches(expression: string, date: Date) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [minute, hour, day, month, weekday] = parts;
  return (
    cronPartMatches(minute, date.getMinutes()) &&
    cronPartMatches(hour, date.getHours()) &&
    cronPartMatches(day, date.getDate()) &&
    cronPartMatches(month, date.getMonth() + 1) &&
    cronPartMatches(weekday, date.getDay())
  );
}

function parseInterval(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(s|m|h|d)?$/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = (match[2] ?? 'm').toLowerCase();
  if (unit === 's') return amount * 1000;
  if (unit === 'h') return amount * 60 * 60 * 1000;
  if (unit === 'd') return amount * 24 * 60 * 60 * 1000;
  return amount * 60 * 1000;
}

function isDue(automation: Automation, now: Date) {
  if (!automation.enabled) return false;
  const lastRun = automation.lastRunAt ?? 0;
  if (automation.type === 'once') {
    if (automation.lastRunAt) return false;
    const seconds = Number(automation.expression);
    return Number.isFinite(seconds) && now.getTime() >= automation.createdAt + seconds * 1000;
  }
  if (automation.type === 'interval') {
    const interval = parseInterval(automation.expression);
    return interval > 0 && now.getTime() - (lastRun || automation.createdAt) >= interval;
  }
  if (automation.type === 'daily') {
    const [hour, minute] = automation.expression.split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
    const dueNow = now.getHours() === hour && now.getMinutes() === minute;
    const last = lastRun ? new Date(lastRun) : null;
    return (
      dueNow &&
      (!last ||
        last.getFullYear() !== now.getFullYear() ||
        last.getMonth() !== now.getMonth() ||
        last.getDate() !== now.getDate())
    );
  }
  if (automation.type === 'weekly') {
    const match = automation.expression.trim().match(/^(周[一二三四五六日])\s+(\d{1,2}):(\d{2})$/);
    if (!match) return false;
    const weekday = weekdayMap[match[1]];
    const hour = Number(match[2]);
    const minute = Number(match[3]);
    const dueNow = now.getDay() === weekday && now.getHours() === hour && now.getMinutes() === minute;
    return dueNow && (!lastRun || now.getTime() - lastRun > 6 * 24 * 60 * 60 * 1000);
  }
  return (
    automation.type === 'cron' &&
    cronMatches(automation.expression, now) &&
    (!lastRun || now.getTime() - lastRun >= 60_000)
  );
}

export function AutomationRuntime() {
  const automations = useAutomationsStore((state) => state.automations);
  const updateAutomation = useAutomationsStore((state) => state.updateAutomation);
  const createConversation = useChatStore((state) => state.createConversation);
  const pushToast = useShellStore((state) => state.pushToast);
  const sendMessage = useChatSender();
  const runningRef = useRef(new Set<string>());
  const stateRef = useRef({ automations });

  useEffect(() => {
    stateRef.current = { automations };
  }, [automations]);

  useEffect(() => {
    const execute = async (automation: Automation) => {
      if (runningRef.current.has(automation.id)) return;
      runningRef.current.add(automation.id);
      updateAutomation(automation.id, { lastRunAt: Date.now(), lastCheckedAt: Date.now() });
      const conversation = createConversation(`自动化 · ${automation.title}`);
      pushToast(`已执行计划「${automation.title}」`, 'success', '自动化任务');
      await sendMessage({
        conversationId: conversation.id,
        prompt: automation.content,
        history: [],
        systemPrompt:
          '这是 Unlimited Works 自动化任务。请直接执行提示词要求，输出结果和下一步建议。',
        localFallback:
          '自动化计划已到点触发。当前未配置 API 密钥，因此只创建了本地任务记录。',
      });
      runningRef.current.delete(automation.id);
    };

    const check = (force = false) => {
      const now = new Date();
      if (!force && !useSettingsStore.getState().automationPollingEnabled) return;
      for (const automation of stateRef.current.automations) {
        if (force ? automation.enabled : isDue(automation, now)) {
          void execute(automation);
        }
      }
    };
    const timer = window.setInterval(() => check(false), 15_000);
    const forceCheck = () => check(true);
    const unsubscribe = useAutomationsStore.subscribe((state, previous) => {
      if (state.checkRequestId !== previous.checkRequestId) forceCheck();
    });
    check(false);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
    };
  }, [createConversation, pushToast, sendMessage, updateAutomation]);

  return null;
}

