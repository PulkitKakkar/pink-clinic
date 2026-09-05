export type LaserAreaSetting = {
  area: string;
  fluence: string;
  hertz: string;
  shotsFired: string;
  pulse: string;
};

export function formatLaserSettings(settings: LaserAreaSetting[]) {
  return `\n\nLaser settings by area:\n${settings.map((setting) => `${setting.area} — Fluence: ${setting.fluence} | Hertz: ${setting.hertz} | Shots fired: ${setting.shotsFired} | Pulse: ${setting.pulse}`).join("\n")}`;
}

export function parseLaserSettings(notes: string): LaserAreaSetting[] {
  const section = notes.match(/Laser settings by area:\s*([\s\S]*?)\s*$/i)?.[1];
  if (section) {
    return section.split("\n").flatMap((line) => {
      const match = line.match(/^(.+?)\s+—\s+Fluence:\s*(.+?)\s*\|\s*Hertz:\s*(.+?)\s*\|\s*Shots fired:\s*(.+?)\s*\|\s*Pulse:\s*(.+?)\s*$/i);
      return match ? [{ area: match[1], fluence: match[2], hertz: match[3], shotsFired: match[4], pulse: match[5] }] : [];
    });
  }
  const legacy = notes.match(/Laser settings:\s*Fluence:\s*(.+)\s*Hertz:\s*(.+)\s*Shots fired:\s*(.+)\s*Pulse:\s*(.+?)\s*$/i);
  return legacy ? [{ area: "", fluence: legacy[1].trim(), hertz: legacy[2].trim(), shotsFired: legacy[3].trim(), pulse: legacy[4].trim() }] : [];
}

export function isValidLaserSettings(settings: LaserAreaSetting[]) {
  return settings.length > 0 && settings.every((setting) => setting.area.trim() && setting.fluence.trim() && setting.hertz.trim() && setting.shotsFired.trim() && setting.pulse.trim());
}
