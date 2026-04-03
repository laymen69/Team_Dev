
import { createCrudService } from './serviceFactory';

export interface Objective {
    id: number;
    user_id: number;
    title: string;
    target: number;
    current: number;
    target_visits: number;
    month: number;
    year: number;
    created_at: string;
}

export const ObjectiveService = {
    ...createCrudService<Objective>('/api/objectives')
};
