import React, { useState, useEffect } from 'react';

/**
 * Parses simple SRT and WebVTT subtitle text into cue objects:
 * [{ start: seconds, end: seconds, text: string }]
 */
export function parseSubtitles(subtitleText) {
  if (!subtitleText) return [];
  const normalized = subtitleText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  const cues = [];

  const timeToSeconds = (timeStr) => {
    // Format: 00:01:23,456 or 00:01:23.456 or 01:23.456
    const parts = timeStr.trim().replace(',', '.').split(':');
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return 0;
  };

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;

    // Find the line containing the timestamp arrow "-->"
    const arrowLineIndex = lines.findIndex(l => l.includes('-->'));
    if (arrowLineIndex === -1) continue;

    const timeParts = lines[arrowLineIndex].split('-->');
    if (timeParts.length < 2) continue;

    const start = timeToSeconds(timeParts[0]);
    const end = timeToSeconds(timeParts[1].split(' ')[0]);
    const textLines = lines.slice(arrowLineIndex + 1).map(l => l.replace(/<[^>]*>/g, '').trim());
    const text = textLines.join('\n').trim();

    if (text && !isNaN(start) && !isNaN(end)) {
      cues.push({ start, end, text });
    }
  }

  return cues;
}

export default function SubtitlesOverlay({ cues = [], currentTime = 0, isVisible = true }) {
  if (!isVisible || !cues || cues.length === 0) return null;

  const currentCue = cues.find(cue => currentTime >= cue.start && currentTime <= cue.end);
  if (!currentCue) return null;

  return (
    <div className="absolute bottom-16 inset-x-0 flex justify-center items-center pointer-events-none z-30 px-6">
      <div className="bg-black/80 backdrop-blur-sm border border-white/10 text-white font-medium text-sm sm:text-base md:text-lg px-4 py-2 rounded-xl text-center max-w-2xl shadow-2xl leading-snug drop-shadow-md whitespace-pre-line animate-fade-in">
        {currentCue.text}
      </div>
    </div>
  );
}
