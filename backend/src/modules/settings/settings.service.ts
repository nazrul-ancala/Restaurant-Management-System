import { SettingsRepository } from './settings.repository';

function toSettingsResponse(settings: any) {
  return {
    id: settings.id,
    name: settings.name,
    address: settings.address,
    phone: settings.phone,
    hours: settings.hours,
    updatedAt: settings.updatedAt,
  };
}

export class SettingsService {
  private readonly settingsRepository = new SettingsRepository();

  async get() {
    const settings = (await this.settingsRepository.findFirst()) ?? (await this.settingsRepository.create());
    return toSettingsResponse(settings);
  }

  async update(data: Partial<{ name: string; address: string; phone: string; hours: string }>) {
    const existing = (await this.settingsRepository.findFirst()) ?? (await this.settingsRepository.create());
    const updated = await this.settingsRepository.update(existing.id, data);
    return toSettingsResponse(updated);
  }
}
