import { HunterProfile, Quest, StoreItem, Vice, SystemMessage } from '../types';

const STORAGE_KEY = 'shadow_system_save_v1';

export interface AppData {
    profile: HunterProfile;
    quests: Quest[];
    storeItems: StoreItem[];
    vices: Vice[];
    messages?: SystemMessage[];
    lastUpdate: string;
}

export const persistenceService = {
    saveLocal: (data: AppData) => {
        try {
            const dataWithTimestamp = {
                ...data,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
            return dataWithTimestamp;
        } catch (error) {
            console.error('SISTEMA ERRO: Falha ao salvar localmente', error);
            return null;
        }
    },

    loadLocal: (): AppData | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (error) {
            console.error('SISTEMA ERRO: Falha ao carregar local', error);
            return null;
        }
    },

    clearLocal: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
