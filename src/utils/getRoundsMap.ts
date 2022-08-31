export const initializeRounds = (players: string[]) => {
  const roundsMap = [players];

  for (let i = 0; i < players.length - 1; i++) {
    roundsMap.push(rotate([...roundsMap[i]]));
  }

  shuffle(roundsMap);

  const rounds = roundsMap.reduce((rounds, round) => {
    rounds.push(
      round.map((player, songIndex) => {
        const song = roundsMap[0][songIndex];
        return { player, sent: false, song: song === player ? null : song };
      })
    );

    return rounds;
  }, [] as any[]);

  const songs = roundsMap[0].reduce((songs, player) => {
    songs[player] = [];

    return songs;
  }, {} as any);

  return { rounds, songs };
};

const rotate = (array: any[]) => {
  array.unshift(array.pop());
  return array;
};

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}
