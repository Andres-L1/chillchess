export interface GameMetadata {
    id: string;
    white: string;
    black: string;
    date: string;
    event: string;
    win: 'white' | 'black' | 'draw';
    description: string;
    pgn: string;
}

export const IMMORTAL_GAME: GameMetadata = {
    id: 'immortal',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    date: '1851',
    event: 'London (friendly)',
    win: 'white',
    description: 'The Immortal Game - A romantic sacrifice masterpiece.',
    pgn: `[Event "London"]
[Site "London ENG"]
[Date "1851.06.21"]
[EventDate "1851.05.26"]
[Round "?"]
[Result "1-0"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[ECO "C33"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "45"]

1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5
9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6
16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8
22.Qf6+ Nxf6 23.Be7# 1-0`
};

export const OPERA_GAME: GameMetadata = {
    id: 'opera',
    white: 'Paul Morphy',
    black: 'Duke Karl / Count Isouard',
    date: '1858',
    event: 'Paris Opera House',
    win: 'white',
    description: 'The Opera Game - Development over material.',
    pgn: `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[EventDate "?"]
[Round "?"]
[Result "1-0"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[ECO "C41"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "33"]

1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3
c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6
15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`
};

export const GAMES = [IMMORTAL_GAME, OPERA_GAME];
