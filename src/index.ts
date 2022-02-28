import fs from "fs";

interface WordScore {
  word: string;
  score: number;
}

function main() {
  fs.readFile(
    "words_alpha.txt",
    {
      encoding: "utf-8",
    },
    (err, data) => {
      let words = data.split(/(\r?\n)/);
      console.log(`Total words in dictionary: ${words.length}`);
      words = words.reduce(
        (prev, next) => (next.length !== 5 ? prev : [...prev, next]),
        [] as string[]
      );
      console.log(`Five letter words: ${words.length}`);
      let letterFrequencies: Record<string, number> = {};
      words.forEach((word) => {
        for (const c of word) {
          if (!letterFrequencies[c]) {
            letterFrequencies[c] = 0;
          }
          letterFrequencies[c]++;
        }
      });
      const sortedFrequencies = Object.entries(letterFrequencies).sort(
        (a, b) => b[1] - a[1]
      );
      const filteredSortedFrequencies = sortedFrequencies.reduce(
        (prev, next) => (!"".includes(next[0]) ? [...prev, next] : prev),
        [] as [string, number][]
      );
      const topTen = filteredSortedFrequencies.slice(0, 20);
      console.log("Top 10 letters by frequency:");
      console.log(topTen);

      // Break down each letter by positional frequencies
      const letterPositions: Record<string, Array<number>> = {};
      const keys = filteredSortedFrequencies.map((entry) => entry[0]);
      words.forEach((word) => {
        for (let i = 0; i < word.length; i++) {
          const c = word[i];
          if (!keys.includes(c)) continue;
          if (!letterPositions[c]) letterPositions[c] = [0, 0, 0, 0, 0];
          letterPositions[c][i]++;
        }
      });

      // Wordle doesn't allow plural words, so let's reduce the S score in the 5th position.
      letterPositions.s[4] = 500;

      // Calculate the scores of every word.
      const scores = words
        .map((word) => ({
          word,
          score: calculateWordScore(word, letterPositions),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      console.table(scores);
    }
  );
}

function calculateWordScore(word: string, lookup: Record<string, number[]>) {
  let score = 0;
  const keys = Object.keys(lookup);
  for (let i = 0; i < word.length; i++) {
    if (!keys.includes(word[i])) continue;
    score += lookup[word[i]][i];
  }
  return score;
}

main();
