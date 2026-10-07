export interface PlayerScore {
    playerId: number;
    pointScore: number;
    megaCreditScore: number;
    corporationCard: string
    preludeCards: string[];
}

export interface ComputedPlayerScore {
    playerId: number;
    pointScore: number;
    megaCreditScore: number;
    corporationCard: string
    preludeCards: string[];
    rankPointScore: number;
    dominationPointScore: number;
}

export interface ComputedDummyScore {
    pointScore: number;
    megaCreditScore: number;
    rankPointScore: number;
    dominationPointScore: number;
}
