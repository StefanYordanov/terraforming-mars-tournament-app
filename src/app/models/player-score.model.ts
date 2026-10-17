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
    gameSessionRank: number;
    gameSessionRankPointScore: number;
    dominationPointScore: number;
}

export interface ComputedDummyScore {
    pointScore: number;
    megaCreditScore: number;
    gameSessionRank: number;
    gameSessionRankPointScore: number;
    dominationPointScore: number;
}
