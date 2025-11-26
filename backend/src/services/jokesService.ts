// Holiday-themed jokes and riddles for family entertainment

export interface JokeOrRiddle {
  id: string;
  type: 'joke' | 'riddle';
  content: string;
  answer?: string; // For riddles
}

const jokesAndRiddles: JokeOrRiddle[] = [
  // Jokes
  {
    id: '1',
    type: 'joke',
    content: 'What do you call a snowman with a suntan?',
    answer: 'A puddle!',
  },
  {
    id: '2',
    type: 'joke',
    content: 'What do reindeer say before telling a joke?',
    answer: 'This one will sleigh you!',
  },
  {
    id: '3',
    type: 'joke',
    content: 'Why did Santa go to music school?',
    answer: 'Because he wanted to improve his wrap sheet!',
  },
  {
    id: '4',
    type: 'joke',
    content: 'What do you get when you cross a snowman with a vampire?',
    answer: 'Frostbite!',
  },
  {
    id: '5',
    type: 'joke',
    content: 'Why does Santa have three gardens?',
    answer: 'So he can ho-ho-ho!',
  },
  {
    id: '6',
    type: 'joke',
    content: 'What do elves learn in school?',
    answer: 'The elf-abet!',
  },
  {
    id: '7',
    type: 'joke',
    content: 'What\'s Santa\'s favorite type of music?',
    answer: 'Wrap music!',
  },
  {
    id: '8',
    type: 'joke',
    content: 'Why did the gingerbread man go to the doctor?',
    answer: 'Because he was feeling crumbly!',
  },
  // Riddles
  {
    id: '9',
    type: 'riddle',
    content: 'I fall from the sky, but I\'m not rain. I\'m white and fluffy, but I\'m not a cloud. What am I?',
    answer: 'Snow!',
  },
  {
    id: '10',
    type: 'riddle',
    content: 'I have a red suit and a white beard. I travel the world in one night. Who am I?',
    answer: 'Santa Claus!',
  },
  {
    id: '11',
    type: 'riddle',
    content: 'I\'m hung by the chimney with care. I\'m filled with presents, but I\'m not a stocking. What am I?',
    answer: 'A Christmas stocking!',
  },
  {
    id: '12',
    type: 'riddle',
    content: 'I have branches but no leaves. I\'m decorated with lights and ornaments. What am I?',
    answer: 'A Christmas tree!',
  },
  {
    id: '13',
    type: 'riddle',
    content: 'I\'m pulled by reindeer through the sky. I carry presents for all the good children. What am I?',
    answer: 'Santa\'s sleigh!',
  },
  {
    id: '14',
    type: 'riddle',
    content: 'I\'m round and jolly, made of snow. I have a carrot nose and coal eyes. What am I?',
    answer: 'A snowman!',
  },
  {
    id: '15',
    type: 'riddle',
    content: 'I\'m a helper who makes toys. I wear pointy shoes and a green hat. Who am I?',
    answer: 'An elf!',
  },
  {
    id: '16',
    type: 'riddle',
    content: 'I\'m a sweet treat that\'s shaped like a person. I\'m made of gingerbread. What am I?',
    answer: 'A gingerbread man!',
  },
];

let currentIndex = 0;

export function getRandomJokeOrRiddle(): JokeOrRiddle {
  const randomIndex = Math.floor(Math.random() * jokesAndRiddles.length);
  return jokesAndRiddles[randomIndex];
}

export function getNextJokeOrRiddle(): JokeOrRiddle {
  const joke = jokesAndRiddles[currentIndex];
  currentIndex = (currentIndex + 1) % jokesAndRiddles.length;
  return joke;
}

export function getAllJokesAndRiddles(): JokeOrRiddle[] {
  return jokesAndRiddles;
}

