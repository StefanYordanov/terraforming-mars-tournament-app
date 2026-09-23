import { AppState } from "../models/app-state.model";

export interface GlobalStoreState {
    lastFetchedState: AppState | null;
    state: AppState | null;
    initialized: boolean;
    canUndo: boolean;
    canRedo: boolean;
}